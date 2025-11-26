import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear cookies before each test
    await context.clearCookies();
    // Navigate to the app first, then clear localStorage
    await page.goto('/');
    await page.evaluate(() => {
      try {
        localStorage.clear();
      } catch (e) {
        // Ignore localStorage errors for pages that don't have access
      }
    });
  });

  test('should load login page successfully', async ({ page }) => {
    await page.goto('/login');

    // Verify page loaded
    await expect(page).toHaveTitle(/FireFF|Fireflies/i);

    // Verify login form elements exist
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    // Look for the submit button specifically, not the Google sign-in button
    await expect(page.locator('button[type="submit"]').filter({ hasText: /sign in|login/i })).toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    await page.goto('/login');

    // Try to submit empty form (click the submit button, not Google button)
    await page.locator('button[type="submit"]').filter({ hasText: /sign in|login/i }).click();

    // Should see validation errors
    await expect(page.locator('text=/email.*required/i').or(page.locator('text=/required/i')).first()).toBeVisible({ timeout: 5000 });
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in credentials from seeded data
    await page.getByLabel(/email/i).fill('admin@acme.com');
    await page.getByLabel(/password/i).fill('Demo123456!');

    // Submit form (click submit button, not Google button)
    await page.locator('button[type="submit"]').filter({ hasText: /sign in|login/i }).click();

    // Should redirect to dashboard or home
    await expect(page).toHaveURL(/\/(dashboard|home|meetings)/i, { timeout: 10000 });

    // Verify cookies are set
    const cookies = await page.context().cookies();
    const hasAccessToken = cookies.some(c => c.name === 'access_token');
    const hasRefreshToken = cookies.some(c => c.name === 'refresh_token');

    expect(hasAccessToken).toBeTruthy();
    expect(hasRefreshToken).toBeTruthy();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in invalid credentials
    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('WrongPassword123!');

    // Submit form (click submit button, not Google button)
    await page.locator('button[type="submit"]').filter({ hasText: /sign in|login/i }).click();

    // Should see error message
    await expect(page.locator('text=/invalid.*credentials|wrong.*password|authentication.*failed/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('should load registration page successfully', async ({ page }) => {
    await page.goto('/register');

    // Verify page loaded
    await expect(page).toHaveTitle(/FireFF|Fireflies/i);

    // Verify registration form elements exist
    await expect(page.getByLabel(/first.*name/i).or(page.getByPlaceholder(/first.*name/i))).toBeVisible();
    await expect(page.getByLabel(/last.*name/i).or(page.getByPlaceholder(/last.*name/i))).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /sign up|register|create.*account/i })).toBeVisible();
  });

  test('should register new user successfully', async ({ page }) => {
    await page.goto('/register');

    // Generate unique email for this test run
    const timestamp = Date.now();
    const testEmail = `e2e-test-${timestamp}@example.com`;

    // Fill in registration form
    await page.getByLabel(/first.*name/i).or(page.getByPlaceholder(/first.*name/i)).fill('Test');
    await page.getByLabel(/last.*name/i).or(page.getByPlaceholder(/last.*name/i)).fill('User');
    await page.getByLabel(/email/i).fill(testEmail);

    // Fill password field (may be multiple password fields for confirm)
    const passwordFields = await page.getByLabel(/password/i).all();
    for (const field of passwordFields) {
      await field.fill('TestPassword123!');
    }

    // Submit form (use submit button, not social login buttons)
    await page.locator('button[type="submit"]').filter({ hasText: /sign up|register|create/i }).click();

    // Should see success message or redirect to verify email page
    await expect(
      page.locator('text=/success.*registered|verify.*email|check.*email/i').first()
        .or(page.locator('text=/thank you/i').first())
    ).toBeVisible({ timeout: 10000 });
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@acme.com');
    await page.getByLabel(/password/i).fill('Demo123456!');
    await page.locator('button[type="submit"]').filter({ hasText: /sign in|login/i }).click();

    // Wait for redirect
    await expect(page).toHaveURL(/\/(dashboard|home|meetings)/i, { timeout: 10000 });

    // Find and click logout button (may be in dropdown or menu)
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i })
      .or(page.getByRole('link', { name: /logout|sign out/i }));

    // May need to open a menu first
    const profileMenu = page.locator('[data-testid="user-menu"]')
      .or(page.locator('[aria-label*="user"]').or(page.locator('[aria-label*="profile"]')));

    if (await profileMenu.count() > 0) {
      await profileMenu.first().click();
    }

    await logoutButton.first().click();

    // Should redirect to login or home page
    await expect(page).toHaveURL(/\/(login|\/)/i, { timeout: 10000 });

    // Cookies should be cleared
    const cookies = await page.context().cookies();
    const hasAccessToken = cookies.some(c => c.name === 'access_token');

    expect(hasAccessToken).toBeFalsy();
  });

  test('should maintain session on page refresh', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@acme.com');
    await page.getByLabel(/password/i).fill('Demo123456!');
    await page.locator('button[type="submit"]').filter({ hasText: /sign in|login/i }).click();

    // Wait for redirect
    await expect(page).toHaveURL(/\/(dashboard|home|meetings)/i, { timeout: 10000 });

    // Refresh page
    await page.reload();

    // Should still be logged in (not redirected to login)
    await expect(page).not.toHaveURL(/login/, { timeout: 5000 });
  });
});
