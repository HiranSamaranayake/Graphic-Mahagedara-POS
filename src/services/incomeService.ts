import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { DailyIncomeRecord } from '../types';

// Helper function to validate UUID v4 string format
const isUUID = (val: any): boolean =>
  typeof val === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val.trim());

export const fetchDailyIncomeFromDb = async (): Promise<DailyIncomeRecord[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await (supabase.from('daily_income') as any)
      .select('*, staff(id, full_name)')
      .order('date', { ascending: false });

    if (error) {
      console.error('Supabase fetch error (daily_income):', {
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
      date: item.date,
      staffId: item.staff_id || '',
      staffName: item.staff?.full_name || 'Unassigned / General',
      dailyTotal: Number(item.daily_total || 0),
      jobsCount: item.number_of_jobs || 1,
      notes: item.notes || '',
      status: 'Completed',
    }));
  } catch (err) {
    console.error('Unexpected error fetching daily income:', err);
    return [];
  }
};

export const addDailyIncomeToDb = async (
  incomeData: Omit<DailyIncomeRecord, 'id' | 'status'>
): Promise<DailyIncomeRecord> => {
  if (!incomeData.dailyTotal || incomeData.dailyTotal <= 0) {
    throw new Error('Daily total amount must be greater than 0');
  }
  if (!incomeData.jobsCount || incomeData.jobsCount <= 0) {
    throw new Error('Number of jobs must be greater than 0');
  }
  if (!incomeData.date) {
    throw new Error('Date is required');
  }

  if (!isSupabaseConfigured()) {
    throw new Error('Supabase client is not configured.');
  }

  // STEP 1 — CHECK CURRENT AUTH USER
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error("Auth User Error:", authError);
    throw new Error(authError.message);
  }
  if (!user) {
    throw new Error("Please login again before adding daily income.");
  }
  console.log("Current Auth User:", user.id);
  console.log("AUTH USER ID:", user.id);

  // STEP 2 — CHECK WHETHER PROFILE EXISTS IN public.profiles
  let { data: profile, error: profileError } = await (supabase.from('profiles') as any)
    .select('id, full_name, email, role')
    .eq('id', user.id)
    .maybeSingle();

  console.log("Current Profile:", profile);
  console.log("Profile Error:", profileError);

  if (!profile) {
    console.warn(`Profile missing in public.profiles for auth user ${user.id}. Auto-creating profile row...`);
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
      console.error("Failed to auto-create missing profile:", createProfileErr);
      throw new Error("Your user profile is missing. Please contact the administrator or sign up/login again.");
    }
    profile = createdProfile;
  }

  console.log("PROFILE ID:", profile.id);

  // Sanitize staff_id: must be a valid UUID string or null. Never send empty string, name, email, or "undefined"
  const targetStaffId = isUUID(incomeData.staffId) ? incomeData.staffId.trim() : null;

  // Pre-flight check: If a staff_id UUID is provided, verify it exists in public.staff
  if (targetStaffId) {
    const { data: staffExists, error: staffCheckErr } = await (supabase.from('staff') as any)
      .select('id, full_name')
      .eq('id', targetStaffId)
      .maybeSingle();

    if (staffCheckErr) {
      console.error('Pre-flight staff lookup error:', staffCheckErr);
    }

    if (!staffExists) {
      console.error(`Staff ID ${targetStaffId} not found in public.staff table.`);
      throw new Error(`Selected staff ID (${targetStaffId}) does not exist in the database table public.staff. Please refresh or select a valid staff member.`);
    }
  }

  // STEP 5 — DAILY INCOME INSERT PAYLOAD
  const payload = {
    date: incomeData.date,
    staff_id: targetStaffId,
    daily_total: incomeData.dailyTotal,
    number_of_jobs: incomeData.jobsCount,
    notes: incomeData.notes ? incomeData.notes.trim() : null,
    created_by: user.id,
  };

  // STEP 8 — DEBUG LOGS
  console.log("AUTH USER ID:", user.id);
  console.log("PROFILE ID:", profile.id);
  console.log("DAILY INCOME PAYLOAD:", payload);
  console.log("Payload created_by matches Profile ID?:", payload.created_by === profile.id);

  const { data, error } = await (supabase.from('daily_income') as any)
    .insert([payload])
    .select('*, staff(id, full_name)')
    .single();

  if (error) {
    console.error('Supabase INSERT error (daily_income):', {
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
    date: data.date,
    staffId: data.staff_id || '',
    staffName: (data.staff as any)?.full_name || incomeData.staffName || 'Unassigned / General',
    dailyTotal: Number(data.daily_total),
    jobsCount: data.number_of_jobs,
    notes: data.notes || '',
    status: 'Completed',
  };
};

export const updateDailyIncomeInDb = async (
  id: string,
  incomeData: Omit<DailyIncomeRecord, 'id' | 'status'>
): Promise<DailyIncomeRecord> => {
  if (!incomeData.dailyTotal || incomeData.dailyTotal <= 0) {
    throw new Error('Daily total amount must be greater than 0');
  }
  if (!incomeData.jobsCount || incomeData.jobsCount <= 0) {
    throw new Error('Number of jobs must be greater than 0');
  }

  if (!isSupabaseConfigured()) {
    throw new Error('Supabase client is not configured.');
  }

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Authentication session required. Please sign in to update income.');
  }

  const targetStaffId = isUUID(incomeData.staffId) ? incomeData.staffId.trim() : null;

  if (targetStaffId) {
    const { data: staffExists } = await (supabase.from('staff') as any)
      .select('id, full_name')
      .eq('id', targetStaffId)
      .maybeSingle();

    if (!staffExists) {
      throw new Error(`Selected staff ID (${targetStaffId}) does not exist in the database table public.staff.`);
    }
  }

  const payload = {
    date: incomeData.date,
    staff_id: targetStaffId,
    daily_total: incomeData.dailyTotal,
    number_of_jobs: incomeData.jobsCount,
    notes: incomeData.notes ? incomeData.notes.trim() : null,
    updated_at: new Date().toISOString(),
  };

  console.log('Daily Income UPDATE Payload for ID:', id, payload);

  const { data, error } = await (supabase.from('daily_income') as any)
    .update(payload)
    .eq('id', id)
    .select('*, staff(id, full_name)')
    .single();

  if (error) {
    console.error('Supabase UPDATE error (daily_income):', {
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
    date: data.date,
    staffId: data.staff_id || '',
    staffName: (data.staff as any)?.full_name || incomeData.staffName || 'Unassigned / General',
    dailyTotal: Number(data.daily_total),
    jobsCount: data.number_of_jobs,
    notes: data.notes || '',
    status: 'Completed',
  };
};

export const deleteDailyIncomeFromDb = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured()) return;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Authentication session required. Please sign in to delete income.');
  }

  const { error } = await (supabase.from('daily_income') as any)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase DELETE error (daily_income):', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    const detailedMessage = `[Supabase Error ${error.code || ''}]: ${error.message}${error.details ? ` - ${error.details}` : ''}${error.hint ? ` (${error.hint})` : ''}`;
    throw new Error(detailedMessage);
  }
};


