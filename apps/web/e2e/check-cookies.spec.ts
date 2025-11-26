import { test, expect } from '@playwright/test';

test('Check what cookies are actually set after login', async ({ page, context }) => {
  await context.clearCookies();

  // Login
  await page.goto('http://localhost:3006/login');
  await page.getByLabel(/email/i).fill('admin@acme.com');
  await page.getByLabel(/password/i).fill('Demo123456!');
  await page.locator('button[type="submit"]').filter({ hasText: /sign in|login/i }).click();

  // Wait for redirect
  await page.waitForTimeout(3000);

  console.log('Current URL:', page.url());

  // Get ALL cookies
  const cookies = await context.cookies();
  console.log('\n=== ALL COOKIES ===');
  cookies.forEach(cookie => {
    console.log(`${cookie.name}: ${cookie.value.substring(0, 50)}...`);
    console.log(`  Domain: ${cookie.domain}, Path: ${cookie.path}, HttpOnly: ${cookie.httpOnly}, Secure: ${cookie.secure}`);
  });

  // Try to fetch meetings with these cookies
  console.log('\n=== FETCHING MEETINGS ===');
  const response = await page.evaluate(async () => {
    try {
      const res = await fetch('http://localhost:4000/api/meetings', {
        method: 'GET',
        credentials: 'include', // Send cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return {
        status: res.status,
        statusText: res.statusText,
        body: await res.text(),
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });

  console.log('Meetings API Response:', JSON.stringify(response, null, 2));
});
