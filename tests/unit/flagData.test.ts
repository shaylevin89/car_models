import { describe, it, expect } from 'vitest';
import { flags, getFlagUrl } from '../../src/data/flagData';
import { DifficultyTier } from '../../src/types/game';
import { countryNameTranslations } from '../../src/i18n/countryTranslations';

describe('flagData integrity', () => {
  it('should have at least 30 flags', () => {
    expect(flags.length).toBeGreaterThanOrEqual(30);
  });

  it('every flag should have a non-empty name and country code', () => {
    for (const f of flags) {
      expect(f.name.trim().length, `flag "${f.name}" has empty name`).toBeGreaterThan(0);
      expect(
        f.countryCode.trim().length,
        `flag "${f.name}" has empty countryCode`,
      ).toBeGreaterThan(0);
    }
  });

  it('country codes should be two lowercase letters (ISO 3166-1 alpha-2)', () => {
    for (const f of flags) {
      expect(
        /^[a-z]{2}$/.test(f.countryCode),
        `flag "${f.name}" has invalid countryCode "${f.countryCode}"`,
      ).toBe(true);
    }
  });

  it('every flag should have a valid difficulty tier', () => {
    const validTiers: DifficultyTier[] = [1, 2, 3];
    for (const f of flags) {
      expect(validTiers, `${f.name} has invalid tier ${f.tier}`).toContain(f.tier);
    }
  });

  it('should have no duplicate flag names', () => {
    const names = flags.map(f => f.name.toLowerCase());
    expect(new Set(names).size).toBe(names.length);
  });

  it('should have no duplicate country codes', () => {
    const codes = flags.map(f => f.countryCode);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('all three difficulty tiers should have enough entries for distractors', () => {
    const tiers: DifficultyTier[] = [1, 2, 3];
    for (const tier of tiers) {
      const tierFlags = flags.filter(f => f.tier === tier);
      // Need 4+ entries per tier so a question has 1 correct + 3 distractors.
      expect(
        tierFlags.length,
        `Tier ${tier} only has ${tierFlags.length} flags; need >= 4`,
      ).toBeGreaterThanOrEqual(4);
    }
  });

  it('every flag has a Hebrew translation for its country name', () => {
    for (const f of flags) {
      expect(
        countryNameTranslations[f.name]?.he,
        `Missing Hebrew translation for flag country "${f.name}"`,
      ).toBeDefined();
    }
  });
});

describe('getFlagUrl', () => {
  it('builds a flagcdn.com URL from a country code', () => {
    expect(getFlagUrl('il')).toBe('https://flagcdn.com/w320/il.png');
    expect(getFlagUrl('us')).toBe('https://flagcdn.com/w320/us.png');
  });
});
