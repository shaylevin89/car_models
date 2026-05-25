import { describe, it, expect } from 'vitest';
import { carBrands, getLogoUrl, DifficultyTier } from '../../src/data/carData';

describe('carData integrity', () => {
  it('should have at least 30 brands', () => {
    expect(carBrands.length).toBeGreaterThanOrEqual(30);
  });

  it('every brand should have at least 3 models', () => {
    for (const brand of carBrands) {
      expect(brand.models.length, `${brand.name} has fewer than 3 models`).toBeGreaterThanOrEqual(3);
    }
  });

  it('every brand should have a non-empty name', () => {
    for (const brand of carBrands) {
      expect(brand.name.trim().length).toBeGreaterThan(0);
    }
  });

  it('every brand should have a valid difficulty tier', () => {
    const validTiers: DifficultyTier[] = [1, 2, 3];
    for (const brand of carBrands) {
      expect(validTiers, `${brand.name} has invalid tier ${brand.tier}`).toContain(brand.tier);
    }
  });

  it('should have no duplicate brand names', () => {
    const names = carBrands.map(b => b.name.toLowerCase());
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  it('should have no duplicate models within a brand', () => {
    for (const brand of carBrands) {
      const models = brand.models.map(m => m.toLowerCase());
      const uniqueModels = new Set(models);
      expect(uniqueModels.size, `${brand.name} has duplicate models`).toBe(models.length);
    }
  });

  it('model names must be globally unique across all brands', () => {
    const seen = new Map<string, string>();
    for (const brand of carBrands) {
      for (const model of brand.models) {
        const key = model.toLowerCase();
        expect(
          seen.has(key),
          `Model "${model}" appears in both "${seen.get(key)}" and "${brand.name}"`
        ).toBe(false);
        seen.set(key, brand.name);
      }
    }
  });

  it('every brand should have a non-empty logoSlug', () => {
    for (const brand of carBrands) {
      expect(typeof brand.logoSlug).toBe('string');
      expect(brand.logoSlug.length, `${brand.name} has empty logoSlug`).toBeGreaterThan(0);
    }
  });

  it('all three difficulty tiers should be represented', () => {
    const tiers = new Set(carBrands.map(b => b.tier));
    expect(tiers.has(1)).toBe(true);
    expect(tiers.has(2)).toBe(true);
    expect(tiers.has(3)).toBe(true);
  });

  it('getLogoUrl constructs a valid logo URL from logoSlug', () => {
    const url = getLogoUrl('toyota');
    expect(url).toBe('https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/toyota.png');
  });
});
