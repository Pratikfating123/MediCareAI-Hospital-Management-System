import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const getMedicalRecords = async (req: AuthRequest, res: Response) => {
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

    const records = await prisma.medicalRecord.findMany({
      where,
      include: {
        patient: { include: { user: { select: { name: true, email: true } } } },
        doctor: { include: { user: { select: { name: true } }, department: true } },
        appointment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: records });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createMedicalRecord = async (req: AuthRequest, res: Response) => {
  try {
    let { patientId, doctorId, appointmentId, symptoms, diagnosis, treatment, notes, allergies } = req.body;

    if (req.user?.role === 'DOCTOR') {
      if (!req.user.doctorId) return res.status(400).json({ success: false, message: 'Doctor profile missing' });
      doctorId = req.user.doctorId;
    }

    if (!patientId || !doctorId) {
      return res.status(400).json({ success: false, message: 'Patient and Doctor IDs are required' });
    }

    const record = await prisma.medicalRecord.create({
      data: {
        patientId,
        doctorId,
        appointmentId: appointmentId || null,
        symptoms: symptoms || null,
        diagnosis: diagnosis || null,
        treatment: treatment || null,
        notes: notes || null,
        allergies: allergies || null,
      },
      include: {
        patient: { include: { user: { select: { name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      },
    });

    // If appointment is present, update status to COMPLETED
    if (appointmentId) {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: 'COMPLETED' },
      });
    }

    return res.status(201).json({ success: true, message: 'Medical record created successfully', data: record });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
