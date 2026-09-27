import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { SalaryRecord } from '../types';

export const fetchSalariesFromDb = async (): Promise<SalaryRecord[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await (supabase.from('salary_payments' as any) as any)
      .select('*, staff(full_name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching salaries from Supabase:', error.message);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((item: any) => ({
      id: item.id,
      staffId: item.staff_id,
      staffName: item.staff?.full_name || 'Staff Member',
      month: item.salary_month,
      basicSalary: Number(item.basic_salary || 0),
      bonus: Number(item.bonus || 0),
      commission: Number(item.commission || 0),
      deductions: Number(item.deductions || 0),
      finalSalary: Number(item.final_salary || 0),
      paymentStatus: item.payment_status || 'Pending',
      paymentDate: item.payment_date || '',
    }));
  } catch (err) {
    console.error('Error fetching salaries from Supabase:', err);
    return [];
  }
};

export const addSalaryRecordToDb = async (
  salaryData: Omit<SalaryRecord, 'id' | 'finalSalary'> & { otherPayments?: number }
): Promise<SalaryRecord | null> => {
  if (salaryData.basicSalary < 0) {
    throw new Error('Basic salary cannot be negative');
  }

  const otherVal = salaryData.otherPayments || 0;
  const computedFinal = Math.max(
    0,
    salaryData.basicSalary + salaryData.bonus + salaryData.commission + otherVal - salaryData.deductions
  );

  if (!isSupabaseConfigured()) {
    return null;
  }

  const { data: userData } = await supabase.auth.getUser();

  const isUUID = (id: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  const { data, error } = await (supabase.from('salary_payments' as any) as any)
    .insert([
      {
        staff_id: isUUID(salaryData.staffId) ? salaryData.staffId : null,
        salary_month: salaryData.month,
        basic_salary: salaryData.basicSalary,
        bonus: salaryData.bonus || 0,
        commission: salaryData.commission || 0,
        deductions: salaryData.deductions || 0,
        other_payments: otherVal,
        final_salary: computedFinal,
        payment_status: salaryData.paymentStatus,
        payment_date: salaryData.paymentDate,
        created_by: userData?.user?.id || null,
      },
    ])
    .select('*, staff(full_name)')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: data.id,
    staffId: data.staff_id,
    staffName: (data.staff as any)?.full_name || salaryData.staffName,
    month: data.salary_month,
    basicSalary: Number(data.basic_salary),
    bonus: Number(data.bonus),
    commission: Number(data.commission),
    deductions: Number(data.deductions),
    finalSalary: Number(data.final_salary),
    paymentStatus: data.payment_status,
    paymentDate: data.payment_date || '',
  };
};

export const updateSalaryStatusInDb = async (
  id: string,
  status: SalaryRecord['paymentStatus']
): Promise<void> => {
  if (!isSupabaseConfigured()) return;

  const { error } = await (supabase.from('salary_payments' as any) as any)
    .update({ payment_status: status })
    .eq('id', id);

  if (error) throw new Error(error.message);
};
