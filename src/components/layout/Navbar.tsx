import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import {
  Activity,
  LogOut,
  User,
  ChevronDown,
  Shield,
  Stethoscope,
  ClipboardList,
  HeartPulse,
  Pill,
  FlaskConical,
  Sparkles,
} from 'lucide-react';

const ROLES: { role: UserRole; label: string; icon: any; color: string }[] = [
  { role: 'ADMIN', label: 'Administrator', icon: Shield, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
  { role: 'DOCTOR', label: 'Doctor / Physician', icon: Stethoscope, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { role: 'RECEPTIONIST', label: 'Receptionist', icon: ClipboardList, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { role: 'PATIENT', label: 'Patient Portal', icon: HeartPulse, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { role: 'PHARMACIST', label: 'Pharmacist', icon: Pill, color: 'text-cyan-600 bg-cyan-50 border-cyan-200' },
  { role: 'LAB_STAFF', label: 'Lab Specialist', icon: FlaskConical, color: 'text-purple-600 bg-purple-50 border-purple-200' },
];

export const Navbar: React.FC = () => {
  const { user, logout, demoLogin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleRoleSwitch = async (r: UserRole) => {
    setIsSwitching(true);
    try {
      await demoLogin(r);
      setIsMenuOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSwitching(false);
    }
  };

  const currentRoleObj = ROLES.find((r) => r.role === user?.role) || ROLES[0];
  const IconComponent = currentRoleObj.icon;

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              MediCare <span className="text-blue-600">HMS</span>
            </span>
            <span className="text-[10px] text-slate-400 font-semibold block -mt-1 uppercase tracking-wider">
              Smart Hospital Platform
            </span>
          </div>
        </div>

        {/* Right Controls: Role Quick Switcher & User Profile */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 shadow-2xs transition-all ${currentRoleObj.color}`}
            >
              <IconComponent className="w-4 h-4" />
              <span className="hidden sm:inline">{currentRoleObj.label}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-500" /> Switch Role Account
                </div>
                <div className="py-1">
                  {ROLES.map((r) => {
                    const RoleIcon = r.icon;
                    const isActive = user?.role === r.role;
                    return (
                      <button
                        key={r.role}
                        onClick={() => handleRoleSwitch(r.role)}
                        disabled={isSwitching}
                        className={`w-full text-left px-3.5 py-2 text-xs font-medium flex items-center gap-2.5 transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <RoleIcon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span>{r.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-3 border-l border-slate-200 pl-3">
            <div className="hidden md:block text-right">
              <div className="text-xs font-bold text-slate-900">{user?.name}</div>
              <div className="text-[10px] text-slate-400">{user?.email}</div>
            </div>

            <button
              onClick={logout}
              title="Logout"
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
