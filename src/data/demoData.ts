import type {
  StaffMember,
  DailyIncomeRecord,
  ExpenseRecord,
  SalaryRecord,
  RecentTransaction,
  MonthlyRevenueData,
} from '../types';

// Real empty initial states for fresh Supabase database integration
export const INITIAL_STAFF: StaffMember[] = [];
export const INITIAL_DAILY_INCOME: DailyIncomeRecord[] = [];
export const INITIAL_EXPENSES: ExpenseRecord[] = [];
export const INITIAL_SALARIES: SalaryRecord[] = [];
export const INITIAL_RECENT_TRANSACTIONS: RecentTransaction[] = [];

export const MONTHLY_DATA_6_MONTHS: MonthlyRevenueData[] = [];
export const MONTHLY_DATA_12_MONTHS: MonthlyRevenueData[] = [];
export const THIS_YEAR_DATA: MonthlyRevenueData[] = [];
export const EXPENSE_CATEGORY_BREAKDOWN: { category: string; amount: number; percentage: number; color: string }[] = [];

export const DASHBOARD_METRICS_INITIAL = {
  todaysRevenue: 0,
  thisMonthsRevenue: 0,
  thisMonthsExpenses: 0,
  netProfit: 0,
  previousMonthProfit: 0,
  profitChangePercent: 0,
  totalJobs: 0,
  staffCount: 0,
};
