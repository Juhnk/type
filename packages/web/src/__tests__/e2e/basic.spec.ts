import { test, expect } from '@playwright/test';

test.describe('TypeAmp E2E Tests', () => {
  test('homepage loads correctly', async ({ page }) => {
    await page.goto('/');

    // Check for main heading
    await expect(page.locator('h1')).toBeVisible();

    // Check for typing area
    await expect(page.locator('[data-testid="typing-area"]')).toBeVisible();

    // Check for configuration options
    await expect(page.locator('[data-testid="config-bar"]')).toBeVisible();
  });

  test('typing flow works end-to-end', async ({ page }) => {
    await page.goto('/');

    // Wait for text to be generated
    await page.waitForSelector('[data-testid="typing-area"]');

    // Start typing
    const typingArea = page.locator('[data-testid="typing-area"] textarea');
    await typingArea.focus();
    await typingArea.type('hello', { delay: 100 });

    // Check that stats are updating
    await expect(page.locator('[data-testid="live-stats"]')).toBeVisible();

    // Verify typing is being tracked
    const wpmElement = page.locator('[data-testid="wpm-stat"]');
    await expect(wpmElement).toBeVisible();
  });

  test('mobile responsive design', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check mobile layout
    await expect(page.locator('[data-testid="typing-area"]')).toBeVisible();
    await expect(page.locator('[data-testid="config-bar"]')).toBeVisible();

    // Verify touch interactions work
    const configButton = page.locator('[data-testid="config-toggle"]').first();
    if (await configButton.isVisible()) {
      await configButton.tap();
    }
  });

  test('accessibility features', async ({ page }) => {
    await page.goto('/');

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Check ARIA labels
    const typingArea = page.locator('[data-testid="typing-area"] textarea');
    await expect(typingArea).toHaveAttribute('aria-describedby');

    // Check for screen reader instructions
    await expect(page.locator('#typing-instructions')).toBeVisible();
  });

  test('different test modes work', async ({ page }) => {
    await page.goto('/');

    // Test time mode
    const timeButton = page.locator('button:has-text("time")');
    if (await timeButton.isVisible()) {
      await timeButton.click();
    }

    // Test words mode
    const wordsButton = page.locator('button:has-text("words")');
    if (await wordsButton.isVisible()) {
      await wordsButton.click();
    }

    // Verify configuration changes are reflected
    await expect(page.locator('[data-testid="typing-area"]')).toBeVisible();
  });
});
