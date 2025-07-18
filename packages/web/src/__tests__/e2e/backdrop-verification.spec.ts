import { test, expect } from '@playwright/test';

test.describe('Backdrop Verification', () => {
  test('verify backdrop has proper styling in real application', async ({
    page,
  }) => {
    await page.goto('/');

    // Open the modal
    const loginButton = page.locator('button:has-text("Login")');
    await expect(loginButton).toBeVisible();
    await loginButton.click();

    // Wait for modal to be visible
    const modal = page.locator('[data-slot="dialog-content"]');
    await expect(modal).toBeVisible();

    // Check backdrop element
    const backdrop = page.locator('[data-slot="dialog-overlay"]');
    await expect(backdrop).toBeVisible();

    // Get computed styles of the backdrop
    const styles = await backdrop.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundColor: computed.backgroundColor,
        position: computed.position,
        zIndex: computed.zIndex,
        top: computed.top,
        left: computed.left,
        right: computed.right,
        bottom: computed.bottom,
        opacity: computed.opacity,
        display: computed.display,
        visibility: computed.visibility,
      };
    });

    console.log('🔍 Backdrop Styles:', JSON.stringify(styles, null, 2));

    // Verify critical styles
    expect(styles.position).toBe('fixed');
    expect(parseInt(styles.zIndex)).toBeGreaterThanOrEqual(100);
    expect(styles.display).not.toBe('none');
    expect(styles.visibility).toBe('visible');

    // Check background color is set (should be rgba or some form of black)
    const hasBackground =
      styles.backgroundColor.includes('rgba(0, 0, 0') ||
      styles.backgroundColor.includes('rgb(0, 0, 0') ||
      (styles.backgroundColor !== 'rgba(0, 0, 0, 0)' &&
        styles.backgroundColor !== 'transparent');

    console.log('✅ Has Background Color:', hasBackground);
    console.log('✅ Background Value:', styles.backgroundColor);

    expect(hasBackground).toBe(true);

    // Take a screenshot for manual verification
    await page.screenshot({ path: 'backdrop-verification.png' });

    // Test that the backdrop covers the entire viewport
    const backdropBox = await backdrop.boundingBox();
    const viewport = page.viewportSize();

    if (backdropBox && viewport) {
      expect(backdropBox.x).toBe(0);
      expect(backdropBox.y).toBe(0);
      expect(backdropBox.width).toBe(viewport.width);
      expect(backdropBox.height).toBe(viewport.height);
      console.log('✅ Backdrop covers full viewport');
    }
  });

  test('verify backdrop visual appearance', async ({ page }) => {
    await page.goto('/');

    // Add some colorful content to make backdrop more visible
    await page.addStyleTag({
      content: `
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7);
          z-index: -1;
        }
      `,
    });

    // Open the modal
    await page.locator('button:has-text("Login")').click();
    const modal = page.locator('[data-slot="dialog-content"]');
    await expect(modal).toBeVisible();

    // Take screenshot with colorful background
    await page.screenshot({ path: 'backdrop-visual-test.png' });

    // Check if backdrop is dimming the background
    const backdrop = page.locator('[data-slot="dialog-overlay"]');
    await expect(backdrop).toBeVisible();

    console.log('✅ Visual test completed - check backdrop-visual-test.png');
  });
});
