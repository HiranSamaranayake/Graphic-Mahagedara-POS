import type { DailyIncomeRecord, ExpenseRecord, SalaryRecord } from '../types';

/**
 * Calculates sum of daily income records
 */
export const calculateTotalIncome = (records: DailyIncomeRecord[]): number => {
  return records.reduce((sum, item) => sum + item.dailyTotal, 0);
};

/**
 * Calculates total expenses
 */
export const calculateTotalExpenses = (records: ExpenseRecord[]): number => {
  return records.reduce((sum, item) => sum + item.amount, 0);
};

/**
 * Calculates Net Profit (Revenue - Expenses)
 */
export const calculateNetProfit = (revenue: number, expenses: number): number => {
  return revenue - expenses;
};

/**
 * Calculates percentage change between current and previous values
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / Math.abs(previous)) * 100;
};

/**
 * Calculates final salary for a staff member: Basic + Bonus + Commission - Deductions
 */
export const calculateFinalSalary = (
  basicSalary: number,
  bonus: number,
  commission: number,
  deductions: number
): number => {
  return Math.max(0, basicSalary + bonus + commission - deductions);
};

/**
 * Calculates total staff salary payout
 */
export const calculateTotalSalaryPayout = (salaries: SalaryRecord[]): number => {
  return salaries.reduce((sum, sal) => sum + sal.finalSalary, 0);
};
