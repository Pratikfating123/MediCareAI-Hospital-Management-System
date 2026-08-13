import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
    patientId?: string;
    doctorId?: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication token missing or invalid' });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'medicare_ai_jwt_secret_key_2026_super_secure';

    const decoded = jwt.verify(token, secret) as { id: string; role: string; email: string };

    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { patient: true, doctor: true },
    });

    if (!dbUser || !dbUser.isActive) {
      return res.status(401).json({ success: false, message: 'User account is inactive or no longer exists' });
    }

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      name: dbUser.name,
      patientId: dbUser.patient?.id,
      doctorId: dbUser.doctor?.id,
    };

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session token' });
  }
};

export const authorize = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' lacks permission to access this resource`,
      });
    }

    next();
  };
};
