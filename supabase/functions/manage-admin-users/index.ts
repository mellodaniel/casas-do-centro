import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type AdminRole = 'admin' | 'editor';

type ResolveLoginPayload = {
  action: 'resolve-login';
  username: string;
};

type CreateUserPayload = {
  action: 'create';
  name: string;
  username: string;
  email: string;
  password: string;
  role: AdminRole;
  active?: boolean;
};

type UpdateUserPayload = {
  action: 'update';
  id: string;
  name?: string;
  username?: string;
  role?: AdminRole;
  active?: boolean;
};

type ListUsersPayload = {
  action: 'list';
};

type RequestPayload =
  | ResolveLoginPayload
  | CreateUserPayload
  | UpdateUserPayload
  | ListUsersPayload;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function validateRole(role: string): role is AdminRole {
  return role === 'admin' || role === 'editor';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return jsonResponse({ error: 'Missing Supabase environment variables.' }, 500);
  }

  const supabaseAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  let payload: RequestPayload;

  try {
    payload = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body.' }, 400);
  }

  if (payload.action === 'resolve-login') {
    const username = normalizeUsername(payload.username);

    if (!username) {
      return jsonResponse({ error: 'Missing username.' }, 400);
    }

    if (username.includes('@')) {
      return jsonResponse({ email: normalizeEmail(username) });
    }

    const { data, error } = await supabaseAdminClient
      .from('casas_centro_admin_users')
      .select('email, active')
      .eq('username', username)
      .maybeSingle();

    if (error) {
      return jsonResponse({ error: error.message }, 500);
    }

    if (!data || !data.active) {
      return jsonResponse({ error: 'Invalid user.' }, 404);
    }

    return jsonResponse({ email: data.email });
  }

  const authorizationHeader = req.headers.get('Authorization');

  if (!authorizationHeader) {
    return jsonResponse({ error: 'Missing authorization header.' }, 401);
  }

  const supabaseUserClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authorizationHeader,
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabaseUserClient.auth.getUser();

  if (userError || !user) {
    return jsonResponse({ error: 'Invalid session.' }, 401);
  }

  const { data: currentAdmin, error: currentAdminError } =
    await supabaseAdminClient
      .from('casas_centro_admin_users')
      .select('id, role, active')
      .eq('auth_user_id', user.id)
      .maybeSingle();

  if (currentAdminError) {
    return jsonResponse({ error: currentAdminError.message }, 500);
  }

  if (!currentAdmin || !currentAdmin.active || currentAdmin.role !== 'admin') {
    return jsonResponse({ error: 'Only active admins can manage users.' }, 403);
  }

  if (payload.action === 'list') {
    const { data, error } = await supabaseAdminClient
      .from('casas_centro_admin_users')
      .select(
        'id, auth_user_id, name, username, email, role, active, created_at, updated_at'
      )
      .order('created_at', { ascending: false });

    if (error) {
      return jsonResponse({ error: error.message }, 500);
    }

    return jsonResponse({ users: data || [] });
  }

  if (payload.action === 'create') {
    const name = payload.name.trim();
    const username = normalizeUsername(payload.username);
    const email = normalizeEmail(payload.email);
    const password = payload.password;
    const role = payload.role;
    const active = payload.active ?? true;

    if (!name || !username || !email || !password) {
      return jsonResponse({ error: 'Missing required fields.' }, 400);
    }

    if (!validateRole(role)) {
      return jsonResponse({ error: 'Invalid role.' }, 400);
    }

    if (password.length < 8) {
      return jsonResponse(
        { error: 'Password must have at least 8 characters.' },
        400
      );
    }

    const { data: createdUser, error: createUserError } =
      await supabaseAdminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          name,
          username,
          role,
        },
      });

    if (createUserError || !createdUser.user) {
      return jsonResponse(
        {
          error: createUserError?.message || 'Could not create user.',
        },
        400
      );
    }

    const { data: profile, error: profileError } = await supabaseAdminClient
      .from('casas_centro_admin_users')
      .insert({
        auth_user_id: createdUser.user.id,
        name,
        username,
        email,
        role,
        active,
      })
      .select(
        'id, auth_user_id, name, username, email, role, active, created_at, updated_at'
      )
      .single();

    if (profileError) {
      await supabaseAdminClient.auth.admin.deleteUser(createdUser.user.id);

      return jsonResponse({ error: profileError.message }, 400);
    }

    return jsonResponse({ user: profile });
  }

  if (payload.action === 'update') {
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof payload.name === 'string') {
      updates.name = payload.name.trim();
    }

    if (typeof payload.username === 'string') {
      updates.username = normalizeUsername(payload.username);
    }

    if (typeof payload.role === 'string') {
      if (!validateRole(payload.role)) {
        return jsonResponse({ error: 'Invalid role.' }, 400);
      }

      updates.role = payload.role;
    }

    if (typeof payload.active === 'boolean') {
      updates.active = payload.active;
    }

    const { data, error } = await supabaseAdminClient
      .from('casas_centro_admin_users')
      .update(updates)
      .eq('id', payload.id)
      .select(
        'id, auth_user_id, name, username, email, role, active, created_at, updated_at'
      )
      .single();

    if (error) {
      return jsonResponse({ error: error.message }, 400);
    }

    return jsonResponse({ user: data });
  }

  return jsonResponse({ error: 'Invalid action.' }, 400);
});