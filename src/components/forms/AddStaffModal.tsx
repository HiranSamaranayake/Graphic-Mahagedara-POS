import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';
import type { SalaryType } from '../../types';
import { User, Briefcase, Phone, Mail, Calendar, DollarSign, UserPlus, Percent, AlertCircle } from 'lucide-react';

export interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const salaryTypes: SalaryType[] = [
  'Fixed Monthly',
  'Fixed',
  'Commission',
  'Per Job',
  'Percentage',
  'Hybrid',
];

export const AddStaffModal: React.FC<AddStaffModalProps> = ({ isOpen, onClose }) => {
  const { addStaff } = useApp();

  const [name, setName] = useState<string>('');
  const [role, setRole] = useState<string>('Graphic Designer');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [joiningDate, setJoiningDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [salaryType, setSalaryType] = useState<SalaryType>('Fixed');
  const [monthlySalary, setMonthlySalary] = useState<string>('');
  const [commissionPercentage, setCommissionPercentage] = useState<string>('0');
  const [status, setStatus] = useState<'Active' | 'Inactive' | 'On Leave'>('Active');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter full name of staff member');
      return;
    }
    if (!monthlySalary || isNaN(Number(monthlySalary)) || Number(monthlySalary) < 0) {
      setError('Please enter a valid monthly salary amount');
      return;
    }

    setIsSubmitting(true);
    try {
      await addStaff({
        name: name.trim(),
        role: role.trim() || 'Graphic Designer',
        phone: phone.trim(),
        email: email.trim() || undefined,
        joiningDate,
        salaryType,
        monthlySalary: Number(monthlySalary),
        commissionPercentage: Number(commissionPercentage) || 0,
        status,
        notes: notes.trim(),
      });

      // Reset form on success
      setName('');
      setRole('Graphic Designer');
      setPhone('');
      setEmail('');
      setMonthlySalary('');
      setCommissionPercentage('0');
      setNotes('');
      setError('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save staff member to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const salaryTypeOptions = salaryTypes.map((st) => ({ value: st, label: st }));
  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' },
    { value: 'On Leave', label: 'On Leave' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="+ Add Staff Member"
      subtitle="Register a new team member to Graphic Mahagedara"
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
            label="Full Name"
            placeholder="e.g. Kasun Perera"
            value={name}
            onChange={(e) => setName(e.target.value)}
            icon={<User className="w-4 h-4 text-purple-400" />}
            required
          />

          <Input
            label="Job Role / Title"
            placeholder="e.g. Graphic Designer"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            icon={<Briefcase className="w-4 h-4 text-purple-400" />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone Number"
            placeholder="e.g. +94 77 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            icon={<Phone className="w-4 h-4 text-purple-400" />}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. kasun@graphicmahagedara.lk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4 text-purple-400" />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Joining Date"
            type="date"
            value={joiningDate}
            onChange={(e) => setJoiningDate(e.target.value)}
            icon={<Calendar className="w-4 h-4 text-purple-400" />}
          />

          <Select
            label="Status"
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value as 'Active' | 'Inactive' | 'On Leave')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Salary Type"
            options={salaryTypeOptions}
            value={salaryType}
            onChange={(e) => setSalaryType(e.target.value as SalaryType)}
          />

          <Input
            label="Monthly Salary (Rs.)"
            type="number"
            placeholder="e.g. 45000"
            value={monthlySalary}
            onChange={(e) => setMonthlySalary(e.target.value)}
            icon={<DollarSign className="w-4 h-4 text-emerald-400" />}
            required
            min="0"
          />
        </div>

        <Input
          label="Commission Percentage (%)"
          type="number"
          placeholder="e.g. 5"
          value={commissionPercentage}
          onChange={(e) => setCommissionPercentage(e.target.value)}
          icon={<Percent className="w-4 h-4 text-purple-400" />}
          min="0"
          max="100"
        />

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
            Notes / Details
          </label>
          <textarea
            rows={2}
            placeholder="Additional staff notes or specialization details..."
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
            icon={<UserPlus className="w-4 h-4" />}
          >
            Save Staff Member
          </Button>
        </div>
      </form>
    </Modal>
  );
};
