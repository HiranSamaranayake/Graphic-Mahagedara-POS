import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { User, Calendar, CheckCircle, AlertCircle } from 'lucide-react';

export interface AddSalaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddSalaryModal: React.FC<AddSalaryModalProps> = ({ isOpen, onClose }) => {
  const { staffList, addSalaryRecord } = useApp();

  const [staffId, setStaffId] = useState<string>('');
  const [month, setMonth] = useState<string>('September 2026');
  const [basicSalary, setBasicSalary] = useState<string>('0');
  const [bonus, setBonus] = useState<string>('0');
  const [commission, setCommission] = useState<string>('0');
  const [deductions, setDeductions] = useState<string>('0');
  const [otherPayments, setOtherPayments] = useState<string>('0');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Pending' | 'Processing'>('Paid');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (staffList.length > 0) {
      if (!staffId || !staffList.some((s) => s.id === staffId)) {
        const first = staffList[0];
        setStaffId(first.id);
        setBasicSalary(first.monthlySalary.toString());
      }
    }
  }, [staffList, staffId]);

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

    if (staffList.length === 0) {
      setError('No staff members available. Please add a staff member first.');
      return;
    }

    if (numBasic < 0) {
      setError('Basic salary cannot be negative');
      return;
    }

    const selectedStaff = staffList.find((s) => s.id === staffId) || staffList[0];

    setIsSubmitting(true);
    try {
      await addSalaryRecord({
        staffId: selectedStaff ? selectedStaff.id : '',
        staffName: selectedStaff ? selectedStaff.name : 'Staff Member',
        month,
        basicSalary: numBasic,
        bonus: numBonus,
        commission: numCommission,
        deductions: numDeductions,
        otherPayments: numOther,
        paymentStatus,
        paymentDate,
        notes: notes.trim(),
      });

      // Reset form on success
      setBonus('0');
      setDeductions('0');
      setOtherPayments('0');
      setNotes('');
      setError('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save salary payment to Supabase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const staffOptions =
    staffList.length > 0
      ? staffList.map((s) => ({
          value: s.id,
          label: `${s.name} - Monthly: Rs. ${s.monthlySalary.toLocaleString()}`,
        }))
      : [{ value: '', label: 'No staff members available. Add staff first.' }];

  const statusOptions = [
    { value: 'Paid', label: 'Paid' },
    { value: 'Processing', label: 'Processing' },
    { value: 'Pending', label: 'Pending' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="+ Add Salary Payment"
      subtitle="Process staff payroll and calculate final payouts"
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
            Generate Salary Payout
          </Button>
        </div>
      </form>
    </Modal>
  );
};
