import React from 'react';
import { DollarSign, CreditCard, UserPlus, Wallet } from 'lucide-react';

export interface QuickActionsProps {
  onOpenIncomeModal: () => void;
  onOpenExpenseModal: () => void;
  onOpenStaffModal: () => void;
  onOpenSalaryModal: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onOpenIncomeModal,
  onOpenExpenseModal,
  onOpenStaffModal,
  onOpenSalaryModal,
}) => {
  const actions = [
    {
      title: '+ Add Daily Income',
      desc: 'Record today\'s design revenue',
      icon: <DollarSign className="w-5 h-5 text-emerald-600" />,
      onClick: onOpenIncomeModal,
    },
    {
      title: '+ Add Expense',
      desc: 'Log business & promo cost',
      icon: <CreditCard className="w-5 h-5 text-rose-600" />,
      onClick: onOpenExpenseModal,
    },
    {
      title: '+ Add Staff',
      desc: 'Register new team member',
      icon: <UserPlus className="w-5 h-5 text-teal-600" />,
      onClick: onOpenStaffModal,
    },
    {
      title: '+ Add Salary',
      desc: 'Generate salary payout record',
      icon: <Wallet className="w-5 h-5 text-cyan-600" />,
      onClick: onOpenSalaryModal,
    },
  ];

  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-3">
        Quick Action Controls
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {actions.map((act, idx) => (
          <button
            key={idx}
            onClick={act.onClick}
            className="p-4 bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50/50 rounded-2xl text-left transition-all duration-200 group flex flex-col justify-between cursor-pointer shadow-xs"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl group-hover:scale-110 transition-transform">
                {act.icon}
              </div>
              <span className="text-xs font-bold text-teal-600 group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 group-hover:text-teal-700 transition-colors">
                {act.title}
              </h4>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">{act.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
