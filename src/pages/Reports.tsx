import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useApp } from '../context/AppContext';
import { expenseCategories } from '../components/forms/AddExpenseModal';
import { FileText, Download, Printer, Calendar, User, Tag, Sparkles } from 'lucide-react';

export const Reports: React.FC = () => {
  const { staffList, addToast } = useApp();

  const [dateFrom, setDateFrom] = useState<string>('2026-09-01');
  const [dateTo, setDateTo] = useState<string>('2026-09-27');
  const [selectedStaff, setSelectedStaff] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeReport, setActiveReport] = useState<string>('Monthly Income Report');

  const reportTypes = [
    { title: 'Daily Income Report', desc: 'Detailed log of daily revenue submissions by staff' },
    { title: 'Monthly Income Report', desc: 'Gross monthly earnings & job count summary' },
    { title: 'Expense Report', desc: 'Categorized operational costs, ad boosts & bills' },
    { title: 'Profit Report', desc: 'Net profit margins & revenue-to-expense ratios' },
    { title: 'Staff Earnings Report', desc: 'Individual staff revenue generated vs earnings' },
    { title: 'Salary Report', desc: 'Payroll disbursement audit & deduction history' },
  ];

  const handleGenerate = (type: string) => {
    setActiveReport(type);
    addToast({
      type: 'info',
      title: 'Report Generated',
      message: `${type} compiled for range ${dateFrom} to ${dateTo}.`,
    });
  };

  const handleExportCSV = () => {
    addToast({
      type: 'success',
      title: 'CSV Export Initiated',
      message: `Downloading ${activeReport}.csv (Stage 1 Demo UI placeholder)`,
    });
  };

  const handleExportPDF = () => {
    addToast({
      type: 'success',
      title: 'PDF Export Ready',
      message: `Exporting printable PDF for ${activeReport}...`,
    });
    window.print();
  };

  const staffOptions = [
    { value: 'ALL', label: 'All Staff Members' },
    ...staffList.map((s) => ({ value: s.id, label: s.name })),
  ];

  const categoryOptions = [
    { value: 'ALL', label: 'All Categories' },
    ...expenseCategories.map((c) => ({ value: c, label: c })),
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Financial & Operational Reports"
        subtitle="Generate, preview and export custom business accounting reports for Graphic Mahagedara"
      />

      {/* Filter Control Bar */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4 no-print">
        <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800/80 pb-3">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Report Generation Parameters & Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            label="Date From"
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            icon={<Calendar className="w-4 h-4 text-purple-400" />}
          />

          <Input
            label="Date To"
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            icon={<Calendar className="w-4 h-4 text-purple-400" />}
          />

          <Select
            label="Filter Staff"
            options={staffOptions}
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            icon={<User className="w-4 h-4 text-purple-400" />}
          />

          <Select
            label="Filter Expense Category"
            options={categoryOptions}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            icon={<Tag className="w-4 h-4 text-purple-400" />}
          />
        </div>
      </div>

      {/* Report Types Cards */}
      <div className="space-y-3 no-print">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
          Available Standard Reports
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((rep) => {
            const isSelected = activeReport === rep.title;
            return (
              <div
                key={rep.title}
                onClick={() => handleGenerate(rep.title)}
                className={`p-5 bg-slate-900 border rounded-2xl transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-purple-500 bg-purple-950/20 ring-1 ring-purple-500/50 shadow-lg'
                    : 'border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 bg-slate-800 rounded-xl text-purple-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    {isSelected && (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold bg-purple-600 text-white rounded-md">
                        Active
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-white text-base">{rep.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{rep.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-xs text-purple-400 font-semibold">Click to preview</span>
                  <span className="text-xs text-slate-400">→</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Report Preview Container */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              Selected Report Preview
            </span>
            <h3 className="text-xl font-extrabold text-white mt-0.5">{activeReport}</h3>
            <p className="text-xs text-slate-400 mt-1">
              Period: {dateFrom} to {dateTo} | Graphic Mahagedara
            </p>
          </div>

          <div className="flex items-center gap-3 no-print">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportCSV}
              icon={<Download className="w-4 h-4" />}
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportPDF}
              icon={<Printer className="w-4 h-4" />}
            >
              Export PDF
            </Button>
          </div>
        </div>

        {/* Mock Report Table Content */}
        <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs space-y-3">
          <div className="flex justify-between items-center text-slate-400 font-semibold border-b border-slate-800 pb-2">
            <span>PARAMETER / METRIC</span>
            <span>AUDIT VALUE</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-300">Total Income Entries Recorded:</span>
            <span className="font-bold text-white">6 Entries</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-300">Gross Period Revenue:</span>
            <span className="font-bold text-emerald-400">Rs. 150,000</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-slate-300">Total Operating Expenses:</span>
            <span className="font-bold text-rose-400">Rs. 62,000</span>
          </div>
          <div className="flex justify-between items-center py-1 border-t border-slate-800/80 pt-2 text-sm font-bold">
            <span className="text-purple-300">Net Business Profit:</span>
            <span className="text-emerald-400">Rs. 88,000</span>
          </div>
        </div>
      </div>
    </div>
  );
};
