const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://uyewewetzokmetvfokuh.supabase.co';
const ANON_KEY = 'sb_publishable_4dnaLpkJvNwaODHwC-AGUQ_5ZTTt4Mh';

async function runSecurityAuditTests() {
  console.log('=== STARTING SUPABASE RBAC SECURITY AUDIT & POLICY SUITE ===\n');

  // Client 1: Anonymous / Unauthenticated Client
  const anonClient = createClient(SUPABASE_URL, ANON_KEY);

  // Client 2: Admin Authenticated Client
  const adminClient = createClient(SUPABASE_URL, ANON_KEY);
  const adminEmail = 'admin_rbac_test@gmail.com';
  const adminPass = 'Password123!@#';

  console.log('--- 1. AUTHENTICATING ADMIN & STAFF TEST USERS ---');
  let { data: adminAuth, error: adminErr } = await adminClient.auth.signInWithPassword({
    email: adminEmail,
    password: adminPass,
  });

  if (adminErr || !adminAuth?.user) {
    const { data: signUpAdmin } = await adminClient.auth.signUp({ email: adminEmail, password: adminPass });
    adminAuth = signUpAdmin;
  }
  const adminUser = adminAuth?.user;
  console.log('Admin Auth User ID:', adminUser?.id);

  // Ensure Admin profile has role = 'admin'
  if (adminUser) {
    await adminClient.from('profiles').upsert([{
      id: adminUser.id,
      full_name: 'System Admin Tester',
      email: adminEmail,
      role: 'admin'
    }]);
  }

  // Client 3: Staff Authenticated Client
  const staffClient = createClient(SUPABASE_URL, ANON_KEY);
  const staffEmail = 'staff_rbac_test@gmail.com';
  const staffPass = 'Password123!@#';

  let { data: staffAuth, error: staffErr } = await staffClient.auth.signInWithPassword({
    email: staffEmail,
    password: staffPass,
  });

  if (staffErr || !staffAuth?.user) {
    const { data: signUpStaff } = await staffClient.auth.signUp({ email: staffEmail, password: staffPass });
    staffAuth = signUpStaff;
  }
  const staffUser = staffAuth?.user;
  console.log('Staff Auth User ID:', staffUser?.id);

  // Ensure Staff profile has role = 'staff'
  if (staffUser) {
    await adminClient.from('profiles').upsert([{
      id: staffUser.id,
      full_name: 'Regular Staff Tester',
      email: staffEmail,
      role: 'staff'
    }]);
  }

  console.log('\n--- TEST 1: UNAUTHENTICATED (ANON) DENIAL CHECKS ---');
  const { data: anonStaff, error: anonStaffErr } = await anonClient.from('staff').select('*');
  console.log('Anon SELECT staff status:', anonStaffErr ? `BLOCKED (${anonStaffErr.code})` : `ALLOWED (${anonStaff?.length} rows)`);

  const { data: anonInc, error: anonIncErr } = await anonClient.from('daily_income').select('*');
  console.log('Anon SELECT daily_income status:', anonIncErr ? `BLOCKED (${anonIncErr.code})` : `ALLOWED (${anonInc?.length} rows)`);

  const { data: anonSal, error: anonSalErr } = await anonClient.from('salary_payments').select('*');
  console.log('Anon SELECT salary_payments status:', anonSalErr ? `BLOCKED (${anonSalErr.code})` : `ALLOWED (${anonSal?.length} rows)`);


  console.log('\n--- TEST 4: STAFF ATTEMPTS PRIVILEGE ESCALATION (staff -> admin) ---');
  if (staffUser) {
    const { data: escData, error: escErr } = await staffClient
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', staffUser.id)
      .select('*');

    if (escErr || !escData || escData.length === 0) {
      console.log('TEST 4 PASSED — Staff privilege escalation attempt to admin was BLOCKED by Database RLS!');
    } else {
      console.error('TEST 4 FAILED — Staff successfully promoted themselves to admin!', escData);
    }
  }


  console.log('\n--- TEST 5: STAFF ATTEMPTS TO UPDATE ANOTHER USER\'S PROFILE ---');
  if (staffUser && adminUser) {
    const { data: oProfData, error: oProfErr } = await staffClient
      .from('profiles')
      .update({ full_name: 'Hacked Admin Name' })
      .eq('id', adminUser.id)
      .select('*');

    if (oProfErr || !oProfData || oProfData.length === 0) {
      console.log('TEST 5 PASSED — Staff update on another user\'s profile was BLOCKED by Database RLS!');
    } else {
      console.error('TEST 5 FAILED — Staff updated another user\'s profile!', oProfData);
    }
  }


  console.log('\n--- TEST 6: STAFF ATTEMPTS DAILY INCOME INSERT WITH FAKE created_by ---');
  if (staffUser && adminUser) {
    const fakePayload = {
      date: new Date().toISOString().split('T')[0],
      daily_total: 5000,
      number_of_jobs: 1,
      created_by: adminUser.id // Trying to impersonate adminUser
    };

    const { data: fakeIncData, error: fakeIncErr } = await staffClient
      .from('daily_income')
      .insert([fakePayload])
      .select('*');

    if (fakeIncErr) {
      console.log(`TEST 6 PASSED — Staff insert with fake created_by was BLOCKED! Error: ${fakeIncErr.message}`);
    } else {
      console.error('TEST 6 FAILED — Staff successfully inserted income pretending to be another user!', fakeIncData);
    }
  }


  console.log('\n--- TEST 7: STAFF ATTEMPTS EXPENSE INSERT WITH FAKE created_by ---');
  if (staffUser && adminUser) {
    const fakeExpPayload = {
      expense_date: new Date().toISOString().split('T')[0],
      category: 'Software',
      description: 'Test Impersonation',
      amount: 1500,
      paid_by: 'Admin',
      created_by: adminUser.id // Trying to impersonate adminUser
    };

    const { data: fakeExpData, error: fakeExpErr } = await staffClient
      .from('expenses')
      .insert([fakeExpPayload])
      .select('*');

    if (fakeExpErr) {
      console.log(`TEST 7 PASSED — Staff expense insert with fake created_by was BLOCKED! Error: ${fakeExpErr.message}`);
    } else {
      console.error('TEST 7 FAILED — Staff inserted expense with fake created_by!', fakeExpData);
    }
  }


  console.log('\n--- TEST 8: PERMITTED OPERATIONS TEST ---');
  if (staffUser) {
    const validIncPayload = {
      date: new Date().toISOString().split('T')[0],
      daily_total: 7500,
      number_of_jobs: 2,
      notes: 'Valid Staff Daily Income',
      created_by: staffUser.id // Matching staffUser.id
    };

    const { data: validInc, error: validIncErr } = await staffClient
      .from('daily_income')
      .insert([validIncPayload])
      .select('*')
      .single();

    if (validIncErr || !validInc) {
      console.error('TEST 8 FAILED — Staff valid income insert failed:', validIncErr);
    } else {
      console.log('TEST 8 PASSED — Staff valid income insert succeeded! ID:', validInc.id);
      // Clean up test insert
      await staffClient.from('daily_income').delete().eq('id', validInc.id);
    }
  }

  console.log('\n=== SECURITY RBAC TEST SUITE COMPLETE ===');
  process.exit(0);
}

runSecurityAuditTests();
