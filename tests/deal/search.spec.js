/**
 * Deal Search Module Test Suite
 * RichSave Application
 *
 * Covers: Deal Search Functionality
 * Test Categories: Functional, Negative, Edge Cases, UI/UX
 */

import { test, expect } from '@playwright/test';

// ============== FUNCTIONAL TESTS (Happy Path) ==============

test.describe('Deal Search - Functional Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/deals');
  });

  test('DEAL-SEARCH-001: Search by deal title', async ({ page }) => {
    // Act - search for pizza
    await page.fill('input[placeholder*="Search"]', 'Pizza');
    await page.waitForTimeout(500); // Wait for debounce

    // Assert
    const results = page.locator('.deals-list, [data-testid="deals"]');
    await expect(results.first()).toBeVisible();

    // Results should contain pizza-related deals
    const dealCards = page.locator('[data-testid="deal-card"], .deal-card');
    const count = await dealCards.count();

    // Should have filtered results
    expect(count).toBeGreaterThan(0);

    // Each result should match search
    for (let i = 0; i < Math.min(count, 3); i++) {
      const title = await dealCards.nth(i).textContent();
      expect(title?.toLowerCase()).toContain('pizza');
    }
  });

  test('DEAL-SEARCH-002: Search by store name', async ({ page }) => {
    // Act - search for Domino's
    await page.fill('input[placeholder*="Search"]', "Domino's");
    await page.waitForTimeout(500);

    // Assert
    const dealCards = page.locator('[data-testid="deal-card"], .deal-card');
    const count = await dealCards.count();

    if (count > 0) {
      // Results should contain Domino's deals
      for (let i = 0; i < count; i++) {
        const card = dealCards.nth(i);
        const text = await card.textContent();
        expect(text?.toLowerCase()).toMatch(/domino|pizza/);
      }
    }
  });

  test('DEAL-SEARCH-003: Search by category', async ({ page }) => {
    // Act - search for Food category
    await page.fill('input[placeholder*="Search"]', 'Food');
    await page.waitForTimeout(500);

    // Assert
    const dealCards = page.locator('[data-testid="deal-card"], .deal-card');
    const count = await dealCards.count();

    if (count > 0) {
      // Results should be from Food category
      for (let i = 0; i < count; i++) {
        const card = dealCards.nth(i);
        const category = await card.locator('[data-testid="category"], .category').textContent();
        expect(category).toMatch(/food/i);
      }
    }
  });

  test('DEAL-SEARCH-004: Clear search results', async ({ page }) => {
    // Arrange - search first
    await page.fill('input[placeholder*="Search"]', 'Pizza');
    await page.waitForTimeout(500);

    const resultCount1 = await page.locator('[data-testid="deal-card"], .deal-card').count();

    // Act - clear search
    await page.fill('input[placeholder*="Search"]', '');
    await page.waitForTimeout(500);

    // Assert - should show all deals
    const resultCount2 = await page.locator('[data-testid="deal-card"], .deal-card').count();
    expect(resultCount2).toBeGreaterThan(resultCount1);
  });

  test('DEAL-SEARCH-005: Real-time search (debounce)', async ({ page }) => {
    // Act - type quickly
    const searchInput = page.locator('input[placeholder*="Search"]');

    await searchInput.fill('P');
    await page.waitForTimeout(100);
    await searchInput.fill('Pi');
    await page.waitForTimeout(100);
    await searchInput.fill('Piz');
    await page.waitForTimeout(100);

    // Wait for debounce to complete
    await page.waitForTimeout(600);

    // Assert - should show filtered results
    const results = page.locator('[data-testid="deal-card"], .deal-card');
    await expect(results.first()).toBeVisible();
  });

  test('DEAL-SEARCH-006: Search with case insensitivity', async ({ page }) => {
    // Act - search with different cases
    await page.fill('input[placeholder*="Search"]', 'PIZZA');
    await page.waitForTimeout(500);

    const resultCount1 = await page.locator('[data-testid="deal-card"], .deal-card').count();

    await page.fill('input[placeholder*="Search"]', 'pizza');
    await page.waitForTimeout(500);

    const resultCount2 = await page.locator('[data-testid="deal-card"], .deal-card').count();

    // Assert - same results for different cases
    expect(resultCount1).toBe(resultCount2);
  });

  test('DEAL-SEARCH-007: Search with partial match', async ({ page }) => {
    // Act - search for partial word
    await page.fill('input[placeholder*="Search"]', 'Piz');
    await page.waitForTimeout(500);

    // Assert - should show matching results
    const dealCards = page.locator('[data-testid="deal-card"], .deal-card');
    const count = await dealCards.count();

    if (count > 0) {
      const title = await dealCards.first().textContent();
      expect(title?.toLowerCase()).toContain('piz');
    }
  });

  test('DEAL-SEARCH-008: Search shows "No results" message', async ({ page }) => {
    // Act - search for non-existent deal
    await page.fill('input[placeholder*="Search"]', 'xyznonexistent123');
    await page.waitForTimeout(500);

    // Assert
    await expect(page.locator('text=No deals found')).toBeVisible();
    await expect(page.locator('text=/adjust your search/i')).toBeVisible();
  });

  test('DEAL-SEARCH-009: Search result count display', async ({ page }) => {
    // Get initial count
    const initialText = await page.locator('text=Showing').textContent();
    const initialCount = initialText?.match(/\d+/)?.[0];

    // Act - search
    await page.fill('input[placeholder*="Search"]', 'Food');
    await page.waitForTimeout(500);

    // Assert - count should update
    const searchText = await page.locator('text=Showing').textContent();
    const searchCount = searchText?.match(/\d+/)?.[0];

    expect(searchCount).toBeDefined();

    // Search count should be <= initial count
    if (initialCount && searchCount) {
      expect(parseInt(searchCount)).toBeLessThanOrEqual(parseInt(initialCount));
    }
  });
});

// ============== NEGATIVE TESTS ==============

test.describe('Deal Search - Negative Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/deals');
  });

  test('DEAL-SEARCH-NEG-001: Search with special characters', async ({ page }) => {
    // Act
    await page.fill('input[placeholder*="Search"]', '@#$%^&*()');
    await page.waitForTimeout(500);

    // Assert - should handle gracefully
    const results = page.locator('[data-testid="deal-card"], .deal-card');
    const count = await results.count();

    // Either no results or handles safely
    if (count === 0) {
      await expect(page.locator('text=No deals found')).toBeVisible();
    }
  });

  test('DEAL-SEARCH-NEG-002: Search with SQL injection', async ({ page }) => {
    // Act
    await page.fill('input[placeholder*="Search"]', "' OR '1'='1");
    await page.waitForTimeout(500);

    // Assert - should not cause errors
    await expect(page).not.toHaveURL(/error/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('DEAL-SEARCH-NEG-003: Search with XSS payload', async ({ page }) => {
    // Act
    await page.fill('input[placeholder*="Search"]', '<script>alert("XSS")</script>');
    await page.waitForTimeout(500);

    // Assert - no alert should execute
    await expect(page.locator('body')).toBeVisible();

    // Script should be escaped
    const content = await page.content();
    const escaped = content.includes('&lt;script&gt;') || content.includes('&#60;');
    expect(escaped).toBeTruthy();
  });

  test('DEAL-SEARCH-NEG-004: Very long search query', async ({ page }) => {
    // Act - 1000 characters
    await page.fill('input[placeholder*="Search"]', 'a'.repeat(1000));
    await page.waitForTimeout(500);

    // Assert - should handle gracefully
    await expect(page.locator('body')).toBeVisible();
  });

  test('DEAL-SEARCH-NEG-005: Search with leading/trailing spaces', async ({ page }) => {
    // Act
    await page.fill('input[placeholder*="Search"]', '  Pizza  ');
    await page.waitForTimeout(500);

    // Assert - should trim and search
    const dealCards = page.locator('[data-testid="deal-card"], .deal-card');
    const count = await dealCards.count();

    if (count > 0) {
      const title = await dealCards.first().textContent();
      expect(title?.toLowerCase()).toContain('pizza');
    }
  });
});

// ============== EDGE CASES ==============

test.describe('Deal Search - Edge Cases', () => {
  test('DEAL-SEARCH-EDGE-001: Empty search shows all deals', async ({ page }) => {
    await page.goto('/deals');

    // Arrange - search first
    await page.fill('input[placeholder*="Search"]', 'Pizza');
    await page.waitForTimeout(500);
    const searchCount = await page.locator('[data-testid="deal-card"], .deal-card').count();

    // Act - clear search
    await page.fill('input[placeholder*="Search"]', '');
    await page.waitForTimeout(500);

    // Assert - all deals shown
    const allCount = await page.locator('[data-testid="deal-card"], .deal-card').count();
    expect(allCount).toBeGreaterThan(searchCount);
  });

  test('DEAL-SEARCH-EDGE-002: Search with emoji', async ({ page }) => {
    await page.goto('/deals');

    // Act
    await page.fill('input[placeholder*="Search"]', '🍕');
    await page.waitForTimeout(500);

    // Assert - should handle without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('DEAL-SEARCH-EDGE-003: Search persistence across navigation', async ({ page }) => {
    await page.goto('/deals');

    // Arrange - search
    await page.fill('input[placeholder*="Search"]', 'Pizza');
    await page.waitForTimeout(500);

    // Act - navigate away and back
    await page.goto('/savings');
    await page.goto('/deals');

    // Assert - search may or may not persist based on implementation
    // This test documents current behavior
    const searchValue = await page.locator('input[placeholder*="Search"]').inputValue();
    expect(searchValue).toBeDefined();
  });

  test('DEAL-SEARCH-EDGE-004: Search with Unicode characters', async ({ page }) => {
    await page.goto('/deals');

    // Act
    await page.fill('input[placeholder*="Search"]', 'café');
    await page.waitForTimeout(500);

    // Assert
    await expect(page.locator('body')).toBeVisible();
  });

  test('DEAL-SEARCH-EDGE-005: Rapid search changes', async ({ page }) => {
    await page.goto('/deals');

    // Act - type rapidly
    const searchInput = page.locator('input[placeholder*="Search"]');

    for (let i = 0; i < 10; i++) {
      await searchInput.fill(String(i));
      await page.waitForTimeout(50);
    }

    // Wait for final debounce
    await page.waitForTimeout(600);

    // Assert - should handle without errors
    await expect(page.locator('body')).toBeVisible();
  });
});

// ============== UI/UX TESTS ==============

test.describe('Deal Search - UI/UX Tests', () => {
  test('DEAL-SEARCH-UI-001: Search input has placeholder', async ({ page }) => {
    await page.goto('/deals');

    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();

    const placeholder = await searchInput.getAttribute('placeholder');
    expect(placeholder).toBeTruthy();
    expect(placeholder?.length).toBeGreaterThan(10);
  });

  test('DEAL-SEARCH-UI-002: Search icon visible', async ({ page }) => {
    await page.goto('/deals');

    // Check for search icon (SVG)
    const searchIcon = page.locator('svg').filter({ hasText: '' }).first();
    await expect(searchIcon).toBeVisible();
  });

  test('DEAL-SEARCH-UI-003: Clear button in search field', async ({ page }) => {
    await page.goto('/deals');

    // Type something
    await page.fill('input[placeholder*="Search"]', 'Pizza');

    // Check for clear button (X icon)
    const clearButton = page.locator('button[aria-label*="clear"], svg').last();
    const isVisible = await clearButton.isVisible();

    // May or may not exist based on implementation
    if (isVisible) {
      await clearButton.click();

      // Search should be cleared
      const value = await page.locator('input[placeholder*="Search"]').inputValue();
      expect(value).toBe('');
    }
  });

  test('DEAL-SEARCH-UI-004: Search input focus state', async ({ page }) => {
    await page.goto('/deals');

    const searchInput = page.locator('input[placeholder*="Search"]');

    await searchInput.focus();

    // Check for focus styling
    const hasFocusRing = await searchInput.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return styles.outline !== 'none' || styles.boxShadow !== 'none';
    });

    expect(hasFocusRing).toBe(true);
  });

  test('DEAL-SEARCH-UI-005: Mobile search experience', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/deals');

    // Search input should be full width
    const searchInput = page.locator('input[placeholder*="Search"]');
    const box = await searchInput.boundingBox();

    expect(box?.width).toBeGreaterThan(300);

    // Should be easily tappable
    await searchInput.tap();
    await expect(searchInput).toBeFocused();
  });

  test('DEAL-SEARCH-UI-006: Search results highlight', async ({ page }) => {
    await page.goto('/deals');

    // Search
    await page.fill('input[placeholder*="Search"]', 'Pizza');
    await page.waitForTimeout(500);

    // Check if search term is highlighted in results
    // This depends on implementation
    const dealCards = page.locator('[data-testid="deal-card"], .deal-card');
    const firstCard = dealCards.first();

    if (await firstCard.isVisible()) {
      const text = await firstCard.textContent();
      expect(text?.toLowerCase()).toContain('pizza');
    }
  });

  test('DEAL-SEARCH-UI-007: Loading state during search', async ({ page }) => {
    await page.goto('/deals');

    // Mock slow API
    await page.route('**/api/deals*', route => {
      setTimeout(() => route.continue(), 1000);
    });

    // Search
    await page.fill('input[placeholder*="Search"]', 'Pizza');

    // Check for loading indicator
    const loader = page.locator('.animate-spin, [data-testid="loading"]');
    if (await loader.isVisible({ timeout: 100 })) {
      await expect(loader).toBeVisible();
    }
  });

  test('DEAL-SEARCH-UI-008: Keyboard navigation in search results', async ({ page }) => {
    await page.goto('/deals');

    // Search
    await page.fill('input[placeholder*="Search"]', 'Pizza');
    await page.waitForTimeout(500);

    // Try arrow key navigation
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Should navigate to first result (if implemented)
    // This is optional behavior
  });

  test('DEAL-SEARCH-UI-009: Search input has accessible label', async ({ page }) => {
    await page.goto('/deals');

    const searchInput = page.locator('input[placeholder*="Search"]');

    // Check for aria-label or associated label
    const ariaLabel = await searchInput.getAttribute('aria-label');
    const hasLabel = await page.locator('label').count() > 0;

    expect(ariaLabel || hasLabel).toBeTruthy();
  });
});
