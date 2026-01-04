import { test, expect } from '@playwright/test';

test.describe('Signup page visuals', () => {
  test('signup form matches baseline screenshot', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForSelector('form');
    const form = page.locator('form');
    // Capture the signup form component screenshot and compare to baseline snapshot
    await expect(form).toHaveScreenshot('signup-form.png', { animations: 'disabled' });
  });
});
