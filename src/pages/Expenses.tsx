import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Table, type Column } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { AddExpenseModal } from '../components/forms/AddExpenseModal';
import { useApp } from '../context/AppContext';
import type { ExpenseRecord } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Plus, Search, CreditCard, Tag, UserCheck, ShieldAlert, Edit3, Trash2 } from 'lucide-react';

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Expenses: React.FC = () => {
  const { role, profile } = useAuth();
  if (role === 'Staff' && profile?.staffCategory === 'Graphic Designer') {
    return <Navigate to="/dashboard" replace />;
  }

  const { expenseList, deleteExpense } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<ExpenseRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const handleOpenAdd = () => {
    setExpenseToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ExpenseRecord) => {
    setExpenseToEdit(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      try {
        await deleteExpense(id);
      } catch (err) {
        console.error('Failed to delete expense record:', err);
      }
    }
  };

  const filteredExpenses = expenseList.filter((exp) => {
    const matchesSearch =
      exp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.paidBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.category.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = selectedCategory === 'ALL' || exp.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalExpenseSum = expenseList.reduce((acc, curr) => acc + curr.amount, 0);
  const fbBoostTotal = expenseList
    .filter((exp) => exp.category === 'Facebook Boost')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const categoriesFilterList = [
    'ALL',
    'Facebook Boost',
    'Salaries',
    'Advertising',
    'Software',
    'Internet',
    'Electricity',
    'Equipment',
    'Transport',
    'Office Expenses',
    'Other',
  ];

  const columns: Column<ExpenseRecord>[] = [
    {
      header: 'Date',
      accessor: (row) => <span className="font-medium text-slate-600">{formatDate(row.date)}</span>,
    },
    {
      header: 'Category',
      accessor: (row) => (
        <Badge variant={row.category === 'Facebook Boost' ? 'purple' : 'neutral'}>
          <Tag className="w-3 h-3 mr-1" />
          {row.category}
        </Badge>
      ),
    },
    {
      header: 'Description',
      accessor: (row) => (
        <div>
          <p className="font-bold text-slate-900">{row.description}</p>
          {row.notes && <p className="text-xs text-slate-500 font-medium mt-0.5">{row.notes}</p>}
        </div>
      ),
    },
    {
      header: 'Paid By',
      accessor: (row) => (
        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold">
          <UserCheck className="w-3.5 h-3.5 text-teal-600" />
          <span>{row.paidBy}</span>
        </div>
      ),
    },
    {
      header: 'Amount',
      accessor: (row) => (
        <span className="font-extrabold text-rose-600 text-base">{formatCurrency(row.amount)}</span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Badge variant={row.status === 'Paid' ? 'success' : 'warning'}>{row.status}</Badge>
          <button
            onClick={() => handleOpenEdit(row)}
            className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Edit Expense Record"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Delete Expense Record"
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
        title="Expenses"
        subtitle="Manage business operating expenses, Facebook boosts & software subscriptions"
        action={
          <Button
            variant="primary"
            onClick={handleOpenAdd}
            icon={<Plus className="w-4 h-4" />}
          >
            + Add Expense
          </Button>
        }
      />

      {/* Expense Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Total Monthly Expenses</p>
            <h3 className="text-2xl font-black text-rose-600 mt-1">
              {formatCurrency(totalExpenseSum)}
            </h3>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 border border-rose-200 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Facebook Ads & Boosting</p>
            <h3 className="text-2xl font-black text-teal-600 mt-1">
              {formatCurrency(fbBoostTotal)}
            </h3>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 border border-teal-200 rounded-xl">
            <Tag className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Expense Count</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{expenseList.length} Records</h3>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl border border-slate-200">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 border border-slate-200 rounded-2xl shadow-xs">
        <div className="w-full sm:w-80">
          <Input
            placeholder="Search by description, category, payer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4 text-teal-600" />}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          {categoriesFilterList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-teal-500 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Expense Table */}
      <Table
        columns={columns}
        data={filteredExpenses}
        keyExtractor={(row) => row.id}
        emptyMessage="No expenses recorded yet."
      />

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        expenseToEdit={expenseToEdit}
      />
    </div>
  );
};
