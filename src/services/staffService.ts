import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { StaffMember } from '../types';

export const fetchStaffFromDb = async (): Promise<StaffMember[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await (supabase.from('staff') as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error (staff):', error.message);
      return [];
    }

    // Fetch daily_income to compute real staff performance statistics
    const { data: incomeData } = await (supabase.from('daily_income') as any)
      .select('staff_id, daily_total, number_of_jobs');

    const staffPerfMap: { [id: string]: { jobs: number; revenue: number } } = {};
    if (incomeData && Array.isArray(incomeData)) {
      incomeData.forEach((inc: any) => {
        if (inc.staff_id) {
          if (!staffPerfMap[inc.staff_id]) {
            staffPerfMap[inc.staff_id] = { jobs: 0, revenue: 0 };
          }
          staffPerfMap[inc.staff_id].jobs += Number(inc.number_of_jobs || 1);
          staffPerfMap[inc.staff_id].revenue += Number(inc.daily_total || 0);
        }
      });
    }

    return data.map((item: any) => {
      const perf = staffPerfMap[item.id] || { jobs: 0, revenue: 0 };
      const commPct = Number(item.commission_percentage || 0);
      const computedCommission = (perf.revenue * commPct) / 100;
      const cat = item.staff_category === 'Graphic Designer' ? 'Graphic Designer' : 'Call Center Operator';

      return {
        id: item.id,
        name: item.full_name,
        role: cat,
        staffCategory: cat,
        phone: item.phone || '',
        email: item.email || undefined,
        joiningDate: item.joining_date || new Date().toISOString().split('T')[0],
        salaryType: item.salary_type || 'Fixed',
        monthlySalary: Number(item.monthly_salary || 0),
        commissionPercentage: commPct,
        status: item.status || 'Active',
        notes: item.notes || '',
        jobsCompleted: perf.jobs,
        revenueGenerated: perf.revenue,
        commission: computedCommission,
      };
    });
  } catch (err) {
    console.error('Unexpected error fetching staff:', err);
    return [];
  }
};

export const addStaffToDb = async (
  staffData: Omit<StaffMember, 'id' | 'jobsCompleted' | 'revenueGenerated' | 'commission'> & {
    commissionPercentage?: number;
    notes?: string;
  }
): Promise<StaffMember> => {
  if (!staffData.name.trim()) {
    throw new Error('Full name is required');
  }
  if (staffData.monthlySalary < 0) {
    throw new Error('Monthly salary cannot be negative');
  }

  if (!isSupabaseConfigured()) {
    throw new Error('Supabase client is not configured.');
  }

  // Ensure authenticated user session exists before inserting
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Authentication session required. Please sign in to add a staff member.');
  }

  if (!staffData.staffCategory) {
    throw new Error('Staff Category is required.');
  }

  const payload = {
    full_name: staffData.name.trim(),
    staff_category: staffData.staffCategory,
    email: staffData.email ? staffData.email.trim() : null,
    phone: staffData.phone ? staffData.phone.trim() : null,
    joining_date: staffData.joiningDate,
    salary_type: staffData.salaryType,
    monthly_salary: staffData.monthlySalary,
    commission_percentage: staffData.commissionPercentage || 0,
    status: staffData.status,
    notes: staffData.notes ? staffData.notes.trim() : null,
  };

  const { data, error } = await (supabase.from('staff') as any)
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Supabase INSERT error (staff):', error);
    if (error.message.includes('schema cache') || error.message.includes('does not exist')) {
      throw new Error(
        `Table 'staff' missing in Supabase. Please run supabase/schema.sql in your Supabase SQL Editor.`
      );
    }
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Failed to insert staff member into Supabase database.');
  }

  const cat = data.staff_category === 'Graphic Designer' ? 'Graphic Designer' : 'Call Center Operator';

  return {
    id: data.id,
    name: data.full_name,
    role: cat,
    staffCategory: cat,
    phone: data.phone || '',
    email: data.email || undefined,
    joiningDate: data.joining_date,
    salaryType: data.salary_type,
    monthlySalary: Number(data.monthly_salary),
    commissionPercentage: Number(data.commission_percentage || 0),
    status: data.status,
    notes: data.notes || '',
    jobsCompleted: 0,
    revenueGenerated: 0,
    commission: 0,
  };
};

export const updateStaffStatusInDb = async (
  id: string,
  status: 'Active' | 'Inactive' | 'On Leave'
): Promise<void> => {
  if (!isSupabaseConfigured()) return;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('Authentication session required to update staff status.');
  }

  const { error } = await (supabase.from('staff') as any)
    .update({ status })
    .eq('id', id);

  if (error) throw new Error(error.message);
};


