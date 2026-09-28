export type Role = 'Admin' | 'Staff';

export type StaffCategory = 'Call Center Operator' | 'Graphic Designer';

export type SalaryType =
  | 'Fixed Monthly'
  | 'Fixed'
  | 'Commission'
  | 'Per Job'
  | 'Percentage'
  | 'Hybrid';

export type TransactionType = 'Income' | 'Expense';

export type ExpenseCategory =
  | 'Salaries'
  | 'Facebook Boost'
  | 'Advertising'
  | 'Software'
  | 'Internet'
  | 'Electricity'
  | 'Equipment'
  | 'Transport'
  | 'Office Expenses'
  | 'Other';

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  staffCategory?: StaffCategory;
  phone: string;
  email?: string;
  joiningDate: string;
  salaryType: SalaryType;
  monthlySalary: number;
  commissionPercentage?: number;
  status: 'Active' | 'Inactive' | 'On Leave';
  notes?: string;
  jobsCompleted: number;
  revenueGenerated: number;
  commission: number;
}

export interface DailyIncomeRecord {
  id: string;
  date: string;
  staffId: string;
  staffName: string;
  jobsCount: number;
  dailyTotal: number;
  notes?: string;
  status: 'Completed' | 'Pending Verification';
}

export interface ExpenseRecord {
  id: string;
  date: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  paidBy: string;
  notes?: string;
  status: 'Paid' | 'Pending';
}

export interface SalaryRecord {
  id: string;
  staffId: string;
  staffName: string;
  month: string;
  basicSalary: number;
  bonus: number;
  commission: number;
  deductions: number;
  otherPayments?: number;
  finalSalary: number;
  paymentStatus: 'Paid' | 'Pending' | 'Processing' | 'Partial';
  paymentDate: string;
  notes?: string;
}

export interface RecentTransaction {
  id: string;
  date: string;
  type: TransactionType;
  description: string;
  staff: string;
  amount: number;
  status: 'Completed' | 'Paid' | 'Pending';
}

export interface MonthlyRevenueData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  jobs: number;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

export interface DailyPostCountRecord {
  id: string;
  staffId: string;
  staffName?: string;
  postDate: string;
  postCount: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}
