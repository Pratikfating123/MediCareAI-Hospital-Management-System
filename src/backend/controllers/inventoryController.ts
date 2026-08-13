import { Request, Response } from 'express';
import prisma from '../config/db';

export const getInventoryTransactions = async (req: Request, res: Response) => {
  try {
    const { medicineId, type } = req.query;

    const where: any = {};
    if (medicineId) where.medicineId = String(medicineId);
    if (type) where.type = String(type);

    const transactions = await prisma.inventoryTransaction.findMany({
      where,
      include: { medicine: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return res.json({ success: true, data: transactions });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createTransaction = async (req: Request, res: Response) => {
  try {
    const { medicineId, type, quantity, reason, reference } = req.body;

    if (!medicineId || !type || quantity === undefined) {
      return res.status(400).json({ success: false, message: 'Medicine ID, Type, and Quantity are required' });
    }

    const qty = Number(quantity);
    if (qty <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be greater than zero' });
    }

    const medicine = await prisma.medicine.findUnique({ where: { id: medicineId } });
    if (!medicine) return res.status(404).json({ success: false, message: 'Medicine not found' });

    // Calculate stock change
    let newStock = medicine.stock;
    if (type === 'PURCHASE' || type === 'RETURN') {
      newStock += qty;
    } else if (type === 'SALE' || type === 'ADJUSTMENT') {
      if (medicine.stock < qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock! Current stock: ${medicine.stock}, Requested: ${qty}`,
        });
      }
      newStock -= qty;
    }

    // Prisma Transaction
    const [txn, updatedMedicine] = await prisma.$transaction([
      prisma.inventoryTransaction.create({
        data: {
          medicineId,
          type,
          quantity: qty,
          reason: reason || null,
          reference: reference || null,
        },
      }),
      prisma.medicine.update({
        where: { id: medicineId },
        data: { stock: newStock },
      }),
    ]);

    return res.status(201).json({
      success: true,
      message: 'Inventory transaction logged successfully',
      data: { transaction: txn, medicine: updatedMedicine },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
