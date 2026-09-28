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

import { useAuth } from '../context/AuthContext';

import { Navigate } from 'react-router-dom';

export const Salaries: React.FC = () => {
  const { role, profile } = useAuth();
  if (role === 'Staff' && profile?.staffCategory !== 'Graphic Designer') {
    return <Navigate to="/dashboard" replace />;
  }

  const { salaryList, staffList, updateSalaryStatus, deleteSalaryRecord } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [salaryToEdit, setSalaryToEdit] = useState<SalaryRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'records' | 'summary'>('records');

  const isAdmin = role === 'Admin';

  const totalSalaryPayout = calculateTotalSalaryPayout(salaryList);
  const paidCount = salaryList.filter((s) => s.paymentStatus === 'Paid').length;
  const pendingCount = salaryList.filter((s) => s.paymentStatus !== 'Paid').length;

  const handleEdit = (record: SalaryRecord) => {
    if (!isAdmin) return;
    setSalaryToEdit(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (window.confirm('Are you sure you want to delete this salary payment record?')) {
      await deleteSalaryRecord(id);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSalaryToEdit(null);
  };

  const handleOpenAddModal = () => {
    if (!isAdmin) return;
    setSalaryToEdit(null);
    setIsModalOpen(true);
  };

  const baseColumns: Column<SalaryRecord>[] = [
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
      accessor: (row) => (
        <span className="text-emerald-600 font-bold">+{formatCurrency(row.bonus)}</span>
      ),
    },
    {
      header: 'Commission',
      accessor: (row) => (
        <span className="text-teal-600 font-bold">+{formatCurrency(row.commission)}</span>
      ),
    },
    {
      header: 'Other Payments',
      accessor: (row) => (
        <span className="text-cyan-600 font-bold">+{formatCurrency(row.otherPayments || 0)}</span>
      ),
    },
    {
      header: 'Deductions',
      accessor: (row) => (
        <span className="text-rose-600 font-bold">-{formatCurrency(row.deductions)}</span>
      ),
    },
    {
      header: 'Final Salary',
      accessor: (row) => (
        <span className="font-extrabold text-emerald-600 text-base">
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

          {isAdmin && row.paymentStatus !== 'Paid' && (
            <button
              onClick={() => updateSalaryStatus(row.id, 'Paid')}
              className="px-2 py-0.5 text-[10px] font-bold bg-teal-500 hover:bg-teal-600 text-white rounded-md transition-colors cursor-pointer shadow-xs"
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
      accessor: (row) => <span className="text-xs text-slate-500">{formatDate(row.paymentDate)}</span>,
    },
  ];

  const columns: Column<SalaryRecord>[] = isAdmin
    ? [
        ...baseColumns,
        {
          header: 'Actions',
          accessor: (row) => (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(row)}
                className="p-1.5 bg-white hover:bg-slate-100 text-slate-500 hover:text-teal-600 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                title="Edit Salary Payment"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(row.id)}
                className="p-1.5 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                title="Delete Salary Payment"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ),
        },
      ]
    : baseColumns;

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
        title={isAdmin ? "Salary Management" : "My Salary & Payment Details"}
        subtitle={
          isAdmin
            ? "Process staff payroll, bonus allocations, commission calculations & final disbursements"
            : "View your personal monthly salary disbursemens & performance payouts"
        }
        action={
          isAdmin ? (
            <Button
              variant="primary"
              onClick={handleOpenAddModal}
              icon={<Plus className="w-4 h-4" />}
            >
              + Add Salary Payment
            </Button>
          ) : undefined
        }
      />

      {/* Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Total Payroll Payout</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">
              {formatCurrency(totalSalaryPayout)}
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Disbursed Payments</p>
            <h3 className="text-2xl font-black text-teal-600 mt-1">{paidCount} Staff Paid</h3>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 border border-teal-200 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Pending / Processing</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{pendingCount} Records</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 border border-amber-200 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('records')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'records'
              ? 'bg-teal-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Salary Payments History ({salaryList.length})
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'summary'
              ? 'bg-teal-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
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
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-start gap-3">
            <Award className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
            <div className="text-xs text-teal-900">
              <strong className="block text-sm font-bold text-slate-900 mb-0.5">
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
                className="bg-white border border-slate-200 hover:border-teal-400 rounded-2xl p-5 shadow-xs transition-all duration-200"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-cyan-600 flex items-center justify-center font-extrabold text-white text-base shadow-xs">
                      {stf.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{stf.name}</h4>
                      <span className="text-[11px] text-teal-600 font-bold">{stf.role}</span>
                    </div>
                  </div>
                  <Badge variant={stf.paymentStatus === 'Paid' ? 'success' : 'warning'}>
                    {stf.paymentStatus}
                  </Badge>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-slate-500 font-medium">Basic Salary:</span>
                    <span className="font-bold text-slate-900">{formatCurrency(stf.basicSalary)}</span>
                  </div>

                  <div className="flex justify-between items-center px-1">
                    <span className="text-slate-500 font-medium">Commission:</span>
                    <span className="font-bold text-teal-700">+{formatCurrency(stf.commission)}</span>
                  </div>

                  <div className="flex justify-between items-center px-1">
                    <span className="text-slate-500 font-medium">Bonus:</span>
                    <span className="font-bold text-emerald-600">+{formatCurrency(stf.bonus)}</span>
                  </div>

                  <div className="flex justify-between items-center px-1">
                    <span className="text-slate-500 font-medium">Other Payments:</span>
                    <span className="font-bold text-cyan-600">+{formatCurrency(stf.otherPayments)}</span>
                  </div>

                  <div className="flex justify-between items-center px-1">
                    <span className="text-slate-500 font-medium">Deductions:</span>
                    <span className="font-bold text-rose-600">-{formatCurrency(stf.deductions)}</span>
                  </div>

                  {/* Final Salary / Earnings */}
                  <div className="flex justify-between items-center p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 pt-3">
                    <div className="flex items-center gap-1.5 text-emerald-800">
                      <DollarSign className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold">Total Final Salary:</span>
                    </div>
                    <span className="font-extrabold text-emerald-900 text-sm">
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
