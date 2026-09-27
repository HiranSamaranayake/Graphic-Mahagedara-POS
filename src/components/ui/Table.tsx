import React from 'react';

export interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No records found',
  onRowClick,
}: TableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 bg-slate-900/50 border border-slate-800 rounded-2xl">
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  const renderCellContent = (row: T, column: Column<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(row);
    }
    return row[column.accessor] as React.ReactNode;
  };

  return (
    <div className="w-full">
      {/* Desktop & Tablet Table View */}
      <div className="hidden sm:block overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900/80 shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              {columns.map((col, idx) => (
                <th key={idx} className={`px-5 py-4 ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm text-slate-200">
            {data.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick && onRowClick(row)}
                className={`transition-colors duration-150 ${
                  onRowClick ? 'cursor-pointer hover:bg-purple-950/20' : 'hover:bg-slate-800/40'
                }`}
              >
                {columns.map((col, idx) => (
                  <td key={idx} className={`px-5 py-4 ${col.className || ''}`}>
                    {renderCellContent(row, col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="sm:hidden flex flex-col gap-3">
        {data.map((row) => (
          <div
            key={keyExtractor(row)}
            onClick={() => onRowClick && onRowClick(row)}
            className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-2.5 shadow-md active:border-purple-500/50"
          >
            {columns.map((col, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-400 uppercase">{col.header}:</span>
                <span className="text-slate-100 text-right">{renderCellContent(row, col)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
