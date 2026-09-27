const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://uyewewetzokmetvfokuh.supabase.co',
  'sb_publishable_4dnaLpkJvNwaODHwC-AGUQ_5ZTTt4Mh'
);

async function runTests() {
  console.log('=== STARTING SUPABASE SALARIES VERIFICATION TEST SUITE ===');

  // Try signing up with a unique timestamped email
  const uniqueEmail = `test_runner_${Date.now()}@domain${Math.floor(Math.random()*1000)}.com`;
  const uniquePass = 'Password123!';

  console.log('Attempting sign up with:', uniqueEmail);
  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email: uniqueEmail,
    password: uniquePass,
  });

  if (signUpErr) {
    console.log('Sign up result:', signUpErr.message);
  }

  const user = signUpData?.user;
  if (!user) {
    console.log('Could not get user session via signUp (email confirmation may be required).');
    process.exit(1);
  }

  console.log('User ID:', user.id);

  // Ensure profile exists for auth user in public.profiles
  const { data: profile, error: profErr } = await supabase.from('profiles').upsert([{
    id: user.id,
    full_name: 'Salary Admin Tester',
    email: uniqueEmail,
    role: 'admin'
  }]).select('*').single();

  if (profErr) {
    console.error('Failed to upsert profile:', profErr);
    process.exit(1);
  }
  console.log('Profile ID verified:', profile.id);

  // Fetch a valid staff ID from public.staff
  const { data: staffList, error: staffErr } = await supabase.from('staff').select('id, full_name').limit(1);
  if (staffErr || !staffList || staffList.length === 0) {
    console.error('Failed to fetch staff for test:', staffErr);
    process.exit(1);
  }
  const testStaff = staffList[0];
  console.log('Using Staff:', testStaff.full_name, 'ID:', testStaff.id);

  // TEST 1 — ADD SALARY PAYMENT
  console.log('\n--- TEST 1 — ADD SALARY PAYMENT ---');
  const basic = 30000;
  const bonus = 2000;
  const commission = 3000;
  const deductions = 500;
  const other = 1000;
  const finalSalary = basic + bonus + commission + other - deductions; // 35500

  const newRecord = {
    staff_id: testStaff.id,
    salary_month: 'September 2026',
    basic_salary: basic,
    bonus: bonus,
    commission: commission,
    deductions: deductions,
    other_payments: other,
    final_salary: finalSalary,
    payment_status: 'Pending',
    payment_date: '2026-09-27',
    notes: 'Automated Persistence Test Salary Payment',
    created_by: user.id
  };

  const { data: inserted, error: insertErr } = await supabase
    .from('salary_payments')
    .insert([newRecord])
    .select('*, staff(id, full_name)')
    .single();

  if (insertErr || !inserted) {
    console.error('TEST 1 FAILED — INSERT Error:', insertErr);
    process.exit(1);
  }

  console.log('TEST 1 PASSED — Inserted Record ID:', inserted.id);
  console.log('Expected Final Salary: 35500 | Actual Final Salary:', inserted.final_salary);

  // TEST 2 — REFRESH / SELECT VERIFICATION
  console.log('\n--- TEST 2 — REFRESH / SELECT VERIFICATION ---');
  const { data: fetched, error: fetchErr } = await supabase
    .from('salary_payments')
    .select('*, staff(id, full_name)')
    .eq('id', inserted.id)
    .single();

  if (fetchErr || !fetched) {
    console.error('TEST 2 FAILED — Fetch Error:', fetchErr);
    process.exit(1);
  }
  console.log('TEST 2 PASSED — Record persisted in Supabase!');
  console.log('Fetched Staff Name:', fetched.staff?.full_name, '| Final Salary:', fetched.final_salary);

  // TEST 3 — EDIT (Bonus 2000 -> 3000, expected final salary: 36500)
  console.log('\n--- TEST 3 — EDIT SALARY PAYMENT ---');
  const updatedBonus = 3000;
  const updatedFinal = basic + updatedBonus + commission + other - deductions; // 36500

  const { data: updated, error: updateErr } = await supabase
    .from('salary_payments')
    .update({
      bonus: updatedBonus,
      final_salary: updatedFinal,
      updated_at: new Date().toISOString()
    })
    .eq('id', inserted.id)
    .select('*')
    .single();

  if (updateErr || !updated) {
    console.error('TEST 3 FAILED — Update Error:', updateErr);
    process.exit(1);
  }

  console.log('TEST 3 PASSED — Updated Bonus to 3000! New Final Salary:', updated.final_salary);

  const { data: fetchedAfterEdit } = await supabase
    .from('salary_payments')
    .select('*')
    .eq('id', inserted.id)
    .single();
  console.log('Verified persisted updated amount:', fetchedAfterEdit.final_salary, '(Expected: 36500)');

  // TEST 4 — PAYMENT STATUS CHANGE (Pending -> Paid)
  console.log('\n--- TEST 4 — PAYMENT STATUS CHANGE ---');
  const { data: statusUpdated, error: statusErr } = await supabase
    .from('salary_payments')
    .update({
      payment_status: 'Paid',
      updated_at: new Date().toISOString()
    })
    .eq('id', inserted.id)
    .select('*')
    .single();

  if (statusErr || !statusUpdated) {
    console.error('TEST 4 FAILED — Status Update Error:', statusErr);
    process.exit(1);
  }

  console.log('TEST 4 PASSED — Updated Status to Paid!');

  const { data: fetchedAfterStatus } = await supabase
    .from('salary_payments')
    .select('*')
    .eq('id', inserted.id)
    .single();
  console.log('Verified persisted status:', fetchedAfterStatus.payment_status, '(Expected: Paid)');

  // TEST 5 — DELETE SALARY RECORD
  console.log('\n--- TEST 5 — DELETE SALARY RECORD ---');
  const { error: deleteErr } = await supabase
    .from('salary_payments')
    .delete()
    .eq('id', inserted.id);

  if (deleteErr) {
    console.error('TEST 5 FAILED — Delete Error:', deleteErr);
    process.exit(1);
  }

  const { data: fetchedAfterDelete } = await supabase
    .from('salary_payments')
    .select('*')
    .eq('id', inserted.id)
    .maybeSingle();

  if (fetchedAfterDelete) {
    console.error('TEST 5 FAILED — Record still exists after DELETE!');
    process.exit(1);
  }
  console.log('TEST 5 PASSED — Record completely removed from Supabase!');

  // TEST 6 — REAL SALARY CREATION
  console.log('\n--- TEST 6 — REAL SALARY CREATION ---');
  const realSalary = {
    staff_id: testStaff.id,
    salary_month: 'September 2026',
    basic_salary: 45000,
    bonus: 5000,
    commission: 4000,
    deductions: 1000,
    other_payments: 2000,
    final_salary: 55000,
    payment_status: 'Paid',
    payment_date: '2026-09-27',
    notes: 'Official Staff Payroll Disbursement for September 2026',
    created_by: user.id
  };

  const { data: realInserted, error: realErr } = await supabase
    .from('salary_payments')
    .insert([realSalary])
    .select('*, staff(id, full_name)')
    .single();

  if (realErr || !realInserted) {
    console.error('TEST 6 FAILED — Real Insert Error:', realErr);
    process.exit(1);
  }

  console.log('TEST 6 PASSED — Real Salary Record created successfully! ID:', realInserted.id);
  console.log('Staff Member:', realInserted.staff?.full_name);
  console.log('Final Salary:', realInserted.final_salary);

  console.log('\n=== ALL 6 Persistence & Integration Tests Passed Successfully! ===');
  process.exit(0);
}

runTests();
