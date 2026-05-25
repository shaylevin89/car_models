const STORAGE_KEY = 'car-trivia-best-score';

export function getBestScore(): number {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) return 0;
  const parsed = parseInt(stored, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Compares score against stored best.
 * If score is higher, persists it.
 * Returns the (possibly updated) best score.
 */
export function setBestScoreIfHigher(score: number): number {
  const current = getBestScore();
  if (score > current) {
    localStorage.setItem(STORAGE_KEY, String(score));
    return score;
  }
  return current;
}
