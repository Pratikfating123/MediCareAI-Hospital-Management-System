import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { LabTest, Patient, Doctor } from '../../types';
import { Loader } from '../../components/ui/Loader';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { FlaskConical, Plus, FileText, CheckCircle2, Clock } from 'lucide-react';

export const LabPage: React.FC = () => {
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);

  const [orderForm, setOrderForm] = useState({
    patientId: '',
    doctorId: '',
    testName: 'Complete Blood Count (CBC)',
    description: 'Routine haematology analysis',
  });

  const [resultNotes, setResultNotes] = useState('Haemoglobin: 14.2 g/dL, WBC: 6,800 /mcL, Platelets: 250,000 /mcL. All values within normal clinical range.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLabTests = async () => {
    try {
      setLoading(true);
      const data = await api.getLabTests();
      setLabTests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeta = async () => {
    try {
      const [pData, dData] = await Promise.all([api.getPatients(), api.getDoctors()]);
      setPatients(pData);
      setDoctors(dData);
      if (pData.length > 0) setOrderForm((prev) => ({ ...prev, patientId: pData[0].id }));
      if (dData.length > 0) setOrderForm((prev) => ({ ...prev, doctorId: dData[0].id }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLabTests();
    fetchMeta();
  }, []);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createLabTest(orderForm);
      setIsOrderModalOpen(false);
      fetchLabTests();
    } catch (err: any) {
      alert(err.message || 'Failed to order test');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedTest) return;
    setIsSubmitting(true);
    try {
      await api.updateLabTestStatus(selectedTest.id, {
        status,
        notes: status === 'COMPLETED' ? resultNotes : undefined,
      });
      setIsResultModalOpen(false);
      fetchLabTests();
    } catch (err: any) {
      alert(err.message || 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Laboratory & Diagnostic Hub</h1>
          <p className="text-xs text-slate-500">Pathology orders, blood work analysis, radiologic diagnostic tests and digital reports</p>
        </div>
        <button
          onClick={() => setIsOrderModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Order New Lab Test
        </button>
      </div>

      {loading ? (
        <Loader text="Loading pathology tests..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-200/80">
                  <th className="p-4">Test Code</th>
                  <th className="p-4">Test Name</th>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Ordering Doctor</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {labTests.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-blue-600">{t.testCode}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{t.testName}</div>
                      <div className="text-[11px] text-slate-400">{t.description || 'Routine diagnostic'}</div>
                    </td>
                    <td className="p-4 font-bold text-slate-800">{t.patient?.user?.name || 'N/A'}</td>
                    <td className="p-4 text-slate-600">{t.doctor?.user?.name || 'N/A'}</td>
                    <td className="p-4">
                      <Badge status={t.status} size="sm" />
                    </td>
                    <td className="p-4 text-right space-x-1.5">
                      <button
                        onClick={() => {
                          setSelectedTest(t);
                          setIsResultModalOpen(true);
                        }}
                        className="px-3 py-1 bg-slate-100 hover:bg-blue-50 text-blue-700 font-semibold rounded-lg text-xs border border-slate-200"
                      >
                        Update / Results
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Test Modal */}
      <Modal isOpen={isOrderModalOpen} onClose={() => setIsOrderModalOpen(false)} title="Order Pathology Diagnostic Test">
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Patient</label>
              <select
                value={orderForm.patientId}
                onChange={(e) => setOrderForm({ ...orderForm, patientId: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.user?.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ordering Doctor</label>
              <select
                value={orderForm.doctorId}
                onChange={(e) => setOrderForm({ ...orderForm, doctorId: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.user?.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnostic Test Name *</label>
            <input
              type="text"
              required
              value={orderForm.testName}
              onChange={(e) => setOrderForm({ ...orderForm, testName: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Instructions</label>
            <textarea
              rows={2}
              value={orderForm.description}
              onChange={(e) => setOrderForm({ ...orderForm, description: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-md"
          >
            {isSubmitting ? 'Ordering Test...' : 'Send Test Request to Lab'}
          </button>
        </form>
      </Modal>

      {/* Result Entry Modal */}
      <Modal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        title={`Lab Test Workstation - ${selectedTest?.testName || ''}`}
        subtitle={`Test Code: ${selectedTest?.testCode || ''}`}
      >
        <div className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
            <p><strong>Patient:</strong> {selectedTest?.patient?.user?.name}</p>
            <p><strong>Current Status:</strong> <Badge status={selectedTest?.status || ''} size="sm" /></p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Pathology Findings & Lab Findings</label>
            <textarea
              rows={4}
              value={resultNotes}
              onChange={(e) => setResultNotes(e.target.value)}
              className="w-full p-3 text-xs border border-slate-200 rounded-xl font-mono text-slate-800"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => handleUpdateStatus('IN_PROGRESS')}
              className="flex-1 py-2 bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold rounded-xl"
            >
              Set In Progress
            </button>
            <button
              onClick={() => handleUpdateStatus('COMPLETED')}
              className="flex-1 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-md"
            >
              Complete & Publish Report
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
