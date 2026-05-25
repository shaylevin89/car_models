# Feature Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use trycycle-executing to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add best-score localStorage persistence, Hebrew share-to-clipboard button, full Hebrew UI with hamburger language toggle, and tier-based cyclic question selection to the car trivia game.

**Architecture:** Introduce an i18n layer via a React context (`LanguageContext`) holding the current locale (`he`/`en`) and a `t()` translation helper, consumed by all components. Add a `bestScore` module using localStorage for persistence. Replace the score-threshold question generator with a deterministic tier-cycling algorithm (questions 1-10 from Tier 1, 11-20 from Tier 2, 21-30 from Tier 3, then repeat). The share button uses the Clipboard API (`navigator.clipboard.writeText`) with a fallback for older mobile browsers. A hamburger icon in a persistent top bar toggles the language. Hebrew is the default language; the UI direction flips to RTL when Hebrew is active.

**Tech Stack:** React 18, TypeScript, MUI 5 (existing), Clipboard API, localStorage

**Key design decisions and rationale:**

1. **i18n approach: Context + dictionary object vs. library (react-i18next).** A lightweight context with a single `translations.ts` dictionary is chosen because the app has ~30 translatable strings across 6 components. A full i18n library would add bundle weight and configuration complexity for no benefit. The `t(key)` helper returns the string for the current locale. All hardcoded English strings in components are replaced with `t()` calls.

2. **Hebrew as default language.** The user explicitly requested "make all the text in hebrew." The default locale is `'he'`. The language preference is persisted in localStorage under key `'car-trivia-lang'` so returning users keep their choice.

3. **RTL handling.** When locale is `'he'`, the root `<Box>` in `App.tsx` sets `dir="rtl"`. MUI's `CssBaseline` + the `dir` attribute handle layout mirroring. The existing inline `dir="rtl"` blocks in `StartScreen` and `GameOverScreen` are removed since the whole app is RTL by default. When toggled to English, `dir="ltr"` is set.

4. **Hamburger language toggle placement.** A persistent `AppBar` with a hamburger `IconButton` (MUI `MenuIcon`) is placed at the top of all screens. Clicking it opens a small `Menu` with two items: "English" and "Hebrew" (displayed in their native scripts: "English" / "עברית"). This is a minimal, Material Design-compliant approach. The AppBar also shows the game title.

5. **Tier-based cycling algorithm.** The user wants: "the 10th first questions will be from first tier and then next 10th from second tier etc and come back to first tier." This means a deterministic cycle: questions 0-9 (score 0-9) draw exclusively from Tier 1, questions 10-19 (score 10-19) from Tier 2, questions 20-29 from Tier 3, then questions 30-39 from Tier 1 again, and so on. The function `getTierForScore(score)` computes: `const cycle = Math.floor(score / 10) % 3; return (cycle + 1) as DifficultyTier;`. The existing `getAvailableBrands` is replaced by `getBrandsForScore` which returns only brands of the single target tier. Distractors are still drawn from the same tier to keep questions fair and not leak answers through obviously out-of-tier model names.

6. **Best score localStorage.** A utility module `src/utils/bestScore.ts` exports `getBestScore(): number` and `setBestScoreIfHigher(score: number): number`. The key is `'car-trivia-best-score'`. The best score is read on app mount and displayed on the StartScreen and GameOverScreen. On game over, the current score is compared with the stored best and updated if higher. A "New Best!" indicator appears when the current score beats the record.

7. **Share button.** On the GameOverScreen, a "Share" button appears. When clicked, it copies the exact Hebrew text `אני הצלחתי X דגמים.. כמה אתה מצליח?` to the clipboard (where X is the score). Uses `navigator.clipboard.writeText()`. A brief snackbar/tooltip confirms "Copied!" / "הועתק!". For mobile compatibility, `navigator.clipboard.writeText` is the primary API (supported on all modern mobile browsers when served over HTTPS, which GitHub Pages provides). No legacy `document.execCommand` fallback is needed since the target audience uses modern browsers and the app is HTTPS-only.

8. **Test impact.** The `getAvailableBrands` tests must be rewritten for `getBrandsForScore` with the new cycling logic. E2E tests referencing English text like "Car Trivia", "Match the car brand to its model!", "Game Over", "Score:" must be updated for the Hebrew default. New unit tests cover `bestScore` utils, `getTierForScore`, and translation lookups. New E2E tests cover the share button clipboard, language toggle, best score persistence across reloads, and tier cycling verification.

---

### Task 1: Create the i18n system (translations + context)

**Files:**
- Create: `src/i18n/translations.ts`
- Create: `src/i18n/LanguageContext.tsx`
- Create: `src/i18n/index.ts`
- Test: `tests/unit/i18n.test.ts`

- [ ] **Step 1: Write failing test for translation lookup**

```typescript
// tests/unit/i18n.test.ts
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/develeap/private_gits/car_models/.worktrees/feature-enhancements && npx vitest run tests/unit/i18n.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement translations and context**

```typescript
// src/i18n/translations.ts
export type Locale = 'he' | 'en';

export const translations: Record<Locale, Record<string, string>> = {
  he: {
    'app.title': 'טריוויית רכב',
    'start.subtitle': '!התאימו את יצרן הרכב לדגם שלו',
    'start.instruction1': '.תראו את הלוגו של היצרן ובחרו את הדגם הנכון',
    'start.instruction2': '!תשובה נכונה = נקודה. תשובה שגויה או שנגמר הזמן = סוף המשחק',
    'start.timer_note': '.יש לכם 10 שניות לכל שאלה',
    'start.button': 'התחל משחק',
    'start.best_score': 'שיא: {score}',
    'game.question': '?איזה דגם שייך ליצרן הזה',
    'game.score': 'ניקוד: {score}',
    'game.time': 'זמן',
    'gameover.title': 'המשחק נגמר',
    'gameover.points_one': 'נקודה',
    'gameover.points_other': 'נקודות',
    'gameover.new_best': '!שיא חדש',
    'gameover.best_score': 'שיא: {score}',
    'gameover.play_again': 'שחק שוב',
    'gameover.share': 'שתף',
    'gameover.copied': '!הועתק',
    'gameover.msg_0': '!בפעם הבאה יהיה יותר טוב',
    'gameover.msg_low': '!התחלה טובה',
    'gameover.msg_mid': '!כל הכבוד',
    'gameover.msg_high': '!מדהים',
    'gameover.msg_expert': '!מומחה רכב',
    'lang.hebrew': 'עברית',
    'lang.english': 'English',
  },
  en: {
    'app.title': 'Car Trivia',
    'start.subtitle': 'Match the car brand to its model!',
    'start.instruction1': 'See the manufacturer logo and choose the correct model.',
    'start.instruction2': 'Correct answer = point. Wrong answer or timeout = game over!',
    'start.timer_note': 'You have 10 seconds per question.',
    'start.button': 'Start Game',
    'start.best_score': 'Best: {score}',
    'game.question': 'Which model belongs to this brand?',
    'game.score': 'Score: {score}',
    'game.time': 'Time',
    'gameover.title': 'Game Over',
    'gameover.points_one': 'point',
    'gameover.points_other': 'points',
    'gameover.new_best': 'New Best!',
    'gameover.best_score': 'Best: {score}',
    'gameover.play_again': 'Play Again',
    'gameover.share': 'Share',
    'gameover.copied': 'Copied!',
    'gameover.msg_0': 'Better luck next time!',
    'gameover.msg_low': 'Nice try!',
    'gameover.msg_mid': 'Great job!',
    'gameover.msg_high': 'Amazing!',
    'gameover.msg_expert': 'Car Expert!',
    'lang.hebrew': 'עברית',
    'lang.english': 'English',
  },
};

/**
 * Look up a translation key for a given locale.
 * Supports simple {param} interpolation via optional params argument.
 * Returns the key itself if not found.
 */
export function translate(locale: Locale, key: string, params?: Record<string, string | number>): string {
  const value = translations[locale]?.[key] ?? key;
  if (!params) return value;
  return Object.entries(params).reduce(
    (str, [k, v]) => str.replace(`{${k}}`, String(v)),
    value,
  );
}
```

```typescript
// src/i18n/LanguageContext.tsx
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { Locale, translate } from './translations';

const STORAGE_KEY = 'car-trivia-lang';

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function getInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'he';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'he') return stored;
  return 'he'; // Hebrew default
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(locale, key, params),
    [locale],
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
```

```typescript
// src/i18n/index.ts
export { LanguageProvider, useLanguage } from './LanguageContext';
export { translate, translations } from './translations';
export type { Locale } from './translations';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/develeap/private_gits/car_models/.worktrees/feature-enhancements && npx vitest run tests/unit/i18n.test.ts`
Expected: PASS

- [ ] **Step 5: Refactor and verify**

Verify the translations dictionary is complete and matches between locales. Ensure `translate` handles the `{param}` interpolation correctly.

Run: `cd /Users/develeap/private_gits/car_models/.worktrees/feature-enhancements && npx vitest run`
Expected: All existing tests still PASS (new module has no side effects on existing code)

- [ ] **Step 6: Commit**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/feature-enhancements
git add src/i18n/ tests/unit/i18n.test.ts
git commit -m "feat: add i18n system with Hebrew/English translations and React context"
```

---

### Task 2: Create best-score localStorage utility

**Files:**
- Create: `src/utils/bestScore.ts`
- Test: `tests/unit/bestScore.test.ts`

- [ ] **Step 1: Write failing test for best-score utility**

```typescript
// tests/unit/bestScore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { getBestScore, setBestScoreIfHigher } from '../../src/utils/bestScore';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('bestScore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns 0 when no best score is stored', () => {
    expect(getBestScore()).toBe(0);
  });

  it('returns the stored best score', () => {
    localStorage.setItem('car-trivia-best-score', '15');
    expect(getBestScore()).toBe(15);
  });

  it('returns 0 for invalid stored value', () => {
    localStorage.setItem('car-trivia-best-score', 'abc');
    expect(getBestScore()).toBe(0);
  });

  it('sets best score when current score is higher', () => {
    const result = setBestScoreIfHigher(10);
    expect(result).toBe(10);
    expect(getBestScore()).toBe(10);
  });

  it('does not overwrite when current score is lower', () => {
    localStorage.setItem('car-trivia-best-score', '20');
    const result = setBestScoreIfHigher(5);
    expect(result).toBe(20);
    expect(getBestScore()).toBe(20);
  });

  it('updates when current score is equal (returns same value)', () => {
    localStorage.setItem('car-trivia-best-score', '10');
    const result = setBestScoreIfHigher(10);
    expect(result).toBe(10);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd /Users/develeap/private_gits/car_models/.worktrees/feature-enhancements && npx vitest run tests/unit/bestScore.test.ts`
Expected: FAIL — module not found

- [ ] **Step 3: Implement best-score utility**

```typescript
// src/utils/bestScore.ts
const STORAGE_KEY = 'car-trivia-best-score';

export function getBestScore(): number {
  if (typeof window === 'undefined') return 0;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === null) return 0;
  const parsed = parseInt(stored, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/**
 * Compares score against stored best.
 * If score is higher, persists it.
 * Returns the (possibly updated) best score.
 */
export function setBestScoreIfHigher(score: number): number {
  const current = getBestScore();
  if (score > current) {
    localStorage.setItem(STORAGE_KEY, String(score));
    return score;
  }
  return current;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd /Users/develeap/private_gits/car_models/.worktrees/feature-enhancements && npx vitest run tests/unit/bestScore.test.ts`
Expected: PASS

- [ ] **Step 5: Refactor and verify**

Run: `cd /Users/develeap/private_gits/car_models/.worktrees/feature-enhancements && npx vitest run`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/feature-enhancements
git add src/utils/bestScore.ts tests/unit/bestScore.test.ts
git commit -m "feat: add best-score localStorage utility"
```

---

### Task 3: Replace score-threshold question generator with tier-cycling logic

**Files:**
- Modify: `src/utils/questionGenerator.ts`
- Modify: `tests/unit/questionGenerator.test.ts`

- [ ] **Step 1: Rewrite tests for tier-cycling logic**

The existing `getAvailableBrands` tests must be replaced with `getBrandsForScore` tests that verify the cycling pattern. The existing `generateQuestion` tests remain valid.

```typescript
// tests/unit/questionGenerator.test.ts — full replacement
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd /Users/develeap/private_gits/car_models/.worktrees/feature-enhancements && npx vitest run tests/unit/questionGenerator.test.ts`
Expected: FAIL — `getTierForScore` and `getBrandsForScore` not exported

- [ ] **Step 3: Implement tier-cycling question generator**

```typescript
// src/utils/questionGenerator.ts — full replacement
import { CarBrand, DifficultyTier, Question } from '../types/game';
import { carBrands } from '../data/carData';

/**
 * Determines the tier for a given score using cyclic assignment:
 * Scores 0-9: Tier 1, 10-19: Tier 2, 20-29: Tier 3, 30-39: Tier 1, ...
 */
export function getTierForScore(score: number): DifficultyTier {
  const cycle = Math.floor(score / 10) % 3;
  return (cycle + 1) as DifficultyTier;
}

/**
 * Returns brands from the tier that matches the given score's cycle position.
 */
export function getBrandsForScore(score: number): CarBrand[] {
  const tier = getTierForScore(score);
  return carBrands.filter(b => b.tier === tier);
}

/**
 * Shuffles an array using Fisher-Yates. Returns a new array.
 */
function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates a trivia question for the given score level.
 * Picks a random brand from the current tier, selects a correct model,
 * and fills 3 distractor models from other brands in the same tier.
 */
export function generateQuestion(score: number): Question {
  const available = getBrandsForScore(score);

  // Pick a random brand
  const brandIndex = Math.floor(Math.random() * available.length);
  const brand = available[brandIndex];

  // Pick a correct model from this brand
  const correctModel = brand.models[Math.floor(Math.random() * brand.models.length)];

  // Collect distractor models from other brands in the same tier
  const otherBrands = available.filter(b => b.name !== brand.name);
  const allOtherModels = otherBrands.flatMap(b => b.models);
  const shuffledOtherModels = shuffle(allOtherModels);

  // Pick 3 unique distractors
  const distractors: string[] = [];
  const used = new Set<string>([correctModel]);
  for (const model of shuffledOtherModels) {
    if (!used.has(model) && distractors.length < 3) {
      distractors.push(model);
      used.add(model);
    }
  }

  // Combine and shuffle options
  const options = shuffle([correctModel, ...distractors]);

  return { brand, correctModel, options };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd /Users/develeap/private_gits/car_models/.worktrees/feature-enhancements && npx vitest run tests/unit/questionGenerator.test.ts`
Expected: PASS

- [ ] **Step 5: Refactor and verify**

Check that the old `getAvailableBrands` export is fully removed. Verify no other file imports `getAvailableBrands` (only the test file did). Run the full suite.

Run: `cd /Users/develeap/private_gits/car_models/.worktrees/feature-enhancements && npx vitest run`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/feature-enhancements
git add src/utils/questionGenerator.ts tests/unit/questionGenerator.test.ts
git commit -m "feat: replace score-threshold with tier-cycling question selection"
```

---

### Task 4: Wire LanguageProvider into App and add AppBar with hamburger language toggle

**Files:**
- Modify: `src/App.tsx`
- Create: `src/components/LanguageToggleBar.tsx`

- [ ] **Step 1: Write failing test — skip for this task (UI wiring)**

This task is UI wiring that will be verified via the full E2E suite in Task 8. No isolated unit test is practical for the AppBar + LanguageProvider integration. Proceed directly to implementation.

- [ ] **Step 2: Implement LanguageToggleBar component**

```typescript
// src/components/LanguageToggleBar.tsx
import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useLanguage } from '../i18n';

const LanguageToggleBar: React.FC = () => {
  const { locale, setLocale, t } = useLanguage();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSelect = (newLocale: 'he' | 'en') => {
    setLocale(newLocale);
    handleClose();
  };

  return (
    <AppBar position="static" color="transparent" elevation={0} sx={{ background: 'transparent' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
          {t('app.title')}
        </Typography>
        <IconButton
          edge="end"
          color="inherit"
          aria-label="language menu"
          onClick={handleOpen}
          data-testid="language-menu-button"
        >
          <MenuIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem
            onClick={() => handleSelect('he')}
            selected={locale === 'he'}
            data-testid="lang-option-he"
          >
            {t('lang.hebrew')}
          </MenuItem>
          <MenuItem
            onClick={() => handleSelect('en')}
            selected={locale === 'en'}
            data-testid="lang-option-en"
          >
            {t('lang.english')}
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default LanguageToggleBar;
```

- [ ] **Step 3: Update App.tsx to wrap with LanguageProvider, add LanguageToggleBar, set dir attribute**

```typescript
// src/App.tsx — full replacement
import React from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import theme from './theme';
import { LanguageProvider, useLanguage } from './i18n';
import LanguageToggleBar from './components/LanguageToggleBar';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import GameOverScreen from './components/GameOverScreen';
import { useGameState } from './hooks/useGameState';
import './App.css';

const AppContent: React.FC = () => {
  const { state, startGame, handleAnswer, resetGame } = useGameState();
  const { locale } = useLanguage();

  return (
    <Box
      dir={locale === 'he' ? 'rtl' : 'ltr'}
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      }}
    >
      <LanguageToggleBar />
      {state.phase === 'start' && <StartScreen onStart={startGame} />}
      {state.phase === 'playing' && (
        <GameScreen state={state} onAnswer={handleAnswer} />
      )}
      {state.phase === 'gameover' && (
        <GameOverScreen score={state.score} onPlayAgain={resetGame} />
      )}
    </Box>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
```

- [ ] **Step 4: Verify build compiles**

Run: `cd /Users/develeap/private_gits/car_models/.worktrees/feature-enhancements && npx tsc -b --noEmit`
Expected: No errors

- [ ] **Step 5: Run full unit test suite**

Run: `cd /Users/develeap/private_gits/car_models/.worktrees/feature-enhancements && npx vitest run`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/feature-enhancements
git add src/App.tsx src/components/LanguageToggleBar.tsx
git commit -m "feat: add LanguageProvider wrapper and hamburger language toggle AppBar"
```

---

### Task 5: Convert all components to use i18n translations (Hebrew default)

**Files:**
- Modify: `src/components/StartScreen.tsx`
- Modify: `src/components/GameOverScreen.tsx`
- Modify: `src/components/GameScreen.tsx`
- Modify: `src/components/QuestionCard.tsx`
- Modify: `src/components/ScoreDisplay.tsx`
- Modify: `src/components/TimerBar.tsx`

- [ ] **Step 1: No isolated failing test — this is a string replacement task**

The correctness will be validated by E2E tests in Task 8. The existing unit tests do not reference UI strings. Proceed to implementation.

- [ ] **Step 2: Update StartScreen.tsx**

Replace all hardcoded English/Hebrew strings with `t()` calls. Remove the inline `dir="rtl"` block (App.tsx now handles it). Add best-score display.

```typescript
// src/components/StartScreen.tsx — full replacement
import React from 'react';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { useLanguage } from '../i18n';
import { getBestScore } from '../utils/bestScore';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const { t } = useLanguage();
  const bestScore = getBestScore();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="calc(100vh - 64px)"
      p={3}
    >
      <Card
        sx={{
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
          p: 3,
        }}
      >
        <CardContent>
          <DirectionsCarIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="h1" gutterBottom color="primary">
            {t('app.title')}
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t('start.subtitle')}
          </Typography>
          <Box sx={{ mt: 2, mb: 3 }}>
            <Typography variant="body1" color="text.secondary">
              {t('start.instruction1')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('start.instruction2')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t('start.timer_note')}
            </Typography>
          </Box>
          {bestScore > 0 && (
            <Typography
              variant="h6"
              color="secondary"
              sx={{ mb: 2 }}
              data-testid="best-score-display"
            >
              {t('start.best_score', { score: bestScore })}
            </Typography>
          )}
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={onStart}
            sx={{ mt: 2, px: 6, py: 1.5, fontSize: '1.3rem' }}
            data-testid="start-button"
          >
            {t('start.button')}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StartScreen;
```

- [ ] **Step 3: Update GameOverScreen.tsx**

Add share button, best score display, and i18n. The share button uses `navigator.clipboard.writeText`.

```typescript
// src/components/GameOverScreen.tsx — full replacement
import React, { useState, useEffect } from 'react';
import { Box, Button, Card, CardContent, Typography, Snackbar } from '@mui/material';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ShareIcon from '@mui/icons-material/Share';
import { useLanguage } from '../i18n';
import { getBestScore, setBestScoreIfHigher } from '../utils/bestScore';

interface GameOverScreenProps {
  score: number;
  onPlayAgain: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onPlayAgain }) => {
  const { t } = useLanguage();
  const [showCopied, setShowCopied] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [isNewBest, setIsNewBest] = useState(false);

  useEffect(() => {
    const previousBest = getBestScore();
    const updatedBest = setBestScoreIfHigher(score);
    setBestScore(updatedBest);
    setIsNewBest(score > previousBest && score > 0);
  }, [score]);

  const getMessage = (): string => {
    if (score === 0) return t('gameover.msg_0');
    if (score < 5) return t('gameover.msg_low');
    if (score < 10) return t('gameover.msg_mid');
    if (score < 20) return t('gameover.msg_high');
    return t('gameover.msg_expert');
  };

  const handleShare = async () => {
    const message = `אני הצלחתי ${score} דגמים.. כמה אתה מצליח?`;
    try {
      await navigator.clipboard.writeText(message);
      setShowCopied(true);
    } catch {
      // Fallback: some mobile browsers block clipboard without user gesture focus
      // The button click should satisfy this requirement on modern browsers
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="calc(100vh - 64px)"
      p={3}
    >
      <Card sx={{ maxWidth: 500, width: '100%', textAlign: 'center', p: 3 }}>
        <CardContent>
          {score >= 5 ? (
            <EmojiEventsIcon sx={{ fontSize: 80, color: 'secondary.main', mb: 2 }} />
          ) : (
            <SentimentVeryDissatisfiedIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          )}
          <Typography variant="h4" color="error" gutterBottom>
            {t('gameover.title')}
          </Typography>
          <Typography variant="h1" color="primary" gutterBottom data-testid="final-score">
            {score}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {score === 1 ? t('gameover.points_one') : t('gameover.points_other')}
          </Typography>
          {isNewBest && (
            <Typography
              variant="h5"
              color="secondary"
              sx={{ mt: 1, fontWeight: 700 }}
              data-testid="new-best-indicator"
            >
              {t('gameover.new_best')}
            </Typography>
          )}
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }} data-testid="best-score-gameover">
            {t('gameover.best_score', { score: bestScore })}
          </Typography>
          <Typography variant="h4" sx={{ mt: 2 }} color="text.primary">
            {getMessage()}
          </Typography>
          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={onPlayAgain}
              sx={{ px: 6, py: 1.5, fontSize: '1.3rem' }}
              data-testid="play-again-button"
            >
              {t('gameover.play_again')}
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              onClick={handleShare}
              startIcon={<ShareIcon />}
              sx={{ px: 4, py: 1.5, fontSize: '1.1rem' }}
              data-testid="share-button"
            >
              {t('gameover.share')}
            </Button>
          </Box>
        </CardContent>
      </Card>
      <Snackbar
        open={showCopied}
        autoHideDuration={2000}
        onClose={() => setShowCopied(false)}
        message={t('gameover.copied')}
        data-testid="copied-snackbar"
      />
    </Box>
  );
};

export default GameOverScreen;
```

- [ ] **Step 4: Update QuestionCard.tsx**

```typescript
// src/components/QuestionCard.tsx — the question text line changes
// Replace: <Typography variant="h6" color="text.secondary" gutterBottom>
//            Which model belongs to this brand?
//          </Typography>
// With:    <Typography variant="h6" color="text.secondary" gutterBottom>
//            {t('game.question')}
//          </Typography>
// Add: import { useLanguage } from '../i18n'; at top
// Add: const { t } = useLanguage(); inside component
```

Full replacement of QuestionCard.tsx:

```typescript
// src/components/QuestionCard.tsx
import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { CarBrand } from '../types/game';
import { getLogoUrl } from '../data/carData';
import { useLanguage } from '../i18n';

interface QuestionCardProps {
  brand: CarBrand;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ brand }) => {
  const { t } = useLanguage();
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    setLogoError(false);
  }, [brand.name]);

  return (
    <Card sx={{ textAlign: 'center', p: 2, mb: 3 }}>
      <CardContent>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {t('game.question')}
        </Typography>
        <Box
          sx={{
            width: 150,
            height: 150,
            mx: 'auto',
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {!logoError ? (
            <img
              src={getLogoUrl(brand.logoSlug)}
              alt={`${brand.name} logo`}
              onError={() => setLogoError(true)}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
              data-testid="brand-logo"
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
                borderRadius: 2,
              }}
            >
              <Typography variant="h4" color="primary">
                {brand.name}
              </Typography>
            </Box>
          )}
        </Box>
        <Typography variant="h2" color="primary" data-testid="brand-name">
          {brand.name}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default QuestionCard;
```

- [ ] **Step 5: Update ScoreDisplay.tsx**

```typescript
// src/components/ScoreDisplay.tsx — full replacement
import React from 'react';
import { Chip } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useLanguage } from '../i18n';

interface ScoreDisplayProps {
  score: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
  const { t } = useLanguage();

  return (
    <Chip
      icon={<EmojiEventsIcon />}
      label={t('game.score', { score })}
      color="secondary"
      variant="outlined"
      sx={{ fontSize: '1.1rem', py: 2.5, px: 1 }}
      data-testid="score-display"
    />
  );
};

export default ScoreDisplay;
```

- [ ] **Step 6: Update TimerBar.tsx**

```typescript
// src/components/TimerBar.tsx — full replacement
import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import { QUESTION_TIME_SECONDS } from '../hooks/useGameState';
import { useLanguage } from '../i18n';

interface TimerBarProps {
  timeRemaining: number;
}

const TimerBar: React.FC<TimerBarProps> = ({ timeRemaining }) => {
  const { t } = useLanguage();
  const progress = (timeRemaining / QUESTION_TIME_SECONDS) * 100;

  const getColor = (): 'primary' | 'warning' | 'error' => {
    if (timeRemaining <= 3) return 'error';
    if (timeRemaining <= 5) return 'warning';
    return 'primary';
  };

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
        <Typography variant="body2" color="text.secondary">
          {t('game.time')}
        </Typography>
        <Typography
          variant="h6"
          color={timeRemaining <= 3 ? 'error.main' : 'text.primary'}
          data-testid="timer-display"
        >
          {timeRemaining}s
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={progress}
        color={getColor()}
        sx={{
          height: 8,
          borderRadius: 4,
          '& .MuiLinearProgress-bar': {
            transition: 'transform 1s linear',
          },
        }}
        data-testid="timer-bar"
      />
    </Box>
  );
};

export default TimerBar;
```

- [ ] **Step 7: Verify build and unit tests**

Run: `cd /Users/develeap/private_gits/car_models/.worktrees/feature-enhancements && npx tsc -b --noEmit && npx vitest run`
Expected: Compilation succeeds, all unit tests PASS

- [ ] **Step 8: Commit**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/feature-enhancements
git add src/components/StartScreen.tsx src/components/GameOverScreen.tsx src/components/GameScreen.tsx src/components/QuestionCard.tsx src/components/ScoreDisplay.tsx src/components/TimerBar.tsx
git commit -m "feat: convert all UI to Hebrew default with i18n, add share button and best score"
```

---

### Task 6: Update useGameState reducer tests for any new actions (if needed)

**Files:**
- Review: `tests/unit/useGameState.test.ts`

- [ ] **Step 1: Verify existing reducer tests still pass unchanged**

The game reducer itself has no changes — best score is handled in components, not in the reducer. The reducer tests should pass as-is.

Run: `cd /Users/develeap/private_gits/car_models/.worktrees/feature-enhancements && npx vitest run tests/unit/useGameState.test.ts`
Expected: All PASS — no changes needed

- [ ] **Step 2: Commit (skip if no changes)**

No commit needed if tests pass without modification.

---

### Task 7: Update E2E tests for Hebrew default UI and new features

**Files:**
- Modify: `tests/e2e/game.spec.ts`

- [ ] **Step 1: Rewrite E2E tests for Hebrew default and new features**

The existing E2E tests reference English strings like "Car Trivia", "Match the car brand to its model!", "Score: 0", "Game Over". These must be updated for the Hebrew default. New tests are added for: share button, language toggle, best score persistence, and tier cycling.

```typescript
// tests/e2e/game.spec.ts — full replacement
import { test, expect } from '@playwright/test';
import { carBrands } from '../../src/data/carData';

test.describe('Car Trivia Game', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test for isolation
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('shows start screen with Hebrew text by default', async ({ page }) => {
    await expect(page.getByText('טריוויית רכב')).toBeVisible();
    await expect(page.getByTestId('start-button')).toBeVisible();
    await expect(page.getByText('התאימו את יצרן הרכב לדגם שלו')).toBeVisible();
  });

  test('starts game when clicking start button', async ({ page }) => {
    await page.getByTestId('start-button').click();

    await expect(page.getByTestId('score-display')).toBeVisible();
    await expect(page.getByTestId('timer-display')).toBeVisible();
    await expect(page.getByTestId('brand-name')).toBeVisible();

    const buttons = page.locator('[data-testid^="answer-option-"]');
    await expect(buttons).toHaveCount(4);
  });

  test('timer counts down from 10', async ({ page }) => {
    await page.getByTestId('start-button').click();

    await expect(page.getByTestId('timer-display')).toContainText('10s');

    await page.waitForTimeout(1500);
    const timerText = await page.getByTestId('timer-display').textContent();
    const seconds = parseInt(timerText!.replace('s', ''));
    expect(seconds).toBeLessThan(10);
  });

  test('correct answer increments score and loads next question', async ({ page }) => {
    await page.getByTestId('start-button').click();

    const brandName = await page.getByTestId('brand-name').textContent();
    expect(brandName).toBeTruthy();

    const optionTexts = await page.locator('[data-testid^="answer-option-"]').allTextContents();
    expect(optionTexts).toHaveLength(4);

    const brand = carBrands.find(b => b.name === brandName);
    expect(brand).toBeTruthy();

    const correctOption = optionTexts.find(opt => brand!.models.includes(opt));
    expect(correctOption).toBeTruthy();

    // Verify initial score contains 0
    const initialScoreText = await page.getByTestId('score-display').textContent();
    expect(initialScoreText).toContain('0');

    await page.getByTestId(`answer-option-${correctOption}`).click();

    await page.waitForTimeout(700);

    const newScoreText = await page.getByTestId('score-display').textContent();
    expect(newScoreText).toContain('1');

    await expect(page.getByTestId('brand-name')).toBeVisible();
  });

  test('game over screen shows after wrong answer', async ({ page }) => {
    await page.getByTestId('start-button').click();

    await expect(page.getByTestId('brand-name')).toBeVisible();

    const brandName = await page.getByTestId('brand-name').textContent();
    const brand = carBrands.find(b => b.name === brandName);
    expect(brand).toBeTruthy();

    const optionTexts = await page.locator('[data-testid^="answer-option-"]').allTextContents();
    const wrongOption = optionTexts.find(opt => !brand!.models.includes(opt));
    expect(wrongOption).toBeTruthy();

    await page.getByTestId(`answer-option-${wrongOption}`).click();

    await expect(page.getByTestId('play-again-button')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('final-score')).toBeVisible();
    await expect(page.getByText('המשחק נגמר')).toBeVisible();
    await expect(page.getByTestId('final-score')).toContainText('0');
  });

  test('game over on timeout', async ({ page }) => {
    await page.getByTestId('start-button').click();

    await expect(page.getByTestId('play-again-button')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('final-score')).toBeVisible();
    await expect(page.getByTestId('final-score')).toContainText('0');
  });

  test('play again restarts the game', async ({ page }) => {
    await page.getByTestId('start-button').click();

    await expect(page.getByTestId('play-again-button')).toBeVisible({ timeout: 15000 });

    await page.getByTestId('play-again-button').click();

    await expect(page.getByTestId('start-button')).toBeVisible();
  });

  test('share button copies Hebrew message to clipboard', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.getByTestId('start-button').click();
    await expect(page.getByTestId('brand-name')).toBeVisible();

    // Answer wrong to reach game over
    const brandName = await page.getByTestId('brand-name').textContent();
    const brand = carBrands.find(b => b.name === brandName);
    const optionTexts = await page.locator('[data-testid^="answer-option-"]').allTextContents();
    const wrongOption = optionTexts.find(opt => !brand!.models.includes(opt));
    await page.getByTestId(`answer-option-${wrongOption}`).click();

    await expect(page.getByTestId('share-button')).toBeVisible({ timeout: 5000 });

    // Click share
    await page.getByTestId('share-button').click();

    // Verify clipboard content
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardText).toBe('אני הצלחתי 0 דגמים.. כמה אתה מצליח?');
  });

  test('language toggle switches between Hebrew and English', async ({ page }) => {
    // Default should be Hebrew
    await expect(page.getByText('טריוויית רכב')).toBeVisible();

    // Open language menu
    await page.getByTestId('language-menu-button').click();
    await page.getByTestId('lang-option-en').click();

    // Should now show English
    await expect(page.getByText('Car Trivia')).toBeVisible();
    await expect(page.getByText('Match the car brand to its model!')).toBeVisible();

    // Toggle back to Hebrew
    await page.getByTestId('language-menu-button').click();
    await page.getByTestId('lang-option-he').click();

    await expect(page.getByText('טריוויית רכב')).toBeVisible();
  });

  test('best score persists across page reloads', async ({ page }) => {
    await page.getByTestId('start-button').click();

    // Answer one question correctly
    const brandName = await page.getByTestId('brand-name').textContent();
    const brand = carBrands.find(b => b.name === brandName);
    const optionTexts = await page.locator('[data-testid^="answer-option-"]').allTextContents();
    const correctOption = optionTexts.find(opt => brand!.models.includes(opt));
    await page.getByTestId(`answer-option-${correctOption}`).click();

    await page.waitForTimeout(700);

    // Now answer wrong to end game
    const brandName2 = await page.getByTestId('brand-name').textContent();
    const brand2 = carBrands.find(b => b.name === brandName2);
    const optionTexts2 = await page.locator('[data-testid^="answer-option-"]').allTextContents();
    const wrongOption = optionTexts2.find(opt => !brand2!.models.includes(opt));
    await page.getByTestId(`answer-option-${wrongOption}`).click();

    await expect(page.getByTestId('play-again-button')).toBeVisible({ timeout: 5000 });

    // Best score should show on game over screen
    await expect(page.getByTestId('best-score-gameover')).toBeVisible();

    // Go back to start
    await page.getByTestId('play-again-button').click();
    await expect(page.getByTestId('start-button')).toBeVisible();

    // Best score should show on start screen
    await expect(page.getByTestId('best-score-display')).toBeVisible();

    // Reload and verify persistence
    await page.reload();
    await expect(page.getByTestId('best-score-display')).toBeVisible();
  });

  test('tier cycling: first 10 questions from tier 1, question 11 from tier 2', async ({ page }) => {
    await page.getByTestId('start-button').click();

    const tier1BrandNames = new Set(carBrands.filter(b => b.tier === 1).map(b => b.name));
    const tier2BrandNames = new Set(carBrands.filter(b => b.tier === 2).map(b => b.name));

    // Answer 10 questions correctly — all should be tier 1 brands
    for (let i = 0; i < 10; i++) {
      await expect(page.getByTestId('brand-name')).toBeVisible({ timeout: 3000 });
      const brandName = await page.getByTestId('brand-name').textContent();
      expect(tier1BrandNames.has(brandName!), `Question ${i + 1}: "${brandName}" should be tier 1`).toBe(true);

      const brand = carBrands.find(b => b.name === brandName);
      const options = await page.locator('[data-testid^="answer-option-"]').allTextContents();
      const correct = options.find(opt => brand!.models.includes(opt));
      await page.getByTestId(`answer-option-${correct}`).click();
      await page.waitForTimeout(600);
    }

    // Question 11 should be from tier 2
    await expect(page.getByTestId('brand-name')).toBeVisible({ timeout: 3000 });
    const brandName11 = await page.getByTestId('brand-name').textContent();
    expect(tier2BrandNames.has(brandName11!), `Question 11: "${brandName11}" should be tier 2`).toBe(true);
  });

  test('takes screenshot of start screen (Hebrew)', async ({ page }) => {
    await page.screenshot({ path: 'test-results/start-screen-hebrew.png', fullPage: true });
  });

  test('takes screenshot of game screen', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.getByTestId('brand-name')).toBeVisible();
    await page.screenshot({ path: 'test-results/game-screen.png', fullPage: true });
  });

  test('takes screenshot of game over screen with share button', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.getByTestId('play-again-button')).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'test-results/game-over-screen.png', fullPage: true });
  });

  test('takes screenshot of English start screen', async ({ page }) => {
    await page.getByTestId('language-menu-button').click();
    await page.getByTestId('lang-option-en').click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: 'test-results/start-screen-english.png', fullPage: true });
  });
});
```

- [ ] **Step 2: Run E2E tests**

Run: `cd /Users/develeap/private_gits/car_models/.worktrees/feature-enhancements && npm run build && npx playwright test`
Expected: All tests PASS. If any fail, fix the root cause in the component code, not by weakening tests.

- [ ] **Step 3: Refactor and verify**

Review test output for any flaky timing. Adjust timeouts if needed. Run full suite:

Run: `cd /Users/develeap/private_gits/car_models/.worktrees/feature-enhancements && npx vitest run && npx playwright test`
Expected: All unit + E2E tests PASS

- [ ] **Step 4: Commit**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/feature-enhancements
git add tests/e2e/game.spec.ts
git commit -m "test: update E2E tests for Hebrew default, share button, language toggle, best score, tier cycling"
```

---

### Task 8: Final integration verification and cleanup

**Files:**
- Review all modified files

- [ ] **Step 1: Full build + type check**

Run: `cd /Users/develeap/private_gits/car_models/.worktrees/feature-enhancements && npx tsc -b --noEmit && npm run build`
Expected: No TypeScript errors, successful production build

- [ ] **Step 2: Full test suite**

Run: `cd /Users/develeap/private_gits/car_models/.worktrees/feature-enhancements && npx vitest run && npx playwright test`
Expected: All unit + E2E tests PASS

- [ ] **Step 3: Verify no leftover English-only strings in components**

Search all component files for hardcoded English text that should have been replaced with `t()` calls. Brand names and model names remain in English (by design — they are English proper nouns). Only UI labels and instructions should use `t()`.

- [ ] **Step 4: Commit any cleanup**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/feature-enhancements
git add -A
git commit -m "chore: final cleanup and integration verification"
```
