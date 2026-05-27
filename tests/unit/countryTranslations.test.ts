import { describe, it, expect } from 'vitest';
import {
  localizeCountryName,
  localizeCityName,
  countryNameTranslations,
  cityNameTranslations,
} from '../../src/i18n/countryTranslations';
import { countries } from '../../src/data/countryData';

describe('localizeCountryName', () => {
  it('returns the English name unchanged when locale is en', () => {
    expect(localizeCountryName('Israel', 'en')).toBe('Israel');
    expect(localizeCountryName('United States', 'en')).toBe('United States');
  });

  it('returns the Hebrew translation when locale is he', () => {
    expect(localizeCountryName('Israel', 'he')).toBe('ישראל');
    expect(localizeCountryName('France', 'he')).toBe('צרפת');
    expect(localizeCountryName('United States', 'he')).toBe('ארצות הברית');
  });

  it('falls back to the English string when no Hebrew translation exists', () => {
    expect(localizeCountryName('Atlantis', 'he')).toBe('Atlantis');
  });
});

describe('localizeCityName', () => {
  it('returns the English name unchanged when locale is en', () => {
    expect(localizeCityName('Jerusalem', 'en')).toBe('Jerusalem');
    expect(localizeCityName('Tel Aviv', 'en')).toBe('Tel Aviv');
  });

  it('returns the Hebrew translation when locale is he', () => {
    expect(localizeCityName('Jerusalem', 'he')).toBe('ירושלים');
    expect(localizeCityName('Paris', 'he')).toBe('פריז');
    expect(localizeCityName('New York', 'he')).toBe('ניו יורק');
  });

  it('falls back to the English string when no Hebrew translation exists', () => {
    expect(localizeCityName('Nowhere', 'he')).toBe('Nowhere');
  });
});

describe('translation coverage', () => {
  it('every country in countryData has a Hebrew translation', () => {
    for (const c of countries) {
      expect(
        countryNameTranslations[c.name]?.he,
        `Missing Hebrew translation for country "${c.name}"`,
      ).toBeDefined();
    }
  });

  it('every capital used by the trivia has a Hebrew translation', () => {
    for (const c of countries) {
      expect(
        cityNameTranslations[c.capital]?.he,
        `Missing Hebrew translation for capital "${c.capital}" (${c.name})`,
      ).toBeDefined();
    }
  });

  it('every distractor city used by the trivia has a Hebrew translation', () => {
    for (const c of countries) {
      for (const city of c.otherCities) {
        expect(
          cityNameTranslations[city]?.he,
          `Missing Hebrew translation for distractor "${city}" (${c.name})`,
        ).toBeDefined();
      }
    }
  });
});
