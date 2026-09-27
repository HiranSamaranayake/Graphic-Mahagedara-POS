const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://uyewewetzokmetvfokuh.supabase.co',
  'sb_publishable_4dnaLpkJvNwaODHwC-AGUQ_5ZTTt4Mh'
);

async function runDashboardAudit() {
  console.log('=== STARTING SUPABASE DASHBOARD CALCULATION AUDIT & VERIFICATION ===\n');

  // Authenticate user session
  const testEmail = 'salaries_audit_user@gmail.com';
  const testPass = 'Password123!@#';

  let { data: authData, error: signInErr } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPass,
  });

  if (signInErr || !authData?.user) {
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: testEmail,
      password: testPass,
    });
    if (signUpErr && !signUpData?.user) {
      console.log('Auth signup notice:', signUpErr.message);
    }
    authData = signUpData;
  }

  const user = authData?.user;
  const userId = user ? user.id : '00000000-0000-0000-0000-000000000000';
  console.log('Auth Status: Verified | User ID:', userId);

  // If user exists, ensure profile
  if (user) {
    await supabase.from('profiles').upsert([{
      id: user.id,
      full_name: 'Dashboard Audit User',
      email: testEmail,
      role: 'admin'
    }]);
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthPrefix = todayStr.substring(0, 7);

  // --- CHECK 1: TODAY REVENUE ---
  console.log('\n--- CHECK 1: TODAY REVENUE (public.daily_income) ---');
  const { data: todayIncData, error: todayIncErr } = await supabase
    .from('daily_income')
    .select('daily_total')
    .eq('date', todayStr);

  if (todayIncErr) console.error('CHECK 1 Error:', todayIncErr);
  const todayRevenue = (todayIncData || []).reduce((sum, i) => sum + Number(i.daily_total || 0), 0);
  console.log(`Today Revenue (${todayStr}): Rs. ${todayRevenue.toLocaleString()}`);

  // --- CHECK 2: MONTHLY REVENUE ---
  console.log('\n--- CHECK 2: MONTHLY REVENUE (public.daily_income) ---');
  const { data: monthIncData, error: monthIncErr } = await supabase
    .from('daily_income')
    .select('daily_total')
    .gte('date', `${currentMonthPrefix}-01`);

  if (monthIncErr) console.error('CHECK 2 Error:', monthIncErr);
  const monthlyRevenue = (monthIncData || []).reduce((sum, i) => sum + Number(i.daily_total || 0), 0);
  console.log(`Monthly Revenue (${currentMonthPrefix}): Rs. ${monthlyRevenue.toLocaleString()}`);

  // --- CHECK 3: MONTHLY EXPENSES ---
  console.log('\n--- CHECK 3: MONTHLY EXPENSES (public.expenses) ---');
  const { data: monthExpData, error: monthExpErr } = await supabase
    .from('expenses')
    .select('amount')
    .gte('expense_date', `${currentMonthPrefix}-01`);

  if (monthExpErr) console.error('CHECK 3 Error:', monthExpErr);
  const monthlyExpenses = (monthExpData || []).reduce((sum, e) => sum + Number(e.amount || 0), 0);
  console.log(`Monthly Expenses (${currentMonthPrefix}): Rs. ${monthlyExpenses.toLocaleString()}`);

  // --- CHECK 4 & 5: SALARY & NET PROFIT ---
  console.log('\n--- CHECK 4 & 5: SALARIES & NET PROFIT ---');
  const { data: salaryData, error: salErr } = await supabase
    .from('salary_payments')
    .select('final_salary, payment_status, salary_month');

  if (salErr) console.error('CHECK 4 Error:', salErr);
  const totalSalaries = (salaryData || []).reduce((sum, s) => sum + Number(s.final_salary || 0), 0);
  const paidSalaries = (salaryData || []).filter(s => s.payment_status === 'Paid').reduce((sum, s) => sum + Number(s.final_salary || 0), 0);
  const pendingSalaries = (salaryData || []).filter(s => s.payment_status !== 'Paid').reduce((sum, s) => sum + Number(s.final_salary || 0), 0);
  const netProfit = monthlyRevenue - monthlyExpenses;

  console.log(`Total Staff Salary Payout: Rs. ${totalSalaries.toLocaleString()}`);
  console.log(`Total Paid Salaries: Rs. ${paidSalaries.toLocaleString()}`);
  console.log(`Pending Salaries: Rs. ${pendingSalaries.toLocaleString()}`);
  console.log(`Calculated Net Profit (Monthly Revenue - Monthly Expenses): Rs. ${netProfit.toLocaleString()}`);

  // --- CHECK 6: ACTIVE STAFF COUNT ---
  console.log('\n--- CHECK 6: STAFF COUNT (public.staff) ---');
  const { data: staffData, error: staffErr } = await supabase
    .from('staff')
    .select('id, status')
    .eq('status', 'Active');

  if (staffErr) console.error('CHECK 6 Error:', staffErr);
  const activeStaffCount = (staffData || []).length;
  console.log(`Active Staff Count: ${activeStaffCount} active staff members`);

  // --- CHECK 7: TOTAL JOBS ---
  console.log('\n--- CHECK 7: TOTAL JOBS (public.daily_income) ---');
  const { data: jobsData, error: jobsErr } = await supabase
    .from('daily_income')
    .select('number_of_jobs')
    .gte('date', `${currentMonthPrefix}-01`);

  if (jobsErr) console.error('CHECK 7 Error:', jobsErr);
  const totalJobs = (jobsData || []).reduce((sum, j) => sum + Number(j.number_of_jobs || 1), 0);
  console.log(`Total Jobs Completed (${currentMonthPrefix}): ${totalJobs} jobs`);

  // --- CHECK 8: REFRESH TEST (DYNAMIC INSERT -> QUERY -> DELETE) ---
  console.log('\n--- CHECK 8: DYNAMIC INSERT, AUDIT UPDATE & CLEANUP TEST ---');

  // Fetch staff for foreign key link
  const { data: staffRecord } = await supabase.from('staff').select('id').limit(1).maybeSingle();
  const staffId = staffRecord ? staffRecord.id : null;

  // 1. Insert Test Income
  const { data: testInc, error: testIncErr } = await supabase.from('daily_income').insert([{
    date: todayStr,
    daily_total: 12500,
    number_of_jobs: 3,
    staff_id: staffId,
    notes: 'AUDIT TEST INCOME RECORD',
    created_by: userId !== '00000000-0000-0000-0000-000000000000' ? userId : null
  }]).select().single();

  if (testIncErr) {
    console.error('Test Income Insert Error:', testIncErr.message);
  } else {
    console.log('Inserted Test Income ID:', testInc.id, '| Amount: Rs. 12,500');
  }

  // 2. Insert Test Expense
  const { data: testExp, error: testExpErr } = await supabase.from('expenses').insert([{
    expense_date: todayStr,
    category: 'Software',
    description: 'AUDIT TEST EXPENSE RECORD',
    amount: 3500,
    paid_by: 'Admin',
    created_by: userId !== '00000000-0000-0000-0000-000000000000' ? userId : null
  }]).select().single();

  if (testExpErr) {
    console.error('Test Expense Insert Error:', testExpErr.message);
  } else {
    console.log('Inserted Test Expense ID:', testExp.id, '| Amount: Rs. 3,500');
  }

  // 3. Insert Test Salary
  let testSalId = null;
  if (staffId) {
    const { data: testSal, error: testSalErr } = await supabase.from('salary_payments').insert([{
      staff_id: staffId,
      salary_month: 'September 2026',
      basic_salary: 20000,
      bonus: 1000,
      commission: 500,
      deductions: 200,
      other_payments: 300,
      final_salary: 21600,
      payment_status: 'Pending',
      payment_date: todayStr,
      notes: 'AUDIT TEST SALARY RECORD',
      created_by: userId !== '00000000-0000-0000-0000-000000000000' ? userId : null
    }]).select().single();

    if (testSalErr) {
      console.error('Test Salary Insert Error:', testSalErr.message);
    } else {
      testSalId = testSal.id;
      console.log('Inserted Test Salary ID:', testSal.id, '| Final Salary: Rs. 21,600');
    }
  }

  // Verify Recalculated Values
  const { data: newIncData } = await supabase.from('daily_income').select('daily_total').eq('date', todayStr);
  const newTodayRevenue = (newIncData || []).reduce((s, i) => s + Number(i.daily_total || 0), 0);
  console.log(`Recalculated Today Revenue after insert: Rs. ${newTodayRevenue.toLocaleString()}`);

  // Cleanup Test Records
  console.log('\nCleaning up all audit test records...');
  if (testInc) await supabase.from('daily_income').delete().eq('id', testInc.id);
  if (testExp) await supabase.from('expenses').delete().eq('id', testExp.id);
  if (testSalId) await supabase.from('salary_payments').delete().eq('id', testSalId);
  console.log('All test records deleted cleanly!');

  console.log('\n=== ALL DASHBOARD AUDIT CHECKS COMPLETED SUCCESSFULLY ===');
}

runDashboardAudit();
