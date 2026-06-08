export const CONTENT_STORAGE_KEY = 'casas_do_centro_content_v1';

export type ContentPatch = Record<string, any>;

function isPlainObject(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function loadContentPatch(): ContentPatch {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const savedContent = window.localStorage.getItem(CONTENT_STORAGE_KEY);

    if (!savedContent) {
      return {};
    }

    return JSON.parse(savedContent);
  } catch {
    return {};
  }
}

export function saveContentPatch(patch: ContentPatch) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(patch));
}

export function resetContentPatch() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(CONTENT_STORAGE_KEY);
}

export function deepMerge<T>(base: T, patch: ContentPatch): T {
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

export function loadSiteContent<T>(baseContent: T): T & { heroImageDataUrl?: string } {
  const patch = loadContentPatch();
  return deepMerge(baseContent, patch) as T & { heroImageDataUrl?: string };
}