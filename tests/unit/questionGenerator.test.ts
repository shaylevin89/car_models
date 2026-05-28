import { describe, it, expect } from 'vitest';
import {
  generateQuestion,
  getBrandsForScore,
  getCountriesForScore,
  getFlagsForScore,
  getQuestionKey,
  getTierForScore,
} from '../../src/utils/questionGenerator';
import { carBrands } from '../../src/data/carData';
import { countries } from '../../src/data/countryData';
import { flags } from '../../src/data/flagData';

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

describe('getCountriesForScore', () => {
  it('returns only tier 1 countries for score 0', () => {
    const c = getCountriesForScore(0);
    expect(c.every(x => x.tier === 1)).toBe(true);
    expect(c.length).toBeGreaterThan(0);
  });

  it('returns only tier 2 countries for score 10', () => {
    const c = getCountriesForScore(10);
    expect(c.every(x => x.tier === 2)).toBe(true);
    expect(c.length).toBeGreaterThan(0);
  });

  it('returns only tier 3 countries for score 20', () => {
    const c = getCountriesForScore(20);
    expect(c.every(x => x.tier === 3)).toBe(true);
    expect(c.length).toBeGreaterThan(0);
  });
});

describe('getFlagsForScore', () => {
  it('returns only tier 1 flags for score 0', () => {
    const f = getFlagsForScore(0);
    expect(f.every(x => x.tier === 1)).toBe(true);
    expect(f.length).toBeGreaterThan(0);
  });

  it('returns only tier 2 flags for score 10', () => {
    const f = getFlagsForScore(10);
    expect(f.every(x => x.tier === 2)).toBe(true);
    expect(f.length).toBeGreaterThan(0);
  });

  it('returns only tier 3 flags for score 20', () => {
    const f = getFlagsForScore(20);
    expect(f.every(x => x.tier === 3)).toBe(true);
    expect(f.length).toBeGreaterThan(0);
  });
});

describe('generateQuestion (cars)', () => {
  it('returns a question with exactly 4 options', () => {
    const q = generateQuestion('cars', 0);
    expect(q.options).toHaveLength(4);
  });

  it('includes the correct answer in the options', () => {
    const q = generateQuestion('cars', 0);
    expect(q.options).toContain(q.correctAnswer);
  });

  it('discriminator is "cars" with a brand field', () => {
    const q = generateQuestion('cars', 0);
    expect(q.subject).toBe('cars');
    if (q.subject === 'cars') {
      expect(q.brand).toBeDefined();
    }
  });

  it('correct model belongs to the question brand', () => {
    const q = generateQuestion('cars', 0);
    if (q.subject !== 'cars') throw new Error('Expected cars subject');
    expect(q.brand.models).toContain(q.correctAnswer);
  });

  it('distractor models do not belong to the question brand', () => {
    const q = generateQuestion('cars', 0);
    if (q.subject !== 'cars') throw new Error('Expected cars subject');
    const distractors = q.options.filter(o => o !== q.correctAnswer);
    for (const d of distractors) {
      expect(q.brand.models).not.toContain(d);
    }
  });

  it('all 4 options are unique', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateQuestion('cars', 0);
      const unique = new Set(q.options);
      expect(unique.size, `Duplicate options found: ${q.options}`).toBe(4);
    }
  });

  it('options are shuffled (not always in same position)', () => {
    const positions = new Set<number>();
    for (let i = 0; i < 20; i++) {
      const q = generateQuestion('cars', 0);
      positions.add(q.options.indexOf(q.correctAnswer));
    }
    expect(positions.size).toBeGreaterThanOrEqual(2);
  });

  it('question brand matches the expected tier for the given score', () => {
    for (const score of [0, 5, 10, 15, 20, 25, 30]) {
      const q = generateQuestion('cars', score);
      if (q.subject !== 'cars') throw new Error('Expected cars subject');
      expect(q.brand.tier, `score ${score}`).toBe(getTierForScore(score));
    }
  });

  it('distractors come from the same tier as the question brand', () => {
    for (let i = 0; i < 10; i++) {
      const q = generateQuestion('cars', 10); // Tier 2
      if (q.subject !== 'cars') throw new Error('Expected cars subject');
      const distractors = q.options.filter(o => o !== q.correctAnswer);
      const tier2Models = new Set(
        carBrands.filter(b => b.tier === 2).flatMap(b => b.models)
      );
      for (const d of distractors) {
        expect(tier2Models.has(d), `Distractor "${d}" not in tier 2`).toBe(true);
      }
    }
  });
});

describe('generateQuestion (countries)', () => {
  it('returns a question with exactly 4 options', () => {
    const q = generateQuestion('countries', 0);
    expect(q.options).toHaveLength(4);
  });

  it('includes the correct capital in the options', () => {
    const q = generateQuestion('countries', 0);
    expect(q.options).toContain(q.correctAnswer);
  });

  it('discriminator is "countries" with a country field', () => {
    const q = generateQuestion('countries', 0);
    expect(q.subject).toBe('countries');
    if (q.subject === 'countries') {
      expect(q.country).toBeDefined();
    }
  });

  it('correct capital matches the question country', () => {
    const q = generateQuestion('countries', 0);
    if (q.subject !== 'countries') throw new Error('Expected countries subject');
    expect(q.correctAnswer).toBe(q.country.capital);
  });

  it('distractor capitals do not belong to the question country', () => {
    const q = generateQuestion('countries', 0);
    if (q.subject !== 'countries') throw new Error('Expected countries subject');
    const distractors = q.options.filter(o => o !== q.correctAnswer);
    for (const d of distractors) {
      expect(d).not.toBe(q.country.capital);
    }
  });

  it('all 4 options are unique', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateQuestion('countries', 0);
      const unique = new Set(q.options);
      expect(unique.size, `Duplicate options found: ${q.options}`).toBe(4);
    }
  });

  it('question country matches the expected tier for the given score', () => {
    for (const score of [0, 5, 10, 15, 20, 25, 30]) {
      const q = generateQuestion('countries', score);
      if (q.subject !== 'countries') throw new Error('Expected countries subject');
      expect(q.country.tier, `score ${score}`).toBe(getTierForScore(score));
    }
  });

  it('distractors come from the question country\'s otherCities', () => {
    for (let i = 0; i < 30; i++) {
      const q = generateQuestion('countries', i % 30); // exercise all tiers
      if (q.subject !== 'countries') throw new Error('Expected countries subject');
      const distractors = q.options.filter(o => o !== q.correctAnswer);
      const otherCitiesSet = new Set(q.country.otherCities);
      for (const d of distractors) {
        expect(
          otherCitiesSet.has(d),
          `Distractor "${d}" is not in ${q.country.name}'s otherCities`,
        ).toBe(true);
      }
    }
  });

  it('no distractor equals any other country\'s capital (unless it also happens to be one of this country\'s cities)', () => {
    for (let i = 0; i < 30; i++) {
      const q = generateQuestion('countries', i % 30);
      if (q.subject !== 'countries') throw new Error('Expected countries subject');
      const distractors = q.options.filter(o => o !== q.correctAnswer);
      // Every distractor must belong to this country's own otherCities list.
      for (const d of distractors) {
        expect(q.country.otherCities).toContain(d);
      }
    }
  });
});

describe('generateQuestion (flags)', () => {
  it('returns a question with exactly 4 options', () => {
    const q = generateQuestion('flags', 0);
    expect(q.options).toHaveLength(4);
  });

  it('includes the correct country name in the options', () => {
    const q = generateQuestion('flags', 0);
    expect(q.options).toContain(q.correctAnswer);
  });

  it('discriminator is "flags" with a flag field', () => {
    const q = generateQuestion('flags', 0);
    expect(q.subject).toBe('flags');
    if (q.subject === 'flags') {
      expect(q.flag).toBeDefined();
    }
  });

  it('correct answer matches the question flag\'s country name', () => {
    const q = generateQuestion('flags', 0);
    if (q.subject !== 'flags') throw new Error('Expected flags subject');
    expect(q.correctAnswer).toBe(q.flag.name);
  });

  it('all 4 options are unique', () => {
    for (let i = 0; i < 20; i++) {
      const q = generateQuestion('flags', 0);
      const unique = new Set(q.options);
      expect(unique.size, `Duplicate options found: ${q.options}`).toBe(4);
    }
  });

  it('question flag matches the expected tier for the given score', () => {
    for (const score of [0, 5, 10, 15, 20, 25, 30]) {
      const q = generateQuestion('flags', score);
      if (q.subject !== 'flags') throw new Error('Expected flags subject');
      expect(q.flag.tier, `score ${score}`).toBe(getTierForScore(score));
    }
  });

  it('distractors come from the same tier as the question flag', () => {
    for (let i = 0; i < 30; i++) {
      const q = generateQuestion('flags', i % 30); // exercise all tiers
      if (q.subject !== 'flags') throw new Error('Expected flags subject');
      const tierNames = new Set(
        flags.filter(f => f.tier === q.flag.tier).map(f => f.name),
      );
      const distractors = q.options.filter(o => o !== q.correctAnswer);
      for (const d of distractors) {
        expect(tierNames.has(d), `Distractor "${d}" not in tier ${q.flag.tier}`).toBe(true);
      }
    }
  });
});

describe('getQuestionKey', () => {
  it('returns brand name for car questions', () => {
    const q = generateQuestion('cars', 0);
    if (q.subject !== 'cars') throw new Error('Expected cars subject');
    expect(getQuestionKey(q)).toBe(q.brand.name);
  });

  it('returns country name for country questions', () => {
    const q = generateQuestion('countries', 0);
    if (q.subject !== 'countries') throw new Error('Expected countries subject');
    expect(getQuestionKey(q)).toBe(q.country.name);
  });

  it('returns flag country name for flag questions', () => {
    const q = generateQuestion('flags', 0);
    if (q.subject !== 'flags') throw new Error('Expected flags subject');
    expect(getQuestionKey(q)).toBe(q.flag.name);
  });
});

describe('generateQuestion with excludeKeys', () => {
  it('never picks an excluded car brand when other tier brands are available', () => {
    const tier1Brands = carBrands.filter(b => b.tier === 1).map(b => b.name);
    // Exclude all but two brands; we should always get one of those two.
    const allowedBrands = tier1Brands.slice(0, 2);
    const excluded = tier1Brands.slice(2);
    for (let i = 0; i < 30; i++) {
      const q = generateQuestion('cars', 0, excluded);
      if (q.subject !== 'cars') throw new Error('Expected cars subject');
      expect(allowedBrands).toContain(q.brand.name);
    }
  });

  it('never picks an excluded country when other tier countries are available', () => {
    const tier1Countries = countries.filter(c => c.tier === 1).map(c => c.name);
    const allowedCountries = tier1Countries.slice(0, 2);
    const excluded = tier1Countries.slice(2);
    for (let i = 0; i < 30; i++) {
      const q = generateQuestion('countries', 0, excluded);
      if (q.subject !== 'countries') throw new Error('Expected countries subject');
      expect(allowedCountries).toContain(q.country.name);
    }
  });

  it('falls back to full tier when every brand in the tier is excluded', () => {
    const tier1Brands = carBrands.filter(b => b.tier === 1).map(b => b.name);
    // Pathological case: exclude the whole tier. Should still return a question.
    const q = generateQuestion('cars', 0, tier1Brands);
    if (q.subject !== 'cars') throw new Error('Expected cars subject');
    expect(tier1Brands).toContain(q.brand.name);
  });

  it('falls back to full tier when every country in the tier is excluded', () => {
    const tier1Countries = countries.filter(c => c.tier === 1).map(c => c.name);
    const q = generateQuestion('countries', 0, tier1Countries);
    if (q.subject !== 'countries') throw new Error('Expected countries subject');
    expect(tier1Countries).toContain(q.country.name);
  });

  it('avoids repeats across a sliding window of 5 recent car questions', () => {
    const recent: string[] = [];
    const seen: string[] = [];
    for (let i = 0; i < 12; i++) {
      const q = generateQuestion('cars', 0, recent);
      if (q.subject !== 'cars') throw new Error('Expected cars subject');
      // The current brand must not be in the recent window.
      expect(recent).not.toContain(q.brand.name);
      seen.push(q.brand.name);
      recent.push(q.brand.name);
      if (recent.length > 5) recent.shift();
    }
  });

  it('avoids repeats across a sliding window of 5 recent country questions', () => {
    const recent: string[] = [];
    for (let i = 0; i < 12; i++) {
      const q = generateQuestion('countries', 0, recent);
      if (q.subject !== 'countries') throw new Error('Expected countries subject');
      expect(recent).not.toContain(q.country.name);
      recent.push(q.country.name);
      if (recent.length > 5) recent.shift();
    }
  });

  it('never picks an excluded flag when other tier flags are available', () => {
    const tier1Flags = flags.filter(f => f.tier === 1).map(f => f.name);
    const allowed = tier1Flags.slice(0, 2);
    const excluded = tier1Flags.slice(2);
    for (let i = 0; i < 30; i++) {
      const q = generateQuestion('flags', 0, excluded);
      if (q.subject !== 'flags') throw new Error('Expected flags subject');
      expect(allowed).toContain(q.flag.name);
    }
  });

  it('falls back to full tier when every flag in the tier is excluded', () => {
    const tier1Flags = flags.filter(f => f.tier === 1).map(f => f.name);
    const q = generateQuestion('flags', 0, tier1Flags);
    if (q.subject !== 'flags') throw new Error('Expected flags subject');
    expect(tier1Flags).toContain(q.flag.name);
  });

  it('avoids repeats across a sliding window of 5 recent flag questions', () => {
    const recent: string[] = [];
    for (let i = 0; i < 12; i++) {
      const q = generateQuestion('flags', 0, recent);
      if (q.subject !== 'flags') throw new Error('Expected flags subject');
      expect(recent).not.toContain(q.flag.name);
      recent.push(q.flag.name);
      if (recent.length > 5) recent.shift();
    }
  });
});
