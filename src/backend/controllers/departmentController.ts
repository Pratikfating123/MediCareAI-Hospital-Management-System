import { Request, Response } from 'express';
import prisma from '../config/db';

export const getDepartments = async (req: Request, res: Response) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { doctors: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return res.json({ success: true, data: departments });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createDepartment = async (req: Request, res: Response) => {
  try {
    const { name, description, status } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Department name is required' });

    const existing = await prisma.department.findUnique({ where: { name } });
    if (existing) return res.status(400).json({ success: false, message: 'Department already exists' });

    const dept = await prisma.department.create({
      data: { name, description, status: status || 'ACTIVE' },
    });

    return res.status(201).json({ success: true, message: 'Department created successfully', data: dept });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const dept = await prisma.department.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
      },
    });

    return res.json({ success: true, message: 'Department updated successfully', data: dept });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteDepartment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.department.delete({ where: { id } });
    return res.json({ success: true, message: 'Department deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
