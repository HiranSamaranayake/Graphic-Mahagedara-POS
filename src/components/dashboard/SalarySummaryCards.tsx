import React from 'react';
import { StatCard } from '../ui/StatCard';
import { Wallet, CheckCircle, Clock, Users } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

export const SalarySummaryCards: React.FC = () => {
  const { salaryList } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthPrefix = todayStr.substring(0, 7); // e.g. "2026-09"

  // 1. Monthly Salary Expense (current month)
  const monthlySalaryExpense = salaryList
    .filter((s) => {
      // Month format could be "September 2026" or date string
      if (s.paymentDate && s.paymentDate.startsWith(currentMonthPrefix)) return true;
      const curMonthName = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
      return s.month.toLowerCase() === curMonthName.toLowerCase();
    })
    .reduce((sum, s) => sum + s.finalSalary, 0);

  // 2. Total Paid Salaries
  const totalPaidSalaries = salaryList
    .filter((s) => s.paymentStatus === 'Paid')
    .reduce((sum, s) => sum + s.finalSalary, 0);

  // 3. Pending Salaries
  const pendingSalaries = salaryList
    .filter((s) => s.paymentStatus !== 'Paid')
    .reduce((sum, s) => sum + s.finalSalary, 0);

  // 4. Total Staff Salary
  const totalStaffSalary = salaryList.reduce((sum, s) => sum + s.finalSalary, 0);

  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Wallet className="w-4 h-4 text-purple-400" />
          <span>Real-time Payroll & Salary Metrics (Supabase)</span>
        </h3>
        <span className="text-xs text-slate-400">Live public.salary_payments</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Monthly Salary Expense"
          value={formatCurrency(monthlySalaryExpense)}
          subtitle="Selected month payroll"
          icon={<Wallet className="w-5 h-5 text-purple-400" />}
          badgeText="Current Month"
        />

        <StatCard
          title="Total Paid Salaries"
          value={formatCurrency(totalPaidSalaries)}
          subtitle={`${salaryList.filter((s) => s.paymentStatus === 'Paid').length} Disbursements`}
          icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}
          badgeText="Paid Out"
        />

        <StatCard
          title="Pending Salaries"
          value={formatCurrency(pendingSalaries)}
          subtitle={`${salaryList.filter((s) => s.paymentStatus !== 'Paid').length} Unsettled`}
          icon={<Clock className="w-5 h-5 text-amber-400" />}
          badgeText="Pending"
        />

        <StatCard
          title="Total Staff Salary"
          value={formatCurrency(totalStaffSalary)}
          subtitle="All-time payroll total"
          icon={<Users className="w-5 h-5 text-indigo-400" />}
          badgeText="Total Payroll"
        />
      </div>
    </div>
  );
};
