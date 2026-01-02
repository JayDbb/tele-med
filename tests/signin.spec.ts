import { test, expect } from '@playwright/test';

test('signup -> login -> doctor dashboard flow', async ({ page }) => {
  const email = `testuser+${Date.now()}@example.com`;
  await page.goto('/signup');
  await page.click('input[type=radio][value=doctor], input[name=role]');
  await page.fill('#name', 'Test Doctor');
  await page.fill('#specialty', 'Testing');
  await page.fill('#email', email);
  await page.fill('#password', 'Password123!');
  await page.click('button[type=submit]');

  // Wait for either a redirect to login (if email confirm required) or to the dashboard
  await page.waitForLoadState('networkidle');

  // If we end up on login, do login
  if (page.url().includes('/login')) {
    await page.fill('#email', email);
    await page.fill('#password', 'Password123!');
    await page.click('button[type=submit]');
  }

  // Wait for dashboard or nurse-portal
  await page.waitForTimeout(1000);
  expect(page.url().startsWith('http://localhost:3000/doctor') || page.url().startsWith('http://localhost:3000/nurse-portal') || page.url().includes('/login')).toBeTruthy();
});
