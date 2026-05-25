export type Locale = 'he' | 'en';

export const translations: Record<Locale, Record<string, string>> = {
  he: {
    'app.title': 'טריוויית רכב',
    'start.subtitle': 'התאימו את יצרן הרכב לדגם שלו!',
    'start.instruction1': 'תראו את הלוגו של היצרן ובחרו את הדגם הנכון.',
    'start.instruction2': 'תשובה נכונה = נקודה. תשובה שגויה או שנגמר הזמן = סוף המשחק!',
    'start.timer_note': 'יש לכם 10 שניות לכל שאלה.',
    'start.button': 'התחל משחק',
    'start.best_score': 'שיא: {score}',
    'game.question': 'איזה דגם שייך ליצרן הזה?',
    'game.score': 'ניקוד: {score}',
    'game.time': 'זמן',
    'gameover.title': 'המשחק נגמר',
    'gameover.points_one': 'נקודה',
    'gameover.points_other': 'נקודות',
    'gameover.new_best': 'שיא חדש!',
    'gameover.best_score': 'שיא: {score}',
    'gameover.play_again': 'שחק שוב',
    'gameover.share': 'שתף',
    'gameover.copied': 'הועתק!',
    'gameover.msg_0': 'בפעם הבאה יהיה יותר טוב!',
    'gameover.msg_low': 'התחלה טובה!',
    'gameover.msg_mid': 'כל הכבוד!',
    'gameover.msg_high': 'מדהים!',
    'gameover.msg_expert': 'מומחה רכב!',
    'lang.hebrew': 'עברית',
    'lang.english': 'English',
  },
  en: {
    'app.title': 'Car Trivia',
    'start.subtitle': 'Match the car brand to its model!',
    'start.instruction1': 'See the manufacturer logo and choose the correct model.',
    'start.instruction2': 'Correct answer = point. Wrong answer or timeout = game over!',
    'start.timer_note': 'You have 10 seconds per question.',
    'start.button': 'Start Game',
    'start.best_score': 'Best: {score}',
    'game.question': 'Which model belongs to this brand?',
    'game.score': 'Score: {score}',
    'game.time': 'Time',
    'gameover.title': 'Game Over',
    'gameover.points_one': 'point',
    'gameover.points_other': 'points',
    'gameover.new_best': 'New Best!',
    'gameover.best_score': 'Best: {score}',
    'gameover.play_again': 'Play Again',
    'gameover.share': 'Share',
    'gameover.copied': 'Copied!',
    'gameover.msg_0': 'Better luck next time!',
    'gameover.msg_low': 'Nice try!',
    'gameover.msg_mid': 'Great job!',
    'gameover.msg_high': 'Amazing!',
    'gameover.msg_expert': 'Car Expert!',
    'lang.hebrew': 'עברית',
    'lang.english': 'English',
  },
};

/**
 * Look up a translation key for a given locale.
 * Supports simple {param} interpolation via optional params argument.
 * Returns the key itself if not found.
 */
export function translate(locale: Locale, key: string, params?: Record<string, string | number>): string {
  const value = translations[locale]?.[key] ?? key;
  if (!params) return value;
  return Object.entries(params).reduce(
    (str, [k, v]) => str.replace(`{${k}}`, String(v)),
    value,
  );
}
