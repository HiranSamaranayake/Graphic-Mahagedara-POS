import React from 'react';
import { StatCard } from '../ui/StatCard';
import { DollarSign, TrendingUp, CreditCard, PieChart } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

export const SummaryCards: React.FC = () => {
  const { dailyIncomeList, expenseList } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthPrefix = todayStr.substring(0, 7); // e.g. "2026-09"

  // 1. Today's Revenue
  const todaysRevenue = dailyIncomeList
    .filter((inc) => inc.date === todayStr)
    .reduce((sum, item) => sum + item.dailyTotal, 0);

  // 2. This Month's Revenue
  const thisMonthsRevenue = dailyIncomeList
    .filter((inc) => inc.date.startsWith(currentMonthPrefix))
    .reduce((sum, item) => sum + item.dailyTotal, 0);

  // 3. This Month's Expenses
  const thisMonthsExpenses = expenseList
    .filter((exp) => exp.date.startsWith(currentMonthPrefix))
    .reduce((sum, item) => sum + item.amount, 0);

  // 4. Net Profit
  const netProfit = thisMonthsRevenue - thisMonthsExpenses;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
      <StatCard
        title="Today's Revenue"
        value={formatCurrency(todaysRevenue)}
        subtitle={todaysRevenue > 0 ? 'Recorded today' : 'No income today'}
        icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
        badgeText="Daily Total"
      />

      <StatCard
        title="This Month's Revenue"
        value={formatCurrency(thisMonthsRevenue)}
        subtitle={thisMonthsRevenue > 0 ? 'Current month gross' : 'No income this month'}
        icon={<TrendingUp className="w-5 h-5 text-purple-400" />}
        badgeText="Monthly Total"
      />

      <StatCard
        title="This Month's Expenses"
        value={formatCurrency(thisMonthsExpenses)}
        subtitle={thisMonthsExpenses > 0 ? 'Current month costs' : 'No expenses logged'}
        icon={<CreditCard className="w-5 h-5 text-rose-400" />}
        badgeText="Operational"
      />

      <StatCard
        title="Net Profit"
        value={formatCurrency(netProfit)}
        subtitle={netProfit !== 0 ? 'Revenue - Expenses' : 'No profit data yet'}
        icon={<PieChart className="w-5 h-5 text-indigo-400" />}
        badgeText="Net Margin"
      />
    </div>
  );
};
