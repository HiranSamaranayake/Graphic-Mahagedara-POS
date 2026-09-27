import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { RevenueOverviewChart } from '../components/charts/RevenueOverviewChart';
import { RevenueVsExpensesChart } from '../components/charts/RevenueVsExpensesChart';
import { CategoryPieChart } from '../components/charts/CategoryPieChart';
import { StatCard } from '../components/ui/StatCard';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import {
  TrendingUp,
  CreditCard,
  PieChart as PieIcon,
  Filter,
  BarChart3,
  Briefcase,
  UserCheck,
} from 'lucide-react';
import { MONTHLY_DATA_6_MONTHS } from '../data/demoData';

export const Analytics: React.FC = () => {
  const [filterPeriod, setFilterPeriod] = useState<string>('6m');

  // Month-to-Month comparison metrics
  const currentMonthData = MONTHLY_DATA_6_MONTHS[MONTHLY_DATA_6_MONTHS.length - 1]; // Sept
  const previousMonthData = MONTHLY_DATA_6_MONTHS[MONTHLY_DATA_6_MONTHS.length - 2]; // Aug

  const revChange = ((currentMonthData.revenue - previousMonthData.revenue) / previousMonthData.revenue) * 100;
  const expChange = ((currentMonthData.expenses - previousMonthData.expenses) / previousMonthData.expenses) * 100;
  const profitChange = ((currentMonthData.profit - previousMonthData.profit) / previousMonthData.profit) * 100;
  const jobsChange = ((currentMonthData.jobs - previousMonthData.jobs) / previousMonthData.jobs) * 100;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics & Business Intelligence"
        subtitle="In-depth visual insights into revenue trends, expense structures, profit margins & staff productivity"
        action={
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl">
            <Filter className="w-4 h-4 text-purple-400 ml-2" />
            <select
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none pr-2 cursor-pointer"
            >
              <option value="6m" className="bg-slate-900">Last 6 Months</option>
              <option value="12m" className="bg-slate-900">Last 12 Months</option>
              <option value="2026" className="bg-slate-900">Year 2026</option>
            </select>
          </div>
        }
      />

      {/* Month-to-Month Comparison Section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white tracking-tight">
            Month-to-Month Comparison (Sept vs Aug 2026)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <StatCard
            title="Revenue Change"
            value={formatCurrency(currentMonthData.revenue)}
            change={{
              value: formatPercentage(revChange),
              type: revChange >= 0 ? 'increase' : 'decrease',
              label: 'vs Aug',
            }}
            icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
            subtitle={`Previous: ${formatCurrency(previousMonthData.revenue)}`}
          />

          <StatCard
            title="Expense Change"
            value={formatCurrency(currentMonthData.expenses)}
            change={{
              value: formatPercentage(expChange),
              type: expChange <= 10 ? 'neutral' : 'decrease',
              label: 'vs Aug',
            }}
            icon={<CreditCard className="w-5 h-5 text-rose-400" />}
            subtitle={`Previous: ${formatCurrency(previousMonthData.expenses)}`}
          />

          <StatCard
            title="Net Profit Change"
            value={formatCurrency(currentMonthData.profit)}
            change={{
              value: formatPercentage(profitChange),
              type: profitChange >= 0 ? 'increase' : 'decrease',
              label: 'vs Aug',
            }}
            icon={<PieIcon className="w-5 h-5 text-purple-400" />}
            subtitle={`Previous: ${formatCurrency(previousMonthData.profit)}`}
          />

          <StatCard
            title="Design Jobs Volume"
            value={`${currentMonthData.jobs} Jobs`}
            change={{
              value: formatPercentage(jobsChange),
              type: jobsChange >= 0 ? 'increase' : 'decrease',
              label: 'vs Aug',
            }}
            icon={<Briefcase className="w-5 h-5 text-indigo-400" />}
            subtitle={`Previous: ${previousMonthData.jobs} Jobs`}
          />
        </div>
      </div>

      {/* Primary Analytics Charts */}
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-300 uppercase tracking-wider">
          Revenue & Expense Analytics
        </h3>
        <RevenueOverviewChart />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueVsExpensesChart />
          <CategoryPieChart />
        </div>
      </div>

      {/* Staff Earnings & Productivity Analytics Section */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold text-white">Staff Earnings & Productivity Breakdown</h3>
          </div>
          <span className="text-xs text-slate-400">September 2026</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Top Revenue Generator</span>
            <p className="text-lg font-bold text-emerald-400 mt-1">Hiran (Rs. 80,000)</p>
            <p className="text-[11px] text-slate-400 mt-0.5">48 Completed Jobs</p>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Highest Job Volume</span>
            <p className="text-lg font-bold text-purple-400 mt-1">Hiran & Chalani</p>
            <p className="text-[11px] text-slate-400 mt-0.5">90 Combined Designs</p>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
            <span className="text-xs text-slate-400 font-medium">Avg Staff Earnings</span>
            <p className="text-lg font-bold text-indigo-400 mt-1">Rs. 23,000 / month</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Basic + Commission</p>
          </div>
        </div>
      </div>
    </div>
  );
};
