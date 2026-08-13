import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Patient } from '../../types';
import { Loader } from '../../components/ui/Loader';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Search, UserPlus, Heart, FileText, Calendar, Activity, Eye, ShieldAlert } from 'lucide-react';

export const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientDetails, setPatientDetails] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'Password123!',
    phone: '',
    dateOfBirth: '',
    gender: 'MALE',
    bloodGroup: 'O+',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    allergies: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const data = await api.getPatients(search ? { search } : undefined);
      setPatients(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search]);

  const handleViewPatient = async (p: Patient) => {
    setSelectedPatient(p);
    setIsDetailsModalOpen(true);
    try {
      const full = await api.getPatientById(p.id);
      setPatientDetails(full);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createPatient(formData);
      setIsCreateModalOpen(false);
      fetchPatients();
    } catch (err: any) {
      alert(err.message || 'Failed to create patient');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Patients Registry</h1>
          <p className="text-xs text-slate-500">Search patient records, view clinical history, or register new patients</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Register New Patient
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search code, name, phone, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Grid Table */}
      {loading ? (
        <Loader text="Loading patient profiles..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-200/80">
                  <th className="p-4">Patient Code</th>
                  <th className="p-4">Patient Name</th>
                  <th className="p-4">Blood Group</th>
                  <th className="p-4">Phone</th>
                  <th className="p-4">Emergency Contact</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {patients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-blue-600">{p.patientCode}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{p.user?.name}</div>
                      <div className="text-[11px] text-slate-400">{p.user?.email}</div>
                    </td>
                    <td className="p-4 font-bold text-slate-700">
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200/60 font-bold text-[11px]">
                        {p.bloodGroup || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{p.phone || p.user?.phone || 'N/A'}</td>
                    <td className="p-4 text-slate-600">
                      {p.emergencyContactName ? `${p.emergencyContactName} (${p.emergencyContactPhone})` : 'N/A'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleViewPatient(p)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-semibold rounded-xl text-xs transition-colors inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> Clinical Timeline
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patient Timeline Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={`Patient Clinical History - ${selectedPatient?.user?.name || ''}`}
        subtitle={`Patient Code: ${selectedPatient?.patientCode || ''}`}
        maxWidth="4xl"
      >
        {patientDetails ? (
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
            {/* Quick Profile Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Blood Group</span>
                <p className="text-sm font-bold text-rose-600">{patientDetails.bloodGroup || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Gender / DOB</span>
                <p className="text-xs font-semibold text-slate-800">
                  {patientDetails.gender || 'N/A'} • {patientDetails.dateOfBirth ? new Date(patientDetails.dateOfBirth).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Phone</span>
                <p className="text-xs font-semibold text-slate-800">{patientDetails.phone || 'N/A'}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Emergency Contact</span>
                <p className="text-xs font-semibold text-slate-800">
                  {patientDetails.emergencyContactName || 'N/A'} ({patientDetails.emergencyContactPhone})
                </p>
              </div>
            </div>

            {patientDetails.allergies && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Allergies & Alerts:</strong> {patientDetails.allergies}
                </span>
              </div>
            )}

            {/* Medical Records Timeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Medical Records & Diagnoses ({patientDetails.medicalRecords?.length || 0})
              </h4>
              <div className="space-y-3">
                {(patientDetails.medicalRecords || []).map((mr: any) => (
                  <div key={mr.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-blue-600">Diagnosis: {mr.diagnosis}</span>
                      <span className="text-slate-400 font-medium">
                        {mr.createdAt ? new Date(mr.createdAt).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      <strong>Symptoms:</strong> {mr.symptoms}
                    </p>
                    <p className="text-xs text-slate-600">
                      <strong>Treatment Plan:</strong> {mr.treatment}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Prescriptions */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                Active Prescriptions ({patientDetails.prescriptions?.length || 0})
              </h4>
              <div className="space-y-2">
                {(patientDetails.prescriptions || []).map((p: any) => (
                  <div key={p.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="font-bold text-slate-800 mb-1">{p.prescriptionCode}</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {p.items?.map((item: any) => (
                        <div key={item.id} className="p-2 rounded-lg bg-white border border-slate-200 text-[11px]">
                          <span className="font-bold text-blue-700">{item.medicine?.name}</span> • {item.dosage} ({item.frequency})
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Loader />
        )}
      </Modal>

      {/* Create Patient Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Register Patient Profile">
        <form onSubmit={handleCreatePatient} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
              <select
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              >
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="AB+">AB+</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Known Allergies</label>
            <textarea
              rows={2}
              value={formData.allergies}
              onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-md"
          >
            {isSubmitting ? 'Registering...' : 'Save Patient Record'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
