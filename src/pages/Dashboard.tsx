import React, { useState } from 'react';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RevenueOverviewChart } from '../components/charts/RevenueOverviewChart';
import { RevenueVsExpensesChart } from '../components/charts/RevenueVsExpensesChart';
import { ProfitSummaryCard } from '../components/dashboard/ProfitSummaryCard';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { AddIncomeModal } from '../components/forms/AddIncomeModal';
import { AddExpenseModal } from '../components/forms/AddExpenseModal';
import { AddStaffModal } from '../components/forms/AddStaffModal';
import { AddSalaryModal } from '../components/forms/AddSalaryModal';
import { useApp } from '../context/AppContext';
import { Calendar, Sparkles } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { dailyIncomeList, expenseList } = useApp();
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);

  // Dynamic greeting based on current local hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="space-y-6">
      {/* Dashboard Top Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900/80 border border-slate-800 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs mb-1">
            <Sparkles className="w-4 h-4" />
            <span>GRAPHIC MAHAGEDARA DASHBOARD</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {getGreeting()}, Admin
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Here's what's happening with Graphic Mahagedara today.
          </p>
        </div>

        <div className="relative z-10 inline-flex items-center gap-2.5 px-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs font-semibold text-slate-300 self-start sm:self-center">
          <Calendar className="w-4 h-4 text-purple-400" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Empty Database Prompt Banner */}
      {dailyIncomeList.length === 0 && expenseList.length === 0 && (
        <div className="p-4 bg-purple-950/30 border border-purple-800/40 rounded-2xl flex items-center justify-between text-xs text-purple-300">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>Start adding staff, daily income, and expenses to see your business analytics.</span>
          </div>
          <span className="font-semibold text-purple-400">Database Empty</span>
        </div>
      )}

      {/* Summary Cards */}
      <SummaryCards />

      {/* Quick Action Controls */}
      <QuickActions
        onOpenIncomeModal={() => setIsIncomeModalOpen(true)}
        onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
        onOpenStaffModal={() => setIsStaffModalOpen(true)}
        onOpenSalaryModal={() => setIsSalaryModalOpen(true)}
      />

      {/* Large Revenue Overview Chart */}
      <RevenueOverviewChart />

      {/* Charts Grid: Revenue vs Expenses & Net Profit Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueVsExpensesChart />
        </div>
        <div>
          <ProfitSummaryCard />
        </div>
      </div>

      {/* Recent Transactions Table */}
      <RecentTransactions />

      {/* Form Modals */}
      <AddIncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
      />
      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />
      <AddStaffModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
      />
      <AddSalaryModal
        isOpen={isSalaryModalOpen}
        onClose={() => setIsSalaryModalOpen(false)}
      />
    </div>
  );
};
