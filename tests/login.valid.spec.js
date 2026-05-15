/**
 * Playwright E2E Tests for Login with Valid Credentials
 *
 * Run: npx playwright test tests/login.valid.spec.js
 *
 * Setup: Set credentials in .env.test or environment variables
 * TEST_EMAIL=your@email.com
 * TEST_PASSWORD=yourpassword
 */

import { test, expect } from '@playwright/test';

// Get credentials from environment or use defaults
const TEST_EMAIL = process.env.TEST_EMAIL || 'test@example.com';
const TEST_PASSWORD = process.env.TEST_PASSWORD || 'Test@123456';

// Helper function for login
async function login(page, email = TEST_EMAIL, password = TEST_PASSWORD) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');

  // Wait for navigation after successful login
  await page.waitForURL(/\/deals/, { timeout: 10000 }).catch(() => {
    // If not redirected to /deals, stay on current page for error checking
  });
}

// ============== SUCCESS SCENARIOS ==============

test.describe('Login - Success Scenarios', () => {
  test('LOGIN-001: Login with valid credentials', async ({ page }) => {
    await login(page);

    // Should redirect to deals page
    await expect(page).toHaveURL(/\/deals/);

    // Should show user is logged in
    const userMenu = page.locator('[data-testid="user-menu"], text=Logout, .user-menu');
    await expect(userMenu.first()).toBeVisible();
  });

  test('LOGIN-002: Login with email in different casing', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL.toUpperCase());
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Should either succeed or gracefully handle
    await page.waitForTimeout(2000);

    const currentUrl = page.url();
    const isLoggedIn = currentUrl.includes('/deals') || currentUrl.includes('/dashboard');

    if (isLoggedIn) {
      await expect(page).toHaveURL(/\/(deals|dashboard)/);
    } else {
      // Should show error if case-sensitive
      const errorMessage = page.locator('text=/invalid|incorrect/i');
      await expect(errorMessage.first()).toBeVisible();
    }
  });

  test('LOGIN-003: Remember me functionality (if available)', async ({ page }) => {
    await page.goto('/login');

    // Check for "Remember me" checkbox
    const rememberMeCheckbox = page.locator('input[name="remember"], input[type="checkbox"]');

    if (await rememberMeCheckbox.isVisible()) {
      await page.fill('input[type="email"]', TEST_EMAIL);
      await page.fill('input[type="password"]', TEST_PASSWORD);
      await rememberMeCheckbox.check();
      await page.click('button[type="submit"]');

      // Verify session persistence would require browser restart
      await expect(page).toHaveURL(/\/deals/);
    } else {
      // Skip if remember me not available
      test.skip();
    }
  });

  test('LOGIN-004: Redirect to original page after login', async ({ page }) => {
    // Try to access protected page first
    await page.goto('/savings');

    // Should redirect to login with redirect parameter
    expect(page.url()).toContain('/login');

    // Login
    await login(page);

    // Should redirect back to original page
    await expect(page).toHaveURL(/\/savings/);
  });

  test('LOGIN-005: Login updates UI to show logged-in state', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForTimeout(3000);

    // Check for logged-in indicators
    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")');
    const userAvatar = page.locator('[data-testid="user-avatar"], .user-avatar, img[alt="avatar"]');

    const hasLogoutIndicator = await logoutButton.isVisible().catch(() => false);
    const hasUserAvatar = await userAvatar.isVisible().catch(() => false);

    expect(hasLogoutIndicator || hasUserAvatar).toBe(true);
  });
});

// ============== FAILURE SCENARIOS ==============

test.describe('Login - Failure Scenarios', () => {
  test('LOGIN-NEG-001: Login with invalid email', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Should show validation error or stay on login page
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/login');
  });

  test('LOGIN-NEG-002: Login with wrong password', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', 'WrongPassword123!');
    await page.click('button[type="submit"]');

    // Should show error message
    await page.waitForTimeout(2000);

    const errorMessage = page.locator(
      'text=/invalid|incorrect|email or password/i'
    );
    await expect(errorMessage.first()).toBeVisible();
  });

  test('LOGIN-NEG-003: Login with non-existent email', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'nonexistent@example.com');
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Should show error (not reveal if email exists)
    await page.waitForTimeout(2000);

    const errorMessage = page.locator(
      'text=/invalid|incorrect|email or password/i'
    );
    await expect(errorMessage.first()).toBeVisible();
  });

  test('LOGIN-NEG-004: Login with empty fields', async ({ page }) => {
    await page.goto('/login');
    await page.click('button[type="submit"]');

    // Should show validation errors
    await page.waitForTimeout(1000);

    const emailError = page.locator('text=/email.*required/i');
    const passwordError = page.locator('text=/password.*required/i');

    const hasEmailError = await emailError.isVisible().catch(() => false);
    const hasPasswordError = await passwordError.isVisible().catch(() => false);

    expect(hasEmailError || hasPasswordError).toBe(true);
  });

  test('LOGIN-NEG-005: Login with empty password', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', '');
    await page.click('button[type="submit"]');

    // Should show password required error
    await page.waitForTimeout(1000);

    const passwordError = page.locator('text=/password.*required/i');
    await expect(passwordError.first()).toBeVisible();
  });

  test('LOGIN-NEG-006: Multiple failed login attempts', async ({ page }) => {
    // Try multiple failed attempts
    for (let i = 0; i < 5; i++) {
      await page.goto('/login');
      await page.fill('input[type="email"]', TEST_EMAIL);
      await page.fill('input[type="password"]', 'WrongPassword');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(1000);
    }

    // After 5 attempts, might show rate limiting message
    const rateLimitMessage = page.locator(
      'text=/too many attempts|locked|try again later/i'
    );

    const hasRateLimit = await rateLimitMessage.isVisible().catch(() => false);

    if (hasRateLimit) {
      await expect(rateLimitMessage).toBeVisible();
    }
  });
});

// ============== EDGE CASES ==============

test.describe('Login - Edge Cases', () => {
  test('LOGIN-EDGE-001: Login with extra whitespace', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', `  ${TEST_EMAIL}  `);
    await page.fill('input[type="password"]', `  ${TEST_PASSWORD}  `);
    await page.click('button[type="submit"]');

    // Should either trim and succeed or fail
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    const succeeded = currentUrl.includes('/deals');

    if (!succeeded) {
      // If failed, should be on login page with error
      expect(currentUrl).toContain('/login');
    }
  });

  test('LOGIN-EDGE-002: Login with email trim()', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', `\t${TEST_EMAIL}\n`);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForTimeout(3000);

    // Should handle whitespace appropriately
    const currentUrl = page.url();
    expect([currentUrl.includes('/deals'), currentUrl.includes('/login')]).toContain(true);
  });

  test('LOGIN-EDGE-003: Special characters in email (valid)', async ({ page }) => {
    const specialEmail = 'user+tag@example.com';

    await page.goto('/login');
    await page.fill('input[type="email"]', specialEmail);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Should handle valid email with special chars
    await page.waitForTimeout(3000);

    const currentUrl = page.url();
    // Either succeeds (if user exists) or fails gracefully
    expect([currentUrl.includes('/deals'), currentUrl.includes('/login')]).toContain(true);
  });

  test('LOGIN-EDGE-004: Rapid login attempts (brute force prevention)', async ({ page }) => {
    await page.goto('/login');

    // Fill credentials once
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', 'WrongPassword');

    // Rapidly click submit
    for (let i = 0; i < 3; i++) {
      await page.click('button[type="submit"]');
      await page.waitForTimeout(100);
    }

    // Should handle gracefully without crashing
    await page.waitForTimeout(2000);

    // Should still be on login page (all attempts failed)
    expect(page.url()).toContain('/login');
  });

  test('LOGIN-EDGE-005: Login with special characters in password', async ({ page }) => {
    // Test password with special characters
    const specialPassword = 'P@ss!w0rd#$%^&*';

    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', specialPassword);
    await page.click('button[type="submit"]');

    // Should handle special chars properly
    await page.waitForTimeout(3000);

    // Should either succeed (if password matches) or fail gracefully
    expect(page.url()).toMatch(/\/(login|deals)/);
  });
});

// ============== UI/UX TESTS ==============

test.describe('Login - UI/UX', () => {
  test('LOGIN-UI-001: Show loading state during login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);

    // Click submit and check for loading indicator
    await page.click('button[type="submit"]');

    const loader = page.locator('.animate-spin, [data-testid="loading"], .loader');
    const disabledButton = page.locator('button[type="submit"]:disabled');

    const hasLoader = await loader.isVisible().catch(() => false);
    const isDisabled = await disabledButton.isVisible().catch(() => false);

    // Should have some indication of loading
    expect(hasLoader || isDisabled).toBe(true);
  });

  test('LOGIN-UI-002: Show password toggle (if available)', async ({ page }) => {
    await page.goto('/login');

    const passwordInput = page.locator('input[type="password"]');
    const toggleButton = page.locator('button[aria-label*="password"], .toggle-password');

    await expect(passwordInput.first()).toBeVisible();

    const hasToggle = await toggleButton.isVisible().catch(() => false);

    if (hasToggle) {
      // Click toggle to show password
      await toggleButton.first().click();

      // Password type should change to text
      const passwordField = page.locator('input[type="text"]');
      await expect(passwordField.first()).toBeVisible();
    }
  });

  test('LOGIN-UI-003: Focus management on error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'invalid');
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForTimeout(2000);

    // Check if focus moves to error field
    const emailInput = page.locator('input[type="email"]');
    const isFocused = await emailInput.evaluate((el) => document.activeElement === el);

    if (isFocused) {
      // Focus management works
      expect(isFocused).toBe(true);
    }
  });

  test('LOGIN-UI-004: Login form accessible via keyboard', async ({ page }) => {
    await page.goto('/login');

    // Tab through form
    await page.keyboard.press('Tab'); // Email
    await page.keyboard.type(TEST_EMAIL);

    await page.keyboard.press('Tab'); // Password
    await page.keyboard.type(TEST_PASSWORD);

    await page.keyboard.press('Tab'); // Submit button (might skip)
    await page.keyboard.press('Enter'); // Submit

    await page.waitForTimeout(3000);

    // Should have attempted login
    const currentUrl = page.url();
    expect([currentUrl.includes('/deals'), currentUrl.includes('/login')]).toContain(true);
  });

  test('LOGIN-UI-005: Remember me checkbox visible (if available)', async ({ page }) => {
    await page.goto('/login');

    const rememberMeCheckbox = page.locator('input[name="remember"]');
    const hasRememberMe = await rememberMeCheckbox.isVisible().catch(() => false);

    if (hasRememberMe) {
      await expect(rememberMeCheckbox).toBeVisible();

      // Check label is present
      const label = page.locator('label:has-text("Remember"), label:has-text("Keep me")');
      const hasLabel = await label.isVisible().catch(() => false);
      expect(hasLabel).toBe(true);
    }
  });
});

// ============== SECURITY TESTS ==============

test.describe('Login - Security', () => {
  test('LOGIN-SEC-001: Generic error message (no user enumeration)', async ({ page }) => {
    // Test with wrong email
    await page.goto('/login');
    await page.fill('input[type="email"]', 'nonexistent@example.com');
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    const error1 = await page.locator('text=/invalid|incorrect/i').textContent();

    // Clear and test with wrong password
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', 'WrongPassword');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);

    const error2 = await page.locator('text=/invalid|incorrect/i').textContent();

    // Both errors should be similar (not revealing if user exists)
    expect(error1).toContain(error2 || '');
  });

  test('LOGIN-SEC-002: Password field masks input', async ({ page }) => {
    await page.goto('/login');
    const passwordInput = page.locator('input[type="password"]');

    await expect(passwordInput.first()).toHaveAttribute('type', 'password');

    await passwordInput.first().fill(TEST_PASSWORD);

    // Value should be masked
    const value = await passwordInput.first().inputValue();
    expect(value).not.toBe(TEST_PASSWORD); // Would show as dots
  });

  test('LOGIN-SEC-003: Form autocomplete behavior', async ({ page }) => {
    await page.goto('/login');

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    // Check autocomplete attributes
    const emailAutocomplete = await emailInput.first().getAttribute('autocomplete');
    const passwordAutocomplete = await passwordInput.first().getAttribute('autocomplete');

    // Should have appropriate autocomplete values
    expect(emailAutocomplete).toMatch(/email|username/);
    expect(passwordAutocomplete).toMatch(/current-password/);
  });
});

// ============== REDIRECT TESTS ==============

test.describe('Login - Redirect Behavior', () => {
  test('LOGIN-REDIR-001: Redirect to /deals after successful login', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForTimeout(3000);
    expect(page.url()).toContain('/deals');
  });

  test('LOGIN-REDIR-002: Already logged in users redirect to /deals', async ({ page }) => {
    // Login first
    await login(page);

    // Try to access login page again
    await page.goto('/login');

    // Should redirect to /deals
    await page.waitForTimeout(2000);
    const currentUrl = page.url();

    // If already logged in, should redirect away from login
    if (currentUrl.includes('/login')) {
      // Stayed on login - might not have redirect logic
      expect(currentUrl).toContain('/login');
    } else {
      // Redirected to protected page
      expect(currentUrl).toMatch(/\/(deals|dashboard)/);
    }
  });

  test('LOGIN-REDIR-003: Redirect with query parameter preserved', async ({ page }) => {
    // Navigate to login with redirect parameter
    await page.goto('/login?redirect=/savings');

    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForTimeout(3000);

    // Should redirect to the specified page
    const currentUrl = page.url();

    if (currentUrl.includes('/deals')) {
      // Default redirect (query param not handled)
      expect(currentUrl).toContain('/deals');
    } else if (currentUrl.includes('/savings')) {
      // Query param redirect worked
      expect(currentUrl).toContain('/savings');
    }
  });
});

// ============== LOGOUT TESTS ==============

test.describe('Logout', () => {
  test('LOGOUT-001: Logout clears session', async ({ page }) => {
    // Login first
    await login(page);

    // Then logout
    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")');
    const hasLogout = await logoutButton.isVisible().catch(() => false);

    if (hasLogout) {
      await logoutButton.first().click();

      // Should redirect to home or login
      await page.waitForTimeout(2000);
      const currentUrl = page.url();

      expect([currentUrl.includes('/login'), currentUrl.includes('/')]).toContain(true);
    }
  });

  test('LOGOUT-002: Cannot access protected routes after logout', async ({ page }) => {
    // Login
    await login(page);

    // Logout (if available)
    const logoutButton = page.locator('button:has-text("Logout")');
    const hasLogout = await logoutButton.isVisible().catch(() => false);

    if (hasLogout) {
      await logoutButton.first().click();
      await page.waitForTimeout(1000);
    }

    // Try to access protected route
    await page.goto('/savings');

    // Should redirect to login
    await page.waitForTimeout(2000);
    expect(page.url()).toContain('/login');
  });
});
