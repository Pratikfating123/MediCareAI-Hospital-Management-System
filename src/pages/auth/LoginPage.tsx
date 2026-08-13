import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { HeartPulse, ShieldCheck, Stethoscope, UserCheck, ClipboardList, Pill, FlaskConical, ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';

export const LoginPage: React.FC<{ onSwitchToRegister: () => void }> = ({ onSwitchToRegister }) => {
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoClick = async (role: UserRole) => {
    setError(null);
    setIsSubmitting(true);
    try {
      await demoLogin(role);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 border border-slate-800">
        {/* Left Side Banner */}
        <div className="md:col-span-5 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center font-bold shadow-lg shadow-blue-500/30 mb-6">
              <HeartPulse className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">MediCare AI</h2>
            <p className="text-xs text-blue-200 mt-1 font-medium">Enterprise Hospital Management System</p>
          </div>

          <div className="my-8 relative z-10 space-y-3 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
              <span>Powered by Gemini AI Symptom Triage & Recommender</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>Full Role-Based Security & Audit Logs</span>
            </div>
          </div>

          <div className="relative z-10 text-[11px] text-slate-400 border-t border-white/10 pt-4">
            MediCare AI v1.0.0 • SQLite/LibSQL & Express
          </div>
        </div>

        {/* Right Side Form */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Sign in to Hospital Portal</h3>
              <button
                onClick={onSwitchToRegister}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Register as Patient
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">Select an instant demo role or log in with credentials</p>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Instant Demo Role Switcher Cards */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  One-Click Demo Portals
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Auto-Authenticated
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleDemoClick('ADMIN')}
                  disabled={isSubmitting}
                  className="p-3 rounded-xl border border-purple-100 bg-purple-50/50 hover:bg-purple-100/70 text-left transition-all group hover:-translate-y-0.5"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600 mb-1" />
                  <div className="text-xs font-bold text-slate-800">Admin</div>
                  <div className="text-[10px] text-slate-500">Full System Control</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoClick('DOCTOR')}
                  disabled={isSubmitting}
                  className="p-3 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-100/70 text-left transition-all group hover:-translate-y-0.5"
                >
                  <Stethoscope className="w-4 h-4 text-blue-600 mb-1" />
                  <div className="text-xs font-bold text-slate-800">Doctor</div>
                  <div className="text-[10px] text-slate-500">Dr. Sarah Jenkins</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoClick('PATIENT')}
                  disabled={isSubmitting}
                  className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100/70 text-left transition-all group hover:-translate-y-0.5"
                >
                  <UserCheck className="w-4 h-4 text-emerald-600 mb-1" />
                  <div className="text-xs font-bold text-slate-800">Patient</div>
                  <div className="text-[10px] text-slate-500">John Doe</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoClick('RECEPTIONIST')}
                  disabled={isSubmitting}
                  className="p-3 rounded-xl border border-amber-100 bg-amber-50/50 hover:bg-amber-100/70 text-left transition-all group hover:-translate-y-0.5"
                >
                  <ClipboardList className="w-4 h-4 text-amber-600 mb-1" />
                  <div className="text-xs font-bold text-slate-800">Reception Desk</div>
                  <div className="text-[10px] text-slate-500">Queue Management</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoClick('PHARMACIST')}
                  disabled={isSubmitting}
                  className="p-3 rounded-xl border border-cyan-100 bg-cyan-50/50 hover:bg-cyan-100/70 text-left transition-all group hover:-translate-y-0.5"
                >
                  <Pill className="w-4 h-4 text-cyan-600 mb-1" />
                  <div className="text-xs font-bold text-slate-800">Pharmacist</div>
                  <div className="text-[10px] text-slate-500">Medicine & Stock</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoClick('LAB_STAFF')}
                  disabled={isSubmitting}
                  className="p-3 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100/70 text-left transition-all group hover:-translate-y-0.5"
                >
                  <FlaskConical className="w-4 h-4 text-indigo-600 mb-1" />
                  <div className="text-xs font-bold text-slate-800">Lab Specialist</div>
                  <div className="text-[10px] text-slate-500">Tests & Reports</div>
                </button>
              </div>
            </div>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px bg-slate-200 flex-1" />
              <span className="text-[11px] font-semibold text-slate-400">or sign in with password</span>
              <div className="h-px bg-slate-200 flex-1" />
            </div>

            {/* Standard Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@medicare.com"
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Authenticating...' : 'Sign In'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
