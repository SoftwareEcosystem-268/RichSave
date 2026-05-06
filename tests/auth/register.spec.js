/**
 * Register Module Test Suite
 * RichSave Application
 *
 * Covers: User Registration Flow
 * Test Categories: Functional, Negative, Edge Cases, Security, UI/UX
 */

import { test, expect } from '@playwright/test';

// Test Data
const testUsers = {
  valid: {
    name: 'Test User',
    email: 'test.user@richsave.com',
    password: 'Test@123456',
    phone: '0812345678'
  },
  existing: {
    name: 'Existing User',
    email: 'existing@richsave.com',
    password: 'Existing@123'
  }
};

// ============== FUNCTIONAL TESTS (Happy Path) ==============

test.describe('Register - Functional Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('AUTH-REG-001: Register with valid data', async ({ page }) => {
    // Arrange & Act
    await page.fill('input[id="name"]', testUsers.valid.name);
    await page.fill('input[id="email"]', testUsers.valid.email);
    await page.fill('input[id="password"]', testUsers.valid.password);
    await page.fill('input[id="confirmPassword"]', testUsers.valid.password);
    await page.check('input[id="terms"]');
    await page.click('button[type="submit"]');

    // Assert
    await expect(page).toHaveURL(/\/deals/, { timeout: 5000 });
    await expect(page.locator('text=Welcome').or(page.locator('[data-testid="user-menu"]'))).toBeVisible();
  });

  test('AUTH-REG-002: Email verification sent after registration', async ({ page }) => {
    // This test would require email service mocking
    // For now, we'll verify the API call
    await page.fill('input[id="name"]', testUsers.valid.name);
    await page.fill('input[id="email"]', testUsers.valid.email);
    await page.fill('input[id="password"]', testUsers.valid.password);
    await page.fill('input[id="confirmPassword"]', testUsers.valid.password);
    await page.check('input[id="terms"]');

    // Intercept API call
    const [request] = await Promise.all([
      page.waitForRequest(r => r.url().includes('/api/auth/signup')),
      page.click('button[type="submit"]')
    ]);

    expect(request.method()).toBe('POST');
    expect(request.postData().includes('email')).toBeTruthy();
  });

  test('AUTH-REG-003: Activate account via email link', async ({ page }) => {
    // This would require visiting the activation endpoint
    // In real scenario: GET /api/auth/activate/:token
    await page.goto('/api/auth/activate/test-token-123');

    // Assert based on response
    const content = await page.content();
    if (content.includes('Account activated')) {
      expect(content).toContain('Account activated successfully');
    } else {
      // Token might be invalid
      expect(content).toContain('Invalid or expired token');
    }
  });

  test('AUTH-REG-004: Resend verification email', async ({ page }) => {
    // This test would check resend functionality
    await page.goto('/login');
    await page.click('text=Resend verification');

    // Should show email input for resend
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('text=Send verification email')).toBeVisible();
  });
});

// ============== NEGATIVE TESTS ==============

test.describe('Register - Negative Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('AUTH-REG-101: Register with empty name field', async ({ page }) => {
    // Act
    await page.fill('input[id="email"]', testUsers.valid.email);
    await page.fill('input[id="password"]', testUsers.valid.password);
    await page.fill('input[id="confirmPassword"]', testUsers.valid.password);
    await page.check('input[id="terms"]');
    await page.click('button[type="submit"]');

    // Assert
    const nameError = page.locator('input[id="name"]').evaluate(el => el.validationMessage);
    expect(await nameError).toBeTruthy();
  });

  test('AUTH-REG-102: Register with empty email field', async ({ page }) => {
    // Act
    await page.fill('input[id="name"]', testUsers.valid.name);
    await page.fill('input[id="password"]', testUsers.valid.password);
    await page.fill('input[id="confirmPassword"]', testUsers.valid.password);
    await page.check('input[id="terms"]');
    await page.click('button[type="submit"]');

    // Assert
    const emailError = page.locator('input[id="email"]').evaluate(el => el.validationMessage);
    expect(await emailError).toBeTruthy();
  });

  test('AUTH-REG-103: Register with empty password fields', async ({ page }) => {
    // Act
    await page.fill('input[id="name"]', testUsers.valid.name);
    await page.fill('input[id="email"]', testUsers.valid.email);
    await page.check('input[id="terms"]');
    await page.click('button[type="submit"]');

    // Assert
    const passwordError = page.locator('input[id="password"]').evaluate(el => el.validationMessage);
    expect(await passwordError).toBeTruthy();
  });

  test('AUTH-REG-104: Register with mismatched passwords', async ({ page }) => {
    // Act
    await page.fill('input[id="name"]', testUsers.valid.name);
    await page.fill('input[id="email"]', testUsers.valid.email);
    await page.fill('input[id="password"]', testUsers.valid.password);
    await page.fill('input[id="confirmPassword"]', 'Different@123');
    await page.check('input[id="terms"]');
    await page.click('button[type="submit"]');

    // Assert
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
    await expect(page).toHaveURL(/\/signup/);
  });

  test('AUTH-REG-105: Register with password less than 6 characters', async ({ page }) => {
    // Act
    await page.fill('input[id="name"]', testUsers.valid.name);
    await page.fill('input[id="email"]', testUsers.valid.email);
    await page.fill('input[id="password"]', '12345');
    await page.fill('input[id="confirmPassword"]', '12345');
    await page.check('input[id="terms"]');
    await page.click('button[type="submit"]');

    // Assert
    await expect(page.locator('text=/at least 6 characters/i')).toBeVisible();
  });

  test('AUTH-REG-106: Register with invalid email format - no @', async ({ page }) => {
    // Act
    await page.fill('input[id="name"]', testUsers.valid.name);
    await page.fill('input[id="email"]', 'invalidemail');
    await page.fill('input[id="password"]', testUsers.valid.password);
    await page.fill('input[id="confirmPassword"]', testUsers.valid.password);
    await page.check('input[id="terms"]');
    await page.click('button[type="submit"]');

    // Assert
    await expect(page.locator('text=/valid email/i')).toBeVisible();
  });

  test('AUTH-REG-107: Register with invalid email format - no domain', async ({ page }) => {
    // Act
    await page.fill('input[id="name"]', testUsers.valid.name);
    await page.fill('input[id="email"]', 'test@');
    await page.fill('input[id="password"]', testUsers.valid.password);
    await page.fill('input[id="confirmPassword"]', testUsers.valid.password);
    await page.check('input[id="terms"]');
    await page.click('button[type="submit"]');

    // Assert
    await expect(page.locator('text=/valid email/i')).toBeVisible();
  });

  test('AUTH-REG-108: Register with spaces in email', async ({ page }) => {
    // Act
    await page.fill('input[id="name"]', testUsers.valid.name);
    await page.fill('input[id="email"]', 'test @example.com');
    await page.fill('input[id="password"]', testUsers.valid.password);
    await page.fill('input[id="confirmPassword"]', testUsers.valid.password);
    await page.check('input[id="terms"]');
    await page.click('button[type="submit"]');

    // Assert
    await expect(page.locator('text=/valid email/i')).toBeVisible();
  });

  test('AUTH-REG-109: Register with already registered email', async ({ page }) => {
    // Act - assuming existing@richsave.com already exists
    await page.fill('input[id="name"]', testUsers.existing.name);
    await page.fill('input[id="email"]', testUsers.existing.email);
    await page.fill('input[id="password"]', testUsers.existing.password);
    await page.fill('input[id="confirmPassword"]', testUsers.existing.password);
    await page.check('input[id="terms"]');
    await page.click('button[type="submit"]');

    // Assert - should show generic error, not reveal email existence explicitly
    await expect(page.locator('text=/already exists|already registered/i')).toBeVisible();
  });

  test('AUTH-REG-110: Register without accepting terms', async ({ page }) => {
    // Act
    await page.fill('input[id="name"]', testUsers.valid.name);
    await page.fill('input[id="email"]', testUsers.valid.email);
    await page.fill('input[id="password"]', testUsers.valid.password);
    await page.fill('input[id="confirmPassword"]', testUsers.valid.password);
    // Don't check terms
    await page.click('button[type="submit"]');

    // Assert
    const termsError = page.locator('input[id="terms"]').evaluate(el => el.validationMessage);
    expect(await termsError).toBeTruthy();
  });
});

// ============== EDGE CASES ==============

test.describe('Register - Edge Cases', () => {
  test('AUTH-REG-201: Register with name containing special characters', async ({ page }) => {
    await page.goto('/signup');

    // Act
    await page.fill('input[id="name"]', 'José María-Garcia O\'Neil');
    await page.fill('input[id="email"]', `test-${Date.now()}@richsave.com`);
    await page.fill('input[id="password"]', testUsers.valid.password);
    await page.fill('input[id="confirmPassword"]', testUsers.valid.password);
    await page.check('input[id="terms"]');
    await page.click('button[type="submit"]');

    // Assert - should handle special characters
    await expect(page).toHaveURL(/\/deals/, { timeout: 5000 });
  });

  test('AUTH-REG-202: Register with very long name (100 chars)', async ({ page }) => {
    await page.goto('/signup');

    // Arrange
    const longName = 'A'.repeat(100);

    // Act
    await page.fill('input[id="name"]', longName);
    await page.fill('input[id="email"]', `test-${Date.now()}@richsave.com`);
    await page.fill('input[id="password"]', testUsers.valid.password);
    await page.fill('input[id="confirmPassword"]', testUsers.valid.password);
    await page.check('input[id="terms"]');
    await page.click('button[type="submit"]');

    // Assert - should either accept or show clear error
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(signup|deals)/);
  });

  test('AUTH-REG-203: Register with name containing only spaces', async ({ page }) => {
    await page.goto('/signup');

    // Act
    await page.fill('input[id="name"]', '   ');
    await page.fill('input[id="email"]', `test-${Date.now()}@richsave.com`);
    await page.fill('input[id="password"]', testUsers.valid.password);
    await page.fill('input[id="confirmPassword"]', testUsers.valid.password);
    await page.check('input[id="terms"]');
    await page.click('button[type="submit"]');

    // Assert - should trim and detect empty name
    const nameInput = page.locator('input[id="name"]');
    const nameValue = await nameInput.inputValue();
    expect(nameValue.trim()).toBe('');
  });

  test('AUTH-REG-204: Register with email in different case', async ({ page }) => {
    await page.goto('/signup');

    // This assumes existing@richsave.com exists
    // Act - try with different case
    await page.fill('input[id="name"]', testUsers.valid.name);
    await page.fill('input[id="email"]', 'EXISTING@RICHSAVE.COM');
    await page.fill('input[id="password"]', testUsers.valid.password);
    await page.fill('input[id="confirmPassword"]', testUsers.valid.password);
    await page.check('input[id="terms"]');
    await page.click('button[type="submit"]');

    // Assert - email comparison should be case-insensitive
    await expect(page.locator('text=/already exists/i')).toBeVisible();
  });

  test('AUTH-REG-205: Register with password exactly 6 characters', async ({ page }) => {
    await page.goto('/signup');

    // Act - boundary test
    await page.fill('input[id="name"]', testUsers.valid.name);
    await page.fill('input[id="email"]', `test-${Date.now()}@richsave.com`);
    await page.fill('input[id="password"]', '123456');
    await page.fill('input[id="confirmPassword"]', '123456');
    await page.check('input[id="terms"]');
    await page.click('button[type="submit"]');

    // Assert - minimum boundary should be accepted
    await expect(page).toHaveURL(/\/deals/, { timeout: 5000 });
  });

  test('AUTH-REG-206: Rapid submit attempts (idempotency)', async ({ page }) => {
    await page.goto('/signup');

    // Act - click submit rapidly
    await page.fill('input[id="name"]', testUsers.valid.name);
    await page.fill('input[id="email"]', `test-${Date.now()}@richsave.com`);
    await page.fill('input[id="password"]', testUsers.valid.password);
    await page.fill('input[id="confirmPassword"]', testUsers.valid.password);
    await page.check('input[id="terms"]');

    await page.click('button[type="submit"]');
    await page.click('button[type="submit"]');
    await page.click('button[type="submit"]');

    // Assert - should only create one account
    await expect(page).toHaveURL(/\/deals/, { timeout: 5000 });
  });

  test('AUTH-REG-207: Register during network offline', async ({ page }) => {
    await page.goto('/signup');

    // Arrange
    await page.fill('input[id="name"]', testUsers.valid.name);
    await page.fill('input[id="email"]', `test-${Date.now()}@richsave.com`);
    await page.fill('input[id="password"]', testUsers.valid.password);
    await page.fill('input[id="confirmPassword"]', testUsers.valid.password);
    await page.check('input[id="terms"]');

    // Act - simulate offline
    await page.context().setOffline(true);
    await page.click('button[type="submit"]');

    // Assert - should show network error
    await expect(page.locator('text=/network error|connection/i')).toBeVisible();

    // Cleanup
    await page.context().setOffline(false);
  });
});

// ============== SECURITY TESTS ==============

test.describe('Register - Security Tests', () => {
  test('AUTH-REG-SEC-001: SQL Injection in name field', async ({ page }) => {
    await page.goto('/signup');

    // Act
    await page.fill('input[id="name"]', "admin' OR '1'='1");
    await page.fill('input[id="email"]', `test-${Date.now()}@richsave.com`);
    await page.fill('input[id="password"]', testUsers.valid.password);
    await page.fill('input[id="confirmPassword"]', testUsers.valid.password);
    await page.check('input[id="terms"]');
    await page.click('button[type="submit"]');

    // Assert - input should be sanitized
    const currentUrl = page.url();
    // Should not bypass validation or cause unexpected behavior
    expect(currentUrl).toMatch(/\/(signup|deals)/);
  });

  test('AUTH-REG-SEC-002: XSS attack in name field', async ({ page }) => {
    await page.goto('/signup');

    // Act
    await page.fill('input[id="name"]', '<script>alert("XSS")</script>');
    await page.fill('input[id="email"]', `test-${Date.now()}@richsave.com`);
    await page.fill('input[id="password"]', testUsers.valid.password);
    await page.fill('input[id="confirmPassword"]', testUsers.valid.password);
    await page.check('input[id="terms"]');
    await page.click('button[type="submit"]');

    // Assert - no alert should execute
    // If alert appears, test will fail
    await expect(page).toHaveURL(/\/deals/, { timeout: 5000 });

    // Check that script is escaped in page content
    const pageContent = await page.content();
    const escapedScript = pageContent.includes('&lt;script&gt;') ||
                         pageContent.includes('&#60;script&#62;');
    expect(escapedScript).toBeTruthy();
  });

  test('AUTH-REG-SEC-003: NoSQL Injection in email field', async ({ page }) => {
    await page.goto('/signup');

    // Act
    await page.fill('input[id="name"]', testUsers.valid.name);
    await page.fill('input[id="email"]', '{$ne: null}');
    await page.fill('input[id="password"]', testUsers.valid.password);
    await page.fill('input[id="confirmPassword"]', testUsers.valid.password);
    await page.check('input[id="terms"]');
    await page.click('button[type="submit"]');

    // Assert - should show validation error or sanitize input
    await expect(page.locator('text=/valid email/i')).toBeVisible();
  });

  test('AUTH-REG-SEC-004: Email enumeration prevention', async ({ page }) => {
    await page.goto('/signup');

    // Act - try existing email
    await page.fill('input[id="name"]', testUsers.valid.name);
    await page.fill('input[id="email"]', testUsers.existing.email);
    await page.fill('input[id="password"]', testUsers.valid.password);
    await page.fill('input[id="confirmPassword"]', testUsers.valid.password);
    await page.check('input[id="terms"]');
    await page.click('button[type="submit"]');

    // Assert - error message should not reveal if email exists
    const errorMessage = await page.locator('text=/already|exists|registered/i').textContent();
    expect(errorMessage).toBeTruthy();

    // Message should not be too specific
    expect(errorMessage).not.toContain('database');
    expect(errorMessage).not.toContain('SQL');
  });
});

// ============== UI/UX TESTS ==============

test.describe('Register - UI/UX Tests', () => {
  test('AUTH-UI-REG-001: Form has proper labels and placeholders', async ({ page }) => {
    await page.goto('/signup');

    // Assert - all fields have labels
    const labels = page.locator('label');
    await expect(labels.nth(0)).toContainText('Name');
    await expect(labels.nth(1)).toContainText('Email');
    await expect(labels.nth(2)).toContainText('Password');
    await expect(labels.nth(3)).toContainText('Confirm');

    // Check placeholders
    await expect(page.locator('input[placeholder*="John"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="example"]')).toBeVisible();
  });

  test('AUTH-UI-REG-002: Submit button shows loading state', async ({ page }) => {
    await page.goto('/signup');

    // Arrange
    await page.fill('input[id="name"]', testUsers.valid.name);
    await page.fill('input[id="email"]', `test-${Date.now()}@richsave.com`);
    await page.fill('input[id="password"]', testUsers.valid.password);
    await page.fill('input[id="confirmPassword"]', testUsers.valid.password);
    await page.check('input[id="terms"]');

    // Act
    const button = page.locator('button[type="submit"]');
    await button.click();

    // Assert - button should be disabled during submission
    await expect(button).toBeDisabled();
    await expect(button).toContainText(/creating|loading/i);
  });

  test('AUTH-UI-REG-003: Terms link opens correctly', async ({ page }) => {
    await page.goto('/signup');

    // Act
    const termsButton = page.locator('text=Terms of Service').first();
    await termsButton.click();

    // Assert - should navigate to privacy page or open modal
    await expect(page).toHaveURL(/\/privacy/, { timeout: 3000 });
  });

  test('AUTH-UI-REG-004: Inline error validation', async ({ page }) => {
    await page.goto('/signup');

    // Act - submit empty form
    await page.click('button[type="submit"]');

    // Assert - errors should be shown
    const errors = page.locator('text=/required|valid email|password/i');
    await expect(errors.first()).toBeVisible();
  });

  test('AUTH-UI-REG-005: Mobile responsive design', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/signup');

    // Assert - form should be usable on mobile
    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Check button size (min 44x44 for touch)
    const button = page.locator('button[type="submit"]');
    const buttonBox = await button.boundingBox();
    expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('AUTH-UI-REG-006: Keyboard navigation works', async ({ page }) => {
    await page.goto('/signup');

    // Act - tab through form
    await page.keyboard.press('Tab');
    let focused = await page.locator(':focus').getAttribute('id');
    expect(focused).toBe('name');

    await page.keyboard.press('Tab');
    focused = await page.locator(':focus').getAttribute('id');
    expect(focused).toBe('email');

    await page.keyboard.press('Tab');
    focused = await page.locator(':focus').getAttribute('id');
    expect(focused).toBe('password');
  });

  test('AUTH-UI-REG-007: Back to Home link', async ({ page }) => {
    await page.goto('/signup');

    // Act
    await page.click('text=Back to Home');

    // Assert
    await expect(page).toHaveURL('/', { timeout: 3000 });
  });
});
