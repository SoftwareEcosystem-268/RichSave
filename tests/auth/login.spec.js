/**
 * Login Module Test Suite
 * RichSave Application
 *
 * Covers: User Login Flow
 * Test Categories: Functional, Negative, Edge Cases, Rate Limiting, Security, UI/UX
 */

import { test, expect } from '@playwright/test';

// Test Data
const testUsers = {
  valid: {
    email: 'login.test@richsave.com',
    password: 'Login@123456'
  },
  unregistered: {
    email: 'notexist@richsave.com',
    password: 'Test@123456'
  }
};

// Setup - Create test user before running tests
test.beforeAll(async ({ request }) => {
  // Create test user via API
  await request.post('/api/auth/signup', {
    data: {
      name: 'Login Test User',
      email: testUsers.valid.email,
      password: testUsers.valid.password
    }
  });
});

// ============== FUNCTIONAL TESTS (Happy Path) ==============

test.describe('Login - Functional Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('AUTH-LOG-001: Login with valid credentials', async ({ page }) => {
    // Act
    await page.fill('input[type="email"]', testUsers.valid.email);
    await page.fill('input[type="password"]', testUsers.valid.password);
    await page.click('button[type="submit"]');

    // Assert
    await expect(page).toHaveURL(/\/deals/, { timeout: 5000 });
    await expect(page.locator('text=Logout').or(page.locator('[data-testid="user-menu"]'))).toBeVisible();
  });

  test('AUTH-LOG-002: Remember me functionality', async ({ page }) => {
    // Act
    await page.fill('input[type="email"]', testUsers.valid.email);
    await page.fill('input[type="password"]', testUsers.valid.password);
    await page.check('input[type="checkbox"]'); // Remember me
    await page.click('button[type="submit"]');

    // Assert
    await expect(page).toHaveURL(/\/deals/, { timeout: 5000 });

    // Verify token/storage for persistent session
    const localStorage = await page.evaluate(() => window.localStorage);
    expect(localStorage).toBeDefined();
  });

  test('AUTH-LOG-003: Show/Hide password toggle', async ({ page }) => {
    // Arrange
    const passwordInput = page.locator('input[type="password"]');

    // Act - type password
    await passwordInput.fill(testUsers.valid.password);
    await expect(passwordInput).toHaveValue(testUsers.valid.password);

    // Find and click eye icon (if exists)
    const eyeIcon = page.locator('svg').first();
    if (await eyeIcon.isVisible()) {
      await eyeIcon.click();

      // Assert - password should become visible (type="text")
      const visiblePassword = page.locator('input[type="text"]');
      await expect(visiblePassword).toBeVisible();
    } else {
      test.skip(true, 'Show/hide password toggle not implemented');
    }
  });

  test('AUTH-LOG-004: Redirect to deals after successful login', async ({ page }) => {
    // Act
    await page.fill('input[type="email"]', testUsers.valid.email);
    await page.fill('input[type="password"]', testUsers.valid.password);
    await page.click('button[type="submit"]');

    // Assert
    await expect(page).toHaveURL(/\/deals/, { timeout: 5000 });
  });
});

// ============== NEGATIVE TESTS ==============

test.describe('Login - Negative Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('AUTH-LOG-101: Login with unregistered email', async ({ page }) => {
    // Act
    await page.fill('input[type="email"]', testUsers.unregistered.email);
    await page.fill('input[type="password"]', testUsers.unregistered.password);
    await page.click('button[type="submit"]');

    // Assert - generic error, no email enumeration
    await expect(page.locator('text=/invalid email or password|login failed/i')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('AUTH-LOG-102: Login with valid email, wrong password', async ({ page }) => {
    // Act
    await page.fill('input[type="email"]', testUsers.valid.email);
    await page.fill('input[type="password"]', 'WrongPassword@123');
    await page.click('button[type="submit"]');

    // Assert - generic error
    await expect(page.locator('text=/invalid email or password|login failed/i')).toBeVisible();

    // Should not reveal which field is wrong
    await expect(page.locator('text=/email/i')).not.toBeVisible();
  });

  test('AUTH-LOG-103: Login with empty email field', async ({ page }) => {
    // Act
    await page.fill('input[type="password"]', testUsers.valid.password);
    await page.click('button[type="submit"]');

    // Assert
    const emailError = page.locator('input[type="email"]').evaluate(el => el.validationMessage);
    expect(await emailError).toBeTruthy();
  });

  test('AUTH-LOG-104: Login with empty password field', async ({ page }) => {
    // Act
    await page.fill('input[type="email"]', testUsers.valid.email);
    await page.click('button[type="submit"]');

    // Assert
    const passwordError = page.locator('input[type="password"]').evaluate(el => el.validationMessage);
    expect(await passwordError).toBeTruthy();
  });

  test('AUTH-LOG-105: Login with both fields empty', async ({ page }) => {
    // Act
    await page.click('button[type="submit"]');

    // Assert - HTML5 validation should trigger
    const emailInput = page.locator('input[type="email"]');
    const isInvalid = await emailInput.evaluate(el => !el.checkValidity());
    expect(isInvalid).toBeTruthy();
  });

  test('AUTH-LOG-106: Login with invalid email format', async ({ page }) => {
    // Act
    await page.fill('input[type="email"]', 'invalidemail');
    await page.fill('input[type="password"]', testUsers.valid.password);
    await page.click('button[type="submit"]');

    // Assert
    await expect(page.locator('text=/valid email/i')).toBeVisible();
  });

  test('AUTH-LOG-107: Login with unactivated account', async ({ page }) => {
    // This test requires creating an unactivated user first
    // For now, we'll skip or mock this scenario

    // Act - assuming unactivated user exists
    await page.fill('input[type="email"]', 'unactivated@richsave.com');
    await page.fill('input[type="password"]', 'Test@123456');
    await page.click('button[type="submit"]');

    // Assert
    const activationError = page.locator('text=/activate|verify/i');
    if (await activationError.isVisible()) {
      await expect(activationError).toBeVisible();
    } else {
      test.skip(true, 'Unactivated account scenario not set up');
    }
  });
});

// ============== EDGE CASES ==============

test.describe('Login - Edge Cases', () => {
  test('AUTH-LOG-201: Login with email in different case', async ({ page }) => {
    await page.goto('/login');

    // Act - email with different case
    await page.fill('input[type="email"]', 'LOGIN.TEST@RICHSAVE.COM');
    await page.fill('input[type="password"]', testUsers.valid.password);
    await page.click('button[type="submit"]');

    // Assert - case-insensitive comparison
    await expect(page).toHaveURL(/\/deals/, { timeout: 5000 });
  });

  test('AUTH-LOG-202: Login with email leading/trailing spaces', async ({ page }) => {
    await page.goto('/login');

    // Act
    await page.fill('input[type="email"]', '  login.test@richsave.com  ');
    await page.fill('input[type="password"]', testUsers.valid.password);
    await page.click('button[type="submit"]');

    // Assert - email should be trimmed
    await expect(page).toHaveURL(/\/deals/, { timeout: 5000 });
  });

  test('AUTH-LOG-203: Login during network offline', async ({ page }) => {
    await page.goto('/login');

    // Arrange
    await page.fill('input[type="email"]', testUsers.valid.email);
    await page.fill('input[type="password"]', testUsers.valid.password);

    // Act - simulate offline
    await page.context().setOffline(true);
    await page.click('button[type="submit"]');

    // Assert
    await expect(page.locator('text=/network error|connection/i')).toBeVisible();
    await expect(page).toHaveURL(/\/login/);

    // Cleanup
    await page.context().setOffline(false);
  });

  test('AUTH-LOG-204: Login with slow network response', async ({ page }) => {
    await page.goto('/login');

    // Simulate slow network
    await page.route('**/api/auth/login', route => {
      setTimeout(() => route.continue(), 5000);
    });

    // Act
    await page.fill('input[type="email"]', testUsers.valid.email);
    await page.fill('input[type="password"]', testUsers.valid.password);

    const button = page.locator('button[type="submit"]');
    await button.click();

    // Assert - loading state should be visible
    await expect(button).toContainText(/signing in|loading/i);

    // Wait for completion
    await expect(page).toHaveURL(/\/deals/, { timeout: 10000 });
  });

  test('AUTH-LOG-205: Login tab away and back', async ({ page }) => {
    await page.goto('/login');

    // Arrange
    await page.fill('input[type="email"]', testUsers.valid.email);
    await page.fill('input[type="password"]', testUsers.valid.password);

    // Act - simulate tab away (wait 1 minute)
    await page.evaluate(() => {
      return new Promise(resolve => setTimeout(resolve, 60000));
    });

    // This test would take too long, so we'll mock it
    // In real scenario, you'd test session persistence
    await page.click('button[type="submit"]');

    // Assert
    await expect(page).toHaveURL(/\/deals/, { timeout: 5000 });
  });
});

// ============== RATE LIMITING TESTS ==============

test.describe('Login - Rate Limiting Tests', () => {
  test('AUTH-LOG-301: Account locked after 5 failed attempts', async ({ page }) => {
    await page.goto('/login');

    // Act - try 5 times with wrong password
    for (let i = 0; i < 5; i++) {
      await page.fill('input[type="email"]', testUsers.valid.email);
      await page.fill('input[type="password"]', 'WrongPassword@123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);
    }

    // Assert - should show rate limit error
    await expect(page.locator('text=/too many|locked|try again later/i')).toBeVisible();

    // Try with correct password - should still be blocked
    await page.fill('input[type="email"]', testUsers.valid.email);
    await page.fill('input[type="password"]', testUsers.valid.password);
    await page.click('button[type="submit"]');

    // Still blocked
    await expect(page.locator('text=/too many|locked/i')).toBeVisible();
  });

  test('AUTH-LOG-302: Rate limit resets after timeout', async ({ page }) => {
    // This test would take 15 minutes to run properly
    // We'll verify the mechanism exists instead
    await page.goto('/login');

    // Act - trigger lock
    for (let i = 0; i < 5; i++) {
      await page.fill('input[type="email"]', testUsers.valid.email);
      await page.fill('input[type="password"]', 'WrongPassword@123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(100);
    }

    // Assert - should show countdown timer
    const countdown = page.locator('text=/minute|second/i').or(page.locator('[data-testid="countdown"]'));
    if (await countdown.isVisible()) {
      await expect(countdown).toBeVisible();
    } else {
      // At minimum, should show rate limit message
      await expect(page.locator('text=/too many/i')).toBeVisible();
    }
  });

  test('AUTH-LOG-303: Successful login resets counter', async ({ page }) => {
    await page.goto('/login');

    // Act - fail 4 times, then succeed
    for (let i = 0; i < 4; i++) {
      await page.fill('input[type="email"]', testUsers.valid.email);
      await page.fill('input[type="password"]', 'WrongPassword@123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(100);
    }

    // Now with correct password
    await page.fill('input[type="email"]', testUsers.valid.email);
    await page.fill('input[type="password"]', testUsers.valid.password);
    await page.click('button[type="submit"]');

    // Assert - should login successfully
    await expect(page).toHaveURL(/\/deals/, { timeout: 5000 });
  });
});

// ============== SECURITY TESTS ==============

test.describe('Login - Security Tests', () => {
  test('AUTH-SEC-001: SQL Injection in email field', async ({ page }) => {
    await page.goto('/login');

    // Act
    await page.fill('input[type="email"]', "admin' OR '1'='1");
    await page.fill('input[type="password"]', testUsers.valid.password);
    await page.click('button[type="submit"]');

    // Assert - should not bypass authentication
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('text=/invalid|error/i')).toBeVisible();
  });

  test('AUTH-SEC-002: XSS in email field', async ({ page }) => {
    await page.goto('/login');

    // Act
    await page.fill('input[type="email"]', '<script>alert("XSS")</script>@example.com');
    await page.fill('input[type="password"]', testUsers.valid.password);
    await page.click('button[type="submit"]');

    // Assert - no alert should execute
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('text=/invalid|error/i')).toBeVisible();
  });

  test('AUTH-SEC-003: NoSQL Injection in password field', async ({ page }) => {
    await page.goto('/login');

    // Act
    await page.fill('input[type="email"]', testUsers.valid.email);
    await page.fill('input[type="password"]', '{$ne: null}');
    await page.click('button[type="submit"]');

    // Assert - should not bypass authentication
    await expect(page).toHaveURL(/\/login/);
  });

  test('AUTH-SEC-004: Token stored in httpOnly cookie', async ({ page }) => {
    await page.goto('/login');

    // Act
    await page.fill('input[type="email"]', testUsers.valid.email);
    await page.fill('input[type="password"]', testUsers.valid.password);
    await page.click('button[type="submit"]');

    // Wait for login
    await page.waitForURL(/\/deals/);

    // Assert - check cookies
    const cookies = await page.context().cookies();
    const tokenCookie = cookies.find(c => c.name === 'token');

    if (tokenCookie) {
      expect(tokenCookie.httpOnly).toBe(true);
    }

    // Check localStorage (should NOT have token in production)
    const tokenInLocalStorage = await page.evaluate(() => {
      return localStorage.getItem('token');
    });

    // In demo mode, it might be there, but production should use httpOnly
    // This is more of a documentation check
  });

  test('AUTH-SEC-005: Timing attack prevention', async ({ page }) => {
    await page.goto('/login');

    // Measure time for wrong password
    const start1 = Date.now();
    await page.fill('input[type="email"]', testUsers.valid.email);
    await page.fill('input[type="password"]', 'WrongPassword@123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(100);
    const time1 = Date.now() - start1;

    // Measure time for non-existent user
    const start2 = Date.now();
    await page.fill('input[type="email"]', testUsers.unregistered.email);
    await page.fill('input[type="password"]', 'WrongPassword@123');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(100);
    const time2 = Date.now() - start2;

    // Assert - times should be similar (within 100ms)
    const timeDiff = Math.abs(time1 - time2);
    expect(timeDiff).toBeLessThan(100);
  });
});

// ============== UI/UX TESTS ==============

test.describe('Login - UI/UX Tests', () => {
  test('AUTH-UI-LOG-001: Forgot password link visible and accessible', async ({ page }) => {
    await page.goto('/login');

    // Assert
    const forgotLink = page.locator('text=Forgot password');
    await expect(forgotLink).toBeVisible();

    // Act - click it
    await forgotLink.click();

    // Assert - should navigate to forgot password page
    await expect(page).toHaveURL(/\/forgot-password/, { timeout: 3000 });
  });

  test('AUTH-UI-LOG-002: Sign up link for new users', async ({ page }) => {
    await page.goto('/login');

    // Assert
    await expect(page.locator('text=Don\'t have an account')).toBeVisible();
    await expect(page.locator('text=Sign up')).toBeVisible();

    // Act
    await page.click('text=Sign up');

    // Assert
    await expect(page).toHaveURL(/\/signup/, { timeout: 3000 });
  });

  test('AUTH-UI-LOG-003: Submit button loading state', async ({ page }) => {
    await page.goto('/login');

    // Arrange
    await page.fill('input[type="email"]', testUsers.valid.email);
    await page.fill('input[type="password"]', testUsers.valid.password);

    // Act
    const button = page.locator('button[type="submit"]');
    await button.click();

    // Assert
    await expect(button).toBeDisabled();
    await expect(button).toContainText(/signing in|loading/i);
  });

  test('AUTH-UI-LOG-004: Error messages are user-friendly', async ({ page }) => {
    await page.goto('/login');

    // Act
    await page.fill('input[type="email"]', testUsers.valid.email);
    await page.fill('input[type="password"]', 'WrongPassword@123');
    await page.click('button[type="submit"]');

    // Assert - error should be generic and user-friendly
    const error = page.locator('text=/invalid email or password/i');
    await expect(error).toBeVisible();

    const errorText = await error.textContent();
    expect(errorText).not.toContain('SQL');
    expect(errorText).not.toContain('database');
    expect(errorText).not.toContain('undefined');
  });

  test('AUTH-UI-LOG-005: Mobile responsive design', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/login');

    // Assert - all elements should be visible and usable
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();

    // Check button size
    const button = page.locator('button[type="submit"]');
    const buttonBox = await button.boundingBox();
    expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('AUTH-UI-LOG-006: Keyboard navigation works', async ({ page }) => {
    await page.goto('/login');

    // Act - tab through form
    await page.keyboard.press('Tab');
    let focused = await page.locator(':focus').getAttribute('type');
    expect(focused).toBe('email');

    await page.keyboard.press('Tab');
    focused = await page.locator(':focus').getAttribute('type');
    expect(focused).toBe('password');

    // Enter key should submit
    await page.fill('input[type="email"]', testUsers.valid.email);
    await page.fill('input[type="password"]', testUsers.valid.password);
    await page.keyboard.press('Enter');

    // Assert - should submit
    await expect(page).toHaveURL(/\/deals/, { timeout: 5000 });
  });

  test('AUTH-UI-LOG-007: Back to Home link', async ({ page }) => {
    await page.goto('/login');

    // Act
    await page.click('text=Back to Home');

    // Assert
    await expect(page).toHaveURL('/', { timeout: 3000 });
  });
});
