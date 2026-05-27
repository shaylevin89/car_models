import { describe, it, expect } from 'vitest';
import { countries } from '../../src/data/countryData';
import { DifficultyTier } from '../../src/types/game';

describe('countryData integrity', () => {
  it('should have at least 30 countries', () => {
    expect(countries.length).toBeGreaterThanOrEqual(30);
  });

  it('every country should have a non-empty name and capital', () => {
    for (const c of countries) {
      expect(c.name.trim().length, `country "${c.name}" has empty name`).toBeGreaterThan(0);
      expect(c.capital.trim().length, `country "${c.name}" has empty capital`).toBeGreaterThan(0);
    }
  });

  it('every country should have a valid difficulty tier', () => {
    const validTiers: DifficultyTier[] = [1, 2, 3];
    for (const c of countries) {
      expect(validTiers, `${c.name} has invalid tier ${c.tier}`).toContain(c.tier);
    }
  });

  it('should have no duplicate country names', () => {
    const names = countries.map(c => c.name.toLowerCase());
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  it('capitals must be unique within a tier (so distractor selection works)', () => {
    const tiers: DifficultyTier[] = [1, 2, 3];
    for (const tier of tiers) {
      const tierCapitals = countries.filter(c => c.tier === tier).map(c => c.capital);
      const unique = new Set(tierCapitals);
      expect(
        unique.size,
        `Tier ${tier} has duplicate capitals: ${tierCapitals.join(', ')}`
      ).toBe(tierCapitals.length);
    }
  });

  it('every country must have at least 3 otherCities so they can be used as distractors', () => {
    for (const c of countries) {
      expect(
        c.otherCities.length,
        `Country "${c.name}" only has ${c.otherCities.length} otherCities; need >= 3`,
      ).toBeGreaterThanOrEqual(3);
    }
  });

  it('a country\'s capital must not also appear in its otherCities list', () => {
    for (const c of countries) {
      expect(
        c.otherCities,
        `Country "${c.name}" has its capital "${c.capital}" listed in otherCities`,
      ).not.toContain(c.capital);
    }
  });

  it('a country\'s otherCities must have no duplicates', () => {
    for (const c of countries) {
      const unique = new Set(c.otherCities);
      expect(
        unique.size,
        `Country "${c.name}" has duplicate otherCities: ${c.otherCities.join(', ')}`,
      ).toBe(c.otherCities.length);
    }
  });

  it('all three difficulty tiers should be represented with enough entries for distractors', () => {
    const tiers: DifficultyTier[] = [1, 2, 3];
    for (const tier of tiers) {
      const tierCountries = countries.filter(c => c.tier === tier);
      // We need at least 4 countries per tier so each question has 1 correct + 3 distractors.
      expect(
        tierCountries.length,
        `Tier ${tier} only has ${tierCountries.length} countries; need >= 4`
      ).toBeGreaterThanOrEqual(4);
    }
  });
});
