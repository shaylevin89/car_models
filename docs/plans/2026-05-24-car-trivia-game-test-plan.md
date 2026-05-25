# Car Brand/Model Trivia Game — Test Plan

## Strategy Reconciliation

The agreed testing strategy assumed a greenfield SPA with game logic, a car dataset, and browser-based gameplay. The implementation plan confirms this exactly: React + TypeScript + Vite + MUI, static `carBrands` dataset, `useReducer` state management, Playwright E2E tests, and Vitest unit tests. No external APIs, paid services, or infrastructure dependencies exist beyond the free `raw.githubusercontent.com` logo CDN.

The strategy holds without modification. The interaction surface matches expectations: start screen, game screen (logo + 4 answer buttons + timer + score), game over screen (final score + play again). No adjustments required.

## Harness Requirements

### Harness 1: Vitest Unit Test Harness

- **What it does**: Runs pure-function and reducer tests against game logic, question generation, and dataset integrity without a browser or DOM.
- **What it exposes**: Direct import of `carBrands`, `getLogoUrl`, `generateQuestion`, `getAvailableBrands`, `gameReducer`, `initialGameState`, `QUESTION_TIME_SECONDS` from source modules.
- **Estimated complexity**: Low — standard Vitest + jsdom configuration already specified in the plan (`vitest.config.ts`).
- **Tests that depend on it**: Tests 8-17.

### Harness 2: Playwright E2E Harness

- **What it does**: Launches a Chromium browser against the Vite preview server (`http://localhost:4173/car_models/`), drives real user interactions, captures screenshots.
- **What it exposes**: Full browser page interaction via Playwright's `page` API — click, wait, read text, check visibility, take screenshots. The `webServer` config in `playwright.config.ts` auto-starts `npm run preview` before tests.
- **Estimated complexity**: Low-medium — requires `npm run build` before tests run, Playwright browser install, and the `baseURL` must match Vite's `base: '/car_models/'`.
- **Tests that depend on it**: Tests 1-7.

## Test Plan

### Test 1: Clicking Start button transitions from start screen to active game screen

- **Type**: scenario
- **Disposition**: new
- **Harness**: Playwright E2E
- **Preconditions**: App loaded at base URL, start screen visible.
- **Actions**:
  1. Verify "Car Trivia" title text is visible.
  2. Verify "Match the car brand to its model!" subtitle is visible.
  3. Verify the start button (`data-testid="start-button"`) is visible.
  4. Click the start button.
  5. Wait for game screen elements to appear.
- **Expected outcome**:
  - After clicking start: `data-testid="score-display"` is visible and contains "Score: 0". `data-testid="timer-display"` is visible and contains "10s". `data-testid="brand-name"` is visible and contains a non-empty brand name. Exactly 4 answer option buttons (`[data-testid^="answer-option-"]`) are visible.
  - Source of truth: User description ("Start screen with game title, brief instructions, and a Start button") and implementation plan (game flow steps 1-2).
- **Interactions**: Vite preview server, React rendering pipeline, MUI theme application.

### Test 2: Clicking the correct answer increments score and loads a new question

- **Type**: scenario
- **Disposition**: new
- **Harness**: Playwright E2E
- **Preconditions**: Game started (start button clicked), game screen visible with a question displayed.
- **Actions**:
  1. Read the brand name from `data-testid="brand-name"`.
  2. Read all 4 option button texts from `[data-testid^="answer-option-"]`.
  3. Import `carBrands` from `src/data/carData` at test scope. Look up the brand entry matching the displayed name.
  4. Identify the correct option: the option text that appears in the brand's `models` array.
  5. Verify `data-testid="score-display"` contains "Score: 0".
  6. Click the correct answer button via `data-testid="answer-option-${correctOption}"`.
  7. Wait 700ms for the green flash feedback + transition.
- **Expected outcome**:
  - `data-testid="score-display"` contains "Score: 1".
  - `data-testid="brand-name"` is visible (a new question loaded).
  - The game is still in playing phase (no game over screen).
  - Source of truth: User description ("if he was right he gets the point") and implementation plan (game flow step 3: "Correct answer: score increments, brief green flash feedback, next question loads").
- **Interactions**: Dataset module import in test context, question generation randomness, state reducer ANSWER + SET_QUESTION dispatch chain.

### Test 3: Clicking a wrong answer shows red flash feedback then transitions to game over

- **Type**: scenario
- **Disposition**: new
- **Harness**: Playwright E2E
- **Preconditions**: Game started, game screen visible with a question displayed.
- **Actions**:
  1. Read the brand name from `data-testid="brand-name"`.
  2. Read all 4 option button texts.
  3. Import `carBrands` and identify the correct option.
  4. Click any option that is NOT the correct one.
  5. Wait for the game over screen to appear (up to 5000ms timeout to account for 500ms red flash delay).
- **Expected outcome**:
  - `data-testid="play-again-button"` becomes visible.
  - `data-testid="final-score"` is visible and contains "0" (no points scored).
  - The text "Game Over" is visible on the page.
  - Source of truth: User description ("if not he will not get the point" and game is over) and implementation plan (game flow step 4: "Wrong answer or timeout: red flash feedback, game-over screen").
- **Interactions**: State reducer wrong-answer path, GAME_OVER delayed dispatch, component unmount/mount transition.

### Test 4: Timer expiry triggers game over with score 0

- **Type**: scenario
- **Disposition**: new
- **Harness**: Playwright E2E
- **Preconditions**: Game started, game screen visible.
- **Actions**:
  1. Click the start button.
  2. Do not interact with any answer buttons.
  3. Wait up to 15 seconds for the game over screen to appear.
- **Expected outcome**:
  - `data-testid="play-again-button"` becomes visible within 15 seconds.
  - `data-testid="final-score"` is visible and contains "0".
  - Source of truth: User description ("10 seconds count down for each question" and "timeout the game is over") and implementation plan (10-second countdown, TIMEOUT action).
- **Interactions**: setInterval timer tick dispatch chain, TIMEOUT dispatch at timeRemaining=0, GAME_OVER delayed dispatch.

### Test 5: Play Again button resets the game to the start screen

- **Type**: scenario
- **Disposition**: new
- **Harness**: Playwright E2E
- **Preconditions**: Game over screen visible (reached via timeout from Test 4 approach).
- **Actions**:
  1. Start the game and wait for timeout to reach game over.
  2. Click `data-testid="play-again-button"`.
- **Expected outcome**:
  - `data-testid="start-button"` becomes visible again.
  - The start screen is displayed (game has been fully reset).
  - Source of truth: Implementation plan (game flow step 4: "Play Again button") and user description (implied restart capability).
- **Interactions**: State reducer RESET action, component mount cycle for StartScreen.

### Test 6: Timer counts down from 10

- **Type**: scenario
- **Disposition**: new
- **Harness**: Playwright E2E
- **Preconditions**: Game started, game screen visible.
- **Actions**:
  1. Click the start button.
  2. Verify `data-testid="timer-display"` contains "10s".
  3. Wait 1500ms.
  4. Read the timer display text again.
- **Expected outcome**:
  - Initial timer text is "10s".
  - After 1500ms, the timer value is less than 10 (parsed from the text by removing the "s" suffix).
  - Source of truth: User description ("10 seconds count down") and implementation plan (TICK action decrements timeRemaining every 1000ms).
- **Interactions**: setInterval timer, TICK dispatch, TimerBar component re-render.

### Test 7: Screenshots of all three game screens for visual evidence

- **Type**: scenario
- **Disposition**: new
- **Harness**: Playwright E2E
- **Preconditions**: App loaded.
- **Actions**:
  1. Capture full-page screenshot of start screen to `test-results/start-screen.png`.
  2. Click start, wait for brand name visible, capture screenshot to `test-results/game-screen.png`.
  3. Wait for timeout game over, capture screenshot to `test-results/game-over-screen.png`.
- **Expected outcome**:
  - Three screenshot files are created at the specified paths. These serve as reproducible visual evidence of the UI state at each game phase, replacing manual visual inspection.
  - Source of truth: Agreed testing strategy ("Capture key game states for reproducible visual evidence").
- **Interactions**: Playwright screenshot API, full page rendering including MUI theme and gradient background.

### Test 8: Dataset contains at least 30 brands

- **Type**: invariant
- **Disposition**: new
- **Harness**: Vitest unit
- **Preconditions**: `carBrands` array imported from `src/data/carData`.
- **Actions**: Check `carBrands.length`.
- **Expected outcome**: Length is >= 30. Source of truth: Implementation plan specifies ~50 brands across 3 tiers (15 Tier 1 + 20 Tier 2 + 15 Tier 3).
- **Interactions**: None (pure data check).

### Test 9: Every brand has at least 3 models

- **Type**: invariant
- **Disposition**: new
- **Harness**: Vitest unit
- **Preconditions**: `carBrands` array imported.
- **Actions**: For each brand, check `brand.models.length >= 3`.
- **Expected outcome**: All brands have >= 3 models. Source of truth: Implementation plan dataset integrity invariant 3 ("Every brand must have at least 3 models").
- **Interactions**: None.

### Test 10: Model names are globally unique across all brands

- **Type**: invariant
- **Disposition**: new
- **Harness**: Vitest unit
- **Preconditions**: `carBrands` array imported.
- **Actions**: Build a map of model name (lowercase) to brand name. Assert no model appears in two brands.
- **Expected outcome**: Zero collisions. Source of truth: Implementation plan dataset integrity invariant 4 ("No model name may appear in more than one brand's model list").
- **Interactions**: None.

### Test 11: All three difficulty tiers are represented in the dataset

- **Type**: invariant
- **Disposition**: new
- **Harness**: Vitest unit
- **Preconditions**: `carBrands` array imported.
- **Actions**: Collect tiers into a Set, check that tiers 1, 2, and 3 are all present.
- **Expected outcome**: Set contains 1, 2, and 3. Source of truth: Implementation plan dataset integrity invariant 6.
- **Interactions**: None.

### Test 12: No duplicate brand names (case-insensitive)

- **Type**: invariant
- **Disposition**: new
- **Harness**: Vitest unit
- **Preconditions**: `carBrands` array imported.
- **Actions**: Map brand names to lowercase, check Set size equals array length.
- **Expected outcome**: No duplicates. Source of truth: Implementation plan dataset integrity invariant 7.
- **Interactions**: None.

### Test 13: Every brand has a valid difficulty tier (1, 2, or 3) and a non-empty logoSlug

- **Type**: invariant
- **Disposition**: new
- **Harness**: Vitest unit
- **Preconditions**: `carBrands` array imported.
- **Actions**: For each brand, assert tier is in [1, 2, 3] and logoSlug is a non-empty string.
- **Expected outcome**: All brands pass. Source of truth: Implementation plan type definitions (`DifficultyTier = 1 | 2 | 3`) and logo strategy (logoSlug required for URL construction).
- **Interactions**: None.

### Test 14: `getLogoUrl` constructs the correct CDN URL from a logoSlug

- **Type**: unit
- **Disposition**: new
- **Harness**: Vitest unit
- **Preconditions**: `getLogoUrl` function imported.
- **Actions**: Call `getLogoUrl('toyota')`.
- **Expected outcome**: Returns `"https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/toyota.png"`. Source of truth: Implementation plan logo strategy section.
- **Interactions**: None.

### Test 15: `getAvailableBrands` returns correct tier filtering by score

- **Type**: unit
- **Disposition**: new
- **Harness**: Vitest unit
- **Preconditions**: `getAvailableBrands` and `carBrands` imported.
- **Actions**:
  1. Call `getAvailableBrands(0)` — assert all returned brands are tier 1 only.
  2. Call `getAvailableBrands(5)` — assert returned brands include tiers 1 and 2 but not 3.
  3. Call `getAvailableBrands(10)` — assert returned brands include all three tiers.
- **Expected outcome**: Tier filtering matches: score 0-4 = tier 1, score 5-9 = tiers 1+2, score 10+ = all tiers. Source of truth: Implementation plan difficulty tiers section ("Tier 2 from score 5, Tier 3 from score 10").
- **Interactions**: None.

### Test 16: `generateQuestion` produces a valid question with 4 unique options including the correct model

- **Type**: unit
- **Disposition**: new
- **Harness**: Vitest unit
- **Preconditions**: `generateQuestion` imported.
- **Actions**:
  1. Call `generateQuestion(0)`.
  2. Assert `question.options` has length 4.
  3. Assert `question.options` contains `question.correctModel`.
  4. Assert `question.correctModel` is in `question.brand.models`.
  5. Assert the 3 distractor options are NOT in `question.brand.models`.
  6. Assert all 4 options are unique (Set size = 4).
  7. Run 20 times and assert the correct answer appears in at least 2 different positions (shuffle verification).
- **Expected outcome**: All assertions pass across all runs. Source of truth: Implementation plan question generation logic and game flow step 5.
- **Interactions**: `Math.random` (non-deterministic but statistically verified over 20 runs).

### Test 17: `gameReducer` state transitions

- **Type**: unit
- **Disposition**: new
- **Harness**: Vitest unit
- **Preconditions**: `gameReducer`, `initialGameState`, `QUESTION_TIME_SECONDS` imported. A mock `Question` object constructed with known brand/model data.
- **Actions and expected outcomes** (each is a sub-assertion):
  1. `initialGameState` has phase `'start'`, score `0`, currentQuestion `null`. (Source: implementation plan initial state.)
  2. `START_GAME` on initial state produces phase `'playing'`, score `0`, timeRemaining `QUESTION_TIME_SECONDS`. (Source: game flow step 1.)
  3. `SET_QUESTION` with a mock question sets `currentQuestion`, resets `timeRemaining` to `QUESTION_TIME_SECONDS`, sets `lastAnswerCorrect` to `null`. (Source: implementation plan SET_QUESTION reducer.)
  4. `ANSWER` with the correct model increments score by 1, sets `lastAnswerCorrect` to `true`. (Source: user description "right = point".)
  5. `ANSWER` with a wrong model keeps phase `'playing'`, does NOT change score, sets `lastAnswerCorrect` to `false`. (Source: implementation plan wrong-answer feedback pattern.)
  6. `TIMEOUT` keeps phase `'playing'`, sets `lastAnswerCorrect` to `false`. (Source: implementation plan timeout feedback pattern.)
  7. `GAME_OVER` transitions phase to `'gameover'`, preserves score. (Source: implementation plan GAME_OVER action.)
  8. `TICK` decrements `timeRemaining` by 1; at 0 it stays at 0. (Source: implementation plan TICK reducer.)
  9. `RESET` returns `initialGameState`. (Source: implementation plan RESET action.)
- **Interactions**: None (pure function).

## Coverage Summary

### Covered areas

| Action space area | Tests covering it | Fidelity |
|---|---|---|
| Start screen display (title, instructions, start button) | Test 1, Test 7 | E2E browser |
| Start button click -> game transition | Test 1 | E2E browser |
| Question display (logo, brand name, 4 options, timer) | Tests 1, 2, 6, 7 | E2E browser |
| Correct answer -> score increment + next question | Test 2 | E2E browser |
| Wrong answer -> game over | Test 3 | E2E browser |
| Timer countdown from 10 | Test 6 | E2E browser |
| Timer expiry -> game over | Test 4 | E2E browser |
| Game over screen (final score, play again button) | Tests 3, 4, 5, 7 | E2E browser |
| Play Again -> restart to start screen | Test 5 | E2E browser |
| Visual appearance of all screens | Test 7 | E2E screenshots |
| Dataset size and structure | Tests 8, 9, 12, 13 | Unit |
| Model name global uniqueness | Test 10 | Unit |
| Difficulty tier representation | Test 11 | Unit |
| Logo URL construction | Test 14 | Unit |
| Score-based tier filtering | Test 15 | Unit |
| Question generation correctness | Test 16 | Unit |
| Game state reducer transitions | Test 17 | Unit |

### Explicitly excluded per agreed strategy

| Area | Reason | Risk |
|---|---|---|
| Logo image loading and fallback rendering | Depends on external CDN (`raw.githubusercontent.com`) which may be unavailable in CI. Fallback is simple `onError` handler. | Low — the fallback is a single `useState` flip tested implicitly via E2E screenshot if a logo fails to load. |
| Responsive layout across viewport sizes | Agreed strategy focuses on functional behavior, not responsive breakpoints. | Low — MUI's responsive grid and Container handle this by default. |
| Hebrew RTL text rendering correctness | No automated RTL verification harness specified. Screenshot evidence provides partial coverage. | Low — limited to `dir="rtl"` on a single Box element. |
| CSS animation smoothness of timer bar | Subjective visual quality. Timer countdown behavior is verified functionally. | Low — CSS transition is a single property declaration. |
| GitHub Pages deployment | Requires actual `gh-pages` deploy. Build verification covers the production bundle. | Medium — `base: '/car_models/'` path correctness is validated by E2E tests running against the preview server with the same base path. |
| Player-vs-player mode | Explicitly deferred by the user ("later on I want it to be used for player vs player"). | None — not in scope. |
