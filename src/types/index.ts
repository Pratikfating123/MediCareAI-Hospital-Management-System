export type UserRole = 'ADMIN' | 'DOCTOR' | 'RECEPTIONIST' | 'PATIENT' | 'PHARMACIST' | 'LAB_STAFF';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string | null;
  isActive?: boolean;
  isVerified?: boolean;
  createdAt?: string;
  patientId?: string;
  patientCode?: string;
  doctorId?: string;
  doctorCode?: string;
  department?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt?: string;
  _count?: {
    doctors: number;
  };
}

export interface DoctorAvailability {
  id: string;
  doctorId: string;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Doctor {
  id: string;
  userId: string;
  user: User;
  doctorCode: string;
  departmentId: string;
  department: Department;
  specialization: string;
  qualification: string;
  experience: number;
  consultationFee: number;
  licenseNumber?: string | null;
  bio?: string | null;
  availabilities?: DoctorAvailability[];
}

export interface Patient {
  id: string;
  userId: string;
  user: User;
  patientCode: string;
  dateOfBirth?: string | null;
  gender?: 'MALE' | 'FEMALE' | 'OTHER' | null;
  bloodGroup?: string | null;
  phone?: string | null;
  address?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  allergies?: string | null;
  createdAt?: string;
  _count?: {
    appointments: number;
    medicalRecords: number;
    prescriptions: number;
    bills: number;
  };
}

export type AppointmentStatus = 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED';

export interface Appointment {
  id: string;
  appointmentCode: string;
  patientId: string;
  patient: Patient;
  doctorId: string;
  doctor: Doctor;
  date: string;
  startTime: string;
  endTime: string;
  reason?: string | null;
  status: AppointmentStatus;
  notes?: string | null;
  createdAt?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patient?: Patient;
  doctorId: string;
  doctor?: Doctor;
  appointmentId?: string | null;
  symptoms?: string | null;
  diagnosis?: string | null;
  treatment?: string | null;
  notes?: string | null;
  allergies?: string | null;
  createdAt?: string;
}

export interface MedicineCategory {
  id: string;
  name: string;
  description?: string | null;
}

export interface Supplier {
  id: string;
  name: string;
  company?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
}

export interface Medicine {
  id: string;
  medicineCode: string;
  name: string;
  categoryId: string;
  category?: MedicineCategory;
  supplierId?: string | null;
  supplier?: Supplier;
  description?: string | null;
  price: number;
  stock: number;
  minimumStock: number;
  expiryDate?: string | null;
}

export interface PrescriptionItem {
  id: string;
  prescriptionId: string;
  medicineId: string;
  medicine: Medicine;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string | null;
  quantity: number;
}

export interface Prescription {
  id: string;
  prescriptionCode: string;
  patientId: string;
  patient?: Patient;
  doctorId: string;
  doctor?: Doctor;
  appointmentId?: string | null;
  items: PrescriptionItem[];
  notes?: string | null;
  createdAt?: string;
}

export interface InventoryTransaction {
  id: string;
  medicineId: string;
  medicine?: Medicine;
  type: 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'RETURN';
  quantity: number;
  reason?: string | null;
  reference?: string | null;
  createdAt?: string;
}

export type LabTestStatus = 'REQUESTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface LabReport {
  id: string;
  labTestId: string;
  patientId: string;
  doctorId: string;
  fileUrl?: string | null;
  fileType: string;
  notes?: string | null;
  createdAt?: string;
}

export interface LabTest {
  id: string;
  testCode: string;
  patientId: string;
  patient?: Patient;
  doctorId: string;
  doctor?: Doctor;
  appointmentId?: string | null;
  testName: string;
  description?: string | null;
  status: LabTestStatus;
  requestedAt?: string;
  completedAt?: string | null;
  labReport?: LabReport | null;
}

export interface BillItem {
  id: string;
  billId: string;
  description: string;
  category: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Payment {
  id: string;
  billId: string;
  amount: number;
  method: 'CASH' | 'CARD' | 'INSURANCE' | 'ONLINE';
  status: string;
  transactionId?: string | null;
  createdAt?: string;
}

export interface Bill {
  id: string;
  invoiceNumber: string;
  patientId: string;
  patient?: Patient;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'PENDING' | 'PAID' | 'PARTIAL' | 'CANCELLED';
  items: BillItem[];
  payments: Payment[];
  createdAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt?: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  user?: User;
  action: string;
  entity: string;
  entityId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt?: string;
}

export interface SymptomAnalysisResult {
  recommendedDepartment: string;
  urgency: 'LOW' | 'MODERATE' | 'HIGH' | 'EMERGENCY';
  summary: string;
  possibleConditions: string[];
  guidance: string;
  disclaimer: string;
}
