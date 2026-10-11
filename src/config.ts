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
  { slug: 'skins-calculator', key: 'skins', tab: 'Skins', group: 'games', title: 'Golf Skins Calculator (with Handicaps)', blurb: 'Gross or net. Carryovers.' },
  { slug: 'nassau-calculator', key: 'nassau', tab: 'Nassau', group: 'games', title: 'Golf Nassau Calculator (with Handicaps)', blurb: 'Front, back, overall.' },
  { slug: 'match-play-calculator', key: 'match', tab: 'Match Play', group: 'games', title: 'Golf Match Play Calculator', blurb: 'Hole by hole. 3 & 2.' },
  { slug: 'best-ball-calculator', key: 'bestball', tab: 'Best Ball', group: 'games', title: 'Best Ball Golf Calculator (2 vs 2)', blurb: 'Two-man teams. Net.' },
  { slug: 'wolf-calculator', key: 'wolf', tab: 'Wolf', group: 'games', title: 'Golf Wolf Calculator', blurb: 'Lone and blind wolf.' },
  { slug: 'stableford-calculator', key: 'stableford', tab: 'Stableford', group: 'games', title: 'Stableford Calculator (Golf Points)', blurb: 'Points per hole.' },
  { slug: 'vegas-calculator', key: 'vegas', tab: 'Vegas', group: 'games', title: 'Vegas Golf Game Calculator', blurb: 'Team numbers. Birdie flip.' },
  { slug: 'bingo-bango-bongo-calculator', key: 'bbb', tab: 'Bingo Bango Bongo', group: 'games', title: 'Bingo Bango Bongo Calculator', blurb: '3 points a hole.' },
  { slug: 'scramble-calculator', key: 'scramble', tab: 'Scramble', group: 'handicaps', title: 'Golf Scramble Handicap Calculator', blurb: 'Team handicap, USGA %.' },
  { slug: 'course-handicap-calculator', key: 'coursehcp', tab: 'Course Handicap', group: 'handicaps', title: 'Course Handicap Calculator', blurb: 'Strokes from any tee.' },
  { slug: 'handicap-index-calculator', key: 'index', tab: 'Handicap Index', group: 'handicaps', title: 'Golf Handicap Calculator (Handicap Index)', blurb: 'From your recent scores.' },
] as const;

export const calcByKey = (key: string) => CALCS.find((c) => c.key === key);
