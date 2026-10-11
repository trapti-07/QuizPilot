import React from 'react';

export default function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  gradient = 'from-indigo-500 to-violet-600',
  badgeText,
  badgeColor = 'bg-indigo-50 text-indigo-700'
}) {
  return (
    <div className="relative overflow-hidden bg-white p-5 rounded-2xl border border-indigo-50/80 shadow-xs hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">{subtitle}</p>
          )}
        </div>
        
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${gradient} flex items-center justify-center text-white shadow-md shadow-indigo-100/50 shrink-0`}>
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>

      {badgeText && (
        <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>
            {badgeText}
          </span>
        </div>
      )}
    </div>
  );
}
