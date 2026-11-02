import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { DailyIncomeRecord, StaffMember } from '../../types';
import { formatCurrency, formatDate, formatMonth } from '../../utils/formatters';
import {
  Calendar,
  DollarSign,
  Briefcase,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Download,
  Award,
  ArrowRight,
  Sparkles,
  Users,
} from 'lucide-react';
import { StatCard } from '../ui/StatCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Table, type Column } from '../ui/Table';

interface MonthlyIncomeViewProps {
  dailyIncomeList: DailyIncomeRecord[];
  staffList?: StaffMember[];
  selectedMonth: string; // 'all' or 'YYYY-MM'
  onSelectMonth: (month: string) => void;
  onEditIncome?: (item: DailyIncomeRecord) => void;
}

interface MonthSummary {
  monthKey: string; // 'YYYY-MM'
  monthLabel: string; // 'March 2026'
  totalIncome: number;
  totalJobs: number;
  activeDaysCount: number;
  avgDailyIncome: number;
  topStaffName: string;
  topStaffRevenue: number;
  recordsCount: number;
}

interface StaffContribution {
  staffId: string;
  staffName: string;
  jobsCount: number;
  totalIncome: number;
  percentage: number;
}

interface IncomeChartPoint {
  label: string;
  revenue: number;
  jobs: number;
  fullLabel: string;
  dateStr: string;
}

export const MonthlyIncomeView: React.FC<MonthlyIncomeViewProps> = ({
  dailyIncomeList,
  selectedMonth,
  onSelectMonth,
}) => {
  const currentMonthKey = new Date().toISOString().substring(0, 7);

  // 1. Get all unique months present in data + ensure current month is present
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    set.add(currentMonthKey);
    dailyIncomeList.forEach((item) => {
      if (item.date && item.date.length >= 7) {
        set.add(item.date.substring(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [dailyIncomeList, currentMonthKey]);

  // 2. Compute aggregate summary for each month
  const monthsSummaryList = useMemo<MonthSummary[]>(() => {
    return availableMonths.map((mKey) => {
      const monthRecords = dailyIncomeList.filter((item) => item.date.startsWith(mKey));
      const totalIncome = monthRecords.reduce((sum, item) => sum + item.dailyTotal, 0);
      const totalJobs = monthRecords.reduce((sum, item) => sum + item.jobsCount, 0);

      // Distinct days with recorded income
      const distinctDays = new Set(monthRecords.map((r) => r.date));
      const activeDaysCount = distinctDays.size;
      const avgDailyIncome = activeDaysCount > 0 ? Math.round(totalIncome / activeDaysCount) : 0;

      // Find top staff for this month
      const staffTotals: Record<string, { name: string; total: number }> = {};
      monthRecords.forEach((r) => {
        const sid = r.staffId || r.staffName;
        if (!staffTotals[sid]) {
          staffTotals[sid] = { name: r.staffName, total: 0 };
        }
        staffTotals[sid].total += r.dailyTotal;
      });

      let topStaffName = 'None';
      let topStaffRevenue = 0;
      Object.values(staffTotals).forEach((st) => {
        if (st.total > topStaffRevenue) {
          topStaffRevenue = st.total;
          topStaffName = st.name;
        }
      });

      return {
        monthKey: mKey,
        monthLabel: formatMonth(mKey),
        totalIncome,
        totalJobs,
        activeDaysCount,
        avgDailyIncome,
        topStaffName,
        topStaffRevenue,
        recordsCount: monthRecords.length,
      };
    });
  }, [availableMonths, dailyIncomeList]);

  // 3. Records for the active selection
  const activeMonthRecords = useMemo(() => {
    if (selectedMonth === 'all') {
      return dailyIncomeList;
    }
    return dailyIncomeList.filter((item) => item.date.startsWith(selectedMonth));
  }, [dailyIncomeList, selectedMonth]);

  // 4. Metrics for active selection
  const selectedMonthSummary = useMemo(() => {
    if (selectedMonth === 'all') {
      const totalIncome = dailyIncomeList.reduce((sum, item) => sum + item.dailyTotal, 0);
      const totalJobs = dailyIncomeList.reduce((sum, item) => sum + item.jobsCount, 0);
      const distinctDays = new Set(dailyIncomeList.map((r) => r.date));
      return {
        totalIncome,
        totalJobs,
        activeDaysCount: distinctDays.size,
        avgDailyIncome: distinctDays.size > 0 ? Math.round(totalIncome / distinctDays.size) : 0,
        highestDay: { date: 'N/A', amount: 0 },
      };
    }

    const totalIncome = activeMonthRecords.reduce((sum, item) => sum + item.dailyTotal, 0);
    const totalJobs = activeMonthRecords.reduce((sum, item) => sum + item.jobsCount, 0);
    const distinctDays = new Set(activeMonthRecords.map((r) => r.date));

    // Daily totals to find highest revenue day
    const dayTotals: Record<string, number> = {};
    activeMonthRecords.forEach((r) => {
      dayTotals[r.date] = (dayTotals[r.date] || 0) + r.dailyTotal;
    });

    let highestDay = { date: '', amount: 0 };
    Object.entries(dayTotals).forEach(([date, amt]) => {
      if (amt > highestDay.amount) {
        highestDay = { date, amount: amt };
      }
    });

    return {
      totalIncome,
      totalJobs,
      activeDaysCount: distinctDays.size,
      avgDailyIncome: distinctDays.size > 0 ? Math.round(totalIncome / distinctDays.size) : 0,
      highestDay,
    };
  }, [dailyIncomeList, activeMonthRecords, selectedMonth]);

  // 5. Staff contribution breakdown for selected month
  const staffContributions = useMemo<StaffContribution[]>(() => {
    const map: Record<string, { staffId: string; staffName: string; jobsCount: number; totalIncome: number }> = {};

    activeMonthRecords.forEach((r) => {
      const key = r.staffId || r.staffName;
      if (!map[key]) {
        map[key] = {
          staffId: r.staffId,
          staffName: r.staffName,
          jobsCount: 0,
          totalIncome: 0,
        };
      }
      map[key].jobsCount += r.jobsCount;
      map[key].totalIncome += r.dailyTotal;
    });

    const totalRevenue = selectedMonthSummary.totalIncome || 1;
    return Object.values(map)
      .map((item) => ({
        ...item,
        percentage: Number(((item.totalIncome / totalRevenue) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.totalIncome - a.totalIncome);
  }, [activeMonthRecords, selectedMonthSummary.totalIncome]);

  // 6. Day-by-day chart data for the selected month
  const dailyChartData = useMemo<IncomeChartPoint[]>(() => {
    if (selectedMonth === 'all') {
      // If 'all', show monthly totals trend
      return monthsSummaryList
        .slice()
        .reverse()
        .map((m) => ({
          label: m.monthLabel.split(' ')[0], // Month name short
          revenue: m.totalIncome,
          jobs: m.totalJobs,
          fullLabel: m.monthLabel,
          dateStr: m.monthKey,
        }));
    }

    // Single month: breakdown by day of the month
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const daysInMonth = new Date(year, month, 0).getDate();

    const data: IncomeChartPoint[] = [];
    const recordsMap: Record<string, { revenue: number; jobs: number }> = {};

    activeMonthRecords.forEach((r) => {
      if (!recordsMap[r.date]) {
        recordsMap[r.date] = { revenue: 0, jobs: 0 };
      }
      recordsMap[r.date].revenue += r.dailyTotal;
      recordsMap[r.date].jobs += r.jobsCount;
    });

    for (let day = 1; day <= daysInMonth; day++) {
      const dayStr = day < 10 ? `0${day}` : `${day}`;
      const monthPadded = month < 10 ? `0${month}` : `${month}`;
      const dateKey = `${year}-${monthPadded}-${dayStr}`;

      const rec = recordsMap[dateKey] || { revenue: 0, jobs: 0 };
      data.push({
        label: `${day}`,
        revenue: rec.revenue,
        jobs: rec.jobs,
        fullLabel: `${formatMonth(selectedMonth)} ${day}`,
        dateStr: dateKey,
      });
    }

    return data;
  }, [selectedMonth, activeMonthRecords, monthsSummaryList]);

  // Navigation helpers (Previous / Next month)
  const handlePrevMonth = () => {
    if (selectedMonth === 'all') {
      onSelectMonth(availableMonths[0] || currentMonthKey);
      return;
    }
    const [year, month] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    const prevKey = prevDate.toISOString().substring(0, 7);
    onSelectMonth(prevKey);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 'all') {
      onSelectMonth(availableMonths[0] || currentMonthKey);
      return;
    }
    const [year, month] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(year, month, 1);
    const nextKey = nextDate.toISOString().substring(0, 7);
    onSelectMonth(nextKey);
  };

  // Export CSV for this month
  const handleExportMonthCSV = () => {
    const filename = `monthly_income_${selectedMonth}.csv`;
    const headers = ['Date', 'Staff Name', 'Jobs Count', 'Daily Total (Rs.)', 'Notes'];
    const rows = activeMonthRecords.map((r) => [
      r.date,
      `"${r.staffName.replace(/"/g, '""')}"`,
      r.jobsCount,
      r.dailyTotal,
      `"${(r.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Columns for All Months Summary Table
  const monthColumns: Column<MonthSummary>[] = [
    {
      header: 'Month & Year',
      accessor: (row) => (
        <div className="flex items-center gap-2.5 font-bold text-slate-900">
          <div className="p-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="block text-sm font-black">{row.monthLabel}</span>
            <span className="text-[11px] text-slate-500 font-medium">
              {row.activeDaysCount} active recorded days
            </span>
          </div>
          {row.monthKey === currentMonthKey && (
            <span className="ml-1 px-2 py-0.5 text-[10px] bg-teal-100 text-teal-800 rounded-full font-extrabold uppercase">
              Current
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Total Income (Rs.)',
      accessor: (row) => (
        <span className="font-extrabold text-emerald-600 text-base">
          {formatCurrency(row.totalIncome)}
        </span>
      ),
    },
    {
      header: 'Jobs Completed',
      accessor: (row) => (
        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200">
          {row.totalJobs} Jobs
        </span>
      ),
    },
    {
      header: 'Daily Average',
      accessor: (row) => (
        <span className="font-bold text-slate-800 text-xs">
          {formatCurrency(row.avgDailyIncome)} / day
        </span>
      ),
    },
    {
      header: 'Top Contributor',
      accessor: (row) => (
        <div className="text-xs">
          <span className="font-bold text-slate-900 block">{row.topStaffName}</span>
          {row.topStaffRevenue > 0 && (
            <span className="text-teal-600 font-medium text-[11px]">
              {formatCurrency(row.topStaffRevenue)}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Action',
      accessor: (row) => (
        <Button
          variant={selectedMonth === row.monthKey ? 'primary' : 'outline'}
          size="sm"
          onClick={() => onSelectMonth(row.monthKey)}
          icon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          {selectedMonth === row.monthKey ? 'Selected' : 'View Month'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Month Selector & Control Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-600 font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Admin Monthly Income Breakdown</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>
              {selectedMonth === 'all'
                ? 'All Months (Lifetime Summary)'
                : formatMonth(selectedMonth)}
            </span>
            {selectedMonth === currentMonthKey && (
              <Badge variant="success">Current Month</Badge>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Select any month to inspect individual monthly revenue, job volume, and staff performance.
          </p>
        </div>

        {/* Month Selector Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Previous / Next Month Navigation */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-600 hover:text-teal-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-600 hover:text-teal-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Month Dropdown */}
          <div className="relative">
            <select
              value={selectedMonth}
              onChange={(e) => onSelectMonth(e.target.value)}
              className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer pr-8 appearance-none"
            >
              <option value="all">📊 All Months (Overview)</option>
              {availableMonths.map((mKey) => (
                <option key={mKey} value={mKey}>
                  📅 {formatMonth(mKey)} {mKey === currentMonthKey ? '(Current)' : ''}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
              ▼
            </div>
          </div>

          {/* HTML5 Month Picker for direct Jump */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <input
              type="month"
              value={selectedMonth === 'all' ? currentMonthKey : selectedMonth}
              onChange={(e) => {
                if (e.target.value) {
                  onSelectMonth(e.target.value);
                }
              }}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              title="Pick any month directly"
            />
          </div>

          {/* Current Month Quick Button */}
          <Button
            variant={selectedMonth === currentMonthKey ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onSelectMonth(currentMonthKey)}
          >
            This Month
          </Button>

          {/* Export CSV for Selected Month */}
          {activeMonthRecords.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportMonthCSV}
              icon={<Download className="w-3.5 h-3.5 text-teal-600" />}
            >
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* 2. Metric Highlights for the Selected Month */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={selectedMonth === 'all' ? 'Lifetime Total Income' : `${formatMonth(selectedMonth)} Income`}
          value={formatCurrency(selectedMonthSummary.totalIncome)}
          subtitle={
            selectedMonth === 'all'
              ? 'Sum across all recorded time'
              : `${activeMonthRecords.length} entries recorded in ${formatMonth(selectedMonth)}`
          }
          icon={<DollarSign className="w-6 h-6 text-emerald-600" />}
          badgeText="Gross Revenue"
        />

        <StatCard
          title="Jobs Completed"
          value={`${selectedMonthSummary.totalJobs} Jobs`}
          subtitle={
            selectedMonth === 'all'
              ? 'Total graphic design jobs logged'
              : `Completed jobs in ${formatMonth(selectedMonth)}`
          }
          icon={<Briefcase className="w-6 h-6 text-teal-600" />}
          badgeText="Work Volume"
        />

        <StatCard
          title="Daily Average Income"
          value={formatCurrency(selectedMonthSummary.avgDailyIncome)}
          subtitle={
            selectedMonthSummary.activeDaysCount > 0
              ? `Calculated over ${selectedMonthSummary.activeDaysCount} active days`
              : 'No recorded days yet'
          }
          icon={<TrendingUp className="w-6 h-6 text-cyan-600" />}
          badgeText="Daily Pace"
        />

        <StatCard
          title={selectedMonth === 'all' ? 'Active Months' : 'Peak Day Revenue'}
          value={
            selectedMonth === 'all'
              ? `${availableMonths.length} Months`
              : selectedMonthSummary.highestDay.amount > 0
              ? formatCurrency(selectedMonthSummary.highestDay.amount)
              : 'Rs. 0'
          }
          subtitle={
            selectedMonth === 'all'
              ? 'Months with recorded earnings'
              : selectedMonthSummary.highestDay.date
              ? `Achieved on ${formatDate(selectedMonthSummary.highestDay.date)}`
              : 'No income days recorded'
          }
          icon={<Award className="w-6 h-6 text-amber-500" />}
          badgeText={selectedMonth === 'all' ? 'Timespan' : 'Top Day'}
        />
      </div>

      {/* 3. Visual Day-by-Day Revenue Chart for Selected Month */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {selectedMonth === 'all'
                ? 'Month-by-Month Income Trend'
                : `${formatMonth(selectedMonth)} — Daily Income Progression`}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {selectedMonth === 'all'
                ? 'Historical overview of revenue generated each month'
                : 'Day-by-day revenue generated across the month'}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 font-bold text-slate-600">
              <span className="w-3 h-3 rounded-md bg-teal-500 inline-block" />
              Daily Revenue (Rs.)
            </span>
          </div>
        </div>

        {dailyChartData.length > 0 ? (
          <div className="w-full h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="label"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickFormatter={(val) => `Rs. ${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value || 0)), 'Revenue']}
                  labelFormatter={(label: any) =>
                    selectedMonth === 'all'
                      ? `Month: ${label}`
                      : `Date: ${formatMonth(selectedMonth)} ${label}`
                  }
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    fontWeight: 700,
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="revenue" fill="#14b8a6" radius={[6, 6, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs font-medium">
            No income recorded for this period.
          </div>
        )}
      </div>

      {/* 4. Staff Contribution Breakdown for the Selected Month */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Staff Income Share</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedMonth === 'all' ? 'All-time contribution' : `For ${formatMonth(selectedMonth)}`}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {staffContributions.length} Contributors
              </span>
            </div>

            {staffContributions.length > 0 ? (
              <div className="space-y-4 mt-4">
                {staffContributions.map((st, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                      <span className="truncate max-w-[150px]">{st.staffName}</span>
                      <span className="text-emerald-600">{formatCurrency(st.totalIncome)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2">
                      <span>{st.jobsCount} Jobs completed</span>
                      <span className="font-extrabold text-teal-700">{st.percentage}% share</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(5, st.percentage))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                No staff entries logged for this month.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Total Month Volume:</span>
            <span className="font-extrabold text-slate-900">
              {formatCurrency(selectedMonthSummary.totalIncome)}
            </span>
          </div>
        </div>

        {/* 5. Month-by-Month Aggregate Comparison Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">All Months Overview</h3>
              <p className="text-xs text-slate-500 font-medium">
                Click any month to inspect its income separately
              </p>
            </div>
            <Button
              variant={selectedMonth === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => onSelectMonth('all')}
            >
              {selectedMonth === 'all' ? 'Viewing All Months' : 'View All Months'}
            </Button>
          </div>

          <Table
            columns={monthColumns}
            data={monthsSummaryList}
            keyExtractor={(row) => row.monthKey}
            emptyMessage="No monthly income records found."
          />
        </div>
      </div>
    </div>
  );
};
