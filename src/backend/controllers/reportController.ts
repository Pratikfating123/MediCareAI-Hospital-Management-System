import { Request, Response } from 'express';
import prisma from '../config/db';

export const getAnalyticsSummary = async (req: Request, res: Response) => {
  try {
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      todayAppointments,
      pendingLabTests,
      lowStockMedicines,
      paidBills,
      pendingBills,
      departments,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.appointment.count(),
      prisma.appointment.count({
        where: { date: new Date().toISOString().split('T')[0] },
      }),
      prisma.labTest.count({ where: { status: 'REQUESTED' } }),
      prisma.medicine.findMany({
        where: { stock: { lte: 15 } },
      }),
      prisma.bill.aggregate({
        where: { status: 'PAID' },
        _sum: { total: true },
      }),
      prisma.bill.aggregate({
        where: { status: 'PENDING' },
        _sum: { total: true },
      }),
      prisma.department.findMany({
        include: { _count: { select: { doctors: true } } },
      }),
    ]);

    const monthlyRevenue = paidBills._sum.total || 0;
    const pendingRevenue = pendingBills._sum.total || 0;

    // Monthly appointment trend sample data aggregated from db
    const appointmentsByStatus = await prisma.appointment.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    return res.json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        todayAppointments,
        pendingLabTests,
        lowStockCount: lowStockMedicines.length,
        lowStockMedicines,
        monthlyRevenue,
        pendingRevenue,
        departments,
        appointmentsByStatus,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getRevenueReport = async (req: Request, res: Response) => {
  try {
    const bills = await prisma.bill.findMany({
      include: { patient: { include: { user: { select: { name: true } } } }, payments: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return res.json({ success: true, data: bills });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
