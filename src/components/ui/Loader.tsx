import React from 'react';

export const Loader: React.FC<{ text?: string }> = ({ text = 'Loading hospital records...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-slate-500">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-slate-200" />
        <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
      </div>
      <span className="mt-4 text-xs font-medium text-slate-600">{text}</span>
    </div>
  );
};
