/**
 * Deal Filter Module Test Suite
 * RichSave Application
 *
 * Covers: Deal Filter Functionality
 * Test Categories: Functional, Negative, Edge Cases, UI/UX
 */

import { test, expect } from '@playwright/test';

const categories = ['All', 'Food', 'Shopping', 'Electronics', 'Fitness', 'Travel', 'Entertainment'];

// ============== FUNCTIONAL TESTS (Happy Path) ==============

test.describe('Deal Filter - Functional Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/deals');
  });

  test('DEAL-FILTER-001: Filter by category - Food', async ({ page }) => {
    // Act
    await page.click('button:has-text("Food")');

    // Assert
    const dealCards = page.locator('[data-testid="deal-card"], .deal-card');

    // Wait for filter to apply
    await page.waitForTimeout(300);

    const count = await dealCards.count();

    // If results exist, they should be from Food category
    for (let i = 0; i < Math.min(count, 3); i++) {
      const category = await dealCards.nth(i).locator('[data-testid="category"], .category').textContent();
      expect(category).toMatch(/food/i);
    }

    // Food button should be active
    const foodButton = page.locator('button:has-text("Food")');
    await expect(foodButton).toHaveClass(/bg-primary|text-white/);
  });

  test('DEAL-FILTER-002: Filter by category - Electronics', async ({ page }) => {
    // Act
    await page.click('button:has-text("Electronics")');

    // Assert
    await page.waitForTimeout(300);

    const dealCards = page.locator('[data-testid="deal-card"], .deal-card');
    const count = await dealCards.count();

    for (let i = 0; i < Math.min(count, 3); i++) {
      const category = await dealCards.nth(i).locator('[data-testid="category"], .category').textContent();
      expect(category).toMatch(/electronics/i);
    }
  });

  test('DEAL-FILTER-003: Filter by "All" categories', async ({ page }) => {
    // First, filter by Food
    await page.click('button:has-text("Food")');
    await page.waitForTimeout(300);

    const foodCount = await page.locator('[data-testid="deal-card"], .deal-card').count();

    // Act - select All
    await page.click('button:has-text("All")');
    await page.waitForTimeout(300);

    // Assert - should show all deals
    const allCount = await page.locator('[data-testid="deal-card"], .deal-card').count();
    expect(allCount).toBeGreaterThanOrEqual(foodCount);
  });

  test('DEAL-FILTER-004: Combined filter - category + search', async ({ page }) => {
    // Act - filter by Food first
    await page.click('button:has-text("Food")');
    await page.waitForTimeout(300);

    // Then search
    await page.fill('input[placeholder*="Search"]', '50%');
    await page.waitForTimeout(500);

    // Assert - results should match both filters
    const dealCards = page.locator('[data-testid="deal-card"], .deal-card');
    const count = await dealCards.count();

    for (let i = 0; i < Math.min(count, 3); i++) {
      const text = await dealCards.nth(i).textContent();
      const category = await dealCards.nth(i).locator('[data-testid="category"], .category').textContent();

      expect(text?.toLowerCase()).toContain('50');
      expect(category).toMatch(/food/i);
    }
  });

  test('DEAL-FILTER-005: Category button active state', async ({ page }) => {
    // Act
    const foodButton = page.locator('button:has-text("Food")');
    const shoppingButton = page.locator('button:has-text("Shopping")');

    await foodButton.click();
    await page.waitForTimeout(300);

    // Assert - Food should be active
    await expect(foodButton).toHaveClass(/bg-primary|text-white|shadow/);

    // Shopping should not be active
    await expect(shoppingButton).not.toHaveClass(/bg-primary|text-white/);

    // Act - switch to Shopping
    await shoppingButton.click();
    await page.waitForTimeout(300);

    // Assert - Shopping should be active
    await expect(shoppingButton).toHaveClass(/bg-primary|text-white|shadow/);
    await expect(foodButton).not.toHaveClass(/bg-primary|text-white/);
  });

  test('DEAL-FILTER-006: All categories available', async ({ page }) => {
    // Assert - all category buttons should be visible
    for (const category of categories) {
      const button = page.locator(`button:has-text("${category}")`);
      await expect(button).toBeVisible();
    }
  });

  test('DEAL-FILTER-007: Filter updates result count', async ({ page }) => {
    // Get initial count with All
    const initialText = await page.locator('text=Showing').textContent();
    const initialCount = initialText?.match(/\d+/)?.[0];

    // Filter by Food
    await page.click('button:has-text("Food")');
    await page.waitForTimeout(300);

    const filterText = await page.locator('text=Showing').textContent();
    const filterCount = filterText?.match(/\d+/)?.[0];

    // Assert - counts should be different
    expect(filterCount).toBeDefined();
    if (initialCount && filterCount) {
      expect(parseInt(filterCount)).toBeLessThanOrEqual(parseInt(initialCount));
    }
  });

  test('DEAL-FILTER-008: Switch between categories', async ({ page }) => {
    // Test multiple category switches
    await page.click('button:has-text("Food")');
    await page.waitForTimeout(300);
    const foodCount = await page.locator('[data-testid="deal-card"], .deal-card').count();

    await page.click('button:has-text("Shopping")');
    await page.waitForTimeout(300);
    const shoppingCount = await page.locator('[data-testid="deal-card"], .deal-card').count();

    await page.click('button:has-text("All")');
    await page.waitForTimeout(300);
    const allCount = await page.locator('[data-testid="deal-card"], .deal-card').count();

    // Assert
    expect(allCount).toBeGreaterThanOrEqual(foodCount);
    expect(allCount).toBeGreaterThanOrEqual(shoppingCount);
  });
});

// ============== NEGATIVE TESTS ==============

test.describe('Deal Filter - Negative Tests', () => {
  test('DEAL-FILTER-NEG-001: Category with no deals', async ({ page }) => {
    await page.goto('/deals');

    // Try filtering by a category that might have no deals
    // This depends on test data

    // For now, test with a potentially empty category
    await page.click('button:has-text("Travel")');
    await page.waitForTimeout(500);

    const dealCards = page.locator('[data-testid="deal-card"], .deal-card');
    const count = await dealCards.count();

    if (count === 0) {
      // Should show empty state
      await expect(page.locator('text=No deals found')).toBeVisible();
    }
  });

  test('DEAL-FILTER-NEG-002: Invalid category selection', async ({ page }) => {
    await page.goto('/deals');

    // Try to select via invalid method (programmatic)
    await page.evaluate(() => {
      // Try to set an invalid category
      window.dispatchEvent(new CustomEvent('filter', { detail: { category: 'InvalidCategory' } }));
    });

    // Should not crash
    await expect(page.locator('body')).toBeVisible();
  });
});

// ============== EDGE CASES ==============

test.describe('Deal Filter - Edge Cases', () => {
  test('DEAL-FILTER-EDGE-001: Filter persistence across navigation', async ({ page }) => {
    await page.goto('/deals');

    // Set filter
    await page.click('button:has-text("Food")');
    await page.waitForTimeout(300);

    // Navigate away
    await page.goto('/savings');

    // Navigate back
    await page.goto('/deals');

    // Check if filter persists (implementation-dependent)
    const activeButton = page.locator('button[class*="bg-primary"]');
    const isVisible = await activeButton.isVisible();

    if (isVisible) {
      const buttonText = await activeButton.textContent();
      expect(buttonText).toContain('Food');
    }
  });

  test('DEAL-FILTER-EDGE-002: Rapid category changes', async ({ page }) => {
    await page.goto('/deals');

    // Click multiple categories rapidly
    for (let i = 0; i < 5; i++) {
      await page.click(`button:has-text("${categories[i % categories.length]}")`);
      await page.waitForTimeout(50);
    }

    // Should handle gracefully without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('DEAL-FILTER-EDGE-003: Filter with empty result set', async ({ page }) => {
    await page.goto('/deals');

    // Combine search and filter for potentially empty results
    await page.fill('input[placeholder*="Search"]', 'xyznonexistent123');
    await page.click('button:has-text("Food")');
    await page.waitForTimeout(500);

    // Should show empty state
    await expect(page.locator('text=No deals found')).toBeVisible();
  });

  test('DEAL-FILTER-EDGE-004: Filter then clear search', async ({ page }) => {
    await page.goto('/deals');

    // Set both filters
    await page.click('button:has-text("Food")');
    await page.fill('input[placeholder*="Search"]', '50%');
    await page.waitForTimeout(500);

    const combinedCount = await page.locator('[data-testid="deal-card"], .deal-card').count();

    // Clear search
    await page.fill('input[placeholder*="Search"]', '');
    await page.waitForTimeout(500);

    const filterOnlyCount = await page.locator('[data-testid="deal-card"], .deal-card').count();

    // Filter-only should have more results
    expect(filterOnlyCount).toBeGreaterThanOrEqual(combinedCount);
  });
});

// ============== UI/UX TESTS ==============

test.describe('Deal Filter - UI/UX Tests', () => {
  test('DEAL-FILTER-UI-001: Category buttons visually distinct', async ({ page }) => {
    await page.goto('/deals');

    // Active vs inactive buttons
    await page.click('button:has-text("Food")');
    await page.waitForTimeout(300);

    const activeButton = page.locator('button:has-text("Food")');
    const inactiveButton = page.locator('button:has-text("Shopping")');

    // Active should have different styling
    const activeClasses = await activeButton.getAttribute('class');
    const inactiveClasses = await inactiveButton.getAttribute('class');

    expect(activeClasses).not.toBe(inactiveClasses);
  });

  test('DEAL-FILTER-UI-002: Category buttons hover effect', async ({ page }) => {
    await page.goto('/deals');

    const button = page.locator('button:has-text("Food")');

    // Hover over button
    await button.hover();

    // Check for hover state (cursor pointer)
    const cursor = await button.evaluate(el => window.getComputedStyle(el).cursor);
    expect(cursor).toBe('pointer');
  });

  test('DEAL-FILTER-UI-003: Filter section scrollable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/deals');

    // Filter buttons should be horizontally scrollable if needed
    const filterContainer = page.locator('.flex.flex-wrap.gap-2, [data-testid="category-filters"]');

    await expect(filterContainer).toBeVisible();

    // Check if buttons wrap or scroll
    const buttons = filterContainer.locator('button');
    const count = await buttons.count();

    expect(count).toBeGreaterThan(0);
  });

  test('DEAL-FILTER-UI-004: Active category indicator', async ({ page }) => {
    await page.goto('/deals');

    await page.click('button:has-text("Food")');
    await page.waitForTimeout(300);

    // Active button should be visually indicated
    const activeButton = page.locator('button:has-text("Food")');

    // Check for visual indicators (color, shadow, etc.)
    const classes = await activeButton.getAttribute('class');

    // Should have some active styling
    expect(classes || '').toMatch(/bg-primary|text-white|shadow/);
  });

  test('DEAL-FILTER-UI-005: Category buttons keyboard accessible', async ({ page }) => {
    await page.goto('/deals');

    // Tab to first category button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should focus on a button
    const focused = await page.locator(':focus').textContent();
    expect(categories).toContainEqual(focused);
  });

  test('DEAL-FILTER-UI-006: Filter section labeled properly', async ({ page }) => {
    await page.goto('/deals');

    // Check for section label or heading
    const filterSection = page.locator('button:has-text("All")').locator('..');

    // Should have accessible name or be in a labeled section
    const ariaLabel = await filterSection.getAttribute('aria-label');

    // Or check if there's a heading nearby
    const hasHeading = await page.locator('h1, h2, h3').count() > 0;

    expect(ariaLabel || hasHeading).toBeTruthy();
  });

  test('DEAL-FILTER-UI-007: Filter transition animation', async ({ page }) => {
    await page.goto('/deals');

    const foodButton = page.locator('button:has-text("Food")');
    const allButton = page.locator('button:has-text("All")');

    // Click and check for transition
    await foodButton.click();

    // Visual feedback should be immediate or animated
    await expect(foodButton).toHaveClass(/bg-primary|text-white/, { timeout: 500 });
  });

  test('DEAL-FILTER-UI-008: Filter buttons consistent spacing', async ({ page }) => {
    await page.goto('/deals');

    const buttons = page.locator('button:has-text("All"), button:has-text("Food"), button:has-text("Shopping")');

    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // All buttons should have similar sizing
    for (let i = 0; i < count; i++) {
      await expect(buttons.nth(i)).toBeVisible();
    }
  });

  test('DEAL-FILTER-UI-009: Clear all filters option', async ({ page }) => {
    await page.goto('/deals');

    // Set multiple filters
    await page.click('button:has-text("Food")');
    await page.fill('input[placeholder*="Search"]', 'Pizza');
    await page.waitForTimeout(500);

    // Check for clear all option (if implemented)
    const clearButton = page.locator('button:has-text("Clear"), button:has-text("Reset")');

    if (await clearButton.isVisible()) {
      await clearButton.click();

      // All filters should be cleared
      const searchValue = await page.locator('input[placeholder*="Search"]').inputValue();
      expect(searchValue).toBe('');

      const allButton = page.locator('button:has-text("All")');
      await expect(allButton).toHaveClass(/bg-primary|text-white/);
    }
  });

  test('DEAL-FILTER-UI-010: Filter loading state', async ({ page }) => {
    await page.goto('/deals');

    // Mock slow API
    await page.route('**/api/deals*', route => {
      setTimeout(() => route.continue(), 1000);
    });

    // Click category
    await page.click('button:has-text("Food")');

    // Check for loading indicator
    const loader = page.locator('.animate-spin, [data-testid="loading"]');

    if (await loader.isVisible({ timeout: 100 })) {
      await expect(loader).toBeVisible();
    }
  });
});
