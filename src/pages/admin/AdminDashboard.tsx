import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { StatCard } from '../../components/ui/StatCard';
import { Loader } from '../../components/ui/Loader';
import { Badge } from '../../components/ui/Badge';
import {
  Users,
  Stethoscope,
  Calendar,
  DollarSign,
  Building2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Activity,
  PlusCircle,
  FileText,
} from 'lucide-react';

export const AdminDashboard: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.getAnalyticsSummary();
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await api.getAIAnalyticsInsights(aiQuestion);
      setAiResponse(res);
    } catch (err: any) {
      setAiResponse({ error: err.message });
    } finally {
      setIsAiLoading(false);
    }
  };

  if (loading) return <Loader text="Gathering executive hospital analytics..." />;

  const { overview = {}, appointments = [], lowStock = [], revenueStats = {} } = data || {};

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/20 text-blue-300 font-semibold text-[10px] px-2.5 py-1 rounded-full border border-blue-400/30 uppercase tracking-wider">
              Executive Overview
            </span>
            <span className="text-xs text-slate-300">Updated Real-Time</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-2">MediCare AI Command Center</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Live operations, capacity utilization, financial revenue metrics, and AI clinical triage summary.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('patients')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> New Patient Intake
          </button>
          <button
            onClick={() => onNavigate('ai-assistant')}
            className="px-4 py-2 bg-indigo-600/80 hover:bg-indigo-600 border border-indigo-400/30 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-indigo-300" /> AI Insights
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Patients"
          value={overview.totalPatients || 0}
          subtext="Active medical profiles"
          icon={<Users className="w-5 h-5" />}
          color="blue"
          onClick={() => onNavigate('patients')}
        />
        <StatCard
          title="Active Doctors"
          value={overview.totalDoctors || 0}
          subtext={`${overview.totalDepartments || 0} Departments`}
          icon={<Stethoscope className="w-5 h-5" />}
          color="indigo"
          onClick={() => onNavigate('doctors')}
        />
        <StatCard
          title="Total Appointments"
          value={overview.totalAppointments || 0}
          subtext={`${overview.pendingAppointments || 0} Pending Queue`}
          icon={<Calendar className="w-5 h-5" />}
          color="amber"
          onClick={() => onNavigate('appointments')}
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${(overview.totalRevenue || 0).toLocaleString()}`}
          subtext={`Paid: $${(revenueStats.totalPaid || 0).toLocaleString()}`}
          icon={<DollarSign className="w-5 h-5" />}
          color="emerald"
          onClick={() => onNavigate('billing')}
        />
      </div>

      {/* Main Content Split: Appointments & AI Executive Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Appointments Stream */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Appointments Queue</h3>
              <p className="text-xs text-slate-500">Live stream of patient bookings and statuses</p>
            </div>
            <button
              onClick={() => onNavigate('appointments')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View All Queue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-bold text-slate-400 uppercase border-b border-slate-100">
                  <th className="pb-2">Appt Code</th>
                  <th className="pb-2">Patient</th>
                  <th className="pb-2">Doctor</th>
                  <th className="pb-2">Schedule</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {appointments.slice(0, 5).map((a: any) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 font-semibold text-blue-600">{a.appointmentCode}</td>
                    <td className="py-3 font-semibold text-slate-900">{a.patient?.user?.name || 'N/A'}</td>
                    <td className="py-3 text-slate-600">{a.doctor?.user?.name || 'N/A'}</td>
                    <td className="py-3 text-slate-500">
                      {a.date ? new Date(a.date).toLocaleDateString() : ''} ({a.startTime})
                    </td>
                    <td className="py-3">
                      <Badge status={a.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Analytics Query Widget */}
        <div className="lg:col-span-4 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg flex flex-col justify-between border border-indigo-800">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-200">AI Hospital Intelligence</span>
            </div>
            <h3 className="text-base font-bold text-white">Ask AI Analytics</h3>
            <p className="text-xs text-slate-300 mt-1">
              Ask natural language questions about hospital operations, department revenue, or patient bottlenecks.
            </p>

            <form onSubmit={handleAskAI} className="mt-4 space-y-3">
              <textarea
                rows={3}
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="e.g. What is the peak department workload and revenue distribution this month?"
                className="w-full p-3 text-xs bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/40"
              />
              <button
                type="submit"
                disabled={isAiLoading || !aiQuestion.trim()}
                className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                {isAiLoading ? 'Analyzing Data...' : 'Generate AI Report'}
              </button>
            </form>

            {aiResponse && (
              <div className="mt-4 p-3 rounded-xl bg-slate-800/90 border border-indigo-500/30 text-xs text-slate-200 space-y-1.5 max-h-48 overflow-y-auto">
                <p className="font-bold text-indigo-300">Executive Summary:</p>
                <p className="leading-relaxed text-[11px] text-slate-300">{aiResponse.executiveSummary || JSON.stringify(aiResponse)}</p>
                {aiResponse.keyTakeaways && (
                  <ul className="list-disc list-inside text-[10px] text-indigo-200 space-y-0.5 mt-2">
                    {aiResponse.keyTakeaways.map((t: string, i: number) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Quick Stats Footnote */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>Critical Items Low Stock:</span>
            <span className="font-bold text-amber-400">{lowStock.length} Items</span>
          </div>
        </div>
      </div>
    </div>
  );
};
