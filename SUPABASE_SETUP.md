# Graphic Mahagedara POS - Supabase Setup & Administration Guide

This document provides step-by-step instructions for connecting your Graphic Mahagedara Business Management System to your Supabase cloud database and creating your first Admin account.

---

## 1. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and log in.
2. Click **New Project** and name it `graphic-mahagedara`.
3. Set your database password and choose your region.

---

## 2. Configure Environment Variables
1. In your Supabase Dashboard, navigate to **Project Settings** -> **API**.
2. Copy your **Project URL** and your **anon / public key**.
3. Open `.env.local` in your project root:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. Save the file. `.env.local` is listed in `.gitignore` to prevent secret leakage.

---

## 3. Run Database Migration SQL
1. Open your Supabase Dashboard and click **SQL Editor** in the left sidebar.
2. Click **New Query**.
3. Open `supabase/schema.sql` from your project folder, copy all contents, paste into the SQL Editor, and click **Run**.
4. This script automatically creates all required tables (`profiles`, `staff`, `daily_income`, `expense_categories`, `expenses`, `salary_payments`), enforces strict `anon` privilege revocation, sets up Row Level Security (RLS) policies for authenticated users, and creates an automatic user profile trigger.

---

## 4. Create the First Admin User
Admin accounts are managed securely through Supabase Auth. Follow these steps to register your first admin:

### Option A: Via Supabase Dashboard (Recommended)
1. Go to **Authentication** -> **Users** in your Supabase Dashboard.
2. Click **Add User** -> **Create User**.
3. Enter Email: `admin@graphicmahagedara.lk` and set a strong password.
4. Open **SQL Editor** and run this SQL query to grant Admin rights:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'admin@graphicmahagedara.lk';
   ```

### Option B: Via Login Screen
1. Start your application (`npm run dev`).
2. Register/Sign up via Supabase Auth with your admin email address.
3. In Supabase SQL Editor, promote the user to admin:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'your-email@graphicmahagedara.lk';
   ```

---

## 5. Security & Row Level Security (RLS)
- **Service Role Key**: The `service_role` key is **NEVER** exposed in frontend code.
- **Admin Access**: Users with `role = 'admin'` in `public.profiles` have full read/write access across all tables.
- **Staff Access**: Staff members have restricted access and cannot access admin routes or unauthorized queries.
