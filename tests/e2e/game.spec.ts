import { test, expect } from '@playwright/test';
import { carBrands } from '../../src/data/carData';

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

    // Look up the brand's models from the imported carData to find the correct answer.
    // We read the option button texts and match against the known models for this brand.
    const optionTexts = await page.locator('[data-testid^="answer-option-"]').allTextContents();
    expect(optionTexts).toHaveLength(4);

    // Find the brand entry matching the displayed name using the imported carBrands dataset.
    const brand = carBrands.find(b => b.name === brandName);
    expect(brand).toBeTruthy();

    // The correct model is whichever option text is in this brand's model list.
    const correctOption = optionTexts.find(opt => brand!.models.includes(opt));
    expect(correctOption).toBeTruthy();

    // Verify initial score
    const initialScoreText = await page.getByTestId('score-display').textContent();
    expect(initialScoreText).toContain('Score: 0');

    // Click the correct answer deterministically
    await page.getByTestId(`answer-option-${correctOption}`).click();

    // Wait for the 500ms green flash feedback + transition
    await page.waitForTimeout(700);

    // Score must have incremented to 1
    const newScoreText = await page.getByTestId('score-display').textContent();
    expect(newScoreText).toContain('Score: 1');

    // A new question should have loaded
    await expect(page.getByTestId('brand-name')).toBeVisible();
  });

  test('game over screen shows after wrong answer', async ({ page }) => {
    await page.getByTestId('start-button').click();

    // Wait for the game to be ready
    await expect(page.getByTestId('brand-name')).toBeVisible();

    // Read the brand name and find a wrong answer
    const brandName = await page.getByTestId('brand-name').textContent();
    const brand = carBrands.find(b => b.name === brandName);
    expect(brand).toBeTruthy();

    const optionTexts = await page.locator('[data-testid^="answer-option-"]').allTextContents();
    // Find an option that does NOT belong to this brand (i.e., a wrong answer)
    const wrongOption = optionTexts.find(opt => !brand!.models.includes(opt));
    expect(wrongOption).toBeTruthy();

    // Click the wrong answer
    await page.getByTestId(`answer-option-${wrongOption}`).click();

    // Wait for the game over screen (500ms red flash + buffer)
    await expect(page.getByTestId('play-again-button')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('final-score')).toBeVisible();
    await expect(page.getByText('Game Over')).toBeVisible();
    await expect(page.getByTestId('final-score')).toContainText('0');
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
