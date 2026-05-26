import { describe, it, expect, beforeEach } from 'vitest';
import { getBestScore, setBestScoreIfHigher } from '../../src/utils/bestScore';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('bestScore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns 0 when no best score is stored', () => {
    expect(getBestScore('cars')).toBe(0);
    expect(getBestScore('countries')).toBe(0);
  });

  it('returns the stored best score per subject', () => {
    localStorage.setItem('car-trivia-best-score-cars', '15');
    localStorage.setItem('car-trivia-best-score-countries', '8');
    expect(getBestScore('cars')).toBe(15);
    expect(getBestScore('countries')).toBe(8);
  });

  it('returns 0 for invalid stored value', () => {
    localStorage.setItem('car-trivia-best-score-cars', 'abc');
    expect(getBestScore('cars')).toBe(0);
  });

  it('sets best score when current score is higher', () => {
    const result = setBestScoreIfHigher('cars', 10);
    expect(result).toBe(10);
    expect(getBestScore('cars')).toBe(10);
  });

  it('does not overwrite when current score is lower', () => {
    localStorage.setItem('car-trivia-best-score-cars', '20');
    const result = setBestScoreIfHigher('cars', 5);
    expect(result).toBe(20);
    expect(getBestScore('cars')).toBe(20);
  });

  it('updates when current score is equal (returns same value)', () => {
    localStorage.setItem('car-trivia-best-score-cars', '10');
    const result = setBestScoreIfHigher('cars', 10);
    expect(result).toBe(10);
  });

  it('best scores are isolated per subject', () => {
    setBestScoreIfHigher('cars', 12);
    expect(getBestScore('cars')).toBe(12);
    expect(getBestScore('countries')).toBe(0);

    setBestScoreIfHigher('countries', 4);
    expect(getBestScore('countries')).toBe(4);
    expect(getBestScore('cars')).toBe(12); // unaffected
  });
});
