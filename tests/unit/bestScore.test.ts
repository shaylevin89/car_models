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
    expect(getBestScore()).toBe(0);
  });

  it('returns the stored best score', () => {
    localStorage.setItem('car-trivia-best-score', '15');
    expect(getBestScore()).toBe(15);
  });

  it('returns 0 for invalid stored value', () => {
    localStorage.setItem('car-trivia-best-score', 'abc');
    expect(getBestScore()).toBe(0);
  });

  it('sets best score when current score is higher', () => {
    const result = setBestScoreIfHigher(10);
    expect(result).toBe(10);
    expect(getBestScore()).toBe(10);
  });

  it('does not overwrite when current score is lower', () => {
    localStorage.setItem('car-trivia-best-score', '20');
    const result = setBestScoreIfHigher(5);
    expect(result).toBe(20);
    expect(getBestScore()).toBe(20);
  });

  it('updates when current score is equal (returns same value)', () => {
    localStorage.setItem('car-trivia-best-score', '10');
    const result = setBestScoreIfHigher(10);
    expect(result).toBe(10);
  });
});
