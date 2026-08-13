import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Appointment, Doctor, Patient } from '../../types';
import { Loader } from '../../components/ui/Loader';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Calendar, Plus, Search, CheckCircle2, XCircle, Clock, FileText } from 'lucide-react';

export const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '10:30',
    reason: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const data = await api.getAppointments();
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeta = async () => {
    try {
      const [docData, patData] = await Promise.all([api.getDoctors(), api.getPatients()]);
      setDoctors(docData);
      setPatients(patData);
      if (docData.length > 0) setFormData((prev) => ({ ...prev, doctorId: docData[0].id }));
      if (patData.length > 0) setFormData((prev) => ({ ...prev, patientId: patData[0].id }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchMeta();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.updateAppointmentStatus(id, status);
      fetchAppointments();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createAppointment(formData);
      setIsBookModalOpen(false);
      fetchAppointments();
    } catch (err: any) {
      alert(err.message || 'Booking failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Appointments Schedule</h1>
          <p className="text-xs text-slate-500">Manage patient bookings, consultation timeslots, and appointment statuses</p>
        </div>
        <button
          onClick={() => setIsBookModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Book Appointment
        </button>
      </div>

      {loading ? (
        <Loader text="Loading appointments schedule..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-200/80">
                  <th className="p-4">Appt Code</th>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Doctor & Specialty</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Reason</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-blue-600">{a.appointmentCode}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{a.patient?.user?.name}</div>
                      <div className="text-[11px] text-slate-400">{a.patient?.patientCode}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{a.doctor?.user?.name}</div>
                      <div className="text-[11px] text-blue-600">{a.doctor?.specialization}</div>
                    </td>
                    <td className="p-4 text-slate-600">
                      <div>{a.date ? new Date(a.date).toLocaleDateString() : 'N/A'}</div>
                      <div className="text-[11px] text-slate-400">{a.startTime} - {a.endTime}</div>
                    </td>
                    <td className="p-4 text-slate-500 max-w-xs truncate">{a.reason || 'General Checkup'}</td>
                    <td className="p-4">
                      <Badge status={a.status} size="sm" />
                    </td>
                    <td className="p-4 text-right space-x-1.5">
                      {a.status === 'PENDING' && (
                        <button
                          onClick={() => handleUpdateStatus(a.id, 'APPROVED')}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold rounded-lg text-[11px] border border-emerald-200"
                        >
                          Approve
                        </button>
                      )}
                      {a.status === 'APPROVED' && (
                        <button
                          onClick={() => handleUpdateStatus(a.id, 'COMPLETED')}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold rounded-lg text-[11px] border border-blue-200"
                        >
                          Mark Completed
                        </button>
                      )}
                      {['PENDING', 'APPROVED'].includes(a.status) && (
                        <button
                          onClick={() => handleUpdateStatus(a.id, 'CANCELLED')}
                          className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold rounded-lg text-[11px] border border-rose-200"
                        >
                          Cancel
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

      {/* Book Appointment Modal */}
      <Modal isOpen={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} title="Schedule Patient Appointment">
        <form onSubmit={handleBook} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Patient</label>
            <select
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.user?.name} ({p.patientCode})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Physician / Doctor</label>
            <select
              value={formData.doctorId}
              onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            >
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.user?.name} - {d.specialization} (${d.consultationFee})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Visit / Symptoms</label>
            <textarea
              rows={2}
              placeholder="e.g. Follow up consultation, routine health checkup"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-md"
          >
            {isSubmitting ? 'Booking Appointment...' : 'Confirm Appointment'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
