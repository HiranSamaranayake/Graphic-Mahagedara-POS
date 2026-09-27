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
      icon: <DollarSign className="w-5 h-5 text-emerald-400" />,
      onClick: onOpenIncomeModal,
      bgHover: 'hover:border-amber-400/60 hover:bg-amber-400/10',
    },
    {
      title: '+ Add Expense',
      desc: 'Log business & promo cost',
      icon: <CreditCard className="w-5 h-5 text-rose-400" />,
      onClick: onOpenExpenseModal,
      bgHover: 'hover:border-amber-400/60 hover:bg-amber-400/10',
    },
    {
      title: '+ Add Staff',
      desc: 'Register new team member',
      icon: <UserPlus className="w-5 h-5 text-amber-400" />,
      onClick: onOpenStaffModal,
      bgHover: 'hover:border-amber-400/60 hover:bg-amber-400/10',
    },
    {
      title: '+ Add Salary',
      desc: 'Generate salary payout record',
      icon: <Wallet className="w-5 h-5 text-yellow-300" />,
      onClick: onOpenSalaryModal,
      bgHover: 'hover:border-amber-400/60 hover:bg-amber-400/10',
    },
  ];

  return (
    <div className="mb-6">
      <h3 className="text-sm font-black text-zinc-300 uppercase tracking-wider mb-3">
        Quick Action Controls
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {actions.map((act, idx) => (
          <button
            key={idx}
            onClick={act.onClick}
            className={`p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-left transition-all duration-200 group flex flex-col justify-between cursor-pointer ${act.bgHover} shadow-md shadow-zinc-950/40`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2.5 bg-zinc-800/80 rounded-xl group-hover:scale-110 transition-transform">
                {act.icon}
              </div>
              <span className="text-xs font-bold text-amber-400 group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </div>
            <div>
              <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors">
                {act.title}
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">{act.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
