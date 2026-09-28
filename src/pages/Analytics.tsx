import React, { useState, useMemo } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { RevenueOverviewChart } from '../components/charts/RevenueOverviewChart';
import { RevenueVsExpensesChart } from '../components/charts/RevenueVsExpensesChart';
import { CategoryPieChart } from '../components/charts/CategoryPieChart';
import { StatCard } from '../components/ui/StatCard';
import { Table, type Column } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import {
  TrendingUp,
  CreditCard,
  PieChart as PieIcon,
  Filter,
  BarChart3,
  Briefcase,
  Users,
  Award,
  Wallet,
  Calendar,
} from 'lucide-react';

export const Analytics: React.FC = () => {
  const { dailyIncomeList, expenseList, salaryList, staffList } = useApp();

  const [dateFilter, setDateFilter] = useState<
    'thisMonth' | 'lastMonth' | 'last3Months' | 'last6Months' | 'thisYear' | 'custom'
  >('thisMonth');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const now = new Date();
  const currentMonthStr = now.toISOString().substring(0, 7); // YYYY-MM

  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthStr = prevMonthDate.toISOString().substring(0, 7);

  // Filter helper based on date range
  const isDateInRange = (dateStr: string) => {
    if (!dateStr) return false;
    const targetDate = new Date(dateStr);

    if (dateFilter === 'thisMonth') {
      return dateStr.startsWith(currentMonthStr);
    }
    if (dateFilter === 'lastMonth') {
      return dateStr.startsWith(prevMonthStr);
    }
    if (dateFilter === 'last3Months') {
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      return targetDate >= threeMonthsAgo && targetDate <= now;
    }
    if (dateFilter === 'last6Months') {
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      return targetDate >= sixMonthsAgo && targetDate <= now;
    }
    if (dateFilter === 'thisYear') {
      return dateStr.startsWith(now.getFullYear().toString());
    }
    if (dateFilter === 'custom') {
      if (startDate && targetDate < new Date(startDate)) return false;
      if (endDate && targetDate > new Date(endDate)) return false;
      return true;
    }
    return true;
  };

  // Filtered income & expense lists
  const filteredIncome = useMemo(
    () => dailyIncomeList.filter((item) => isDateInRange(item.date)),
    [dailyIncomeList, dateFilter, startDate, endDate]
  );

  const filteredExpenses = useMemo(
    () => expenseList.filter((item) => isDateInRange(item.date)),
    [expenseList, dateFilter, startDate, endDate]
  );

  // --- REVENUE, EXPENSE & PROFIT METRICS ---
  const totalRevenue = useMemo(
    () => filteredIncome.reduce((sum, item) => sum + item.dailyTotal, 0),
    [filteredIncome]
  );

  const totalExpenses = useMemo(
    () => filteredExpenses.reduce((sum, item) => sum + item.amount, 0),
    [filteredExpenses]
  );

  const netProfit = totalRevenue - totalExpenses;

  const totalJobsCount = useMemo(
    () => filteredIncome.reduce((sum, item) => sum + item.jobsCount, 0),
    [filteredIncome]
  );

  // --- MONTH-TO-MONTH COMPARISON METRICS (Current Month vs Previous Month) ---
  const curMonthInc = useMemo(
    () =>
      dailyIncomeList
        .filter((item) => item.date.startsWith(currentMonthStr))
        .reduce((sum, item) => sum + item.dailyTotal, 0),
    [dailyIncomeList, currentMonthStr]
  );

  const prevMonthInc = useMemo(
    () =>
      dailyIncomeList
        .filter((item) => item.date.startsWith(prevMonthStr))
        .reduce((sum, item) => sum + item.dailyTotal, 0),
    [dailyIncomeList, prevMonthStr]
  );

  const curMonthExp = useMemo(
    () =>
      expenseList
        .filter((item) => item.date.startsWith(currentMonthStr))
        .reduce((sum, item) => sum + item.amount, 0),
    [expenseList, currentMonthStr]
  );

  const prevMonthExp = useMemo(
    () =>
      expenseList
        .filter((item) => item.date.startsWith(prevMonthStr))
        .reduce((sum, item) => sum + item.amount, 0),
    [expenseList, prevMonthStr]
  );

  const curMonthProfit = curMonthInc - curMonthExp;
  const prevMonthProfit = prevMonthInc - prevMonthExp;

  const curMonthJobs = useMemo(
    () =>
      dailyIncomeList
        .filter((item) => item.date.startsWith(currentMonthStr))
        .reduce((sum, item) => sum + item.jobsCount, 0),
    [dailyIncomeList, currentMonthStr]
  );

  const prevMonthJobs = useMemo(
    () =>
      dailyIncomeList
        .filter((item) => item.date.startsWith(prevMonthStr))
        .reduce((sum, item) => sum + item.jobsCount, 0),
    [dailyIncomeList, prevMonthStr]
  );

  // Safe percentage change calculation avoiding NaN & Infinity
  const calcPctChange = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / Math.abs(prev)) * 100;
  };

  const revChangePct = calcPctChange(curMonthInc, prevMonthInc);
  const expChangePct = calcPctChange(curMonthExp, prevMonthExp);
  const profitChangePct = calcPctChange(curMonthProfit, prevMonthProfit);
  const jobsChangePct = calcPctChange(curMonthJobs, prevMonthJobs);

  // --- STAFF PERFORMANCE ANALYTICS (Staff Name, Jobs Completed, Revenue Generated) ---
  const staffPerformanceData = useMemo(() => {
    return staffList.map((stf) => {
      const stfIncome = dailyIncomeList.filter((inc) => inc.staffId === stf.id);
      const jobs = stfIncome.reduce((sum, inc) => sum + inc.jobsCount, 0);
      const revenue = stfIncome.reduce((sum, inc) => sum + inc.dailyTotal, 0);

      return {
        id: stf.id,
        name: stf.name,
        role: stf.role,
        jobsCompleted: jobs,
        revenueGenerated: revenue,
        status: stf.status,
      };
    });
  }, [staffList, dailyIncomeList]);

  // --- STAFF SALARY ANALYTICS (Basic, Bonus, Commission, Deductions, Final Salary, Status) ---
  const staffSalaryData = useMemo(() => {
    return salaryList.map((sal) => ({
      id: sal.id,
      staffName: sal.staffName,
      month: sal.month,
      basicSalary: sal.basicSalary,
      bonus: sal.bonus,
      commission: sal.commission,
      otherPayments: sal.otherPayments || 0,
      deductions: sal.deductions,
      finalSalary: sal.finalSalary,
      paymentStatus: sal.paymentStatus,
    }));
  }, [salaryList]);

  const staffPerfColumns: Column<(typeof staffPerformanceData)[0]>[] = [
    {
      header: 'Staff Member',
      accessor: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.name}</p>
          <span className="text-[11px] text-teal-600 font-bold">{row.role}</span>
        </div>
      ),
    },
    {
      header: 'Jobs Completed',
      accessor: (row) => (
        <span className="font-extrabold text-teal-700">{row.jobsCompleted} Jobs</span>
      ),
    },
    {
      header: 'Revenue Generated for Business',
      accessor: (row) => (
        <span className="font-extrabold text-emerald-600 text-base">
          {formatCurrency(row.revenueGenerated)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'neutral'}>{row.status}</Badge>
      ),
    },
  ];

  const staffSalaryColumns: Column<(typeof staffSalaryData)[0]>[] = [
    {
      header: 'Staff Member',
      accessor: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.staffName}</p>
          <span className="text-[11px] text-teal-600 font-bold">{row.month}</span>
        </div>
      ),
    },
    {
      header: 'Basic Salary',
      accessor: (row) => <span className="font-bold text-slate-900">{formatCurrency(row.basicSalary)}</span>,
    },
    {
      header: 'Bonus',
      accessor: (row) => <span className="text-emerald-600 font-bold">+{formatCurrency(row.bonus)}</span>,
    },
    {
      header: 'Commission',
      accessor: (row) => <span className="text-teal-600 font-bold">+{formatCurrency(row.commission)}</span>,
    },
    {
      header: 'Other Payments',
      accessor: (row) => <span className="text-cyan-600 font-bold">+{formatCurrency(row.otherPayments)}</span>,
    },
    {
      header: 'Deductions',
      accessor: (row) => <span className="text-rose-600 font-bold">-{formatCurrency(row.deductions)}</span>,
    },
    {
      header: 'Final Salary Payout',
      accessor: (row) => (
        <span className="font-extrabold text-emerald-600 text-base">
          {formatCurrency(row.finalSalary)}
        </span>
      ),
    },
    {
      header: 'Payment Status',
      accessor: (row) => (
        <Badge
          variant={
            row.paymentStatus === 'Paid'
              ? 'success'
              : row.paymentStatus === 'Processing' || row.paymentStatus === 'Partial'
              ? 'purple'
              : 'warning'
          }
        >
          {row.paymentStatus}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Analytics & Business Intelligence"
        subtitle="Real-time insights on revenue, expenses, net profit, staff performance & salary analytics"
        action={
          <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 p-2 rounded-2xl shadow-xs">
            <Filter className="w-4 h-4 text-teal-600 ml-1" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none pr-2 cursor-pointer"
            >
              <option value="thisMonth" className="bg-white">This Month</option>
              <option value="lastMonth" className="bg-white">Last Month</option>
              <option value="last3Months" className="bg-white">Last 3 Months</option>
              <option value="last6Months" className="bg-white">Last 6 Months</option>
              <option value="thisYear" className="bg-white">This Year ({now.getFullYear()})</option>
              <option value="custom" className="bg-white">Custom Date Range</option>
            </select>

            {dateFilter === 'custom' && (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-lg px-2 py-1"
                />
                <span className="text-xs text-slate-500 font-medium">to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-lg px-2 py-1"
                />
              </div>
            )}
          </div>
        }
      />

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Period Revenue"
          value={formatCurrency(totalRevenue)}
          subtitle={`${filteredIncome.length} Revenue Records`}
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          badgeText="Total Income"
        />

        <StatCard
          title="Period Expenses"
          value={formatCurrency(totalExpenses)}
          subtitle={`${filteredExpenses.length} Expense Records`}
          icon={<CreditCard className="w-5 h-5 text-rose-600" />}
          badgeText="Operating Costs"
        />

        <StatCard
          title="Net Profit"
          value={formatCurrency(netProfit)}
          subtitle="Revenue - Expenses"
          icon={<PieIcon className="w-5 h-5 text-teal-600" />}
          badgeText="Net Margin"
        />

        <StatCard
          title="Design Jobs Volume"
          value={`${totalJobsCount} Jobs`}
          subtitle="Completed in period"
          icon={<Briefcase className="w-5 h-5 text-cyan-600" />}
          badgeText="Volume"
        />
      </div>

      {/* Month-to-Month Comparison Section (Req 4) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-600" />
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Month-to-Month Performance Comparison
            </h3>
          </div>
          <span className="text-xs text-teal-700 font-bold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Current vs Previous Month
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <StatCard
            title="Revenue Growth"
            value={formatCurrency(curMonthInc)}
            change={{
              value: formatPercentage(revChangePct),
              type: revChangePct >= 0 ? 'increase' : 'decrease',
              label: 'vs Last Month',
            }}
            icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
            subtitle={`Prev Month: ${formatCurrency(prevMonthInc)}`}
          />

          <StatCard
            title="Expense Comparison"
            value={formatCurrency(curMonthExp)}
            change={{
              value: formatPercentage(expChangePct),
              type: expChangePct <= 0 ? 'increase' : 'decrease',
              label: 'vs Last Month',
            }}
            icon={<CreditCard className="w-5 h-5 text-rose-600" />}
            subtitle={`Prev Month: ${formatCurrency(prevMonthExp)}`}
          />

          <StatCard
            title="Net Profit Margin"
            value={formatCurrency(curMonthProfit)}
            change={{
              value: formatPercentage(profitChangePct),
              type: profitChangePct >= 0 ? 'increase' : 'decrease',
              label: 'vs Last Month',
            }}
            icon={<PieIcon className="w-5 h-5 text-teal-600" />}
            subtitle={`Prev Month: ${formatCurrency(prevMonthProfit)}`}
          />

          <StatCard
            title="Job Volume Change"
            value={`${curMonthJobs} Jobs`}
            change={{
              value: formatPercentage(jobsChangePct),
              type: jobsChangePct >= 0 ? 'increase' : 'decrease',
              label: 'vs Last Month',
            }}
            icon={<Briefcase className="w-5 h-5 text-cyan-600" />}
            subtitle={`Prev Month: ${prevMonthJobs} Jobs`}
          />
        </div>
      </div>

      {/* Primary Analytics Charts (Req 5, 6, 7) */}
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-600 uppercase tracking-wider">
          Revenue & Expense Analytics Charts
        </h3>
        <RevenueOverviewChart />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueVsExpensesChart />
          <CategoryPieChart />
        </div>
      </div>

      {/* Staff Performance Analytics (Req 8) */}
      <div className="space-y-4">
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-start gap-3">
          <Award className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
          <div className="text-xs text-teal-900">
            <strong className="block text-sm font-bold text-slate-900 mb-0.5">
              Financial Separation Notice
            </strong>
            <p>
              <strong>Staff Revenue Generated</strong> reflects total gross income produced by each designer for Graphic Mahagedara.<br />
              <strong>Staff Salary Payout</strong> reflects actual compensation disbursements and earnings.
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              <h3 className="text-base font-bold text-slate-900">Staff Job Performance Analytics</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">Calculated from public.daily_income</span>
          </div>

          <Table
            columns={staffPerfColumns}
            data={staffPerformanceData}
            keyExtractor={(row) => row.id}
            emptyMessage="No staff performance records available."
          />
        </div>
      </div>

      {/* Staff Salary Analytics (Req 9) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">Staff Payroll & Salary Analytics</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Calculated from public.salary_payments</span>
        </div>

        <Table
          columns={staffSalaryColumns}
          data={staffSalaryData}
          keyExtractor={(row) => row.id}
          emptyMessage="No salary payment analytics recorded yet."
        />
      </div>
    </div>
  );
};
