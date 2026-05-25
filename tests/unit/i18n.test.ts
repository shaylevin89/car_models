import { describe, it, expect } from 'vitest';
import { translations, translate } from '../../src/i18n/translations';

describe('translations', () => {
  it('returns Hebrew text for key when locale is he', () => {
    expect(translate('he', 'app.title')).toBe('טריוויית רכב');
  });

  it('returns English text for key when locale is en', () => {
    expect(translate('en', 'app.title')).toBe('Car Trivia');
  });

  it('returns the key itself for unknown keys', () => {
    expect(translate('en', 'nonexistent.key')).toBe('nonexistent.key');
  });

  it('has the same keys in both locales', () => {
    const heKeys = Object.keys(translations.he).sort();
    const enKeys = Object.keys(translations.en).sort();
    expect(heKeys).toEqual(enKeys);
  });

  it('Hebrew strings have punctuation at logical end, not logical start', () => {
    const punctuation = /^[!?.,:;]/;
    for (const [key, value] of Object.entries(translations.he)) {
      expect(
        punctuation.test(value),
        `Hebrew string "${key}" starts with punctuation: "${value}". Move punctuation to the end.`
      ).toBe(false);
    }
  });
});
