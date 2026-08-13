import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Calendar,
  Building2,
  Pill,
  PackageCheck,
  FlaskConical,
  Receipt,
  BarChart3,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab?: (tab: string) => void;
  onTabChange?: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onTabChange }) => {
  const handleTabClick = (tab: string) => {
    if (setActiveTab) setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const { user, isAdmin, isDoctor, isPatient, isReceptionist, isPharmacist, isLabStaff } = useAuth();

  let navItems: { id: string; label: string; icon: any }[] = [];

  if (isAdmin) {
    navItems = [
      { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
      { id: 'patients', label: 'Patients Registry', icon: Users },
      { id: 'doctors', label: 'Physicians & Schedules', icon: Stethoscope },
      { id: 'appointments', label: 'Appointments Queue', icon: Calendar },
      { id: 'departments', label: 'Departments', icon: Building2 },
      { id: 'medicines', label: 'Pharmacy Catalog', icon: Pill },
      { id: 'inventory', label: 'Stock Movement Ledger', icon: PackageCheck },
      { id: 'lab', label: 'Laboratory Hub', icon: FlaskConical },
      { id: 'billing', label: 'Billing & Invoices', icon: Receipt },
      { id: 'reports', label: 'Analytics Reports', icon: BarChart3 },
      { id: 'users', label: 'User Accounts', icon: UserCheck },
      { id: 'audit-logs', label: 'Security Audit Logs', icon: ShieldCheck },
      { id: 'ai-assistant', label: 'AI Intelligence Hub', icon: Sparkles },
    ];
  } else if (isDoctor) {
    navItems = [
      { id: 'dashboard', label: 'Clinical Workstation', icon: LayoutDashboard },
      { id: 'appointments', label: 'My Consultation Queue', icon: Calendar },
      { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles },
    ];
  } else if (isPatient) {
    navItems = [
      { id: 'dashboard', label: 'Health Portal Home', icon: LayoutDashboard },
      { id: 'ai-assistant', label: 'AI Symptom Triage', icon: Sparkles },
    ];
  } else if (isReceptionist) {
    navItems = [
      { id: 'dashboard', label: 'Reception Desk', icon: LayoutDashboard },
      { id: 'patients', label: 'Patient Registration', icon: Users },
      { id: 'appointments', label: 'Bookings Queue', icon: Calendar },
    ];
  } else if (isPharmacist) {
    navItems = [
      { id: 'dashboard', label: 'Dispensing Station', icon: LayoutDashboard },
      { id: 'medicines', label: 'Pharmacy Catalog', icon: Pill },
      { id: 'inventory', label: 'Stock Movement Log', icon: PackageCheck },
    ];
  } else if (isLabStaff) {
    navItems = [
      { id: 'dashboard', label: 'Pathology Lab Queue', icon: LayoutDashboard },
      { id: 'lab', label: 'Laboratory Orders', icon: FlaskConical },
    ];
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Main Navigation
        </div>
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <IconComponent className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Role Badge Footer */}
      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-600 space-y-1">
        <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Account</div>
        <div className="font-bold text-slate-900 truncate">{user?.name}</div>
        <div className="text-[11px] text-blue-600 font-semibold uppercase tracking-wide">{user?.role}</div>
      </div>
    </aside>
  );
};
