import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartCard } from '../ui/ChartCard';
import { EmptyState } from '../ui/EmptyState';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { BarChart3 } from 'lucide-react';

export const RevenueOverviewChart: React.FC = () => {
  const { dailyIncomeList } = useApp();
  const [timeframe, setTimeframe] = useState<'6m' | '12m' | 'year'>('6m');

  // Compute monthly totals dynamically from real daily_income records
  const getMonthlyData = () => {
    if (dailyIncomeList.length === 0) return [];

    const monthMap: { [key: string]: { month: string; revenue: number; jobs: number } } = {};

    dailyIncomeList.forEach((item) => {
      const monthKey = item.date.substring(0, 7); // YYYY-MM
      const date = new Date(item.date);
      const monthLabel = date.toLocaleString('en-US', { month: 'short', year: '2-digit' });

      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { month: monthLabel, revenue: 0, jobs: 0 };
      }
      monthMap[monthKey].revenue += item.dailyTotal;
      monthMap[monthKey].jobs += item.jobsCount;
    });

    return Object.keys(monthMap)
      .sort()
      .map((k) => monthMap[k]);
  };

  const chartData = getMonthlyData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-2xl text-xs">
          <p className="font-bold text-slate-200 mb-1">{label}</p>
          <div className="flex items-center gap-2 text-purple-400 font-semibold">
            <span>Revenue:</span>
            <span>{formatCurrency(payload[0].value)}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400 text-[11px] mt-0.5">
            <span>Jobs Completed:</span>
            <span>{payload[0].payload.jobs}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const selector = (
    <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
      <button
        onClick={() => setTimeframe('6m')}
        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
          timeframe === '6m'
            ? 'bg-purple-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        6 Months
      </button>
      <button
        onClick={() => setTimeframe('12m')}
        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
          timeframe === '12m'
            ? 'bg-purple-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        12 Months
      </button>
      <button
        onClick={() => setTimeframe('year')}
        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
          timeframe === 'year'
            ? 'bg-purple-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        This Year
      </button>
    </div>
  );

  return (
    <ChartCard
      title="Revenue Overview"
      subtitle="Monthly gross income progression calculated from Supabase database"
      action={selector}
    >
      {chartData.length === 0 ? (
        <EmptyState
          title="No financial data available yet"
          description="Start recording daily income to see monthly revenue trends."
          icon={<BarChart3 className="w-10 h-10 text-purple-400" />}
        />
      ) : (
        <div className="w-full h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `Rs. ${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#8b5cf6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
};
