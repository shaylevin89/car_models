import { describe, it, expect } from 'vitest';
import { generateQuestion, getAvailableBrands } from '../../src/utils/questionGenerator';
import { carBrands } from '../../src/data/carData';

describe('getAvailableBrands', () => {
  it('returns only tier 1 brands for score 0-4', () => {
    const brands = getAvailableBrands(0);
    expect(brands.every(b => b.tier === 1)).toBe(true);
    expect(brands.length).toBeGreaterThan(0);
  });

  it('returns tier 1 and 2 brands for score 5-9', () => {
    const brands = getAvailableBrands(5);
    const tiers = new Set(brands.map(b => b.tier));
    expect(tiers.has(1)).toBe(true);
    expect(tiers.has(2)).toBe(true);
    expect(tiers.has(3)).toBe(false);
  });

  it('returns all tiers for score 10+', () => {
    const brands = getAvailableBrands(10);
    const tiers = new Set(brands.map(b => b.tier));
    expect(tiers.has(1)).toBe(true);
    expect(tiers.has(2)).toBe(true);
    expect(tiers.has(3)).toBe(true);
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
    // Run 20 times to catch probabilistic duplicates
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
    // With 20 runs, the correct answer should appear in at least 2 different positions
    expect(positions.size).toBeGreaterThanOrEqual(2);
  });
});
