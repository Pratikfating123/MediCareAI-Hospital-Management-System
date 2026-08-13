import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Prescription, Medicine } from '../../types';
import { Loader } from '../../components/ui/Loader';
import { Badge } from '../../components/ui/Badge';
import { Pill, PackageCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const PharmacistDashboard: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPharmacyData = async () => {
    try {
      setLoading(true);
      const [rx, meds] = await Promise.all([api.getPrescriptions(), api.getMedicines()]);
      setPrescriptions(rx);
      setMedicines(meds);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPharmacyData();
  }, []);

  const lowStockMeds = medicines.filter((m) => m.stock <= m.minimumStock);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-cyan-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-600 rounded-2xl text-white shadow-md">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Pharmacy Dispensing Station</h1>
            <p className="text-xs text-cyan-200 mt-0.5">Prescription verification, medicine dispensing, and pharmaceutical inventory monitoring</p>
          </div>
        </div>
      </div>

      {lowStockMeds.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>
              <strong>Low Stock Warning:</strong> {lowStockMeds.length} medicines are below minimum threshold!
            </span>
          </div>
          <span className="font-bold text-rose-700 underline cursor-pointer">View Low Stock List</span>
        </div>
      )}

      {loading ? (
        <Loader text="Loading prescription dispensing queue..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-900">
            Pending Prescription Orders ({prescriptions.length})
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {prescriptions.map((p) => (
              <div key={p.id} className="p-4 hover:bg-slate-50/80 transition-colors space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-blue-600 text-sm">{p.prescriptionCode}</span>
                    <span className="text-slate-500 ml-2">Patient: <strong>{p.patient?.user?.name}</strong></span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {p.items.map((item) => (
                    <div key={item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="font-bold text-slate-900">{item.medicine?.name}</div>
                      <div className="text-[11px] text-slate-600">Dosage: {item.dosage} • {item.frequency}</div>
                      <div className="text-[10px] text-slate-400">Duration: {item.duration}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
