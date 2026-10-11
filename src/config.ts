// The one place that decides where every "Get RoundRival" button goes.
// Today: the roundrival.com landing page. Once the app is live, set APP_STORE_URL
// (and APP_STORE_ID to turn on Safari's smart app banner). Nothing else needs to change.

export const SITE_URL = 'https://golf.roundrival.com';
export const LANDING_URL = 'https://roundrival.com';
export const APP_STORE_URL = '';
export const APP_STORE_ID = '';

/** Plausible analytics domain. Leave empty to turn analytics off. */
export const PLAUSIBLE_DOMAIN = '';

export const CTA_LABEL = 'Get RoundRival';
export const CTA_TAGLINE = 'Keep score live. Settle up in one tap.';

/** Destination for every main button, tagged so you can see which page and spot sent the visit. */
export function ctaUrl(page: string, spot: string): string {
  const base = APP_STORE_URL || LANDING_URL;
  const u = new URL(base);
  u.searchParams.set('utm_source', 'golf-calculators');
  u.searchParams.set('utm_medium', 'web');
  u.searchParams.set('utm_campaign', page);
  u.searchParams.set('utm_content', spot);
  return u.toString();
}

export const CALCS = [
  { slug: 'skins-calculator', key: 'skins', tab: 'Skins', title: 'Golf Skins Calculator (with Handicaps)', blurb: 'Gross or net. Carryovers.' },
  { slug: 'nassau-calculator', key: 'nassau', tab: 'Nassau', title: 'Golf Nassau Calculator (with Handicaps)', blurb: 'Front, back, overall.' },
  { slug: 'wolf-calculator', key: 'wolf', tab: 'Wolf', title: 'Golf Wolf Calculator', blurb: 'Lone and blind wolf.' },
  { slug: 'scramble-calculator', key: 'scramble', tab: 'Scramble', title: 'Golf Scramble Handicap Calculator', blurb: 'Team handicap, USGA %.' },
] as const;
