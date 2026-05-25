import { describe, it, expect } from 'vitest';
import { generateQuestion, getBrandsForScore, getTierForScore } from '../../src/utils/questionGenerator';
import { carBrands } from '../../src/data/carData';

describe('getTierForScore', () => {
  it('returns tier 1 for scores 0-9', () => {
    for (let s = 0; s <= 9; s++) {
      expect(getTierForScore(s), `score ${s}`).toBe(1);
    }
  });

  it('returns tier 2 for scores 10-19', () => {
    for (let s = 10; s <= 19; s++) {
      expect(getTierForScore(s), `score ${s}`).toBe(2);
    }
  });

  it('returns tier 3 for scores 20-29', () => {
    for (let s = 20; s <= 29; s++) {
      expect(getTierForScore(s), `score ${s}`).toBe(3);
    }
  });

  it('cycles back to tier 1 for scores 30-39', () => {
    for (let s = 30; s <= 39; s++) {
      expect(getTierForScore(s), `score ${s}`).toBe(1);
    }
  });

  it('cycles correctly through multiple full cycles', () => {
    expect(getTierForScore(60)).toBe(1);
    expect(getTierForScore(70)).toBe(2);
    expect(getTierForScore(80)).toBe(3);
  });
});

describe('getBrandsForScore', () => {
  it('returns only tier 1 brands for score 0', () => {
    const brands = getBrandsForScore(0);
    expect(brands.every(b => b.tier === 1)).toBe(true);
    expect(brands.length).toBeGreaterThan(0);
  });

  it('returns only tier 2 brands for score 10', () => {
    const brands = getBrandsForScore(10);
    expect(brands.every(b => b.tier === 2)).toBe(true);
    expect(brands.length).toBeGreaterThan(0);
  });

  it('returns only tier 3 brands for score 20', () => {
    const brands = getBrandsForScore(20);
    expect(brands.every(b => b.tier === 3)).toBe(true);
    expect(brands.length).toBeGreaterThan(0);
  });

  it('returns only tier 1 brands for score 30 (cycle)', () => {
    const brands = getBrandsForScore(30);
    expect(brands.every(b => b.tier === 1)).toBe(true);
  });
});

describe('generateQuestion', () => {
  it('returns a question with exactly 4 options', () => {
    const q = generateQuestion(0);
    expect(q.options).toHaveLength(4);
  });

  it('includes the correct model in the options', () => {
    const q = generateQuestion(0);
    expect(q.options).toContain(q.correctModel);
  });

  it('correct model belongs to the question brand', () => {
    const q = generateQuestion(0);
    expect(q.brand.models).toContain(q.correctModel);
  });

  it('distractor models do not belong to the question brand', () => {
    const q = generateQuestion(0);
    const distractors = q.options.filter(o => o !== q.correctModel);
    for (const d of distractors) {
      expect(q.brand.models).not.toContain(d);
    }
  });

  it('all 4 options are unique', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateQuestion(0);
      const unique = new Set(q.options);
      expect(unique.size, `Duplicate options found: ${q.options}`).toBe(4);
    }
  });

  it('options are shuffled (not always in same position)', () => {
    const positions = new Set<number>();
    for (let i = 0; i < 20; i++) {
      const q = generateQuestion(0);
      positions.add(q.options.indexOf(q.correctModel));
    }
    expect(positions.size).toBeGreaterThanOrEqual(2);
  });

  it('question brand matches the expected tier for the given score', () => {
    for (const score of [0, 5, 10, 15, 20, 25, 30]) {
      const q = generateQuestion(score);
      expect(q.brand.tier, `score ${score}`).toBe(getTierForScore(score));
    }
  });

  it('distractors come from the same tier as the question brand', () => {
    for (let i = 0; i < 10; i++) {
      const q = generateQuestion(10); // Tier 2
      const distractors = q.options.filter(o => o !== q.correctModel);
      const tier2Models = new Set(
        carBrands.filter(b => b.tier === 2).flatMap(b => b.models)
      );
      for (const d of distractors) {
        expect(tier2Models.has(d), `Distractor "${d}" not in tier 2`).toBe(true);
      }
    }
  });
});
