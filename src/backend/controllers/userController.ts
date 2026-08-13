import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/db';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { role, search, page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (role) where.role = String(role);
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { email: { contains: String(search) } },
        { phone: { contains: String(search) } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          doctor: { include: { department: true } },
          patient: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.user.count({ where }),
    ]);

    return res.json({
      success: true,
      data: users,
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

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, phone, departmentId, specialization, qualification, consultationFee } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and role are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        phone: phone || null,
      },
    });

    if (role === 'DOCTOR' && departmentId) {
      const docCount = await prisma.doctor.count();
      const doctorCode = `DOC-${departmentId.substring(0, 3).toUpperCase()}-${String(docCount + 101).padStart(3, '0')}`;

      await prisma.doctor.create({
        data: {
          userId: user.id,
          doctorCode,
          departmentId,
          specialization: specialization || 'General Specialist',
          qualification: qualification || 'MD',
          consultationFee: consultationFee ? Number(consultationFee) : 500,
        },
      });
    } else if (role === 'PATIENT') {
      const patCount = await prisma.patient.count();
      const patientCode = `PAT-2026-${String(patCount + 101).padStart(4, '0')}`;

      await prisma.patient.create({
        data: {
          userId: user.id,
          patientCode,
          phone: phone || null,
        },
      });
    }

    return res.status(201).json({ success: true, message: 'User created successfully', data: user });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleUserStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
    });

    return res.json({
      success: true,
      message: `User ${updated.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
