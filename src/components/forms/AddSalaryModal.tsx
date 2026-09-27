import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import type { SalaryRecord } from '../../types';
import { User, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

export interface AddSalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  salaryToEdit?: SalaryRecord | null;
}

export const AddSalaryModal: React.FC<AddSalaryModalProps> = ({
  isOpen,
  onClose,
  salaryToEdit,
}) => {
  const { staffList, addSalaryRecord, updateSalaryRecord } = useApp();

  const [staffId, setStaffId] = useState<string>('');
  const [month, setMonth] = useState<string>('September 2026');
  const [basicSalary, setBasicSalary] = useState<string>('0');
  const [bonus, setBonus] = useState<string>('0');
  const [commission, setCommission] = useState<string>('0');
  const [deductions, setDeductions] = useState<string>('0');
  const [otherPayments, setOtherPayments] = useState<string>('0');
  const [paymentStatus, setPaymentStatus] = useState<SalaryRecord['paymentStatus']>('Paid');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (salaryToEdit) {
        setStaffId(salaryToEdit.staffId);
        setMonth(salaryToEdit.month);
        setBasicSalary(salaryToEdit.basicSalary.toString());
        setBonus(salaryToEdit.bonus.toString());
        setCommission(salaryToEdit.commission.toString());
        setDeductions(salaryToEdit.deductions.toString());
        setOtherPayments((salaryToEdit.otherPayments || 0).toString());
        setPaymentStatus(salaryToEdit.paymentStatus);
        setPaymentDate(salaryToEdit.paymentDate || new Date().toISOString().split('T')[0]);
        setNotes(salaryToEdit.notes || '');
      } else {
        const activeStaff = staffList.filter((s) => s.status === 'Active');
        const defaultStaff = activeStaff.length > 0 ? activeStaff[0] : staffList[0];
        if (defaultStaff) {
          setStaffId(defaultStaff.id);
          setBasicSalary(defaultStaff.monthlySalary.toString());
        } else {
          setStaffId('');
          setBasicSalary('0');
        }
        setMonth('September 2026');
        setBonus('0');
        setCommission('0');
        setDeductions('0');
        setOtherPayments('0');
        setPaymentStatus('Paid');
        setPaymentDate(new Date().toISOString().split('T')[0]);
        setNotes('');
      }
    }
  }, [isOpen, salaryToEdit, staffList]);

  const handleStaffChange = (selectedId: string) => {
    setStaffId(selectedId);
    const selected = staffList.find((s) => s.id === selectedId);
    if (selected) {
      setBasicSalary(selected.monthlySalary.toString());
    }
  };

  const numBasic = Number(basicSalary) || 0;
  const numBonus = Number(bonus) || 0;
  const numCommission = Number(commission) || 0;
  const numDeductions = Number(deductions) || 0;
  const numOther = Number(otherPayments) || 0;

  const computedFinal = Math.max(
    0,
    numBasic + numBonus + numCommission + numOther - numDeductions
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!staffId || staffId.trim() === '') {
      setError('Please select a staff member.');
      return;
    }

    if (staffList.length === 0) {
      setError('No staff members available. Please add a staff member first.');
      return;
    }

    if (numBasic < 0) {
      setError('Basic salary cannot be negative');
      return;
    }

    const selectedStaff = staffList.find((s) => s.id === staffId);
    if (!selectedStaff) {
      setError('Please select a staff member.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        staffId: selectedStaff.id,
        staffName: selectedStaff.name,
        month,
        basicSalary: numBasic,
        bonus: numBonus,
        commission: numCommission,
        deductions: numDeductions,
        otherPayments: numOther,
        paymentStatus,
        paymentDate,
        notes: notes.trim(),
      };

      if (salaryToEdit) {
        await updateSalaryRecord(salaryToEdit.id, payload);
      } else {
        await addSalaryRecord(payload);
      }

      setError('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save salary payment to Supabase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeStaffList = staffList.filter((s) => s.status === 'Active');
  const displayStaffList = activeStaffList.length > 0 ? activeStaffList : staffList;

  const staffOptions =
    displayStaffList.length > 0
      ? displayStaffList.map((s) => ({
          value: s.id,
          label: `${s.name} - Monthly: Rs. ${s.monthlySalary.toLocaleString()}`,
        }))
      : [{ value: '', label: 'No staff members available. Add staff first.' }];

  const statusOptions = [
    { value: 'Paid', label: 'Paid' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Processing', label: 'Processing' },
    { value: 'Partial', label: 'Partial' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={salaryToEdit ? 'Edit Salary Payment' : '+ Add Salary Payment'}
      subtitle={
        salaryToEdit
          ? 'Update salary payment details in public.salary_payments'
          : 'Process staff payroll and calculate final payouts'
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
          <Select
            label="Staff Member"
            options={staffOptions}
            value={staffId}
            onChange={(e) => handleStaffChange(e.target.value)}
            icon={<User className="w-4 h-4 text-purple-400" />}
            disabled={staffList.length === 0}
          />

          <Input
            label="Salary Month / Period"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="e.g. September 2026"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Basic Salary (Rs.)"
            type="number"
            value={basicSalary}
            onChange={(e) => setBasicSalary(e.target.value)}
            required
            min="0"
          />

          <Input
            label="Bonus (Rs.)"
            type="number"
            value={bonus}
            onChange={(e) => setBonus(e.target.value)}
            min="0"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Commission (Rs.)"
            type="number"
            value={commission}
            onChange={(e) => setCommission(e.target.value)}
            min="0"
          />

          <Input
            label="Other Payments (Rs.)"
            type="number"
            value={otherPayments}
            onChange={(e) => setOtherPayments(e.target.value)}
            min="0"
          />

          <Input
            label="Deductions (Rs.)"
            type="number"
            value={deductions}
            onChange={(e) => setDeductions(e.target.value)}
            min="0"
          />
        </div>

        {/* Live Final Salary Summary Card */}
        <div className="p-4 bg-purple-950/40 border border-purple-800/60 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider">
              Calculated Final Payout
            </span>
            <p className="text-xs text-slate-400 mt-0.5">Basic + Bonus + Commission + Other - Deductions</p>
          </div>
          <div className="text-right">
            <span className="text-xl font-extrabold text-emerald-400">{formatCurrency(computedFinal)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Payment Status"
            options={statusOptions}
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value as any)}
          />

          <Input
            label="Payment Date"
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            icon={<Calendar className="w-4 h-4 text-purple-400" />}
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
            disabled={staffList.length === 0}
            icon={<CheckCircle className="w-4 h-4" />}
          >
            {salaryToEdit ? 'Save Changes' : 'Generate Salary Payout'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
