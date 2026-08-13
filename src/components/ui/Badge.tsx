import React from 'react';

interface BadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
  const norm = (status || '').toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (['APPROVED', 'COMPLETED', 'PAID', 'ACTIVE', 'LOW', 'SUCCESS', 'HEALTHY'].includes(norm)) {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
  } else if (['PENDING', 'REQUESTED', 'IN_PROGRESS', 'MODERATE', 'PARTIAL', 'WARNING'].includes(norm)) {
    styles = 'bg-amber-50 text-amber-700 border-amber-200/80';
  } else if (['CANCELLED', 'HIGH', 'EMERGENCY', 'INACTIVE', 'CRITICAL', 'UNPAID'].includes(norm)) {
    styles = 'bg-rose-50 text-rose-700 border-rose-200/80';
  } else if (['ADMIN', 'DOCTOR', 'PHARMACIST', 'RECEPTIONIST', 'LAB_STAFF', 'PATIENT'].includes(norm)) {
    styles = 'bg-blue-50 text-blue-700 border-blue-200/80';
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-semibold rounded-full border whitespace-nowrap ${sizeClass} ${styles}`}>
      {status}
    </span>
  );
};
