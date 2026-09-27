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
    <div className="bg-zinc-900/90 border border-zinc-800 hover:border-amber-400/40 rounded-2xl p-5 shadow-lg shadow-zinc-950/40 transition-all duration-300 hover:shadow-amber-500/10 group relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl group-hover:bg-amber-400/10 transition-colors" />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight group-hover:text-amber-300 transition-colors">
            {value}
          </h3>
        </div>
        {icon && (
          <div className="p-3 bg-amber-400/10 border border-amber-400/30 text-amber-400 rounded-xl group-hover:scale-110 group-hover:border-amber-400/50 transition-all">
            {icon}
          </div>
        )}
      </div>

      {(change || subtitle || badgeText) && (
        <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-xs">
          {change && (
            <div className="flex items-center gap-1">
              <span
                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-bold ${
                  change.type === 'increase'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : change.type === 'decrease'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                }`}
              >
                {change.type === 'increase' && <ArrowUpRight className="w-3.5 h-3.5" />}
                {change.type === 'decrease' && <ArrowDownRight className="w-3.5 h-3.5" />}
                {change.type === 'neutral' && <Minus className="w-3.5 h-3.5" />}
                {change.value}
              </span>
              {change.label && <span className="text-zinc-400">{change.label}</span>}
            </div>
          )}

          {subtitle && <span className="text-zinc-400 font-medium">{subtitle}</span>}

          {badgeText && (
            <span className="px-2 py-0.5 text-[11px] bg-amber-400/10 text-amber-300 border border-amber-400/30 rounded-md font-bold">
              {badgeText}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
