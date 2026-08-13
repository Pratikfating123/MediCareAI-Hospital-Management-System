import { User, Patient, Doctor, Department, Appointment, MedicalRecord, Prescription, Medicine, InventoryTransaction, LabTest, Bill, Notification, AuditLog, SymptomAnalysisResult } from '../types';

const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('medicare_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  const json = await response.json();
  if (!response.ok || !json.success) {
    throw new Error(json.message || 'An unexpected server error occurred');
  }
  return json.data !== undefined ? json.data : json;
};

export const api = {
  // Auth
  login: async (credentials: any) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse<any>(res);
  },

  register: async (userData: any) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse<any>(res);
  },

  getProfile: async () => {
    const res = await fetch(`${API_BASE}/auth/profile`, { headers: getHeaders() });
    return handleResponse<User>(res);
  },

  updateProfile: async (data: any) => {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<User>(res);
  },

  // Users
  getUsers: async (params?: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/users?${query}`, { headers: getHeaders() });
    return handleResponse<User[]>(res);
  },

  createUser: async (data: any) => {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<User>(res);
  },

  toggleUserStatus: async (id: string) => {
    const res = await fetch(`${API_BASE}/users/${id}/toggle-status`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse<User>(res);
  },

  // Departments
  getDepartments: async () => {
    const res = await fetch(`${API_BASE}/departments`, { headers: getHeaders() });
    return handleResponse<Department[]>(res);
  },

  createDepartment: async (data: any) => {
    const res = await fetch(`${API_BASE}/departments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Department>(res);
  },

  // Doctors
  getDoctors: async (params?: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/doctors?${query}`, { headers: getHeaders() });
    return handleResponse<Doctor[]>(res);
  },

  getDoctorById: async (id: string) => {
    const res = await fetch(`${API_BASE}/doctors/${id}`, { headers: getHeaders() });
    return handleResponse<Doctor>(res);
  },

  updateDoctorAvailability: async (id: string, availabilities: any[]) => {
    const res = await fetch(`${API_BASE}/doctors/${id}/availability`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ availabilities }),
    });
    return handleResponse<Doctor>(res);
  },

  // Patients
  getPatients: async (params?: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/patients?${query}`, { headers: getHeaders() });
    return handleResponse<Patient[]>(res);
  },

  getPatientById: async (id: string) => {
    const res = await fetch(`${API_BASE}/patients/${id}`, { headers: getHeaders() });
    return handleResponse<Patient>(res);
  },

  createPatient: async (data: any) => {
    const res = await fetch(`${API_BASE}/patients`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Patient>(res);
  },

  // Appointments
  getAppointments: async (params?: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/appointments?${query}`, { headers: getHeaders() });
    return handleResponse<Appointment[]>(res);
  },

  createAppointment: async (data: any) => {
    const res = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Appointment>(res);
  },

  updateAppointmentStatus: async (id: string, status: string, notes?: string) => {
    const res = await fetch(`${API_BASE}/appointments/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, notes }),
    });
    return handleResponse<Appointment>(res);
  },

  // Medical Records
  getMedicalRecords: async (params?: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/medical-records?${query}`, { headers: getHeaders() });
    return handleResponse<MedicalRecord[]>(res);
  },

  createMedicalRecord: async (data: any) => {
    const res = await fetch(`${API_BASE}/medical-records`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<MedicalRecord>(res);
  },

  // Prescriptions
  getPrescriptions: async (params?: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/prescriptions?${query}`, { headers: getHeaders() });
    return handleResponse<Prescription[]>(res);
  },

  createPrescription: async (data: any) => {
    const res = await fetch(`${API_BASE}/prescriptions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Prescription>(res);
  },

  // Medicines & Inventory
  getMedicines: async (params?: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/medicines?${query}`, { headers: getHeaders() });
    return handleResponse<Medicine[]>(res);
  },

  getCategoriesAndSuppliers: async () => {
    const res = await fetch(`${API_BASE}/medicines/meta/categories-suppliers`, { headers: getHeaders() });
    return handleResponse<{ categories: any[]; suppliers: any[] }>(res);
  },

  createMedicine: async (data: any) => {
    const res = await fetch(`${API_BASE}/medicines`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Medicine>(res);
  },

  updateMedicine: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/medicines/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Medicine>(res);
  },

  getInventoryTransactions: async (params?: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/inventory?${query}`, { headers: getHeaders() });
    return handleResponse<InventoryTransaction[]>(res);
  },

  createInventoryTransaction: async (data: any) => {
    const res = await fetch(`${API_BASE}/inventory/transaction`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  // Lab
  getLabTests: async (params?: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/lab?${query}`, { headers: getHeaders() });
    return handleResponse<LabTest[]>(res);
  },

  createLabTest: async (data: any) => {
    const res = await fetch(`${API_BASE}/lab`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<LabTest>(res);
  },

  updateLabTestStatus: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/lab/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<LabTest>(res);
  },

  // Billing
  getBills: async (params?: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/billing?${query}`, { headers: getHeaders() });
    return handleResponse<Bill[]>(res);
  },

  getBillById: async (id: string) => {
    const res = await fetch(`${API_BASE}/billing/${id}`, { headers: getHeaders() });
    return handleResponse<Bill>(res);
  },

  createBill: async (data: any) => {
    const res = await fetch(`${API_BASE}/billing`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Bill>(res);
  },

  recordPayment: async (id: string, data: any) => {
    const res = await fetch(`${API_BASE}/billing/${id}/payment`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<any>(res);
  },

  // Notifications
  getNotifications: async () => {
    const res = await fetch(`${API_BASE}/notifications`, { headers: getHeaders() });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message);
    return { notifications: json.data as Notification[], unreadCount: json.unreadCount as number };
  },

  markNotificationRead: async (id: string) => {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  markAllNotificationsRead: async () => {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse<any>(res);
  },

  // Reports & Analytics
  getAnalyticsSummary: async () => {
    const res = await fetch(`${API_BASE}/reports/analytics`, { headers: getHeaders() });
    return handleResponse<any>(res);
  },

  getRevenueReport: async (params?: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/reports/revenue?${query}`, { headers: getHeaders() });
    return handleResponse<any>(res);
  },

  getAuditLogs: async (params?: Record<string, string>) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/audit?${query}`, { headers: getHeaders() });
    return handleResponse<AuditLog[]>(res);
  },

  // AI Suite
  analyzeSymptoms: async (symptoms: string) => {
    const res = await fetch(`${API_BASE}/ai/symptoms`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ symptoms }),
    });
    return handleResponse<SymptomAnalysisResult>(res);
  },

  recommendDepartment: async (query: string) => {
    const res = await fetch(`${API_BASE}/ai/department-recommend`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ query }),
    });
    return handleResponse<any>(res);
  },

  getAIAnalyticsInsights: async (question: string) => {
    const res = await fetch(`${API_BASE}/ai/analytics-insights`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ question }),
    });
    return handleResponse<any>(res);
  },
};
