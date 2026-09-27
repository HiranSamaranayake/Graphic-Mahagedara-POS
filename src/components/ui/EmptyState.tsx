import React from 'react';
import { FolderOpen } from 'lucide-react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Available',
  description = 'There are no records to display at this time.',
  icon = <FolderOpen className="w-12 h-12 text-slate-500" />,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-slate-900/60 border border-slate-800 rounded-2xl">
      <div className="p-4 bg-slate-800/80 rounded-2xl mb-4 text-purple-400 border border-slate-700/50">
        {icon}
      </div>
      <h3 className="text-base font-bold text-slate-100">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mt-1 mb-6">{description}</p>
      {action}
    </div>
  );
};
