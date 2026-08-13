import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Doctor } from '../../types';
import { Loader } from '../../components/ui/Loader';
import { Modal } from '../../components/ui/Modal';
import { Stethoscope, Calendar, Clock, DollarSign, Award, Building2 } from 'lucide-react';

export const DoctorsPage: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);

  const [availabilities, setAvailabilities] = useState<any[]>([
    { dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '17:00', isAvailable: true },
    { dayOfWeek: 'TUESDAY', startTime: '09:00', endTime: '17:00', isAvailable: true },
    { dayOfWeek: 'WEDNESDAY', startTime: '09:00', endTime: '17:00', isAvailable: true },
    { dayOfWeek: 'THURSDAY', startTime: '09:00', endTime: '17:00', isAvailable: true },
    { dayOfWeek: 'FRIDAY', startTime: '09:00', endTime: '17:00', isAvailable: true },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const data = await api.getDoctors();
      setDoctors(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleOpenAvailability = (doc: Doctor) => {
    setSelectedDoctor(doc);
    if (doc.availabilities && doc.availabilities.length > 0) {
      setAvailabilities(doc.availabilities);
    }
    setIsAvailabilityModalOpen(true);
  };

  const handleSaveAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    setIsSubmitting(true);
    try {
      await api.updateDoctorAvailability(selectedDoctor.id, availabilities);
      setIsAvailabilityModalOpen(false);
      fetchDoctors();
    } catch (err: any) {
      alert(err.message || 'Failed to update schedule');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Medical Staff & Schedules</h1>
        <p className="text-xs text-slate-500">Directory of specialized physicians, experience, consultation fees, and weekly schedule hours</p>
      </div>

      {loading ? (
        <Loader text="Loading doctor profiles..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map((doc) => (
            <div key={doc.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 font-bold flex items-center justify-center border border-blue-100 shadow-xs">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{doc.user?.name}</h3>
                      <p className="text-xs text-blue-600 font-semibold">{doc.specialization}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    {doc.doctorCode}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Department: <strong>{doc.department?.name || 'General'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Qualification: {doc.qualification} ({doc.experience} yrs exp)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>Consultation Fee: <strong className="text-emerald-600">${doc.consultationFee}</strong></span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  {doc.availabilities?.length || 0} Working Days Set
                </span>
                <button
                  onClick={() => handleOpenAvailability(doc)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Calendar className="w-3.5 h-3.5" /> Manage Schedule
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      <Modal
        isOpen={isAvailabilityModalOpen}
        onClose={() => setIsAvailabilityModalOpen(false)}
        title={`Weekly Schedule - ${selectedDoctor?.user?.name}`}
      >
        <form onSubmit={handleSaveAvailability} className="space-y-3">
          {['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].map((day) => {
            const item = availabilities.find((a) => a.dayOfWeek === day) || {
              dayOfWeek: day,
              startTime: '09:00',
              endTime: '17:00',
              isAvailable: false,
            };

            return (
              <div key={day} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                <span className="font-bold text-slate-800 w-24">{day}</span>
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={item.startTime}
                    onChange={(e) => {
                      const updated = [...availabilities];
                      const idx = updated.findIndex((a) => a.dayOfWeek === day);
                      if (idx >= 0) updated[idx].startTime = e.target.value;
                      else updated.push({ ...item, startTime: e.target.value });
                      setAvailabilities(updated);
                    }}
                    className="p-1 border border-slate-200 rounded-lg text-xs"
                  />
                  <span>to</span>
                  <input
                    type="time"
                    value={item.endTime}
                    onChange={(e) => {
                      const updated = [...availabilities];
                      const idx = updated.findIndex((a) => a.dayOfWeek === day);
                      if (idx >= 0) updated[idx].endTime = e.target.value;
                      else updated.push({ ...item, endTime: e.target.value });
                      setAvailabilities(updated);
                    }}
                    className="p-1 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <input
                  type="checkbox"
                  checked={item.isAvailable}
                  onChange={(e) => {
                    const updated = [...availabilities];
                    const idx = updated.findIndex((a) => a.dayOfWeek === day);
                    if (idx >= 0) updated[idx].isAvailable = e.target.checked;
                    else updated.push({ ...item, isAvailable: e.target.checked });
                    setAvailabilities(updated);
                  }}
                  className="w-4 h-4 text-blue-600 rounded-sm"
                />
              </div>
            );
          })}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-md mt-4"
          >
            {isSubmitting ? 'Saving Schedule...' : 'Save Availability Hours'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
