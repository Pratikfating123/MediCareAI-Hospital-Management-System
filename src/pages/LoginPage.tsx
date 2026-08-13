import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  Activity,
  Shield,
  Stethoscope,
  ClipboardList,
  HeartPulse,
  Pill,
  FlaskConical,
  Lock,
  Mail,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, demoLogin, register } = useAuth();
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  // Login form state
  const [email, setEmail] = useState('admin@medicare.com');
  const [password, setPassword] = useState('Password123!');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Register form state
  const [regData, setRegData] = useState({
    name: 'Sarah Connor',
    email: 'sarah.connor@example.com',
    password: 'Password123!',
    phone: '+1 555-0198',
    bloodGroup: 'O+',
    gender: 'FEMALE',
    dateOfBirth: '1990-05-15',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid login credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await register({ ...regData, role: 'PATIENT' });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role: UserRole) => {
    setIsLoading(true);
    setError(null);
    try {
      await demoLogin(role);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const rolesList: { role: UserRole; title: string; desc: string; icon: any; bg: string }[] = [
    { role: 'ADMIN', title: 'Administrator', desc: 'Full operations & analytics', icon: Shield, bg: 'hover:border-indigo-400 hover:bg-indigo-50/50' },
    { role: 'DOCTOR', title: 'Doctor / Physician', desc: 'Consultations & prescriptions', icon: Stethoscope, bg: 'hover:border-blue-400 hover:bg-blue-50/50' },
    { role: 'RECEPTIONIST', title: 'Receptionist', desc: 'Check-ins & patient queue', icon: ClipboardList, bg: 'hover:border-amber-400 hover:bg-amber-50/50' },
    { role: 'PATIENT', title: 'Patient Portal', desc: 'Bookings & AI symptom triage', icon: HeartPulse, bg: 'hover:border-emerald-400 hover:bg-emerald-50/50' },
    { role: 'PHARMACIST', title: 'Pharmacist', desc: 'Medication dispensing', icon: Pill, bg: 'hover:border-cyan-400 hover:bg-cyan-50/50' },
    { role: 'LAB_STAFF', title: 'Lab Specialist', desc: 'Pathology & diagnostics', icon: FlaskConical, bg: 'hover:border-purple-400 hover:bg-purple-50/50' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-800">
        
        {/* Left Hero Section */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 p-8 text-white flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                <Activity className="w-6 h-6" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">MediCare HMS</span>
            </div>

            <div className="mt-8 space-y-4">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 font-bold text-[10px] rounded-full border border-blue-400/30 uppercase tracking-wider inline-flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-indigo-400" /> Enterprise Health Platform
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-white">
                Next-Gen AI Hospital Management System
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed">
                Integrated clinical workstation, patient triage, pharmacy stock tracking, laboratory workflow, and executive analytics.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 text-[11px] text-slate-400">
            Select a quick demo role on the right or sign in with your email credentials.
          </div>
        </div>

        {/* Right Form & Quick Demo Switcher Section */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div>
            {/* Header Tabs */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {isRegisterMode ? 'Patient Account Registration' : 'Hospital Portal Sign In'}
                </h2>
                <p className="text-xs text-slate-500">
                  {isRegisterMode ? 'Register as a patient to access bookings and health records' : 'Enter your credentials or click a demo account below'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                {isRegisterMode ? 'Back to Login' : 'Register Patient Account'}
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}

            {!isRegisterMode ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="admin@medicare.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Authenticating...' : 'Sign In to Portal'} <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={regData.name}
                      onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      value={regData.email}
                      onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      value={regData.password}
                      onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={regData.phone}
                      onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  {isLoading ? 'Creating Account...' : 'Register Patient Profile'}
                </button>
              </form>
            )}
          </div>

          {/* Quick 1-Click Demo Logins */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <Sparkles className="w-3 h-3 text-indigo-500" /> Instant 1-Click Demo Login By Role
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {rolesList.map((item) => {
                const IconComp = item.icon;
                return (
                  <button
                    key={item.role}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleDemoLogin(item.role)}
                    className={`p-3 rounded-2xl border border-slate-200 text-left transition-all ${item.bg} group`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <IconComp className="w-4 h-4 text-slate-600 group-hover:text-blue-600 transition-colors" />
                      <span className="font-bold text-xs text-slate-900 group-hover:text-blue-600">{item.title}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">{item.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
