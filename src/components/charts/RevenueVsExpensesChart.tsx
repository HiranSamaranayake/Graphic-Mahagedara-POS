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
    if (dailyIncomeList.length === 0 && expenseList.length === 0) return [];

    const monthMap: { [key: string]: { month: string; revenue: number; expenses: number } } = {};

    dailyIncomeList.forEach((item) => {
      const monthKey = item.date.substring(0, 7);
      const date = new Date(item.date);
      const monthLabel = date.toLocaleString('en-US', { month: 'short', year: '2-digit' });

      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { month: monthLabel, revenue: 0, expenses: 0 };
      }
      monthMap[monthKey].revenue += item.dailyTotal;
    });

    expenseList.forEach((item) => {
      const monthKey = item.date.substring(0, 7);
      const date = new Date(item.date);
      const monthLabel = date.toLocaleString('en-US', { month: 'short', year: '2-digit' });

      if (!monthMap[monthKey]) {
        monthMap[monthKey] = { month: monthLabel, revenue: 0, expenses: 0 };
      }
      monthMap[monthKey].expenses += item.amount;
    });

    return Object.keys(monthMap)
      .sort()
      .map((k) => monthMap[k]);
  };

  const chartData = getCombinedMonthlyData();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-2xl text-xs space-y-1">
          <p className="font-bold text-slate-200">{label}</p>
          <div className="flex items-center justify-between gap-4 text-emerald-400">
            <span>Revenue:</span>
            <span className="font-bold">{formatCurrency(payload[0]?.value || 0)}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-rose-400">
            <span>Expenses:</span>
            <span className="font-bold">{formatCurrency(payload[1]?.value || 0)}</span>
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
          icon={<BarChart2 className="w-10 h-10 text-purple-400" />}
        />
      ) : (
        <div className="w-full h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
              <Legend
                wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                formatter={(value) => <span className="text-slate-300 font-medium">{value}</span>}
              />
              <Bar dataKey="revenue" name="Revenue" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
};
