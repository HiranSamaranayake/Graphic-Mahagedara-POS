import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
    const supabaseServiceRoleKey =
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ??
      Deno.env.get('SUPABASE_SECRET_KEY') ??
      '';

    if (!supabaseServiceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error: Service role key missing.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Get Authorization header (JWT of caller)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing Authorization header.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Verify caller identity using caller's JWT
    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const {
      data: { user: callerUser },
      error: userErr,
    } = await callerClient.auth.getUser();

    if (userErr || !callerUser) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Invalid authentication session.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Verify caller has Admin role in public.profiles
    const { data: profileData, error: profileErr } = await callerClient
      .from('profiles')
      .select('role')
      .eq('id', callerUser.id)
      .single();

    if (profileErr || !profileData || profileData.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin privilege required to create staff accounts.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Parse request payload
    const { fullName, email, temporaryPassword, staffCategory } = await req.json();

    const cleanName = (fullName || '').trim();
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = temporaryPassword || '';
    const cleanCategory = staffCategory === 'Graphic Designer' ? 'Graphic Designer' : 'Call Center Operator';

    if (!cleanName || !cleanEmail || !cleanPassword) {
      return new Response(
        JSON.stringify({ error: 'Full name, email, and temporary password are required.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (cleanPassword.length < 6) {
      return new Response(
        JSON.stringify({ error: 'Temporary password must be at least 6 characters long.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Server-side Admin Client with service_role key to execute auth.admin.createUser
    const adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false },
    });

    // Create the Auth User securely via Admin API
    const { data: createdUserData, error: createErr } = await adminClient.auth.admin.createUser({
      email: cleanEmail,
      password: cleanPassword,
      email_confirm: true,
      user_metadata: {
        full_name: cleanName,
        staff_category: cleanCategory,
      },
    });

    if (createErr) {
      return new Response(
        JSON.stringify({ error: createErr.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!createdUserData.user) {
      return new Response(
        JSON.stringify({ error: 'Failed to create auth user.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Ensure matching public.profiles row has role = 'staff' and staff_category = cleanCategory
    const { error: upsertErr } = await adminClient
      .from('profiles')
      .upsert({
        id: createdUserData.user.id,
        full_name: cleanName,
        email: cleanEmail,
        role: 'staff',
        staff_category: cleanCategory,
        updated_at: new Date().toISOString(),
      });

    if (upsertErr) {
      console.error('Profile upsert warning:', upsertErr.message);
    }

    // 7. Sync with public.staff table
    const { data: existingStaff } = await adminClient
      .from('staff')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (existingStaff) {
      await adminClient
        .from('staff')
        .update({
          user_id: createdUserData.user.id,
          full_name: cleanName,
          staff_category: cleanCategory,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingStaff.id);
    } else {
      await adminClient
        .from('staff')
        .insert({
          user_id: createdUserData.user.id,
          full_name: cleanName,
          email: cleanEmail,
          staff_category: cleanCategory,
          status: 'Active',
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Staff login account successfully created for ${cleanName} (${cleanEmail})`,
        user: {
          id: createdUserData.user.id,
          email: createdUserData.user.email,
          role: 'staff',
          staff_category: cleanCategory,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Internal Server Error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
