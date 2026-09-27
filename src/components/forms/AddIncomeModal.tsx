import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';
import type { DailyIncomeRecord } from '../../types';
import { Calendar, User, DollarSign, FileText, Hash, AlertCircle } from 'lucide-react';

export interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  incomeToEdit?: DailyIncomeRecord | null;
}

export const AddIncomeModal: React.FC<AddIncomeModalProps> = ({
  isOpen,
  onClose,
  incomeToEdit = null,
}) => {
  const { staffList, addDailyIncome, updateDailyIncome } = useApp();

  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [staffId, setStaffId] = useState<string>('');
  const [dailyTotal, setDailyTotal] = useState<string>('');
  const [jobsCount, setJobsCount] = useState<string>('1');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (incomeToEdit) {
      setDate(incomeToEdit.date);
      setStaffId(incomeToEdit.staffId || '');
      setDailyTotal(incomeToEdit.dailyTotal.toString());
      setJobsCount(incomeToEdit.jobsCount.toString());
      setNotes(incomeToEdit.notes || '');
      setError('');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      if (staffList.length > 0 && (!staffId || !staffList.some((s) => s.id === staffId))) {
        setStaffId(staffList[0].id);
      }
      setDailyTotal('');
      setJobsCount('1');
      setNotes('');
      setError('');
    }
  }, [incomeToEdit, isOpen, staffList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!dailyTotal || isNaN(Number(dailyTotal)) || Number(dailyTotal) <= 0) {
      setError('Please enter a valid daily final total amount greater than 0');
      return;
    }

    if (!jobsCount || isNaN(Number(jobsCount)) || Number(jobsCount) <= 0) {
      setError('Number of jobs must be at least 1');
      return;
    }

    const selectedStaff = staffList.find((s) => s.id === staffId);
    const validStaffId = selectedStaff ? selectedStaff.id : '';

    console.log('AddIncomeModal form submission:', {
      selectedStaffIdFromState: staffId,
      foundStaffObject: selectedStaff,
      validStaffIdSent: validStaffId,
    });

    setIsSubmitting(true);
    try {
      const payload = {
        date,
        staffId: validStaffId,
        staffName: selectedStaff ? selectedStaff.name : 'Unassigned / General',
        dailyTotal: Number(dailyTotal),
        jobsCount: Number(jobsCount) || 1,
        notes: notes.trim() || 'Daily income submission',
      };

      if (incomeToEdit) {
        await updateDailyIncome(incomeToEdit.id, payload);
      } else {
        await addDailyIncome(payload);
      }

      setDailyTotal('');
      setJobsCount('1');
      setNotes('');
      setError('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save daily income to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const staffOptions = [
    { value: '', label: '-- Select Staff Member (Optional) --' },
    ...staffList.map((s) => ({
      value: s.id,
      label: `${s.name} (${s.role})`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={incomeToEdit ? 'Edit Daily Income' : '+ Add Daily Income'}
      subtitle={
        incomeToEdit
          ? 'Update daily income record in Supabase database'
          : 'Record daily final income totals for Graphic Mahagedara'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs font-medium text-rose-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          icon={<Calendar className="w-4 h-4 text-purple-400" />}
          required
        />

        <Select
          label="Assigned Staff Member"
          options={staffOptions}
          value={staffId}
          onChange={(e) => setStaffId(e.target.value)}
          icon={<User className="w-4 h-4 text-purple-400" />}
        />

        {staffList.length === 0 && (
          <p className="text-xs text-slate-400">
            ℹ️ No staff members added yet. Income will be recorded as Unassigned / General.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Daily Final Total (Rs.)"
            type="number"
            placeholder="e.g. 8500"
            value={dailyTotal}
            onChange={(e) => setDailyTotal(e.target.value)}
            icon={<DollarSign className="w-4 h-4 text-emerald-400" />}
            required
            min="1"
          />

          <Input
            label="Number of Jobs"
            type="number"
            placeholder="e.g. 5"
            min="1"
            value={jobsCount}
            onChange={(e) => setJobsCount(e.target.value)}
            icon={<Hash className="w-4 h-4 text-purple-400" />}
            required
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
            Notes / Job Breakdown
          </label>
          <textarea
            rows={3}
            placeholder="e.g. Logo designs, flyers, vinyl print final total"
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
            icon={<FileText className="w-4 h-4" />}
          >
            {incomeToEdit ? 'Update Income Record' : 'Save Income Record'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

