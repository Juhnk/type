import { test, expect } from '@playwright/test';

test.describe('AuthModal E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('login button opens auth modal with proper backdrop', async ({
    page,
  }) => {
    // Click the login button to open the modal
    const loginButton = page.locator('button:has-text("Login")');
    await expect(loginButton).toBeVisible();
    await loginButton.click();

    // Verify modal is visible
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

    // Check that backdrop has proper background color and opacity
    expect(backdropStyles.backgroundColor).toContain('rgba(0, 0, 0');
    expect(backdropStyles.position).toBe('fixed');
    expect(backdropStyles.zIndex).toBe('50');
  });

  test('modal has login and register tabs', async ({ page }) => {
    // Open modal
    await page.locator('button:has-text("Login")').click();

    // Check login tab is active by default
    const loginTab = page.locator('[value="login"]');
    await expect(loginTab).toBeVisible();
    await expect(loginTab).toHaveAttribute('data-state', 'active');

    // Check register tab exists
    const registerTab = page.locator('[value="register"]');
    await expect(registerTab).toBeVisible();

    // Switch to register tab
    await registerTab.click();
    await expect(registerTab).toHaveAttribute('data-state', 'active');
    await expect(loginTab).toHaveAttribute('data-state', 'inactive');
  });

  test('login form has proper fields and validation', async ({ page }) => {
    // Open modal and ensure login tab is active
    await page.locator('button:has-text("Login")').click();
    await page.locator('[value="login"]').click();

    // Check form fields exist
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator(
      'button[type="submit"]:has-text("Sign In")'
    );

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Test form validation - try to submit with invalid data
    await emailInput.fill('invalid-email');
    await passwordInput.fill('123'); // Too short
    await submitButton.click();

    // Wait for validation messages to appear
    await expect(
      page.locator('text=Please enter a valid email address')
    ).toBeVisible();
    await expect(
      page.locator('text=Password must be at least 6 characters')
    ).toBeVisible();
  });

  test('register form has proper fields and validation', async ({ page }) => {
    // Open modal and switch to register tab
    await page.locator('button:has-text("Login")').click();
    await page.locator('[value="register"]').click();

    // Check form fields exist
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator(
      'button[type="submit"]:has-text("Create Account")'
    );

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Verify placeholder text is different for register
    await expect(passwordInput).toHaveAttribute(
      'placeholder',
      'Create a password (min. 6 characters)'
    );
  });

  test('modal can be closed by clicking backdrop', async ({ page }) => {
    // Open modal
    await page.locator('button:has-text("Login")').click();
    const modal = page.locator('[data-slot="dialog-content"]');
    await expect(modal).toBeVisible();

    // Click on backdrop (overlay) to close modal
    const backdrop = page.locator('[data-slot="dialog-overlay"]');
    await backdrop.click({ position: { x: 10, y: 10 } }); // Click on a corner of backdrop

    // Verify modal is closed
    await expect(modal).not.toBeVisible();
  });

  test('modal can be closed by clicking X button', async ({ page }) => {
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
  });

  test('modal can be closed by pressing Escape key', async ({ page }) => {
    // Open modal
    await page.locator('button:has-text("Login")').click();
    const modal = page.locator('[data-slot="dialog-content"]');
    await expect(modal).toBeVisible();

    // Press Escape key
    await page.keyboard.press('Escape');

    // Verify modal is closed
    await expect(modal).not.toBeVisible();
  });

  test('modal is properly centered and responsive', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.locator('button:has-text("Login")').click();

    const modal = page.locator('[data-slot="dialog-content"]');
    await expect(modal).toBeVisible();

    // Check modal is centered
    const modalBox = await modal.boundingBox();
    const viewport = page.viewportSize();

    expect(modalBox).toBeTruthy();
    if (modalBox && viewport) {
      const modalCenterX = modalBox.x + modalBox.width / 2;
      const modalCenterY = modalBox.y + modalBox.height / 2;
      const viewportCenterX = viewport.width / 2;
      const viewportCenterY = viewport.height / 2;

      // Allow some tolerance for centering
      expect(Math.abs(modalCenterX - viewportCenterX)).toBeLessThan(50);
      expect(Math.abs(modalCenterY - viewportCenterY)).toBeLessThan(50);
    }

    // Close modal
    await page.keyboard.press('Escape');

    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.locator('button:has-text("Login")').click();

    await expect(modal).toBeVisible();
    // Modal should still be usable on mobile
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('form inputs are accessible and keyboard navigable', async ({
    page,
  }) => {
    // Open modal
    await page.locator('button:has-text("Login")').click();

    // Test keyboard navigation
    await page.keyboard.press('Tab'); // Should focus email input
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeFocused();

    await page.keyboard.press('Tab'); // Should focus password input
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeFocused();

    await page.keyboard.press('Tab'); // Should focus submit button
    const submitButton = page.locator(
      'button[type="submit"]:has-text("Sign In")'
    );
    await expect(submitButton).toBeFocused();

    // Check ARIA labels and accessibility attributes
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Check form labels are properly associated
    const emailLabel = page.locator('label:has-text("Email")');
    const passwordLabel = page.locator('label:has-text("Password")');
    await expect(emailLabel).toBeVisible();
    await expect(passwordLabel).toBeVisible();
  });

  test('modal z-index ensures it appears above all content', async ({
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
    expect(parseInt(modalStyles.zIndex)).toBeGreaterThanOrEqual(9999);

    // Check backdrop z-index
    const backdrop = page.locator('[data-slot="dialog-overlay"]');
    const backdropStyles = await backdrop.evaluate((el) => {
      return window.getComputedStyle(el);
    });

    // Backdrop should also have high z-index
    expect(parseInt(backdropStyles.zIndex)).toBeGreaterThanOrEqual(50);
  });

  test('modal backdrop blocks interaction with background content', async ({
    page,
  }) => {
    // Try to click on something behind the modal
    await page.locator('button:has-text("Login")').click();

    const modal = page.locator('[data-slot="dialog-content"]');
    await expect(modal).toBeVisible();

    // Try to click on header elements behind the modal
    // This should not trigger any actions because backdrop should block it
    const homeLink = page.locator('a:has-text("Home")');

    // Get initial modal state
    const modalVisibleBefore = await modal.isVisible();

    // Try to click on background content
    try {
      await homeLink.click({ timeout: 1000, force: false });
    } catch (error) {
      // This is expected - background should not be clickable
    }

    // Modal should still be visible (click should have been blocked)
    const modalVisibleAfter = await modal.isVisible();
    expect(modalVisibleBefore).toBe(modalVisibleAfter);
    expect(modalVisibleAfter).toBe(true);
  });
});
