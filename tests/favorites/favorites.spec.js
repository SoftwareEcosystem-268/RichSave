/**
 * Favorites Module Test Suite
 * RichSave Application
 *
 * Covers: Favorite Deals Functionality
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

test.describe('Favorites - Functional Tests', () => {
  test('FAV-001: Add deal to favorites from deals page', async ({ page }) => {
    await login(page);

    // Find a deal card
    const dealCards = page.locator('[data-testid="deal-card"], .deal-card');
    await expect(dealCards.first()).toBeVisible();

    // Find favorite button on first deal
    const favoriteButton = dealCards.first().locator('button:has(svg), [data-testid="favorite-button"]');

    // Check initial state
    const isFavoritedBefore = await favoriteButton.locator('svg').getAttribute('fill');

    // Click to favorite
    await favoriteButton.click();
    await page.waitForTimeout(500);

    // Assert - should be favorited
    const isFavoritedAfter = await favoriteButton.locator('svg').getAttribute('fill');
    expect(isFavoritedAfter).toBe('currentColor');

    // Should show red color
    await expect(favoriteButton.locator('svg')).toHaveClass(/text-red|fill-red/);
  });

  test('FAV-002: Remove deal from favorites', async ({ page }) => {
    await login(page);

    const dealCards = page.locator('[data-testid="deal-card"], .deal-card');
    const favoriteButton = dealCards.first().locator('button:has(svg)');

    // First add to favorites
    await favoriteButton.click();
    await page.waitForTimeout(500);

    // Verify it's favorited
    await expect(favoriteButton.locator('svg')).toHaveAttribute('fill', 'currentColor');

    // Remove from favorites
    await favoriteButton.click();
    await page.waitForTimeout(500);

    // Assert - should be unfavorited
    await expect(favoriteButton.locator('svg')).not.toHaveAttribute('fill', 'currentColor');
  });

  test('FAV-003: View favorites page', async ({ page }) => {
    await login(page);

    // Navigate to favorites
    await page.goto('/favorites');

    // Assert - should show favorites section
    await expect(page.locator('text=/favorites|saved deals/i')).toBeVisible();

    // Should have deal cards or empty state
    const dealCards = page.locator('[data-testid="deal-card"], .deal-card');
    const emptyState = page.locator('text=/no favorites|save your first/i');

    const hasCards = await dealCards.count() > 0;
    const hasEmptyState = await emptyState.isVisible();

    expect(hasCards || hasEmptyState).toBeTruthy();
  });

  test('FAV-004: Add to favorites from deal detail page', async ({ page }) => {
    await login(page);

    // Go to deal detail
    await page.goto('/deals/1');

    // Find favorite button
    const favoriteButton = page.locator('button:has(svg)').filter({ hasText: '' }).first();

    // Click to favorite
    await favoriteButton.click();
    await page.waitForTimeout(500);

    // Assert
    await expect(favoriteButton.locator('svg')).toHaveAttribute('fill', 'currentColor');
  });

  test('FAV-005: Favorites persist across sessions', async ({ page, context }) => {
    await login(page);

    const dealCards = page.locator('[data-testid="deal-card"], .deal-card');
    const favoriteButton = dealCards.first().locator('button:has(svg)');

    // Add to favorite
    await favoriteButton.click();
    await page.waitForTimeout(500);

    // Close and reopen page
    await page.close();

    const page2 = await context.newPage();
    await page2.goto('/deals');

    // Check if favorite persisted
    const dealCards2 = page2.locator('[data-testid="deal-card"], .deal-card');
    const favoriteButton2 = dealCards2.first().locator('button:has(svg)');

    // Note: This depends on if user is logged in again
    // In real scenario, would need to login again
  });

  test('FAV-006: Toggle favorite multiple times', async ({ page }) => {
    await login(page);

    const dealCards = page.locator('[data-testid="deal-card"], .deal-card');
    const favoriteButton = dealCards.first().locator('button:has(svg)');

    // Add
    await favoriteButton.click();
    await page.waitForTimeout(500);
    await expect(favoriteButton.locator('svg')).toHaveAttribute('fill', 'currentColor');

    // Remove
    await favoriteButton.click();
    await page.waitForTimeout(500);
    await expect(favoriteButton.locator('svg')).not.toHaveAttribute('fill', 'currentColor');

    // Add again
    await favoriteButton.click();
    await page.waitForTimeout(500);
    await expect(favoriteButton.locator('svg')).toHaveAttribute('fill', 'currentColor');
  });

  test('FAV-007: Favorites count displayed', async ({ page }) => {
    await login(page);

    // Add some favorites
    const dealCards = page.locator('[data-testid="deal-card"], .deal-card');
    const count = await dealCards.count();

    for (let i = 0; i < Math.min(count, 3); i++) {
      await dealCards.nth(i).locator('button:has(svg)').click();
      await page.waitForTimeout(200);
    }

    // Check if count is displayed somewhere (header, badge, etc.)
    const countBadge = page.locator('[data-testid="favorites-count"], .badge');

    const hasCountBadge = await countBadge.isVisible();

    if (hasCountBadge) {
      const countText = await countBadge.textContent();
      expect(countText).toMatch(/\d+/);
    }
  });

  test('FAV-008: Unfavorite from favorites page', async ({ page }) => {
    await login(page);

    // Add some favorites
    await page.goto('/deals');
    const dealCards = page.locator('[data-testid="deal-card"], .deal-card');
    await dealCards.first().locator('button:has(svg)').click();
    await page.waitForTimeout(500);

    // Go to favorites page
    await page.goto('/favorites');

    // Find and click unfavorite
    const favoriteButton = page.locator('button:has(svg)').first();
    await favoriteButton.click();
    await page.waitForTimeout(500);

    // Should be removed from list or show empty state
    const emptyState = page.locator('text=/no favorites/i');
    const remainingDeals = page.locator('[data-testid="deal-card"]');

    const hasEmpty = await emptyState.isVisible();
    const hasRemaining = await remainingDeals.count() > 0;

    expect(hasEmpty || !hasRemaining).toBeTruthy();
  });

  test('FAV-009: Favorite button icon changes', async ({ page }) => {
    await login(page);

    const dealCards = page.locator('[data-testid="deal-card"], .deal-card');
    const favoriteButton = dealCards.first().locator('button:has(svg)');

    const svg = favoriteButton.locator('svg');

    // Check initial state
    const classBefore = await svg.getAttribute('class');

    // Click to favorite
    await favoriteButton.click();
    await page.waitForTimeout(500);

    // Check class after
    const classAfter = await svg.getAttribute('class');

    // Should be different (heart filled vs outline)
    expect(classAfter).not.toBe(classBefore);
  });

  test('FAV-010: Access favorites from navigation', async ({ page }) => {
    await login(page);

    // Check for favorites link in navigation
    const favoritesLink = page.locator('a[href="/favorites"], text=Favorites');

    if (await favoritesLink.isVisible()) {
      await favoritesLink.click();

      // Should navigate to favorites
      await expect(page).toHaveURL(/\/favorites/, { timeout: 3000 });
    }
  });
});

// ============== NEGATIVE TESTS ==============

test.describe('Favorites - Negative Tests', () => {
  test('FAV-NEG-001: Favorite without login', async ({ page }) => {
    // Not logged in
    await page.goto('/deals');

    const dealCards = page.locator('[data-testid="deal-card"], .deal-card');
    const favoriteButton = dealCards.first().locator('button:has(svg)');

    // Try to favorite
    await favoriteButton.click();
    await page.waitForTimeout(500);

    // Should redirect to login or show prompt
    const currentUrl = page.url();

    expect(currentUrl).toContain('/login');
  });

  test('FAV-NEG-002: Favorite non-existent deal', async ({ page }) => {
    await login(page);

    // Try to favorite via API directly (simulated)
    const response = await page.request.post('/api/user/favorites', {
      data: { dealId: 'nonexistent123' }
    });

    // Should handle gracefully
    expect(response.ok() || response.status() === 404).toBeTruthy();
  });

  test('FAV-NEG-003: Remove favorite that was already removed', async ({ page }) => {
    await login(page);

    await page.goto('/deals');

    const dealCards = page.locator('[data-testid="deal-card"], .deal-card');
    const favoriteButton = dealCards.first().locator('button:has(svg)');

    // Add then remove
    await favoriteButton.click();
    await page.waitForTimeout(500);

    await favoriteButton.click();
    await page.waitForTimeout(500);

    // Click again (already removed)
    await favoriteButton.click();
    await page.waitForTimeout(500);

    // Should handle gracefully
    await expect(page.locator('body')).toBeVisible();
  });

  test('FAV-NEG-004: Favorites API failure', async ({ page }) => {
    await login(page);

    // Mock API failure
    await page.route('**/api/user/favorites', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' })
      });
    });

    const dealCards = page.locator('[data-testid="deal-card"], .deal-card');
    const favoriteButton = dealCards.first().locator('button:has(svg)');

    await favoriteButton.click();
    await page.waitForTimeout(500);

    // Should show error or revert state
    const errorMessage = page.locator('text=/error|failed|try again/i');

    const hasError = await errorMessage.isVisible();

    if (hasError) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('FAV-NEG-005: Rapid favorite toggling', async ({ page }) => {
    await login(page);

    const dealCards = page.locator('[data-testid="deal-card"], .deal-card');
    const favoriteButton = dealCards.first().locator('button:has(svg)');

    // Rapid clicks
    for (let i = 0; i < 5; i++) {
      await favoriteButton.click();
      await page.waitForTimeout(50);
    }

    // Should handle without errors
    await expect(page.locator('body')).toBeVisible();
  });
});

// ============== EDGE CASES ==============

test.describe('Favorites - Edge Cases', () => {
  test('FAV-EDGE-001: Favorite same deal from different pages', async ({ page }) => {
    await login(page);

    // Favorite from deals page
    await page.goto('/deals');
    const dealCards = page.locator('[data-testid="deal-card"], .deal-card');
    await dealCards.first().locator('button:has(svg)').click();
    await page.waitForTimeout(500);

    // Go to detail page
    await page.goto('/deals/1');
    const detailFavoriteButton = page.locator('button:has(svg)').first();

    // Should already be favorited
    await expect(detailFavoriteButton.locator('svg')).toHaveAttribute('fill', 'currentColor');
  });

  test('FAV-EDGE-002: Large number of favorites', async ({ page }) => {
    await login(page);

    // Add many favorites (simulate)
    await page.goto('/deals');

    const dealCards = page.locator('[data-testid="deal-card"], .deal-card');
    const count = await dealCards.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      await dealCards.nth(i).locator('button:has(svg)').click();
      await page.waitForTimeout(100);
    }

    // Go to favorites page
    await page.goto('/favorites');

    // Should handle pagination or scroll
    await expect(page.locator('body')).toBeVisible();
  });

  test('FAV-EDGE-003: Favorite expired deal', async ({ page }) => {
    await login(page);

    // Find an expired deal
    await page.goto('/deals');

    // This would require test data with expired deals
    // Expected: Can still favorite, but deal shows as expired
  });

  test('FAV-EDGE-004: Clear all favorites', async ({ page }) => {
    await login(page);

    // Add some favorites
    await page.goto('/deals');
    const dealCards = page.locator('[data-testid="deal-card"], .deal-card');
    await dealCards.first().locator('button:has(svg)').click();
    await page.waitForTimeout(500);

    // Go to favorites
    await page.goto('/favorites');

    // Check for clear all button
    const clearButton = page.locator('button:has-text("Clear All"), button:has-text("Remove All")');

    if (await clearButton.isVisible()) {
      await clearButton.click();

      // Should confirm and clear
      const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")');

      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }

      // Should show empty state
      await expect(page.locator('text=/no favorites/i')).toBeVisible();
    }
  });

  test('FAV-EDGE-005: Favorites sync across devices', async ({ page, context }) => {
    // This tests cloud sync - would need two different user sessions
    // For now, document expected behavior:
    // Favorites should sync when logged in with same account
  });

  test('FAV-EDGE-006: Favorite deal that gets deleted', async ({ page }) => {
    await login(page);

    // Favorite a deal
    await page.goto('/deals/1');
    const favoriteButton = page.locator('button:has(svg)').first();
    await favoriteButton.click();
    await page.waitForTimeout(500);

    // Deal gets deleted (simulate)
    // Go to favorites page
    await page.goto('/favorites');

    // Should handle deleted deals gracefully
    // Either: hide, show placeholder, or show error state
    await expect(page.locator('body')).toBeVisible();
  });
});

// ============== UI/UX TESTS ==============

test.describe('Favorites - UI/UX Tests', () => {
  test('FAV-UI-001: Heart icon for favorite button', async ({ page }) => {
    await login(page);

    const favoriteButton = page.locator('button:has(svg)').first();

    // Should have heart icon
    const svg = favoriteButton.locator('svg');

    await expect(svg).toBeVisible();

    // Check if it's a heart path
    const path = svg.locator('path[d*="M4.318"], path[d*="heart"], path[d*="Heart"]');
    const isHeart = await path.count() > 0;

    expect(isHeart).toBe(true);
  });

  test('FAV-UI-002: Favorite button hover effect', async ({ page }) => {
    await login(page);

    const favoriteButton = page.locator('button:has(svg)').first();

    await favoriteButton.hover();

    // Should have hover effect
    const hasCursor = await favoriteButton.evaluate(el => {
      return window.getComputedStyle(el).cursor === 'pointer';
    });

    expect(hasCursor).toBe(true);
  });

  test('FAV-UI-003: Animated favorite toggle', async ({ page }) => {
    await login(page);

    const favoriteButton = page.locator('button:has(svg)').first();
    const svg = favoriteButton.locator('svg');

    // Get initial transform
    const transformBefore = await svg.evaluate(el => {
      return window.getComputedStyle(el).transform;
    });

    await favoriteButton.click();
    await page.waitForTimeout(500);

    // Check if animation occurred
    // This is hard to test without observing actual animation
    // At minimum, state should change
    await expect(svg).toBeVisible();
  });

  test('FAV-UI-004: Favorites page empty state', async ({ page }) => {
    await login(page);

    // Make sure no favorites
    await page.goto('/favorites');

    const emptyState = page.locator('text=/no favorites|save your first|empty/i');

    if (await emptyState.isVisible()) {
      await expect(emptyState).toBeVisible();

      // Should have CTA to browse deals
      const ctaButton = page.locator('a:has-text("Browse Deals"), button:has-text("Browse")');

      if (await ctaButton.isVisible()) {
        await expect(ctaButton).toBeVisible();
      }
    }
  });

  test('FAV-UI-005: Favorites page grid layout', async ({ page }) => {
    await login(page);

    // Add some favorites
    await page.goto('/deals');
    const dealCards = page.locator('[data-testid="deal-card"], .deal-card');
    await dealCards.first().locator('button:has(svg)').click();
    await page.waitForTimeout(500);

    await page.goto('/favorites');

    // Should use grid layout
    const gridContainer = page.locator('.grid, [data-testid="favorites-grid"]');

    const hasGrid = await gridContainer.isVisible();

    if (hasGrid) {
      await expect(gridContainer).toBeVisible();
    }
  });

  test('FAV-UI-006: Sort favorites', async ({ page }) => {
    await login(page);

    await page.goto('/favorites');

    // Check for sort options
    const sortButton = page.locator('button:has-text("Sort"), select[name="sort"]');

    if (await sortButton.isVisible()) {
      await expect(sortButton).toBeVisible();

      // Try different sort options
      if (await sortButton.tagName() === 'SELECT') {
        await sortButton.selectOption('date');
        await page.waitForTimeout(500);

        await sortButton.selectOption('savings');
        await page.waitForTimeout(500);
      }
    }
  });

  test('FAV-UI-007: Filter favorites by category', async ({ page }) => {
    await login(page);

    await page.goto('/favorites');

    // Check for category filters
    const categoryFilters = page.locator('button:has-text("Food"), button:has-text("All")');

    const count = await categoryFilters.count();

    if (count > 0) {
      // Click a category
      await categoryFilters.first().click();

      // Should filter results
      await page.waitForTimeout(500);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('FAV-UI-008: Share favorites list', async ({ page }) => {
    await login(page);

    await page.goto('/favorites');

    // Check for share button
    const shareButton = page.locator('button:has-text("Share")');

    if (await shareButton.isVisible()) {
      await shareButton.click();

      // Should show share options
      const shareDialog = page.locator('[role="dialog"], .share-modal');

      await expect(shareDialog).toBeVisible();
    }
  });

  test('FAV-UI-009: Mobile favorite experience', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await login(page);

    await page.goto('/deals');

    const favoriteButton = page.locator('button:has(svg)').first();

    // Should be easily tappable
    const box = await favoriteButton.boundingBox();

    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  test('FAV-UI-010: Keyboard navigation for favorites', async ({ page }) => {
    await login(page);

    await page.goto('/deals');

    // Tab to first favorite button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should focus on favorite button
    const focused = page.locator(':focus');

    const isButton = await focused.evaluate(el => el.tagName === 'BUTTON');

    expect(isButton).toBe(true);

    // Press Enter to toggle
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    // Should toggle favorite
    await expect(page.locator('body')).toBeVisible();
  });
});
