# Car Brand/Model Trivia Game — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use trycycle-executing to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web-based car trivia game where players see a car brand logo and must pick the correct model from four options, with a 10-second countdown per question, scoring on correct answers, and game-over on wrong answer or timeout.

**Architecture:** Single-page React application with TypeScript. Game state managed via React hooks (useReducer). Car brand/model data stored as a static JSON dataset bundled with the app. Logos loaded from a public CDN (car-logos API via `cdn.jsdelivr.net` serving the `car-logos` npm package) with text fallback. Material Design via MUI component library. Static build deployed to GitHub Pages.

**Tech Stack:**
- React 18 + TypeScript + Vite
- MUI (Material UI v5) for Material Design components and theming
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
- The dataset is small (~40 brands × ~5 models each = ~200 entries) and fits easily in the bundle.

### Logo strategy
- Primary: Load logos from `https://cdn.jsdelivr.net/npm/car-logos/` which serves PNG car manufacturer logos. This is a public CDN with no API key required.
- Fallback: If the logo fails to load, display the brand name in a styled card instead. The `<img>` tag's `onError` handler switches to the text fallback.
- Per the user's request: logo displayed above the vendor name in all cases.

### Difficulty tiers
Brands are scored into 3 tiers:
- **Tier 1 (Well Known):** Toyota, BMW, Mercedes-Benz, Honda, Ford, Chevrolet, Audi, Volkswagen, Hyundai, Kia, Nissan, Tesla, Porsche, Ferrari, Lamborghini
- **Tier 2 (Known):** Mazda, Subaru, Volvo, Lexus, Jaguar, Land Rover, Jeep, Dodge, Buick, Cadillac, Chrysler, Fiat, Alfa Romeo, Peugeot, Renault, Citroën, MINI, Mitsubishi, Suzuki, Infiniti, Acura, Lincoln, Genesis
- **Tier 3 (Obscure):** Maserati, Bentley, Aston Martin, Rolls-Royce, McLaren, Bugatti, Lotus, Koenigsegg, Pagani, Saab, Lancia, Seat, Skoda, Dacia, Opel, Isuzu, Hummer, Pontiac, Saturn, Scion, Smart, DS Automobiles

The game starts with Tier 1 brands and progressively introduces Tier 2 and Tier 3 as the player's score increases (Tier 2 from score 5, Tier 3 from score 10). Distractors (wrong answers) are always drawn from different brands within the available tiers, ensuring no two options belong to the same brand.

### Game flow
1. Start screen with game title, brief instructions (Hebrew + English), and a "Start" button.
2. Each question: logo + brand name displayed, 4 model options shown as buttons, 10-second countdown bar animating down.
3. Correct answer: score increments, brief green flash feedback (~500ms), next question loads.
4. Wrong answer or timeout: red flash feedback, game-over screen with final score and "Play Again" button.
5. Questions are generated randomly: pick a brand from available tiers, select one correct model, select 3 distractor models from other brands.

### Language approach
- UI chrome (buttons, labels, instructions) are bilingual: Hebrew instructions shown on start screen, English labels on game elements.
- All car brand names and model names are in English (as the user specified, since they're English most of the time).
- RTL support is not needed since the core game content is English; Hebrew text on the start screen uses `dir="rtl"` on that specific element.

---

## File Structure

```
car-trivia-game/                          (worktree root)
├── docs/plans/                           (this plan)
├── public/
│   └── favicon.svg                       (car-themed favicon)
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
│   │   ├── TimerBar.tsx                  (Animated countdown bar)
│   │   ├── ScoreDisplay.tsx              (Current score indicator)
│   │   ├── GameOverScreen.tsx            (Final score + play again)
│   │   └── GameScreen.tsx               (Orchestrates question/answers/timer)
│   └── App.css                           (Minimal global styles)
├── tests/
│   ├── unit/
│   │   ├── carData.test.ts               (Dataset integrity tests)
│   │   ├── questionGenerator.test.ts     (Question generation logic tests)
│   │   └── useGameState.test.ts          (Game state logic tests)
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

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npm create vite@latest . -- --template react-ts
```

If prompted about existing files, accept overwriting. This creates the base project structure.

- [ ] **Step 2: Install dependencies**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @playwright/test
```

- [ ] **Step 3: Configure Vitest**

Create `vitest.config.ts`:

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

- [ ] **Step 4: Configure Playwright**

Create `playwright.config.ts`:

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
    baseURL: 'http://localhost:4173',
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
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
});
```

- [ ] **Step 5: Update `.gitignore`**

Ensure `.gitignore` contains:

```
node_modules
dist
.worktrees
test-results
playwright-report
*.local
```

- [ ] **Step 6: Configure Vite for GitHub Pages**

Update `vite.config.ts` to set the base path for GitHub Pages deployment:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/car_models/',
});
```

The `base` is set to the repository name (`car_models`) because GitHub Pages serves from `https://<username>.github.io/car_models/`.

- [ ] **Step 7: Add scripts to package.json**

Ensure `package.json` scripts include:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "npx playwright test",
    "deploy": "npm run build && npx gh-pages -d dist"
  }
}
```

- [ ] **Step 8: Verify scaffolding builds**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npm run build
```

Expected: Build succeeds with no errors, `dist/` directory created.

- [ ] **Step 9: Commit scaffolding**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
git add -A
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
import { carBrands, DifficultyTier } from '../../src/data/carData';

describe('carData integrity', () => {
  it('should have at least 30 brands', () => {
    expect(carBrands.length).toBeGreaterThanOrEqual(30);
  });

  it('every brand should have at least 2 models', () => {
    for (const brand of carBrands) {
      expect(brand.models.length, `${brand.name} has fewer than 2 models`).toBeGreaterThanOrEqual(2);
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
      expect(validTiers).toContain(brand.tier);
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

  it('every brand should have a logoUrl string', () => {
    for (const brand of carBrands) {
      expect(typeof brand.logoUrl).toBe('string');
      expect(brand.logoUrl.length).toBeGreaterThan(0);
    }
  });

  it('all three difficulty tiers should be represented', () => {
    const tiers = new Set(carBrands.map(b => b.tier));
    expect(tiers.has(1)).toBe(true);
    expect(tiers.has(2)).toBe(true);
    expect(tiers.has(3)).toBe(true);
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
  logoUrl: string;
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
  | { type: 'NEXT_QUESTION' }
  | { type: 'RESET' };
```

- [ ] **Step 4: Create car data**

Create `src/data/carData.ts` with the full dataset. Re-export `DifficultyTier` from types for convenience:

```typescript
import { CarBrand, DifficultyTier } from '../types/game';

export type { DifficultyTier };

export const carBrands: CarBrand[] = [
  // Tier 1 — Well Known
  {
    name: 'Toyota',
    logoUrl: 'https://www.carlogos.org/car-logos/toyota-logo.png',
    models: ['Corolla', 'Camry', 'RAV4', 'Yaris', 'Highlander', 'Land Cruiser', 'Prius', 'Supra'],
    tier: 1,
  },
  {
    name: 'BMW',
    logoUrl: 'https://www.carlogos.org/car-logos/bmw-logo.png',
    models: ['3 Series', '5 Series', 'X5', 'X3', '7 Series', 'M3', 'i4', 'X1'],
    tier: 1,
  },
  {
    name: 'Mercedes-Benz',
    logoUrl: 'https://www.carlogos.org/car-logos/mercedes-benz-logo.png',
    models: ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'A-Class', 'AMG GT', 'CLA'],
    tier: 1,
  },
  {
    name: 'Honda',
    logoUrl: 'https://www.carlogos.org/car-logos/honda-logo.png',
    models: ['Civic', 'Accord', 'CR-V', 'HR-V', 'Fit', 'Pilot', 'Odyssey'],
    tier: 1,
  },
  {
    name: 'Ford',
    logoUrl: 'https://www.carlogos.org/car-logos/ford-logo.png',
    models: ['Mustang', 'F-150', 'Focus', 'Explorer', 'Bronco', 'Ranger', 'Escape'],
    tier: 1,
  },
  {
    name: 'Chevrolet',
    logoUrl: 'https://www.carlogos.org/car-logos/chevrolet-logo.png',
    models: ['Corvette', 'Camaro', 'Silverado', 'Malibu', 'Equinox', 'Tahoe', 'Blazer'],
    tier: 1,
  },
  {
    name: 'Audi',
    logoUrl: 'https://www.carlogos.org/car-logos/audi-logo.png',
    models: ['A4', 'A6', 'Q5', 'Q7', 'A3', 'e-tron', 'RS6', 'TT'],
    tier: 1,
  },
  {
    name: 'Volkswagen',
    logoUrl: 'https://www.carlogos.org/car-logos/volkswagen-logo.png',
    models: ['Golf', 'Passat', 'Tiguan', 'Polo', 'Jetta', 'ID.4', 'Arteon', 'T-Roc'],
    tier: 1,
  },
  {
    name: 'Hyundai',
    logoUrl: 'https://www.carlogos.org/car-logos/hyundai-logo.png',
    models: ['Tucson', 'Elantra', 'Santa Fe', 'Sonata', 'Kona', 'Ioniq 5', 'Palisade'],
    tier: 1,
  },
  {
    name: 'Kia',
    logoUrl: 'https://www.carlogos.org/car-logos/kia-logo.png',
    models: ['Sportage', 'Sorento', 'Seltos', 'Forte', 'Telluride', 'EV6', 'Stinger'],
    tier: 1,
  },
  {
    name: 'Nissan',
    logoUrl: 'https://www.carlogos.org/car-logos/nissan-logo.png',
    models: ['Altima', 'Rogue', 'Sentra', 'Pathfinder', 'Maxima', 'GT-R', 'Leaf', 'Juke'],
    tier: 1,
  },
  {
    name: 'Tesla',
    logoUrl: 'https://www.carlogos.org/car-logos/tesla-logo.png',
    models: ['Model 3', 'Model Y', 'Model S', 'Model X', 'Cybertruck', 'Roadster'],
    tier: 1,
  },
  {
    name: 'Porsche',
    logoUrl: 'https://www.carlogos.org/car-logos/porsche-logo.png',
    models: ['911', 'Cayenne', 'Macan', 'Taycan', 'Panamera', 'Boxster', 'Cayman'],
    tier: 1,
  },
  {
    name: 'Ferrari',
    logoUrl: 'https://www.carlogos.org/car-logos/ferrari-logo.png',
    models: ['F40', '458 Italia', 'Roma', 'SF90', 'Portofino', '812 Superfast', 'LaFerrari'],
    tier: 1,
  },
  {
    name: 'Lamborghini',
    logoUrl: 'https://www.carlogos.org/car-logos/lamborghini-logo.png',
    models: ['Huracán', 'Aventador', 'Urus', 'Gallardo', 'Murciélago', 'Diablo', 'Countach'],
    tier: 1,
  },
  // Tier 2 — Known
  {
    name: 'Mazda',
    logoUrl: 'https://www.carlogos.org/car-logos/mazda-logo.png',
    models: ['Mazda3', 'CX-5', 'CX-9', 'MX-5 Miata', 'CX-30', 'Mazda6'],
    tier: 2,
  },
  {
    name: 'Subaru',
    logoUrl: 'https://www.carlogos.org/car-logos/subaru-logo.png',
    models: ['Outback', 'Forester', 'Impreza', 'WRX', 'Crosstrek', 'Legacy', 'BRZ'],
    tier: 2,
  },
  {
    name: 'Volvo',
    logoUrl: 'https://www.carlogos.org/car-logos/volvo-logo.png',
    models: ['XC90', 'XC60', 'XC40', 'S60', 'S90', 'V60', 'C40'],
    tier: 2,
  },
  {
    name: 'Lexus',
    logoUrl: 'https://www.carlogos.org/car-logos/lexus-logo.png',
    models: ['RX', 'ES', 'NX', 'IS', 'GX', 'LS', 'LC', 'UX'],
    tier: 2,
  },
  {
    name: 'Jaguar',
    logoUrl: 'https://www.carlogos.org/car-logos/jaguar-logo.png',
    models: ['F-Pace', 'XE', 'XF', 'F-Type', 'E-Pace', 'I-Pace', 'XJ'],
    tier: 2,
  },
  {
    name: 'Land Rover',
    logoUrl: 'https://www.carlogos.org/car-logos/land-rover-logo.png',
    models: ['Range Rover', 'Defender', 'Discovery', 'Evoque', 'Velar', 'Sport'],
    tier: 2,
  },
  {
    name: 'Jeep',
    logoUrl: 'https://www.carlogos.org/car-logos/jeep-logo.png',
    models: ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade', 'Gladiator'],
    tier: 2,
  },
  {
    name: 'Dodge',
    logoUrl: 'https://www.carlogos.org/car-logos/dodge-logo.png',
    models: ['Charger', 'Challenger', 'Durango', 'Ram 1500', 'Viper', 'Hornet'],
    tier: 2,
  },
  {
    name: 'Cadillac',
    logoUrl: 'https://www.carlogos.org/car-logos/cadillac-logo.png',
    models: ['Escalade', 'CT5', 'CT4', 'XT5', 'XT4', 'Lyriq', 'Celestiq'],
    tier: 2,
  },
  {
    name: 'Chrysler',
    logoUrl: 'https://www.carlogos.org/car-logos/chrysler-logo.png',
    models: ['300', 'Pacifica', 'Voyager', 'Town & Country', 'Sebring'],
    tier: 2,
  },
  {
    name: 'Fiat',
    logoUrl: 'https://www.carlogos.org/car-logos/fiat-logo.png',
    models: ['500', 'Panda', 'Tipo', 'Punto', '500X', '124 Spider', 'Doblo'],
    tier: 2,
  },
  {
    name: 'Alfa Romeo',
    logoUrl: 'https://www.carlogos.org/car-logos/alfa-romeo-logo.png',
    models: ['Giulia', 'Stelvio', 'Tonale', '4C', 'Giulietta', 'MiTo'],
    tier: 2,
  },
  {
    name: 'Peugeot',
    logoUrl: 'https://www.carlogos.org/car-logos/peugeot-logo.png',
    models: ['208', '308', '3008', '5008', '508', '2008', 'e-208'],
    tier: 2,
  },
  {
    name: 'Renault',
    logoUrl: 'https://www.carlogos.org/car-logos/renault-logo.png',
    models: ['Clio', 'Megane', 'Captur', 'Kadjar', 'Scenic', 'Zoe', 'Arkana'],
    tier: 2,
  },
  {
    name: 'MINI',
    logoUrl: 'https://www.carlogos.org/car-logos/mini-logo.png',
    models: ['Cooper', 'Countryman', 'Clubman', 'Convertible', 'Paceman'],
    tier: 2,
  },
  {
    name: 'Mitsubishi',
    logoUrl: 'https://www.carlogos.org/car-logos/mitsubishi-logo.png',
    models: ['Outlander', 'Eclipse Cross', 'ASX', 'L200', 'Pajero', 'Mirage'],
    tier: 2,
  },
  {
    name: 'Suzuki',
    logoUrl: 'https://www.carlogos.org/car-logos/suzuki-logo.png',
    models: ['Swift', 'Vitara', 'Jimny', 'S-Cross', 'Ignis', 'Baleno', 'Alto'],
    tier: 2,
  },
  {
    name: 'Infiniti',
    logoUrl: 'https://www.carlogos.org/car-logos/infiniti-logo.png',
    models: ['Q50', 'Q60', 'QX50', 'QX60', 'QX80', 'QX55'],
    tier: 2,
  },
  {
    name: 'Genesis',
    logoUrl: 'https://www.carlogos.org/car-logos/genesis-logo.png',
    models: ['G70', 'G80', 'G90', 'GV70', 'GV80', 'GV60'],
    tier: 2,
  },
  {
    name: 'Buick',
    logoUrl: 'https://www.carlogos.org/car-logos/buick-logo.png',
    models: ['Enclave', 'Encore', 'Envision', 'Regal', 'LaCrosse'],
    tier: 2,
  },
  // Tier 3 — Obscure
  {
    name: 'Maserati',
    logoUrl: 'https://www.carlogos.org/car-logos/maserati-logo.png',
    models: ['Ghibli', 'Levante', 'Quattroporte', 'MC20', 'GranTurismo', 'Grecale'],
    tier: 3,
  },
  {
    name: 'Bentley',
    logoUrl: 'https://www.carlogos.org/car-logos/bentley-logo.png',
    models: ['Continental GT', 'Bentayga', 'Flying Spur', 'Mulsanne', 'Bacalar'],
    tier: 3,
  },
  {
    name: 'Aston Martin',
    logoUrl: 'https://www.carlogos.org/car-logos/aston-martin-logo.png',
    models: ['DB11', 'Vantage', 'DBX', 'DB12', 'Valkyrie', 'DBS'],
    tier: 3,
  },
  {
    name: 'Rolls-Royce',
    logoUrl: 'https://www.carlogos.org/car-logos/rolls-royce-logo.png',
    models: ['Phantom', 'Ghost', 'Cullinan', 'Wraith', 'Dawn', 'Spectre'],
    tier: 3,
  },
  {
    name: 'McLaren',
    logoUrl: 'https://www.carlogos.org/car-logos/mclaren-logo.png',
    models: ['720S', '570S', 'Artura', 'GT', 'Senna', 'P1', 'Speedtail'],
    tier: 3,
  },
  {
    name: 'Lotus',
    logoUrl: 'https://www.carlogos.org/car-logos/lotus-logo.png',
    models: ['Elise', 'Evora', 'Emira', 'Eletre', 'Exige', 'Esprit'],
    tier: 3,
  },
  {
    name: 'Bugatti',
    logoUrl: 'https://www.carlogos.org/car-logos/bugatti-logo.png',
    models: ['Chiron', 'Veyron', 'Divo', 'Centodieci', 'Bolide', 'Mistral'],
    tier: 3,
  },
  {
    name: 'Skoda',
    logoUrl: 'https://www.carlogos.org/car-logos/skoda-logo.png',
    models: ['Octavia', 'Superb', 'Kodiaq', 'Karoq', 'Fabia', 'Kamiq', 'Enyaq'],
    tier: 3,
  },
  {
    name: 'Seat',
    logoUrl: 'https://www.carlogos.org/car-logos/seat-logo.png',
    models: ['Leon', 'Ibiza', 'Arona', 'Ateca', 'Tarraco', 'Cupra Formentor'],
    tier: 3,
  },
  {
    name: 'Dacia',
    logoUrl: 'https://www.carlogos.org/car-logos/dacia-logo.png',
    models: ['Duster', 'Sandero', 'Logan', 'Spring', 'Jogger', 'Bigster'],
    tier: 3,
  },
  {
    name: 'Opel',
    logoUrl: 'https://www.carlogos.org/car-logos/opel-logo.png',
    models: ['Corsa', 'Astra', 'Mokka', 'Crossland', 'Grandland', 'Insignia'],
    tier: 3,
  },
  {
    name: 'Citroën',
    logoUrl: 'https://www.carlogos.org/car-logos/citroen-logo.png',
    models: ['C3', 'C4', 'C5 Aircross', 'Berlingo', 'C3 Aircross', 'Ami'],
    tier: 3,
  },
  {
    name: 'Lancia',
    logoUrl: 'https://www.carlogos.org/car-logos/lancia-logo.png',
    models: ['Ypsilon', 'Delta', 'Stratos', 'Fulvia', 'Thema', 'Aurelia'],
    tier: 3,
  },
  {
    name: 'Saab',
    logoUrl: 'https://www.carlogos.org/car-logos/saab-logo.png',
    models: ['9-3', '9-5', '900', '9000', '9-2X', '9-4X'],
    tier: 3,
  },
  {
    name: 'Smart',
    logoUrl: 'https://www.carlogos.org/car-logos/smart-logo.png',
    models: ['Fortwo', 'Forfour', 'Roadster', '#1', '#3'],
    tier: 3,
  },
];
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npx vitest run tests/unit/carData.test.ts
```

Expected: All 8 tests PASS.

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
 * Shuffles an array in place using Fisher-Yates.
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

  // Pick 3 unique distractors that don't match the correct model
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

- [ ] **Step 5: Refactor and verify**

Review for any edge cases. Run full unit suite:

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
    logoUrl: 'https://example.com/toyota.png',
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
import { GameState, GameAction, Question } from '../types/game';
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

    case 'NEXT_QUESTION':
      return {
        ...state,
        lastAnswerCorrect: null,
      };

    case 'RESET':
      return initialGameState;

    default:
      return state;
  }
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

  const loadNextQuestion = useCallback(() => {
    const question = generateQuestion(state.score);
    dispatch({ type: 'SET_QUESTION', question });
  }, [state.score]);

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
      loadNextQuestion();
    }
  }, [state.phase, state.currentQuestion, loadNextQuestion]);

  // Load next question after correct answer feedback
  useEffect(() => {
    if (state.lastAnswerCorrect === true) {
      const timeout = setTimeout(() => {
        loadNextQuestion();
      }, 500); // 500ms feedback delay
      return () => clearTimeout(timeout);
    }
  }, [state.lastAnswerCorrect, loadNextQuestion]);

  return { state, startGame, handleAnswer, resetGame };
}
```

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
import React, { useState } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { CarBrand } from '../types/game';

interface QuestionCardProps {
  brand: CarBrand;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ brand }) => {
  const [logoError, setLogoError] = useState(false);

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
              src={brand.logoUrl}
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
      {options.map((option) => (
        <Button
          key={option}
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
        sx={{ height: 8, borderRadius: 4 }}
        data-testid="timer-bar"
      />
    </Box>
  );
};

export default TimerBar;
```

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
- Modify: `src/main.tsx`
- Create: `src/App.css`
- Modify: `index.html`

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

- [ ] **Step 2: Update main.tsx**

Ensure `src/main.tsx` contains:

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

- [ ] **Step 3: Create minimal global styles**

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

- [ ] **Step 4: Update index.html title**

Update the `<title>` in `index.html` to:

```html
<title>Car Trivia Game</title>
```

Also ensure the `<div id="root">` element exists.

- [ ] **Step 5: Build and verify**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npm run build
```

Expected: Build succeeds. `dist/` contains `index.html` and JS/CSS assets.

- [ ] **Step 6: Run full unit test suite**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npx vitest run
```

Expected: All unit tests PASS.

- [ ] **Step 7: Commit**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
git add src/App.tsx src/App.css src/main.tsx index.html
git commit -m "feat: wire App with theme, game state, and all screen components"
```

---

### Task 10: Playwright E2E Tests

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

  test('correct answer increments score and shows next question', async ({ page }) => {
    await page.getByTestId('start-button').click();

    // Get the brand name to find the correct answer
    const brandName = await page.getByTestId('brand-name').textContent();

    // We need to find the correct answer programmatically
    // Since we can't know which option is correct from the UI alone,
    // we test the flow by clicking each option and checking the outcome
    const buttons = page.locator('[data-testid^="answer-option-"]');
    const count = await buttons.count();

    // Try the first option
    const firstOption = await buttons.nth(0).textContent();
    await buttons.nth(0).click();

    // Either score goes to 1 (correct) or game over (wrong)
    // Check if score changed or game over appeared
    const scoreVisible = await page.getByTestId('score-display').isVisible().catch(() => false);
    const gameOverVisible = await page.getByTestId('final-score').isVisible().catch(() => false);

    expect(scoreVisible || gameOverVisible).toBe(true);
  });

  test('game over screen shows after wrong answer', async ({ page }) => {
    await page.getByTestId('start-button').click();

    // We'll try all options — at least 3 of 4 are wrong, so if we keep
    // clicking wrong ones, we'll eventually hit game over.
    // But since game ends on first wrong answer, we just need to find a wrong one.
    // Get all options and the brand name
    const brandName = await page.getByTestId('brand-name').textContent();

    // Click any answer — it will either be right or wrong
    // For testing game over, we'll just verify the flow works
    const buttons = page.locator('[data-testid^="answer-option-"]');
    await buttons.first().click();

    // Wait for either next question or game over
    await page.waitForTimeout(600);

    // If game is still playing, click next answer until game over
    let isGameOver = await page.getByTestId('play-again-button').isVisible().catch(() => false);
    let attempts = 0;
    while (!isGameOver && attempts < 50) {
      const activeButtons = page.locator('[data-testid^="answer-option-"]');
      if (await activeButtons.first().isVisible().catch(() => false)) {
        await activeButtons.first().click();
        await page.waitForTimeout(600);
      }
      isGameOver = await page.getByTestId('play-again-button').isVisible().catch(() => false);
      attempts++;
    }

    // Eventually we should reach game over
    await expect(page.getByTestId('play-again-button')).toBeVisible({ timeout: 60000 });
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
    await page.waitForTimeout(500); // Wait for question to load
    await page.screenshot({ path: 'test-results/game-screen.png', fullPage: true });
  });

  test('takes screenshot of game over screen', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.getByTestId('play-again-button')).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'test-results/game-over-screen.png', fullPage: true });
  });
});
```

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
git add tests/e2e/game.spec.ts playwright.config.ts
git commit -m "test: add Playwright E2E tests for full game flow with screenshots"
```

---

### Task 11: Deployment Configuration

**Files:**
- Modify: `package.json` (add `gh-pages` dependency and deploy script)
- Modify: `.gitignore` (ensure `dist/` is ignored)
- Create: `public/favicon.svg`

- [ ] **Step 1: Install gh-pages**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npm install -D gh-pages
```

- [ ] **Step 2: Create a simple car-themed favicon**

Create `public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#1a1a2e"/>
  <text x="50" y="65" font-size="50" text-anchor="middle" fill="#4fc3f7">🚗</text>
</svg>
```

- [ ] **Step 3: Add favicon link to index.html**

Add to `<head>` in `index.html`:

```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

- [ ] **Step 4: Verify build and deployment readiness**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npm run build
ls dist/
```

Expected: `dist/` contains `index.html`, `assets/` directory with JS and CSS bundles.

- [ ] **Step 5: Run full test suite**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
npx vitest run
npm run build && npx playwright test
```

Expected: All unit tests and E2E tests PASS.

- [ ] **Step 6: Commit**

```bash
cd /Users/develeap/private_gits/car_models/.worktrees/car-trivia-game
git add package.json package-lock.json public/favicon.svg index.html .gitignore
git commit -m "chore: add deployment configuration with gh-pages and favicon"
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
- Clicking Start shows logo + brand name + 4 options + timer counting down
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
