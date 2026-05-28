import { Flag } from '../types/game';

/**
 * Flags for the Flags trivia subject. The `name` is the English country name
 * (canonical key used for answer comparison + Hebrew lookup via
 * countryNameTranslations). `countryCode` is the ISO 3166-1 alpha-2 code,
 * lowercase, used to construct the flag image URL.
 *
 * Tiers mirror the countryData tier scheme: 1 = household names,
 * 2 = moderately known, 3 = obscure / commonly confused.
 */
export const flags: Flag[] = [
  // Tier 1 — Household names
  { name: 'Israel', countryCode: 'il', tier: 1 },
  { name: 'United States', countryCode: 'us', tier: 1 },
  { name: 'United Kingdom', countryCode: 'gb', tier: 1 },
  { name: 'France', countryCode: 'fr', tier: 1 },
  { name: 'Germany', countryCode: 'de', tier: 1 },
  { name: 'Italy', countryCode: 'it', tier: 1 },
  { name: 'Spain', countryCode: 'es', tier: 1 },
  { name: 'Greece', countryCode: 'gr', tier: 1 },
  { name: 'Egypt', countryCode: 'eg', tier: 1 },
  { name: 'Russia', countryCode: 'ru', tier: 1 },
  { name: 'China', countryCode: 'cn', tier: 1 },
  { name: 'Japan', countryCode: 'jp', tier: 1 },
  { name: 'India', countryCode: 'in', tier: 1 },
  { name: 'Brazil', countryCode: 'br', tier: 1 },
  { name: 'Australia', countryCode: 'au', tier: 1 },
  { name: 'Canada', countryCode: 'ca', tier: 1 },
  { name: 'Mexico', countryCode: 'mx', tier: 1 },
  { name: 'Turkey', countryCode: 'tr', tier: 1 },
  // Tier 2 — Moderately known
  { name: 'Netherlands', countryCode: 'nl', tier: 2 },
  { name: 'Sweden', countryCode: 'se', tier: 2 },
  { name: 'Norway', countryCode: 'no', tier: 2 },
  { name: 'Finland', countryCode: 'fi', tier: 2 },
  { name: 'Denmark', countryCode: 'dk', tier: 2 },
  { name: 'Switzerland', countryCode: 'ch', tier: 2 },
  { name: 'Belgium', countryCode: 'be', tier: 2 },
  { name: 'Austria', countryCode: 'at', tier: 2 },
  { name: 'Portugal', countryCode: 'pt', tier: 2 },
  { name: 'Poland', countryCode: 'pl', tier: 2 },
  { name: 'Ireland', countryCode: 'ie', tier: 2 },
  { name: 'Czech Republic', countryCode: 'cz', tier: 2 },
  { name: 'Hungary', countryCode: 'hu', tier: 2 },
  { name: 'Saudi Arabia', countryCode: 'sa', tier: 2 },
  { name: 'Iran', countryCode: 'ir', tier: 2 },
  { name: 'Argentina', countryCode: 'ar', tier: 2 },
  { name: 'South Korea', countryCode: 'kr', tier: 2 },
  { name: 'South Africa', countryCode: 'za', tier: 2 },
  { name: 'Thailand', countryCode: 'th', tier: 2 },
  { name: 'Vietnam', countryCode: 'vn', tier: 2 },
  { name: 'Morocco', countryCode: 'ma', tier: 2 },
  { name: 'Lebanon', countryCode: 'lb', tier: 2 },
  // Tier 3 — Obscure / commonly confused
  { name: 'Mongolia', countryCode: 'mn', tier: 3 },
  { name: 'Kazakhstan', countryCode: 'kz', tier: 3 },
  { name: 'Uzbekistan', countryCode: 'uz', tier: 3 },
  { name: 'Bhutan', countryCode: 'bt', tier: 3 },
  { name: 'Nepal', countryCode: 'np', tier: 3 },
  { name: 'Sri Lanka', countryCode: 'lk', tier: 3 },
  { name: 'Ethiopia', countryCode: 'et', tier: 3 },
  { name: 'Ghana', countryCode: 'gh', tier: 3 },
  { name: 'Senegal', countryCode: 'sn', tier: 3 },
  { name: 'Zimbabwe', countryCode: 'zw', tier: 3 },
  { name: 'Iceland', countryCode: 'is', tier: 3 },
  { name: 'Estonia', countryCode: 'ee', tier: 3 },
  { name: 'Latvia', countryCode: 'lv', tier: 3 },
  { name: 'Lithuania', countryCode: 'lt', tier: 3 },
  { name: 'Slovenia', countryCode: 'si', tier: 3 },
  { name: 'Slovakia', countryCode: 'sk', tier: 3 },
  { name: 'Croatia', countryCode: 'hr', tier: 3 },
  { name: 'Serbia', countryCode: 'rs', tier: 3 },
  { name: 'Albania', countryCode: 'al', tier: 3 },
  { name: 'Bulgaria', countryCode: 'bg', tier: 3 },
  { name: 'Belarus', countryCode: 'by', tier: 3 },
  { name: 'Georgia', countryCode: 'ge', tier: 3 },
  { name: 'Armenia', countryCode: 'am', tier: 3 },
  { name: 'Azerbaijan', countryCode: 'az', tier: 3 },
  { name: 'Cuba', countryCode: 'cu', tier: 3 },
  { name: 'Bolivia', countryCode: 'bo', tier: 3 },
  { name: 'Paraguay', countryCode: 'py', tier: 3 },
  { name: 'Uruguay', countryCode: 'uy', tier: 3 },
  { name: 'Costa Rica', countryCode: 'cr', tier: 3 },
  { name: 'Panama', countryCode: 'pa', tier: 3 },
  { name: 'Laos', countryCode: 'la', tier: 3 },
  { name: 'Cambodia', countryCode: 'kh', tier: 3 },
  { name: 'Myanmar', countryCode: 'mm', tier: 3 },
  { name: 'Bangladesh', countryCode: 'bd', tier: 3 },
];

/**
 * Builds the CDN URL for a flag image. flagcdn.com serves free SVG and PNG
 * flags keyed by the ISO 3166-1 alpha-2 code. We request the w320 PNG so the
 * 150x150 box in QuestionCard renders crisply on retina screens.
 */
export function getFlagUrl(countryCode: string): string {
  return `https://flagcdn.com/w320/${countryCode}.png`;
}
