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
import { Plus, Wallet, CheckCircle, Clock, Edit3, Trash2, Users, DollarSign, Award } from 'lucide-react';

export const Salaries: React.FC = () => {
  const { salaryList, staffList, updateSalaryStatus, deleteSalaryRecord } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [salaryToEdit, setSalaryToEdit] = useState<SalaryRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'records' | 'summary'>('records');

  const totalSalaryPayout = calculateTotalSalaryPayout(salaryList);
  const paidCount = salaryList.filter((s) => s.paymentStatus === 'Paid').length;
  const pendingCount = salaryList.filter((s) => s.paymentStatus !== 'Paid').length;

  const handleEdit = (record: SalaryRecord) => {
    setSalaryToEdit(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this salary payment record?')) {
      await deleteSalaryRecord(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSalaryToEdit(null);
  };

  const handleOpenAddModal = () => {
    setSalaryToEdit(null);
    setIsModalOpen(true);
  };

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
      header: 'Other Payments',
      accessor: (row) => (
        <span className="text-blue-400 font-medium">+{formatCurrency(row.otherPayments || 0)}</span>
      ),
    },
    {
      header: 'Deductions',
      accessor: (row) => (
        <span className="text-rose-400 font-medium">-{formatCurrency(row.deductions)}</span>
      ),
    },
    {
      header: 'Final Salary',
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
                : row.paymentStatus === 'Processing' || row.paymentStatus === 'Partial'
                ? 'purple'
                : 'warning'
            }
          >
            {row.paymentStatus}
          </Badge>

          {row.paymentStatus !== 'Paid' && (
            <button
              onClick={() => updateSalaryStatus(row.id, 'Paid')}
              className="px-2 py-0.5 text-[10px] font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-md transition-colors cursor-pointer"
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
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-1.5 bg-slate-800 hover:bg-purple-600/30 text-slate-300 hover:text-purple-300 rounded-lg transition-colors border border-slate-700 cursor-pointer"
            title="Edit Salary Payment"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 bg-slate-800 hover:bg-rose-600/30 text-slate-300 hover:text-rose-400 rounded-lg transition-colors border border-slate-700 cursor-pointer"
            title="Delete Salary Payment"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ),
    },
  ];

  // Calculate Staff Salary Summary
  const staffSummaryList = staffList.map((stf) => {
    const stfSalaries = salaryList.filter((s) => s.staffId === stf.id);
    const totalBasic = stfSalaries.reduce((sum, s) => sum + s.basicSalary, 0);
    const totalBonus = stfSalaries.reduce((sum, s) => sum + s.bonus, 0);
    const totalComm = stfSalaries.reduce((sum, s) => sum + s.commission, 0);
    const totalOther = stfSalaries.reduce((sum, s) => sum + (s.otherPayments || 0), 0);
    const totalDed = stfSalaries.reduce((sum, s) => sum + s.deductions, 0);
    const totalFinal = stfSalaries.reduce((sum, s) => sum + s.finalSalary, 0);
    const latestStatus = stfSalaries.length > 0 ? stfSalaries[0].paymentStatus : 'No Payout';

    return {
      id: stf.id,
      name: stf.name,
      role: stf.role,
      monthlySalary: stf.monthlySalary,
      revenueGenerated: stf.revenueGenerated,
      basicSalary: totalBasic || stf.monthlySalary,
      bonus: totalBonus,
      commission: totalComm,
      otherPayments: totalOther,
      deductions: totalDed,
      finalSalary: totalFinal,
      paymentStatus: latestStatus,
      recordsCount: stfSalaries.length,
    };
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Salary Management"
        subtitle="Process staff payroll, bonus allocations, commission calculations & final disbursements"
        action={
          <Button
            variant="primary"
            onClick={handleOpenAddModal}
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

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('records')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'records'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          Salary Payments History ({salaryList.length})
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'summary'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Users className="w-4 h-4" />
          Staff Salary Summary ({staffSummaryList.length})
        </button>
      </div>

      {/* Tab 1: Salary Records Table */}
      {activeTab === 'records' && (
        <Table
          columns={columns}
          data={salaryList}
          keyExtractor={(row) => row.id}
          emptyMessage="No salary payments recorded yet."
        />
      )}

      {/* Tab 2: Staff Salary Summary */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          {/* Concept Explanation Notice */}
          <div className="p-4 bg-purple-950/40 border border-purple-800/50 rounded-2xl flex items-start gap-3">
            <Award className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
            <div className="text-xs text-purple-200">
              <strong className="block text-sm font-bold text-white mb-0.5">
                Financial Metrics Structure Notice
              </strong>
              <p>
                <strong>Staff Revenue Generated</strong> represents total gross job income produced by the staff member for Graphic Mahagedara.<br />
                <strong>Staff Salary/Earnings</strong> represents total compensation calculated & paid out to the staff member (Basic + Commission + Bonus + Other - Deductions).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {staffSummaryList.map((stf) => (
              <div
                key={stf.id}
                className="bg-slate-900 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-5 shadow-xl transition-all duration-200"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center font-extrabold text-white text-base shadow-md">
                      {stf.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{stf.name}</h4>
                      <span className="text-[11px] text-purple-400 font-medium">{stf.role}</span>
                    </div>
                  </div>
                  <Badge variant={stf.paymentStatus === 'Paid' ? 'success' : 'warning'}>
                    {stf.paymentStatus}
                  </Badge>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-slate-400">Basic Salary:</span>
                    <span className="font-bold text-slate-200">{formatCurrency(stf.basicSalary)}</span>
                  </div>

                  <div className="flex justify-between items-center px-1">
                    <span className="text-slate-400">Commission:</span>
                    <span className="font-bold text-purple-300">+{formatCurrency(stf.commission)}</span>
                  </div>

                  <div className="flex justify-between items-center px-1">
                    <span className="text-slate-400">Bonus:</span>
                    <span className="font-bold text-emerald-400">+{formatCurrency(stf.bonus)}</span>
                  </div>

                  <div className="flex justify-between items-center px-1">
                    <span className="text-slate-400">Other Payments:</span>
                    <span className="font-bold text-blue-400">+{formatCurrency(stf.otherPayments)}</span>
                  </div>

                  <div className="flex justify-between items-center px-1">
                    <span className="text-slate-400">Deductions:</span>
                    <span className="font-bold text-rose-400">-{formatCurrency(stf.deductions)}</span>
                  </div>

                  {/* Final Salary / Earnings */}
                  <div className="flex justify-between items-center p-2.5 bg-emerald-950/40 rounded-xl border border-emerald-500/30 pt-3">
                    <div className="flex items-center gap-1.5 text-emerald-300">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold">Total Final Salary:</span>
                    </div>
                    <span className="font-extrabold text-emerald-300 text-sm">
                      {formatCurrency(stf.finalSalary)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AddSalaryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        salaryToEdit={salaryToEdit}
      />
    </div>
  );
};
