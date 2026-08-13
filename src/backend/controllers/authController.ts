import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'medicare_ai_jwt_secret_key_2026_super_secure';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'medicare_ai_jwt_refresh_secret_key_2026_super_secure';

const generateTokens = (user: { id: string; email: string; role: string; name: string }) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
  const refreshToken = jwt.sign(
    { id: user.id, email: user.email },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, phone, dateOfBirth, gender, bloodGroup, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role && ['PATIENT', 'DOCTOR', 'RECEPTIONIST', 'PHARMACIST', 'LAB_STAFF'].includes(role) ? role : 'PATIENT';

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: assignedRole,
        phone: phone || null,
      },
    });

    if (assignedRole === 'PATIENT') {
      const patientCount = await prisma.patient.count();
      const patientCode = `PAT-2026-${String(patientCount + 101).padStart(4, '0')}`;

      await prisma.patient.create({
        data: {
          userId: user.id,
          patientCode,
          phone: phone || null,
          dateOfBirth: dateOfBirth || null,
          gender: gender || null,
          bloodGroup: bloodGroup || null,
          address: address || null,
        },
      });
    }

    const tokens = generateTokens(user);

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTER',
        entity: 'USER',
        entityId: user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone },
        ...tokens,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        patient: true,
        doctor: {
          include: { department: true }
        }
      },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact hospital admin.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const tokens = generateTokens(user);

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        entity: 'USER',
        entityId: user.id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });

    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          patientId: user.patient?.id,
          patientCode: user.patient?.patientCode,
          doctorId: user.doctor?.id,
          doctorCode: user.doctor?.doctorCode,
          department: user.doctor?.department?.name,
        },
        ...tokens,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || 'Login failed' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        patient: true,
        doctor: {
          include: { department: true, availabilities: true },
        },
      },
    });

    return res.json({ success: true, data: user });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const { name, phone, dateOfBirth, gender, bloodGroup, address, emergencyContactName, emergencyContactPhone, allergies } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
      },
    });

    if (req.user.role === 'PATIENT' && req.user.patientId) {
      await prisma.patient.update({
        where: { id: req.user.patientId },
        data: {
          ...(dateOfBirth && { dateOfBirth }),
          ...(gender && { gender }),
          ...(bloodGroup && { bloodGroup }),
          ...(address && { address }),
          ...(emergencyContactName && { emergencyContactName }),
          ...(emergencyContactPhone && { emergencyContactPhone }),
          ...(allergies && { allergies }),
        },
      });
    }

    return res.json({ success: true, message: 'Profile updated successfully', data: updatedUser });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
