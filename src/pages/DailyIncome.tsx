import React, { useState, useMemo } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Table, type Column } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { AddIncomeModal } from '../components/forms/AddIncomeModal';
import { MonthlyIncomeView } from '../components/income/MonthlyIncomeView';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import type { DailyIncomeRecord } from '../types';
import { formatCurrency, formatDate, formatMonth } from '../utils/formatters';
import {
  Plus,
  Search,
  DollarSign,
  Calendar,
  Briefcase,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BarChart3,
  RotateCcw,
} from 'lucide-react';

interface DailyIncomeProps {
  initialTab?: 'daily' | 'monthly';
}

export const DailyIncome: React.FC<DailyIncomeProps> = ({ initialTab = 'daily' }) => {
  const { role, profile } = useAuth();
  if (role === 'Staff' && profile?.staffCategory === 'Graphic Designer') {
    return <Navigate to="/dashboard" replace />;
  }

  const isAdmin = role === 'Admin';
  const { dailyIncomeList, deleteDailyIncome, staffList } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();

  // Tab state: 'daily' or 'monthly'
  const paramTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>(
    paramTab === 'monthly' || initialTab === 'monthly' ? 'monthly' : 'daily'
  );

  const currentMonthKey = new Date().toISOString().substring(0, 7);
  const paramMonth = searchParams.get('month');

  // Month state: 'YYYY-MM' or 'all'
  const [selectedMonth, setSelectedMonth] = useState<string>(
    paramMonth || currentMonthKey
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [incomeToEdit, setIncomeToEdit] = useState<DailyIncomeRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Synchronize Tab changes with URL query
  const handleTabChange = (tab: 'daily' | 'monthly') => {
    setActiveTab(tab);
    const newParams = new URLSearchParams(searchParams);
    if (tab === 'monthly') {
      newParams.set('tab', 'monthly');
    } else {
      newParams.delete('tab');
    }
    setSearchParams(newParams);
  };

  // Synchronize Month changes with URL query
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
    const newParams = new URLSearchParams(searchParams);
    if (month && month !== 'all') {
      newParams.set('month', month);
    } else {
      newParams.delete('month');
    }
    setSearchParams(newParams);
  };

  const handleOpenAdd = () => {
    setIncomeToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: DailyIncomeRecord) => {
    setIncomeToEdit(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this daily income record?')) {
      try {
        await deleteDailyIncome(id);
      } catch (err) {
        console.error('Failed to delete daily income record:', err);
      }
    }
  };

  // Available unique months sorted reverse chronological
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

  // Previous & Next month steps
  const handlePrevMonth = () => {
    if (selectedMonth === 'all') {
      handleMonthChange(availableMonths[0] || currentMonthKey);
      return;
    }
    const [year, month] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    handleMonthChange(prevDate.toISOString().substring(0, 7));
  };

  const handleNextMonth = () => {
    if (selectedMonth === 'all') {
      handleMonthChange(availableMonths[0] || currentMonthKey);
      return;
    }
    const [year, month] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(year, month, 1);
    handleMonthChange(nextDate.toISOString().substring(0, 7));
  };

  // Filter records by selected month
  const monthFilteredIncome = useMemo(() => {
    if (selectedMonth === 'all') {
      return dailyIncomeList;
    }
    return dailyIncomeList.filter((item) => item.date.startsWith(selectedMonth));
  }, [dailyIncomeList, selectedMonth]);

  // Further filter records by search term
  const filteredIncome = useMemo(() => {
    return monthFilteredIncome.filter(
      (item) =>
        item.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.date.includes(searchTerm)
    );
  }, [monthFilteredIncome, searchTerm]);

  // Metrics calculated specifically for selected month
  const totalIncomeSum = useMemo(
    () => monthFilteredIncome.reduce((acc, curr) => acc + curr.dailyTotal, 0),
    [monthFilteredIncome]
  );

  const totalJobsCount = useMemo(
    () => monthFilteredIncome.reduce((acc, curr) => acc + curr.jobsCount, 0),
    [monthFilteredIncome]
  );

  const columns: Column<DailyIncomeRecord>[] = [
    {
      header: 'Date',
      accessor: (row) => (
        <div className="flex items-center gap-2 font-medium text-slate-700">
          <Calendar className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{formatDate(row.date)}</span>
        </div>
      ),
    },
    {
      header: 'Staff Member',
      accessor: (row) => (
        <div className="font-bold text-slate-900 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center text-xs font-bold">
            {row.staffName.charAt(0)}
          </div>
          <span>{row.staffName}</span>
        </div>
      ),
    },
    {
      header: 'Jobs Count',
      accessor: (row) => (
        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200">
          {row.jobsCount} Jobs
        </span>
      ),
    },
    {
      header: 'Daily Final Total',
      accessor: (row) => (
        <span className="font-extrabold text-emerald-600 text-base">
          {formatCurrency(row.dailyTotal)}
        </span>
      ),
    },
    {
      header: 'Notes / Breakdown',
      accessor: (row) => (
        <span className="text-slate-500 text-xs truncate max-w-xs block font-medium" title={row.notes}>
          {row.notes || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Badge variant={row.status === 'Completed' ? 'success' : 'warning'}>
            {row.status}
          </Badge>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Edit Income Record"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Income Record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Income Management"
        subtitle={
          isAdmin
            ? "View, filter and analyze monthly and daily income separately with complete staff breakdown"
            : "Manage daily final income records and design job earnings"
        }
        action={
          <Button
            variant="primary"
            onClick={handleOpenAdd}
            icon={<Plus className="w-4 h-4" />}
          >
            + Add Daily Income
          </Button>
        }
      />

      {/* Admin View Mode Switcher Tabs */}
      {isAdmin && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTabChange('daily')}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeTab === 'daily'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md shadow-teal-500/20'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Daily Income Records</span>
              {selectedMonth !== 'all' && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === 'daily' ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-700'
                  }`}
                >
                  {formatMonth(selectedMonth)}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabChange('monthly')}
              className={`px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                activeTab === 'monthly'
                  ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md shadow-teal-500/20'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-amber-300" />
              <span>Monthly Income Summary</span>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-black uppercase tracking-wider">
                Admin
              </span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 self-end sm:self-auto">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            <span>Select any month to isolate revenue analytics</span>
          </div>
        </div>
      )}

      {/* TAB 1: DAILY RECORDS VIEW */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          {/* Month Selector Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Filter by Month:
                </span>
                <span className="text-sm font-black text-slate-900">
                  {selectedMonth === 'all'
                    ? 'All Recorded Months'
                    : formatMonth(selectedMonth)}
                </span>
              </div>
            </div>

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
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer pr-8 appearance-none"
                >
                  <option value="all">All Months (Lifetime)</option>
                  {availableMonths.map((mKey) => (
                    <option key={mKey} value={mKey}>
                      {formatMonth(mKey)} {mKey === currentMonthKey ? '(Current)' : ''}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400 text-xs">
                  ▼
                </div>
              </div>

              {/* HTML5 Month Picker */}
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 shadow-xs">
                <input
                  type="month"
                  value={selectedMonth === 'all' ? currentMonthKey : selectedMonth}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleMonthChange(e.target.value);
                    }
                  }}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                  title="Select month from calendar"
                />
              </div>

              {/* Quick Jump Buttons */}
              <button
                onClick={() => handleMonthChange(currentMonthKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedMonth === currentMonthKey
                    ? 'bg-teal-50 text-teal-700 border border-teal-300'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Current Month
              </button>

              {selectedMonth !== 'all' && (
                <button
                  onClick={() => handleMonthChange('all')}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1 cursor-pointer"
                  title="Clear month filter to see all records"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>All Months</span>
                </button>
              )}

              {isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTabChange('monthly')}
                  icon={<BarChart3 className="w-3.5 h-3.5 text-teal-600" />}
                >
                  Monthly Analytics
                </Button>
              )}
            </div>
          </div>

          {/* Metric Highlights for the Filtered Scope */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">
                  {selectedMonth === 'all'
                    ? 'All-Time Total Income'
                    : `${formatMonth(selectedMonth)} Income`}
                </p>
                <h3 className="text-2xl font-black text-emerald-600 mt-1">
                  {formatCurrency(totalIncomeSum)}
                </h3>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">
                  {selectedMonth === 'all'
                    ? 'Total Completed Jobs'
                    : `${formatMonth(selectedMonth)} Jobs`}
                </p>
                <h3 className="text-2xl font-black text-teal-600 mt-1">{totalJobsCount} Jobs</h3>
              </div>
              <div className="p-3 bg-teal-50 text-teal-600 border border-teal-200 rounded-xl">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase">
                  {selectedMonth === 'all' ? 'Average / Record' : 'Daily Average'}
                </p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">
                  {monthFilteredIncome.length > 0
                    ? formatCurrency(Math.round(totalIncomeSum / monthFilteredIncome.length))
                    : 'Rs. 0'}
                </h3>
              </div>
              <div className="p-3 bg-cyan-50 text-cyan-600 border border-cyan-200 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Search Bar & Active Month Pill */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
            <div className="w-full sm:w-80">
              <Input
                placeholder="Search staff, note or specific date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-4 h-4 text-teal-600" />}
              />
            </div>
            <div className="flex items-center gap-3">
              {selectedMonth !== 'all' && (
                <span className="px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Filtered: {formatMonth(selectedMonth)}</span>
                </span>
              )}
              <p className="text-xs text-slate-500 font-medium">
                Showing {filteredIncome.length} recorded entries
              </p>
            </div>
          </div>

          {/* Income Records Table */}
          <Table
            columns={columns}
            data={filteredIncome}
            keyExtractor={(row) => row.id}
            emptyMessage={
              selectedMonth === 'all'
                ? 'No daily income records found.'
                : `No daily income records recorded for ${formatMonth(selectedMonth)}.`
            }
          />
        </div>
      )}

      {/* TAB 2: MONTHLY INCOME ANALYSIS VIEW (ADMIN ONLY) */}
      {isAdmin && activeTab === 'monthly' && (
        <MonthlyIncomeView
          dailyIncomeList={dailyIncomeList}
          staffList={staffList}
          selectedMonth={selectedMonth}
          onSelectMonth={handleMonthChange}
          onEditIncome={handleOpenEdit}
        />
      )}

      {/* Add / Edit Income Modal */}
      <AddIncomeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        incomeToEdit={incomeToEdit}
      />
    </div>
  );
};
