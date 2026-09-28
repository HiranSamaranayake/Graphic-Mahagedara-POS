import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Table, type Column } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { AddStaffModal } from '../components/forms/AddStaffModal';
import { useApp } from '../context/AppContext';
import type { StaffMember } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Plus, Phone, Briefcase, Award, TrendingUp, DollarSign } from 'lucide-react';

export const Staff: React.FC = () => {
  const { staffList } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'roster' | 'performance'>('roster');

  const rosterColumns: Column<StaffMember>[] = [
    {
      header: 'Staff Member',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-extrabold text-sm shadow-xs">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-slate-900">{row.name}</p>
            <p className="text-xs text-slate-500">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role / Title',
      accessor: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
          <Briefcase className="w-3.5 h-3.5 text-teal-600" />
          <span>{row.role}</span>
        </div>
      ),
    },
    {
      header: 'Staff Category',
      accessor: (row) => (
        <span
          className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
            row.staffCategory === 'Graphic Designer'
              ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
              : 'bg-teal-50 text-teal-800 border-teal-200'
          }`}
        >
          {row.staffCategory || 'Call Center Operator'}
        </span>
      ),
    },
    {
      header: 'Phone',
      accessor: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <Phone className="w-3.5 h-3.5 text-teal-600" />
          <span>{row.phone}</span>
        </div>
      ),
    },
    {
      header: 'Joining Date',
      accessor: (row) => <span className="text-xs text-slate-500">{formatDate(row.joiningDate)}</span>,
    },
    {
      header: 'Salary Type',
      accessor: (row) => (
        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold border border-slate-200">
          {row.salaryType}
        </span>
      ),
    },
    {
      header: 'Basic Monthly Salary',
      accessor: (row) => (
        <span className="font-bold text-slate-900">{formatCurrency(row.monthlySalary)}</span>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge variant={row.status === 'Active' ? 'success' : 'neutral'}>{row.status}</Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Management"
        subtitle="Manage graphic designers, role assignments, salary structures & performance metrics"
        action={
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            + Add Staff
          </Button>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'roster'
              ? 'bg-teal-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Staff Directory & Roster ({staffList.length})
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'performance'
              ? 'bg-teal-500 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          Staff Performance & Earnings
        </button>
      </div>

      {/* Roster View */}
      {activeTab === 'roster' && (
        <Table
          columns={rosterColumns}
          data={staffList}
          keyExtractor={(row) => row.id}
          emptyMessage="No staff members added yet."
        />
      )}

      {/* Performance Section View */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* Concept Explanation Banner */}
          <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl flex items-start gap-3">
            <Award className="w-5 h-5 text-teal-600 mt-0.5 shrink-0" />
            <div className="text-xs text-teal-900">
              <strong className="block text-sm font-bold text-slate-900 mb-0.5">
                Financial Metrics Structure Notice
              </strong>
              <p>
                <strong>Revenue Generated</strong> represents total gross job income produced by the staff member for Graphic Mahagedara (e.g. Rs. 80,000).<br />
                <strong>Staff Earnings</strong> represents total compensation paid out to the staff member (Basic Salary + Commission, e.g. Rs. 25,000).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {staffList.map((stf) => {
              const staffEarnings = stf.monthlySalary * 0.4 + stf.commission; // calculated demo staff earnings

              return (
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
                    <Badge variant={stf.status === 'Active' ? 'success' : 'neutral'}>
                      {stf.status}
                    </Badge>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="text-slate-500 font-bold">Jobs Completed:</span>
                      <span className="font-extrabold text-teal-700">{stf.jobsCompleted} Jobs</span>
                    </div>

                    {/* Revenue Generated */}
                    <div className="flex justify-between items-center p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                      <div className="flex items-center gap-1.5 text-emerald-700">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-bold">Revenue Generated:</span>
                      </div>
                      <span className="font-extrabold text-emerald-700 text-sm">
                        {formatCurrency(stf.revenueGenerated)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center px-1">
                      <span className="text-slate-500 font-medium">Monthly Salary Base:</span>
                      <span className="font-bold text-slate-900">{formatCurrency(stf.monthlySalary)}</span>
                    </div>

                    <div className="flex justify-between items-center px-1">
                      <span className="text-slate-500 font-medium">Commission Earned:</span>
                      <span className="font-bold text-teal-700">{formatCurrency(stf.commission)}</span>
                    </div>

                    {/* Staff Earnings (Separate Concept) */}
                    <div className="flex justify-between items-center p-2.5 bg-teal-50 rounded-xl border border-teal-200 pt-3">
                      <div className="flex items-center gap-1.5 text-teal-800">
                        <DollarSign className="w-4 h-4 text-teal-600" />
                        <span className="font-bold">Staff Earnings:</span>
                      </div>
                      <span className="font-extrabold text-teal-900 text-sm">
                        {formatCurrency(staffEarnings)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AddStaffModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
