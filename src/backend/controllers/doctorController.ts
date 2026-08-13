import { Request, Response } from 'express';
import prisma from '../config/db';

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const { departmentId, search } = req.query;

    const where: any = {};
    if (departmentId) where.departmentId = String(departmentId);
    if (search) {
      where.OR = [
        { user: { name: { contains: String(search) } } },
        { specialization: { contains: String(search) } },
        { doctorCode: { contains: String(search) } },
      ];
    }

    const doctors = await prisma.doctor.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, phone: true, isActive: true } },
        department: true,
        availabilities: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: doctors });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getDoctorById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        department: true,
        availabilities: true,
        appointments: {
          include: { patient: { include: { user: { select: { name: true } } } } },
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });

    if (!doctor) return res.status(404).json({ success: false, message: 'Doctor not found' });
    return res.json({ success: true, data: doctor });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateDoctorAvailability = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // doctorId
    const { availabilities } = req.body; // array of { dayOfWeek, startTime, endTime, isAvailable }

    if (!Array.isArray(availabilities)) {
      return res.status(400).json({ success: false, message: 'Availabilities must be an array' });
    }

    await prisma.doctorAvailability.deleteMany({ where: { doctorId: id } });

    await prisma.doctorAvailability.createMany({
      data: availabilities.map((item: any) => ({
        doctorId: id,
        dayOfWeek: item.dayOfWeek,
        startTime: item.startTime,
        endTime: item.endTime,
        isAvailable: item.isAvailable !== false,
      })),
    });

    const updated = await prisma.doctor.findUnique({
      where: { id },
      include: { availabilities: true },
    });

    return res.json({ success: true, message: 'Availability schedule updated', data: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
