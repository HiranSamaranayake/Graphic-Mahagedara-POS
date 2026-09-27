import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';
import type { ExpenseCategory, ExpenseRecord } from '../../types';
import { Calendar, Tag, DollarSign, UserCheck, CreditCard, AlertCircle } from 'lucide-react';

export interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenseToEdit?: ExpenseRecord | null;
}

export const expenseCategories: ExpenseCategory[] = [
  'Salaries',
  'Facebook Boost',
  'Advertising',
  'Software',
  'Internet',
  'Electricity',
  'Equipment',
  'Transport',
  'Office Expenses',
  'Other',
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  expenseToEdit = null,
}) => {
  const { addExpense, updateExpense } = useApp();

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>('Facebook Boost');
  const [description, setDescription] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paidBy, setPaidBy] = useState<string>('Admin');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (expenseToEdit) {
      setDate(expenseToEdit.date);
      setCategory(expenseToEdit.category);
      setDescription(expenseToEdit.description);
      setAmount(expenseToEdit.amount.toString());
      setPaidBy(expenseToEdit.paidBy || 'Admin');
      setNotes(expenseToEdit.notes || '');
      setError('');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setCategory('Facebook Boost');
      setDescription('');
      setAmount('');
      setPaidBy('Admin');
      setNotes('');
      setError('');
    }
  }, [expenseToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!description.trim()) {
      setError('Please provide a description for the expense');
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid expense amount greater than 0');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        date,
        category,
        description: description.trim(),
        amount: Number(amount),
        paidBy: paidBy.trim() || 'Admin',
        notes: notes.trim(),
      };

      if (expenseToEdit) {
        await updateExpense(expenseToEdit.id, payload);
      } else {
        await addExpense(payload);
      }

      setDescription('');
      setAmount('');
      setNotes('');
      setError('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to record expense in Supabase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryOptions = expenseCategories.map((cat) => ({
    value: cat,
    label: cat,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={expenseToEdit ? 'Edit Expense' : '+ Add Expense'}
      subtitle={
        expenseToEdit
          ? 'Update business operating expense in Supabase'
          : 'Log business operating expenses for Graphic Mahagedara'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs font-medium text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            icon={<Calendar className="w-4 h-4 text-purple-400" />}
            required
          />

          <Select
            label="Category"
            options={categoryOptions}
            value={category}
            onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
            icon={<Tag className="w-4 h-4 text-purple-400" />}
          />
        </div>

        <Input
          label="Expense Description"
          placeholder="e.g. Facebook Ads Campaign Q3 or SLT Fiber Bill"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Amount (Rs.)"
            type="number"
            placeholder="e.g. 5000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            icon={<DollarSign className="w-4 h-4 text-rose-400" />}
            required
            min="1"
          />

          <Input
            label="Paid By"
            placeholder="e.g. Admin"
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            icon={<UserCheck className="w-4 h-4 text-purple-400" />}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
            Notes / Reference
          </label>
          <textarea
            rows={2}
            placeholder="Additional information or receipt number..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 focus:border-purple-500 text-slate-100 text-sm rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            icon={<CreditCard className="w-4 h-4" />}
          >
            {expenseToEdit ? 'Update Expense' : 'Record Expense'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

