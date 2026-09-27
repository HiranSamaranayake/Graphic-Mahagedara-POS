-- ==============================================================================
-- GRAPHIC MAHAGEDARA BUSINESS MANAGEMENT SYSTEM - PRODUCTION SUPABASE SCHEMA
-- ==============================================================================
-- Security Model: Strictly Private Business System (Authenticated Users Only)
-- Instructions: Copy & Paste this entire script into your Supabase SQL Editor
-- (Dashboard -> SQL Editor -> New Query -> Run)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- TABLE 1: PROFILES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- TABLE 2: STAFF
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  joining_date DATE DEFAULT CURRENT_DATE,
  salary_type TEXT NOT NULL DEFAULT 'Fixed' CHECK (salary_type IN ('Fixed', 'Commission', 'Per Job', 'Percentage', 'Hybrid', 'Fixed Monthly')),
  monthly_salary NUMERIC(12,2) DEFAULT 0 CHECK (monthly_salary >= 0),
  commission_percentage NUMERIC(5,2) DEFAULT 0 CHECK (commission_percentage >= 0),
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'On Leave')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- TABLE 3: DAILY INCOME
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  staff_id UUID REFERENCES public.staff(id) ON DELETE SET NULL,
  daily_total NUMERIC(12,2) NOT NULL CHECK (daily_total > 0),
  number_of_jobs INT NOT NULL DEFAULT 1 CHECK (number_of_jobs > 0),
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- TABLE 4: EXPENSE CATEGORIES (Empty initial table - no sample seeds)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expense_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- TABLE 5: EXPENSES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  paid_by TEXT NOT NULL DEFAULT 'Admin',
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- TABLE 6: SALARY PAYMENTS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.salary_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
  salary_month TEXT NOT NULL,
  basic_salary NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (basic_salary >= 0),
  bonus NUMERIC(12,2) DEFAULT 0 CHECK (bonus >= 0),
  commission NUMERIC(12,2) DEFAULT 0 CHECK (commission >= 0),
  deductions NUMERIC(12,2) DEFAULT 0 CHECK (deductions >= 0),
  other_payments NUMERIC(12,2) DEFAULT 0 CHECK (other_payments >= 0),
  final_salary NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (final_salary >= 0),
  payment_status TEXT NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Paid', 'Pending', 'Partially Paid', 'Processing')),
  payment_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- EXPLICIT PRIVILEGE CONFIGURATION
-- ------------------------------------------------------------------------------
-- Revoke all privileges from unauthenticated (anon) role
REVOKE ALL ON TABLE public.profiles FROM anon;
REVOKE ALL ON TABLE public.staff FROM anon;
REVOKE ALL ON TABLE public.daily_income FROM anon;
REVOKE ALL ON TABLE public.expense_categories FROM anon;
REVOKE ALL ON TABLE public.expenses FROM anon;
REVOKE ALL ON TABLE public.salary_payments FROM anon;

-- Grant required CRUD operations to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.staff TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.daily_income TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.expense_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.expenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.salary_payments TO authenticated;

-- ------------------------------------------------------------------------------
-- AUTOMATIC SECURE USER PROFILE TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    NEW.email,
    'staff'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES — AUTHENTICATED USERS ONLY
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_payments ENABLE ROW LEVEL SECURITY;

-- Clean existing policies
DROP POLICY IF EXISTS "Authenticated users select profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users delete profiles" ON public.profiles;

DROP POLICY IF EXISTS "Authenticated users select staff" ON public.staff;
DROP POLICY IF EXISTS "Authenticated users insert staff" ON public.staff;
DROP POLICY IF EXISTS "Authenticated users update staff" ON public.staff;
DROP POLICY IF EXISTS "Authenticated users delete staff" ON public.staff;

DROP POLICY IF EXISTS "Authenticated users select daily_income" ON public.daily_income;
DROP POLICY IF EXISTS "Authenticated users insert daily_income" ON public.daily_income;
DROP POLICY IF EXISTS "Authenticated users update daily_income" ON public.daily_income;
DROP POLICY IF EXISTS "Authenticated users delete daily_income" ON public.daily_income;

DROP POLICY IF EXISTS "Authenticated users select expense_categories" ON public.expense_categories;
DROP POLICY IF EXISTS "Authenticated users insert expense_categories" ON public.expense_categories;
DROP POLICY IF EXISTS "Authenticated users update expense_categories" ON public.expense_categories;
DROP POLICY IF EXISTS "Authenticated users delete expense_categories" ON public.expense_categories;

DROP POLICY IF EXISTS "Authenticated users select expenses" ON public.expenses;
DROP POLICY IF EXISTS "Authenticated users insert expenses" ON public.expenses;
DROP POLICY IF EXISTS "Authenticated users update expenses" ON public.expenses;
DROP POLICY IF EXISTS "Authenticated users delete expenses" ON public.expenses;

DROP POLICY IF EXISTS "Authenticated users select salary_payments" ON public.salary_payments;
DROP POLICY IF EXISTS "Authenticated users insert salary_payments" ON public.salary_payments;
DROP POLICY IF EXISTS "Authenticated users update salary_payments" ON public.salary_payments;
DROP POLICY IF EXISTS "Authenticated users delete salary_payments" ON public.salary_payments;

-- Drop legacy permissive policies if present
DROP POLICY IF EXISTS "Allow read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow write profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow read staff" ON public.staff;
DROP POLICY IF EXISTS "Allow write staff" ON public.staff;
DROP POLICY IF EXISTS "Allow read daily_income" ON public.daily_income;
DROP POLICY IF EXISTS "Allow write daily_income" ON public.daily_income;
DROP POLICY IF EXISTS "Allow read expense_categories" ON public.expense_categories;
DROP POLICY IF EXISTS "Allow write expense_categories" ON public.expense_categories;
DROP POLICY IF EXISTS "Allow read expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow write expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow read salary_payments" ON public.salary_payments;
DROP POLICY IF EXISTS "Allow write salary_payments" ON public.salary_payments;

-- 1. PROFILES POLICIES (TO authenticated ONLY)
CREATE POLICY "Authenticated users select profiles" ON public.profiles FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Authenticated users insert profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "Authenticated users update profiles" ON public.profiles FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Authenticated users delete profiles" ON public.profiles FOR DELETE TO authenticated USING (TRUE);

-- 2. STAFF POLICIES (TO authenticated ONLY)
CREATE POLICY "Authenticated users select staff" ON public.staff FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Authenticated users insert staff" ON public.staff FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "Authenticated users update staff" ON public.staff FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Authenticated users delete staff" ON public.staff FOR DELETE TO authenticated USING (TRUE);

-- 3. DAILY INCOME POLICIES (TO authenticated ONLY)
CREATE POLICY "Authenticated users select daily_income" ON public.daily_income FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Authenticated users insert daily_income" ON public.daily_income FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "Authenticated users update daily_income" ON public.daily_income FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Authenticated users delete daily_income" ON public.daily_income FOR DELETE TO authenticated USING (TRUE);

-- 4. EXPENSE CATEGORIES POLICIES (TO authenticated ONLY)
CREATE POLICY "Authenticated users select expense_categories" ON public.expense_categories FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Authenticated users insert expense_categories" ON public.expense_categories FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "Authenticated users update expense_categories" ON public.expense_categories FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Authenticated users delete expense_categories" ON public.expense_categories FOR DELETE TO authenticated USING (TRUE);

-- 5. EXPENSES POLICIES (TO authenticated ONLY)
CREATE POLICY "Authenticated users select expenses" ON public.expenses FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Authenticated users insert expenses" ON public.expenses FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "Authenticated users update expenses" ON public.expenses FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Authenticated users delete expenses" ON public.expenses FOR DELETE TO authenticated USING (TRUE);

-- 6. SALARY PAYMENTS POLICIES (TO authenticated ONLY)
CREATE POLICY "Authenticated users select salary_payments" ON public.salary_payments FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Authenticated users insert salary_payments" ON public.salary_payments FOR INSERT TO authenticated WITH CHECK (TRUE);
CREATE POLICY "Authenticated users update salary_payments" ON public.salary_payments FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);
CREATE POLICY "Authenticated users delete salary_payments" ON public.salary_payments FOR DELETE TO authenticated USING (TRUE);
