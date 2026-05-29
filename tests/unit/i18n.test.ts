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
      'בטריוויית רכב הצלחתי 5 דגמים! כמה אתה מצליח?',
    );
    expect(translate('he', 'gameover.share_message.countries', { score: 7 })).toBe(
      'בטריוויית מדינות ובירות הצלחתי 7 בירות! כמה אתה מצליח?',
    );
    expect(translate('en', 'gameover.share_message.cars', { score: 5 })).toBe(
      'I got 5 models in Car Trivia! How many can you get?',
    );
    expect(translate('en', 'gameover.share_message.countries', { score: 7 })).toBe(
      'I got 7 capitals in Countries & Capitals! How many can you get?',
    );
  });

  it('has the flags subject hub card translations', () => {
    expect(translate('he', 'home.subject.flags.title')).toBe('דגלים');
    expect(translate('he', 'home.subject.flags.description')).toBe('זהו את המדינה לפי הדגל שלה');
    expect(translate('en', 'home.subject.flags.title')).toBe('World Flags');
    expect(translate('en', 'home.subject.flags.description')).toBe('Identify the country from its flag');
  });

  it('has the flags subject start screen translations', () => {
    expect(translate('he', 'start.title.flags')).toBe('דגלי העולם');
    expect(translate('he', 'start.subtitle.flags')).toBe('זהו את המדינה לפי הדגל!');
    expect(translate('he', 'start.instruction1.flags')).toBe('תראו את הדגל ובחרו את המדינה הנכונה.');
    expect(translate('en', 'start.title.flags')).toBe('World Flags');
    expect(translate('en', 'start.subtitle.flags')).toBe('Identify the country from its flag!');
    expect(translate('en', 'start.instruction1.flags')).toBe('See the flag and choose the correct country.');
  });

  it('has the flags game question prompt in both locales', () => {
    expect(translate('he', 'game.question.flags')).toBe('של איזו מדינה הדגל הזה?');
    expect(translate('en', 'game.question.flags')).toBe('Which country does this flag belong to?');
  });

  it('has flags-specific expert message and share template', () => {
    expect(translate('he', 'gameover.msg_expert.flags')).toBe('מומחה דגלים!');
    expect(translate('en', 'gameover.msg_expert.flags')).toBe('Flag Expert!');
    expect(translate('he', 'gameover.share_message.flags', { score: 9 })).toBe(
      'בטריוויית דגלים זיהיתי 9 דגלים! כמה אתה מצליח?',
    );
    expect(translate('en', 'gameover.share_message.flags', { score: 9 })).toBe(
      'I identified 9 flags in World Flags! How many can you get?',
    );
  });
});
