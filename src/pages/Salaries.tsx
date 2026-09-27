import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Table, type Column } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { AddSalaryModal } from '../components/forms/AddSalaryModal';
import { useApp } from '../context/AppContext';
import type { SalaryRecord } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { calculateTotalSalaryPayout } from '../utils/calculations';
import { Plus, Wallet, CheckCircle, Clock } from 'lucide-react';

export const Salaries: React.FC = () => {
  const { salaryList, updateSalaryStatus } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalSalaryPayout = calculateTotalSalaryPayout(salaryList);
  const paidCount = salaryList.filter((s) => s.paymentStatus === 'Paid').length;
  const pendingCount = salaryList.filter((s) => s.paymentStatus !== 'Paid').length;

  const columns: Column<SalaryRecord>[] = [
    {
      header: 'Staff Member',
      accessor: (row) => (
        <div>
          <p className="font-bold text-white">{row.staffName}</p>
          <span className="text-[11px] text-purple-400 font-medium">{row.month}</span>
        </div>
      ),
    },
    {
      header: 'Basic Salary',
      accessor: (row) => <span className="font-semibold text-slate-200">{formatCurrency(row.basicSalary)}</span>,
    },
    {
      header: 'Bonus',
      accessor: (row) => (
        <span className="text-emerald-400 font-medium">+{formatCurrency(row.bonus)}</span>
      ),
    },
    {
      header: 'Commission',
      accessor: (row) => (
        <span className="text-purple-400 font-medium">+{formatCurrency(row.commission)}</span>
      ),
    },
    {
      header: 'Deductions',
      accessor: (row) => (
        <span className="text-rose-400 font-medium">-{formatCurrency(row.deductions)}</span>
      ),
    },
    {
      header: 'Final Salary Payout',
      accessor: (row) => (
        <span className="font-extrabold text-emerald-400 text-base">
          {formatCurrency(row.finalSalary)}
        </span>
      ),
    },
    {
      header: 'Payment Status',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Badge
            variant={
              row.paymentStatus === 'Paid'
                ? 'success'
                : row.paymentStatus === 'Processing'
                ? 'purple'
                : 'warning'
            }
          >
            {row.paymentStatus}
          </Badge>

          {row.paymentStatus !== 'Paid' && (
            <button
              onClick={() => updateSalaryStatus(row.id, 'Paid')}
              className="px-2 py-0.5 text-[10px] font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-md transition-colors"
              title="Mark as Paid"
            >
              Mark Paid
            </button>
          )}
        </div>
      ),
    },
    {
      header: 'Payment Date',
      accessor: (row) => <span className="text-xs text-slate-400">{formatDate(row.paymentDate)}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Salary Management"
        subtitle="Process staff payroll, bonus allocations, commission calculations & final disbursements"
        action={
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            + Add Salary Payment
          </Button>
        }
      />

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Total Payroll Payout</p>
            <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">
              {formatCurrency(totalSalaryPayout)}
            </h3>
          </div>
          <div className="p-3 bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 rounded-xl">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Disbursed Payments</p>
            <h3 className="text-2xl font-extrabold text-purple-400 mt-1">{paidCount} Staff Paid</h3>
          </div>
          <div className="p-3 bg-purple-950/40 text-purple-400 border border-purple-500/30 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Pending / Processing</p>
            <h3 className="text-2xl font-extrabold text-amber-400 mt-1">{pendingCount} Records</h3>
          </div>
          <div className="p-3 bg-amber-950/40 text-amber-400 border border-amber-500/30 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Salary Table */}
      <Table
        columns={columns}
        data={salaryList}
        keyExtractor={(row) => row.id}
        emptyMessage="No salary records yet."
      />

      <AddSalaryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
