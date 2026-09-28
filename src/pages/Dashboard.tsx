import React, { useState } from 'react';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { SalarySummaryCards } from '../components/dashboard/SalarySummaryCards';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RevenueOverviewChart } from '../components/charts/RevenueOverviewChart';
import { RevenueVsExpensesChart } from '../components/charts/RevenueVsExpensesChart';
import { ProfitSummaryCard } from '../components/dashboard/ProfitSummaryCard';
import { RecentTransactions } from '../components/dashboard/RecentTransactions';
import { AddIncomeModal } from '../components/forms/AddIncomeModal';
import { AddExpenseModal } from '../components/forms/AddExpenseModal';
import { AddStaffModal } from '../components/forms/AddStaffModal';
import { AddSalaryModal } from '../components/forms/AddSalaryModal';
import { GraphicDesignerDashboardView } from '../components/dashboard/GraphicDesignerDashboardView';
import { useAuth } from '../context/AuthContext';
import { Calendar, Sparkles } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { role, profile } = useAuth();

  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);

  // If logged in as Graphic Designer, render personal simple Graphic Designer Dashboard
  if (role === 'Staff' && profile?.staffCategory === 'Graphic Designer') {
    return <GraphicDesignerDashboardView />;
  }

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

  const isCallCenter = role === 'Staff' && profile?.staffCategory === 'Call Center Operator';

  return (
    <div className="space-y-6">
      {/* Dashboard Top Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-3xl shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-teal-600 font-bold text-xs mb-1">
            <Sparkles className="w-4 h-4" />
            <span>GRAPHIC MAHAGEDARA DASHBOARD</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {getGreeting()}, {profile?.fullName || (role === 'Admin' ? 'Admin' : 'Operator')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            {isCallCenter
              ? "Call Center Operations — Record & manage daily income transactions."
              : "Here's what's happening with Graphic Mahagedara today."}
          </p>
        </div>

        <div className="relative z-10 inline-flex items-center gap-2.5 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 self-start sm:self-center shadow-xs">
          <Calendar className="w-4 h-4 text-teal-600" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <SummaryCards />

      {/* Real-time Salary Summary Cards (Admin Only) */}
      {role === 'Admin' && <SalarySummaryCards />}

      {/* Quick Action Controls */}
      <QuickActions
        onOpenIncomeModal={() => setIsIncomeModalOpen(true)}
        onOpenExpenseModal={() => setIsExpenseModalOpen(true)}
        onOpenStaffModal={() => setIsStaffModalOpen(true)}
        onOpenSalaryModal={() => setIsSalaryModalOpen(true)}
      />

      {/* Large Revenue Overview Chart */}
      <RevenueOverviewChart />

      {/* Charts Grid: Revenue vs Expenses & Net Profit Summary (Admin Only) */}
      {role === 'Admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueVsExpensesChart />
          </div>
          <div>
            <ProfitSummaryCard />
          </div>
        </div>
      )}

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
      {role === 'Admin' && (
        <>
          <AddStaffModal
            isOpen={isStaffModalOpen}
            onClose={() => setIsStaffModalOpen(false)}
          />
          <AddSalaryModal
            isOpen={isSalaryModalOpen}
            onClose={() => setIsSalaryModalOpen(false)}
          />
        </>
      )}
    </div>
  );
};
