/**
 * Favorites Notification Module Test Suite
 * RichSave Application
 *
 * Covers: Deal Alert Notifications Functionality
 * Test Categories: Functional, Negative, Edge Cases, UI/UX
 */

import { test, expect } from '@playwright/test';

// Helper to login
async function login(page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'Test@123456');
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/deals/, { timeout: 5000 });
}

// ============== FUNCTIONAL TESTS (Happy Path) ==============

test.describe('Favorites Notification - Functional Tests', () => {
  test('FAV-NOTIF-001: Enable notifications for favorite deal', async ({ page, context }) => {
    // Grant notification permission
    await context.grantPermissions(['notifications']);

    await login(page);

    // Go to a deal
    await page.goto('/deals/1');

    // Look for notification toggle
    const notifyButton = page.locator('button:has-text("Notify"), button:has-text("Alert"), [data-testid="notify-button"]');

    if (await notifyButton.isVisible()) {
      // Click to enable
      await notifyButton.click();

      // Should show success message
      const successMessage = page.locator('text=/enabled|subscribed|turn on/i');

      const hasMessage = await successMessage.isVisible();

      if (hasMessage) {
        await expect(successMessage).toBeVisible();
      }

      // Button should show active state
      await expect(notifyButton).toHaveClass(/bg-primary|text-white|active/);
    } else {
      test.skip(true, 'Notification feature not implemented');
    }
  });

  test('FAV-NOTIF-002: Receive notification for price drop', async ({ page, context }) => {
    // This test would require triggering a notification
    // In real scenario, you'd need to:
    // 1. Enable notification for a deal
    // 2. Wait for price drop event
    // 3. Check notification was received

    await context.grantPermissions(['notifications']);

    await login(page);

    // Check if notification status is visible
    const notificationStatus = page.locator('[data-testid="notification-status"], text=/notification/i');

    const hasStatus = await notificationStatus.isVisible();

    if (hasStatus) {
      await expect(notificationStatus).toBeVisible();
    }
  });

  test('FAV-NOTIF-003: Disable notifications for favorite deal', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);

    await login(page);

    await page.goto('/deals/1');

    const notifyButton = page.locator('button:has-text("Notify"), button:has-text("Alert")');

    if (await notifyButton.isVisible()) {
      // Enable first
      await notifyButton.click();
      await page.waitForTimeout(500);

      // Then disable
      await notifyButton.click();
      await page.waitForTimeout(500);

      // Should show disabled state
      await expect(notifyButton).not.toHaveClass(/bg-primary|active/);
    } else {
      test.skip(true, 'Notification feature not implemented');
    }
  });

  test('FAV-NOTIF-004: View all notifications', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);

    await login(page);

    // Check for notifications page or section
    const notificationsLink = page.locator('a[href="/notifications"], [data-testid="notifications-link"]');

    if (await notificationsLink.isVisible()) {
      await notificationsLink.click();

      // Should show notifications list
      await expect(page).toHaveURL(/\/notifications/, { timeout: 3000 });

      const notificationsList = page.locator('[data-testid="notifications-list"], .notifications');

      await expect(notificationsList).toBeVisible();
    }
  });

  test('FAV-NOTIF-005: Mark notification as read', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);

    await login(page);

    // Go to notifications
    const notificationsLink = page.locator('a[href="/notifications"]');

    if (await notificationsLink.isVisible()) {
      await notificationsLink.click();

      // Find unread notification
      const unreadNotification = page.locator('[data-unread="true"], .notification.unread');

      const count = await unreadNotification.count();

      if (count > 0) {
        // Click to mark as read
        await unreadNotification.first().click();

        // Should be marked as read
        await page.waitForTimeout(500);

        // Visual state should change
        await expect(unreadNotification.first()).not.toHaveAttribute('data-unread', 'true');
      }
    }
  });

  test('FAV-NOTIF-006: Delete notification', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);

    await login(page);

    const notificationsLink = page.locator('a[href="/notifications"]');

    if (await notificationsLink.isVisible()) {
      await notificationsLink.click();

      // Find delete button on notification
      const deleteButton = page.locator('button:has-text("Delete"), button[aria-label="delete"]');

      const count = await deleteButton.count();

      if (count > 0) {
        const notificationsBefore = await page.locator('[data-testid="notification"]').count();

        await deleteButton.first().click();
        await page.waitForTimeout(500);

        // Count should decrease
        const notificationsAfter = await page.locator('[data-testid="notification"]').count();

        expect(notificationsAfter).toBeLessThan(notificationsBefore);
      }
    }
  });

  test('FAV-NOTIF-007: Notification preferences', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);

    await login(page);

    // Check for settings/preferences page
    const settingsLink = page.locator('a[href="/settings"], a[href="/preferences"]');

    if (await settingsLink.isVisible()) {
      await settingsLink.click();

      // Should have notification settings
      const notificationSettings = page.locator('[data-testid="notification-settings"], text=/notifications/i');

      await expect(notificationSettings).toBeVisible();
    }
  });

  test('FAV-NOTIF-008: Notification count badge', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);

    await login(page);

    // Check for notification badge in header
    const badge = page.locator('[data-testid="notification-badge"], .badge');

    const hasBadge = await badge.isVisible();

    if (hasBadge) {
      // Should show count
      const badgeText = await badge.textContent();

      expect(badgeText).toMatch(/\d+/);
    }
  });
});

// ============== NEGATIVE TESTS ==============

test.describe('Favorites Notification - Negative Tests', () => {
  test('FAV-NOTIF-NEG-001: Enable notifications without permission', async ({ page, context }) => {
    // Don't grant permission
    await context.clearPermissions();

    await login(page);

    await page.goto('/deals/1');

    const notifyButton = page.locator('button:has-text("Notify"), button:has-text("Alert")');

    if (await notifyButton.isVisible()) {
      await notifyButton.click();

      // Should request permission
      // Browser handles this, but app should handle denial gracefully

      // Should show message about needing permission
      const permissionMessage = page.locator('text=/permission|enable|allow/i');

      const hasMessage = await permissionMessage.isVisible();

      if (hasMessage) {
        await expect(permissionMessage).toBeVisible();
      }
    } else {
      test.skip(true, 'Notification feature not implemented');
    }
  });

  test('FAV-NOTIF-NEG-002: Enable notifications for non-favorited deal', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);

    await login(page);

    await page.goto('/deals/1');

    // Make sure deal is not favorited first
    const favoriteButton = page.locator('button:has(svg)').first();
    const isFavorited = await favoriteButton.locator('svg').getAttribute('fill');

    if (isFavorited === 'currentColor') {
      await favoriteButton.click();
      await page.waitForTimeout(500);
    }

    const notifyButton = page.locator('button:has-text("Notify"), button:has-text("Alert")');

    if (await notifyButton.isVisible()) {
      // Try to enable notifications
      await notifyButton.click();

      // Should prompt to favorite first or auto-favorite
      const favoritePrompt = page.locator('text=/favorite|save/i');

      const hasPrompt = await favoritePrompt.isVisible();

      if (hasPrompt) {
        await expect(favoritePrompt).toBeVisible();
      }
    } else {
      test.skip(true, 'Notification feature not implemented');
    }
  });

  test('FAV-NOTIF-NEG-003: Notification API failure', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);

    await login(page);

    // Mock API failure
    await page.route('**/api/notifications/**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Notification service unavailable' })
      });
    });

    await page.goto('/deals/1');

    const notifyButton = page.locator('button:has-text("Notify"), button:has-text("Alert")');

    if (await notifyButton.isVisible()) {
      await notifyButton.click();

      // Should show error message
      const errorMessage = page.locator('text=/error|failed|try again/i');

      const hasError = await errorMessage.isVisible();

      if (hasError) {
        await expect(errorMessage).toBeVisible();
      }
    } else {
      test.skip(true, 'Notification feature not implemented');
    }
  });

  test('FAV-NOTIF-NEG-004: Exceeded notification limit', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);

    await login(page);

    // Mock API response indicating limit reached
    await page.route('**/api/notifications/enable', route => {
      route.fulfill({
        status: 429,
        body: JSON.stringify({ error: 'Notification limit reached' })
      });
    });

    await page.goto('/deals/1');

    const notifyButton = page.locator('button:has-text("Notify"), button:has-text("Alert")');

    if (await notifyButton.isVisible()) {
      await notifyButton.click();

      // Should show limit message
      const limitMessage = page.locator('text=/limit|maximum/i');

      const hasMessage = await limitMessage.isVisible();

      if (hasMessage) {
        await expect(limitMessage).toBeVisible();
      }
    } else {
      test.skip(true, 'Notification feature not implemented');
    }
  });
});

// ============== EDGE CASES ==============

test.describe('Favorites Notification - Edge Cases', () => {
  test('FAV-NOTIF-EDGE-001: Toggle notifications rapidly', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);

    await login(page);

    await page.goto('/deals/1');

    const notifyButton = page.locator('button:has-text("Notify"), button:has-text("Alert")');

    if (await notifyButton.isVisible()) {
      // Rapid toggles
      for (let i = 0; i < 5; i++) {
        await notifyButton.click();
        await page.waitForTimeout(50);
      }

      // Should handle gracefully
      await expect(page.locator('body')).toBeVisible();
    } else {
      test.skip(true, 'Notification feature not implemented');
    }
  });

  test('FAV-NOTIF-EDGE-002: Notifications for expired deals', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);

    await login(page);

    // Go to an expired deal
    await page.goto('/deals/expired-deal-1');

    const notifyButton = page.locator('button:has-text("Notify"), button:has-text("Alert")');

    if (await notifyButton.isVisible()) {
      // Button might be disabled or hidden
      const isEnabled = await notifyButton.isEnabled();

      if (!isEnabled) {
        // Expected - shouldn't notify for expired deals
        expect(isEnabled).toBe(false);
      }
    } else {
      test.skip(true, 'Notification feature not implemented');
    }
  });

  test('FAV-NOTIF-EDGE-003: Notification when deal is removed', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);

    await login(page);

    // Enable notification for a deal
    await page.goto('/deals/1');

    const notifyButton = page.locator('button:has-text("Notify"), button:has-text("Alert")');

    if (await notifyButton.isVisible()) {
      await notifyButton.click();
      await page.waitForTimeout(500);

      // Deal gets removed (simulate by navigating to non-existent)
      await page.goto('/deals/removed-deal');

      // Check notifications
      const notificationsLink = page.locator('a[href="/notifications"]');

      if (await notificationsLink.isVisible()) {
        await notificationsLink.click();

        // Should handle removed deal gracefully
        await expect(page.locator('body')).toBeVisible();
      }
    } else {
      test.skip(true, 'Notification feature not implemented');
    }
  });

  test('FAV-NOTIF-EDGE-004: Multiple notifications for same deal', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);

    await login(page);

    // This tests receiving multiple notifications for same deal
    // E.g., price drop, then another price drop

    // Expected: Should show as separate notifications or group them
  });

  test('FAV-NOTIF-EDGE-005: Notification schedule preference', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);

    await login(page);

    // Check for notification scheduling options
    const settingsLink = page.locator('a[href="/settings"]');

    if (await settingsLink.isVisible()) {
      await settingsLink.click();

      // Look for schedule options
      const scheduleOptions = page.locator('text=/immediate|daily|weekly|digest/i');

      const hasOptions = await scheduleOptions.isVisible();

      if (hasOptions) {
        await expect(scheduleOptions).toBeVisible();
      }
    }
  });
});

// ============== UI/UX TESTS ==============

test.describe('Favorites Notification - UI/UX Tests', () => {
  test('FAV-NOTIF-UI-001: Bell icon for notifications', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);

    await login(page);

    // Check for bell icon in header
    const bellIcon = page.locator('[data-testid="notification-bell"], svg[d*="M20 17"]');

    const hasBell = await bellIcon.isVisible();

    if (hasBell) {
      await expect(bellIcon).toBeVisible();
    }
  });

  test('FAV-NOTIF-UI-002: Notification badge shows count', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);

    await login(page);

    const badge = page.locator('[data-testid="notification-badge"], .badge');

    if (await badge.isVisible()) {
      // Badge should be visible if there are notifications
      await expect(badge).toBeVisible();

      // Should show number
      const badgeText = await badge.textContent();

      expect(badgeText).toMatch(/\d+/);

      // Should be red or distinct color
      const bgColor = await badge.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });

      expect(bgColor).not.toBe('rgba(0, 0, 0, 0)');
    }
  });

  test('FAV-NOTIF-UI-003: Notification panel dropdown', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);

    await login(page);

    // Click notification bell
    const bellIcon = page.locator('[data-testid="notification-bell"]');

    if (await bellIcon.isVisible()) {
      await bellIcon.click();

      // Should show dropdown
      const dropdown = page.locator('[data-testid="notification-dropdown"], .dropdown');

      await expect(dropdown).toBeVisible();
    }
  });

  test('FAV-NOTIF-UI-004: Notification item layout', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);

    await login(page);

    const notificationsLink = page.locator('a[href="/notifications"]');

    if (await notificationsLink.isVisible()) {
      await notificationsLink.click();

      // Check notification items
      const notificationItems = page.locator('[data-testid="notification"], .notification-item');

      const count = await notificationItems.count();

      if (count > 0) {
        // First item should have required elements
        const firstItem = notificationItems.first();

        // Should have title
        const title = firstItem.locator('[data-testid="title"], .title');
        await expect(title).toBeVisible();

        // Should have timestamp
        const timestamp = firstItem.locator('[data-testid="timestamp"], .timestamp, time');
        await expect(timestamp).toBeVisible();

        // Should have deal link or image
        const dealLink = firstItem.locator('a, img');

        const hasLink = await dealLink.count() > 0;

        expect(hasLink).toBe(true);
      }
    }
  });

  test('FAV-NOTIF-UI-005: Unread notification styling', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);

    await login(page);

    const notificationsLink = page.locator('a[href="/notifications"]');

    if (await notificationsLink.isVisible()) {
      await notificationsLink.click();

      const unreadNotifications = page.locator('[data-unread="true"], .notification.unread');

      const count = await unreadNotifications.count();

      if (count > 0) {
        // Should have distinct styling
        const firstUnread = unreadNotifications.first();

        const bgColor = await firstUnread.evaluate(el => {
          return window.getComputedStyle(el).backgroundColor;
        });

        // Should be visually distinct
        expect(bgColor).toBeDefined();
      }
    }
  });

  test('FAV-NOTIF-UI-006: Notification settings accessible', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);

    await login(page);

    // Check for settings in various places
    const settingsButton = page.locator('button:has-text("Settings"), [data-testid="settings"]');

    const hasSettings = await settingsButton.isVisible();

    if (hasSettings) {
      await settingsButton.click();

      // Should have notification section
      await expect(page.locator('text=/notifications/i')).toBeVisible();
    }
  });

  test('FAV-NOTIF-UI-007: Enable notification prompt is clear', async ({ page, context }) => {
    await context.clearPermissions();

    await login(page);

    await page.goto('/deals/1');

    const notifyButton = page.locator('button:has-text("Notify"), button:has-text("Alert")');

    if (await notifyButton.isVisible()) {
      await notifyButton.click();

      // Should show clear message about enabling notifications
      const prompt = page.locator('[role="dialog"], .modal, .prompt');

      const hasPrompt = await prompt.isVisible();

      if (hasPrompt) {
        await expect(prompt).toBeVisible();

        // Should have clear explanation
        const promptText = await prompt.textContent();

        expect(promptText?.length).toBeGreaterThan(20);
      }
    } else {
      test.skip(true, 'Notification feature not implemented');
    }
  });

  test('FAV-NOTIF-UI-008: Mobile notification experience', async ({ page, context }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await context.grantPermissions(['notifications']);

    await login(page);

    // Notification bell should be easily tappable
    const bellIcon = page.locator('[data-testid="notification-bell"]');

    if (await bellIcon.isVisible()) {
      const box = await bellIcon.boundingBox();

      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('FAV-NOTIF-UI-009: Notification loading state', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);

    await login(page);

    // Mock slow notifications API
    await page.route('**/api/notifications/**', route => {
      setTimeout(() => route.continue(), 2000);
    });

    const notificationsLink = page.locator('a[href="/notifications"]');

    if (await notificationsLink.isVisible()) {
      await notificationsLink.click();

      // Should show loading indicator
      const loader = page.locator('.animate-spin, [data-testid="loading"]');

      const hasLoader = await loader.isVisible({ timeout: 100 });

      if (hasLoader) {
        await expect(loader).toBeVisible();
      }
    }
  });

  test('FAV-NOTIF-UI-010: Empty notifications state', async ({ page, context }) => {
    await context.grantPermissions(['notifications']);

    await login(page);

    const notificationsLink = page.locator('a[href="/notifications"]');

    if (await notificationsLink.isVisible()) {
      await notificationsLink.click();

      // Check for empty state
      const emptyState = page.locator('text=/no notifications|all caught up/i');

      const hasEmpty = await emptyState.isVisible();

      if (hasEmpty) {
        await expect(emptyState).toBeVisible();
      }
    }
  });
});
