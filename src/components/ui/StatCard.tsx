import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string;
  change?: {
    value: string;
    type: 'increase' | 'decrease' | 'neutral';
    label?: string;
  };
  icon?: React.ReactNode;
  subtitle?: string;
  badgeText?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  subtitle,
  badgeText,
}) => {
  return (
    <div className="bg-white border border-slate-200 hover:border-teal-400/60 rounded-2xl p-5 shadow-xs shadow-slate-200/60 transition-all duration-300 hover:shadow-md hover:shadow-teal-500/10 group relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-teal-400/5 rounded-full blur-2xl group-hover:bg-teal-400/10 transition-colors" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 tracking-tight group-hover:text-teal-600 transition-colors">
            {value}
          </h3>
        </div>
        {icon && (
          <div className="p-3 bg-teal-50 border border-teal-200 text-teal-600 rounded-xl group-hover:scale-110 group-hover:border-teal-300 transition-all">
            {icon}
          </div>
        )}
      </div>

      {(change || subtitle || badgeText) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {change && (
            <div className="flex items-center gap-1">
              <span
                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-bold ${
                  change.type === 'increase'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : change.type === 'decrease'
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {change.type === 'increase' && <ArrowUpRight className="w-3.5 h-3.5" />}
                {change.type === 'decrease' && <ArrowDownRight className="w-3.5 h-3.5" />}
                {change.type === 'neutral' && <Minus className="w-3.5 h-3.5" />}
                {change.value}
              </span>
              {change.label && <span className="text-slate-500">{change.label}</span>}
            </div>
          )}

          {subtitle && <span className="text-slate-500 font-medium">{subtitle}</span>}

          {badgeText && (
            <span className="px-2 py-0.5 text-[11px] bg-teal-50 text-teal-700 border border-teal-200 rounded-md font-bold">
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
