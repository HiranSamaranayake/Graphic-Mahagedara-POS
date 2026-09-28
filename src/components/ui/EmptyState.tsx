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
  icon = <FolderOpen className="w-12 h-12 text-teal-600" />,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-slate-200 rounded-2xl shadow-xs">
      <div className="p-4 bg-teal-50 rounded-2xl mb-4 text-teal-600 border border-teal-200">
        {icon}
      </div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6 font-medium">{description}</p>
      {action}
    </div>
  );
};
