import { describe, it, expect } from 'vitest';
import { translations, translate } from '../../src/i18n/translations';

describe('translations', () => {
  it('returns Hebrew text for key when locale is he', () => {
    expect(translate('he', 'app.title')).toBe('מרכז הטריוויה');
  });

  it('returns English text for key when locale is en', () => {
    expect(translate('en', 'app.title')).toBe('Trivia Hub');
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

  it('has Hebrew home hub translations', () => {
    expect(translate('he', 'home.title')).toBe('מרכז הטריוויה');
    expect(translate('he', 'home.subject.cars.title')).toBe('טריוויית רכב');
    expect(translate('he', 'home.subject.countries.title')).toBe('מדינות ובירות');
  });

  it('has subject-specific start screen translations for both subjects', () => {
    expect(translate('he', 'start.title.cars')).toBe('טריוויית רכב');
    expect(translate('he', 'start.title.countries')).toBe('מדינות ובירות');
    expect(translate('en', 'start.title.cars')).toBe('Car Trivia');
    expect(translate('en', 'start.title.countries')).toBe('Countries & Capitals');
    expect(translate('he', 'start.subtitle.cars')).toBe('התאימו את יצרן הרכב לדגם שלו!');
    expect(translate('he', 'start.subtitle.countries')).toBe('התאימו את המדינה לבירה שלה!');
  });

  it('has subject-specific game question prompts', () => {
    expect(translate('he', 'game.question.cars')).toBe('איזה דגם שייך ליצרן הזה?');
    expect(translate('he', 'game.question.countries')).toBe('מהי הבירה של המדינה הזו?');
    expect(translate('en', 'game.question.cars')).toBe('Which model belongs to this brand?');
    expect(translate('en', 'game.question.countries')).toBe('What is the capital of this country?');
  });

  it('has subject-specific expert messages and share templates', () => {
    expect(translate('he', 'gameover.msg_expert.cars')).toBe('מומחה רכב!');
    expect(translate('he', 'gameover.msg_expert.countries')).toBe('מומחה גיאוגרפיה!');
    expect(translate('he', 'gameover.share_message.cars', { score: 5 })).toBe(
      'אני הצלחתי 5 דגמים.. כמה אתה מצליח?',
    );
    expect(translate('he', 'gameover.share_message.countries', { score: 7 })).toBe(
      'אני הצלחתי 7 בירות.. כמה אתה מצליח?',
    );
  });
});
