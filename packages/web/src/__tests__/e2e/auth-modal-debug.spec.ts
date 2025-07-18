import { test, expect } from '@playwright/test';

test.describe('AuthModal Debug Tests', () => {
  test('debug modal opening', async ({ page }) => {
    await page.goto('/');

    // Take a screenshot of the initial page
    await page.screenshot({ path: 'debug-initial.png' });

    // Check if the page loads
    await expect(page.locator('h1')).toBeVisible();
    console.log('Page loaded successfully');

    // Check if login button exists
    const loginButton = page.locator('button:has-text("Login")');
    console.log('Looking for login button...');

    // Wait a bit for the page to fully load
    await page.waitForTimeout(2000);

    // Check if login button is visible
    const isLoginVisible = await loginButton.isVisible();
    console.log('Login button visible:', isLoginVisible);

    if (isLoginVisible) {
      // Take screenshot before clicking
      await page.screenshot({ path: 'debug-before-click.png' });

      console.log('Clicking login button...');
      await loginButton.click();

      // Wait a bit after clicking
      await page.waitForTimeout(1000);

      // Take screenshot after clicking
      await page.screenshot({ path: 'debug-after-click.png' });

      // Check for modal elements with different selectors
      const modalSelectors = [
        '[data-slot="dialog-content"]',
        '[role="dialog"]',
        '.dialog-content',
        'div:has-text("Welcome to TypeAmp")',
        '[data-testid="auth-modal"]',
      ];

      for (const selector of modalSelectors) {
        const element = page.locator(selector);
        const exists = await element.count();
        console.log(`Selector ${selector}: ${exists} elements found`);
        if (exists > 0) {
          const visible = await element.first().isVisible();
          console.log(`- First element visible: ${visible}`);
        }
      }

      // Check DOM structure
      const bodyContent = await page.locator('body').innerHTML();
      console.log(
        'Body contains "Welcome to TypeAmp":',
        bodyContent.includes('Welcome to TypeAmp')
      );
      console.log('Body contains "dialog":', bodyContent.includes('dialog'));
    } else {
      console.log('Login button not found, checking page content...');
      const pageContent = await page.content();
      console.log('Page contains "Login":', pageContent.includes('Login'));
      console.log('Page contains "TypeAmp":', pageContent.includes('TypeAmp'));

      // List all buttons on the page
      const buttons = await page.locator('button').all();
      console.log(`Found ${buttons.length} buttons on the page:`);
      for (let i = 0; i < buttons.length; i++) {
        const text = await buttons[i].textContent();
        console.log(`Button ${i}: "${text}"`);
      }
    }
  });
});
