import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Appointment, MedicalRecord, Prescription, LabTest, Bill, Doctor } from '../../types';
import { Loader } from '../../components/ui/Loader';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import {
  Calendar,
  HeartPulse,
  Pill,
  FlaskConical,
  Receipt,
  Sparkles,
  PlusCircle,
  FileText,
  Clock,
  UserCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const PatientDashboard: React.FC<{ activeSubTab?: string }> = ({ activeSubTab = 'dashboard' }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  // AI Triage State
  const [symptomsInput, setSymptomsInput] = useState('');
  const [triageResult, setTriageResult] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Book Appt Modal
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [bookForm, setBookForm] = useState({
    doctorId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '10:30',
    reason: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPatientData = async () => {
    try {
      setLoading(true);
      const [appts, records, rx, labs, inv, docs] = await Promise.all([
        api.getAppointments(),
        api.getMedicalRecords(),
        api.getPrescriptions(),
        api.getLabTests(),
        api.getBills(),
        api.getDoctors(),
      ]);

      setAppointments(appts);
      setMedicalRecords(records);
      setPrescriptions(rx);
      setLabTests(labs);
      setBills(inv);
      setDoctors(docs);
      if (docs.length > 0) setBookForm((prev) => ({ ...prev, doctorId: docs[0].id }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, []);

  const handleRunAiTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomsInput.trim()) return;
    setIsAiLoading(true);
    try {
      const res = await api.analyzeSymptoms(symptomsInput);
      setTriageResult(res);
    } catch (err: any) {
      alert(err.message || 'AI Triage service temporarily unavailable');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.patientId) return alert('Patient profile required');
    setIsSubmitting(true);
    try {
      await api.createAppointment({
        ...bookForm,
        patientId: user.patientId,
      });
      setIsBookModalOpen(false);
      fetchPatientData();
    } catch (err: any) {
      alert(err.message || 'Booking failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loader text="Loading your personal health portal..." />;

  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-blue-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full border border-blue-400/30">
            Patient Health Portal
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-2">Welcome back, {user?.name}</h1>
          <p className="text-xs text-slate-300 mt-1">
            Patient ID: <strong className="text-blue-300">{user?.patientCode || 'PAT-DEMO'}</strong> • Access your upcoming appointments, medical records, and AI symptom triage.
          </p>
        </div>

        <button
          onClick={() => setIsBookModalOpen(true)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
        >
          <PlusCircle className="w-4 h-4" /> Book Consultation
        </button>
      </div>

      {/* Summary KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Upcoming Visits" value={appointments.filter((a) => a.status === 'APPROVED').length} icon={<Calendar className="w-5 h-5" />} color="blue" />
        <StatCard title="Medical History" value={medicalRecords.length} icon={<HeartPulse className="w-5 h-5" />} color="emerald" />
        <StatCard title="Active Prescriptions" value={prescriptions.length} icon={<Pill className="w-5 h-5" />} color="amber" />
        <StatCard title="Invoices & Bills" value={bills.length} icon={<Receipt className="w-5 h-5" />} color="purple" />
      </div>

      {/* AI Symptom Triage Box */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 rounded-2xl p-6 text-white shadow-xl border border-indigo-800/80">
        <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs mb-1">
          <Sparkles className="w-4 h-4" /> Gemini AI Symptom Triage & Guidance
        </div>
        <h2 className="text-lg font-bold text-white">How are you feeling today?</h2>
        <p className="text-xs text-slate-300 mt-1">
          Describe your symptoms in plain English. Gemini AI will recommend the appropriate clinical specialty, urgency rating, and self-care steps.
        </p>

        <form onSubmit={handleRunAiTriage} className="mt-4 space-y-3">
          <textarea
            rows={2}
            value={symptomsInput}
            onChange={(e) => setSymptomsInput(e.target.value)}
            placeholder="e.g. I have a throbbing headache, light sensitivity, and mild nausea since this morning."
            className="w-full p-3 text-xs bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/50"
          />
          <button
            type="submit"
            disabled={isAiLoading || !symptomsInput.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            {isAiLoading ? 'Analyzing Symptoms with AI...' : 'Analyze Symptoms & Find Department'}
          </button>
        </form>

        {triageResult && (
          <div className="mt-5 p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/40 text-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-indigo-300">
                Recommended Department: <span className="text-white font-extrabold">{triageResult.recommendedDepartment}</span>
              </span>
              <Badge status={triageResult.urgency} size="sm" />
            </div>
            <p className="text-slate-300 leading-relaxed">{triageResult.summary}</p>

            {triageResult.possibleConditions?.length > 0 && (
              <div>
                <span className="font-semibold text-indigo-300">Possible Conditions:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {triageResult.possibleConditions.map((c: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md bg-indigo-900/60 text-indigo-200 text-[10px] border border-indigo-700/50">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[11px] text-slate-400 italic border-t border-slate-800/80 pt-2">{triageResult.disclaimer}</p>
          </div>
        )}
      </div>

      {/* Appointments & Medical History Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appointments Queue */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" /> My Appointments ({appointments.length})
          </h3>
          <div className="space-y-3">
            {appointments.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No appointments scheduled</p>
            ) : (
              appointments.map((a) => (
                <div key={a.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-900">{a.doctor?.user?.name} ({a.doctor?.specialization})</div>
                    <div className="text-slate-500 text-[11px]">
                      {a.date ? new Date(a.date).toLocaleDateString() : ''} at {a.startTime}
                    </div>
                  </div>
                  <Badge status={a.status} size="sm" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Medical Diagnoses */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-emerald-600" /> Clinical History & Diagnoses ({medicalRecords.length})
          </h3>
          <div className="space-y-3">
            {medicalRecords.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No past medical records</p>
            ) : (
              medicalRecords.map((mr) => (
                <div key={mr.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-blue-700">Diagnosis: {mr.diagnosis}</span>
                    <span className="text-[10px] text-slate-400">
                      {mr.createdAt ? new Date(mr.createdAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]"><strong>Treatment:</strong> {mr.treatment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Book Appointment Modal */}
      <Modal isOpen={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} title="Book Physician Consultation">
        <form onSubmit={handleBook} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Physician / Specialist</label>
            <select
              value={bookForm.doctorId}
              onChange={(e) => setBookForm({ ...bookForm, doctorId: e.target.value })}
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Date</label>
              <input
                type="date"
                required
                value={bookForm.date}
                onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                value={bookForm.startTime}
                onChange={(e) => setBookForm({ ...bookForm, startTime: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                value={bookForm.endTime}
                onChange={(e) => setBookForm({ ...bookForm, endTime: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Visit</label>
            <textarea
              rows={2}
              placeholder="Primary health symptoms or reason for visit..."
              value={bookForm.reason}
              onChange={(e) => setBookForm({ ...bookForm, reason: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-md"
          >
            {isSubmitting ? 'Submitting Booking Request...' : 'Confirm Consultation Booking'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
