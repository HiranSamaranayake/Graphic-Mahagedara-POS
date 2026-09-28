-- ==============================================================================
-- GRAPHIC MAHAGEDRA BUSINESS MANAGEMENT SYSTEM - PRODUCTION SUPABASE SCHEMA
-- ==============================================================================
-- Security Model: Role-Based Access Control (RBAC - Admin vs Call Center Operator vs Graphic Designer)
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
  staff_category TEXT DEFAULT 'Call Center Operator' CHECK (staff_category IN ('Call Center Operator', 'Graphic Designer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS staff_category TEXT DEFAULT 'Call Center Operator' CHECK (staff_category IN ('Call Center Operator', 'Graphic Designer'));

-- ------------------------------------------------------------------------------
-- TABLE 2: STAFF
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  staff_category TEXT DEFAULT 'Call Center Operator' CHECK (staff_category IN ('Call Center Operator', 'Graphic Designer')),
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

ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.staff ADD COLUMN IF NOT EXISTS staff_category TEXT DEFAULT 'Call Center Operator' CHECK (staff_category IN ('Call Center Operator', 'Graphic Designer'));

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
-- TABLE 4: EXPENSE CATEGORIES
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
  payment_status TEXT NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Paid', 'Pending', 'Partially Paid', 'Processing', 'Partial')),
  payment_date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- TABLE 7: DAILY POST COUNTS (NEW)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.daily_post_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  post_date DATE NOT NULL DEFAULT CURRENT_DATE,
  post_count INT NOT NULL CHECK (post_count >= 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- EXPLICIT PRIVILEGE CONFIGURATION
-- ------------------------------------------------------------------------------
REVOKE ALL ON TABLE public.profiles FROM anon;
REVOKE ALL ON TABLE public.staff FROM anon;
REVOKE ALL ON TABLE public.daily_income FROM anon;
REVOKE ALL ON TABLE public.expense_categories FROM anon;
REVOKE ALL ON TABLE public.expenses FROM anon;
REVOKE ALL ON TABLE public.salary_payments FROM anon;
REVOKE ALL ON TABLE public.daily_post_counts FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.staff TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.daily_income TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.expense_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.expenses TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.salary_payments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.daily_post_counts TO authenticated;

-- ------------------------------------------------------------------------------
-- SECURITY HELPER FUNCTIONS
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_call_center_operator()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'staff'
      AND COALESCE(staff_category, 'Call Center Operator') = 'Call Center Operator'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_graphic_designer()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'staff'
      AND staff_category = 'Graphic Designer'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_my_staff_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT id FROM public.staff
  WHERE user_id = auth.uid()
     OR email = (SELECT email FROM public.profiles WHERE id = auth.uid())
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_call_center_operator() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_graphic_designer() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_staff_id() TO authenticated;

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES — ENFORCED RBAC & STAFF CATEGORY RULES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_post_counts ENABLE ROW LEVEL SECURITY;

-- Clean existing policies
DROP POLICY IF EXISTS "Authenticated users select profiles" ON public.profiles;
DROP POLICY IF EXISTS "User insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Staff update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin delete profiles" ON public.profiles;

DROP POLICY IF EXISTS "Authenticated users select staff" ON public.staff;
DROP POLICY IF EXISTS "Admin insert staff" ON public.staff;
DROP POLICY IF EXISTS "Admin update staff" ON public.staff;
DROP POLICY IF EXISTS "Admin delete staff" ON public.staff;

DROP POLICY IF EXISTS "Authenticated users select daily_income" ON public.daily_income;
DROP POLICY IF EXISTS "Authenticated users insert daily_income" ON public.daily_income;
DROP POLICY IF EXISTS "Authenticated users update daily_income" ON public.daily_income;
DROP POLICY IF EXISTS "Authenticated users delete daily_income" ON public.daily_income;
DROP POLICY IF EXISTS "Select daily_income" ON public.daily_income;
DROP POLICY IF EXISTS "Insert daily_income" ON public.daily_income;
DROP POLICY IF EXISTS "Update daily_income" ON public.daily_income;
DROP POLICY IF EXISTS "Delete daily_income" ON public.daily_income;

DROP POLICY IF EXISTS "Authenticated users select expense_categories" ON public.expense_categories;
DROP POLICY IF EXISTS "Admin insert expense_categories" ON public.expense_categories;
DROP POLICY IF EXISTS "Admin update expense_categories" ON public.expense_categories;
DROP POLICY IF EXISTS "Admin delete expense_categories" ON public.expense_categories;

DROP POLICY IF EXISTS "Authenticated users select expenses" ON public.expenses;
DROP POLICY IF EXISTS "Authenticated users insert expenses" ON public.expenses;
DROP POLICY IF EXISTS "Authenticated users update expenses" ON public.expenses;
DROP POLICY IF EXISTS "Authenticated users delete expenses" ON public.expenses;
DROP POLICY IF EXISTS "Select expenses" ON public.expenses;
DROP POLICY IF EXISTS "Insert expenses" ON public.expenses;
DROP POLICY IF EXISTS "Update expenses" ON public.expenses;
DROP POLICY IF EXISTS "Delete expenses" ON public.expenses;

DROP POLICY IF EXISTS "Admin users can select salary payments" ON public.salary_payments;
DROP POLICY IF EXISTS "Select salary payments" ON public.salary_payments;
DROP POLICY IF EXISTS "Admin insert salary_payments" ON public.salary_payments;
DROP POLICY IF EXISTS "Admin update salary_payments" ON public.salary_payments;
DROP POLICY IF EXISTS "Admin delete salary_payments" ON public.salary_payments;

DROP POLICY IF EXISTS "Admin select daily_post_counts" ON public.daily_post_counts;
DROP POLICY IF EXISTS "Designer select own daily_post_counts" ON public.daily_post_counts;
DROP POLICY IF EXISTS "Designer insert own daily_post_counts" ON public.daily_post_counts;
DROP POLICY IF EXISTS "Designer update own daily_post_counts" ON public.daily_post_counts;
DROP POLICY IF EXISTS "Designer delete own daily_post_counts" ON public.daily_post_counts;
DROP POLICY IF EXISTS "Select daily_post_counts" ON public.daily_post_counts;
DROP POLICY IF EXISTS "Insert daily_post_counts" ON public.daily_post_counts;
DROP POLICY IF EXISTS "Update daily_post_counts" ON public.daily_post_counts;
DROP POLICY IF EXISTS "Delete daily_post_counts" ON public.daily_post_counts;

-- 1. PROFILES POLICIES
CREATE POLICY "Authenticated users select profiles" ON public.profiles FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "User insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Admin update profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (TRUE);
CREATE POLICY "Staff update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid() AND NOT public.is_admin()) WITH CHECK (id = auth.uid());
CREATE POLICY "Admin delete profiles" ON public.profiles FOR DELETE TO authenticated USING (public.is_admin());

-- 2. STAFF TABLE POLICIES
CREATE POLICY "Authenticated users select staff" ON public.staff FOR SELECT TO authenticated USING (public.is_admin() OR public.is_call_center_operator() OR id = public.get_my_staff_id());
CREATE POLICY "Admin insert staff" ON public.staff FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin update staff" ON public.staff FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin delete staff" ON public.staff FOR DELETE TO authenticated USING (public.is_admin());

-- 3. DAILY INCOME POLICIES (Call Center Operator allowed; Graphic Designer BLOCKED)
CREATE POLICY "Select daily_income" ON public.daily_income FOR SELECT TO authenticated USING (public.is_admin() OR public.is_call_center_operator());
CREATE POLICY "Insert daily_income" ON public.daily_income FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR (public.is_call_center_operator() AND created_by = auth.uid()));
CREATE POLICY "Update daily_income" ON public.daily_income FOR UPDATE TO authenticated USING (public.is_admin() OR public.is_call_center_operator()) WITH CHECK (TRUE);
CREATE POLICY "Delete daily_income" ON public.daily_income FOR DELETE TO authenticated USING (public.is_admin() OR public.is_call_center_operator());

-- 4. EXPENSE CATEGORIES POLICIES
CREATE POLICY "Authenticated users select expense_categories" ON public.expense_categories FOR SELECT TO authenticated USING (TRUE);
CREATE POLICY "Admin insert expense_categories" ON public.expense_categories FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin update expense_categories" ON public.expense_categories FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin delete expense_categories" ON public.expense_categories FOR DELETE TO authenticated USING (public.is_admin());

-- 5. EXPENSES POLICIES (Call Center Operator SELECT & INSERT; Graphic Designer BLOCKED)
CREATE POLICY "Select expenses" ON public.expenses FOR SELECT TO authenticated USING (public.is_admin() OR public.is_call_center_operator());
CREATE POLICY "Insert expenses" ON public.expenses FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR (public.is_call_center_operator() AND created_by = auth.uid()));
CREATE POLICY "Update expenses" ON public.expenses FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Delete expenses" ON public.expenses FOR DELETE TO authenticated USING (public.is_admin());

-- 6. SALARY PAYMENTS POLICIES (All staff can read own salary record; Admin full access)
CREATE POLICY "Select salary payments" ON public.salary_payments FOR SELECT TO authenticated USING (public.is_admin() OR (public.get_my_staff_id() IS NOT NULL AND staff_id = public.get_my_staff_id()));
CREATE POLICY "Admin insert salary_payments" ON public.salary_payments FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "Admin update salary_payments" ON public.salary_payments FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Admin delete salary_payments" ON public.salary_payments FOR DELETE TO authenticated USING (public.is_admin());

-- 7. DAILY POST COUNTS POLICIES (Graphic Designer CRUD own; Admin full CRUD; Call Center BLOCKED)
CREATE POLICY "Select daily_post_counts" ON public.daily_post_counts FOR SELECT TO authenticated USING (public.is_admin() OR (public.is_graphic_designer() AND (user_id = auth.uid() OR staff_id = public.get_my_staff_id())));
CREATE POLICY "Insert daily_post_counts" ON public.daily_post_counts FOR INSERT TO authenticated WITH CHECK (public.is_admin() OR (public.is_graphic_designer() AND (user_id = auth.uid() OR staff_id = public.get_my_staff_id())));
CREATE POLICY "Update daily_post_counts" ON public.daily_post_counts FOR UPDATE TO authenticated USING (public.is_admin() OR (public.is_graphic_designer() AND (user_id = auth.uid() OR staff_id = public.get_my_staff_id()))) WITH CHECK (TRUE);
CREATE POLICY "Delete daily_post_counts" ON public.daily_post_counts FOR DELETE TO authenticated USING (public.is_admin() OR (public.is_graphic_designer() AND (user_id = auth.uid() OR staff_id = public.get_my_staff_id())));
