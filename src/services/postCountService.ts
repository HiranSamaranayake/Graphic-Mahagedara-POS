import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { DailyPostCountRecord } from '../types';

export const fetchDailyPostCountsFromDb = async (): Promise<DailyPostCountRecord[]> => {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const { data, error } = await (supabase.from('daily_post_counts') as any)
      .select('*, staff(id, full_name)')
      .order('post_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error (daily_post_counts):', error.message);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map((item: any) => ({
      id: item.id,
      staffId: item.staff_id || '',
      staffName: item.staff?.full_name || 'Graphic Designer',
      postDate: item.post_date,
      postCount: Number(item.post_count || 0),
      notes: item.notes || '',
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  } catch (err) {
    console.error('Unexpected error fetching daily post counts:', err);
    return [];
  }
};

export const addDailyPostCountToDb = async (record: {
  staffId?: string;
  postDate: string;
  postCount: number;
  notes?: string;
}): Promise<DailyPostCountRecord> => {
  if (record.postCount < 0) {
    throw new Error('Post count cannot be negative');
  }
  if (!record.postDate) {
    throw new Error('Post date is required');
  }

  if (!isSupabaseConfigured()) {
    throw new Error('Supabase client is not configured.');
  }

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    throw new Error('Authentication required to add daily post count.');
  }

  let staffIdToUse = record.staffId;

  // If staffId is not passed, lookup matching staff record for this user
  if (!staffIdToUse) {
    const { data: staffMatch } = await (supabase.from('staff') as any)
      .select('id')
      .or(`user_id.eq.${user.id},email.eq.${user.email}`)
      .maybeSingle();

    if (staffMatch) {
      staffIdToUse = staffMatch.id;
    }
  }

  const payload = {
    staff_id: staffIdToUse || null,
    user_id: user.id,
    post_date: record.postDate,
    post_count: record.postCount,
    notes: record.notes ? record.notes.trim() : null,
  };

  const { data, error } = await (supabase.from('daily_post_counts') as any)
    .insert([payload])
    .select('*, staff(id, full_name)')
    .single();

  if (error) {
    console.error('Supabase INSERT error (daily_post_counts):', error.message);
    throw new Error(`[Supabase Error ${error.code || ''}]: ${error.message}`);
  }

  return {
    id: data.id,
    staffId: data.staff_id || '',
    staffName: data.staff?.full_name || 'Graphic Designer',
    postDate: data.post_date,
    postCount: Number(data.post_count),
    notes: data.notes || '',
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const updateDailyPostCountInDb = async (
  id: string,
  record: { postDate: string; postCount: number; notes?: string }
): Promise<DailyPostCountRecord> => {
  if (record.postCount < 0) {
    throw new Error('Post count cannot be negative');
  }

  if (!isSupabaseConfigured()) {
    throw new Error('Supabase client is not configured.');
  }

  const payload = {
    post_date: record.postDate,
    post_count: record.postCount,
    notes: record.notes ? record.notes.trim() : null,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await (supabase.from('daily_post_counts') as any)
    .update(payload)
    .eq('id', id)
    .select('*, staff(id, full_name)')
    .single();

  if (error) {
    console.error('Supabase UPDATE error (daily_post_counts):', error.message);
    throw new Error(`[Supabase Error ${error.code || ''}]: ${error.message}`);
  }

  return {
    id: data.id,
    staffId: data.staff_id || '',
    staffName: data.staff?.full_name || 'Graphic Designer',
    postDate: data.post_date,
    postCount: Number(data.post_count),
    notes: data.notes || '',
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
};

export const deleteDailyPostCountFromDb = async (id: string): Promise<void> => {
  if (!isSupabaseConfigured()) return;

  const { error } = await (supabase.from('daily_post_counts') as any)
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase DELETE error (daily_post_counts):', error.message);
    throw new Error(`[Supabase Error ${error.code || ''}]: ${error.message}`);
  }
};
