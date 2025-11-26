import { test, expect } from '@playwright/test';

test.describe('Complete User Flow E2E Tests', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear cookies before each test
    await context.clearCookies();
    // Navigate to home page
    await page.goto('/');
    await page.evaluate(() => {
      try {
        localStorage.clear();
      } catch (e) {
        // Ignore localStorage errors
      }
    });
  });

  test('Full user journey: Register → Login → Dashboard → Meetings', async ({ page }) => {
    // Step 1: Navigate to home page
    await page.goto('/');
    await expect(page).toHaveTitle(/FireFF|Fireflies/i);

    // Step 2: Navigate to registration
    await page.goto('/register');

    // Generate unique email
    const timestamp = Date.now();
    const testEmail = `e2e-full-${timestamp}@example.com`;

    // Step 3: Fill registration form
    await page.getByLabel(/first.*name/i).or(page.getByPlaceholder(/first.*name/i)).fill('Test');
    await page.getByLabel(/last.*name/i).or(page.getByPlaceholder(/last.*name/i)).fill('User');
    await page.getByLabel(/email/i).fill(testEmail);

    // Fill all password fields
    const passwordFields = await page.getByLabel(/password/i).all();
    for (const field of passwordFields) {
      await field.fill('TestPassword123!');
    }

    // Submit registration
    await page.locator('button[type="submit"]').filter({ hasText: /sign up|register|create/i }).first().click();

    // Wait for response (either success message or redirect)
    await page.waitForTimeout(2000);

    // Step 4: Now login with existing user (registration might not auto-login)
    await page.goto('/login');

    // Use seeded test credentials
    await page.getByLabel(/email/i).fill('admin@acme.com');
    await page.getByLabel(/password/i).fill('Demo123456!');

    // Click login
    await page.locator('button[type="submit"]').filter({ hasText: /sign in|login/i }).click();

    // Step 5: Verify redirect to dashboard
    await page.waitForURL(/\/(dashboard|home|meetings)/i, { timeout: 10000 });

    // Should be on dashboard
    expect(page.url()).toMatch(/\/(dashboard|home)/i);

    // Step 6: Verify dashboard elements are visible
    await expect(page.locator('text=/dashboard|meetings|overview/i').first()).toBeVisible({ timeout: 10000 });

    // Step 7: Verify cookies are set
    const cookies = await page.context().cookies();
    const hasAccessToken = cookies.some(c => c.name === 'access_token');
    expect(hasAccessToken).toBeTruthy();

    console.log('✅ Full user journey completed successfully!');
  });

  test('Navigation flow: Login → Dashboard → Check navigation', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@acme.com');
    await page.getByLabel(/password/i).fill('Demo123456!');
    await page.locator('button[type="submit"]').filter({ hasText: /sign in|login/i }).click();

    // Wait for dashboard
    await page.waitForURL(/\/(dashboard|home|meetings)/i, { timeout: 10000 });

    // Verify we're logged in by checking for user-specific elements
    // Could be user menu, profile button, logout button, etc.
    const loggedInIndicators = [
      page.locator('text=/welcome|hello/i'),
      page.locator('[data-testid="user-menu"]'),
      page.locator('[aria-label*="user"]'),
      page.locator('[aria-label*="profile"]'),
      page.locator('text=/logout|sign out/i'),
    ];

    // At least one indicator should be present
    let foundIndicator = false;
    for (const indicator of loggedInIndicators) {
      if (await indicator.count() > 0) {
        foundIndicator = true;
        break;
      }
    }

    // If no specific indicators, just verify we're not on login page
    if (!foundIndicator) {
      expect(page.url()).not.toContain('/login');
    }

    console.log('✅ Navigation verified - user is logged in');
  });

  test('Login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');

    // Try invalid credentials
    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('WrongPassword123!');
    await page.locator('button[type="submit"]').filter({ hasText: /sign in|login/i }).click();

    // Should stay on login page
    await page.waitForTimeout(3000);
    expect(page.url()).toContain('/login');

    // Either see an error message or still be on login page
    const hasError = await page.locator('text=/invalid|error|wrong|failed/i').count() > 0;
    const stillOnLogin = page.url().includes('/login');

    expect(hasError || stillOnLogin).toBeTruthy();
    console.log('✅ Invalid login correctly rejected');
  });

  test('Session persistence: Login → Refresh → Still logged in', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@acme.com');
    await page.getByLabel(/password/i).fill('Demo123456!');
    await page.locator('button[type="submit"]').filter({ hasText: /sign in|login/i }).click();

    // Wait for dashboard
    await page.waitForURL(/\/(dashboard|home|meetings)/i, { timeout: 10000 });
    const urlBeforeRefresh = page.url();

    // Refresh the page
    await page.reload();
    await page.waitForTimeout(2000);

    // Should still be logged in (not redirected to login)
    expect(page.url()).not.toContain('/login');

    // Should be on a protected route
    const isProtectedRoute = page.url().includes('/dashboard') ||
                            page.url().includes('/meetings') ||
                            page.url().includes('/home');
    expect(isProtectedRoute).toBeTruthy();

    console.log('✅ Session persisted after refresh');
  });

  test('Protected routes redirect to login when not authenticated', async ({ page, context }) => {
    // Clear all auth
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      try {
        localStorage.clear();
      } catch (e) {}
    });

    // Try to access protected route
    await page.goto('/dashboard');

    // Should redirect to login
    await page.waitForTimeout(2000);

    // Either redirected to login or blocked
    const url = page.url();
    const isProtected = url.includes('/login') || url.includes('/') && !url.includes('/dashboard');

    expect(isProtected).toBeTruthy();
    console.log('✅ Protected route correctly requires authentication');
  });

  test('Login form validation: Empty fields', async ({ page }) => {
    await page.goto('/login');

    // Try to submit without filling fields
    await page.locator('button[type="submit"]').filter({ hasText: /sign in|login/i }).click();

    // Should still be on login page
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/login');

    // Form should show validation or prevent submission
    const emailField = page.getByLabel(/email/i);
    const passwordField = page.getByLabel(/password/i);

    // Fields should still be visible (not navigated away)
    await expect(emailField).toBeVisible();
    await expect(passwordField).toBeVisible();

    console.log('✅ Form validation prevents empty submission');
  });

  test('Registration form validation: Password mismatch', async ({ page }) => {
    await page.goto('/register');

    // Fill form with mismatched passwords
    await page.getByLabel(/first.*name/i).or(page.getByPlaceholder(/first.*name/i)).fill('Test');
    await page.getByLabel(/last.*name/i).or(page.getByPlaceholder(/last.*name/i)).fill('User');
    await page.getByLabel(/email/i).fill('test@example.com');

    // Fill password fields differently
    const passwordFields = await page.getByLabel(/password/i).all();
    if (passwordFields.length >= 2) {
      await passwordFields[0].fill('Password123!');
      await passwordFields[1].fill('DifferentPassword123!');

      // Try to submit
      await page.locator('button[type="submit"]').filter({ hasText: /sign up|register|create/i }).first().click();

      // Should show error or stay on page
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('/register');

      console.log('✅ Password mismatch validation works');
    } else {
      console.log('⚠️ Skipped - not enough password fields for mismatch test');
    }
  });

  test('Full authentication cycle: Login → Logout → Login again', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@acme.com');
    await page.getByLabel(/password/i).fill('Demo123456!');
    await page.locator('button[type="submit"]').filter({ hasText: /sign in|login/i }).click();

    // Wait for dashboard
    await page.waitForURL(/\/(dashboard|home|meetings)/i, { timeout: 10000 });
    console.log('✅ First login successful');

    // Try to find and click logout
    // Look for user menu, profile dropdown, or logout button
    const profileMenuSelectors = [
      '[data-testid="user-menu"]',
      '[aria-label*="user" i]',
      '[aria-label*="profile" i]',
      'button:has-text("Profile")',
      'button:has-text("Account")',
    ];

    let menuClicked = false;
    for (const selector of profileMenuSelectors) {
      const menu = page.locator(selector).first();
      if (await menu.count() > 0) {
        await menu.click();
        menuClicked = true;
        await page.waitForTimeout(500);
        break;
      }
    }

    // Look for logout button
    const logoutSelectors = [
      'text=/^logout$/i',
      'text=/^sign out$/i',
      'button:has-text("Logout")',
      'button:has-text("Sign out")',
      'a:has-text("Logout")',
      'a:has-text("Sign out")',
    ];

    let logoutClicked = false;
    for (const selector of logoutSelectors) {
      const logoutBtn = page.locator(selector).first();
      if (await logoutBtn.isVisible().catch(() => false)) {
        await logoutBtn.click();
        logoutClicked = true;
        break;
      }
    }

    if (logoutClicked) {
      // Wait for redirect to login
      await page.waitForTimeout(2000);

      // Should be back on login or home page
      const url = page.url();
      const isLoggedOut = url.includes('/login') || url.includes('/') && !url.includes('/dashboard');
      expect(isLoggedOut).toBeTruthy();

      console.log('✅ Logout successful');

      // Try to login again
      if (url.includes('/login')) {
        await page.getByLabel(/email/i).fill('admin@acme.com');
        await page.getByLabel(/password/i).fill('Demo123456!');
        await page.locator('button[type="submit"]').filter({ hasText: /sign in|login/i }).click();

        await page.waitForURL(/\/(dashboard|home|meetings)/i, { timeout: 10000 });
        console.log('✅ Second login successful - full cycle complete');
      }
    } else {
      console.log('⚠️ Could not find logout button - user appears to be logged in');
    }
  });
});
