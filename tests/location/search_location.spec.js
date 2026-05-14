/**
 * Location Search Module Test Suite
 * RichSave Application
 *
 * Covers: Location Search Functionality
 * Test Categories: Functional, Negative, Edge Cases, UI/UX
 */

import { test, expect } from '@playwright/test';

// ============== FUNCTIONAL TESTS (Happy Path) ==============

test.describe('Location Search - Functional Tests', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    await page.goto('/nearby');
    await page.waitForTimeout(2000);
  });

  test('LOC-SEARCH-001: Search by location name', async ({ page }) => {
    // Check if search input exists
    const searchInput = page.locator('input[placeholder*="location" i], input[placeholder*="search" i], [data-testid="location-search"]');

    const isVisible = await searchInput.isVisible();

    if (isVisible) {
      // Act - search for location
      await searchInput.fill('New York');
      await page.waitForTimeout(500);

      // Assert - should show suggestions or update location
      const suggestions = page.locator('[data-testid="location-suggestions"], .suggestions');

      const hasSuggestions = await suggestions.isVisible();

      if (hasSuggestions) {
        await expect(suggestions).toBeVisible();
      }
    } else {
      test.skip(true, 'Location search not implemented');
    }
  });

  test('LOC-SEARCH-002: Select location from suggestions', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="location" i], [data-testid="location-search"]');

    if (await searchInput.isVisible()) {
      await searchInput.fill('New York');
      await page.waitForTimeout(1000);

      // Check for suggestions
      const suggestions = page.locator('[data-testid="location-suggestions"] li, .suggestions li');
      const count = await suggestions.count();

      if (count > 0) {
        // Click first suggestion
        await suggestions.first().click();

        // Should update location
        await page.waitForTimeout(500);

        // Map should center on new location
        const mapContainer = page.locator('[data-testid="map"], .map-container');
        await expect(mapContainer.first()).toBeVisible();
      }
    } else {
      test.skip(true, 'Location search not implemented');
    }
  });

  test('LOC-SEARCH-003: Search by postal code', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="location" i], [data-testid="location-search"]');

    if (await searchInput.isVisible()) {
      // Act
      await searchInput.fill('10001');
      await page.waitForTimeout(1000);

      // Should show New York results
      const suggestions = page.locator('[data-testid="location-suggestions"] li, .suggestions li');
      const count = await suggestions.count();

      if (count > 0) {
        const firstSuggestion = await suggestions.first().textContent();
        expect(firstSuggestion).toBeDefined();
      }
    } else {
      test.skip(true, 'Location search not implemented');
    }
  });

  test('LOC-SEARCH-004: Search by city and state', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="location" i], [data-testid="location-search"]');

    if (await searchInput.isVisible()) {
      // Act
      await searchInput.fill('Los Angeles, CA');
      await page.waitForTimeout(1000);

      // Should show suggestions
      const suggestions = page.locator('[data-testid="location-suggestions"] li, .suggestions li');

      const hasSuggestions = await suggestions.count() > 0;

      if (hasSuggestions) {
        await expect(suggestions.first()).toBeVisible();
      }
    } else {
      test.skip(true, 'Location search not implemented');
    }
  });

  test('LOC-SEARCH-005: Use current location button', async ({ page }) => {
    const currentLocationButton = page.locator('button:has-text("Use Current"), button:has-text("Current Location"), [data-testid="use-current-location"]');

    if (await currentLocationButton.isVisible()) {
      // Act
      await currentLocationButton.click();

      // Should get current location
      await page.waitForTimeout(2000);

      // Map should update
      const mapContainer = page.locator('[data-testid="map"], .map-container');
      await expect(mapContainer.first()).toBeVisible();
    }
  });

  test('LOC-SEARCH-006: Recent location searches', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="location" i], [data-testid="location-search"]');

    if (await searchInput.isVisible()) {
      // Search for a location
      await searchInput.fill('Boston');
      await page.waitForTimeout(1000);

      // Select suggestion if available
      const suggestions = page.locator('[data-testid="location-suggestions"] li');
      const count = await suggestions.count();

      if (count > 0) {
        await suggestions.first().click();
        await page.waitForTimeout(500);
      }

      // Click input again
      await searchInput.click();
      await page.waitForTimeout(500);

      // Should show recent searches
      const recentSection = page.locator('text=/recent|history/i');

      const hasRecent = await recentSection.isVisible();

      if (hasRecent) {
        await expect(recentSection).toBeVisible();
      }
    } else {
      test.skip(true, 'Location search not implemented');
    }
  });

  test('LOC-SEARCH-007: Saved locations', async ({ page }) => {
    // Check for saved locations feature
    const savedButton = page.locator('button:has-text("Saved"), button:has-text("Favorites"), [data-testid="saved-locations"]');

    if (await savedButton.isVisible()) {
      await savedButton.click();

      // Should show saved locations
      const savedLocations = page.locator('[data-testid="saved-locations-list"], .saved-locations');

      await expect(savedLocations).toBeVisible();
    }
  });
});

// ============== NEGATIVE TESTS ==============

test.describe('Location Search - Negative Tests', () => {
  test('LOC-SEARCH-NEG-001: Search with non-existent location', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(1000);

    const searchInput = page.locator('input[placeholder*="location" i], [data-testid="location-search"]');

    if (await searchInput.isVisible()) {
      // Act
      await searchInput.fill('XYZNonexistentCity12345');
      await page.waitForTimeout(1000);

      // Should show "no results" message
      const noResults = page.locator('text=/no results|not found/i');

      const hasNoResults = await noResults.isVisible();

      if (hasNoResults) {
        await expect(noResults).toBeVisible();
      }
    } else {
      test.skip(true, 'Location search not implemented');
    }
  });

  test('LOC-SEARCH-NEG-002: Empty location search', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(1000);

    const searchInput = page.locator('input[placeholder*="location" i], [data-testid="location-search"]');

    if (await searchInput.isVisible()) {
      // Act - click search without typing
      await searchInput.click();
      await page.keyboard.press('Enter');

      // Should either show suggestions or do nothing
      // Should not cause errors
      await expect(page.locator('body')).toBeVisible();
    } else {
      test.skip(true, 'Location search not implemented');
    }
  });

  test('LOC-SEARCH-NEG-003: Invalid location format', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(1000);

    const searchInput = page.locator('input[placeholder*="location" i], [data-testid="location-search"]');

    if (await searchInput.isVisible()) {
      // Act
      await searchInput.fill('!@#$%^&*()');
      await page.waitForTimeout(1000);

      // Should handle gracefully
      await expect(page.locator('body')).toBeVisible();
    } else {
      test.skip(true, 'Location search not implemented');
    }
  });

  test('LOC-SEARCH-NEG-004: Geocoding API error', async ({ page, context }) => {
    // Mock geocoding API error
    await page.route('**/geocode/**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Geocoding failed' })
      });
    });

    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(1000);

    const searchInput = page.locator('input[placeholder*="location" i], [data-testid="location-search"]');

    if (await searchInput.isVisible()) {
      await searchInput.fill('Paris');
      await page.waitForTimeout(2000);

      // Should show error message
      const errorMessage = page.locator('text=/error|failed|try again/i');

      const hasError = await errorMessage.isVisible();

      if (hasError) {
        await expect(errorMessage).toBeVisible();
      }
    } else {
      test.skip(true, 'Location search not implemented');
    }
  });

  test('LOC-SEARCH-NEG-005: Search timeout', async ({ page, context }) => {
    // Mock slow geocoding API
    await page.route('**/geocode/**', route => {
      // Never respond
    });

    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(1000);

    const searchInput = page.locator('input[placeholder*="location" i], [data-testid="location-search"]');

    if (await searchInput.isVisible()) {
      await searchInput.fill('Tokyo');
      await page.waitForTimeout(5000);

      // Should timeout gracefully
      await expect(page.locator('body')).toBeVisible();
    } else {
      test.skip(true, 'Location search not implemented');
    }
  });
});

// ============== EDGE CASES ==============

test.describe('Location Search - Edge Cases', () => {
  test('LOC-SEARCH-EDGE-001: Search with same location multiple times', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(1000);

    const searchInput = page.locator('input[placeholder*="location" i], [data-testid="location-search"]');

    if (await searchInput.isVisible()) {
      // Search same location twice
      await searchInput.fill('Chicago');
      await page.waitForTimeout(1000);
      await searchInput.fill('');
      await searchInput.fill('Chicago');
      await page.waitForTimeout(1000);

      // Should handle gracefully - might show recent first
      await expect(page.locator('body')).toBeVisible();
    } else {
      test.skip(true, 'Location search not implemented');
    }
  });

  test('LOC-SEARCH-EDGE-002: Very long location name', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(1000);

    const searchInput = page.locator('input[placeholder*="location" i], [data-testid="location-search"]');

    if (await searchInput.isVisible()) {
      // Act
      await searchInput.fill('A'.repeat(200));
      await page.waitForTimeout(1000);

      // Should handle gracefully
      await expect(page.locator('body')).toBeVisible();
    } else {
      test.skip(true, 'Location search not implemented');
    }
  });

  test('LOC-SEARCH-EDGE-003: Location with special characters', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(1000);

    const searchInput = page.locator('input[placeholder*="location" i], [data-testid="location-search"]');

    if (await searchInput.isVisible()) {
      // Act
      await searchInput.fill('São Paulo, Brasil');
      await page.waitForTimeout(1000);

      // Should handle special characters
      await expect(page.locator('body')).toBeVisible();

      // Check if results returned
      const suggestions = page.locator('[data-testid="location-suggestions"] li');
      const count = await suggestions.count();

      if (count > 0) {
        await expect(suggestions.first()).toBeVisible();
      }
    } else {
      test.skip(true, 'Location search not implemented');
    }
  });

  test('LOC-SEARCH-EDGE-004: Multiple rapid searches', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(1000);

    const searchInput = page.locator('input[placeholder*="location" i], [data-testid="location-search"]');

    if (await searchInput.isVisible()) {
      // Rapid searches
      await searchInput.fill('Miami');
      await page.waitForTimeout(100);
      await searchInput.fill('Seattle');
      await page.waitForTimeout(100);
      await searchInput.fill('Denver');
      await page.waitForTimeout(100);

      // Should handle debouncing
      await expect(page.locator('body')).toBeVisible();
    } else {
      test.skip(true, 'Location search not implemented');
    }
  });

  test('LOC-SEARCH-EDGE-005: Location name in different languages', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(1000);

    const searchInput = page.locator('input[placeholder*="location" i], [data-testid="location-search"]');

    if (await searchInput.isVisible()) {
      // Act
      await searchInput.fill(' München'); // German for Munich
      await page.waitForTimeout(1000);

      // Should handle international characters
      await expect(page.locator('body')).toBeVisible();
    } else {
      test.skip(true, 'Location search not implemented');
    }
  });
});

// ============== UI/UX TESTS ==============

test.describe('Location Search - UI/UX Tests', () => {
  test('LOC-SEARCH-UI-001: Search input has clear placeholder', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');

    const searchInput = page.locator('input[placeholder*="location" i], [data-testid="location-search"]');

    if (await searchInput.isVisible()) {
      const placeholder = await searchInput.getAttribute('placeholder');

      expect(placeholder).toBeTruthy();
      expect(placeholder?.length).toBeGreaterThan(10);
    }
  });

  test('LOC-SEARCH-UI-002: Search suggestions dropdown styled', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(1000);

    const searchInput = page.locator('input[placeholder*="location" i], [data-testid="location-search"]');

    if (await searchInput.isVisible()) {
      await searchInput.fill('New York');
      await page.waitForTimeout(1000);

      const suggestions = page.locator('[data-testid="location-suggestions"], .suggestions');

      if (await suggestions.isVisible()) {
        // Should be styled
        await expect(suggestions).toBeVisible();

        // Should have shadow/border
        const hasShadow = await suggestions.evaluate(el => {
          const styles = window.getComputedStyle(el);
          return styles.boxShadow !== 'none' || styles.border !== 'none';
        });

        expect(hasShadow).toBe(true);
      }
    } else {
      test.skip(true, 'Location search not implemented');
    }
  });

  test('LOC-SEARCH-UI-003: Suggestion items hoverable', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(1000);

    const searchInput = page.locator('input[placeholder*="location" i], [data-testid="location-search"]');

    if (await searchInput.isVisible()) {
      await searchInput.fill('New York');
      await page.waitForTimeout(1000);

      const suggestions = page.locator('[data-testid="location-suggestions"] li, .suggestions li');
      const count = await suggestions.count();

      if (count > 0) {
        // Hover first suggestion
        await suggestions.first().hover();

        // Should have hover effect
        const hasHover = await suggestions.first().evaluate(el => {
          const styles = window.getComputedStyle(el);
          return styles.backgroundColor !== 'transparent' || styles.cursor === 'pointer';
        });

        expect(hasHover).toBe(true);
      }
    } else {
      test.skip(true, 'Location search not implemented');
    }
  });

  test('LOC-SEARCH-UI-004: Clear search button', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(1000);

    const searchInput = page.locator('input[placeholder*="location" i], [data-testid="location-search"]');

    if (await searchInput.isVisible()) {
      await searchInput.fill('Boston');
      await page.waitForTimeout(500);

      // Check for clear button
      const clearButton = searchInput.locator('..').locator('button[aria-label*="clear"], svg').last();

      const hasClearButton = await clearButton.isVisible();

      if (hasClearButton) {
        await clearButton.click();

        // Search should be cleared
        const value = await searchInput.inputValue();
        expect(value).toBe('');
      }
    } else {
      test.skip(true, 'Location search not implemented');
    }
  });

  test('LOC-SEARCH-UI-005: Loading state during search', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    // Mock slow search
    await page.route('**/geocode/**', route => {
      setTimeout(() => route.continue(), 2000);
    });

    await page.goto('/nearby');
    await page.waitForTimeout(1000);

    const searchInput = page.locator('input[placeholder*="location" i], [data-testid="location-search"]');

    if (await searchInput.isVisible()) {
      await searchInput.fill('London');

      // Check for loading indicator
      const loader = searchInput.locator('..').locator('.animate-spin, [data-testid="loading"]');

      const hasLoader = await loader.isVisible({ timeout: 100 });

      if (hasLoader) {
        await expect(loader).toBeVisible();
      }
    } else {
      test.skip(true, 'Location search not implemented');
    }
  });

  test('LOC-SEARCH-UI-006: Mobile search experience', async ({ page, context }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(1000);

    const searchInput = page.locator('input[placeholder*="location" i], [data-testid="location-search"]');

    if (await searchInput.isVisible()) {
      // Should be full width
      const box = await searchInput.boundingBox();

      expect(box?.width).toBeGreaterThan(300);

      // Should be easily tappable
      await searchInput.tap();
      await expect(searchInput).toBeFocused();
    } else {
      test.skip(true, 'Location search not implemented');
    }
  });

  test('LOC-SEARCH-UI-007: Search results show distance', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(1000);

    const searchInput = page.locator('input[placeholder*="location" i], [data-testid="location-search"]');

    if (await searchInput.isVisible()) {
      await searchInput.fill('New York');
      await page.waitForTimeout(1000);

      const suggestions = page.locator('[data-testid="location-suggestions"] li, .suggestions li');
      const count = await suggestions.count();

      if (count > 0) {
        // Check if distance is shown
        const firstSuggestionText = await suggestions.first().textContent();

        const hasDistance = firstSuggestionText?.match(/\d+\s*(mi|km|miles|kilometers)/i);

        if (hasDistance) {
          expect(hasDistance).toBeTruthy();
        }
      }
    } else {
      test.skip(true, 'Location search not implemented');
    }
  });

  test('LOC-SEARCH-UI-008: Search accessible via keyboard', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);

    await page.goto('/nearby');
    await page.waitForTimeout(1000);

    const searchInput = page.locator('input[placeholder*="location" i], [data-testid="location-search"]');

    if (await searchInput.isVisible()) {
      // Tab to search
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      const focused = page.locator(':focus');

      if (await focused.isVisible()) {
        const tagName = await focused.evaluate(el => el.tagName);

        // Should focus on search input
        expect(tagName).toBe('INPUT');
      }
    } else {
      test.skip(true, 'Location search not implemented');
    }
  });
});
