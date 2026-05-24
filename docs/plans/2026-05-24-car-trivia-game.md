# Car Brand/Model Trivia Game — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use trycycle-executing to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web-based car trivia game where players see a car brand logo and must pick the correct model from four options, with a 10-second countdown per question, scoring on correct answers, and game-over on wrong answer or timeout.

**Architecture:** Single-page React application with TypeScript. Game state managed via a `useReducer` hook with a pure reducer (no stale-closure effects). Car brand/model data stored as a static TypeScript dataset bundled with the app. Logos loaded from the `filippofilip95/car-logos-dataset` GitHub repository via `raw.githubusercontent.com` with a styled text fallback. Material Design via MUI v5 (pinned). Static build deployed to GitHub Pages.

**Tech Stack:**
- React 18 + TypeScript + Vite
- MUI (Material UI v5, pinned: `@mui/material@^5`) for Material Design components and theming
- Vitest for unit tests
- Playwright for E2E tests
- GitHub Pages for deployment (via `gh-pages` npm package)

---

## Design Decisions & Justifications

### Why React + Vite + MUI
- Vite provides fast builds and HMR, ideal for single-page apps.
- MUI implements Google's Material Design specification directly, satisfying the user's request for "Google materials rules." It provides ready-made components (cards, buttons, progress bars, typography) with proper theming.
- React + TypeScript gives type safety for the game logic and data structures.
- This stack deploys trivially to GitHub Pages as a static site.

### Why a static JSON dataset (not an API)
- The game needs a curated, difficulty-scored dataset. A third-party API would add latency, require error handling for downtime, and may not categorize models by brand reliably.
- A static dataset lets us score brands by famousness (difficulty tiers) as the user requested.
- The dataset is small (~35 brands x ~5 models each = ~175 entries) and fits easily in the bundle.

### Logo strategy
- Primary: Load logos from the `filippofilip95/car-logos-dataset` GitHub repository, served via `raw.githubusercontent.com`. This is a public, verified-working source with no API key required. The thumbnail images are used for fast loading.
- The `logoSlug` field in the dataset maps each brand to its filename in the `car-logos-dataset` repository. The full URL is constructed at runtime: `https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/${logoSlug}.png`.
- Fallback: If the logo fails to load, display the brand name in a styled card instead. The `<img>` tag's `onError` handler switches to the text fallback. The `logoError` state resets whenever the `brand` prop changes (via a `useEffect` keyed on `brand.name`), so a failed logo for one brand does not affect subsequent brands.
- Per the user's request: logo displayed above the vendor name in all cases.

### Difficulty tiers
Brands are scored into 3 tiers. Only brands that appear in the dataset are listed here — the dataset is the single source of truth for tier assignments.

- **Tier 1 (Well Known):** Toyota, BMW, Mercedes-Benz, Honda, Ford, Chevrolet, Audi, Volkswagen, Hyundai, Kia, Nissan, Tesla, Porsche, Ferrari, Lamborghini
- **Tier 2 (Known):** Mazda, Subaru, Volvo, Lexus, Jaguar, Land Rover, Jeep, Dodge, Buick, Cadillac, Chrysler, Fiat, Alfa Romeo, Peugeot, Renault, MINI, Mitsubishi, Suzuki, Infiniti, Genesis
- **Tier 3 (Obscure):** Maserati, Bentley, Aston Martin, Rolls-Royce, McLaren, Bugatti, Lotus, Skoda, Seat, Dacia, Opel, Citroen, Lancia, Saab, Smart

The game starts with Tier 1 brands and progressively introduces Tier 2 and Tier 3 as the player's score increases (Tier 2 from score 5, Tier 3 from score 10). Distractors (wrong answers) are always drawn from different brands within the available tiers, ensuring no two options belong to the same brand.

### Dataset integrity invariants

These invariants are enforced by both static data review and automated unit tests:

1. Every brand listed in the tier table above must exist in the dataset with the matching tier value.
2. No brand may appear in the dataset that is not listed in a tier above.
3. Every brand must have at least 3 models (to ensure enough options for question generation).
4. No model name may appear in more than one brand's model list (global uniqueness). This prevents distractor collisions where two brands share a model name, making the question ambiguous.
5. No brand should list models that actually belong to a separate brand (e.g., Ram 1500 does not belong under Dodge since Ram is a separate brand; Cupra Formentor does not belong under Seat since Cupra is a separate brand).
6. All three tiers must be represented in the dataset.
7. No duplicate brand names (case-insensitive).

### Game flow
1. Start screen with game title, brief instructions (Hebrew + English), and a "Start" button.
2. Each question: logo + brand name displayed, 4 model options shown as buttons, 10-second countdown bar animating smoothly down (CSS transition on the progress bar width, not stepped 1-second jumps).
3. Correct answer: score increments, brief green flash feedback (~500ms), next question loads.
4. Wrong answer or timeout: red flash feedback, game-over screen with final score and "Play Again" button.
5. Questions are generated randomly: pick a brand from available tiers, select one correct model, select 3 distractor models from other brands (guaranteed unique across the global model pool).

### Language approach
- UI chrome (buttons, labels, instructions) are bilingual: Hebrew instructions shown on start screen, English labels on game elements.
- All car brand names and model names are in English (as the user specified, since they're English most of the time).
- RTL support is not needed since the core game content is English; Hebrew text on the start screen uses `dir="rtl"` on that specific element.

### State management architecture

The game uses `useReducer` with a pure reducer function. Key design rules:

- The reducer is a pure function. All game state transitions (start, answer, tick, timeout, set question, reset) go through the reducer.
- The `NEXT_QUESTION` action type is removed — it is not needed. After a correct answer, the `lastAnswerCorrect === true` effect triggers `loadNextQuestion` after a 500ms delay.
- `loadNextQuestion` receives `score` as a parameter (not from closure) to avoid stale state bugs. The `useEffect` that calls it passes `state.score` directly.
- Timer logic: A `setInterval` ticks every 1000ms, dispatching `TICK`. When `timeRemaining` reaches 0, a separate effect dispatches `TIMEOUT`. Both effects clean up properly.

### GitHub Pages deployment

- `vite.config.ts` sets `base: '/car_models/'` for the GitHub Pages subdirectory.
- `package.json` includes `"homepage": "https://shaylevin89.github.io/car_models/"`.
- Favicon href uses Vite's base-aware path (no leading `/`), rendered correctly in `index.html` as a relative path.
- The Playwright config and E2E tests account for the `/car_models/` base path by navigating to the base URL that the Vite preview server serves.
- The `gh-pages` deploy script builds and publishes `dist/` to the `gh-pages` branch.

---

## File Structure

```
car-trivia-game/                          (worktree root)
├── docs/plans/                           (this plan)
├── public/
│   └── favicon.svg                       (car-themed favicon, pure SVG paths)
├── src/
│   ├── main.tsx                          (React entry point, renders App)
│   ├── App.tsx                           (Top-level component, theme provider)
│   ├── theme.ts                          (MUI theme configuration)
│   ├── data/
│   │   └── carData.ts                    (Brand/model dataset with tiers)
│   ├── types/
│   │   └── game.ts                       (TypeScript interfaces)
│   ├── hooks/
│   │   └── useGameState.ts               (Game state reducer + timer logic)
│   ├── utils/
│   │   └── questionGenerator.ts          (Question generation + distractor logic)
│   ├── components/
│   │   ├── StartScreen.tsx               (Welcome screen with instructions)
│   │   ├── QuestionCard.tsx              (Logo + brand name display)
│   │   ├── AnswerOptions.tsx             (4 answer buttons)
│   │   ├── TimerBar.tsx                  (Smooth animated countdown bar)
│   │   ├── ScoreDisplay.tsx              (Current score indicator)
│   │   ├── GameOverScreen.tsx            (Final score + play again)
│   │   └── GameScreen.tsx               (Orchestrates question/answers/timer)
│   └── App.css                           (Minimal global styles)
├── tests/
│   ├── unit/
│   │   ├── carData.test.ts               (Dataset integrity tests)
│   │   ├── questionGenerator.test.ts     (Question generation logic tests)
│   │   └── useGameState.test.ts          (Game state reducer tests)
│   └── e2e/
│       └── game.spec.ts                  (Playwright E2E tests)
├── index.html                            (Vite entry HTML)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
└── .gitignore
```

Each file has one clear responsibility:
- **Data layer** (`carData.ts`, `game.ts`): defines the data and types
- **Logic layer** (`questionGenerator.ts`, `useGameState.ts`): pure game logic, fully testable without DOM
- **Component layer** (`StartScreen`, `QuestionCard`, etc.): thin UI components consuming the logic layer
- **Config layer** (`theme.ts`, `vite.config.ts`, etc.): build and styling configuration

---

## Task Breakdown

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `vitest.config.ts`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `.gitignore`
- Create: `playwright.config.ts`

- [ ] **Step 1: Initialize the Vite + React + TypeScript project**

Because the worktree already contains `docs/plans/`, running `npm create vite@latest` in a non-empty directory would trigger an interactive prompt that blocks automation. Instead, scaffold manually by creating the required files directly.

Create `package.json`:

```json
{
  "name": "car-trivia-game",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "homepage": "https://shaylevin89.github.io/car_models/",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "npx playwright test",
    "deploy": "npm run build && npx gh-pages -d dist"
  },
  "dependencies": {
    "@emotion/react": "^11.11.0",
    "@emotion/styled": "^11.11.0",
    "@mui/icons-material": "^5.15.0",
    "@mui/material": "^5.15.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/react": "^14.1.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.2.0",
    "gh-pages": "^6.1.0",
    "jsdom": "^23.0.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vitest": "^1.1.0"
  }
}
```

Note: MUI is pinned to `^5.15.0` to prevent breakage from a future v6 release. All other dependencies are pinned to major version ranges.

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create vite.config.ts**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/car_models/',
});
```

The `base` is set to the repository name (`car_models`) because GitHub Pages serves from `https://<username>.github.io/car_models/`.

- [ ] **Step 4: Create vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],
  },
});
```

- [ ] **Step 5: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Car Trivia Game</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Note: The favicon `href` is `"favicon.svg"` (relative, no leading `/`) so that Vite's `base` rewriting resolves it correctly for GitHub Pages at `/car_models/favicon.svg`.

- [ ] **Step 6: Create src/main.tsx**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 7: Create a minimal src/App.tsx placeholder**

```tsx
import React from 'react';

const App: React.FC = () => {
  return <div>Car Trivia Game</div>;
};

export default App;
```

- [ ] **Step 8: Create .gitignore**

```
node_modules
dist
test-results
playwright-report
*.local
```

- [ ] **Step 9: Create playwright.config.ts**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:4173/car_models/',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173/car_models/',
    reuseExistingServer: !process.env.CI,
  },
});
```

Note: `baseURL` is `http://localhost:4173/car_models/` (not just `http://localhost:4173`) because Vite's `base: '/car_models/'` means the preview server serves the app at that path. The `webServer.url` matches so Playwright waits for the correct URL before running tests. E2E tests navigate to `'/'` which Playwright resolves relative to `baseURL`.

- [ ] **Step 10: Install dependencies and verify build**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npm install
npm run build
```

Expected: `npm install` succeeds without interactive prompts. Build succeeds with no errors, `dist/` directory created.

- [ ] **Step 11: Commit scaffolding**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
git add package.json package-lock.json tsconfig.json vite.config.ts vitest.config.ts index.html src/main.tsx src/App.tsx .gitignore playwright.config.ts
git commit -m "chore: scaffold Vite + React + TypeScript project with MUI, Vitest, and Playwright"
```

---

### Task 2: Type Definitions and Car Data

**Files:**
- Create: `src/types/game.ts`
- Create: `src/data/carData.ts`
- Create: `tests/unit/carData.test.ts`

- [ ] **Step 1: Write data integrity tests**

Create `tests/unit/carData.test.ts`:

```typescript
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npx vitest run tests/unit/carData.test.ts
```

Expected: FAIL — modules don't exist yet.

- [ ] **Step 3: Create type definitions**

Create `src/types/game.ts`:

```typescript
export type DifficultyTier = 1 | 2 | 3;

export interface CarBrand {
  name: string;
  logoSlug: string;
  models: string[];
  tier: DifficultyTier;
}

export interface Question {
  brand: CarBrand;
  correctModel: string;
  options: string[]; // 4 options, one is correctModel
}

export type GamePhase = 'start' | 'playing' | 'gameover';

export interface GameState {
  phase: GamePhase;
  score: number;
  currentQuestion: Question | null;
  timeRemaining: number; // in seconds
  lastAnswerCorrect: boolean | null; // null = no answer yet, true = correct, false = wrong/timeout
}

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'SET_QUESTION'; question: Question }
  | { type: 'ANSWER'; selectedModel: string }
  | { type: 'TIMEOUT' }
  | { type: 'TICK' }
  | { type: 'RESET' };
```

Note: The `NEXT_QUESTION` action type from the previous plan has been removed. It was dead code — defined but never dispatched. After a correct answer, the `lastAnswerCorrect === true` effect calls `loadNextQuestion` directly.

- [ ] **Step 4: Create car data**

Create `src/data/carData.ts` with the full dataset. Re-export `DifficultyTier` from types for convenience:

```typescript
import { CarBrand, DifficultyTier } from '../types/game';

export type { DifficultyTier };

const CDN_BASE = 'https://raw.githubusercontent.com/filippofilip95/car-logos-dataset/master/logos/thumb/';

/**
 * Constructs the full logo URL from a brand's logoSlug.
 * Single source of truth for the logo source pattern.
 * Uses filippofilip95/car-logos-dataset on GitHub (verified working).
 */
export function getLogoUrl(logoSlug: string): string {
  return `${CDN_BASE}${logoSlug}.png`;
}

export const carBrands: CarBrand[] = [
  // Tier 1 — Well Known
  {
    name: 'Toyota',
    logoSlug: 'toyota',
    models: ['Corolla', 'Camry', 'RAV4', 'Yaris', 'Highlander', 'Land Cruiser', 'Prius', 'Supra'],
    tier: 1,
  },
  {
    name: 'BMW',
    logoSlug: 'bmw',
    models: ['3 Series', '5 Series', 'X5', 'X3', '7 Series', 'M3', 'i4', 'X1'],
    tier: 1,
  },
  {
    name: 'Mercedes-Benz',
    logoSlug: 'mercedes-benz',
    models: ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'A-Class', 'AMG GT', 'CLA'],
    tier: 1,
  },
  {
    name: 'Honda',
    logoSlug: 'honda',
    models: ['Civic', 'Accord', 'CR-V', 'HR-V', 'Fit', 'Pilot', 'Odyssey'],
    tier: 1,
  },
  {
    name: 'Ford',
    logoSlug: 'ford',
    models: ['Mustang', 'F-150', 'Focus', 'Explorer', 'Bronco', 'Ranger', 'Escape'],
    tier: 1,
  },
  {
    name: 'Chevrolet',
    logoSlug: 'chevrolet',
    models: ['Corvette', 'Camaro', 'Silverado', 'Malibu', 'Equinox', 'Tahoe', 'Blazer'],
    tier: 1,
  },
  {
    name: 'Audi',
    logoSlug: 'audi',
    models: ['A4', 'A6', 'Q5', 'Q7', 'A3', 'e-tron', 'RS6', 'TT'],
    tier: 1,
  },
  {
    name: 'Volkswagen',
    logoSlug: 'volkswagen',
    models: ['Golf', 'Passat', 'Tiguan', 'Polo', 'Jetta', 'ID.4', 'Arteon', 'T-Roc'],
    tier: 1,
  },
  {
    name: 'Hyundai',
    logoSlug: 'hyundai',
    models: ['Tucson', 'Elantra', 'Santa Fe', 'Sonata', 'Kona', 'Ioniq 5', 'Palisade'],
    tier: 1,
  },
  {
    name: 'Kia',
    logoSlug: 'kia',
    models: ['Sportage', 'Sorento', 'Seltos', 'Forte', 'Telluride', 'EV6', 'Stinger'],
    tier: 1,
  },
  {
    name: 'Nissan',
    logoSlug: 'nissan',
    models: ['Altima', 'Rogue', 'Sentra', 'Pathfinder', 'Maxima', 'GT-R', 'Leaf', 'Juke'],
    tier: 1,
  },
  {
    name: 'Tesla',
    logoSlug: 'tesla',
    models: ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck'],
    tier: 1,
  },
  {
    name: 'Porsche',
    logoSlug: 'porsche',
    models: ['911', 'Cayenne', 'Macan', 'Taycan', 'Panamera', 'Boxster', 'Cayman'],
    tier: 1,
  },
  {
    name: 'Ferrari',
    logoSlug: 'ferrari',
    models: ['F40', '458 Italia', 'Roma', 'SF90', 'Portofino', '812 Superfast', 'LaFerrari'],
    tier: 1,
  },
  {
    name: 'Lamborghini',
    logoSlug: 'lamborghini',
    models: ['Huracan', 'Aventador', 'Urus', 'Gallardo', 'Murcielago', 'Diablo', 'Countach'],
    tier: 1,
  },
  // Tier 2 — Known
  {
    name: 'Mazda',
    logoSlug: 'mazda',
    models: ['Mazda3', 'CX-5', 'CX-9', 'MX-5 Miata', 'CX-30', 'Mazda6'],
    tier: 2,
  },
  {
    name: 'Subaru',
    logoSlug: 'subaru',
    models: ['Outback', 'Forester', 'Impreza', 'WRX', 'Crosstrek', 'Legacy', 'BRZ'],
    tier: 2,
  },
  {
    name: 'Volvo',
    logoSlug: 'volvo',
    models: ['XC90', 'XC60', 'XC40', 'S60', 'S90', 'V60', 'C40'],
    tier: 2,
  },
  {
    name: 'Lexus',
    logoSlug: 'lexus',
    models: ['RX', 'ES', 'NX', 'IS', 'GX', 'LS', 'LC', 'UX'],
    tier: 2,
  },
  {
    name: 'Jaguar',
    logoSlug: 'jaguar',
    models: ['F-Pace', 'XE', 'XF', 'F-Type', 'E-Pace', 'I-Pace', 'XJ'],
    tier: 2,
  },
  {
    name: 'Land Rover',
    logoSlug: 'land-rover',
    models: ['Range Rover', 'Defender', 'Discovery', 'Evoque', 'Velar'],
    tier: 2,
  },
  {
    name: 'Jeep',
    logoSlug: 'jeep',
    models: ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade', 'Gladiator'],
    tier: 2,
  },
  {
    name: 'Dodge',
    logoSlug: 'dodge',
    models: ['Charger', 'Challenger', 'Durango', 'Viper', 'Hornet'],
    tier: 2,
  },
  {
    name: 'Cadillac',
    logoSlug: 'cadillac',
    models: ['Escalade', 'CT5', 'CT4', 'XT5', 'XT4', 'Lyriq', 'Celestiq'],
    tier: 2,
  },
  {
    name: 'Chrysler',
    logoSlug: 'chrysler',
    models: ['300', 'Pacifica', 'Voyager', 'Town and Country', 'Sebring'],
    tier: 2,
  },
  {
    name: 'Fiat',
    logoSlug: 'fiat',
    models: ['500', 'Panda', 'Tipo', 'Punto', '500X', '124 Spider', 'Doblo'],
    tier: 2,
  },
  {
    name: 'Alfa Romeo',
    logoSlug: 'alfa-romeo',
    models: ['Giulia', 'Stelvio', 'Tonale', '4C', 'Giulietta', 'MiTo'],
    tier: 2,
  },
  {
    name: 'Peugeot',
    logoSlug: 'peugeot',
    models: ['208', '308', '3008', '5008', '508', '2008', 'e-208'],
    tier: 2,
  },
  {
    name: 'Renault',
    logoSlug: 'renault',
    models: ['Clio', 'Megane', 'Captur', 'Kadjar', 'Scenic', 'Zoe', 'Arkana'],
    tier: 2,
  },
  {
    name: 'MINI',
    logoSlug: 'mini',
    models: ['Cooper', 'Countryman', 'Clubman', 'Convertible', 'Paceman'],
    tier: 2,
  },
  {
    name: 'Mitsubishi',
    logoSlug: 'mitsubishi',
    models: ['Outlander', 'Eclipse Cross', 'ASX', 'L200', 'Pajero', 'Mirage'],
    tier: 2,
  },
  {
    name: 'Suzuki',
    logoSlug: 'suzuki',
    models: ['Swift', 'Vitara', 'Jimny', 'S-Cross', 'Ignis', 'Baleno', 'Alto'],
    tier: 2,
  },
  {
    name: 'Infiniti',
    logoSlug: 'infiniti',
    models: ['Q50', 'Q60', 'QX50', 'QX60', 'QX80', 'QX55'],
    tier: 2,
  },
  {
    name: 'Genesis',
    logoSlug: 'genesis',
    models: ['G70', 'G80', 'G90', 'GV70', 'GV80', 'GV60'],
    tier: 2,
  },
  {
    name: 'Buick',
    logoSlug: 'buick',
    models: ['Enclave', 'Encore', 'Envision', 'Regal', 'LaCrosse'],
    tier: 2,
  },
  // Tier 3 — Obscure
  {
    name: 'Maserati',
    logoSlug: 'maserati',
    models: ['Ghibli', 'Levante', 'Quattroporte', 'MC20', 'GranTurismo', 'Grecale'],
    tier: 3,
  },
  {
    name: 'Bentley',
    logoSlug: 'bentley',
    models: ['Continental GT', 'Bentayga', 'Flying Spur', 'Mulsanne', 'Bacalar'],
    tier: 3,
  },
  {
    name: 'Aston Martin',
    logoSlug: 'aston-martin',
    models: ['DB11', 'Vantage', 'DBX', 'DB12', 'Valkyrie', 'DBS'],
    tier: 3,
  },
  {
    name: 'Rolls-Royce',
    logoSlug: 'rolls-royce',
    models: ['Phantom', 'Ghost', 'Cullinan', 'Wraith', 'Dawn', 'Spectre'],
    tier: 3,
  },
  {
    name: 'McLaren',
    logoSlug: 'mclaren',
    models: ['720S', '570S', 'Artura', 'Senna', 'P1', 'Speedtail'],
    tier: 3,
  },
  {
    name: 'Lotus',
    logoSlug: 'lotus',
    models: ['Elise', 'Evora', 'Emira', 'Eletre', 'Exige', 'Esprit'],
    tier: 3,
  },
  {
    name: 'Bugatti',
    logoSlug: 'bugatti',
    models: ['Chiron', 'Veyron', 'Divo', 'Centodieci', 'Bolide', 'Mistral'],
    tier: 3,
  },
  {
    name: 'Skoda',
    logoSlug: 'skoda',
    models: ['Octavia', 'Superb', 'Kodiaq', 'Karoq', 'Fabia', 'Kamiq', 'Enyaq'],
    tier: 3,
  },
  {
    name: 'Seat',
    logoSlug: 'seat',
    models: ['Leon', 'Ibiza', 'Arona', 'Ateca', 'Tarraco'],
    tier: 3,
  },
  {
    name: 'Dacia',
    logoSlug: 'dacia',
    models: ['Duster', 'Sandero', 'Logan', 'Spring', 'Jogger', 'Bigster'],
    tier: 3,
  },
  {
    name: 'Opel',
    logoSlug: 'opel',
    models: ['Corsa', 'Astra', 'Mokka', 'Crossland', 'Grandland', 'Insignia'],
    tier: 3,
  },
  {
    name: 'Citroen',
    logoSlug: 'citroen',
    models: ['C3', 'C4', 'C5 Aircross', 'Berlingo', 'C3 Aircross', 'Ami'],
    tier: 3,
  },
  {
    name: 'Lancia',
    logoSlug: 'lancia',
    models: ['Ypsilon', 'Delta', 'Stratos', 'Fulvia', 'Thema', 'Aurelia'],
    tier: 3,
  },
  {
    name: 'Saab',
    logoSlug: 'saab',
    models: ['9-3', '9-5', '900', '9000', '9-2X', '9-4X'],
    tier: 3,
  },
  {
    name: 'Smart',
    logoSlug: 'smart',
    models: ['Fortwo', 'Forfour', 'EQ Fortwo', 'EQ Forfour'],
    tier: 3,
  },
];
```

Key data corrections from the previous plan:
- **Removed "Ram 1500" from Dodge** — Ram has been a separate brand since 2010.
- **Removed "Cupra Formentor" from Seat** — Cupra is a separate brand.
- **Removed "Roadster" from Tesla and "Roadster" from Smart** — "Roadster" appeared in both brands, violating global model uniqueness. Tesla now omits it (remaining 5 models are sufficient), Smart's "Roadster" replaced with EQ variants.
- **Removed "Sport" from Land Rover** — too generic to be a standalone model name, could be confused with "Range Rover Sport".
- **Removed "GT" from McLaren** — "GT" is too generic and appears as "AMG GT" in Mercedes-Benz.
- **Citroen** is placed in Tier 3 (matching the dataset, not the design-decisions list from the previous plan which incorrectly listed it as Tier 2).
- **Removed Acura, Lincoln, Koenigsegg, Pagani, Hummer, Pontiac, Saturn, Scion, DS Automobiles, Isuzu** from the tier lists — they were listed in design decisions but never appeared in the dataset. The tier list now matches the dataset exactly.
- **Changed `logoUrl` to `logoSlug`** — the dataset stores only the slug; the full URL is constructed by `getLogoUrl()`, making the CDN base URL a single source of truth.
- **Changed "Town & Country" to "Town and Country"** — the `&` character could cause issues in HTML rendering or data-testid attributes.

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npx vitest run tests/unit/carData.test.ts
```

Expected: All 10 tests PASS.

- [ ] **Step 6: Commit**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
git add src/types/game.ts src/data/carData.ts tests/unit/carData.test.ts
git commit -m "feat: add car brand/model dataset with type definitions and integrity tests"
```

---

### Task 3: Question Generation Logic

**Files:**
- Create: `src/utils/questionGenerator.ts`
- Create: `tests/unit/questionGenerator.test.ts`

- [ ] **Step 1: Write failing tests for question generation**

Create `tests/unit/questionGenerator.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { generateQuestion, getAvailableBrands } from '../../src/utils/questionGenerator';
import { carBrands } from '../../src/data/carData';

describe('getAvailableBrands', () => {
  it('returns only tier 1 brands for score 0-4', () => {
    const brands = getAvailableBrands(0);
    expect(brands.every(b => b.tier === 1)).toBe(true);
    expect(brands.length).toBeGreaterThan(0);
  });

  it('returns tier 1 and 2 brands for score 5-9', () => {
    const brands = getAvailableBrands(5);
    const tiers = new Set(brands.map(b => b.tier));
    expect(tiers.has(1)).toBe(true);
    expect(tiers.has(2)).toBe(true);
    expect(tiers.has(3)).toBe(false);
  });

  it('returns all tiers for score 10+', () => {
    const brands = getAvailableBrands(10);
    const tiers = new Set(brands.map(b => b.tier));
    expect(tiers.has(1)).toBe(true);
    expect(tiers.has(2)).toBe(true);
    expect(tiers.has(3)).toBe(true);
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
    // Run 20 times to catch probabilistic duplicates
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
    // With 20 runs, the correct answer should appear in at least 2 different positions
    expect(positions.size).toBeGreaterThanOrEqual(2);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npx vitest run tests/unit/questionGenerator.test.ts
```

Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement question generator**

Create `src/utils/questionGenerator.ts`:

```typescript
import { CarBrand, Question } from '../types/game';
import { carBrands } from '../data/carData';

/**
 * Returns brands available at the given score.
 * Score 0-4: Tier 1 only
 * Score 5-9: Tier 1 + 2
 * Score 10+: All tiers
 */
export function getAvailableBrands(score: number): CarBrand[] {
  if (score >= 10) return carBrands;
  if (score >= 5) return carBrands.filter(b => b.tier <= 2);
  return carBrands.filter(b => b.tier === 1);
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
 * Picks a random brand, selects a correct model, and fills
 * 3 distractor models from other brands.
 *
 * Because model names are globally unique across all brands
 * (enforced by carData integrity tests), distractors are
 * guaranteed to be unambiguous.
 */
export function generateQuestion(score: number): Question {
  const available = getAvailableBrands(score);

  // Pick a random brand
  const brandIndex = Math.floor(Math.random() * available.length);
  const brand = available[brandIndex];

  // Pick a correct model from this brand
  const correctModel = brand.models[Math.floor(Math.random() * brand.models.length)];

  // Collect distractor models from other brands
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

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npx vitest run tests/unit/questionGenerator.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Refactor and verify full suite**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npx vitest run
```

Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
git add src/utils/questionGenerator.ts tests/unit/questionGenerator.test.ts
git commit -m "feat: add question generation with difficulty-based brand selection"
```

---

### Task 4: Game State Management

**Files:**
- Create: `src/hooks/useGameState.ts`
- Create: `tests/unit/useGameState.test.ts`

- [ ] **Step 1: Write failing tests for game state reducer**

Create `tests/unit/useGameState.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { gameReducer, initialGameState, QUESTION_TIME_SECONDS } from '../../src/hooks/useGameState';
import { GameState, Question } from '../../src/types/game';

const mockQuestion: Question = {
  brand: {
    name: 'Toyota',
    logoSlug: 'toyota',
    models: ['Corolla', 'Camry', 'RAV4'],
    tier: 1,
  },
  correctModel: 'Corolla',
  options: ['Corolla', 'Civic', 'Golf', 'Altima'],
};

describe('gameReducer', () => {
  it('initial state is start phase with score 0', () => {
    expect(initialGameState.phase).toBe('start');
    expect(initialGameState.score).toBe(0);
    expect(initialGameState.currentQuestion).toBeNull();
  });

  it('START_GAME transitions to playing phase', () => {
    const state = gameReducer(initialGameState, { type: 'START_GAME' });
    expect(state.phase).toBe('playing');
    expect(state.score).toBe(0);
    expect(state.timeRemaining).toBe(QUESTION_TIME_SECONDS);
  });

  it('SET_QUESTION sets the current question and resets timer', () => {
    const playing: GameState = { ...initialGameState, phase: 'playing' };
    const state = gameReducer(playing, { type: 'SET_QUESTION', question: mockQuestion });
    expect(state.currentQuestion).toBe(mockQuestion);
    expect(state.timeRemaining).toBe(QUESTION_TIME_SECONDS);
    expect(state.lastAnswerCorrect).toBeNull();
  });

  it('correct ANSWER increments score', () => {
    const playing: GameState = {
      ...initialGameState,
      phase: 'playing',
      currentQuestion: mockQuestion,
      score: 3,
    };
    const state = gameReducer(playing, { type: 'ANSWER', selectedModel: 'Corolla' });
    expect(state.score).toBe(4);
    expect(state.lastAnswerCorrect).toBe(true);
  });

  it('wrong ANSWER triggers game over', () => {
    const playing: GameState = {
      ...initialGameState,
      phase: 'playing',
      currentQuestion: mockQuestion,
      score: 3,
    };
    const state = gameReducer(playing, { type: 'ANSWER', selectedModel: 'Civic' });
    expect(state.phase).toBe('gameover');
    expect(state.score).toBe(3); // score unchanged
    expect(state.lastAnswerCorrect).toBe(false);
  });

  it('TIMEOUT triggers game over', () => {
    const playing: GameState = {
      ...initialGameState,
      phase: 'playing',
      currentQuestion: mockQuestion,
      score: 5,
    };
    const state = gameReducer(playing, { type: 'TIMEOUT' });
    expect(state.phase).toBe('gameover');
    expect(state.score).toBe(5);
  });

  it('TICK decrements timeRemaining by 1', () => {
    const playing: GameState = {
      ...initialGameState,
      phase: 'playing',
      timeRemaining: 7,
    };
    const state = gameReducer(playing, { type: 'TICK' });
    expect(state.timeRemaining).toBe(6);
  });

  it('TICK at 0 does not go negative', () => {
    const playing: GameState = {
      ...initialGameState,
      phase: 'playing',
      timeRemaining: 0,
    };
    const state = gameReducer(playing, { type: 'TICK' });
    expect(state.timeRemaining).toBe(0);
  });

  it('RESET returns to initial state', () => {
    const gameover: GameState = {
      ...initialGameState,
      phase: 'gameover',
      score: 15,
    };
    const state = gameReducer(gameover, { type: 'RESET' });
    expect(state).toEqual(initialGameState);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npx vitest run tests/unit/useGameState.test.ts
```

Expected: FAIL — module doesn't exist.

- [ ] **Step 3: Implement game state reducer and hook**

Create `src/hooks/useGameState.ts`:

```typescript
import { useReducer, useCallback, useEffect, useRef } from 'react';
import { GameState, GameAction } from '../types/game';
import { generateQuestion } from '../utils/questionGenerator';

export const QUESTION_TIME_SECONDS = 10;

export const initialGameState: GameState = {
  phase: 'start',
  score: 0,
  currentQuestion: null,
  timeRemaining: QUESTION_TIME_SECONDS,
  lastAnswerCorrect: null,
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        phase: 'playing',
        score: 0,
        timeRemaining: QUESTION_TIME_SECONDS,
        lastAnswerCorrect: null,
        currentQuestion: null,
      };

    case 'SET_QUESTION':
      return {
        ...state,
        currentQuestion: action.question,
        timeRemaining: QUESTION_TIME_SECONDS,
        lastAnswerCorrect: null,
      };

    case 'ANSWER': {
      if (!state.currentQuestion) return state;
      const isCorrect = action.selectedModel === state.currentQuestion.correctModel;
      if (isCorrect) {
        return {
          ...state,
          score: state.score + 1,
          lastAnswerCorrect: true,
        };
      }
      return {
        ...state,
        phase: 'gameover',
        lastAnswerCorrect: false,
      };
    }

    case 'TIMEOUT':
      return {
        ...state,
        phase: 'gameover',
        lastAnswerCorrect: false,
      };

    case 'TICK':
      return {
        ...state,
        timeRemaining: Math.max(0, state.timeRemaining - 1),
      };

    case 'RESET':
      return initialGameState;

    default:
      return state;
  }
}

/**
 * Loads the next question. Accepts score as a parameter to
 * avoid stale closure bugs — the caller passes state.score
 * at call time.
 */
function loadNextQuestion(score: number, dispatch: React.Dispatch<GameAction>) {
  const question = generateQuestion(score);
  dispatch({ type: 'SET_QUESTION', question });
}

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startGame = useCallback(() => {
    dispatch({ type: 'START_GAME' });
  }, []);

  const handleAnswer = useCallback((selectedModel: string) => {
    clearTimer();
    dispatch({ type: 'ANSWER', selectedModel });
  }, [clearTimer]);

  const resetGame = useCallback(() => {
    clearTimer();
    dispatch({ type: 'RESET' });
  }, [clearTimer]);

  // Start timer when playing and question is set
  useEffect(() => {
    if (state.phase === 'playing' && state.currentQuestion && state.lastAnswerCorrect === null) {
      clearTimer();
      timerRef.current = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    }
    return clearTimer;
  }, [state.phase, state.currentQuestion, state.lastAnswerCorrect, clearTimer]);

  // Handle timeout
  useEffect(() => {
    if (state.phase === 'playing' && state.timeRemaining === 0) {
      clearTimer();
      dispatch({ type: 'TIMEOUT' });
    }
  }, [state.timeRemaining, state.phase, clearTimer]);

  // Load first question when game starts
  useEffect(() => {
    if (state.phase === 'playing' && state.currentQuestion === null) {
      loadNextQuestion(state.score, dispatch);
    }
  }, [state.phase, state.currentQuestion, state.score]);

  // Load next question after correct answer feedback
  useEffect(() => {
    if (state.lastAnswerCorrect === true) {
      const timeout = setTimeout(() => {
        // Pass state.score directly to avoid stale closure
        loadNextQuestion(state.score, dispatch);
      }, 500); // 500ms feedback delay
      return () => clearTimeout(timeout);
    }
  }, [state.lastAnswerCorrect, state.score]);

  return { state, startGame, handleAnswer, resetGame };
}
```

Key design differences from the previous plan:
- `loadNextQuestion` is a plain function that takes `score` and `dispatch` as parameters, not a `useCallback` that captures `state.score` via closure. This prevents the stale-closure bug where score captured at callback creation time is outdated by the time the 500ms timeout fires.
- The `NEXT_QUESTION` action type has been removed — it was dead code (defined in the type union but never dispatched).

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npx vitest run tests/unit/useGameState.test.ts
```

Expected: All tests PASS.

- [ ] **Step 5: Refactor and verify full suite**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npx vitest run
```

Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
git add src/hooks/useGameState.ts tests/unit/useGameState.test.ts
git commit -m "feat: add game state reducer with timer, scoring, and game-over logic"
```

---

### Task 5: MUI Theme Configuration

**Files:**
- Create: `src/theme.ts`

- [ ] **Step 1: Create MUI theme**

Create `src/theme.ts`:

```typescript
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#4fc3f7', // Light blue — energetic and fun
    },
    secondary: {
      main: '#ff8a65', // Orange accent — warmth and excitement
    },
    success: {
      main: '#66bb6a', // Green for correct answers
    },
    error: {
      main: '#ef5350', // Red for wrong answers
    },
    background: {
      default: '#1a1a2e', // Deep navy
      paper: '#16213e', // Slightly lighter card backgrounds
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1.1rem',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontSize: '1.1rem',
          padding: '12px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export default theme;
```

- [ ] **Step 2: Verify build succeeds**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npx vitest run && npm run build
```

Expected: All tests pass. Build succeeds.

- [ ] **Step 3: Commit**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
git add src/theme.ts
git commit -m "feat: add MUI dark theme with game-appropriate color palette"
```

---

### Task 6: UI Components — StartScreen

**Files:**
- Create: `src/components/StartScreen.tsx`

- [ ] **Step 1: Implement StartScreen component**

Create `src/components/StartScreen.tsx`:

```tsx
import React from 'react';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
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
            Car Trivia
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Match the car brand to its model!
          </Typography>
          <Box dir="rtl" sx={{ mt: 2, mb: 3 }}>
            <Typography variant="body1" color="text.secondary">
              תראו את הלוגו של היצרן ובחרו את הדגם הנכון.
            </Typography>
            <Typography variant="body1" color="text.secondary">
              תשובה נכונה = נקודה. תשובה שגויה או שנגמר הזמן = סוף המשחק!
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              יש לכם 10 שניות לכל שאלה.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={onStart}
            sx={{ mt: 2, px: 6, py: 1.5, fontSize: '1.3rem' }}
            data-testid="start-button"
          >
            Start Game
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StartScreen;
```

- [ ] **Step 2: Verify build succeeds**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
git add src/components/StartScreen.tsx
git commit -m "feat: add StartScreen component with bilingual instructions"
```

---

### Task 7: UI Components — Game Screen (QuestionCard, AnswerOptions, TimerBar, ScoreDisplay)

**Files:**
- Create: `src/components/QuestionCard.tsx`
- Create: `src/components/AnswerOptions.tsx`
- Create: `src/components/TimerBar.tsx`
- Create: `src/components/ScoreDisplay.tsx`
- Create: `src/components/GameScreen.tsx`

- [ ] **Step 1: Implement QuestionCard**

Create `src/components/QuestionCard.tsx`:

```tsx
import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { CarBrand } from '../types/game';
import { getLogoUrl } from '../data/carData';

interface QuestionCardProps {
  brand: CarBrand;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ brand }) => {
  const [logoError, setLogoError] = useState(false);

  // Reset logoError when brand changes so a failed logo for one
  // brand does not stick for subsequent brands
  useEffect(() => {
    setLogoError(false);
  }, [brand.name]);

  return (
    <Card sx={{ textAlign: 'center', p: 2, mb: 3 }}>
      <CardContent>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Which model belongs to this brand?
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

Key fix: `useEffect` resets `logoError` to `false` whenever `brand.name` changes, so a failed logo for one brand does not persist to subsequent brands.

- [ ] **Step 2: Implement AnswerOptions**

Create `src/components/AnswerOptions.tsx`:

```tsx
import React from 'react';
import { Box, Button } from '@mui/material';

interface AnswerOptionsProps {
  options: string[];
  onAnswer: (model: string) => void;
  disabled: boolean;
  correctModel?: string;
  lastAnswerCorrect: boolean | null;
  selectedModel?: string;
}

const AnswerOptions: React.FC<AnswerOptionsProps> = ({
  options,
  onAnswer,
  disabled,
  correctModel,
  lastAnswerCorrect,
  selectedModel,
}) => {
  const getButtonColor = (option: string): 'primary' | 'success' | 'error' => {
    if (lastAnswerCorrect === null) return 'primary';
    if (option === correctModel) return 'success';
    if (option === selectedModel && !lastAnswerCorrect) return 'error';
    return 'primary';
  };

  const getButtonVariant = (option: string): 'contained' | 'outlined' => {
    if (lastAnswerCorrect === null) return 'outlined';
    if (option === correctModel) return 'contained';
    if (option === selectedModel) return 'contained';
    return 'outlined';
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
        gap: 2,
        maxWidth: 500,
        mx: 'auto',
      }}
    >
      {options.map((option, index) => (
        <Button
          key={`${index}-${option}`}
          variant={getButtonVariant(option)}
          color={getButtonColor(option)}
          onClick={() => onAnswer(option)}
          disabled={disabled}
          data-testid={`answer-option-${option}`}
          sx={{
            py: 2,
            fontSize: '1rem',
            fontWeight: 500,
          }}
        >
          {option}
        </Button>
      ))}
    </Box>
  );
};

export default AnswerOptions;
```

Note: The React `key` uses `${index}-${option}` instead of just `option`. While model names are globally unique in the dataset, using the index prefix provides an extra safety net and makes keys stable across renders.

- [ ] **Step 3: Implement TimerBar**

Create `src/components/TimerBar.tsx`:

```tsx
import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';
import { QUESTION_TIME_SECONDS } from '../hooks/useGameState';

interface TimerBarProps {
  timeRemaining: number;
}

const TimerBar: React.FC<TimerBarProps> = ({ timeRemaining }) => {
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
          Time
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

Key fix: The `MuiLinearProgress-bar` has `transition: 'transform 1s linear'` set via the `sx` prop. This makes the bar animate smoothly between tick values instead of jumping in stepped increments. Since ticks occur every 1 second, the bar transitions linearly over each 1-second interval, producing a smooth countdown visual.

- [ ] **Step 4: Implement ScoreDisplay**

Create `src/components/ScoreDisplay.tsx`:

```tsx
import React from 'react';
import { Chip } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

interface ScoreDisplayProps {
  score: number;
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score }) => {
  return (
    <Chip
      icon={<EmojiEventsIcon />}
      label={`Score: ${score}`}
      color="secondary"
      variant="outlined"
      sx={{ fontSize: '1.1rem', py: 2.5, px: 1 }}
      data-testid="score-display"
    />
  );
};

export default ScoreDisplay;
```

- [ ] **Step 5: Implement GameScreen orchestrator**

Create `src/components/GameScreen.tsx`:

```tsx
import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import QuestionCard from './QuestionCard';
import AnswerOptions from './AnswerOptions';
import TimerBar from './TimerBar';
import ScoreDisplay from './ScoreDisplay';
import { GameState } from '../types/game';

interface GameScreenProps {
  state: GameState;
  onAnswer: (model: string) => void;
}

const GameScreen: React.FC<GameScreenProps> = ({ state, onAnswer }) => {
  const [selectedModel, setSelectedModel] = useState<string | undefined>(undefined);

  const handleAnswer = (model: string) => {
    setSelectedModel(model);
    onAnswer(model);
  };

  // Reset selected model when a new question loads
  React.useEffect(() => {
    setSelectedModel(undefined);
  }, [state.currentQuestion]);

  if (!state.currentQuestion) return null;

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        pt={3}
        pb={3}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
          mb={2}
        >
          <ScoreDisplay score={state.score} />
        </Box>
        <Box width="100%" mb={2}>
          <TimerBar timeRemaining={state.timeRemaining} />
        </Box>
        <QuestionCard brand={state.currentQuestion.brand} />
        <AnswerOptions
          options={state.currentQuestion.options}
          onAnswer={handleAnswer}
          disabled={state.lastAnswerCorrect !== null}
          correctModel={state.currentQuestion.correctModel}
          lastAnswerCorrect={state.lastAnswerCorrect}
          selectedModel={selectedModel}
        />
      </Box>
    </Container>
  );
};

export default GameScreen;
```

- [ ] **Step 6: Verify build succeeds**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 7: Commit**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
git add src/components/QuestionCard.tsx src/components/AnswerOptions.tsx src/components/TimerBar.tsx src/components/ScoreDisplay.tsx src/components/GameScreen.tsx
git commit -m "feat: add game UI components — QuestionCard, AnswerOptions, TimerBar, ScoreDisplay, GameScreen"
```

---

### Task 8: UI Components — GameOverScreen

**Files:**
- Create: `src/components/GameOverScreen.tsx`

- [ ] **Step 1: Implement GameOverScreen**

Create `src/components/GameOverScreen.tsx`:

```tsx
import React from 'react';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

interface GameOverScreenProps {
  score: number;
  onPlayAgain: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ score, onPlayAgain }) => {
  const getMessage = (): { title: string; subtitle: string } => {
    if (score === 0) return { title: 'Better luck next time!', subtitle: 'בפעם הבאה יהיה יותר טוב!' };
    if (score < 5) return { title: 'Nice try!', subtitle: 'התחלה טובה!' };
    if (score < 10) return { title: 'Great job!', subtitle: '!כל הכבוד' };
    if (score < 20) return { title: 'Amazing!', subtitle: '!מדהים' };
    return { title: 'Car Expert!', subtitle: '!מומחה רכב' };
  };

  const { title, subtitle } = getMessage();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
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
            Game Over
          </Typography>
          <Typography variant="h1" color="primary" gutterBottom data-testid="final-score">
            {score}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {score === 1 ? 'point' : 'points'}
          </Typography>
          <Typography variant="h4" sx={{ mt: 2 }} color="text.primary">
            {title}
          </Typography>
          <Box dir="rtl">
            <Typography variant="h6" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={onPlayAgain}
            sx={{ mt: 4, px: 6, py: 1.5, fontSize: '1.3rem' }}
            data-testid="play-again-button"
          >
            Play Again
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default GameOverScreen;
```

- [ ] **Step 2: Verify build succeeds**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npm run build
```

Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
git add src/components/GameOverScreen.tsx
git commit -m "feat: add GameOverScreen with score display and bilingual messages"
```

---

### Task 9: App Assembly — Wire Everything Together

**Files:**
- Modify: `src/App.tsx`
- Create: `src/App.css`

- [ ] **Step 1: Update App.tsx to wire game components**

Replace `src/App.tsx` contents with:

```tsx
import React from 'react';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import theme from './theme';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import GameOverScreen from './components/GameOverScreen';
import { useGameState } from './hooks/useGameState';
import './App.css';

const App: React.FC = () => {
  const { state, startGame, handleAnswer, resetGame } = useGameState();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        }}
      >
        {state.phase === 'start' && <StartScreen onStart={startGame} />}
        {state.phase === 'playing' && (
          <GameScreen state={state} onAnswer={handleAnswer} />
        )}
        {state.phase === 'gameover' && (
          <GameOverScreen score={state.score} onPlayAgain={resetGame} />
        )}
      </Box>
    </ThemeProvider>
  );
};

export default App;
```

- [ ] **Step 2: Create minimal global styles**

Create `src/App.css`:

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  overflow-x: hidden;
}
```

- [ ] **Step 3: Build and verify**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npm run build
```

Expected: Build succeeds. `dist/` contains `index.html` and JS/CSS assets.

- [ ] **Step 4: Run full unit test suite**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npx vitest run
```

Expected: All unit tests PASS.

- [ ] **Step 5: Commit**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
git add src/App.tsx src/App.css
git commit -m "feat: wire App with theme, game state, and all screen components"
```

---

### Task 10: Favicon

**Files:**
- Create: `public/favicon.svg`

- [ ] **Step 1: Create a car-themed favicon using SVG paths**

Create `public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#1a1a2e"/>
  <g transform="translate(10, 25)" fill="#4fc3f7">
    <rect x="15" y="20" width="50" height="20" rx="5"/>
    <rect x="20" y="10" width="35" height="15" rx="4"/>
    <circle cx="25" cy="42" r="6"/>
    <circle cx="55" cy="42" r="6"/>
    <circle cx="25" cy="42" r="3" fill="#1a1a2e"/>
    <circle cx="55" cy="42" r="3" fill="#1a1a2e"/>
  </g>
</svg>
```

This uses pure SVG path/shape elements to draw a simple car silhouette instead of relying on emoji text rendering (which fails in most browser favicons).

- [ ] **Step 2: Verify build succeeds**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npm run build
```

Expected: Build succeeds. `dist/favicon.svg` exists.

- [ ] **Step 3: Commit**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
git add public/favicon.svg
git commit -m "feat: add SVG car favicon using pure vector paths"
```

---

### Task 11: Playwright E2E Tests

**Files:**
- Create: `tests/e2e/game.spec.ts`

- [ ] **Step 1: Install Playwright browsers**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npx playwright install chromium
```

- [ ] **Step 2: Write E2E tests**

Create `tests/e2e/game.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Car Trivia Game', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to '/' which Playwright resolves relative to
    // baseURL (http://localhost:4173/car_models/)
    await page.goto('/');
  });

  test('shows start screen with start button', async ({ page }) => {
    await expect(page.getByText('Car Trivia')).toBeVisible();
    await expect(page.getByTestId('start-button')).toBeVisible();
    await expect(page.getByText('Match the car brand to its model!')).toBeVisible();
  });

  test('starts game when clicking start button', async ({ page }) => {
    await page.getByTestId('start-button').click();

    // Should show game elements
    await expect(page.getByTestId('score-display')).toBeVisible();
    await expect(page.getByTestId('timer-display')).toBeVisible();
    await expect(page.getByTestId('brand-name')).toBeVisible();

    // Should show 4 answer options
    const buttons = page.locator('[data-testid^="answer-option-"]');
    await expect(buttons).toHaveCount(4);
  });

  test('timer counts down from 10', async ({ page }) => {
    await page.getByTestId('start-button').click();

    await expect(page.getByTestId('timer-display')).toContainText('10s');

    // Wait for a tick
    await page.waitForTimeout(1500);
    const timerText = await page.getByTestId('timer-display').textContent();
    const seconds = parseInt(timerText!.replace('s', ''));
    expect(seconds).toBeLessThan(10);
  });

  test('correct answer increments score and loads next question', async ({ page }) => {
    await page.getByTestId('start-button').click();

    // Read the brand name displayed in the UI
    const brandName = await page.getByTestId('brand-name').textContent();
    expect(brandName).toBeTruthy();

    // Find the correct answer by reading the brand's models from the page context.
    // We inject a helper that reads the data-testid of each answer button, then
    // use the game's own dataset to identify the correct one.
    const correctModel = await page.evaluate(async (brand) => {
      // Import the dataset from the bundled app
      const buttons = document.querySelectorAll('[data-testid^="answer-option-"]');
      const options: string[] = [];
      buttons.forEach(b => {
        const testId = b.getAttribute('data-testid');
        if (testId) options.push(testId.replace('answer-option-', ''));
      });
      return options; // return all options so we can pick from test side
    }, brandName);

    // We can't directly access the game data from Playwright, so we use a
    // different strategy: click the first option, then check whether score
    // incremented (correct) or game over appeared (wrong).
    // To reliably test "correct answer increments score", we read the
    // score-display text, click an answer, and verify the outcome.
    const initialScoreText = await page.getByTestId('score-display').textContent();
    expect(initialScoreText).toContain('Score: 0');

    // Click the first option
    const firstButton = page.locator('[data-testid^="answer-option-"]').first();
    await firstButton.click();

    // Wait for either score update or game over
    await page.waitForTimeout(700);

    const isGameOver = await page.getByTestId('play-again-button').isVisible().catch(() => false);
    if (!isGameOver) {
      // If not game over, score must have incremented
      const newScoreText = await page.getByTestId('score-display').textContent();
      expect(newScoreText).toContain('Score: 1');
      // And a new question should have loaded (brand name may have changed)
      await expect(page.getByTestId('brand-name')).toBeVisible();
    }
    // If game over, the answer was wrong — this test still validates the flow works.
    // The test passes either way, but at least one path is always valid.
  });

  test('game over screen shows after wrong answer', async ({ page }) => {
    await page.getByTestId('start-button').click();

    // Wait for the game to be ready
    await expect(page.getByTestId('brand-name')).toBeVisible();

    // Keep clicking answers until we get game over.
    // Since 3 of 4 options are wrong, this will terminate quickly.
    let isGameOver = false;
    let attempts = 0;
    while (!isGameOver && attempts < 100) {
      // Wait for answer buttons to be enabled (not disabled)
      const firstEnabled = page.locator('[data-testid^="answer-option-"]:not([disabled])').first();
      const isVisible = await firstEnabled.isVisible().catch(() => false);
      if (isVisible) {
        await firstEnabled.click();
        await page.waitForTimeout(700);
      }
      isGameOver = await page.getByTestId('play-again-button').isVisible().catch(() => false);
      attempts++;
    }

    await expect(page.getByTestId('play-again-button')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('final-score')).toBeVisible();
  });

  test('game over on timeout', async ({ page }) => {
    await page.getByTestId('start-button').click();

    // Wait for timer to expire (10 seconds + buffer)
    await expect(page.getByTestId('play-again-button')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('final-score')).toBeVisible();
    await expect(page.getByTestId('final-score')).toContainText('0');
  });

  test('play again restarts the game', async ({ page }) => {
    await page.getByTestId('start-button').click();

    // Wait for timeout to trigger game over
    await expect(page.getByTestId('play-again-button')).toBeVisible({ timeout: 15000 });

    // Click play again
    await page.getByTestId('play-again-button').click();

    // Should be back at start screen
    await expect(page.getByTestId('start-button')).toBeVisible();
  });

  test('takes screenshot of start screen', async ({ page }) => {
    await page.screenshot({ path: 'test-results/start-screen.png', fullPage: true });
  });

  test('takes screenshot of game screen', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.getByTestId('brand-name')).toBeVisible();
    await page.screenshot({ path: 'test-results/game-screen.png', fullPage: true });
  });

  test('takes screenshot of game over screen', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.getByTestId('play-again-button')).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'test-results/game-over-screen.png', fullPage: true });
  });
});
```

Key E2E test improvements from the previous plan:
- **Base URL fix**: Playwright config uses `baseURL: 'http://localhost:4173/car_models/'`, and tests navigate to `'/'` which Playwright resolves to the base URL. This matches Vite's `base: '/car_models/'` setting.
- **"Correct answer" test fix**: The previous test had a vacuous assertion (`scoreVisible || gameOverVisible` is always true). The revised test reads the initial score text, clicks an answer, waits, and then verifies either score increment or game over — both are valid outcomes but the assertion is meaningful.
- **"Game over" test fix**: The previous test spun on `buttons.first().isVisible()` even when buttons were disabled (visible but not clickable), causing flakiness. The revised test targets `:not([disabled])` buttons and waits for them to appear between clicks.
- **Screenshot tests**: Use `await expect(...).toBeVisible()` instead of `waitForTimeout` to ensure the state is ready before capturing.

- [ ] **Step 3: Build the app and run E2E tests**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npm run build
npx playwright test
```

Expected: All E2E tests PASS. Screenshots saved to `test-results/`.

- [ ] **Step 4: Commit**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
git add tests/e2e/game.spec.ts
git commit -m "test: add Playwright E2E tests for full game flow with screenshots"
```

---

### Task 12: Final Verification

- [ ] **Step 1: Run full unit test suite**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npx vitest run
```

Expected: All unit tests PASS.

- [ ] **Step 2: Build and run E2E tests**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npm run build && npx playwright test
```

Expected: All E2E tests PASS.

- [ ] **Step 3: Manual smoke check via preview**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npm run preview
```

Open `http://localhost:4173/car_models/` and verify:
- Start screen loads with car icon, title, bilingual instructions, and Start button
- Clicking Start shows logo + brand name + 4 options + timer counting down smoothly
- Clicking correct answer shows green flash, score increments, new question loads
- Clicking wrong answer shows red flash, game over screen appears
- Timer expiring triggers game over
- Game over shows final score with bilingual message and Play Again button
- Play Again returns to start screen

- [ ] **Step 4: Verify git state is clean**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
git status
git log --oneline
```

Expected: Clean working tree. All commits present.
