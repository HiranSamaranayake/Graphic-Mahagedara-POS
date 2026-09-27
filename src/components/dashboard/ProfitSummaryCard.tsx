import React from 'react';
import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

export const ProfitSummaryCard: React.FC = () => {
  const { dailyIncomeList, expenseList } = useApp();

  const now = new Date();
  const currentMonthPrefix = now.toISOString().substring(0, 7); // e.g. "2026-09"

  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthPrefix = prevMonthDate.toISOString().substring(0, 7);

  // Current Month calculations
  const curRev = dailyIncomeList
    .filter((inc) => inc.date.startsWith(currentMonthPrefix))
    .reduce((s, i) => s + i.dailyTotal, 0);
  const curExp = expenseList
    .filter((exp) => exp.date.startsWith(currentMonthPrefix))
    .reduce((s, e) => s + e.amount, 0);
  const currentMonthProfit = curRev - curExp;

  // Previous Month calculations
  const prevRev = dailyIncomeList
    .filter((inc) => inc.date.startsWith(prevMonthPrefix))
    .reduce((s, i) => s + i.dailyTotal, 0);
  const prevExp = expenseList
    .filter((exp) => exp.date.startsWith(prevMonthPrefix))
    .reduce((s, e) => s + e.amount, 0);
  const previousMonthProfit = prevRev - prevExp;

  const calculateChangeText = (curr: number, prev: number) => {
    if (prev === 0) return '— (No previous data)';
    const pct = ((curr - prev) / Math.abs(prev)) * 100;
    const sign = pct > 0 ? '+' : '';
    return `${sign}${pct.toFixed(2)}%`;
  };

  const changeLabel = calculateChangeText(currentMonthProfit, previousMonthProfit);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl shadow-slate-950/40 relative overflow-hidden flex flex-col justify-between">
      {/* Background ambient detail */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-950/60 border border-purple-500/30 text-purple-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">Net Profit Summary</h3>
              <p className="text-xs text-slate-400">Month-over-Month Growth</p>
            </div>
          </div>
          <span className="px-2.5 py-1 text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/30 rounded-full">
            {changeLabel}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Current Month
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-emerald-400 mt-1 block">
              {formatCurrency(currentMonthProfit)}
            </span>
          </div>

          <div className="border-l border-slate-800/80 pl-4">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              Previous Month
            </span>
            <span className="text-xl sm:text-2xl font-bold text-slate-300 mt-1 block">
              {formatCurrency(previousMonthProfit)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-400 flex items-center justify-between">
        <span>Calculated from Supabase database records</span>
        <span className="text-purple-400 font-medium">Live Query</span>
      </div>
    </div>
  );
};
