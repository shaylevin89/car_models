import { test, expect } from '@playwright/test';
import { carBrands } from '../../src/data/carData';
import { countries } from '../../src/data/countryData';
import { flags } from '../../src/data/flagData';

test.describe('Car Trivia Game', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test for isolation
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    // App now opens on the home hub — pick Car Trivia to reach the start screen
    // that the rest of the suite was written against.
    await page.getByTestId('subject-card-cars').click();
    await expect(page.getByTestId('start-button')).toBeVisible();
  });

  test('shows start screen with Hebrew text by default', async ({ page }) => {
    await expect(page.locator('h1').getByText('טריוויית רכב')).toBeVisible();
    await expect(page.getByTestId('start-button')).toBeVisible();
    await expect(page.getByText('התאימו את יצרן הרכב לדגם שלו!')).toBeVisible();
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

    // Verify clipboard content includes message and game URL on separate lines
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    const gameUrl = await page.evaluate(() => window.location.href);
    expect(clipboardText).toBe(`בטריוויית רכב הצלחתי 0 דגמים! כמה אתה מצליח?\n${gameUrl}`);
  });

  test('share button includes correct score in clipboard message', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

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

    await expect(page.getByTestId('share-button')).toBeVisible({ timeout: 5000 });
    await page.getByTestId('share-button').click();

    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    const gameUrl = await page.evaluate(() => window.location.href);
    expect(clipboardText).toBe(`בטריוויית רכב הצלחתי 1 דגמים! כמה אתה מצליח?\n${gameUrl}`);
  });

  test('language toggle switches between Hebrew and English', async ({ page }) => {
    // Default should be Hebrew
    await expect(page.locator('h1').getByText('טריוויית רכב')).toBeVisible();

    // Open language menu
    await page.getByTestId('language-menu-button').click();
    await page.getByTestId('lang-option-en').click();

    // Should now show English
    await expect(page.locator('h1').getByText('Car Trivia')).toBeVisible();
    await expect(page.getByText('Match the car brand to its model!')).toBeVisible();

    // Toggle back to Hebrew
    await page.getByTestId('language-menu-button').click();
    await page.getByTestId('lang-option-he').click();

    await expect(page.locator('h1').getByText('טריוויית רכב')).toBeVisible();
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
    // After reload we're back on home hub; navigate to cars start screen
    await page.getByTestId('subject-card-cars').click();
    await expect(page.getByTestId('best-score-display')).toBeVisible();
  });

  test('new best indicator shows when beating the record', async ({ page }) => {
    await page.getByTestId('start-button').click();

    // Answer one question correctly
    const brandName = await page.getByTestId('brand-name').textContent();
    const brand = carBrands.find(b => b.name === brandName);
    const optionTexts = await page.locator('[data-testid^="answer-option-"]').allTextContents();
    const correctOption = optionTexts.find(opt => brand!.models.includes(opt));
    await page.getByTestId(`answer-option-${correctOption}`).click();

    await page.waitForTimeout(700);

    // Answer wrong to end game
    const brandName2 = await page.getByTestId('brand-name').textContent();
    const brand2 = carBrands.find(b => b.name === brandName2);
    const optionTexts2 = await page.locator('[data-testid^="answer-option-"]').allTextContents();
    const wrongOption = optionTexts2.find(opt => !brand2!.models.includes(opt));
    await page.getByTestId(`answer-option-${wrongOption}`).click();

    await expect(page.getByTestId('play-again-button')).toBeVisible({ timeout: 5000 });

    // New best indicator should be visible (score 1 > previous best 0)
    await expect(page.getByTestId('new-best-indicator')).toBeVisible();
    await expect(page.getByTestId('new-best-indicator')).toContainText('שיא חדש!');
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

test.describe('Countries & Capitals Trivia', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByTestId('subject-card-countries').click();
    await expect(page.getByTestId('start-button')).toBeVisible();
  });

  test('shows the countries start screen with Hebrew subtitle by default', async ({ page }) => {
    await expect(page.locator('h1').getByText('מדינות ובירות')).toBeVisible();
    await expect(page.getByText('התאימו את המדינה לבירה שלה!')).toBeVisible();
  });

  test('starts a country question with 4 capital options', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.getByTestId('country-name')).toBeVisible();
    await expect(page.getByTestId('country-icon')).toBeVisible();
    const buttons = page.locator('[data-testid^="answer-option-"]');
    await expect(buttons).toHaveCount(4);
  });

  test('correct capital increments score', async ({ page }) => {
    await page.getByTestId('start-button').click();

    // Country name displays in Hebrew by default — read the canonical English
    // name from the data-canonical-name attribute so this test is locale-agnostic.
    const countryName = await page.getByTestId('country-name').getAttribute('data-canonical-name');
    const country = countries.find(c => c.name === countryName);
    expect(country).toBeTruthy();

    // Option data-testid encodes the canonical English value; rendered text
    // is localized. We assert via the testid suffix, not text content.
    const optionKeys = await page.locator('[data-testid^="answer-option-"]')
      .evaluateAll(els => els.map(el => el.getAttribute('data-testid')!.replace('answer-option-', '')));
    expect(optionKeys).toContain(country!.capital);

    await page.getByTestId(`answer-option-${country!.capital}`).click();
    await page.waitForTimeout(700);

    const scoreText = await page.getByTestId('score-display').textContent();
    expect(scoreText).toContain('1');
  });

  test('wrong capital ends the game with correct share message', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.getByTestId('start-button').click();

    const countryName = await page.getByTestId('country-name').getAttribute('data-canonical-name');
    const country = countries.find(c => c.name === countryName);
    const optionKeys = await page.locator('[data-testid^="answer-option-"]')
      .evaluateAll(els => els.map(el => el.getAttribute('data-testid')!.replace('answer-option-', '')));
    const wrongOption = optionKeys.find(opt => opt !== country!.capital);

    await page.getByTestId(`answer-option-${wrongOption}`).click();
    await expect(page.getByTestId('play-again-button')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('final-score')).toContainText('0');

    await page.getByTestId('share-button').click();
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    const gameUrl = await page.evaluate(() => window.location.href);
    expect(clipboardText).toBe(`בטריוויית מדינות ובירות הצלחתי 0 בירות! כמה אתה מצליח?\n${gameUrl}`);
  });

  test('country prompt and answer options render in Hebrew by default', async ({ page }) => {
    await page.getByTestId('start-button').click();

    // The visible country name must be the Hebrew translation of the canonical
    // English country name embedded in data-canonical-name.
    const canonical = await page.getByTestId('country-name').getAttribute('data-canonical-name');
    expect(canonical).toBeTruthy();
    const { countryNameTranslations, cityNameTranslations } = await import('../../src/i18n/countryTranslations');
    const expectedHebrewCountry = countryNameTranslations[canonical!]?.he;
    expect(expectedHebrewCountry, `No Hebrew translation for ${canonical}`).toBeTruthy();
    await expect(page.getByTestId('country-name')).toHaveText(expectedHebrewCountry!);

    // Every answer option's visible text must be the Hebrew form of the
    // English city embedded in its data-testid.
    const buttons = page.locator('[data-testid^="answer-option-"]');
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const testId = await button.getAttribute('data-testid');
      const englishCity = testId!.replace('answer-option-', '');
      const expectedHebrewCity = cityNameTranslations[englishCity]?.he;
      expect(expectedHebrewCity, `No Hebrew translation for ${englishCity}`).toBeTruthy();
      await expect(button).toHaveText(expectedHebrewCity!);
    }
  });

  test('toggling to English via the hamburger renders country and options in English', async ({ page }) => {
    // Switch language to English before starting the game.
    await page.getByTestId('language-menu-button').click();
    await page.getByTestId('lang-option-en').click();

    await page.getByTestId('start-button').click();

    const canonical = await page.getByTestId('country-name').getAttribute('data-canonical-name');
    expect(canonical).toBeTruthy();
    // In English mode the visible text equals the canonical English name.
    await expect(page.getByTestId('country-name')).toHaveText(canonical!);

    const buttons = page.locator('[data-testid^="answer-option-"]');
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const testId = await button.getAttribute('data-testid');
      const englishCity = testId!.replace('answer-option-', '');
      await expect(button).toHaveText(englishCity);
    }
  });

  test('countries best score is independent from cars best score', async ({ page }) => {
    // Seed a cars best score directly.
    await page.evaluate(() => localStorage.setItem('car-trivia-best-score-cars', '42'));
    await page.reload();
    await page.getByTestId('subject-card-countries').click();

    // The countries start screen should not show a best-score chip (no countries best yet).
    await expect(page.getByTestId('best-score-display')).toHaveCount(0);

    // Visiting cars start screen should still show 42.
    await page.getByTestId('back-home-button').click();
    await page.getByTestId('subject-card-cars').click();
    await expect(page.getByTestId('best-score-display')).toContainText('42');
  });
});

test.describe('Flags Trivia', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByTestId('subject-card-flags').click();
    await expect(page.getByTestId('start-button')).toBeVisible();
  });

  test('shows the flags start screen with Hebrew subtitle by default', async ({ page }) => {
    await expect(page.locator('h1').getByText('דגלי העולם')).toBeVisible();
    await expect(page.getByText('זהו את המדינה לפי הדגל!')).toBeVisible();
  });

  test('starts a flag question with an image and 4 country options', async ({ page }) => {
    await page.getByTestId('start-button').click();
    await expect(page.getByTestId('flag-image')).toBeVisible();
    // The country name caption is intentionally hidden — the flag is the prompt.
    await expect(page.getByTestId('country-name')).toHaveCount(0);
    const buttons = page.locator('[data-testid^="answer-option-"]');
    await expect(buttons).toHaveCount(4);
  });

  test('correct country answer increments score', async ({ page }) => {
    await page.getByTestId('start-button').click();

    // The flag image exposes the ISO country code; resolve it to the canonical
    // English country name so the test stays locale-stable.
    const countryCode = await page.getByTestId('flag-image').getAttribute('data-country-code');
    const flag = flags.find(f => f.countryCode === countryCode);
    expect(flag, `Unknown country code ${countryCode}`).toBeTruthy();

    const optionKeys = await page.locator('[data-testid^="answer-option-"]')
      .evaluateAll(els => els.map(el => el.getAttribute('data-testid')!.replace('answer-option-', '')));
    expect(optionKeys).toContain(flag!.name);

    await page.getByTestId(`answer-option-${flag!.name}`).click();
    await page.waitForTimeout(700);

    const scoreText = await page.getByTestId('score-display').textContent();
    expect(scoreText).toContain('1');
  });

  test('wrong country ends the game with the Hebrew flags share message', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    await page.getByTestId('start-button').click();

    const countryCode = await page.getByTestId('flag-image').getAttribute('data-country-code');
    const flag = flags.find(f => f.countryCode === countryCode);
    const optionKeys = await page.locator('[data-testid^="answer-option-"]')
      .evaluateAll(els => els.map(el => el.getAttribute('data-testid')!.replace('answer-option-', '')));
    const wrongOption = optionKeys.find(opt => opt !== flag!.name);

    await page.getByTestId(`answer-option-${wrongOption}`).click();
    await expect(page.getByTestId('play-again-button')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('final-score')).toContainText('0');

    await page.getByTestId('share-button').click();
    const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
    const gameUrl = await page.evaluate(() => window.location.href);
    expect(clipboardText).toBe(`בטריוויית דגלים זיהיתי 0 דגלים! כמה אתה מצליח?\n${gameUrl}`);
  });

  test('answer options render in Hebrew by default', async ({ page }) => {
    await page.getByTestId('start-button').click();

    const { countryNameTranslations } = await import('../../src/i18n/countryTranslations');
    const buttons = page.locator('[data-testid^="answer-option-"]');
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const testId = await button.getAttribute('data-testid');
      const englishCountry = testId!.replace('answer-option-', '');
      const expectedHebrew = countryNameTranslations[englishCountry]?.he;
      expect(expectedHebrew, `No Hebrew translation for ${englishCountry}`).toBeTruthy();
      await expect(button).toHaveText(expectedHebrew!);
    }
  });

  test('toggling to English via the hamburger renders options in English', async ({ page }) => {
    await page.getByTestId('language-menu-button').click();
    await page.getByTestId('lang-option-en').click();

    await page.getByTestId('start-button').click();

    const buttons = page.locator('[data-testid^="answer-option-"]');
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const testId = await button.getAttribute('data-testid');
      const englishCountry = testId!.replace('answer-option-', '');
      await expect(button).toHaveText(englishCountry);
    }
  });

  test('flags best score is independent from other subjects', async ({ page }) => {
    // Seed best scores for cars and countries directly.
    await page.evaluate(() => {
      localStorage.setItem('car-trivia-best-score-cars', '17');
      localStorage.setItem('car-trivia-best-score-countries', '23');
    });
    await page.reload();
    await page.getByTestId('subject-card-flags').click();

    // The flags start screen should not show a best-score chip yet.
    await expect(page.getByTestId('best-score-display')).toHaveCount(0);

    // Cars and countries best scores should still be intact.
    await page.getByTestId('back-home-button').click();
    await page.getByTestId('subject-card-cars').click();
    await expect(page.getByTestId('best-score-display')).toContainText('17');
    await page.getByTestId('back-home-button').click();
    await page.getByTestId('subject-card-countries').click();
    await expect(page.getByTestId('best-score-display')).toContainText('23');
  });
});

test.describe('Trivia Hub (homepage)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('home is the default landing screen with Hebrew title, header, and instructions', async ({ page }) => {
    await expect(page.getByTestId('home-title')).toHaveText('מרכז הטריוויה');
    await expect(page.getByText('בחרו נושא והתחילו לשחק')).toBeVisible();
    await expect(page.getByTestId('home-instructions')).toBeVisible();
  });

  test('home shows car trivia, countries-capitals, and flags subject cards', async ({ page }) => {
    await expect(page.getByTestId('subject-card-cars')).toBeVisible();
    await expect(page.getByTestId('subject-card-countries')).toBeVisible();
    await expect(page.getByTestId('subject-card-flags')).toBeVisible();
  });

  test('clicking car trivia card opens the car trivia start screen', async ({ page }) => {
    await page.getByTestId('subject-card-cars').click();
    await expect(page.locator('h1').getByText('טריוויית רכב')).toBeVisible();
    await expect(page.getByTestId('start-button')).toBeVisible();
  });

  test('clicking countries card opens the countries start screen', async ({ page }) => {
    await page.getByTestId('subject-card-countries').click();
    await expect(page.locator('h1').getByText('מדינות ובירות')).toBeVisible();
    await expect(page.getByTestId('start-button')).toBeVisible();
  });

  test('clicking flags card opens the flags start screen', async ({ page }) => {
    await page.getByTestId('subject-card-flags').click();
    await expect(page.locator('h1').getByText('דגלי העולם')).toBeVisible();
    await expect(page.getByTestId('start-button')).toBeVisible();
  });

  test('start screen has a back-to-home button that returns to the hub', async ({ page }) => {
    await page.getByTestId('subject-card-cars').click();
    await expect(page.getByTestId('back-home-button')).toBeVisible();
    await page.getByTestId('back-home-button').click();
    await expect(page.getByTestId('home-title')).toBeVisible();
  });

  test('game over screen has a back-to-home button', async ({ page }) => {
    await page.getByTestId('subject-card-cars').click();
    await page.getByTestId('start-button').click();
    // Wait for timeout to reach game over.
    await expect(page.getByTestId('play-again-button')).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId('back-home-button')).toBeVisible();
    await page.getByTestId('back-home-button').click();
    await expect(page.getByTestId('home-title')).toBeVisible();
  });

  test('home hub respects English locale', async ({ page }) => {
    await page.getByTestId('language-menu-button').click();
    await page.getByTestId('lang-option-en').click();
    await expect(page.getByTestId('home-title')).toHaveText('Trivia Hub');
    await expect(page.getByText('Pick a topic and start playing')).toBeVisible();
    await expect(page.getByTestId('subject-card-countries')).toContainText('Countries & Capitals');
    await expect(page.getByTestId('subject-card-flags')).toContainText('World Flags');
  });

  test('takes screenshot of home hub (Hebrew)', async ({ page }) => {
    await expect(page.getByTestId('home-title')).toBeVisible();
    await page.screenshot({ path: 'test-results/home-hub-hebrew.png', fullPage: true });
  });
});
