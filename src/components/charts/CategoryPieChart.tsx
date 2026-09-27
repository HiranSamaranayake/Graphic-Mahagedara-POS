import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ChartCard } from '../ui/ChartCard';
import { EmptyState } from '../ui/EmptyState';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { PieChart as PieIcon } from 'lucide-react';

const CATEGORY_COLORS: { [key: string]: string } = {
  Salaries: '#8b5cf6',
  'Facebook Boost': '#ec4899',
  Advertising: '#3b82f6',
  Software: '#10b981',
  Internet: '#f59e0b',
  Electricity: '#6366f1',
  Equipment: '#06b6d4',
  Transport: '#14b8a6',
  'Office Expenses': '#a855f7',
  Other: '#64748b',
};

export const CategoryPieChart: React.FC = () => {
  const { expenseList } = useApp();

  const getCategoryData = () => {
    if (expenseList.length === 0) return [];

    const totalAmount = expenseList.reduce((sum, item) => sum + item.amount, 0);
    const categoryMap: { [key: string]: number } = {};

    expenseList.forEach((exp) => {
      categoryMap[exp.category] = (categoryMap[exp.category] || 0) + exp.amount;
    });

    return Object.keys(categoryMap).map((cat) => ({
      category: cat,
      amount: categoryMap[cat],
      percentage: totalAmount > 0 ? Math.round((categoryMap[cat] / totalAmount) * 100) : 0,
      color: CATEGORY_COLORS[cat] || '#8b5cf6',
    }));
  };

  const chartData = getCategoryData();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 border border-slate-700/80 p-3 rounded-xl shadow-2xl text-xs">
          <p className="font-bold text-slate-200">{data.category}</p>
          <p className="text-purple-400 font-semibold mt-0.5">
            {formatCurrency(data.amount)} ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartCard
      title="Expense Category Breakdown"
      subtitle="Percentage distribution of business operating costs"
    >
      {chartData.length === 0 ? (
        <EmptyState
          title="No expense data recorded yet"
          description="Category distribution pie chart will appear here once expenses are logged."
          icon={<PieIcon className="w-10 h-10 text-purple-400" />}
        />
      ) : (
        <div className="w-full h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={4}
                dataKey="amount"
                nameKey="category"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                formatter={(value) => <span className="text-xs text-slate-300 font-medium">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
};
