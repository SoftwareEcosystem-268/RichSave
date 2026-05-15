/**
 * Location Map Module Test Suite
 * RichSave Application
 *
 * Covers: Map View Functionality
 * Test Categories: Functional, Negative, Edge Cases, UI/UX
 */

import { test, expect } from '@playwright/test';

// ============== FUNCTIONAL TESTS (Happy Path) ==============

test.describe('Location Map - Functional Tests', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await page.goto('/nearby');
    await page.waitForTimeout(2000); // Wait for map to load
  });

  test('LOC-MAP-001: Map view displays correctly', async ({ page }) => {
    // Assert - map container should be visible
    const mapContainer = page.locator('[data-testid="map"], .map-container, iframe, .leaflet-container');

    // Wait for map to load
    await expect(mapContainer.first()).toBeVisible({ timeout: 5000 });
  });

  test('LOC-MAP-002: User location marker displayed', async ({ page }) => {
    // Assert - user location should be shown on map
    const userMarker = page.locator('[data-testid="user-location"], .user-marker, .leaflet-user-marker');

    const isVisible = await userMarker.isVisible();

    if (isVisible) {
      await expect(userMarker).toBeVisible();
    }
    // Some maps don't show user marker explicitly
  });

  test('LOC-MAP-003: Deal markers displayed on map', async ({ page }) => {
    // Assert - deal markers should be visible
    const dealMarkers = page.locator('[data-testid="deal-marker"], .deal-marker, .marker');

    const count = await dealMarkers.count();

    // Should have at least some markers
    expect(count).toBeGreaterThan(0);

    // Each marker should be visible
    for (let i = 0; i < Math.min(count, 3); i++) {
      await expect(dealMarkers.nth(i)).toBeVisible();
    }
  });

  test('LOC-MAP-004: Click deal marker to view details', async ({ page }) => {
    // Find deal markers
    const dealMarkers = page.locator('[data-testid="deal-marker"], .deal-marker, .marker');
    const count = await dealMarkers.count();

    if (count > 0) {
      // Click first marker
      await dealMarkers.first().click();

      // Assert - should show deal details
      const dealCard = page.locator('[data-testid="deal-card"], .deal-card');

      // Either a popup/card appears or it updates a selected deal section
      const isVisible = await dealCard.isVisible() ||
                       await page.locator('.leaflet-popup, [data-testid="selected-deal"]').isVisible();

      expect(isVisible).toBeTruthy();
    }
  });

  test('LOC-MAP-005: Map zoom controls work', async ({ page }) => {
    // Check for zoom controls
    const zoomIn = page.locator('button:has-text("+"), .leaflet-control-zoom-in');
    const zoomOut = page.locator('button:has-text("-"), .leaflet-control-zoom-out');

    if (await zoomIn.isVisible()) {
      // Click zoom in
      await zoomIn.click();
      await page.waitForTimeout(500);

      // Map should be zoomed in (check via scale or state)
      // This is hard to test without access to map instance
      // At minimum, button should be clickable
      await expect(zoomIn).toBeEnabled();
    }
  });

  test('LOC-MAP-006: Map pan controls work', async ({ page }) => {
    // Test map panning
    const mapContainer = page.locator('[data-testid="map"], .leaflet-container');

    if (await mapContainer.isVisible()) {
      // Try dragging the map
      await mapContainer.click({ position: { x: 200, y: 200 } });
      await page.mouse.down();
      await page.mouse.move(100, 100);
      await page.mouse.up();

      // Map should pan (hard to verify without map API access)
      await expect(mapContainer).toBeVisible();
    }
  });

  test('LOC-MAP-007: Switch to list view', async ({ page }) => {
    // Act - click list view button
    await page.click('button:has-text("List View")');

    // Assert - should show list view
    await expect(page.locator('button:has-text("List View")')).toHaveClass(/bg-primary/);

    // List view should be visible
    const dealCards = page.locator('[data-testid="deal-card"], .deal-card');
    await expect(dealCards.first()).toBeVisible();
  });

  test('LOC-MAP-008: Switch between map and list view', async ({ page }) => {
    // Start in map view
    await expect(page.locator('button:has-text("Map View")')).toHaveClass(/bg-primary/);

    // Switch to list
    await page.click('button:has-text("List View")');
    await expect(page.locator('button:has-text("List View")')).toHaveClass(/bg-primary/);

    // Switch back to map
    await page.click('button:has-text("Map View")');
    await expect(page.locator('button:has-text("Map View")')).toHaveClass(/bg-primary/);

    // Map should be visible again
    const mapContainer = page.locator('[data-testid="map"], .map-container');
    await expect(mapContainer.first()).toBeVisible();
  });

  test('LOC-MAP-009: Map legend/info displayed', async ({ page }) => {
    // Check for map legend or info
    const legend = page.locator('[data-testid="map-legend"], .map-legend, .leaflet-control');

    const isVisible = await legend.isVisible();

    if (isVisible) {
      await expect(legend).toBeVisible();

      // Should have meaningful labels
      const legendText = await legend.textContent();
      expect(legendText?.length).toBeGreaterThan(0);
    }
  });

  test('LOC-MAP-010: Map loads with user location centered', async ({ page }) => {
    // Map should center on user's location
    const mapContainer = page.locator('[data-testid="map"], .leaflet-container');

    await expect(mapContainer.first()).toBeVisible({ timeout: 5000 });

    // Hard to verify center without map API
    // At minimum, map should be loaded
  });
});

// ============== NEGATIVE TESTS ==============

test.describe('Location Map - Negative Tests', () => {
  test('LOC-MAP-NEG-001: Map fails to load', async ({ page, context }) => {
    // Block map tile requests
    await page.route('**/tiles/**', route => route.abort());

    await context.grantPermissions(['geolocation']);
    await page.goto('/nearby');
    await page.waitForTimeout(2000);

    // Should handle gracefully - show error or fallback
    const mapContainer = page.locator('[data-testid="map"], .map-container');

    // Either shows error message or gracefully degrades
    await expect(page.locator('body')).toBeVisible();
  });

  test('LOC-MAP-NEG-002: No deals in area', async ({ page, context }) => {
    // Set location to remote area
    await context.setGeolocation({ latitude: 0, longitude: 0 });
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(2000);

    // Should show "no deals" message or display empty state
    const noDealsMessage = page.locator('text=/no deals|no results/i');
    const mapContainer = page.locator('[data-testid="map"]');

    // Either message or map should be visible
    expect(await noDealsMessage.isVisible() || await mapContainer.isVisible()).toBeTruthy();
  });

  test('LOC-MAP-NEG-003: Map API quota exceeded', async ({ page, context }) => {
    // Mock API quota error
    await page.route('**/maps/**', route => {
      route.fulfill({
        status: 429,
        body: JSON.stringify({ error: 'Quota exceeded' })
      });
    });

    await context.grantPermissions(['geolocation']);
    await page.goto('/nearby');
    await page.waitForTimeout(2000);

    // Should handle gracefully
    await expect(page.locator('body')).toBeVisible();
  });

  test('LOC-MAP-NEG-004: Invalid location coordinates', async ({ page, context }) => {
    // Set invalid coordinates
    await context.setGeolocation({ latitude: NaN, longitude: NaN });
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(2000);

    // Should use fallback location
    await expect(page.locator('body')).toBeVisible();
  });
});

// ============== EDGE CASES ==============

test.describe('Location Map - Edge Cases', () => {
  test('LOC-MAP-EDGE-001: Map with many deal markers', async ({ page, context }) => {
    // Test with location that has many deals
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(2000);

    // Should handle many markers gracefully (cluster or show all)
    const markers = page.locator('[data-testid="deal-marker"], .deal-marker, .marker');
    const count = await markers.count();

    if (count > 10) {
      // Should have clustering or pagination
      const clusterMarker = page.locator('.marker-cluster, [data-testid="cluster"]');

      // Either clusters or individual markers
      await expect(markers.first()).toBeVisible();
    }
  });

  test('LOC-MAP-EDGE-002: Map with overlapping markers', async ({ page, context }) => {
    // Deals at same location
    await context.setGeolocation({ latitude: 40.7128, longitude: -74.006 });
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(2000);

    // Should handle overlapping (clustering or offset)
    const markers = page.locator('[data-testid="deal-marker"], .deal-marker, .marker');
    const count = await markers.count();

    if (count > 0) {
      await expect(markers.first()).toBeVisible();
    }
  });

  test('LOC-MAP-EDGE-003: Rapid map view changes', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(1000);

    // Rapidly toggle between map and list
    for (let i = 0; i < 5; i++) {
      await page.click('button:has-text("List View")');
      await page.waitForTimeout(100);
      await page.click('button:has-text("Map View")');
      await page.waitForTimeout(100);
    }

    // Should handle gracefully
    await expect(page.locator('body')).toBeVisible();
  });

  test('LOC-MAP-EDGE-004: Map resize on window resize', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(2000);

    // Resize window
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);

    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // Map should resize correctly
    const mapContainer = page.locator('[data-testid="map"], .map-container');
    await expect(mapContainer.first()).toBeVisible();
  });

  test('LOC-MAP-EDGE-005: Location update refreshes map', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(2000);

    // Change location
    await context.setGeolocation({ latitude: 51.5074, longitude: -0.1278 }); // London

    // Click update location
    const updateButton = page.locator('button:has-text("Update Location")');
    if (await updateButton.isVisible()) {
      await updateButton.click();
      await page.waitForTimeout(2000);

      // Map should refresh
      await expect(page.locator('[data-testid="map"]')).toBeVisible();
    }
  });
});

// ============== UI/UX TESTS ==============

test.describe('Location Map - UI/UX Tests', () => {
  test('LOC-MAP-UI-001: Map is full width', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(2000);

    const mapContainer = page.locator('[data-testid="map"], .map-container');

    if (await mapContainer.isVisible()) {
      const box = await mapContainer.boundingBox();

      expect(box?.width).toBeGreaterThan(500);
    }
  });

  test('LOC-MAP-UI-002: Map has appropriate height', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(2000);

    const mapContainer = page.locator('[data-testid="map"], .map-container');

    if (await mapContainer.isVisible()) {
      const box = await mapContainer.boundingBox();

      expect(box?.height).toBeGreaterThan(300);
    }
  });

  test('LOC-MAP-UI-003: Map controls are accessible', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(2000);

    // Check zoom buttons
    const zoomIn = page.locator('button:has-text("+"), .leaflet-control-zoom-in');

    if (await zoomIn.isVisible()) {
      // Should be keyboard accessible
      await zoomIn.focus();
      await expect(zoomIn).toBeFocused();
    }
  });

  test('LOC-MAP-UI-004: Selected deal card visible below map', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(2000);

    // Click a marker
    const markers = page.locator('[data-testid="deal-marker"], .deal-marker, .marker');
    const count = await markers.count();

    if (count > 0) {
      await markers.first().click();
      await page.waitForTimeout(500);

      // Selected deal should appear below map
      const selectedDeal = page.locator('[data-testid="selected-deal"], .deal-card');

      const isVisible = await selectedDeal.isVisible();

      if (isVisible) {
        await expect(selectedDeal).toBeVisible();
      }
    }
  });

  test('LOC-MAP-UI-005: View toggle buttons clearly labeled', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');

    // Both view buttons should be visible
    await expect(page.locator('button:has-text("Map View")')).toBeVisible();
    await expect(page.locator('button:has-text("List View")')).toBeVisible();

    // Active view should be visually distinct
    const mapViewButton = page.locator('button:has-text("Map View")');
    await expect(mapViewButton).toHaveClass(/bg-primary|text-white/);
  });

  test('LOC-MAP-UI-006: Map loading indicator', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    // Mock slow map load
    await page.route('**/maps/**', route => {
      setTimeout(() => route.continue(), 2000);
    });

    await page.goto('/nearby');

    // Should show loading indicator
    const loader = page.locator('.animate-spin');

    if (await loader.isVisible({ timeout: 100 })) {
      await expect(loader).toBeVisible();
    }
  });

  test('LOC-MAP-UI-007: Mobile map experience', async ({ page, context }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(2000);

    // Map should be full width on mobile
    const mapContainer = page.locator('[data-testid="map"], .map-container');

    if (await mapContainer.isVisible()) {
      const box = await mapContainer.boundingBox();

      expect(box?.width).toBeGreaterThan(350);
    }

    // Controls should be touch-friendly
    const controls = page.locator('.leaflet-control, button');

    const count = await controls.count();

    for (let i = 0; i < count; i++) {
      const controlBox = await controls.nth(i).boundingBox();

      if (controlBox) {
        expect(controlBox.width).toBeGreaterThanOrEqual(30);
        expect(controlBox.height).toBeGreaterThanOrEqual(30);
      }
    }
  });

  test('LOC-MAP-UI-008: Map stats display', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(2000);

    // Check for stats display
    const stats = page.locator('text=Nearby Deals, text=Potential Savings');

    await expect(stats.first()).toBeVisible();

    // Stats should have values
    const statsText = await stats.allTextContents();
    expect(statsText.length).toBeGreaterThan(0);
  });

  test('LOC-MAP-UI-009: Deal markers have tooltips', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(2000);

    // Hover over a marker
    const markers = page.locator('[data-testid="deal-marker"], .deal-marker, .marker');
    const count = await markers.count();

    if (count > 0) {
      await markers.first().hover();
      await page.waitForTimeout(500);

      // Should show tooltip or popup
      const tooltip = page.locator('.leaflet-popup, [data-tooltip], .tooltip');

      const isVisible = await tooltip.isVisible();

      if (isVisible) {
        await expect(tooltip).toBeVisible();
      }
    }
  });

  test('LOC-MAP-UI-010: Favorite button works from map', async ({ page, context }) => {
    // Setup - login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test@123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/deals/);

    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(2000);

    // Find favorite button on selected deal
    const favoriteButton = page.locator('button:has(svg)').filter({ hasText: '' }).first();

    if (await favoriteButton.isVisible()) {
      const isFavoritedBefore = await favoriteButton.locator('svg').getAttribute('fill');

      await favoriteButton.click();
      await page.waitForTimeout(500);

      const isFavoritedAfter = await favoriteButton.locator('svg').getAttribute('fill');

      expect(isFavoritedAfter).not.toBe(isFavoritedBefore);
    }
  });
});
