import React from 'react';

export const LoadingState: React.FC<{ message?: string }> = ({
  message = 'Loading Graphic Mahagedara POS...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] p-8">
      <div className="relative w-12 h-12 mb-4">
        <div className="absolute inset-0 rounded-full border-4 border-purple-900/30"></div>
        <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin"></div>
      </div>
      <p className="text-sm font-medium text-slate-400 animate-pulse">{message}</p>
    </div>
  );
};
