import { Request, Response } from 'express';
import prisma from '../config/db';

export const getMedicines = async (req: Request, res: Response) => {
  try {
    const { categoryId, search, lowStock } = req.query;

    const where: any = {};
    if (categoryId) where.categoryId = String(categoryId);
    if (search) {
      where.OR = [
        { name: { contains: String(search) } },
        { medicineCode: { contains: String(search) } },
        { description: { contains: String(search) } },
      ];
    }

    const medicines = await prisma.medicine.findMany({
      where,
      include: { category: true, supplier: true },
      orderBy: { name: 'asc' },
    });

    const filtered = lowStock === 'true'
      ? medicines.filter((m) => m.stock <= m.minimumStock)
      : medicines;

    return res.json({ success: true, data: filtered });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const createMedicine = async (req: Request, res: Response) => {
  try {
    const { name, categoryId, supplierId, description, price, stock, minimumStock, expiryDate } = req.body;

    if (!name || !categoryId || price === undefined) {
      return res.status(400).json({ success: false, message: 'Name, Category ID, and Price are required' });
    }

    const medCount = await prisma.medicine.count();
    const medicineCode = `MED-${categoryId.substring(0, 3).toUpperCase()}-${String(medCount + 101).padStart(3, '0')}`;

    const medicine = await prisma.medicine.create({
      data: {
        medicineCode,
        name,
        categoryId,
        supplierId: supplierId || null,
        description: description || null,
        price: Number(price),
        stock: stock ? Number(stock) : 0,
        minimumStock: minimumStock ? Number(minimumStock) : 10,
        expiryDate: expiryDate || null,
      },
      include: { category: true, supplier: true },
    });

    return res.status(201).json({ success: true, message: 'Medicine added successfully', data: medicine });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateMedicine = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, categoryId, supplierId, description, price, stock, minimumStock, expiryDate } = req.body;

    const medicine = await prisma.medicine.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(categoryId && { categoryId }),
        ...(supplierId !== undefined && { supplierId }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: Number(price) }),
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(minimumStock !== undefined && { minimumStock: Number(minimumStock) }),
        ...(expiryDate !== undefined && { expiryDate }),
      },
      include: { category: true, supplier: true },
    });

    return res.json({ success: true, message: 'Medicine updated successfully', data: medicine });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getCategoriesAndSuppliers = async (req: Request, res: Response) => {
  try {
    const [categories, suppliers] = await Promise.all([
      prisma.medicineCategory.findMany({ orderBy: { name: 'asc' } }),
      prisma.supplier.findMany({ orderBy: { name: 'asc' } }),
    ]);

    return res.json({ success: true, data: { categories, suppliers } });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
