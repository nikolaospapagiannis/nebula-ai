import { test, expect } from '@playwright/test';

test('Debug login flow', async ({ page }) => {
  // Capture console logs
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));

  // Capture network requests
  page.on('request', request => {
    if (request.url().includes('/auth/login')) {
      console.log('LOGIN REQUEST:', request.url(), request.method());
      console.log('REQUEST BODY:', request.postData());
    }
  });

  page.on('response', response => {
    if (response.url().includes('/auth/login')) {
      console.log('LOGIN RESPONSE:', response.status(), response.statusText());
      response.text().then(body => console.log('RESPONSE BODY:', body));
    }
  });

  // Navigate to login
  await page.goto('/login');
  console.log('Navigated to login page');

  // Fill form
  await page.getByLabel(/email/i).fill('admin@acme.com');
  await page.getByLabel(/password/i).fill('Demo123456!');
  console.log('Form filled');

  // Click submit
  await page.locator('button[type="submit"]').filter({ hasText: /sign in|login/i }).click();
  console.log('Submit clicked');

  // Wait a bit to see what happens
  await page.waitForTimeout(5000);

  console.log('Current URL:', page.url());

  // Take screenshot
  await page.screenshot({ path: 'debug-after-login.png', fullPage: true });
});
