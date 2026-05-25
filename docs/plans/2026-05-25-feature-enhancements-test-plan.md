# Feature Enhancements Test Plan

## Harness requirements

### Existing harnesses (no changes needed)

1. **Vitest unit harness** (`vitest.config.ts`): Runs pure logic tests. Exposes programmatic assertions on return values. All existing unit tests (`tests/unit/*.test.ts`) use this.
2. **Playwright E2E harness** (`playwright.config.ts`): Drives Chrome against the production build served at `localhost:4173/car_models/`. Provides page interaction, text assertions, `data-testid` locators, clipboard access, localStorage evaluation, and screenshot capture.

### Harness adjustments

- **Playwright clipboard permissions**: Several new E2E tests require `context.grantPermissions(['clipboard-read', 'clipboard-write'])` before exercising the share button. No harness code change is needed; this is per-test setup via Playwright's existing API.
- **Playwright localStorage clearing**: New tests that verify best-score persistence require clearing localStorage in `beforeEach` to isolate state. The existing `beforeEach` navigates to `/`; it must be extended to clear localStorage and reload.

---

## Test plan

### Priority 1: Existing E2E scenario tests adapted for Hebrew default (regression)

These are the highest-value existing checks. They exercise the full user-visible surface. They will break when the UI switches to Hebrew default and must be updated to pass.

---

**Test 1: Start screen displays Hebrew text by default**

- **Name**: Start screen shows Hebrew title and subtitle when opened fresh
- **Type**: regression
- **Disposition**: extend (from existing "shows start screen with start button")
- **Harness**: Playwright E2E
- **Preconditions**: Fresh page load, localStorage cleared
- **Actions**: Navigate to `/`
- **Expected outcome**: The page contains the visible text "טריוויית רכב" (app title). The page contains the visible text "התאימו את יצרן הרכב לדגם שלו!" (subtitle). The start button (`data-testid="start-button"`) is visible. Source of truth: user requested "make all the text in hebrew"; implementation plan specifies Hebrew as default locale with these exact translation strings.
- **Interactions**: i18n LanguageContext, translations dictionary

---

**Test 2: Starting the game shows game elements**

- **Name**: Clicking start button transitions to game screen with question, timer, score, and 4 options
- **Type**: regression
- **Disposition**: extend (from existing "starts game when clicking start button")
- **Harness**: Playwright E2E
- **Preconditions**: App at start screen
- **Actions**: Click `data-testid="start-button"`
- **Expected outcome**: `data-testid="score-display"` is visible. `data-testid="timer-display"` is visible. `data-testid="brand-name"` is visible. Exactly 4 elements matching `[data-testid^="answer-option-"]` exist. Source of truth: existing behavior unchanged by feature enhancements.
- **Interactions**: useGameState reducer, questionGenerator, LanguageContext

---

**Test 3: Correct answer increments score and loads next question**

- **Name**: Clicking the correct answer model increments the displayed score and shows a new question
- **Type**: regression
- **Disposition**: extend (from existing "correct answer increments score")
- **Harness**: Playwright E2E
- **Preconditions**: Game started, first question visible
- **Actions**: Read `data-testid="brand-name"` text. Look up the brand in the imported `carBrands` dataset. Find the option whose text matches one of the brand's models. Verify score display contains "0". Click `data-testid="answer-option-{correctModel}"`. Wait 700ms for feedback animation.
- **Expected outcome**: Score display now contains "1". A new brand name is visible. Source of truth: user description "if i'm right i get a point"; score display uses `t('game.score', { score })` so the number is the source of truth, not the surrounding label text.
- **Interactions**: questionGenerator tier-cycling (first question at score 0 must come from Tier 1), i18n score label

---

**Test 4: Wrong answer ends the game with Hebrew game-over text**

- **Name**: Clicking a wrong answer shows game over screen with Hebrew title and score 0
- **Type**: regression
- **Disposition**: extend (from existing "game over screen shows after wrong answer")
- **Harness**: Playwright E2E
- **Preconditions**: Game started, first question visible
- **Actions**: Read `data-testid="brand-name"`. Find a wrong option (not in brand's models). Click it.
- **Expected outcome**: `data-testid="play-again-button"` becomes visible (within 5s). `data-testid="final-score"` is visible and contains "0". The text "המשחק נגמר" (Hebrew "Game Over") is visible. Source of truth: user requested Hebrew default; translation key `gameover.title` = "המשחק נגמר".
- **Interactions**: useGameState GAME_OVER transition, i18n

---

**Test 5: Timer expiry ends the game**

- **Name**: When no answer is given within 10 seconds, the game ends
- **Type**: regression
- **Disposition**: extend (from existing "game over on timeout")
- **Harness**: Playwright E2E
- **Preconditions**: Game started
- **Actions**: Wait without clicking any option.
- **Expected outcome**: `data-testid="play-again-button"` becomes visible within 15s. `data-testid="final-score"` contains "0". Source of truth: user description "timeout = game over".
- **Interactions**: Timer tick logic, TIMEOUT action

---

**Test 6: Play again returns to start screen**

- **Name**: After game over, clicking play again returns to the start screen
- **Type**: regression
- **Disposition**: extend (from existing "play again restarts the game")
- **Harness**: Playwright E2E
- **Preconditions**: Game over screen visible
- **Actions**: Click `data-testid="play-again-button"`.
- **Expected outcome**: `data-testid="start-button"` is visible. Source of truth: existing behavior.
- **Interactions**: useGameState RESET action

---

### Priority 2: New E2E scenario tests for new features

---

**Test 7: Language toggle switches UI between Hebrew and English**

- **Name**: Hamburger menu toggles the entire UI between Hebrew and English
- **Type**: scenario
- **Disposition**: new
- **Harness**: Playwright E2E
- **Preconditions**: Fresh page load, default Hebrew locale
- **Actions**: (1) Verify "טריוויית רכב" is visible. (2) Click `data-testid="language-menu-button"`. (3) Click `data-testid="lang-option-en"`. (4) Verify "Car Trivia" and "Match the car brand to its model!" are visible. (5) Click `data-testid="language-menu-button"`. (6) Click `data-testid="lang-option-he"`. (7) Verify "טריוויית רכב" is visible again.
- **Expected outcome**: All assertions pass. The toggle switches all visible UI strings between locales. Source of truth: user requested "hamburger to switch language to english"; translations dictionary defines both locales.
- **Interactions**: LanguageContext, localStorage persistence of `car-trivia-lang`, MUI Menu component, RTL/LTR cache switching

---

**Test 8: Share button copies Hebrew message to clipboard**

- **Name**: Clicking share on game-over copies the exact Hebrew share message with the score to clipboard
- **Type**: scenario
- **Disposition**: new
- **Harness**: Playwright E2E
- **Preconditions**: Game over screen visible after answering wrong (score 0). Clipboard permissions granted.
- **Actions**: (1) Start game. (2) Answer wrong to reach game over. (3) Verify `data-testid="share-button"` is visible. (4) Click it. (5) Read clipboard via `page.evaluate(() => navigator.clipboard.readText())`.
- **Expected outcome**: Clipboard text is exactly `'אני הצלחתי 0 דגמים.. כמה אתה מצליח?'`. Source of truth: user specified this exact message format with X = score.
- **Interactions**: navigator.clipboard.writeText API, Snackbar "copied" feedback

---

**Test 9: Share button includes correct score in clipboard message**

- **Name**: After scoring 1 point, the share message contains the correct score
- **Type**: scenario
- **Disposition**: new
- **Harness**: Playwright E2E
- **Preconditions**: Game over screen after 1 correct + 1 wrong answer (score 1). Clipboard permissions granted.
- **Actions**: (1) Start game. (2) Answer correctly (score becomes 1). (3) Wait 700ms. (4) Answer wrong. (5) Wait for game over. (6) Click share button. (7) Read clipboard.
- **Expected outcome**: Clipboard text is exactly `'אני הצלחתי 1 דגמים.. כמה אתה מצליח?'`. Source of truth: user-specified message format.
- **Interactions**: Score state flowing into share handler

---

**Test 10: Best score displays on start screen after scoring points**

- **Name**: After achieving a score, the best score appears on the start screen and persists across reload
- **Type**: scenario
- **Disposition**: new
- **Harness**: Playwright E2E
- **Preconditions**: localStorage cleared
- **Actions**: (1) Start game. (2) Answer 1 correct. (3) Wait 700ms. (4) Answer wrong. (5) Wait for game over. (6) Verify `data-testid="best-score-gameover"` is visible. (7) Click play again. (8) Verify `data-testid="best-score-display"` is visible on start screen. (9) Reload page. (10) Verify `data-testid="best-score-display"` is still visible.
- **Expected outcome**: Best score display is present on both game-over and start screens, and survives a page reload. Source of truth: user requested "local storage to save best score".
- **Interactions**: localStorage `car-trivia-best-score`, getBestScore/setBestScoreIfHigher utilities

---

**Test 11: New best indicator shows when beating the record**

- **Name**: When the current score exceeds the stored best, a "new best" indicator appears
- **Type**: scenario
- **Disposition**: new
- **Harness**: Playwright E2E
- **Preconditions**: localStorage cleared (so best = 0)
- **Actions**: (1) Start game. (2) Answer 1 correct. (3) Answer wrong. (4) Wait for game over.
- **Expected outcome**: `data-testid="new-best-indicator"` is visible, containing the text from `gameover.new_best` ("שיא חדש!" in Hebrew default). Source of truth: implementation plan specifies a "New Best!" indicator when current score beats stored best.
- **Interactions**: setBestScoreIfHigher comparison logic, React useEffect

---

**Test 12: Tier cycling -- first 10 questions from Tier 1, question 11 from Tier 2**

- **Name**: The first 10 questions come from Tier 1 brands, and the 11th question comes from a Tier 2 brand
- **Type**: scenario
- **Disposition**: new
- **Harness**: Playwright E2E
- **Preconditions**: Game started
- **Actions**: For each of 10 questions: read `data-testid="brand-name"`, verify it is in the set of Tier 1 brand names from `carBrands`, find and click the correct answer, wait 600ms. After 10 correct answers, read the 11th brand name.
- **Expected outcome**: All 10 brand names are in the Tier 1 set. The 11th brand name is in the Tier 2 set. Source of truth: user requested "the 10th first questions will be from first tier and then next 10th from second tier etc."
- **Interactions**: getTierForScore, getBrandsForScore, generateQuestion, timer reset per question

---

### Priority 3: New E2E screenshot tests (visual evidence)

---

**Test 13: Screenshot of Hebrew start screen**

- **Name**: Capture Hebrew start screen for visual verification
- **Type**: regression
- **Disposition**: extend (from existing screenshot tests)
- **Harness**: Playwright E2E
- **Preconditions**: Fresh page load
- **Actions**: Take full-page screenshot.
- **Expected outcome**: Screenshot saved to `test-results/start-screen-hebrew.png`. Source of truth: visual artifact.
- **Interactions**: None additional

---

**Test 14: Screenshot of English start screen after toggle**

- **Name**: Capture English start screen after language toggle
- **Type**: scenario
- **Disposition**: new
- **Harness**: Playwright E2E
- **Preconditions**: Fresh page load
- **Actions**: Toggle to English via hamburger menu. Take screenshot.
- **Expected outcome**: Screenshot saved to `test-results/start-screen-english.png`. Source of truth: visual artifact.
- **Interactions**: Language toggle

---

**Test 15: Screenshot of game screen**

- **Name**: Capture game screen with question, timer, and options
- **Type**: regression
- **Disposition**: extend
- **Harness**: Playwright E2E
- **Preconditions**: Game started
- **Actions**: Start game, wait for brand name visible, take screenshot.
- **Expected outcome**: Screenshot saved to `test-results/game-screen.png`. Source of truth: visual artifact.
- **Interactions**: None additional

---

**Test 16: Screenshot of game over screen with share button**

- **Name**: Capture game over screen showing share button and best score
- **Type**: scenario
- **Disposition**: new
- **Harness**: Playwright E2E
- **Preconditions**: Game over after timeout
- **Actions**: Start game, wait for timeout/game over, take screenshot.
- **Expected outcome**: Screenshot saved to `test-results/game-over-screen.png`. Source of truth: visual artifact.
- **Interactions**: Share button rendering, best score display

---

### Priority 4: Invariant tests

---

**Test 17: Hebrew translation strings never start with punctuation**

- **Name**: All Hebrew strings have punctuation at the logical end, not the start
- **Type**: invariant
- **Disposition**: new
- **Harness**: Vitest unit
- **Preconditions**: translations dictionary loaded
- **Actions**: Iterate all entries in `translations.he`. Test each value against regex `/^[!?.,:;]/`.
- **Expected outcome**: No Hebrew string starts with punctuation. Source of truth: implementation plan section 8 "Hebrew string punctuation invariant" -- punctuation at logical start renders at visual right (beginning of line) which looks broken.
- **Interactions**: translations dictionary

---

**Test 18: Both locales have identical key sets**

- **Name**: Hebrew and English translation dictionaries have the same keys
- **Type**: invariant
- **Disposition**: new
- **Harness**: Vitest unit
- **Preconditions**: translations dictionary loaded
- **Actions**: Extract sorted key arrays from `translations.he` and `translations.en`. Compare.
- **Expected outcome**: Arrays are identical. Source of truth: missing keys would cause untranslated UI.
- **Interactions**: translations dictionary

---

### Priority 5: Boundary and edge-case tests

---

**Test 19: getTierForScore cycles correctly across multiple full cycles**

- **Name**: Tier cycling wraps correctly: scores 0-9 Tier 1, 10-19 Tier 2, 20-29 Tier 3, 30-39 Tier 1 again
- **Type**: boundary
- **Disposition**: new (replaces existing `getAvailableBrands` threshold tests)
- **Harness**: Vitest unit
- **Preconditions**: None
- **Actions**: Call `getTierForScore` for scores 0, 9, 10, 19, 20, 29, 30, 39, 60, 70, 80.
- **Expected outcome**: Scores 0-9 return 1. Scores 10-19 return 2. Scores 20-29 return 3. Scores 30-39 return 1 (cycle). Score 60 returns 1, 70 returns 2, 80 returns 3. Source of truth: user requested "the 10th first questions will be from first tier and then next 10th from second tier etc and come back to first tier."
- **Interactions**: None (pure function)

---

**Test 20: getBrandsForScore returns only the correct tier's brands**

- **Name**: At each score, only brands from the single expected tier are returned
- **Type**: boundary
- **Disposition**: new (replaces existing `getAvailableBrands` tests)
- **Harness**: Vitest unit
- **Preconditions**: None
- **Actions**: Call `getBrandsForScore(0)`, `getBrandsForScore(10)`, `getBrandsForScore(20)`, `getBrandsForScore(30)`.
- **Expected outcome**: Score 0: all brands tier 1, non-empty. Score 10: all brands tier 2, non-empty. Score 20: all brands tier 3, non-empty. Score 30: all brands tier 1 (cycle). Source of truth: same as Test 19.
- **Interactions**: carBrands data

---

**Test 21: Distractors come from the same tier as the question brand**

- **Name**: Generated question distractors are from the same tier, not leaking cross-tier information
- **Type**: boundary
- **Disposition**: new
- **Harness**: Vitest unit
- **Preconditions**: None
- **Actions**: Generate 10 questions at score 10 (Tier 2). For each, verify all distractors belong to Tier 2 brands.
- **Expected outcome**: Every distractor model exists in the model list of a Tier 2 brand. Source of truth: implementation plan section 5 "Distractors are still drawn from the same tier."
- **Interactions**: carBrands data, question generation randomness

---

**Test 22: Generated question brand matches the expected tier for score**

- **Name**: The question's brand tier matches getTierForScore for the given score
- **Type**: boundary
- **Disposition**: new
- **Harness**: Vitest unit
- **Preconditions**: None
- **Actions**: Generate questions for scores 0, 5, 10, 15, 20, 25, 30.
- **Expected outcome**: Each question's `brand.tier` equals `getTierForScore(score)`. Source of truth: tier cycling algorithm.
- **Interactions**: generateQuestion, getTierForScore

---

**Test 23: bestScore returns 0 when nothing stored**

- **Name**: getBestScore returns 0 when localStorage has no best score
- **Type**: boundary
- **Disposition**: new
- **Harness**: Vitest unit
- **Preconditions**: localStorage cleared
- **Actions**: Call `getBestScore()`.
- **Expected outcome**: Returns 0. Source of truth: implementation plan section 6.
- **Interactions**: localStorage mock

---

**Test 24: bestScore returns 0 for invalid stored value**

- **Name**: getBestScore returns 0 when localStorage contains non-numeric value
- **Type**: boundary
- **Disposition**: new
- **Harness**: Vitest unit
- **Preconditions**: `localStorage.setItem('car-trivia-best-score', 'abc')`
- **Actions**: Call `getBestScore()`.
- **Expected outcome**: Returns 0. Source of truth: defensive parsing in bestScore utility.
- **Interactions**: localStorage mock

---

**Test 25: setBestScoreIfHigher only updates when score is higher**

- **Name**: Best score is only overwritten when the new score exceeds the stored value
- **Type**: boundary
- **Disposition**: new
- **Harness**: Vitest unit
- **Preconditions**: `localStorage.setItem('car-trivia-best-score', '20')`
- **Actions**: Call `setBestScoreIfHigher(5)`. Call `getBestScore()`.
- **Expected outcome**: `setBestScoreIfHigher` returns 20. `getBestScore` returns 20. Source of truth: implementation plan "compared with the stored best and updated if higher."
- **Interactions**: localStorage mock

---

**Test 26: setBestScoreIfHigher updates when score is higher**

- **Name**: Best score is updated when the new score exceeds the current best
- **Type**: boundary
- **Disposition**: new
- **Harness**: Vitest unit
- **Preconditions**: localStorage cleared
- **Actions**: Call `setBestScoreIfHigher(10)`. Call `getBestScore()`.
- **Expected outcome**: Both return 10. Source of truth: same as Test 25.
- **Interactions**: localStorage mock

---

**Test 27: translate returns key for unknown keys**

- **Name**: Translation lookup returns the key string itself when the key does not exist
- **Type**: boundary
- **Disposition**: new
- **Harness**: Vitest unit
- **Preconditions**: None
- **Actions**: Call `translate('en', 'nonexistent.key')`.
- **Expected outcome**: Returns `'nonexistent.key'`. Source of truth: implementation plan translate() specification.
- **Interactions**: None

---

### Priority 6: Regression tests (existing, no changes needed)

---

**Test 28: carData integrity tests (unchanged)**

- **Name**: All existing carData integrity tests pass without modification
- **Type**: regression
- **Disposition**: existing
- **Harness**: Vitest unit
- **Preconditions**: None
- **Actions**: Run `tests/unit/carData.test.ts`.
- **Expected outcome**: All 9 existing tests pass (brand count, model count, uniqueness, tiers). Source of truth: existing tests are data-integrity invariants unaffected by feature changes.
- **Interactions**: carBrands data

---

**Test 29: useGameState reducer tests (unchanged)**

- **Name**: All existing game reducer tests pass without modification
- **Type**: regression
- **Disposition**: existing
- **Harness**: Vitest unit
- **Preconditions**: None
- **Actions**: Run `tests/unit/useGameState.test.ts`.
- **Expected outcome**: All 9 existing tests pass. The reducer has no changes from these features. Source of truth: existing tests protect reducer contract.
- **Interactions**: None

---

### Priority 7: Unit tests (existing generateQuestion tests, adapted)

---

**Test 30: generateQuestion returns 4 unique options including the correct model**

- **Name**: Generated questions always have exactly 4 unique options with the correct model among them
- **Type**: unit
- **Disposition**: extend (existing tests, but import changes from `getAvailableBrands` to `getBrandsForScore`)
- **Harness**: Vitest unit
- **Preconditions**: None
- **Actions**: Generate questions at score 0. Check option count, uniqueness, and that correctModel is in options.
- **Expected outcome**: 4 options, all unique, correctModel included, correctModel belongs to question brand, distractors do not. Source of truth: existing test contract, unchanged by feature.
- **Interactions**: None

---

**Test 31: Options are shuffled across runs**

- **Name**: The correct answer is not always in the same position
- **Type**: unit
- **Disposition**: extend (existing test)
- **Harness**: Vitest unit
- **Preconditions**: None
- **Actions**: Generate 20 questions, record the index of the correct model.
- **Expected outcome**: At least 2 different positions observed. Source of truth: Fisher-Yates shuffle contract.
- **Interactions**: None

---

## Coverage summary

### Covered action space

| User action / behavior | Tests covering it |
|---|---|
| View start screen (Hebrew default) | 1, 13 |
| Click start button | 2 |
| View game question with timer and 4 options | 2, 15 |
| Click correct answer | 3, 12 |
| Click wrong answer | 4 |
| Timer countdown and expiry | 5 |
| View game over screen (Hebrew) | 4, 16 |
| Click play again | 6 |
| Click hamburger menu / switch language | 7, 14 |
| Click share button / clipboard copy | 8, 9 |
| View best score on start screen | 10 |
| View best score on game over screen | 10 |
| View "new best" indicator | 11 |
| Best score persistence across reload | 10 |
| Tier 1 questions for first 10 | 12 |
| Tier 2 questions for questions 11-20 | 12 |
| Tier cycling wrap-around | 19, 20 |
| Distractor same-tier constraint | 21 |
| Translation completeness and correctness | 17, 18, 27 |
| Best score edge cases | 23, 24, 25, 26 |
| Data integrity | 28 |
| Reducer contract | 29 |
| Question generation contract | 22, 30, 31 |

### Explicitly excluded per agreed strategy

- **Mobile viewport screenshots**: The agreed strategy mentioned mobile viewport screenshots at ~15% effort. The Playwright harness is configured for Desktop Chrome only. Mobile layout can be approximated by adding a `page.setViewportSize` call to a screenshot test, but this was not included as the strategy said "screenshots" generally, not specifically mobile. Risk: mobile-specific CSS issues (e.g., RTL overflow) could be missed. Mitigation: the actual deployment is tested by the user on their phone.
- **Performance testing**: Not in the agreed strategy. The game is lightweight client-side with no network calls during gameplay. Risk: negligible.
- **RTL CSS flipping verification**: The RTL cache + stylis-plugin-rtl setup is architectural. Verifying that specific CSS properties are flipped (e.g., `padding-left` becomes `padding-right`) would require reading computed styles, which is brittle and not user-visible. The E2E language toggle test (Test 7) plus the Hebrew screenshot (Test 13) provide indirect evidence. Risk: subtle RTL layout bugs. Mitigation: screenshots.
