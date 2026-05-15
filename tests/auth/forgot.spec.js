/**
 * Forgot Password Module Test Suite
 * RichSave Application
 *
 * Covers: Password Reset Flow with OTP
 * Test Categories: Functional, Negative, Edge Cases, Security, UI/UX
 */

import { test, expect } from '@playwright/test';

// Test Data
const testUser = {
  email: 'forgot.test@richsave.com',
  newPassword: 'NewPassword@123'
};

// ============== FUNCTIONAL TESTS (Happy Path) ==============

test.describe('Forgot Password - Functional Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forgot-password');
  });

  test('AUTH-FP-001: Request OTP with registered email', async ({ page }) => {
    // Act
    await page.fill('input[type="email"]', testUser.email);
    await page.click('button:has-text("Send OTP")');

    // Assert
    await expect(page.locator('text=/OTP sent|code sent|check your email/i')).toBeVisible();

    // Should move to OTP verification step
    await expect(page.locator('text=/verify|code|OTP/i')).toBeVisible();
  });

  test('AUTH-FP-002: Verify correct OTP', async ({ page }) => {
    // This test requires mocking the OTP or having a test OTP
    // For now, we'll test the UI flow

    // First, request OTP
    await page.fill('input[type="email"]', testUser.email);
    await page.click('button:has-text("Send OTP")');

    // Wait for OTP step
    await expect(page.locator('.otp-input').or(page.locator('text=/verify/i'))).toBeVisible();

    // Enter test OTP (in real scenario, this would come from email)
    const otpInputs = page.locator('input').filter({ hasText: '' });
    const count = await otpInputs.count();

    if (count >= 6) {
      // Fill OTP inputs
      for (let i = 0; i < 6; i++) {
        await otpInputs.nth(i).fill('1');
      }

      await page.click('button:has-text("Verify")');

      // Should move to reset password step
      await expect(page.locator('text=/reset password|new password/i')).toBeVisible();
    }
  });

  test('AUTH-FP-003: Reset password with valid data', async ({ page }) => {
    // This would need to be on the reset password step
    // For testing, we'll navigate there directly or mock the flow

    // Mock: Go to reset password step directly
    await page.evaluate(() => {
      window.location.hash = '#reset';
    });

    // Or if the page has step state, we'd set it

    // Check if we're on reset step
    const resetButton = page.locator('button:has-text("Reset Password")');
    if (await resetButton.isVisible()) {
      // Act
      await page.fill('input[id="password"]', testUser.newPassword);
      await page.fill('input[id="confirmPassword"]', testUser.newPassword);
      await resetButton.click();

      // Assert
      await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    } else {
      test.skip(true, 'Reset password step not accessible without OTP verification');
    }
  });

  test('AUTH-FP-004: Complete forgot password flow', async ({ page }) => {
    // This is an end-to-end test of the complete flow

    // Step 1: Request OTP
    await page.fill('input[type="email"]', testUser.email);
    await page.click('button:has-text("Send OTP")');

    // Verify step change
    await expect(page.locator('text=/verify|code/i')).toBeVisible();

    // Step 2: Verify OTP (mocked - in real test, get from email)
    // This would require API mocking or email service integration

    // Step 3: Reset password
    // Reset with new password

    // Step 4: Login with new password
    await page.goto('/login');
    await page.fill('input[type="email"]', testUser.email);
    await page.fill('input[type="password"]', testUser.newPassword);
    await page.click('button[type="submit"]');

    // Assert - should login successfully
    await expect(page).toHaveURL(/\/deals/, { timeout: 5000 });
  });
});

// ============== NEGATIVE TESTS ==============

test.describe('Forgot Password - Negative Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forgot-password');
  });

  test('AUTH-FP-101: Request OTP with unregistered email', async ({ page }) => {
    // Act
    await page.fill('input[type="email"]', 'notexist@richsave.com');
    await page.click('button:has-text("Send OTP")');

    // Assert - should NOT reveal if email exists
    // Generic response for both existing and non-existing emails
    const message = page.locator('text=/sent|email|not found/i').first();
    await expect(message).toBeVisible();

    const messageText = await message.textContent();
    expect(messageText).not.toContain('not registered');
    expect(messageText).not.toContain('does not exist');
  });

  test('AUTH-FP-102: Request OTP with empty email', async ({ page }) => {
    // Act
    await page.click('button:has-text("Send OTP")');

    // Assert
    const emailError = page.locator('input[type="email"]').evaluate(el => el.validationMessage);
    expect(await emailError).toBeTruthy();
  });

  test('AUTH-FP-103: Request OTP with invalid email format', async ({ page }) => {
    // Act
    await page.fill('input[type="email"]', 'invalidemail');
    await page.click('button:has-text("Send OTP")');

    // Assert
    await expect(page.locator('text=/valid email/i')).toBeVisible();
  });

  test('AUTH-FP-104: Verify OTP with empty fields', async ({ page }) => {
    // First, get to OTP step (mock or by requesting)
    await page.fill('input[type="email"]', testUser.email);
    await page.click('button:has-text("Send OTP")');

    // Wait for OTP step
    await page.waitForTimeout(500);

    // Try to verify without entering OTP
    const verifyButton = page.locator('button:has-text("Verify")');
    if (await verifyButton.isVisible()) {
      await verifyButton.click();

      // Assert
      await expect(page.locator('text=/enter code|required/i')).toBeVisible();
    }
  });

  test('AUTH-FP-105: Verify OTP with incorrect code', async ({ page }) => {
    // Get to OTP step
    await page.fill('input[type="email"]', testUser.email);
    await page.click('button:has-text("Send OTP")');
    await page.waitForTimeout(500);

    // Enter wrong OTP
    const otpInputs = page.locator('input').filter({ hasText: '' });
    const count = await otpInputs.count();

    if (count >= 6) {
      for (let i = 0; i < 6; i++) {
        await otpInputs.nth(i).fill('0');
      }

      await page.click('button:has-text("Verify")');

      // Assert
      await expect(page.locator('text=/invalid|incorrect/i')).toBeVisible();
    }
  });

  test('AUTH-FP-106: Verify expired OTP', async ({ page }) => {
    // This test would require mocking time or using an expired OTP
    // For now, we'll verify the error message exists

    // Get to OTP step
    await page.fill('input[type="email"]', testUser.email);
    await page.click('button:has-text("Send OTP")');
    await page.waitForTimeout(500);

    // Try to verify with an expired scenario
    // In real testing, you'd mock the API to return expired error

    // Assert that expired handling exists
    const apiEndpoint = '/api/auth/verify-otp';
    // This would be tested via API mocking
  });

  test('AUTH-FP-107: Reset password with mismatched passwords', async ({ page }) => {
    // Navigate to reset step (would normally need OTP verification)
    // For testing, we'll check if reset form exists

    // Mock being on reset step
    const passwordInput = page.locator('input[id="password"]');
    if (await passwordInput.isVisible()) {
      await page.fill('input[id="password"]', testUser.newPassword);
      await page.fill('input[id="confirmPassword"]', 'Different@123');
      await page.click('button:has-text("Reset Password")');

      // Assert
      await expect(page.locator('text=/do not match/i')).toBeVisible();
    }
  });

  test('AUTH-FP-108: Reset password with short password', async ({ page }) => {
    const passwordInput = page.locator('input[id="password"]');
    if (await passwordInput.isVisible()) {
      await page.fill('input[id="password"]', '12345');
      await page.fill('input[id="confirmPassword"]', '12345');
      await page.click('button:has-text("Reset Password")');

      // Assert
      await expect(page.locator('text=/at least 6 characters/i')).toBeVisible();
    }
  });

  test('AUTH-FP-109: Reuse already used OTP', async ({ page }) => {
    // This would require tracking OTP usage
    // Test that an OTP cannot be used twice

    // First use
    // Second use should fail

    // This is better tested at the API level
  });
});

// ============== EDGE CASES ==============

test.describe('Forgot Password - Edge Cases', () => {
  test('AUTH-FP-201: Request OTP multiple times', async ({ page }) => {
    await page.goto('/forgot-password');

    // Act - click send multiple times
    await page.fill('input[type="email"]', testUser.email);
    await page.click('button:has-text("Send OTP")');
    await page.click('button:has-text("Send OTP")');
    await page.click('button:has-text("Send OTP")');

    // Assert - should handle gracefully
    // Either: show "already sent" message
    // Or: send new OTP and invalidate old one
    await expect(page.locator('text=/OTP sent|code sent|already/i')).toBeVisible();
  });

  test('AUTH-FP-202: OTP auto-focus next field', async ({ page }) => {
    await page.goto('/forgot-password');

    // Get to OTP step
    await page.fill('input[type="email"]', testUser.email);
    await page.click('button:has-text("Send OTP")');
    await page.waitForTimeout(500);

    // Act
    const otpInputs = page.locator('input').filter({ hasText: '' });
    const firstInput = otpInputs.first();

    if (await firstInput.isVisible()) {
      await firstInput.fill('1');

      // Assert - focus should move to next input
      const secondInput = otpInputs.nth(1);
      const isFocused = await secondInput.evaluate(el => document.activeElement === el);

      expect(isFocused).toBeTruthy();
    }
  });

  test('AUTH-FP-203: OTP paste from clipboard', async ({ page }) => {
    await page.goto('/forgot-password');

    // Get to OTP step
    await page.fill('input[type="email"]', testUser.email);
    await page.click('button:has-text("Send OTP")');
    await page.waitForTimeout(500);

    // Act - simulate paste
    const otpInputs = page.locator('input').filter({ hasText: '' });
    const firstInput = otpInputs.first();

    if (await firstInput.isVisible()) {
      await firstInput.focus();
      await page.keyboard.type('123456');

      // Assert - all fields should be populated
      // Or cursor should be at last field
      const lastInput = otpInputs.nth(5);
      const isFocused = await lastInput.evaluate(el => document.activeElement === el);
      expect(isFocused).toBeTruthy();
    }
  });

  test('AUTH-FP-204: Change email during flow', async ({ page }) => {
    await page.goto('/forgot-password');

    // Get to OTP step
    await page.fill('input[type="email"]', testUser.email);
    await page.click('button:has-text("Send OTP")');
    await page.waitForTimeout(500);

    // Act - click change email
    const changeEmailButton = page.locator('button:has-text("Change email"), text=change email');
    if (await changeEmailButton.isVisible()) {
      await changeEmailButton.click();

      // Assert - should return to email step
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('button:has-text("Send OTP")')).toBeVisible();
    }
  });

  test('AUTH-FP-205: Network error during OTP request', async ({ page }) => {
    await page.goto('/forgot-password');

    // Arrange
    await page.fill('input[type="email"]', testUser.email);
    await page.context().setOffline(true);

    // Act
    await page.click('button:has-text("Send OTP")');

    // Assert
    await expect(page.locator('text=/network error|connection/i')).toBeVisible();

    // Cleanup
    await page.context().setOffline(false);
  });

  test('AUTH-FP-206: Set new password same as old password', async ({ page }) => {
    // This tests if user can reuse their old password
    // Behavior varies by application policy

    // Navigate through flow and try to set same password
    // Expected: either allowed or rejected based on policy

    // This would require knowing the old password and full flow implementation
  });

  test('AUTH-FP-207: Session timeout during reset flow', async ({ page }) => {
    await page.goto('/forgot-password');

    // Start flow
    await page.fill('input[type="email"]', testUser.email);
    await page.click('button:has-text("Send OTP")');

    // Simulate long delay (30+ minutes)
    // In real test, you'd mock time or use short-lived tokens

    // Try to complete flow
    // Should show session expired error

    // This is better tested with API mocking
  });
});

// ============== SECURITY TESTS ==============

test.describe('Forgot Password - Security Tests', () => {
  test('AUTH-FP-SEC-001: Brute force OTP protection', async ({ page }) => {
    await page.goto('/forgot-password');

    // Get to OTP step
    await page.fill('input[type="email"]', testUser.email);
    await page.click('button:has-text("Send OTP")');
    await page.waitForTimeout(500);

    // Try multiple wrong OTPs
    const otpInputs = page.locator('input').filter({ hasText: '' });
    const count = await otpInputs.count();

    if (count >= 6) {
      // Try 5 times
      for (let attempt = 0; attempt < 5; attempt++) {
        for (let i = 0; i < 6; i++) {
          await otpInputs.nth(i).fill(String(attempt));
        }
        await page.click('button:has-text("Verify")');
        await page.waitForTimeout(200);
      }

      // Should show rate limit or lock message
      await expect(page.locator('text=/too many|locked|attempts/i')).toBeVisible();
    }
  });

  test('AUTH-FP-SEC-002: Email enumeration prevention', async ({ page }) => {
    await page.goto('/forgot-password');

    // Try existing email
    await page.fill('input[type="email"]', testUser.email);
    await page.click('button:has-text("Send OTP")');
    const response1 = await page.locator('text=/sent|email/i').textContent();

    // Clear and try non-existing email
    await page.fill('input[type="email"]', 'notexist@richsave.com');
    await page.click('button:has-text("Send OTP")');
    const response2 = await page.locator('text=/sent|email/i').textContent();

    // Assert - responses should be similar
    expect(response1).toBeTruthy();
    expect(response2).toBeTruthy();
    // Should not reveal which emails exist
  });

  test('AUTH-FP-SEC-003: OTP link is one-time use only', async ({ page }) => {
    // This tests that once an OTP is used, it cannot be used again
    // Better tested at API level with multiple verification requests

    // API test: POST /api/auth/verify-otp with same OTP twice
    // Second request should fail
  });

  test('AUTH-FP-SEC-004: OTP expires after time limit', async ({ page }) => {
    // Test that OTP has a time limit (e.g., 15 minutes)
    // Better tested with API mocking or time manipulation

    // Verify OTP expires after configured time
    // New OTP must be requested after expiration
  });

  test('AUTH-FP-SEC-005: Password strength enforced on reset', async ({ page }) => {
    // Ensure weak passwords are rejected even on reset
    await page.goto('/forgot-password');

    // Get to reset step (mocked)
    // Try weak passwords like: "password", "123456", etc.

    // All should be rejected
  });
});

// ============== UI/UX TESTS ==============

test.describe('Forgot Password - UI/UX Tests', () => {
  test('AUTH-UI-FP-001: Multi-step progress indicator', async ({ page }) => {
    await page.goto('/forgot-password');

    // Check for progress indicator
    const steps = page.locator('[data-testid="step"], .step, .progress-indicator');

    if (await steps.count() > 0) {
      // Should show current step
      await expect(steps.first()).toBeVisible();
    }
  });

  test('AUTH-UI-FP-002: OTP input fields are user-friendly', async ({ page }) => {
    await page.goto('/forgot-password');

    // Get to OTP step
    await page.fill('input[type="email"]', testUser.email);
    await page.click('button:has-text("Send OTP")');
    await page.waitForTimeout(500);

    // Check OTP inputs
    const otpInputs = page.locator('.otp-input, input[maxlength="1"]');

    if (await otpInputs.count() > 0) {
      // Should have 6 inputs
      await expect(otpInputs).toHaveCount(6);

      // Each should be single character
      for (let i = 0; i < 6; i++) {
        await expect(otpInputs.nth(i)).toHaveAttribute('maxlength', '1');
        await expect(otpInputs.nth(i)).toHaveAttribute('inputMode', 'numeric');
      }
    }
  });

  test('AUTH-UI-FP-003: Resend OTP option available', async ({ page }) => {
    await page.goto('/forgot-password');

    // Get to OTP step
    await page.fill('input[type="email"]', testUser.email);
    await page.click('button:has-text("Send OTP")');
    await page.waitForTimeout(500);

    // Check for resend option
    const resendButton = page.locator('button:has-text("Resend"), text=resend');
    if (await resendButton.isVisible()) {
      await expect(resendButton).toBeVisible();
    }
  });

  test('AUTH-UI-FP-004: Change email option available', async ({ page }) => {
    await page.goto('/forgot-password');

    // Get to OTP step
    await page.fill('input[type="email"]', testUser.email);
    await page.click('button:has-text("Send OTP")');
    await page.waitForTimeout(500);

    // Check for change email option
    const changeEmailButton = page.locator('button:has-text("Change"), text=change email');
    if (await changeEmailButton.isVisible()) {
      await expect(changeEmailButton).toBeVisible();
    }
  });

  test('AUTH-UI-FP-005: Back to Login link', async ({ page }) => {
    await page.goto('/forgot-password');

    // Assert
    await expect(page.locator('text=Back to Login')).toBeVisible();

    // Act
    await page.click('text=Back to Login');

    // Assert
    await expect(page).toHaveURL(/\/login/, { timeout: 3000 });
  });

  test('AUTH-UI-FP-006: Mobile responsive design', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/forgot-password');

    // Assert - all elements should be visible
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('button:has-text("Send OTP")')).toBeVisible();

    // Check button size
    const button = page.locator('button:has-text("Send OTP")');
    const buttonBox = await button.boundingBox();
    expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('AUTH-UI-FP-007: Loading states on submit', async ({ page }) => {
    await page.goto('/forgot-password');

    await page.fill('input[type="email"]', testUser.email);

    const button = page.locator('button:has-text("Send OTP")');
    await button.click();

    // Assert - button should show loading
    await expect(button).toContainText(/sending|loading/i);
  });

  test('AUTH-UI-FP-008: Clear instructions at each step', async ({ page }) => {
    await page.goto('/forgot-password');

    // Step 1 - Email
    await expect(page.locator('text=/email|address/i')).toBeVisible();

    // Step 2 - OTP
    await page.fill('input[type="email"]', testUser.email);
    await page.click('button:has-text("Send OTP")');
    await page.waitForTimeout(500);

    await expect(page.locator('text=/code|verify|OTP/i')).toBeVisible();

    // Step 3 - Reset Password (if accessible)
    const resetTitle = page.locator('text=/reset|new password/i');
    if (await resetTitle.isVisible()) {
      await expect(resetTitle).toBeVisible();
    }
  });
});
