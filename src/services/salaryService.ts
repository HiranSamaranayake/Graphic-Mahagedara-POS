import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { SalaryRecord } from '../types';

const isUUID = (val: any): boolean =>
  typeof val === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim());

export const fetchSalariesFromDb = async (): Promise<SalaryRecord[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await (supabase.from('salary_payments') as any)
      .select('*, staff(id, full_name)')
      .order('salary_month', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('SUPABASE SALARY ERROR:', error);
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
      otherPayments: Number(item.other_payments || 0),
      finalSalary: Number(item.final_salary || 0),
      paymentStatus: item.payment_status || 'Pending',
      paymentDate: item.payment_date || '',
      notes: item.notes || undefined,
    }));
  } catch (err) {
    console.error('Unexpected error fetching salaries from Supabase:', err);
    return [];
  }
};

export const addSalaryRecordToDb = async (
  salaryData: Omit<SalaryRecord, 'id' | 'finalSalary'> & { otherPayments?: number }
): Promise<SalaryRecord> => {
  if (salaryData.basicSalary < 0) {
    throw new Error('Basic salary cannot be negative');
  }

  if (!isSupabaseConfigured()) {
    throw new Error('Supabase client is not configured.');
  }

  // STEP 3 — AUTHENTICATION CHECK
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error('Auth User Error (Salary):', authError);
    throw new Error(authError.message);
  }
  if (!user) {
    throw new Error('Please login again before recording salary.');
  }

  console.log('AUTH USER ID (Salary):', user.id);

  // VERIFY / AUTO-CREATE PROFILE IN public.profiles
  let { data: profile, error: profileError } = await (supabase.from('profiles') as any)
    .select('id, full_name, email, role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('Profile Error (Salary):', profileError);
  }

  if (!profile) {
    console.warn(`Profile missing in public.profiles for auth user ${user.id}. Auto-creating profile...`);
    const newProfile = {
      id: user.id,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin User',
      email: user.email || '',
      role: user.email?.includes('admin') ? 'admin' : 'staff',
    };

    const { data: createdProfile, error: createProfileErr } = await (supabase.from('profiles') as any)
      .upsert([newProfile])
      .select('id, full_name, email, role')
      .single();

    if (createProfileErr || !createdProfile) {
      console.error('Failed to auto-create missing profile for salary:', createProfileErr);
      throw new Error('Your user profile is missing. Please contact administrator or sign in again.');
    }
    profile = createdProfile;
  }

  // STEP 2 — STAFF VERIFICATION
  const targetStaffId = isUUID(salaryData.staffId) ? salaryData.staffId.trim() : null;
  if (!targetStaffId) {
    throw new Error('Please select a staff member.');
  }

  const { data: staffExists } = await (supabase.from('staff') as any)
    .select('id, full_name')
    .eq('id', targetStaffId)
    .maybeSingle();

  if (!staffExists) {
    throw new Error(`Selected staff member (ID: ${targetStaffId}) does not exist in public.staff.`);
  }

  // STEP 4 — SALARY CALCULATION
  const numBasic = Number(salaryData.basicSalary || 0);
  const numBonus = Number(salaryData.bonus || 0);
  const numCommission = Number(salaryData.commission || 0);
  const numOther = Number(salaryData.otherPayments || 0);
  const numDeductions = Number(salaryData.deductions || 0);

  const computedFinal = Math.max(0, numBasic + numBonus + numCommission + numOther - numDeductions);

  // STEP 5 — PAYLOAD
  const payload = {
    staff_id: targetStaffId,
    salary_month: salaryData.month,
    basic_salary: numBasic,
    bonus: numBonus,
    commission: numCommission,
    deductions: numDeductions,
    other_payments: numOther,
    final_salary: computedFinal,
    payment_status: salaryData.paymentStatus,
    payment_date: salaryData.paymentDate || null,
    notes: salaryData.notes ? salaryData.notes.trim() : null,
    created_by: user.id,
  };

  console.log('SALARY INSERT PAYLOAD:', payload);

  const { data, error } = await (supabase.from('salary_payments') as any)
    .insert([payload])
    .select('*, staff(id, full_name)')
    .single();

  if (error) {
    console.error('SUPABASE SALARY ERROR:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    const detailedMessage = `[Supabase Error ${error.code || ''}]: ${error.message}${error.details ? ` - ${error.details}` : ''}${error.hint ? ` (${error.hint})` : ''}`;
    throw new Error(detailedMessage);
  }

  return {
    id: data.id,
    staffId: data.staff_id,
    staffName: (data.staff as any)?.full_name || salaryData.staffName || 'Staff Member',
    month: data.salary_month,
    basicSalary: Number(data.basic_salary),
    bonus: Number(data.bonus),
    commission: Number(data.commission),
    deductions: Number(data.deductions),
    otherPayments: Number(data.other_payments || 0),
    finalSalary: Number(data.final_salary),
    paymentStatus: data.payment_status,
    paymentDate: data.payment_date || '',
    notes: data.notes || undefined,
  };
};

export const updateSalaryInDb = async (
  id: string,
  salaryData: Omit<SalaryRecord, 'id' | 'finalSalary'> & { otherPayments?: number }
): Promise<SalaryRecord> => {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase client is not configured.');
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Please login again before updating salary record.');
  }

  const targetStaffId = isUUID(salaryData.staffId) ? salaryData.staffId.trim() : null;
  if (!targetStaffId) {
    throw new Error('Please select a valid staff member.');
  }

  const numBasic = Number(salaryData.basicSalary || 0);
  const numBonus = Number(salaryData.bonus || 0);
  const numCommission = Number(salaryData.commission || 0);
  const numOther = Number(salaryData.otherPayments || 0);
  const numDeductions = Number(salaryData.deductions || 0);

  const computedFinal = Math.max(0, numBasic + numBonus + numCommission + numOther - numDeductions);

  const payload = {
    staff_id: targetStaffId,
    salary_month: salaryData.month,
    basic_salary: numBasic,
    bonus: numBonus,
    commission: numCommission,
    deductions: numDeductions,
    other_payments: numOther,
    final_salary: computedFinal,
    payment_status: salaryData.paymentStatus,
    payment_date: salaryData.paymentDate || null,
    notes: salaryData.notes ? salaryData.notes.trim() : null,
    updated_at: new Date().toISOString(),
  };

  console.log('SALARY UPDATE PAYLOAD for ID:', id, payload);

  const { data, error } = await (supabase.from('salary_payments') as any)
    .update(payload)
    .eq('id', id)
    .select('*, staff(id, full_name)')
    .single();

  if (error) {
    console.error('SUPABASE SALARY UPDATE ERROR:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    const detailedMessage = `[Supabase Error ${error.code || ''}]: ${error.message}${error.details ? ` - ${error.details}` : ''}${error.hint ? ` (${error.hint})` : ''}`;
    throw new Error(detailedMessage);
  }

  return {
    id: data.id,
    staffId: data.staff_id,
    staffName: (data.staff as any)?.full_name || salaryData.staffName || 'Staff Member',
    month: data.salary_month,
    basicSalary: Number(data.basic_salary),
    bonus: Number(data.bonus),
    commission: Number(data.commission),
    deductions: Number(data.deductions),
    otherPayments: Number(data.other_payments || 0),
    finalSalary: Number(data.final_salary),
    paymentStatus: data.payment_status,
    paymentDate: data.payment_date || '',
    notes: data.notes || undefined,
  };
};

export const updateSalaryStatusInDb = async (
  id: string,
  status: SalaryRecord['paymentStatus']
): Promise<void> => {
  if (!isSupabaseConfigured()) return;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Please login again before updating payment status.');
  }

  const { error } = await (supabase.from('salary_payments') as any)
    .update({ payment_status: status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('SUPABASE SALARY STATUS ERROR:', error);
    throw new Error(error.message);
  }
};

export const deleteSalaryFromDb = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured()) return;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Please login again before deleting salary record.');
  }

  const { error } = await (supabase.from('salary_payments') as any)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('SUPABASE SALARY DELETE ERROR:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    const detailedMessage = `[Supabase Error ${error.code || ''}]: ${error.message}${error.details ? ` - ${error.details}` : ''}${error.hint ? ` (${error.hint})` : ''}`;
    throw new Error(detailedMessage);
  }
};

