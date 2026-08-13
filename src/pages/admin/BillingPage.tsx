import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Bill, Patient } from '../../types';
import { Loader } from '../../components/ui/Loader';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Receipt, Plus, DollarSign, CreditCard, CheckCircle2, Eye, Printer } from 'lucide-react';

export const BillingPage: React.FC = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);

  const [createForm, setCreateForm] = useState({
    patientId: '',
    tax: 15,
    discount: 0,
    items: [
      { description: 'Physician Consultation Fee', category: 'CONSULTATION', quantity: 1, unitPrice: 150 },
      { description: 'Laboratory Blood Diagnostics', category: 'LAB', quantity: 1, unitPrice: 85 },
    ],
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: 235,
    method: 'CARD' as 'CASH' | 'CARD' | 'INSURANCE' | 'ONLINE',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const data = await api.getBills();
      setBills(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const data = await api.getPatients();
      setPatients(data);
      if (data.length > 0) setCreateForm((prev) => ({ ...prev, patientId: data[0].id }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBills();
    fetchPatients();
  }, []);

  const handleCreateBill = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createBill(createForm);
      setIsCreateModalOpen(false);
      fetchBills();
    } catch (err: any) {
      alert(err.message || 'Invoice creation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBill) return;
    setIsSubmitting(true);
    try {
      await api.recordPayment(selectedBill.id, paymentForm);
      setIsPaymentModalOpen(false);
      fetchBills();
    } catch (err: any) {
      alert(err.message || 'Payment recording failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Billing & Payment Invoices</h1>
          <p className="text-xs text-slate-500">Patient invoice generation, itemized medical billing, cashier receipts, and insurance claims</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create New Invoice
        </button>
      </div>

      {loading ? (
        <Loader text="Loading hospital financial billing ledger..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-200/80">
                  <th className="p-4">Invoice No</th>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Subtotal</th>
                  <th className="p-4">Tax / Discount</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Payment Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {bills.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-blue-600">{b.invoiceNumber}</td>
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{b.patient?.user?.name || 'N/A'}</div>
                      <div className="text-[11px] text-slate-400">{b.patient?.patientCode}</div>
                    </td>
                    <td className="p-4 text-slate-600">${b.subtotal.toFixed(2)}</td>
                    <td className="p-4 text-slate-500">
                      +${b.tax.toFixed(2)} / -${b.discount.toFixed(2)}
                    </td>
                    <td className="p-4 font-bold text-slate-900">${b.total.toFixed(2)}</td>
                    <td className="p-4">
                      <Badge status={b.status} size="sm" />
                    </td>
                    <td className="p-4 text-right space-x-1.5">
                      {b.status !== 'PAID' && (
                        <button
                          onClick={() => {
                            setSelectedBill(b);
                            setPaymentForm({ amount: b.total, method: 'CARD' });
                            setIsPaymentModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold rounded-lg text-xs border border-emerald-200"
                        >
                          Collect Payment
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

      {/* Create Invoice Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Generate Patient Invoice">
        <form onSubmit={handleCreateBill} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Patient</label>
            <select
              value={createForm.patientId}
              onChange={(e) => setCreateForm({ ...createForm, patientId: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.user?.name} ({p.patientCode})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Line Items</label>
            {createForm.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-12 gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Service description"
                  value={item.description}
                  onChange={(e) => {
                    const updated = [...createForm.items];
                    updated[idx].description = e.target.value;
                    setCreateForm({ ...createForm, items: updated });
                  }}
                  className="col-span-6 px-3 py-1.5 border border-slate-200 rounded-xl"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => {
                    const updated = [...createForm.items];
                    updated[idx].quantity = Number(e.target.value);
                    setCreateForm({ ...createForm, items: updated });
                  }}
                  className="col-span-2 px-3 py-1.5 border border-slate-200 rounded-xl"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={item.unitPrice}
                  onChange={(e) => {
                    const updated = [...createForm.items];
                    updated[idx].unitPrice = Number(e.target.value);
                    setCreateForm({ ...createForm, items: updated });
                  }}
                  className="col-span-4 px-3 py-1.5 border border-slate-200 rounded-xl"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-md"
          >
            {isSubmitting ? 'Generating Invoice...' : 'Generate Invoice'}
          </button>
        </form>
      </Modal>

      {/* Collect Payment Modal */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title={`Collect Payment - Invoice ${selectedBill?.invoiceNumber || ''}`}
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <p><strong>Patient:</strong> {selectedBill?.patient?.user?.name}</p>
            <p><strong>Total Invoice Amount:</strong> ${selectedBill?.total.toFixed(2)}</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
            <select
              value={paymentForm.method}
              onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value as any })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            >
              <option value="CARD">Credit / Debit Card</option>
              <option value="CASH">Cash Payment</option>
              <option value="INSURANCE">Health Insurance Claim</option>
              <option value="ONLINE">Online Portal Payment</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Amount Paid ($)</label>
            <input
              type="number"
              step="0.01"
              required
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-md"
          >
            {isSubmitting ? 'Recording Payment...' : 'Confirm Payment & Print Receipt'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
