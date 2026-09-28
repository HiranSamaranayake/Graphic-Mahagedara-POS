import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Role, StaffCategory } from '../types';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  staffCategory?: StaffCategory;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: Role;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<Role>('Admin');
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUserProfile = async (userId: string, userEmail: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const metaCategory = session?.user?.user_metadata?.staff_category as StaffCategory | undefined;

      const { data } = await (supabase.from('profiles') as any)
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      // Check public.staff if needed
      const { data: stfData } = await (supabase.from('staff') as any)
        .select('staff_category')
        .or(`user_id.eq.${userId},email.eq.${userEmail}`)
        .maybeSingle();

      const userCategory: StaffCategory =
        (data?.staff_category as StaffCategory) ||
        (stfData?.staff_category as StaffCategory) ||
        metaCategory ||
        'Call Center Operator';

      if (data) {
        const userRole: Role = data.role === 'admin' ? 'Admin' : 'Staff';
        setProfile({
          id: data.id,
          fullName: data.full_name,
          email: data.email,
          role: userRole,
          staffCategory: userCategory,
          avatarUrl: data.avatar_url || undefined,
        });
        setRole(userRole);
        return;
      }

      // Profile does not exist in public.profiles yet. Auto-create matching profile row for auth.users.id
      console.warn(`Profile missing in public.profiles for auth user ${userId}. Auto-creating matching profile...`);
      const fallbackRoleStr = userEmail.includes('admin') ? 'admin' : 'staff';
      const fullNameStr = SPLIT_NAME(userEmail);

      const { data: insertedData, error: insertErr } = await (supabase.from('profiles') as any)
        .upsert([
          {
            id: userId,
            full_name: fullNameStr,
            email: userEmail,
            role: fallbackRoleStr,
            staff_category: userCategory,
          },
        ])
        .select('*')
        .single();

      if (insertErr || !insertedData) {
        console.error('Error auto-creating profile in Supabase:', insertErr);
        const fallbackRole: Role = userEmail.includes('admin') ? 'Admin' : 'Staff';
        setProfile({
          id: userId,
          fullName: fullNameStr,
          email: userEmail,
          role: fallbackRole,
          staffCategory: userCategory,
        });
        setRole(fallbackRole);
        return;
      }

      const userRole: Role = insertedData.role === 'admin' ? 'Admin' : 'Staff';
      setProfile({
        id: insertedData.id,
        fullName: insertedData.full_name,
        email: insertedData.email,
        role: userRole,
        staffCategory: userCategory,
      });
      setRole(userRole);
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  function SPLIT_NAME(emailStr: string) {
    const part = emailStr.split('@')[0] || 'User';
    return part.charAt(0).toUpperCase() + part.slice(1);
  }

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email || '');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchUserProfile(session.user.id, session.user.email || '');
        } else {
          setProfile(null);
          setRole('Admin');
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, pass: string): Promise<{ error: string | null }> => {
    if (!isSupabaseConfigured()) {
      setRole(email.includes('staff') ? 'Staff' : 'Admin');
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  };

  const signOut = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole('Admin');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        session,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
