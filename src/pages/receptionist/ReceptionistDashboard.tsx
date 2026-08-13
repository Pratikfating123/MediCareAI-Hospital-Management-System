import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Appointment, Patient } from '../../types';
import { Loader } from '../../components/ui/Loader';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { ClipboardList, UserPlus, Calendar, Plus, Search, CheckCircle2 } from 'lucide-react';

export const ReceptionistDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const appts = await api.getAppointments();
      setAppointments(appts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.updateAppointmentStatus(id, 'APPROVED');
      fetchQueue();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-amber-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-600 rounded-2xl text-white shadow-md">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Hospital Reception Desk</h1>
            <p className="text-xs text-amber-200 mt-0.5">Patient queue management, appointment approvals, & check-ins</p>
          </div>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading reception check-in queue..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-900">
            Pending Check-Ins & Approvals ({appointments.filter((a) => a.status === 'PENDING').length})
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-200/80">
                  <th className="p-4">Appt Code</th>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Assigned Doctor</th>
                  <th className="p-4">Time</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-blue-600">{a.appointmentCode}</td>
                    <td className="p-4 font-bold text-slate-900">{a.patient?.user?.name}</td>
                    <td className="p-4 text-slate-600">{a.doctor?.user?.name}</td>
                    <td className="p-4 text-slate-500">{a.startTime}</td>
                    <td className="p-4">
                      <Badge status={a.status} size="sm" />
                    </td>
                    <td className="p-4 text-right">
                      {a.status === 'PENDING' && (
                        <button
                          onClick={() => handleApprove(a.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs shadow-xs"
                        >
                          Check In & Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
