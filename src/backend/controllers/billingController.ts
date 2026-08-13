import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const getBills = async (req: AuthRequest, res: Response) => {
  try {
    const { status, patientId } = req.query;

    const where: any = {};
    if (status) where.status = String(status);

    if (req.user?.role === 'PATIENT') {
      if (!req.user.patientId) return res.json({ success: true, data: [] });
      where.patientId = req.user.patientId;
    } else {
      if (patientId) where.patientId = String(patientId);
    }

    const bills = await prisma.bill.findMany({
      where,
      include: {
        patient: { include: { user: { select: { name: true, email: true, phone: true } } } },
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: bills });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getBillById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const bill = await prisma.bill.findUnique({
      where: { id },
      include: {
        patient: { include: { user: { select: { name: true, email: true, phone: true } } } },
        items: true,
        payments: true,
      },
    });

    if (!bill) return res.status(404).json({ success: false, message: 'Bill invoice not found' });
    return res.json({ success: true, data: bill });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createBill = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, items, tax = 0, discount = 0 } = req.body;

    if (!patientId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Patient ID and at least one bill item are required' });
    }

    const subtotal = items.reduce((acc: number, item: any) => {
      const price = Number(item.unitPrice || 0);
      const qty = Number(item.quantity || 1);
      return acc + price * qty;
    }, 0);

    const total = subtotal + Number(tax) - Number(discount);

    const count = await prisma.bill.count();
    const invoiceNumber = `INV-2026-${String(count + 101).padStart(4, '0')}`;

    const bill = await prisma.bill.create({
      data: {
        invoiceNumber,
        patientId,
        subtotal,
        tax: Number(tax),
        discount: Number(discount),
        total,
        status: 'PENDING',
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            category: item.category || 'OTHER',
            quantity: Number(item.quantity || 1),
            unitPrice: Number(item.unitPrice || 0),
            total: Number(item.unitPrice || 0) * Number(item.quantity || 1),
          })),
        },
      },
      include: {
        patient: { include: { user: { select: { id: true, name: true } } } },
        items: true,
      },
    });

    // Send notification
    if (bill.patient?.user?.id) {
      await prisma.notification.create({
        data: {
          userId: bill.patient.user.id,
          title: 'Invoice Generated',
          message: `Invoice ${invoiceNumber} for $${total.toFixed(2)} has been generated.`,
          type: 'BILL',
        },
      });
    }

    return res.status(201).json({ success: true, message: 'Bill created successfully', data: bill });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const recordPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; // billId
    const { amount, method, transactionId } = req.body;

    if (!amount || !method) {
      return res.status(400).json({ success: false, message: 'Payment amount and method are required' });
    }

    const bill = await prisma.bill.findUnique({
      where: { id },
      include: { payments: true, patient: { include: { user: true } } },
    });

    if (!bill) return res.status(404).json({ success: false, message: 'Bill not found' });

    const paidAmount = Number(amount);
    const existingPaid = bill.payments
      .filter((p) => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amount, 0);

    const totalPaidNow = existingPaid + paidAmount;
    const newStatus = totalPaidNow >= bill.total ? 'PAID' : 'PARTIAL';

    const [payment, updatedBill] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          billId: id,
          amount: paidAmount,
          method,
          status: 'PAID',
          transactionId: transactionId || `TXN-${Date.now()}`,
        },
      }),
      prisma.bill.update({
        where: { id },
        data: { status: newStatus },
      }),
    ]);

    if (bill.patient?.user?.id) {
      await prisma.notification.create({
        data: {
          userId: bill.patient.user.id,
          title: 'Payment Received',
          message: `Payment of $${paidAmount.toFixed(2)} received for Invoice ${bill.invoiceNumber}. Status: ${newStatus}`,
          type: 'BILL',
        },
      });
    }

    return res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: { payment, bill: updatedBill },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
