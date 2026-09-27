import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { ExpenseRecord } from '../types';

export const fetchExpensesFromDb = async (): Promise<ExpenseRecord[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await (supabase.from('expenses') as any)
      .select('*')
      .order('expense_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error (expenses):', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((item: any) => ({
      id: item.id,
      date: item.expense_date,
      category: item.category,
      description: item.description,
      amount: Number(item.amount || 0),
      paidBy: item.paid_by || 'Admin',
      notes: item.notes || undefined,
      status: 'Paid',
    }));
  } catch (err) {
    console.error('Unexpected error fetching expenses:', err);
    return [];
  }
};

export const addExpenseToDb = async (
  expenseData: Omit<ExpenseRecord, 'id' | 'status'>
): Promise<ExpenseRecord> => {
  if (!expenseData.amount || expenseData.amount <= 0) {
    throw new Error('Expense amount must be greater than 0');
  }
  if (!expenseData.description || !expenseData.description.trim()) {
    throw new Error('Expense description is required');
  }
  if (!expenseData.date) {
    throw new Error('Date is required');
  }

  if (!isSupabaseConfigured()) {
    throw new Error('Supabase client is not configured.');
  }

  // STEP 2 — GET AUTHENTICATED USER
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error('Auth User Error:', authError);
    throw new Error(authError.message);
  }
  if (!user) {
    throw new Error('Please login again before adding an expense.');
  }

  console.log('AUTH USER ID (Expense):', user.id);

  // VERIFY / AUTO-CREATE PROFILE IN public.profiles
  let { data: profile, error: profileError } = await (supabase.from('profiles') as any)
    .select('id, full_name, email, role')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('Profile Error (Expense):', profileError);
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
      console.error('Failed to auto-create missing profile for expense:', createProfileErr);
      throw new Error('Your user profile is missing. Please contact administrator or sign in again.');
    }
    profile = createdProfile;
  }

  // STEP 3 & STEP 4 — INSERT PAYLOAD
  const payload = {
    expense_date: expenseData.date,
    category: expenseData.category,
    description: expenseData.description.trim(),
    amount: Number(expenseData.amount),
    paid_by: expenseData.paidBy ? expenseData.paidBy.trim() : 'Admin',
    notes: expenseData.notes ? expenseData.notes.trim() : null,
    created_by: user.id,
  };

  console.log('EXPENSE INSERT PAYLOAD:', payload);

  // STEP 5 — INSERT INTO SUPABASE
  const { data, error } = await (supabase.from('expenses') as any)
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('SUPABASE EXPENSE ERROR:', {
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
    date: data.expense_date,
    category: data.category,
    description: data.description,
    amount: Number(data.amount),
    paidBy: data.paid_by,
    notes: data.notes || undefined,
    status: 'Paid',
  };
};

export const updateExpenseInDb = async (
  id: string,
  expenseData: Omit<ExpenseRecord, 'id' | 'status'>
): Promise<ExpenseRecord> => {
  if (!expenseData.amount || expenseData.amount <= 0) {
    throw new Error('Expense amount must be greater than 0');
  }
  if (!expenseData.description || !expenseData.description.trim()) {
    throw new Error('Expense description is required');
  }

  if (!isSupabaseConfigured()) {
    throw new Error('Supabase client is not configured.');
  }

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Please login again before updating an expense.');
  }

  const payload = {
    expense_date: expenseData.date,
    category: expenseData.category,
    description: expenseData.description.trim(),
    amount: Number(expenseData.amount),
    paid_by: expenseData.paidBy ? expenseData.paidBy.trim() : 'Admin',
    notes: expenseData.notes ? expenseData.notes.trim() : null,
    updated_at: new Date().toISOString(),
  };

  console.log('EXPENSE UPDATE PAYLOAD for ID:', id, payload);

  const { data, error } = await (supabase.from('expenses') as any)
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('SUPABASE EXPENSE UPDATE ERROR:', {
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
    date: data.expense_date,
    category: data.category,
    description: data.description,
    amount: Number(data.amount),
    paidBy: data.paid_by,
    notes: data.notes || undefined,
    status: 'Paid',
  };
};

export const deleteExpenseFromDb = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured()) return;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Please login again before deleting an expense.');
  }

  const { error } = await (supabase.from('expenses') as any)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('SUPABASE EXPENSE DELETE ERROR:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    const detailedMessage = `[Supabase Error ${error.code || ''}]: ${error.message}${error.details ? ` - ${error.details}` : ''}${error.hint ? ` (${error.hint})` : ''}`;
    throw new Error(detailedMessage);
  }
};

