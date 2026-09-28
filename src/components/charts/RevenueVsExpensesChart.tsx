import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartCard } from '../ui/ChartCard';
import { EmptyState } from '../ui/EmptyState';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { BarChart2 } from 'lucide-react';

export const RevenueVsExpensesChart: React.FC = () => {
  const { dailyIncomeList, expenseList } = useApp();

  const getCombinedMonthlyData = () => {
    const hasData = dailyIncomeList.length > 0 || expenseList.length > 0;
    if (!hasData) return [];

    const months: { key: string; month: string; revenue: number; expenses: number; profit: number }[] = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().substring(0, 7);
      const monthLabel = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      months.push({ key, month: monthLabel, revenue: 0, expenses: 0, profit: 0 });
    }

    months.forEach((m) => {
      m.revenue = dailyIncomeList
        .filter((item) => item.date.startsWith(m.key))
        .reduce((sum, item) => sum + item.dailyTotal, 0);

      m.expenses = expenseList
        .filter((item) => item.date.startsWith(m.key))
        .reduce((sum, item) => sum + item.amount, 0);

      m.profit = m.revenue - m.expenses;
    });

    return months;
  };

  const chartData = getCombinedMonthlyData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-extrabold text-slate-900">{label}</p>
          <div className="flex items-center justify-between gap-4 text-teal-600 font-bold">
            <span>Revenue:</span>
            <span>{formatCurrency(payload[0]?.value || 0)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-rose-600 font-bold">
            <span>Expenses:</span>
            <span>{formatCurrency(payload[1]?.value || 0)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartCard
      title="Revenue vs Expenses Comparison"
      subtitle="Monthly breakdown comparing income against operating costs"
    >
      {chartData.length === 0 ? (
        <EmptyState
          title="No comparison data available yet"
          description="Log daily income and business expenses to view comparison charts."
          icon={<BarChart2 className="w-10 h-10 text-teal-600" />}
        />
      ) : (
        <div className="w-full h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `Rs. ${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                formatter={(value) => <span className="text-slate-700 font-bold">{value}</span>}
              />
              <Bar dataKey="revenue" name="Revenue" fill="#0d9488" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
};
