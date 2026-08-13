import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { InventoryTransaction, Medicine } from '../../types';
import { Loader } from '../../components/ui/Loader';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { PackageCheck, Plus, ArrowUpRight, ArrowDownLeft, RefreshCw } from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    medicineId: '',
    type: 'PURCHASE' as 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'RETURN',
    quantity: 50,
    reason: 'Restock shipment received',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await api.getInventoryTransactions();
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMedicines = async () => {
    try {
      const data = await api.getMedicines();
      setMedicines(data);
      if (data.length > 0) setFormData((prev) => ({ ...prev, medicineId: data[0].id }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchMedicines();
  }, []);

  const handleTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createInventoryTransaction(formData);
      setIsModalOpen(false);
      fetchTransactions();
    } catch (err: any) {
      alert(err.message || 'Transaction failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Inventory Stock Movement Ledger</h1>
          <p className="text-xs text-slate-500">Real-time tracking of pharmacy shipments, sales, dispensations, and stock adjustments</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Record Stock Movement
        </button>
      </div>

      {loading ? (
        <Loader text="Loading stock movement log..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-200/80">
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Medicine Name</th>
                  <th className="p-4">Transaction Type</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4">Reason / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 text-slate-500">
                      {t.createdAt ? new Date(t.createdAt).toLocaleString() : 'N/A'}
                    </td>
                    <td className="p-4 font-bold text-slate-900">{t.medicine?.name || 'N/A'}</td>
                    <td className="p-4">
                      <Badge status={t.type} size="sm" />
                    </td>
                    <td className="p-4 font-bold">
                      <span className={['PURCHASE', 'RETURN'].includes(t.type) ? 'text-emerald-600' : 'text-rose-600'}>
                        {['PURCHASE', 'RETURN'].includes(t.type) ? '+' : '-'}{t.quantity}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600">{t.reason || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Inventory Movement">
        <form onSubmit={handleTransaction} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Medicine</label>
            <select
              value={formData.medicineId}
              onChange={(e) => setFormData({ ...formData, medicineId: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            >
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} (Current Stock: {m.stock})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Transaction Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              >
                <option value="PURCHASE">Shipment Purchase (+)</option>
                <option value="SALE">Patient Sale / Dispensation (-)</option>
                <option value="ADJUSTMENT">Stock Audit Adjustment</option>
                <option value="RETURN">Return (+)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity</label>
              <input
                type="number"
                required
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Reference Notes</label>
            <textarea
              rows={2}
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
            {isSubmitting ? 'Recording...' : 'Save Stock Movement'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
