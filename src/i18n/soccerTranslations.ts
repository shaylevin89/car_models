import { Locale } from './translations';

export const playerNameTranslations: Record<string, Partial<Record<Locale, string>>> = {
  // Tier 1
  'Eli Ohana': { he: 'אלי אוחנה' },
  'Yossi Benayoun': { he: 'יוסי בניון' },
  'Eyal Berkovic': { he: 'אייל ברקוביץ׳' },
  'Ronnie Rosenthal': { he: 'רוני רוזנטל' },
  'Avi Nimni': { he: 'אבי נמני' },
  'Haim Revivo': { he: 'חיים רביבו' },
  // Tier 2
  'Tal Banin': { he: 'טל בנין' },
  'Idan Tal': { he: 'עידן טל' },
  'Walid Badir': { he: 'ואליד בדיר' },
  'Yaniv Katan': { he: 'יניב כתן' },
  'Salim Tuama': { he: 'סלים טועמה' },
  'Arik Benado': { he: 'אריק בנאדו' },
  // Tier 3
  'Giovanni Rosso': { he: 'ג׳ובאני רוסו' },
  'Alon Mizrahi': { he: 'אלון מזרחי' },
  'Eli Driks': { he: 'אלי דריקס' },
  'Reuven Atar': { he: 'ראובן עטר' },
  'Uri Malmilian': { he: 'אורי מלמיליאן' },
  'Mordechai Spiegler': { he: 'מרדכי שפיגלר' },
};

export const teamNameTranslations: Record<string, Partial<Record<Locale, string>>> = {
  'Maccabi Haifa': { he: 'מכבי חיפה' },
  'Maccabi Tel Aviv': { he: 'מכבי תל אביב' },
  'Hapoel Tel Aviv': { he: 'הפועל תל אביב' },
  'Beitar Jerusalem': { he: 'בית"ר ירושלים' },
  'Hapoel Beer Sheva': { he: 'הפועל באר שבע' },
  'Bnei Yehuda': { he: 'בני יהודה' },
  'Hapoel Haifa': { he: 'הפועל חיפה' },
  'Hapoel Petah Tikva': { he: 'הפועל פתח תקווה' },
  'Maccabi Petah Tikva': { he: 'מכבי פתח תקווה' },
  'Ironi Kiryat Shmona': { he: 'עירוני קרית שמונה' },
  'Maccabi Netanya': { he: 'מכבי נתניה' },
};

export function localizePlayerName(englishName: string, locale: Locale): string {
  if (locale === 'en') return englishName;
  return playerNameTranslations[englishName]?.[locale] ?? englishName;
}

export function localizeTeamName(englishName: string, locale: Locale): string {
  if (locale === 'en') return englishName;
  return teamNameTranslations[englishName]?.[locale] ?? englishName;
}
