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
          <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-800 text-purple-300 flex items-center justify-center font-extrabold text-sm shadow-sm">
            {row.name.charAt(0)}
          </div>
          <div>
            <p className="font-bold text-white">{row.name}</p>
            <p className="text-xs text-slate-400">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role / Title',
      accessor: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <Briefcase className="w-3.5 h-3.5 text-purple-400" />
          <span className="font-semibold">{row.role}</span>
        </div>
      ),
    },
    {
      header: 'Phone',
      accessor: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <Phone className="w-3.5 h-3.5 text-purple-400" />
          <span>{row.phone}</span>
        </div>
      ),
    },
    {
      header: 'Joining Date',
      accessor: (row) => <span className="text-xs text-slate-400">{formatDate(row.joiningDate)}</span>,
    },
    {
      header: 'Salary Type',
      accessor: (row) => (
        <span className="px-2.5 py-1 bg-slate-800/80 text-purple-300 rounded-lg text-xs font-semibold border border-slate-700">
          {row.salaryType}
        </span>
      ),
    },
    {
      header: 'Basic Monthly Salary',
      accessor: (row) => (
        <span className="font-bold text-slate-100">{formatCurrency(row.monthlySalary)}</span>
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
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'roster'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          Staff Directory & Roster ({staffList.length})
        </button>
        <button
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'performance'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
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
          <div className="p-4 bg-purple-950/40 border border-purple-800/50 rounded-2xl flex items-start gap-3">
            <Award className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
            <div className="text-xs text-purple-200">
              <strong className="block text-sm font-bold text-white mb-0.5">
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
                    <Badge variant={stf.status === 'Active' ? 'success' : 'neutral'}>
                      {stf.status}
                    </Badge>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-center p-2.5 bg-slate-950/60 rounded-xl border border-slate-800/60">
                      <span className="text-slate-400 font-medium">Jobs Completed:</span>
                      <span className="font-extrabold text-purple-300">{stf.jobsCompleted} Jobs</span>
                    </div>

                    {/* Revenue Generated */}
                    <div className="flex justify-between items-center p-2.5 bg-emerald-950/30 rounded-xl border border-emerald-500/30">
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-bold">Revenue Generated:</span>
                      </div>
                      <span className="font-extrabold text-emerald-400 text-sm">
                        {formatCurrency(stf.revenueGenerated)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center px-1">
                      <span className="text-slate-400">Monthly Salary Base:</span>
                      <span className="font-bold text-slate-200">{formatCurrency(stf.monthlySalary)}</span>
                    </div>

                    <div className="flex justify-between items-center px-1">
                      <span className="text-slate-400">Commission Earned:</span>
                      <span className="font-bold text-purple-300">{formatCurrency(stf.commission)}</span>
                    </div>

                    {/* Staff Earnings (Separate Concept) */}
                    <div className="flex justify-between items-center p-2.5 bg-purple-950/40 rounded-xl border border-purple-500/30 pt-3">
                      <div className="flex items-center gap-1.5 text-purple-300">
                        <DollarSign className="w-4 h-4 text-purple-400" />
                        <span className="font-bold">Staff Earnings:</span>
                      </div>
                      <span className="font-extrabold text-purple-200 text-sm">
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
