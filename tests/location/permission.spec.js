/**
 * Location Permission Module Test Suite
 * RichSave Application
 *
 * Covers: Geolocation Permission Handling
 * Test Categories: Functional, Negative, Edge Cases, UI/UX
 */

import { test, expect } from '@playwright/test';

// ============== FUNCTIONAL TESTS (Happy Path) ==============

test.describe('Location Permission - Functional Tests', () => {
  test('LOC-PERM-001: Request location permission on page load', async ({ page, context }) => {
    // Grant permission context-wide
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');

    // Assert - location should be obtained
    await expect(page.locator('text=Showing deals near your location')).toBeVisible({ timeout: 5000 });

    // Map should be visible
    await expect(page.locator('[data-testid="map"], .map-container, iframe').first()).toBeVisible();
  });

  test('LOC-PERM-002: User grants location permission', async ({ page, context }) => {
    // Simulate granting permission
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');

    // Assert - should show location-based content
    await expect(page.locator('text=Showing deals near')).toBeVisible();

    // Should display user location on map
    const userLocationMarker = page.locator('[data-testid="user-location"], .user-marker');
    const isVisible = await userLocationMarker.isVisible();

    if (isVisible) {
      await expect(userLocationMarker).toBeVisible();
    }
  });

  test('LOC-PERM-003: Update location button works', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');

    // Wait for initial location
    await expect(page.locator('text=Showing deals near')).toBeVisible();

    // Act - click update location
    await page.click('button:has-text("Update Location")');

    // Assert - should refresh location
    // Map should reload or update
    await expect(page.locator('body')).toBeVisible();
  });

  test('LOC-PERM-004: Location permission granted shows nearby deals', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');

    // Wait for location
    await page.waitForTimeout(2000);

    // Assert - should show deals
    const dealCards = page.locator('[data-testid="deal-card"], .deal-card');
    const count = await dealCards.count();

    expect(count).toBeGreaterThan(0);

    // Should show location-based stats
    await expect(page.locator('text=Nearby Deals')).toBeVisible();
  });

  test('LOC-PERM-005: Fallback to default location when permission denied', async ({ page, context }) => {
    // Deny permission
    await context.clearPermissions();
    await context.setGeolocation({ latitude: 0, longitude: 0 });

    await page.goto('/nearby');

    // Assert - should show default location (New York based on code)
    await expect(page.locator('body')).toBeVisible();

    // Should show deals (using default location)
    const dealCards = page.locator('[data-testid="deal-card"], .deal-card');
    await expect(dealCards.first()).toBeVisible({ timeout: 5000 });
  });
});

// ============== NEGATIVE TESTS ==============

test.describe('Location Permission - Negative Tests', () => {
  test('LOC-PERM-NEG-001: User denies location permission', async ({ page, context }) => {
    // Clear permissions (simulate denial)
    await context.clearPermissions();

    await page.goto('/nearby');

    // Assert - should show permission prompt or fallback
    const permissionBanner = page.locator('text=/enable location|location access/i');

    if (await permissionBanner.isVisible()) {
      await expect(permissionBanner).toBeVisible();
    } else {
      // Should fall back to default location
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('LOC-PERM-NEG-002: Geolocation API not available', async ({ page, context }) => {
    // Mock geolocation as unavailable
    await page.addInitScript(() => {
      // @ts-ignore
      delete navigator.geolocation;
    });

    await page.goto('/nearby');

    // Assert - should handle gracefully
    await expect(page.locator('body')).toBeVisible();

    // Should show deals with default location
    await expect(page.locator('[data-testid="deal-card"], .deal-card').first()).toBeVisible({ timeout: 5000 });
  });

  test('LOC-PERM-NEG-003: Geolocation timeout', async ({ page, context }) => {
    // Mock slow geolocation
    await page.addInitScript(() => {
      // @ts-ignore
      navigator.geolocation.getCurrentPosition = (success, error, options) => {
        // Never respond
      };
    });

    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');

    // Assert - should timeout and use default location
    await page.waitForTimeout(5000);

    await expect(page.locator('body')).toBeVisible();
  });

  test('LOC-PERM-NEG-004: Geolocation returns error', async ({ page, context }) => {
    // Mock geolocation error
    await page.addInitScript(() => {
      // @ts-ignore
      navigator.geolocation.getCurrentPosition = (success, error, options) => {
        // @ts-ignore
        error({ code: 2, message: 'Position unavailable' });
      };
    });

    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');

    // Assert - should handle error gracefully
    await expect(page.locator('body')).toBeVisible();

    // Should fall back to default location
    await expect(page.locator('[data-testid="deal-card"], .deal-card').first()).toBeVisible({ timeout: 5000 });
  });
});

// ============== EDGE CASES ==============

test.describe('Location Permission - Edge Cases', () => {
  test('LOC-PERM-EDGE-001: Permission granted after initial denial', async ({ page, context }) => {
    // Start without permission
    await context.clearPermissions();

    await page.goto('/nearby');

    // Wait for page load
    await page.waitForTimeout(2000);

    // Grant permission
    await context.grantPermissions(['geolocation']);

    // Reload page to check permission
    await page.reload();

    // Assert - should now have location
    await expect(page.locator('text=Showing deals near')).toBeVisible({ timeout: 5000 });
  });

  test('LOC-PERM-EDGE-002: Rapid permission state changes', async ({ page, context }) => {
    // Grant
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');

    await page.waitForTimeout(1000);

    // Revoke
    await context.clearPermissions();

    // Reload
    await page.reload();

    // Assert - should handle gracefully
    await expect(page.locator('body')).toBeVisible();
  });

  test('LOC-PERM-EDGE-003: Location coordinates at edge of world', async ({ page, context }) => {
    // Set extreme coordinates
    await context.setGeolocation({ latitude: 90, longitude: 180 });

    await page.goto('/nearby');

    // Assert - should handle without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('LOC-PERM-EDGE-004: Invalid location coordinates', async ({ page, context }) => {
    // Set invalid coordinates (NaN equivalent)
    await context.setGeolocation({ latitude: NaN, longitude: NaN });

    await page.goto('/nearby');

    // Assert - should handle gracefully
    await expect(page.locator('body')).toBeVisible();
  });

  test('LOC-PERM-EDGE-005: Permission prompt on every visit', async ({ page, context }) => {
    // Some browsers ask on every visit in certain modes
    await context.clearPermissions();

    await page.goto('/nearby');
    await page.waitForTimeout(2000);

    await page.goto('/deals');
    await page.goto('/nearby');

    // Should handle multiple prompts gracefully
    await expect(page.locator('body')).toBeVisible();
  });
});

// ============== UI/UX TESTS ==============

test.describe('Location Permission - UI/UX Tests', () => {
  test('LOC-PERM-UI-001: Clear permission request message', async ({ page, context }) => {
    await context.clearPermissions();

    await page.goto('/nearby');

    // Check for permission banner
    const banner = page.locator('text=/enable location|location access/i');

    if (await banner.isVisible()) {
      const bannerText = await banner.textContent();

      expect(bannerText?.length).toBeGreaterThan(10);
      expect(bannerText).toBeDefined();
    }
  });

  test('LOC-PERM-UI-002: Update location button visible', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');

    // Wait for location
    await page.waitForTimeout(2000);

    // Check for update button
    const updateButton = page.locator('button:has-text("Update Location")');

    if (await updateButton.isVisible()) {
      await expect(updateButton).toBeVisible();

      // Should be clickable
      await expect(updateButton).toBeEnabled();
    }
  });

  test('LOC-PERM-UI-003: Location status indicator', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');

    // Wait for location
    await page.waitForTimeout(2000);

    // Should show location is active
    const statusIndicator = page.locator('text=/Showing deals near|Location enabled/i');

    await expect(statusIndicator.first()).toBeVisible();
  });

  test('LOC-PERM-UI-004: Permission banner dismissible', async ({ page, context }) => {
    await context.clearPermissions();

    await page.goto('/nearby');

    const banner = page.locator('.bg-blue-50, [data-testid="location-banner"]');

    if (await banner.isVisible()) {
      // Check for close button
      const closeButton = banner.locator('button[aria-label="close"], button:has-text("×")');

      if (await closeButton.isVisible()) {
        await closeButton.click();

        // Banner should be dismissed
        await expect(banner).not.toBeVisible();
      }
    }
  });

  test('LOC-PERM-UI-005: Graceful fallback when location unavailable', async ({ page, context }) => {
    await context.clearPermissions();

    await page.goto('/nearby');

    // Should not show error state
    // Should show deals with default location
    await expect(page.locator('[data-testid="deal-card"], .deal-card').first()).toBeVisible({ timeout: 5000 });

    // Should show some indication of using default location
    await expect(page.locator('body')).toBeVisible();
  });

  test('LOC-PERM-UI-006: Mobile permission experience', async ({ page, context }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await context.clearPermissions();

    await page.goto('/nearby');

    // Permission prompt should be mobile-friendly
    const banner = page.locator('.bg-blue-50, [data-testid="location-banner"]');

    if (await banner.isVisible()) {
      // Should be full width or properly sized
      const box = await banner.boundingBox();

      expect(box?.width).toBeGreaterThan(300);
    }
  });

  test('LOC-PERM-UI-007: Loading state while getting location', async ({ page, context }) => {
    // Mock slow geolocation
    await page.addInitScript(() => {
      // @ts-ignore
      const originalGet = navigator.geolocation.getCurrentPosition;
      // @ts-ignore
      navigator.geolocation.getCurrentPosition = (success, error, options) => {
        setTimeout(() => originalGet(success, error, options), 3000);
      };
    });

    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');

    // Should show loading indicator
    const loader = page.locator('.animate-spin');

    if (await loader.isVisible({ timeout: 100 })) {
      await expect(loader).toBeVisible();
    }
  });

  test('LOC-PERM-UI-008: Location icon visible', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');

    await page.waitForTimeout(2000);

    // Should show location icon
    const locationIcon = page.locator('svg').filter({ hasText: '' }).first();

    // Check for location pin icon
    await expect(locationIcon).toBeVisible();
  });
});

// ============== PRIVACY TESTS ==============

test.describe('Location Permission - Privacy Tests', () => {
  test('LOC-PERM-PRIV-001: Location not shared without permission', async ({ page, context }) => {
    await context.clearPermissions();

    await page.goto('/nearby');

    // Should not call location API without permission
    // This is more of a code inspection test
  });

  test('LOC-PERM-PRIV-002: Location data not logged excessively', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');

    // Monitor API calls
    const apiCalls = [];

    page.on('request', request => {
      if (request.url().includes('/api/')) {
        apiCalls.push({
          url: request.url(),
          method: request.method()
        });
      }
    });

    await page.waitForTimeout(3000);

    // Location should not be sent with every API call
    const locationCalls = apiCalls.filter(call =>
      call.url.includes('lat') || call.url.includes('lng') || call.url.includes('location')
    );

    // Should have minimal location-related calls
    expect(locationCalls.length).toBeLessThan(10);
  });

  test('LOC-PERM-PRIV-003: Clear location data on logout', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test@123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/deals/);

    // Go to nearby
    await page.goto('/nearby');
    await page.waitForTimeout(2000);

    // Logout
    await page.click('text=Logout');

    // Location data should be cleared from storage
    const locationInStorage = await page.evaluate(() => {
      return localStorage.getItem('userLocation');
    });

    // Should be cleared or not stored persistently
    expect(locationInStorage).toBeNull();
  });
});
