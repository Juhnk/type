import { test, expect } from '@playwright/test';

test.describe('TypeAmp E2E - Typing Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the home page', async ({ page }) => {
    await expect(page).toHaveTitle(/TypeAmp/);
    await expect(page.locator('h1')).toContainText(/Start typing/);
  });

  test('should display typing area and allow typing', async ({ page }) => {
    // Wait for typing area to be visible
    const typingInput = page.locator('input[type="text"]').first();
    await expect(typingInput).toBeVisible();

    // Type some text
    await typingInput.type('hello world');

    // Check that text appears
    await expect(typingInput).toHaveValue('hello world');
  });

  test('should switch between time and words mode', async ({ page }) => {
    // Check for mode selector
    const modeSelector = page.locator('[role="combobox"]').first();
    await expect(modeSelector).toBeVisible();

    // Switch to words mode
    await modeSelector.click();
    await page.locator('text=words').click();

    // Verify words mode is active
    await expect(page.locator('text=/\\d+ words/')).toBeVisible();
  });

  test('should show live stats while typing', async ({ page }) => {
    const typingInput = page.locator('input[type="text"]').first();

    // Start typing
    await typingInput.type('the quick brown fox');

    // Check for live stats
    await expect(page.locator('text=/WPM/')).toBeVisible();
    await expect(page.locator('text=/Accuracy/')).toBeVisible();
  });

  test('should handle authentication modal', async ({ page }) => {
    // Look for login/register button
    const authButton = page
      .locator('button:has-text("Login"), button:has-text("Register")')
      .first();

    if (await authButton.isVisible()) {
      await authButton.click();

      // Check for auth modal
      await expect(page.locator('[role="dialog"]')).toBeVisible();
      await expect(page.locator('text=/Email/')).toBeVisible();
      await expect(page.locator('text=/Password/')).toBeVisible();
    }
  });
});

test.describe('TypeAmp E2E - Timer Functionality', () => {
  test('should start and stop timer correctly', async ({ page }) => {
    await page.goto('/');

    const typingInput = page.locator('input[type="text"]').first();
    await typingInput.click();

    // Start typing to trigger timer
    await typingInput.type('test');

    // Check timer started
    await expect(page.locator('text=/0:\\d+/')).toBeVisible();

    // Wait a bit
    await page.waitForTimeout(2000);

    // Stop typing (blur)
    await page.keyboard.press('Escape');

    // Check results appear - look for either Results or Stats text
    await expect(
      page.locator('text=/Results/').or(page.locator('text=/Stats/'))
    ).toBeVisible({
      timeout: 10000,
    });
  });
});

test.describe('TypeAmp E2E - Difficulty Modes', () => {
  test('should switch between difficulty levels', async ({ page }) => {
    await page.goto('/');

    // Look for difficulty selector
    const difficultySelectors = page.locator(
      'button:has-text("Normal"), button:has-text("Expert"), button:has-text("Master")'
    );

    if (await difficultySelectors.first().isVisible()) {
      // Test Expert mode
      const expertButton = page.locator('button:has-text("Expert")');
      await expertButton.click();

      // Verify Expert mode is active
      await expect(expertButton).toHaveAttribute('data-state', 'active');
    }
  });
});
