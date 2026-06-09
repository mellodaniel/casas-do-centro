import { supabase } from './supabaseClient';

export const SITE_CONTENT_TABLE = 'casas_centro_site_content';
export const SITE_CONTENT_ID = 'main';
export const SITE_IMAGES_BUCKET = 'casas-centro-images';
export const MANAGE_ADMIN_USERS_FUNCTION = 'manage-admin-users';

export type ContentPatch = Record<string, any>;

type IconContentItem = {
  icon: unknown;
  title: string;
  text: string;
};

type BaseSiteContent = Record<string, any> & {
  models?: IconContentItem[];
  benefits?: IconContentItem[];
};

type BuiltSiteContent<T> = T & {
  heroImageUrl?: string;
  galleryImagesUrlsBySection?: string[][];
};

function isPlainObject(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function deepMerge<T>(base: T, patch: ContentPatch): T {
  if (Array.isArray(base)) {
    return (Array.isArray(patch) ? patch : base) as T;
  }

  if (!isPlainObject(base) || !isPlainObject(patch)) {
    return (patch ?? base) as T;
  }

  const result: Record<string, any> = { ...base };

  Object.keys(patch).forEach((key) => {
    const baseValue = result[key];
    const patchValue = patch[key];

    if (Array.isArray(patchValue)) {
      result[key] = patchValue;
      return;
    }

    if (isPlainObject(baseValue) && isPlainObject(patchValue)) {
      result[key] = deepMerge(baseValue, patchValue);
      return;
    }

    result[key] = patchValue;
  });

  return result as T;
}

function mergeItemsKeepingIcons<T extends IconContentItem>(
  baseItems: T[],
  patchItems: any[] | undefined
): T[] {
  if (!Array.isArray(patchItems)) {
    return baseItems;
  }

  return baseItems.map((baseItem, index) => {
    const patchItem = patchItems[index];

    if (!patchItem) {
      return baseItem;
    }

    return {
      ...baseItem,
      title: patchItem.title || baseItem.title,
      text: patchItem.text || baseItem.text,
    };
  });
}

export function buildSiteContent<T extends BaseSiteContent>(
  baseContent: T,
  patch: ContentPatch
): BuiltSiteContent<T> {
  const merged = deepMerge(baseContent, patch) as BuiltSiteContent<T>;

  if (Array.isArray(baseContent.models)) {
    merged.models = mergeItemsKeepingIcons(baseContent.models, patch.models);
  }

  if (Array.isArray(baseContent.benefits)) {
    merged.benefits = mergeItemsKeepingIcons(baseContent.benefits, patch.benefits);
  }

  return merged;
}

export async function getSiteContentPatch(): Promise<ContentPatch> {
  const { data, error } = await supabase
    .from(SITE_CONTENT_TABLE)
    .select('content')
    .eq('id', SITE_CONTENT_ID)
    .maybeSingle();

  if (error) {
    console.error('Error loading site content:', error);
    return {};
  }

  return data?.content || {};
}

export async function saveSiteContentPatch(content: ContentPatch) {
  const { error } = await supabase.from(SITE_CONTENT_TABLE).upsert({
    id: SITE_CONTENT_ID,
    content,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }
}

export async function uploadSiteImage(file: File, folder: string): Promise<string> {
  const extension = file.name.split('.').pop() || 'jpg';
  const safeExtension = extension.toLowerCase();

  const fileName = `${folder}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${safeExtension}`;

  const { error } = await supabase.storage
    .from(SITE_IMAGES_BUCKET)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(SITE_IMAGES_BUCKET).getPublicUrl(fileName);

  return data.publicUrl;
}

export async function resolveAdminLoginEmail(usernameOrEmail: string) {
  const { data, error } = await supabase.functions.invoke(
    MANAGE_ADMIN_USERS_FUNCTION,
    {
      body: {
        action: 'resolve-login',
        username: usernameOrEmail,
      },
    }
  );

  if (error) {
    throw error;
  }

  if (!data?.email) {
    throw new Error('Utilizador inválido.');
  }

  return data.email as string;
}

export async function signInAdmin(usernameOrEmail: string, password: string) {
  const email = await resolveAdminLoginEmail(usernameOrEmail);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }
}

export async function signOutAdmin() {
  await supabase.auth.signOut();
}

export async function getCurrentAdminUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}