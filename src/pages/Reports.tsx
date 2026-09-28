import React, { useState, useMemo } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Table, type Column } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { StatCard } from '../components/ui/StatCard';
import { useApp } from '../context/AppContext';
import { expenseCategories } from '../components/forms/AddExpenseModal';
import { formatCurrency, formatDate } from '../utils/formatters';
import type { DailyIncomeRecord, ExpenseRecord, SalaryRecord } from '../types';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  User,
  Tag,
  Sparkles,
  Search,
  TrendingUp,
  CreditCard,
  PieChart,
  Briefcase,
  Wallet,
  CheckCircle,
  Clock,
  Award,
} from 'lucide-react';

export const Reports: React.FC = () => {
  const { dailyIncomeList, expenseList, salaryList, staffList, addToast } = useApp();

  const [datePreset, setDatePreset] = useState<string>('thisMonth');
  const [customFrom, setCustomFrom] = useState<string>('');
  const [customTo, setCustomTo] = useState<string>('');
  const [selectedStaff, setSelectedStaff] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeReport, setActiveReport] = useState<string>('Daily Income Report');

  const reportTypes = [
    { title: 'Daily Income Report', desc: 'Detailed log of daily revenue submissions & jobs by staff' },
    { title: 'Expense Report', desc: 'Categorized operational costs, ad boosts, bills & equipment' },
    { title: 'Profit Report', desc: 'Net profit margins & revenue-to-expense financial balance' },
    { title: 'Staff Performance Report', desc: 'Staff job completion volume vs gross revenue generated' },
    { title: 'Salary Report', desc: 'Staff payroll disbursement audit, bonus & deduction history' },
  ];

  // Helper date filter matching
  const filterByDate = (dateStr: string) => {
    if (!dateStr) return false;
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (datePreset === 'today') {
      return dateStr === todayStr;
    }
    if (datePreset === 'thisWeek') {
      const dayOfWeek = now.getDay();
      const sunday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
      const target = new Date(dateStr);
      return target >= sunday && target <= now;
    }
    if (datePreset === 'thisMonth') {
      return dateStr.startsWith(now.toISOString().substring(0, 7));
    }
    if (datePreset === 'lastMonth') {
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthPrefix = lastMonthDate.toISOString().substring(0, 7);
      return dateStr.startsWith(lastMonthPrefix);
    }
    if (datePreset === 'last3Months') {
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const target = new Date(dateStr);
      return target >= threeMonthsAgo && target <= now;
    }
    if (datePreset === 'thisYear') {
      return dateStr.startsWith(now.getFullYear().toString());
    }
    if (datePreset === 'custom') {
      if (customFrom && new Date(dateStr) < new Date(customFrom)) return false;
      if (customTo && new Date(dateStr) > new Date(customTo)) return false;
      return true;
    }
    return true;
  };

  // 1. Filtered Daily Income Data
  const filteredDailyIncome = useMemo(() => {
    return dailyIncomeList.filter((item) => {
      if (!filterByDate(item.date)) return false;
      if (selectedStaff !== 'ALL' && item.staffId !== selectedStaff) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesStaff = item.staffName.toLowerCase().includes(q);
        const matchesNotes = (item.notes || '').toLowerCase().includes(q);
        const matchesDate = item.date.includes(q);
        if (!matchesStaff && !matchesNotes && !matchesDate) return false;
      }
      return true;
    });
  }, [dailyIncomeList, datePreset, customFrom, customTo, selectedStaff, searchQuery]);

  // 2. Filtered Expenses Data
  const filteredExpenses = useMemo(() => {
    return expenseList.filter((item) => {
      if (!filterByDate(item.date)) return false;
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCat = item.category.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesPaidBy = item.paidBy.toLowerCase().includes(q);
        const matchesNotes = (item.notes || '').toLowerCase().includes(q);
        if (!matchesCat && !matchesDesc && !matchesPaidBy && !matchesNotes) return false;
      }
      return true;
    });
  }, [expenseList, datePreset, customFrom, customTo, selectedCategory, searchQuery]);

  // 3. Filtered Salaries Data
  const filteredSalaries = useMemo(() => {
    return salaryList.filter((item) => {
      if (item.paymentDate && !filterByDate(item.paymentDate)) return false;
      if (selectedStaff !== 'ALL' && item.staffId !== selectedStaff) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesStaff = item.staffName.toLowerCase().includes(q);
        const matchesMonth = item.month.toLowerCase().includes(q);
        const matchesStatus = item.paymentStatus.toLowerCase().includes(q);
        if (!matchesStaff && !matchesMonth && !matchesStatus) return false;
      }
      return true;
    });
  }, [salaryList, datePreset, customFrom, customTo, selectedStaff, searchQuery]);

  // Summaries calculation
  const totalReportRevenue = useMemo(
    () => filteredDailyIncome.reduce((sum, item) => sum + item.dailyTotal, 0),
    [filteredDailyIncome]
  );

  const totalReportJobs = useMemo(
    () => filteredDailyIncome.reduce((sum, item) => sum + item.jobsCount, 0),
    [filteredDailyIncome]
  );

  const totalReportExpenses = useMemo(
    () => filteredExpenses.reduce((sum, item) => sum + item.amount, 0),
    [filteredExpenses]
  );

  const netReportProfit = totalReportRevenue - totalReportExpenses;

  const totalSalaryPayout = useMemo(
    () => filteredSalaries.reduce((sum, item) => sum + item.finalSalary, 0),
    [filteredSalaries]
  );

  const paidSalaryPayout = useMemo(
    () =>
      filteredSalaries
        .filter((s) => s.paymentStatus === 'Paid')
        .reduce((sum, item) => sum + item.finalSalary, 0),
    [filteredSalaries]
  );

  const pendingSalaryPayout = useMemo(
    () =>
      filteredSalaries
        .filter((s) => s.paymentStatus !== 'Paid')
        .reduce((sum, item) => sum + item.finalSalary, 0),
    [filteredSalaries]
  );

  // Staff Performance Data (Grouped by staff_id)
  const staffPerformanceReportData = useMemo(() => {
    return staffList
      .filter((stf) => (selectedStaff !== 'ALL' ? stf.id === selectedStaff : true))
      .map((stf) => {
        const stfIncome = filteredDailyIncome.filter((inc) => inc.staffId === stf.id);
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
      })
      .filter((stf) => {
        if (!searchQuery.trim()) return true;
        return stf.name.toLowerCase().includes(searchQuery.toLowerCase());
      });
  }, [staffList, filteredDailyIncome, selectedStaff, searchQuery]);

  // Export CSV Handler
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = activeReport.toLowerCase().replace(/\s+/g, '_');

    if (activeReport === 'Daily Income Report') {
      headers = ['Date', 'Staff Name', 'Daily Total (Rs.)', 'Jobs Completed', 'Notes'];
      rows = filteredDailyIncome.map((item) => [
        item.date,
        item.staffName,
        item.dailyTotal,
        item.jobsCount,
        item.notes || '',
      ]);
    } else if (activeReport === 'Expense Report') {
      headers = ['Date', 'Category', 'Description', 'Amount (Rs.)', 'Paid By', 'Notes'];
      rows = filteredExpenses.map((item) => [
        item.date,
        item.category,
        item.description,
        item.amount,
        item.paidBy,
        item.notes || '',
      ]);
    } else if (activeReport === 'Profit Report') {
      headers = ['Report Period', 'Total Revenue (Rs.)', 'Total Expenses (Rs.)', 'Net Profit (Rs.)'];
      rows = [[datePreset, totalReportRevenue, totalReportExpenses, netReportProfit]];
    } else if (activeReport === 'Staff Performance Report') {
      headers = ['Staff Name', 'Role', 'Jobs Completed', 'Revenue Generated for Business (Rs.)'];
      rows = staffPerformanceReportData.map((item) => [
        item.name,
        item.role,
        item.jobsCompleted,
        item.revenueGenerated,
      ]);
    } else if (activeReport === 'Salary Report') {
      headers = [
        'Staff Name',
        'Salary Month',
        'Basic Salary (Rs.)',
        'Bonus',
        'Commission',
        'Other Payments',
        'Deductions',
        'Final Salary (Rs.)',
        'Payment Status',
        'Payment Date',
      ];
      rows = filteredSalaries.map((item) => [
        item.staffName,
        item.month,
        item.basicSalary,
        item.bonus,
        item.commission,
        item.otherPayments || 0,
        item.deductions,
        item.finalSalary,
        item.paymentStatus,
        item.paymentDate,
      ]);
    }

    if (rows.length === 0) {
      addToast({
        type: 'warning',
        title: 'Export Warning',
        message: 'No records available to export for the selected filter period.',
      });
      return;
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        headers.join(','),
        ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      type: 'success',
      title: 'CSV Export Complete',
      message: `Downloaded ${filename}.csv with ${rows.length} filtered records.`,
    });
  };

  const handleExportPDF = () => {
    addToast({
      type: 'info',
      title: 'Print Preview Ready',
      message: `Opening printable document view for ${activeReport}...`,
    });
    window.print();
  };

  const staffOptions = [
    { value: 'ALL', label: 'All Staff Members' },
    ...staffList.map((s) => ({ value: s.id, label: s.name })),
  ];

  const categoryOptions = [
    { value: 'ALL', label: 'All Expense Categories' },
    ...expenseCategories.map((c) => ({ value: c, label: c })),
  ];

  const presetOptions = [
    { value: 'today', label: 'Today' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'last3Months', label: 'Last 3 Months' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'custom', label: 'Custom Date Range' },
  ];

  // Table Columns Configurations
  const dailyIncomeColumns: Column<DailyIncomeRecord>[] = [
    { header: 'Date', accessor: (r) => formatDate(r.date) },
    { header: 'Staff Member', accessor: (r) => <span className="font-bold text-slate-900">{r.staffName}</span> },
    { header: 'Jobs Completed', accessor: (r) => <span className="font-bold text-teal-700">{r.jobsCount} Jobs</span> },
    { header: 'Daily Revenue', accessor: (r) => <span className="font-extrabold text-emerald-600">{formatCurrency(r.dailyTotal)}</span> },
    { header: 'Notes', accessor: (r) => <span className="text-xs text-slate-500 font-medium">{r.notes || '—'}</span> },
  ];

  const expenseColumns: Column<ExpenseRecord>[] = [
    { header: 'Date', accessor: (r) => formatDate(r.date) },
    { header: 'Category', accessor: (r) => <span className="font-bold text-teal-700">{r.category}</span> },
    { header: 'Description', accessor: (r) => <span className="text-slate-900 font-bold">{r.description}</span> },
    { header: 'Amount', accessor: (r) => <span className="font-bold text-rose-600">{formatCurrency(r.amount)}</span> },
    { header: 'Paid By', accessor: (r) => <span className="text-slate-700 font-medium">{r.paidBy}</span> },
    { header: 'Notes', accessor: (r) => <span className="text-xs text-slate-500 font-medium">{r.notes || '—'}</span> },
  ];

  const staffPerfColumns: Column<(typeof staffPerformanceReportData)[0]>[] = [
    { header: 'Staff Member', accessor: (r) => <span className="font-bold text-slate-900">{r.name}</span> },
    { header: 'Role', accessor: (r) => <span className="text-teal-600 font-bold">{r.role}</span> },
    { header: 'Jobs Completed', accessor: (r) => <span className="font-extrabold text-teal-700">{r.jobsCompleted} Jobs</span> },
    { header: 'Revenue Generated', accessor: (r) => <span className="font-extrabold text-emerald-600">{formatCurrency(r.revenueGenerated)}</span> },
  ];

  const salaryColumns: Column<SalaryRecord>[] = [
    { header: 'Staff Member', accessor: (r) => <span className="font-bold text-slate-900">{r.staffName}</span> },
    { header: 'Month', accessor: (r) => <span className="text-teal-600 font-bold">{r.month}</span> },
    { header: 'Basic Salary', accessor: (r) => formatCurrency(r.basicSalary) },
    { header: 'Bonus', accessor: (r) => <span className="text-emerald-600 font-bold">+{formatCurrency(r.bonus)}</span> },
    { header: 'Commission', accessor: (r) => <span className="text-teal-600 font-bold">+{formatCurrency(r.commission)}</span> },
    { header: 'Other', accessor: (r) => <span className="text-cyan-600 font-bold">+{formatCurrency(r.otherPayments || 0)}</span> },
    { header: 'Deductions', accessor: (r) => <span className="text-rose-600 font-bold">-{formatCurrency(r.deductions)}</span> },
    { header: 'Final Payout', accessor: (r) => <span className="font-extrabold text-emerald-600 text-base">{formatCurrency(r.finalSalary)}</span> },
    {
      header: 'Status',
      accessor: (r) => (
        <Badge
          variant={
            r.paymentStatus === 'Paid'
              ? 'success'
              : r.paymentStatus === 'Processing' || r.paymentStatus === 'Partial'
              ? 'purple'
              : 'warning'
          }
        >
          {r.paymentStatus}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Printable Header Notice */}
      <div className="hidden print:block text-center border-b border-slate-300 pb-4 mb-6">
        <h1 className="text-2xl font-black uppercase text-slate-900">Graphic Mahagedara</h1>
        <h2 className="text-lg font-bold text-teal-700">{activeReport}</h2>
        <p className="text-xs text-slate-600">
          Generated Date: {formatDate(new Date().toISOString().split('T')[0])} | Sri Lanka POS System
        </p>
      </div>

      <PageHeader
        title="Financial & Operational Reports"
        subtitle="Generate, preview and export custom business accounting reports directly from Supabase"
      />

      {/* Filter Control Bar */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4 no-print">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>Report Parameters & Real-time Database Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            label="Date Period Preset"
            options={presetOptions}
            value={datePreset}
            onChange={(e) => setDatePreset(e.target.value)}
            icon={<Calendar className="w-4 h-4 text-teal-600" />}
          />

          <Select
            label="Filter Staff"
            options={staffOptions}
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            icon={<User className="w-4 h-4 text-teal-600" />}
          />

          <Select
            label="Filter Expense Category"
            options={categoryOptions}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            icon={<Tag className="w-4 h-4 text-teal-600" />}
          />

          <Input
            label="Search Records"
            placeholder="Search staff, notes, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="w-4 h-4 text-teal-600" />}
          />
        </div>

        {datePreset === 'custom' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <Input
              label="Custom Date From"
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              icon={<Calendar className="w-4 h-4 text-teal-600" />}
            />

            <Input
              label="Custom Date To"
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              icon={<Calendar className="w-4 h-4 text-teal-600" />}
            />
          </div>
        )}
      </div>

      {/* Report Summary Cards (Req 8) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider no-print">
          Filtered Report Summary Cards
        </h3>

        {activeReport === 'Salary Report' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Total Salary Payout"
              value={formatCurrency(totalSalaryPayout)}
              subtitle={`${filteredSalaries.length} Salary Payments`}
              icon={<Wallet className="w-5 h-5 text-emerald-600" />}
              badgeText="Total Payroll"
            />
            <StatCard
              title="Paid Salaries"
              value={formatCurrency(paidSalaryPayout)}
              subtitle="Settled Disbursements"
              icon={<CheckCircle className="w-5 h-5 text-teal-600" />}
              badgeText="Disbursed"
            />
            <StatCard
              title="Pending Salaries"
              value={formatCurrency(pendingSalaryPayout)}
              subtitle="Unsettled Payroll"
              icon={<Clock className="w-5 h-5 text-amber-600" />}
              badgeText="Pending"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Filtered Revenue"
              value={formatCurrency(totalReportRevenue)}
              subtitle={`${filteredDailyIncome.length} Income Submissions`}
              icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
              badgeText="Gross Revenue"
            />

            <StatCard
              title="Filtered Expenses"
              value={formatCurrency(totalReportExpenses)}
              subtitle={`${filteredExpenses.length} Expenses Logged`}
              icon={<CreditCard className="w-5 h-5 text-rose-600" />}
              badgeText="Operating Costs"
            />

            <StatCard
              title="Filtered Net Profit"
              value={formatCurrency(netReportProfit)}
              subtitle="Revenue - Expenses"
              icon={<PieChart className="w-5 h-5 text-teal-600" />}
              badgeText="Net Margin"
            />

            <StatCard
              title="Filtered Jobs Volume"
              value={`${totalReportJobs} Jobs`}
              subtitle="Total Design Volume"
              icon={<Briefcase className="w-5 h-5 text-cyan-600" />}
              badgeText="Jobs"
            />
          </div>
        )}
      </div>

      {/* Report Selection Tabs / Cards */}
      <div className="space-y-3 no-print">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Select Standard Business Report
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((rep) => {
            const isSelected = activeReport === rep.title;
            return (
              <div
                key={rep.title}
                onClick={() => setActiveReport(rep.title)}
                className={`p-4 bg-white border rounded-2xl transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50/50 ring-1 ring-teal-500/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-teal-50 rounded-xl text-teal-600">
                      <FileText className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-teal-500 text-white rounded-md">
                        Active
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{rep.title}</h4>
                  <p className="text-xs text-slate-500 font-medium mt-1">{rep.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Report Main Container */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
              Real Supabase Report Output
            </span>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{activeReport}</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Graphic Mahagedara POS | Live Query Data
            </p>
          </div>

          <div className="flex items-center gap-3 no-print">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCSV}
              icon={<Download className="w-4 h-4" />}
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportPDF}
              icon={<Printer className="w-4 h-4" />}
            >
              Export PDF
            </Button>
          </div>
        </div>

        {/* 1. Daily Income Report */}
        {activeReport === 'Daily Income Report' && (
          <Table
            columns={dailyIncomeColumns}
            data={filteredDailyIncome}
            keyExtractor={(row) => row.id}
            emptyMessage="No records found for the selected period."
          />
        )}

        {/* 2. Expense Report */}
        {activeReport === 'Expense Report' && (
          <Table
            columns={expenseColumns}
            data={filteredExpenses}
            keyExtractor={(row) => row.id}
            emptyMessage="No records found for the selected period."
          />
        )}

        {/* 3. Profit Report */}
        {activeReport === 'Profit Report' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
              <div className="flex justify-between items-center text-slate-500 font-bold border-b border-slate-200 pb-2">
                <span>BUSINESS FINANCIAL METRIC</span>
                <span>SUPABASE AUDIT VALUE</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-700 font-medium">Total Filtered Income Submissions:</span>
                <span className="font-bold text-slate-900">{filteredDailyIncome.length} Records</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-700 font-medium">Total Gross Revenue (Sum of Daily Income):</span>
                <span className="font-bold text-emerald-600">{formatCurrency(totalReportRevenue)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-700 font-medium">Total Operating Expenses (Sum of Expenses):</span>
                <span className="font-bold text-rose-600">{formatCurrency(totalReportExpenses)}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-slate-200 pt-2 text-sm font-bold">
                <span className="text-teal-700">Net Business Profit (Revenue - Expenses):</span>
                <span className="text-emerald-600 font-black">{formatCurrency(netReportProfit)}</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. Staff Performance Report */}
        {activeReport === 'Staff Performance Report' && (
          <div className="space-y-4">
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center gap-2 text-xs text-teal-900">
              <Award className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                <strong>Notice:</strong> Staff Revenue Generated represents total job income produced for Graphic Mahagedara and is distinct from staff salary payouts.
              </span>
            </div>

            <Table
              columns={staffPerfColumns}
              data={staffPerformanceReportData}
              keyExtractor={(row) => row.id}
              emptyMessage="No records found for the selected period."
            />
          </div>
        )}

        {/* 5. Salary Report */}
        {activeReport === 'Salary Report' && (
          <Table
            columns={salaryColumns}
            data={filteredSalaries}
            keyExtractor={(row) => row.id}
            emptyMessage="No records found for the selected period."
          />
        )}
      </div>
    </div>
  );
};
