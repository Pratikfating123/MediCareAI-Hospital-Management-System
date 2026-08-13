import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { LabTest } from '../../types';
import { Loader } from '../../components/ui/Loader';
import { Badge } from '../../components/ui/Badge';
import { FlaskConical, CheckCircle, FileText } from 'lucide-react';

export const LabDashboard: React.FC = () => {
  const [labTests, setLabTests] = useState<LabTest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLabData = async () => {
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

  useEffect(() => {
    fetchLabData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-lg border border-indigo-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-md">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Laboratory Specialist Workstation</h1>
            <p className="text-xs text-indigo-200 mt-0.5">Pathology test processing, specimen analysis, and report distribution</p>
          </div>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading pending lab queue..." />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-900">
            Pending Lab Tests Queue ({labTests.length})
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-400 uppercase border-b border-slate-200/80">
                  <th className="p-4">Test Code</th>
                  <th className="p-4">Test Name</th>
                  <th className="p-4">Patient</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {labTests.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-bold text-blue-600">{t.testCode}</td>
                    <td className="p-4 font-bold text-slate-900">{t.testName}</td>
                    <td className="p-4 text-slate-800">{t.patient?.user?.name || 'N/A'}</td>
                    <td className="p-4">
                      <Badge status={t.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
