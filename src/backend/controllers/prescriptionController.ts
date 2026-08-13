import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const getPrescriptions = async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, doctorId } = req.query;

    const where: any = {};
    if (req.user?.role === 'PATIENT') {
      if (!req.user.patientId) return res.json({ success: true, data: [] });
      where.patientId = req.user.patientId;
    } else if (req.user?.role === 'DOCTOR') {
      if (!req.user.doctorId) return res.json({ success: true, data: [] });
      where.doctorId = req.user.doctorId;
    } else {
      if (patientId) where.patientId = String(patientId);
      if (doctorId) where.doctorId = String(doctorId);
    }

    const prescriptions = await prisma.prescription.findMany({
      where,
      include: {
        patient: { include: { user: { select: { name: true, email: true, phone: true } } } },
        doctor: { include: { user: { select: { name: true } }, department: true } },
        items: { include: { medicine: true } },
        appointment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: prescriptions });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getPrescriptionById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const prescription = await prisma.prescription.findUnique({
      where: { id },
      include: {
        patient: { include: { user: { select: { name: true, email: true, phone: true } } } },
        doctor: { include: { user: { select: { name: true } }, department: true } },
        items: { include: { medicine: true } },
        appointment: true,
      },
    });

    if (!prescription) return res.status(404).json({ success: false, message: 'Prescription not found' });
    return res.json({ success: true, data: prescription });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createPrescription = async (req: AuthRequest, res: Response) => {
  try {
    let { patientId, doctorId, appointmentId, notes, items } = req.body;

    if (req.user?.role === 'DOCTOR') {
      if (!req.user.doctorId) return res.status(400).json({ success: false, message: 'Doctor profile missing' });
      doctorId = req.user.doctorId;
    }

    if (!patientId || !doctorId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Patient ID, Doctor ID, and at least one medicine item are required' });
    }

    const count = await prisma.prescription.count();
    const prescriptionCode = `RX-2026-${String(count + 8801).padStart(4, '0')}`;

    const prescription = await prisma.prescription.create({
      data: {
        prescriptionCode,
        patientId,
        doctorId,
        appointmentId: appointmentId || null,
        notes: notes || null,
        items: {
          create: items.map((item: any) => ({
            medicineId: item.medicineId,
            dosage: item.dosage || '1 tablet',
            frequency: item.frequency || '1-0-1',
            duration: item.duration || '5 days',
            instructions: item.instructions || 'After meals',
            quantity: item.quantity ? Number(item.quantity) : 10,
          })),
        },
      },
      include: {
        patient: { include: { user: { select: { id: true, name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
        items: { include: { medicine: true } },
      },
    });

    // Notify patient
    if (prescription.patient?.user?.id) {
      await prisma.notification.create({
        data: {
          userId: prescription.patient.user.id,
          title: 'Prescription Issued',
          message: `Dr. ${prescription.doctor.user.name} issued a new prescription (${prescriptionCode}).`,
          type: 'PRESCRIPTION',
        },
      });
    }

    return res.status(201).json({ success: true, message: 'Prescription created successfully', data: prescription });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
