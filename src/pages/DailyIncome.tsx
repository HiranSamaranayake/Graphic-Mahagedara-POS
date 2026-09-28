import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Table, type Column } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { AddIncomeModal } from '../components/forms/AddIncomeModal';
import { useApp } from '../context/AppContext';
import type { DailyIncomeRecord } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Plus, Search, DollarSign, Calendar, Briefcase, Edit3, Trash2 } from 'lucide-react';

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const DailyIncome: React.FC = () => {
  const { role, profile } = useAuth();
  if (role === 'Staff' && profile?.staffCategory === 'Graphic Designer') {
    return <Navigate to="/dashboard" replace />;
  }

  const { dailyIncomeList, deleteDailyIncome } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [incomeToEdit, setIncomeToEdit] = useState<DailyIncomeRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredIncome = dailyIncomeList.filter(
    (item) =>
      item.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.date.includes(searchTerm)
  );

  const totalIncomeSum = dailyIncomeList.reduce((acc, curr) => acc + curr.dailyTotal, 0);
  const totalJobsCount = dailyIncomeList.reduce((acc, curr) => acc + curr.jobsCount, 0);

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
        title="Daily Income"
        subtitle="Manage daily final income records and design job earnings"
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

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Recorded Total Income</p>
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
            <p className="text-xs font-bold text-slate-500 uppercase">Completed Jobs</p>
            <h3 className="text-2xl font-black text-teal-600 mt-1">{totalJobsCount} Jobs</h3>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 border border-teal-200 rounded-xl">
            <Briefcase className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Average / Record</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">
              {dailyIncomeList.length > 0
                ? formatCurrency(Math.round(totalIncomeSum / dailyIncomeList.length))
                : 'Rs. 0'}
            </h3>
          </div>
          <div className="p-3 bg-cyan-50 text-cyan-600 border border-cyan-200 rounded-xl">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by staff name, note or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4 text-teal-600" />}
          />
        </div>
        <p className="text-xs text-slate-500 font-medium">Showing {filteredIncome.length} recorded entries</p>
      </div>

      {/* Income Records Table */}
      <Table
        columns={columns}
        data={filteredIncome}
        keyExtractor={(row) => row.id}
        emptyMessage="No daily income records yet."
      />

      {/* Add / Edit Income Modal */}
      <AddIncomeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        incomeToEdit={incomeToEdit}
      />
    </div>
  );
};
