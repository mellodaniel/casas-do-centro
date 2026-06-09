import { supabase } from './supabaseClient';
import { MANAGE_ADMIN_USERS_FUNCTION } from './siteContentService';

export type AdminUserRole = 'admin' | 'editor';

export type AdminUser = {
  id: string;
  auth_user_id: string;
  name: string;
  username: string;
  email: string;
  role: AdminUserRole;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateAdminUserInput = {
  name: string;
  username: string;
  email: string;
  password: string;
  role: AdminUserRole;
  active: boolean;
};

export type UpdateAdminUserInput = {
  id: string;
  name?: string;
  username?: string;
  role?: AdminUserRole;
  active?: boolean;
};

export type CurrentAdminProfile = {
  auth_user_id: string;
  name: string;
  username: string;
  email: string;
  role: AdminUserRole;
  active: boolean;
};

async function invokeManageAdminUsers(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke(
    MANAGE_ADMIN_USERS_FUNCTION,
    {
      body,
    }
  );

  if (error) {
    throw error;
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}

export async function getCurrentAdminProfile(): Promise<CurrentAdminProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from('casas_centro_admin_users')
    .select('auth_user_id, name, username, email, role, active')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (error || !data) {
    return {
      auth_user_id: user.id,
      name: user.email || 'Utilizador',
      username: user.email || 'utilizador',
      email: user.email || '',
      role: 'editor',
      active: true,
    };
  }

  return data as CurrentAdminProfile;
}

export async function listAdminUsers(): Promise<AdminUser[]> {
  const data = await invokeManageAdminUsers({
    action: 'list',
  });

  return data.users || [];
}

export async function createAdminUser(input: CreateAdminUserInput) {
  const data = await invokeManageAdminUsers({
    action: 'create',
    ...input,
  });

  return data.user as AdminUser;
}

export async function updateAdminUser(input: UpdateAdminUserInput) {
  const data = await invokeManageAdminUsers({
    action: 'update',
    ...input,
  });

  return data.user as AdminUser;
}