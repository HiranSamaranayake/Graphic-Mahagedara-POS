import React from 'react';
import { Table, type Column } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { useApp } from '../../context/AppContext';
import type { RecentTransaction } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const RecentTransactions: React.FC = () => {
  const { dailyIncomeList, expenseList } = useApp();

  // Combine income and expense records into a unified transaction list
  const incomeTx: RecentTransaction[] = dailyIncomeList.map((inc) => ({
    id: `inc-tx-${inc.id}`,
    date: formatDate(inc.date),
    type: 'Income',
    description: inc.notes || 'Daily Income Total',
    staff: inc.staffName,
    amount: inc.dailyTotal,
    status: 'Completed',
  }));

  const expenseTx: RecentTransaction[] = expenseList.map((exp) => ({
    id: `exp-tx-${exp.id}`,
    date: formatDate(exp.date),
    type: 'Expense',
    description: exp.description,
    staff: exp.paidBy,
    amount: exp.amount,
    status: 'Paid',
  }));

  const combinedTx = [...incomeTx, ...expenseTx].slice(0, 8);

  const columns: Column<RecentTransaction>[] = [
    {
      header: 'Date',
      accessor: 'date',
      className: 'font-medium text-slate-600',
    },
    {
      header: 'Type',
      accessor: (row) => (
        <span
          className={`inline-flex items-center gap-1 text-xs font-bold ${
            row.type === 'Income' ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {row.type === 'Income' ? (
            <ArrowUpRight className="w-3.5 h-3.5" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5" />
          )}
          {row.type}
        </span>
      ),
    },
    {
      header: 'Description',
      accessor: 'description',
      className: 'font-bold text-slate-900',
    },
    {
      header: 'Staff / Paid By',
      accessor: 'staff',
      className: 'text-slate-600 font-medium',
    },
    {
      header: 'Amount',
      accessor: (row) => (
        <span
          className={`font-bold ${row.type === 'Income' ? 'text-emerald-600' : 'text-slate-900'}`}
        >
          {formatCurrency(row.amount)}
        </span>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge
          variant={
            row.status === 'Completed'
              ? 'success'
              : row.status === 'Paid'
              ? 'purple'
              : 'warning'
          }
        >
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Recent Transactions
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Latest financial activities fetched from Supabase
          </p>
        </div>
        <span className="text-xs font-extrabold text-teal-600">Live Database Feed</span>
      </div>

      <Table
        columns={columns}
        data={combinedTx}
        keyExtractor={(row) => row.id}
        emptyMessage="No recent transactions recorded yet. Start adding income or expenses."
      />
    </div>
  );
};
