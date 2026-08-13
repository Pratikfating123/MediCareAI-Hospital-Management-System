import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const getLabTests = async (req: AuthRequest, res: Response) => {
  try {
    const { status, patientId, doctorId } = req.query;

    const where: any = {};
    if (status) where.status = String(status);

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

    const tests = await prisma.labTest.findMany({
      where,
      include: {
        patient: { include: { user: { select: { name: true, email: true, phone: true } } } },
        doctor: { include: { user: { select: { name: true } }, department: true } },
        labReport: true,
      },
      orderBy: { requestedAt: 'desc' },
    });

    return res.json({ success: true, data: tests });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createLabTest = async (req: AuthRequest, res: Response) => {
  try {
    let { patientId, doctorId, appointmentId, testName, description } = req.body;

    if (req.user?.role === 'DOCTOR') {
      if (!req.user.doctorId) return res.status(400).json({ success: false, message: 'Doctor profile missing' });
      doctorId = req.user.doctorId;
    }

    if (!patientId || !doctorId || !testName) {
      return res.status(400).json({ success: false, message: 'Patient, Doctor, and Test Name are required' });
    }

    const count = await prisma.labTest.count();
    const testCode = `LAB-2026-${String(count + 501).padStart(4, '0')}`;

    const test = await prisma.labTest.create({
      data: {
        testCode,
        patientId,
        doctorId,
        appointmentId: appointmentId || null,
        testName,
        description: description || null,
        status: 'REQUESTED',
      },
      include: {
        patient: { include: { user: { select: { id: true, name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      },
    });

    return res.status(201).json({ success: true, message: 'Lab test requested successfully', data: test });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateLabTestStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes, fileUrl, fileType } = req.body;

    const test = await prisma.labTest.update({
      where: { id },
      data: {
        status,
        ...(status === 'COMPLETED' && { completedAt: new Date() }),
      },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
      },
    });

    if (fileUrl || notes) {
      await prisma.labReport.upsert({
        where: { labTestId: id },
        create: {
          labTestId: id,
          patientId: test.patientId,
          doctorId: test.doctorId,
          fileUrl: fileUrl || null,
          fileType: fileType || 'PDF',
          notes: notes || null,
        },
        update: {
          ...(fileUrl && { fileUrl }),
          ...(fileType && { fileType }),
          ...(notes && { notes }),
        },
      });
    }

    // Notifications
    if (status === 'COMPLETED') {
      if (test.patient?.user?.id) {
        await prisma.notification.create({
          data: {
            userId: test.patient.user.id,
            title: 'Lab Results Ready',
            message: `Your lab test report for '${test.testName}' is ready for viewing.`,
            type: 'LAB',
          },
        });
      }
      if (test.doctor?.user?.id) {
        await prisma.notification.create({
          data: {
            userId: test.doctor.user.id,
            title: 'Lab Report Completed',
            message: `Lab report for patient ${test.patient.user.name} (${test.testName}) has been uploaded.`,
            type: 'LAB',
          },
        });
      }
    }

    return res.json({ success: true, message: 'Lab test updated', data: test });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
