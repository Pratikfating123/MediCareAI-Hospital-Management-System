import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { LoginPage } from './pages/LoginPage';
import { Loader } from './components/ui/Loader';

// Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { PatientsPage } from './pages/admin/PatientsPage';
import { DoctorsPage } from './pages/admin/DoctorsPage';
import { AppointmentsPage } from './pages/admin/AppointmentsPage';
import { DepartmentsPage } from './pages/admin/DepartmentsPage';
import { MedicinesPage } from './pages/admin/MedicinesPage';
import { InventoryPage } from './pages/admin/InventoryPage';
import { LabPage } from './pages/admin/LabPage';
import { BillingPage } from './pages/admin/BillingPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { UsersPage } from './pages/admin/UsersPage';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { AiAssistantPage } from './pages/admin/AiAssistantPage';

// Role Dashboards
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { ReceptionistDashboard } from './pages/receptionist/ReceptionistDashboard';
import { PharmacistDashboard } from './pages/pharmacist/PharmacistDashboard';
import { LabDashboard } from './pages/lab/LabDashboard';

const MainAppContent: React.FC = () => {
  const { user, isLoading, isAdmin, isDoctor, isPatient, isReceptionist, isPharmacist, isLabStaff } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Loader text="Initializing MediCare HMS..." />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        if (isAdmin) return <AdminDashboard onNavigate={(tab) => setActiveTab(tab)} />;
        if (isDoctor) return <DoctorDashboard />;
        if (isPatient) return <PatientDashboard />;
        if (isReceptionist) return <ReceptionistDashboard />;
        if (isPharmacist) return <PharmacistDashboard />;
        if (isLabStaff) return <LabDashboard />;
        return <AdminDashboard onNavigate={(tab) => setActiveTab(tab)} />;

      case 'patients':
        return <PatientsPage />;

      case 'doctors':
        return <DoctorsPage />;

      case 'appointments':
        return <AppointmentsPage />;

      case 'departments':
        return <DepartmentsPage />;

      case 'medicines':
        return <MedicinesPage />;

      case 'inventory':
        return <InventoryPage />;

      case 'lab':
        return <LabPage />;

      case 'billing':
        return <BillingPage />;

      case 'reports':
        return <ReportsPage />;

      case 'users':
        return <UsersPage />;

      case 'audit-logs':
        return <AuditLogsPage />;

      case 'ai-assistant':
        return <AiAssistantPage />;

      default:
        return <AdminDashboard onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-6 overflow-y-auto">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
