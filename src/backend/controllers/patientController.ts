import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/db';

export const getPatients = async (req: Request, res: Response) => {
  try {
    const { search, page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (search) {
      where.OR = [
        { patientCode: { contains: String(search) } },
        { phone: { contains: String(search) } },
        { user: { name: { contains: String(search) } } },
        { user: { email: { contains: String(search) } } },
      ];
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, phone: true, createdAt: true } },
          _count: {
            select: {
              appointments: true,
              medicalRecords: true,
              prescriptions: true,
              bills: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.patient.count({ where }),
    ]);

    return res.json({
      success: true,
      data: patients,
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

export const getPatientById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, createdAt: true } },
        appointments: {
          include: { doctor: { include: { user: { select: { name: true } }, department: true } } },
          orderBy: { date: 'desc' },
        },
        medicalRecords: {
          include: { doctor: { include: { user: { select: { name: true } } } } },
          orderBy: { createdAt: 'desc' },
        },
        prescriptions: {
          include: {
            doctor: { include: { user: { select: { name: true } } } },
            items: { include: { medicine: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        labTests: {
          include: { doctor: { include: { user: { select: { name: true } } } }, labReport: true },
          orderBy: { requestedAt: 'desc' },
        },
        bills: {
          include: { items: true, payments: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
    return res.json({ success: true, data: patient });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createPatient = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, dateOfBirth, gender, bloodGroup, address, emergencyContactName, emergencyContactPhone, allergies } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password || 'Patient123!', 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'PATIENT',
        phone: phone || null,
      },
    });

    const patCount = await prisma.patient.count();
    const patientCode = `PAT-2026-${String(patCount + 101).padStart(4, '0')}`;

    const patient = await prisma.patient.create({
      data: {
        userId: user.id,
        patientCode,
        phone: phone || null,
        dateOfBirth: dateOfBirth || null,
        gender: gender || null,
        bloodGroup: bloodGroup || null,
        address: address || null,
        emergencyContactName: emergencyContactName || null,
        emergencyContactPhone: emergencyContactPhone || null,
        allergies: allergies || null,
      },
      include: { user: { select: { name: true, email: true } } },
    });

    return res.status(201).json({ success: true, message: 'Patient registered successfully', data: patient });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
