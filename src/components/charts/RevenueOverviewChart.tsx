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
    const monthsCount = timeframe === '6m' ? 6 : timeframe === '12m' ? 12 : new Date().getMonth() + 1;
    const months: { key: string; label: string; revenue: number; jobs: number }[] = [];
    const now = new Date();

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().substring(0, 7); // YYYY-MM
      const label = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      months.push({ key, label, revenue: 0, jobs: 0 });
    }

    months.forEach((m) => {
      const incRecords = dailyIncomeList.filter((item) => item.date.startsWith(m.key));
      m.revenue = incRecords.reduce((sum, item) => sum + item.dailyTotal, 0);
      m.jobs = incRecords.reduce((sum, item) => sum + item.jobsCount, 0);
    });

    return months;
  };

  const chartData = getMonthlyData();
  const hasData = dailyIncomeList.length > 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xl text-xs">
          <p className="font-extrabold text-slate-900 mb-1">{label}</p>
          <div className="flex items-center gap-2 text-teal-600 font-bold">
            <span>Revenue:</span>
            <span>{formatCurrency(payload[0].value)}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-500 text-[11px] font-medium mt-0.5">
            <span>Jobs Completed:</span>
            <span>{payload[0].payload.jobs}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const selector = (
    <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
      <button
        onClick={() => setTimeframe('6m')}
        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
          timeframe === '6m'
            ? 'bg-teal-500 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        6 Months
      </button>
      <button
        onClick={() => setTimeframe('12m')}
        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
          timeframe === '12m'
            ? 'bg-teal-500 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        12 Months
      </button>
      <button
        onClick={() => setTimeframe('year')}
        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
          timeframe === 'year'
            ? 'bg-teal-500 text-white shadow-xs'
            : 'text-slate-600 hover:text-slate-900'
        }`}
      >
        This Year
      </button>
    </div>
  );

  return (
    <ChartCard
      title="Revenue Overview"
      subtitle="Monthly gross income progression calculated dynamically from Supabase database"
      action={selector}
    >
      {!hasData ? (
        <EmptyState
          title="No financial data available yet"
          description="Start recording daily income to see monthly revenue trends."
          icon={<BarChart3 className="w-10 h-10 text-teal-600" />}
        />
      ) : (
        <div className="w-full h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
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
                stroke="#0d9488"
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
