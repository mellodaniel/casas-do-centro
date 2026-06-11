import { supabase } from './supabaseClient';

export const ANALYTICS_EVENTS_TABLE = 'casas_centro_analytics_events';

export type AnalyticsEventType =
  | 'page_view'
  | 'whatsapp_click'
  | 'instagram_click'
  | 'cta_click'
  | 'contact_form_submit'
  | 'contact_form_error';

export type AnalyticsEvent = {
  id: string;
  event_type: AnalyticsEventType | string;
  page_path: string;
  page_title: string | null;
  referrer: string | null;
  device_type: string | null;
  browser: string | null;
  user_agent: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type AnalyticsDashboard = {
  events: AnalyticsEvent[];
  pageViewsToday: number;
  pageViews7Days: number;
  pageViews30Days: number;
  whatsappClicks30Days: number;
  instagramClicks30Days: number;
  contactFormSubmits30Days: number;
  contactFormErrors30Days: number;
  conversionRate30Days: number;
  topPages: Array<{ label: string; count: number }>;
  deviceDistribution: Array<{ label: string; count: number }>;
  eventDistribution: Array<{ label: string; count: number }>;
  countryDistribution: Array<{ label: string; count: number }>;
  regionDistribution: Array<{ label: string; count: number }>;
  cityDistribution: Array<{ label: string; count: number }>;
};

type AnalyticsMetadata = Record<string, unknown>;

function getDeviceType(userAgent: string) {
  const normalizedUserAgent = userAgent.toLowerCase();

  if (/ipad|tablet/.test(normalizedUserAgent)) {
    return 'tablet';
  }

  if (/mobi|android|iphone|ipod/.test(normalizedUserAgent)) {
    return 'mobile';
  }

  return 'desktop';
}

function getBrowser(userAgent: string) {
  if (/edg/i.test(userAgent)) {
    return 'Edge';
  }

  if (/opr|opera/i.test(userAgent)) {
    return 'Opera';
  }

  if (/chrome|crios/i.test(userAgent)) {
    return 'Chrome';
  }

  if (/safari/i.test(userAgent) && !/chrome|crios/i.test(userAgent)) {
    return 'Safari';
  }

  if (/firefox|fxios/i.test(userAgent)) {
    return 'Firefox';
  }

  return 'Outro';
}

function countBy<T>(
  items: T[],
  getKey: (item: T) => string | null | undefined
): Array<{ label: string; count: number }> {
  const counts = new Map<string, number>();

  items.forEach((item) => {
    const key = getKey(item) || 'Desconhecido';
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function isAfterOrEqual(dateValue: string, date: Date) {
  return new Date(dateValue).getTime() >= date.getTime();
}

export async function logAnalyticsEvent(
  eventType: AnalyticsEventType,
  metadata: AnalyticsMetadata = {}
) {
  if (typeof window === 'undefined') {
    return;
  }

  const userAgent = window.navigator.userAgent || '';
  const pagePath = `${window.location.pathname}${window.location.search}`;

  try {
    const response = await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      keepalive: true,
      body: JSON.stringify({
        event_type: eventType,
        page_path: pagePath,
        page_title: document.title || null,
        referrer: document.referrer || null,
        device_type: getDeviceType(userAgent),
        browser: getBrowser(userAgent),
        user_agent: userAgent,
        metadata,
      }),
    });

    if (!response.ok) {
      throw new Error(`Analytics API returned ${response.status}`);
    }
  } catch (error) {
    console.warn('Analytics event was not recorded:', error);
  }
}

export async function getAnalyticsDashboard(): Promise<AnalyticsDashboard> {
  const since30Days = new Date();
  since30Days.setDate(since30Days.getDate() - 30);

  const since7Days = new Date();
  since7Days.setDate(since7Days.getDate() - 7);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from(ANALYTICS_EVENTS_TABLE)
    .select('*')
    .gte('created_at', since30Days.toISOString())
    .order('created_at', { ascending: false })
    .limit(5000);

  if (error) {
    throw error;
  }

  const events = (data || []) as AnalyticsEvent[];
  const pageViews = events.filter((event) => event.event_type === 'page_view');
  const pageViewsToday = pageViews.filter((event) =>
    isAfterOrEqual(event.created_at, today)
  ).length;
  const pageViews7Days = pageViews.filter((event) =>
    isAfterOrEqual(event.created_at, since7Days)
  ).length;
  const pageViews30Days = pageViews.length;
  const whatsappClicks30Days = events.filter(
    (event) => event.event_type === 'whatsapp_click'
  ).length;
  const instagramClicks30Days = events.filter(
    (event) => event.event_type === 'instagram_click'
  ).length;
  const contactFormSubmits30Days = events.filter(
    (event) => event.event_type === 'contact_form_submit'
  ).length;
  const contactFormErrors30Days = events.filter(
    (event) => event.event_type === 'contact_form_error'
  ).length;

  const conversionRate30Days =
    pageViews30Days > 0
      ? Number(((contactFormSubmits30Days / pageViews30Days) * 100).toFixed(1))
      : 0;

  return {
    events,
    pageViewsToday,
    pageViews7Days,
    pageViews30Days,
    whatsappClicks30Days,
    instagramClicks30Days,
    contactFormSubmits30Days,
    contactFormErrors30Days,
    conversionRate30Days,
    topPages: countBy(pageViews, (event) => event.page_path).slice(0, 8),
    deviceDistribution: countBy(events, (event) => event.device_type).slice(0, 6),
    eventDistribution: countBy(events, (event) => event.event_type).slice(0, 8),
    countryDistribution: countBy(pageViews, (event) => event.country).slice(0, 8),
    regionDistribution: countBy(pageViews, (event) => event.region).slice(0, 8),
    cityDistribution: countBy(pageViews, (event) => event.city).slice(0, 8),
  };
}
