import { createClient } from '@supabase/supabase-js';

const ANALYTICS_EVENTS_TABLE = 'casas_centro_analytics_events';

const allowedEventTypes = new Set([
  'page_view',
  'whatsapp_click',
  'instagram_click',
  'cta_click',
  'contact_form_submit',
  'contact_form_error',
]);

function getHeaderValue(headers: Record<string, string | string[] | undefined>, name: string) {
  const value = headers[name.toLowerCase()] || headers[name];

  if (Array.isArray(value)) {
    return value[0] || null;
  }

  return value || null;
}

function decodeHeaderValue(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function sanitizeText(value: unknown, maxLength = 500) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return null;
  }

  return trimmedValue.slice(0, maxLength);
}

function sanitizeMetadata(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl =
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';

  const supabaseAnonKey =
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    '';

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({
      error: 'Supabase environment variables are missing.',
    });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const eventType = sanitizeText(body.event_type, 80);

  if (!eventType || !allowedEventTypes.has(eventType)) {
    return res.status(400).json({ error: 'Invalid analytics event type.' });
  }

  const country = decodeHeaderValue(getHeaderValue(req.headers, 'x-vercel-ip-country'));
  const region = decodeHeaderValue(getHeaderValue(req.headers, 'x-vercel-ip-country-region'));
  const city = decodeHeaderValue(getHeaderValue(req.headers, 'x-vercel-ip-city'));

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });

  const { error } = await supabase.from(ANALYTICS_EVENTS_TABLE).insert({
    event_type: eventType,
    page_path: sanitizeText(body.page_path, 500) || '/',
    page_title: sanitizeText(body.page_title, 300),
    referrer: sanitizeText(body.referrer, 500),
    device_type: sanitizeText(body.device_type, 80),
    browser: sanitizeText(body.browser, 80),
    user_agent: sanitizeText(body.user_agent, 500),
    country: sanitizeText(country, 120),
    region: sanitizeText(region, 180),
    city: sanitizeText(city, 180),
    metadata: sanitizeMetadata(body.metadata),
  });

  if (error) {
    return res.status(500).json({
      error: 'Analytics event could not be recorded.',
    });
  }

  return res.status(200).json({ ok: true });
}
