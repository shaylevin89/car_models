import { Subject } from '../types/game';

const STORAGE_PREFIX = 'car-trivia-best-score';

function storageKey(subject: Subject): string {
  return `${STORAGE_PREFIX}-${subject}`;
}

export function getBestScore(subject: Subject): number {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem(storageKey(subject));
  if (stored === null) return 0;
  const parsed = parseInt(stored, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Compares score against the stored best for this subject.
 * If score is higher, persists it.
 * Returns the (possibly updated) best score.
 */
export function setBestScoreIfHigher(subject: Subject, score: number): number {
  const current = getBestScore(subject);
  if (score > current) {
    localStorage.setItem(storageKey(subject), String(score));
    return score;
  }
  return current;
}
