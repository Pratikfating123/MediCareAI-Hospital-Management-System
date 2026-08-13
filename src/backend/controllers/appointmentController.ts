import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const getAppointments = async (req: AuthRequest, res: Response) => {
  try {
    const { status, doctorId, patientId, date, page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = String(status);
    if (date) where.date = String(date);

    // RBAC restrictions
    if (req.user?.role === 'PATIENT') {
      if (!req.user.patientId) return res.json({ success: true, data: [] });
      where.patientId = req.user.patientId;
    } else if (req.user?.role === 'DOCTOR') {
      if (!req.user.doctorId) return res.json({ success: true, data: [] });
      where.doctorId = req.user.doctorId;
    } else {
      if (doctorId) where.doctorId = String(doctorId);
      if (patientId) where.patientId = String(patientId);
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          patient: {
            include: { user: { select: { name: true, email: true, phone: true } } },
          },
          doctor: {
            include: { user: { select: { name: true } }, department: true },
          },
          medicalRecords: true,
          prescriptions: true,
          labTests: true,
        },
        orderBy: [{ date: 'desc' }, { startTime: 'asc' }],
        skip,
        take: Number(limit),
      }),
      prisma.appointment.count({ where }),
    ]);

    return res.json({
      success: true,
      data: appointments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createAppointment = async (req: AuthRequest, res: Response) => {
  try {
    let { patientId, doctorId, date, startTime, endTime, reason, notes } = req.body;

    if (req.user?.role === 'PATIENT') {
      if (!req.user.patientId) {
        return res.status(400).json({ success: false, message: 'Patient profile missing' });
      }
      patientId = req.user.patientId;
    }

    if (!patientId || !doctorId || !date || !startTime) {
      return res.status(400).json({ success: false, message: 'Patient, Doctor, Date and Start Time are required' });
    }

    // Default endTime to +30 mins if not provided
    if (!endTime) {
      const [hh, mm] = startTime.split(':').map(Number);
      const endMm = (mm + 30) % 60;
      const endHh = hh + Math.floor((mm + 30) / 60);
      endTime = `${String(endHh).padStart(2, '0')}:${String(endMm).padStart(2, '0')}`;
    }

    // Check for double booking
    const conflict = await prisma.appointment.findFirst({
      where: {
        doctorId,
        date,
        startTime,
        status: { in: ['PENDING', 'APPROVED'] },
      },
    });

    if (conflict) {
      return res.status(400).json({
        success: false,
        message: 'The selected doctor is already booked for this date and time slot. Please choose another time slot.',
      });
    }

    const apptCount = await prisma.appointment.count();
    const appointmentCode = `APT-2026-${String(apptCount + 1001).padStart(4, '0')}`;

    const appointment = await prisma.appointment.create({
      data: {
        appointmentCode,
        patientId,
        doctorId,
        date,
        startTime,
        endTime,
        reason: reason || 'General Consultation',
        notes: notes || null,
        status: req.user?.role === 'PATIENT' ? 'PENDING' : 'APPROVED',
      },
      include: {
        patient: { include: { user: { select: { id: true, name: true, email: true } } } },
        doctor: { include: { user: { select: { id: true, name: true } }, department: true } },
      },
    });

    // Send notifications to Doctor and Patient
    if (appointment.patient?.user?.id) {
      await prisma.notification.create({
        data: {
          userId: appointment.patient.user.id,
          title: 'Appointment Booked',
          message: `Your appointment (${appointmentCode}) with ${appointment.doctor.user.name} on ${date} at ${startTime} is ${appointment.status.toLowerCase()}.`,
          type: 'APPOINTMENT',
        },
      });
    }

    if (appointment.doctor?.user?.id) {
      await prisma.notification.create({
        data: {
          userId: appointment.doctor.user.id,
          title: 'New Appointment Request',
          message: `New appointment (${appointmentCode}) requested by ${appointment.patient.user.name} for ${date} at ${startTime}.`,
          type: 'APPOINTMENT',
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: appointment,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateAppointmentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const appt = await prisma.appointment.update({
      where: { id },
      data: {
        status,
        ...(notes && { notes }),
      },
      include: {
        patient: { include: { user: true } },
        doctor: { include: { user: true } },
      },
    });

    // Create notification
    if (appt.patient?.user?.id) {
      await prisma.notification.create({
        data: {
          userId: appt.patient.user.id,
          title: `Appointment ${status}`,
          message: `Your appointment with Dr. ${appt.doctor.user.name} for ${appt.date} is now ${status}.`,
          type: 'APPOINTMENT',
        },
      });
    }

    return res.json({ success: true, message: `Appointment status updated to ${status}`, data: appt });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
