import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Appointment, Patient, Medicine } from '../../types';
import { Loader } from '../../components/ui/Loader';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Stethoscope, Calendar, Clock, User, FileText, FlaskConical, CheckCircle, Plus } from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  // Consultation Form
  const [consultForm, setConsultForm] = useState({
    symptoms: 'Fever, sore throat, fatigue for 3 days',
    diagnosis: 'Acute Upper Respiratory Tract Infection',
    treatment: 'Hydration, rest, antipyretic analgesics, 5-day antibiotic course',
    prescribeMedicineId: '',
    dosage: '500mg',
    frequency: 'Twice daily after meals',
    duration: '5 Days',
    orderLabTest: false,
    labTestName: 'Routine Complete Blood Count (CBC)',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDoctorQueue = async () => {
    try {
      setLoading(true);
      const appts = await api.getAppointments();
      setAppointments(appts);
      const meds = await api.getMedicines();
      setMedicines(meds);
      if (meds.length > 0) setConsultForm((prev) => ({ ...prev, prescribeMedicineId: meds[0].id }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorQueue();
  }, []);

  const handleStartConsultation = (appt: Appointment) => {
    setSelectedAppt(appt);
    setIsConsultModalOpen(true);
  };

  const handleSaveConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppt) return;
    setIsSubmitting(true);
    try {
      // 1. Create Medical Record
      await api.createMedicalRecord({
        patientId: selectedAppt.patientId,
        doctorId: selectedAppt.doctorId,
        appointmentId: selectedAppt.id,
        symptoms: consultForm.symptoms,
        diagnosis: consultForm.diagnosis,
        treatment: consultForm.treatment,
      });

      // 2. Create Prescription if medicine selected
      if (consultForm.prescribeMedicineId) {
        await api.createPrescription({
          patientId: selectedAppt.patientId,
          doctorId: selectedAppt.doctorId,
          appointmentId: selectedAppt.id,
          items: [
            {
              medicineId: consultForm.prescribeMedicineId,
              dosage: consultForm.dosage,
              frequency: consultForm.frequency,
              duration: consultForm.duration,
              quantity: 1,
            },
          ],
        });
      }

      // 3. Order Lab Test if checked
      if (consultForm.orderLabTest) {
        await api.createLabTest({
          patientId: selectedAppt.patientId,
          doctorId: selectedAppt.doctorId,
          appointmentId: selectedAppt.id,
          testName: consultForm.labTestName,
          description: 'Ordered during clinical consultation',
        });
      }

      // 4. Complete Appointment
      await api.updateAppointmentStatus(selectedAppt.id, 'COMPLETED');

      setIsConsultModalOpen(false);
      fetchDoctorQueue();
    } catch (err: any) {
      alert(err.message || 'Consultation completion failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg border border-blue-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-md">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Physician Clinical Workstation</h1>
            <p className="text-xs text-blue-200 mt-0.5">Review patient queue, perform consultations, prescribe medication & trigger lab tests</p>
          </div>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading today's patient queue..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Today's Patient Queue ({appointments.length})</h3>
            <span className="text-xs text-slate-500 font-medium">Real-Time Patient Intake</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-200/80">
                  <th className="p-4">Appt Code</th>
                  <th className="p-4">Patient Name</th>
                  <th className="p-4">Reason / Symptoms</th>
                  <th className="p-4">Time Slot</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-blue-600">{a.appointmentCode}</td>
                    <td className="p-4 font-bold text-slate-900">{a.patient?.user?.name}</td>
                    <td className="p-4 text-slate-600">{a.reason || 'General Health Review'}</td>
                    <td className="p-4 text-slate-500">{a.startTime} - {a.endTime}</td>
                    <td className="p-4">
                      <Badge status={a.status} size="sm" />
                    </td>
                    <td className="p-4 text-right">
                      {a.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleStartConsultation(a)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs shadow-xs flex items-center gap-1.5 ml-auto"
                        >
                          <FileText className="w-3.5 h-3.5" /> Start Consultation
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

      {/* Consultation & Digital Prescription Modal */}
      <Modal
        isOpen={isConsultModalOpen}
        onClose={() => setIsConsultModalOpen(false)}
        title={`Clinical Consultation - ${selectedAppt?.patient?.user?.name || ''}`}
        subtitle={`Appt: ${selectedAppt?.appointmentCode || ''}`}
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveConsultation} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Chief Symptoms *</label>
            <textarea
              rows={2}
              required
              value={consultForm.symptoms}
              onChange={(e) => setConsultForm({ ...consultForm, symptoms: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Diagnosis *</label>
            <input
              type="text"
              required
              value={consultForm.diagnosis}
              onChange={(e) => setConsultForm({ ...consultForm, diagnosis: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Treatment Plan & Advice</label>
            <textarea
              rows={2}
              value={consultForm.treatment}
              onChange={(e) => setConsultForm({ ...consultForm, treatment: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          {/* Digital Prescription Section */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-blue-600" /> Issue Digital Prescription
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Medicine</label>
                <select
                  value={consultForm.prescribeMedicineId}
                  onChange={(e) => setConsultForm({ ...consultForm, prescribeMedicineId: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white"
                >
                  <option value="">-- No Medication Needed --</option>
                  {medicines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} (${m.price})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Dosage</label>
                <input
                  type="text"
                  value={consultForm.dosage}
                  onChange={(e) => setConsultForm({ ...consultForm, dosage: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Frequency</label>
                <input
                  type="text"
                  value={consultForm.frequency}
                  onChange={(e) => setConsultForm({ ...consultForm, frequency: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Duration</label>
                <input
                  type="text"
                  value={consultForm.duration}
                  onChange={(e) => setConsultForm({ ...consultForm, duration: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white"
                />
              </div>
            </div>
          </div>

          {/* Trigger Lab Test */}
          <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-indigo-600" />
              <span className="font-semibold text-indigo-900">Order Diagnostic Lab Test?</span>
            </div>
            <input
              type="checkbox"
              checked={consultForm.orderLabTest}
              onChange={(e) => setConsultForm({ ...consultForm, orderLabTest: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded-sm"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-md"
          >
            {isSubmitting ? 'Finalizing Record...' : 'Complete Consultation & Issue Medical Record'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
