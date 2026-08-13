import { Request, Response } from 'express';
import prisma from '../config/db';
import { analyzeSymptoms, recommendDepartment, generateHospitalInsights } from '../services/geminiService';

export const handleSymptomAssistant = async (req: Request, res: Response) => {
  try {
    const { symptoms } = req.body;
    if (!symptoms) {
      return res.status(400).json({ success: false, message: 'Please describe your symptoms' });
    }

    const result = await analyzeSymptoms(symptoms);
    return res.json({ success: true, data: result });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const handleDepartmentRecommender = async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ success: false, message: 'Query string is required' });

    const depts = await prisma.department.findMany({ select: { name: true } });
    const deptNames = depts.map((d) => d.name);

    const recommendation = await recommendDepartment(query, deptNames);

    // Find doctors in recommended department
    const matchingDept = await prisma.department.findFirst({
      where: { name: { contains: recommendation.department } },
    });

    const doctors = matchingDept
      ? await prisma.doctor.findMany({
          where: { departmentId: matchingDept.id },
          include: { user: { select: { name: true } }, department: true },
        })
      : [];

    return res.json({
      success: true,
      data: {
        department: recommendation.department,
        explanation: recommendation.explanation,
        doctors,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const handleAnalyticsAI = async (req: Request, res: Response) => {
  try {
    const { question } = req.body;

    const [patientCount, doctorCount, appointmentCount, revenue, lowStockCount] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.appointment.count(),
      prisma.bill.aggregate({ where: { status: 'PAID' }, _sum: { total: true } }),
      prisma.medicine.count({ where: { stock: { lte: 15 } } }),
    ]);

    const contextData = {
      totalPatients: patientCount,
      totalDoctors: doctorCount,
      totalAppointments: appointmentCount,
      revenueCollected: revenue._sum.total || 0,
      medicinesInLowStock: lowStockCount,
    };

    const insight = await generateHospitalInsights(question || 'Summarize hospital operational performance and revenue trends.', contextData);
    return res.json({ success: true, data: insight });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
