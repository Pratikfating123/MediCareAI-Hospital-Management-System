import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Medicine } from '../../types';
import { Loader } from '../../components/ui/Loader';
import { Modal } from '../../components/ui/Modal';
import { Pill, Plus, AlertTriangle, Search, PackageCheck } from 'lucide-react';

export const MedicinesPage: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<{ categories: any[]; suppliers: any[] }>({ categories: [], suppliers: [] });
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    supplierId: '',
    description: '',
    price: 15,
    stock: 100,
    minimumStock: 20,
    expiryDate: '2026-12-31',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const data = await api.getMedicines(search ? { search } : undefined);
      setMedicines(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMeta = async () => {
    try {
      const res = await api.getCategoriesAndSuppliers();
      setMeta(res);
      if (res.categories.length > 0) setFormData((prev) => ({ ...prev, categoryId: res.categories[0].id }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMedicines();
    fetchMeta();
  }, [search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.createMedicine(formData);
      setIsModalOpen(false);
      fetchMedicines();
    } catch (err: any) {
      alert(err.message || 'Failed to add medicine');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pharmacy Medicine Catalog</h1>
          <p className="text-xs text-slate-500">Track pharmaceutical supplies, unit pricing, minimum threshold warnings, and expiry dates</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Medicine
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search medicine name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <Loader text="Loading pharmaceutical inventory..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-200/80">
                  <th className="p-4">Code</th>
                  <th className="p-4">Medicine Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price / Unit</th>
                  <th className="p-4">Stock Level</th>
                  <th className="p-4">Expiry Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {medicines.map((m) => {
                  const isLow = m.stock <= m.minimumStock;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 font-bold text-blue-600">{m.medicineCode}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{m.name}</div>
                        <div className="text-[11px] text-slate-400">{m.description || 'N/A'}</div>
                      </td>
                      <td className="p-4 text-slate-600">{m.category?.name || 'General'}</td>
                      <td className="p-4 font-bold text-slate-900">${m.price.toFixed(2)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isLow ? 'text-rose-600' : 'text-emerald-600'}`}>{m.stock} units</span>
                          {isLow && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Low Stock
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-slate-500">
                        {m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Medicine Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Medicine to Catalog">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Medicine Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Amoxicillin 500mg"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              >
                {meta.categories.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Price ($)</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Stock</label>
              <input
                type="number"
                required
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Min. Alert Level</label>
              <input
                type="number"
                required
                value={formData.minimumStock}
                onChange={(e) => setFormData({ ...formData, minimumStock: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expiry Date</label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl shadow-md"
          >
            {isSubmitting ? 'Saving Medicine...' : 'Add Medicine'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
