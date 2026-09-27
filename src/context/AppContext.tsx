import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type {
  StaffMember,
  DailyIncomeRecord,
  ExpenseRecord,
  SalaryRecord,
  ToastMessage,
} from '../types';
import { supabase } from '../lib/supabase';
import {
  fetchStaffFromDb,
  addStaffToDb,
} from '../services/staffService';
import {
  fetchDailyIncomeFromDb,
  addDailyIncomeToDb,
  updateDailyIncomeInDb,
  deleteDailyIncomeFromDb,
} from '../services/incomeService';
import {
  fetchExpensesFromDb,
  addExpenseToDb,
  updateExpenseInDb,
  deleteExpenseFromDb,
} from '../services/expenseService';
import {
  fetchSalariesFromDb,
  addSalaryRecordToDb,
  updateSalaryStatusInDb,
} from '../services/salaryService';

interface AppContextType {
  staffList: StaffMember[];
  dailyIncomeList: DailyIncomeRecord[];
  expenseList: ExpenseRecord[];
  salaryList: SalaryRecord[];
  toasts: ToastMessage[];
  theme: 'dark' | 'light';
  mobileMenuOpen: boolean;
  isLoadingData: boolean;
  toggleTheme: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  refreshData: () => Promise<void>;
  addStaff: (staff: Omit<StaffMember, 'id' | 'jobsCompleted' | 'revenueGenerated' | 'commission'>) => Promise<void>;
  addDailyIncome: (income: Omit<DailyIncomeRecord, 'id' | 'status'>) => Promise<void>;
  updateDailyIncome: (id: string, income: Omit<DailyIncomeRecord, 'id' | 'status'>) => Promise<void>;
  deleteDailyIncome: (id: string) => Promise<void>;
  addExpense: (expense: Omit<ExpenseRecord, 'id' | 'status'>) => Promise<void>;
  updateExpense: (id: string, expense: Omit<ExpenseRecord, 'id' | 'status'>) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addSalaryRecord: (salary: Omit<SalaryRecord, 'id' | 'finalSalary'>) => Promise<void>;
  updateSalaryStatus: (id: string, status: SalaryRecord['paymentStatus']) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [dailyIncomeList, setDailyIncomeList] = useState<DailyIncomeRecord[]>([]);
  const [expenseList, setExpenseList] = useState<ExpenseRecord[]>([]);
  const [salaryList, setSalaryList] = useState<SalaryRecord[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  const refreshData = async () => {
    setIsLoadingData(true);
    try {
      const [staffData, incomeData, expenseData, salaryData] = await Promise.all([
        fetchStaffFromDb(),
        fetchDailyIncomeFromDb(),
        fetchExpensesFromDb(),
        fetchSalariesFromDb(),
      ]);

      setStaffList(staffData);
      setDailyIncomeList(incomeData);
      setExpenseList(expenseData);
      setSalaryList(salaryData);
    } catch (err) {
      console.error('Error loading Supabase data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    refreshData();

    // Re-fetch data when Supabase auth session is ready or restored
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        refreshData();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addStaff = async (
    staffData: Omit<StaffMember, 'id' | 'jobsCompleted' | 'revenueGenerated' | 'commission'>
  ) => {
    try {
      const created = await addStaffToDb(staffData);
      setStaffList((prev) => [created, ...prev]);
      addToast({
        type: 'success',
        title: 'Staff Member Registered',
        message: `${created.name} successfully saved to public.staff table.`,
      });
      // Ensure full database sync
      await refreshData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Failed to Add Staff',
        message: err?.message || 'Database error occurred.',
      });
      throw err;
    }
  };

  const addDailyIncome = async (incomeData: Omit<DailyIncomeRecord, 'id' | 'status'>) => {
    try {
      const created = await addDailyIncomeToDb(incomeData);
      setDailyIncomeList((prev) => [created, ...prev]);
      addToast({
        type: 'success',
        title: 'Income Recorded',
        message: `Rs. ${incomeData.dailyTotal.toLocaleString()} daily income added successfully.`,
      });
      await refreshData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Failed to Add Income',
        message: err?.message || 'Database error occurred.',
      });
      throw err;
    }
  };

  const updateDailyIncome = async (
    id: string,
    incomeData: Omit<DailyIncomeRecord, 'id' | 'status'>
  ) => {
    try {
      const updated = await updateDailyIncomeInDb(id, incomeData);
      setDailyIncomeList((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
      addToast({
        type: 'success',
        title: 'Income Record Updated',
        message: `Income record for ${incomeData.date} updated in public.daily_income.`,
      });
      await refreshData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Failed to Update Income',
        message: err?.message || 'Database update error occurred.',
      });
      throw err;
    }
  };

  const deleteDailyIncome = async (id: string) => {
    try {
      await deleteDailyIncomeFromDb(id);
      setDailyIncomeList((prev) => prev.filter((item) => item.id !== id));
      addToast({
        type: 'info',
        title: 'Income Record Deleted',
        message: 'Daily income record removed from Supabase.',
      });
      await refreshData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Failed to Delete Income',
        message: err?.message || 'Database delete error occurred.',
      });
      throw err;
    }
  };

  const addExpense = async (expenseData: Omit<ExpenseRecord, 'id' | 'status'>) => {
    try {
      const created = await addExpenseToDb(expenseData);
      setExpenseList((prev) => [created, ...prev]);
      addToast({
        type: 'success',
        title: 'Expense Recorded',
        message: `Rs. ${expenseData.amount.toLocaleString()} recorded under ${expenseData.category}.`,
      });
      await refreshData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Failed to Add Expense',
        message: err?.message || 'Database error occurred.',
      });
      throw err;
    }
  };

  const updateExpense = async (
    id: string,
    expenseData: Omit<ExpenseRecord, 'id' | 'status'>
  ) => {
    try {
      const updated = await updateExpenseInDb(id, expenseData);
      setExpenseList((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      );
      addToast({
        type: 'success',
        title: 'Expense Updated',
        message: `Expense record updated in public.expenses.`,
      });
      await refreshData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Failed to Update Expense',
        message: err?.message || 'Database update error occurred.',
      });
      throw err;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await deleteExpenseFromDb(id);
      setExpenseList((prev) => prev.filter((item) => item.id !== id));
      addToast({
        type: 'info',
        title: 'Expense Deleted',
        message: 'Expense record removed from Supabase.',
      });
      await refreshData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Failed to Delete Expense',
        message: err?.message || 'Database delete error occurred.',
      });
      throw err;
    }
  };

  const addSalaryRecord = async (salaryData: Omit<SalaryRecord, 'id' | 'finalSalary'>) => {
    try {
      const created = await addSalaryRecordToDb(salaryData);
      if (created) {
        setSalaryList((prev) => [created, ...prev]);
      }
      addToast({
        type: 'success',
        title: 'Salary Payment Generated',
        message: `Salary payment record added for ${salaryData.staffName}.`,
      });
      await refreshData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Failed to Save Salary',
        message: err?.message || 'Database error occurred.',
      });
      throw err;
    }
  };

  const updateSalaryStatus = async (id: string, status: SalaryRecord['paymentStatus']) => {
    try {
      await updateSalaryStatusInDb(id, status);
      setSalaryList((prev) =>
        prev.map((s) => (s.id === id ? { ...s, paymentStatus: status } : s))
      );
      addToast({
        type: 'info',
        title: 'Status Updated',
        message: `Salary payment status updated to ${status}.`,
      });
      await refreshData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err?.message || 'Database error occurred.',
      });
      throw err;
    }
  };

  return (
    <AppContext.Provider
      value={{
        staffList,
        dailyIncomeList,
        expenseList,
        salaryList,
        toasts,
        theme,
        mobileMenuOpen,
        isLoadingData,
        toggleTheme,
        setMobileMenuOpen,
        addToast,
        removeToast,
        refreshData,
        addStaff,
        addDailyIncome,
        updateDailyIncome,
        deleteDailyIncome,
        addExpense,
        updateExpense,
        deleteExpense,
        addSalaryRecord,
        updateSalaryStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
