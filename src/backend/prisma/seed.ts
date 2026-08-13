import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';

async function main() {
  console.log('🌱 Starting MediCare AI Database Seeding...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.billItem.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.labReport.deleteMany();
  await prisma.labTest.deleteMany();
  await prisma.inventoryTransaction.deleteMany();
  await prisma.prescriptionItem.deleteMany();
  await prisma.prescription.deleteMany();
  await prisma.medicine.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.medicineCategory.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.doctorAvailability.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();
  await prisma.hospitalSetting.deleteMany();

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // 1. Hospital Settings
  await prisma.hospitalSetting.create({
    data: {
      hospitalName: 'MediCare AI Super Speciality Hospital',
      address: '742 Healthcare Avenue, Medical District, NY 10001',
      phone: '+1 (800) 555-MEDICARE',
      email: 'info@medicare-ai.com',
      website: 'https://medicare-ai.com',
    },
  });

  // 2. Departments
  const cardio = await prisma.department.create({
    data: { name: 'Cardiology', description: 'Comprehensive heart care & cardiovascular surgery', status: 'ACTIVE' },
  });
  const neuro = await prisma.department.create({
    data: { name: 'Neurology', description: 'Brain, nerve, and spine diagnostic & treatment center', status: 'ACTIVE' },
  });
  const peds = await prisma.department.create({
    data: { name: 'Pediatrics', description: 'Child healthcare and infant wellness care', status: 'ACTIVE' },
  });
  const ortho = await prisma.department.create({
    data: { name: 'Orthopedics', description: 'Bone, joint, and musculoskeletal care', status: 'ACTIVE' },
  });
  const derma = await prisma.department.create({
    data: { name: 'Dermatology', description: 'Skin, hair, and aesthetic treatment center', status: 'ACTIVE' },
  });
  const genMed = await prisma.department.create({
    data: { name: 'General Medicine', description: 'General illness, health checkups and chronic care', status: 'ACTIVE' },
  });

  // 3. Admin User
  const adminUser = await prisma.user.create({
    data: {
      name: 'System Admin',
      email: 'admin@medicare.com',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '+1 555-0100',
    },
  });

  // 4. Receptionist User
  const receptionUser = await prisma.user.create({
    data: {
      name: 'Nancy Vance (Receptionist)',
      email: 'receptionist@medicare.com',
      password: hashedPassword,
      role: 'RECEPTIONIST',
      phone: '+1 555-0101',
    },
  });

  // 5. Pharmacist User
  const pharmacistUser = await prisma.user.create({
    data: {
      name: 'Philip Miller (Chief Pharmacist)',
      email: 'pharmacist@medicare.com',
      password: hashedPassword,
      role: 'PHARMACIST',
      phone: '+1 555-0102',
    },
  });

  // 6. Lab Staff User
  const labUser = await prisma.user.create({
    data: {
      name: 'Laura Bennett (Lab Specialist)',
      email: 'lab@medicare.com',
      password: hashedPassword,
      role: 'LAB_STAFF',
      phone: '+1 555-0103',
    },
  });

  // 7. Doctors
  const docUser1 = await prisma.user.create({
    data: {
      name: 'Dr. Arthur Pendelton',
      email: 'doctor@medicare.com',
      password: hashedPassword,
      role: 'DOCTOR',
      phone: '+1 555-0201',
    },
  });
  const doc1 = await prisma.doctor.create({
    data: {
      userId: docUser1.id,
      doctorCode: 'DOC-CARD-001',
      departmentId: cardio.id,
      specialization: 'Interventional Cardiology',
      qualification: 'MD, FACC, FSCAI',
      experience: 15,
      consultationFee: 750,
      licenseNumber: 'MD-NY-88231',
      bio: 'Senior Interventional Cardiologist specializing in coronary angioplasty and cardiac catheterization.',
    },
  });

  const docUser2 = await prisma.user.create({
    data: {
      name: 'Dr. Elena Rostova',
      email: 'doctor.neuro@medicare.com',
      password: hashedPassword,
      role: 'DOCTOR',
      phone: '+1 555-0202',
    },
  });
  const doc2 = await prisma.doctor.create({
    data: {
      userId: docUser2.id,
      doctorCode: 'DOC-NEUR-002',
      departmentId: neuro.id,
      specialization: 'Neuro-Oncology & Spine',
      qualification: 'MD, DM Neurology',
      experience: 12,
      consultationFee: 800,
      licenseNumber: 'MD-NY-91204',
      bio: 'Expert in complex neurological disorders, stroke intervention, and brain mapping.',
    },
  });

  const docUser3 = await prisma.user.create({
    data: {
      name: 'Dr. Marcus Vance',
      email: 'doctor.peds@medicare.com',
      password: hashedPassword,
      role: 'DOCTOR',
      phone: '+1 555-0203',
    },
  });
  const doc3 = await prisma.doctor.create({
    data: {
      userId: docUser3.id,
      doctorCode: 'DOC-PEDS-003',
      departmentId: peds.id,
      specialization: 'Pediatric Cardiology',
      qualification: 'MD Pediatrics, DCH',
      experience: 10,
      consultationFee: 600,
      licenseNumber: 'MD-NY-77412',
      bio: 'Dedicated pediatrician with expertise in childhood heart health and neonatal intensive care.',
    },
  });

  // Doctor Availabilities
  const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
  for (const doc of [doc1, doc2, doc3]) {
    for (const day of days) {
      await prisma.doctorAvailability.create({
        data: {
          doctorId: doc.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
          isAvailable: true,
        },
      });
    }
  }

  // 8. Patients
  const patUser1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'patient@medicare.com',
      password: hashedPassword,
      role: 'PATIENT',
      phone: '+1 555-0301',
    },
  });
  const patient1 = await prisma.patient.create({
    data: {
      userId: patUser1.id,
      patientCode: 'PAT-2026-001',
      dateOfBirth: '1988-05-14',
      gender: 'MALE',
      bloodGroup: 'O+',
      phone: '+1 555-0301',
      address: '124 Maple Street, Brooklyn, NY',
      emergencyContactName: 'Jane Doe',
      emergencyContactPhone: '+1 555-0309',
      allergies: 'Penicillin, Shellfish',
    },
  });

  const patUser2 = await prisma.user.create({
    data: {
      name: 'Sarah Connor',
      email: 'sarah.connor@gmail.com',
      password: hashedPassword,
      role: 'PATIENT',
      phone: '+1 555-0302',
    },
  });
  const patient2 = await prisma.patient.create({
    data: {
      userId: patUser2.id,
      patientCode: 'PAT-2026-002',
      dateOfBirth: '1992-11-20',
      gender: 'FEMALE',
      bloodGroup: 'A+',
      phone: '+1 555-0302',
      address: '89 Broadway, Manhattan, NY',
      emergencyContactName: 'Kyle Reese',
      emergencyContactPhone: '+1 555-0310',
      allergies: 'Aspirin',
    },
  });

  // 9. Medicine Categories & Suppliers & Inventory
  const catAntibiotics = await prisma.medicineCategory.create({
    data: { name: 'Antibiotics', description: 'Antimicrobial medication for bacterial infections' },
  });
  const catAnalgesics = await prisma.medicineCategory.create({
    data: { name: 'Analgesics', description: 'Pain relief and anti-inflammatory drugs' },
  });
  const catCardio = await prisma.medicineCategory.create({
    data: { name: 'Cardiovascular', description: 'Heart, blood pressure and vascular care' },
  });

  const supplier1 = await prisma.supplier.create({
    data: {
      name: 'AstraPharma Global',
      company: 'AstraPharma Inc.',
      phone: '+1 800-ASTRA-01',
      email: 'orders@astrapharma.com',
      address: '100 BioTech Park, New Jersey',
    },
  });

  const med1 = await prisma.medicine.create({
    data: {
      medicineCode: 'MED-ANT-001',
      name: 'Amoxicillin 500mg',
      categoryId: catAntibiotics.id,
      supplierId: supplier1.id,
      description: 'Broad spectrum antibiotic capsules',
      price: 15.5,
      stock: 250,
      minimumStock: 30,
      expiryDate: '2027-12-31',
    },
  });

  const med2 = await prisma.medicine.create({
    data: {
      medicineCode: 'MED-ANA-002',
      name: 'Ibuprofen Extra Strength 400mg',
      categoryId: catAnalgesics.id,
      supplierId: supplier1.id,
      description: 'Nonsteroidal anti-inflammatory pain reliever',
      price: 12.0,
      stock: 400,
      minimumStock: 50,
      expiryDate: '2028-06-30',
    },
  });

  const med3 = await prisma.medicine.create({
    data: {
      medicineCode: 'MED-CAR-003',
      name: 'Atorvastatin 20mg',
      categoryId: catCardio.id,
      supplierId: supplier1.id,
      description: 'Statin medication to lower blood cholesterol',
      price: 35.0,
      stock: 12, // Low stock for alert demonstration!
      minimumStock: 20,
      expiryDate: '2027-03-15',
    },
  });

  // 10. Appointments
  const today = new Date().toISOString().split('T')[0];
  const appt1 = await prisma.appointment.create({
    data: {
      appointmentCode: 'APT-2026-1001',
      patientId: patient1.id,
      doctorId: doc1.id,
      date: today,
      startTime: '10:00',
      endTime: '10:30',
      reason: 'Routine cardiac checkup and shortness of breath evaluation',
      status: 'APPROVED',
      notes: 'Patient advised to bring previous ECG reports.',
    },
  });

  const appt2 = await prisma.appointment.create({
    data: {
      appointmentCode: 'APT-2026-1002',
      patientId: patient2.id,
      doctorId: doc2.id,
      date: today,
      startTime: '11:00',
      endTime: '11:30',
      reason: 'Persistent migraine headaches and visual aura',
      status: 'PENDING',
      notes: 'Needs immediate neurological evaluation.',
    },
  });

  // 11. Medical Record & Prescription for Appt1
  const medRecord = await prisma.medicalRecord.create({
    data: {
      patientId: patient1.id,
      doctorId: doc1.id,
      appointmentId: appt1.id,
      symptoms: 'Mild chest discomfort during light exertion, intermittent fatigue.',
      diagnosis: 'Stage 1 Essential Hypertension & Mild Hyperlipidemia',
      treatment: 'Lifestyle modifications, low-sodium diet, and statin therapy.',
      notes: 'Follow-up appointment in 3 weeks. Recommended lipid profile test.',
      allergies: 'Penicillin',
    },
  });

  const prescription = await prisma.prescription.create({
    data: {
      prescriptionCode: 'RX-2026-8801',
      patientId: patient1.id,
      doctorId: doc1.id,
      appointmentId: appt1.id,
      notes: 'Take medications strictly after meals.',
    },
  });

  await prisma.prescriptionItem.create({
    data: {
      prescriptionId: prescription.id,
      medicineId: med3.id,
      dosage: '20mg',
      frequency: '0-0-1 at bedtime',
      duration: '30 days',
      instructions: 'Swallow whole with warm water.',
      quantity: 30,
    },
  });

  // 12. Lab Test
  const labTest = await prisma.labTest.create({
    data: {
      testCode: 'LAB-2026-501',
      patientId: patient1.id,
      doctorId: doc1.id,
      appointmentId: appt1.id,
      testName: 'Comprehensive Lipid Panel & High Sensitivity CRP',
      description: 'Measures total cholesterol, HDL, LDL, triglycerides, and hs-CRP inflammatory marker.',
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });

  await prisma.labReport.create({
    data: {
      labTestId: labTest.id,
      patientId: patient1.id,
      doctorId: doc1.id,
      fileType: 'PDF',
      notes: 'Total Cholesterol: 215 mg/dL (Elevated), HDL: 48 mg/dL, LDL: 138 mg/dL, Triglycerides: 160 mg/dL.',
    },
  });

  // 13. Billing & Payment
  const bill = await prisma.bill.create({
    data: {
      invoiceNumber: 'INV-2026-0091',
      patientId: patient1.id,
      subtotal: 885.0,
      tax: 44.25,
      discount: 29.25,
      total: 900.0,
      status: 'PAID',
    },
  });

  await prisma.billItem.createMany({
    data: [
      { billId: bill.id, description: 'Specialist Doctor Consultation (Cardiology)', category: 'CONSULTATION', quantity: 1, unitPrice: 750.0, total: 750.0 },
      { billId: bill.id, description: 'Lipid Panel Laboratory Test', category: 'LABORATORY', quantity: 1, unitPrice: 135.0, total: 135.0 },
    ],
  });

  await prisma.payment.create({
    data: {
      billId: bill.id,
      amount: 900.0,
      method: 'CARD',
      status: 'PAID',
      transactionId: 'TXN-9981245-NYC',
    },
  });

  // 14. Sample Notifications
  await prisma.notification.createMany({
    data: [
      { userId: patUser1.id, title: 'Appointment Confirmed', message: 'Your cardiology appointment with Dr. Arthur Pendelton is confirmed.', type: 'APPOINTMENT' },
      { userId: docUser1.id, title: 'Lab Results Ready', message: 'Lipid Panel results for patient John Doe are now available.', type: 'LAB' },
      { userId: pharmacistUser.id, title: 'Low Stock Alert', message: 'Atorvastatin 20mg stock is below minimum threshold (12 units left).', type: 'WARNING' },
    ],
  });

  // 15. Audit Logs
  await prisma.auditLog.createMany({
    data: [
      { userId: adminUser.id, action: 'SYSTEM_SEED', entity: 'DATABASE', ipAddress: '127.0.0.1', userAgent: 'MediCare-AI-Seeder/1.0' },
      { userId: patUser1.id, action: 'APPOINTMENT_BOOKED', entity: 'APPOINTMENT', entityId: appt1.id, ipAddress: '127.0.0.1' },
      { userId: docUser1.id, action: 'PRESCRIPTION_CREATED', entity: 'PRESCRIPTION', entityId: prescription.id, ipAddress: '127.0.0.1' },
    ],
  });

  console.log('✅ MediCare AI Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
