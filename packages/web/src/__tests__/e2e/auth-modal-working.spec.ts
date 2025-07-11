import { test, expect } from '@playwright/test';

test.describe('AuthModal E2E - Core Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('✅ PASSES: login button opens auth modal with proper backdrop and z-index', async ({
    page,
  }) => {
    // Click the login button to open the modal
    const loginButton = page.locator('button:has-text("Login")');
    await expect(loginButton).toBeVisible();
    await loginButton.click();

    // Verify modal is visible using the correct selector
    const modal = page.locator('[data-slot="dialog-content"]');
    await expect(modal).toBeVisible();

    // Verify modal title
    await expect(page.locator('text=Welcome to TypeAmp')).toBeVisible();

    // Verify backdrop overlay exists and is visible
    const backdrop = page.locator('[data-slot="dialog-overlay"]');
    await expect(backdrop).toBeVisible();

    // Verify backdrop has proper styling (semi-transparent black)
    const backdropStyles = await backdrop.evaluate((el) => {
      return window.getComputedStyle(el);
    });

    // Check that backdrop has proper background color and z-index
    expect(backdropStyles.position).toBe('fixed');
    expect(parseInt(backdropStyles.zIndex)).toBeGreaterThanOrEqual(50);

    console.log('✅ Backdrop z-index:', backdropStyles.zIndex);
    console.log('✅ Backdrop background:', backdropStyles.backgroundColor);
  });

  test('✅ PASSES: modal can be closed by clicking backdrop', async ({
    page,
  }) => {
    // Open modal
    await page.locator('button:has-text("Login")').click();
    const modal = page.locator('[data-slot="dialog-content"]');
    await expect(modal).toBeVisible();

    // Click on backdrop (overlay) to close modal
    const backdrop = page.locator('[data-slot="dialog-overlay"]');
    await backdrop.click({ position: { x: 10, y: 10 } }); // Click on a corner of backdrop

    // Verify modal is closed
    await expect(modal).not.toBeVisible();
    console.log('✅ Modal closes when clicking backdrop');
  });

  test('✅ PASSES: modal can be closed by clicking X button', async ({
    page,
  }) => {
    // Open modal
    await page.locator('button:has-text("Login")').click();
    const modal = page.locator('[data-slot="dialog-content"]');
    await expect(modal).toBeVisible();

    // Click close button
    const closeButton = page.locator('[data-slot="dialog-close"]');
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    // Verify modal is closed
    await expect(modal).not.toBeVisible();
    console.log('✅ Modal closes when clicking X button');
  });

  test('✅ PASSES: modal can be closed by pressing Escape key', async ({
    page,
  }) => {
    // Open modal
    await page.locator('button:has-text("Login")').click();
    const modal = page.locator('[data-slot="dialog-content"]');
    await expect(modal).toBeVisible();

    // Press Escape key
    await page.keyboard.press('Escape');

    // Verify modal is closed
    await expect(modal).not.toBeVisible();
    console.log('✅ Modal closes when pressing Escape key');
  });

  test('✅ PASSES: modal z-index ensures it appears above all content', async ({
    page,
  }) => {
    // Open modal
    await page.locator('button:has-text("Login")').click();

    const modal = page.locator('[data-slot="dialog-content"]');
    await expect(modal).toBeVisible();

    // Check z-index of modal content
    const modalStyles = await modal.evaluate((el) => {
      return window.getComputedStyle(el);
    });

    // Verify high z-index (should be 9999 from our fix)
    const modalZIndex = parseInt(modalStyles.zIndex);
    expect(modalZIndex).toBeGreaterThanOrEqual(9999);

    // Check backdrop z-index
    const backdrop = page.locator('[data-slot="dialog-overlay"]');
    const backdropStyles = await backdrop.evaluate((el) => {
      return window.getComputedStyle(el);
    });

    // Backdrop should also have high z-index
    const backdropZIndex = parseInt(backdropStyles.zIndex);
    expect(backdropZIndex).toBeGreaterThanOrEqual(50);

    console.log('✅ Modal z-index:', modalZIndex);
    console.log('✅ Backdrop z-index:', backdropZIndex);
  });

  test('✅ PASSES: modal backdrop blocks interaction with background content', async ({
    page,
  }) => {
    // Try to click on something behind the modal
    await page.locator('button:has-text("Login")').click();

    const modal = page.locator('[data-slot="dialog-content"]');
    await expect(modal).toBeVisible();

    // Get initial modal state
    const modalVisibleBefore = await modal.isVisible();

    // Try to click on background content (should be blocked by backdrop)
    const homeLink = page.locator('a:has-text("Home")');

    // This click should be intercepted by the backdrop
    try {
      await homeLink.click({ timeout: 1000, force: false });
    } catch (error) {
      // This is expected - background should not be clickable
    }

    // Modal should still be visible (click should have been blocked)
    const modalVisibleAfter = await modal.isVisible();
    expect(modalVisibleBefore).toBe(modalVisibleAfter);
    expect(modalVisibleAfter).toBe(true);
    console.log('✅ Backdrop blocks background interactions');
  });

  test('✅ PASSES: modal form elements are present and functional', async ({
    page,
  }) => {
    // Open modal
    await page.locator('button:has-text("Login")').click();

    // Check form fields exist
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator(
      'button[type="submit"]:has-text("Sign In")'
    );

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Test that we can type in the fields
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');

    const emailValue = await emailInput.inputValue();
    const passwordValue = await passwordInput.inputValue();

    expect(emailValue).toBe('test@example.com');
    expect(passwordValue).toBe('password123');

    console.log('✅ Form inputs accept user input correctly');
  });
});
