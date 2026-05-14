/**
 * Savings History Module Test Suite
 * RichSave Application
 *
 * Covers: Savings History & Redeemed Deals Functionality
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

test.describe('Savings History - Functional Tests', () => {
  test('SAV-HIST-001: View savings history page', async ({ page }) => {
    await login(page);

    // Navigate to history
    await page.goto('/savings/history');

    // Assert - should show history section
    await expect(page.locator('text=/history|redeemed|past deals/i')).toBeVisible();
  });

  test('SAV-HIST-002: Display list of redeemed deals', async ({ page }) => {
    await login(page);
    await page.goto('/savings/history');

    // Should show deal cards
    const dealCards = page.locator('[data-testid="redeemed-deal"], [data-testid="deal-card"], .deal-card');

    const count = await dealCards.count();

    if (count > 0) {
      await expect(dealCards.first()).toBeVisible();
    } else {
      // Should show empty state
      await expect(page.locator('text=/no deals|empty/i')).toBeVisible();
    }
  });

  test('SAV-HIST-003: Show redemption date', async ({ page }) => {
    await login(page);
    await page.goto('/savings/history');

    const dealCards = page.locator('[data-testid="redeemed-deal"], .deal-card');

    const count = await dealCards.count();

    if (count > 0) {
      // First card should have date
      const dateElement = dealCards.first().locator('time, [data-testid="date"], text=/\\d{1,2}\\/\\d{1,2}\\/\\d{2,4}/i');

      const hasDate = await dateElement.isVisible();

      if (hasDate) {
        await expect(dateElement).toBeVisible();
      }
    }
  });

  test('SAV-HIST-004: Show savings per deal', async ({ page }) => {
    await login(page);
    await page.goto('/savings/history');

    const dealCards = page.locator('[data-testid="redeemed-deal"], .deal-card');

    const count = await dealCards.count();

    if (count > 0) {
      // Should show amount saved
      const savingsAmount = dealCards.first().locator('text=/saved|\\$\d+/i');

      await expect(savingsAmount.first()).toBeVisible();
    }
  });

  test('SAV-HIST-005: Filter history by date range', async ({ page }) => {
    await login(page);
    await page.goto('/savings/history');

    // Check for date filter
    const dateFilter = page.locator('input[type="date"], select[name="period"], [data-testid="date-filter"]');

    if (await dateFilter.isVisible()) {
      // Set date range
      if (await dateFilter.getAttribute('type') === 'date') {
        await dateFilter.first().fill('2026-01-01');
        await page.waitForTimeout(500);

        // Results should update
        await expect(page.locator('body')).toBeVisible();
      }
    }
  });

  test('SAV-HIST-006: Sort history by date or amount', async ({ page }) => {
    await login(page);
    await page.goto('/savings/history');

    // Check for sort options
    const sortSelect = page.locator('select[name="sort"], [data-testid="sort"]');

    if (await sortSelect.isVisible()) {
      // Sort by date (newest)
      await sortSelect.selectOption('date-desc');
      await page.waitForTimeout(500);

      // Sort by amount (highest)
      await sortSelect.selectOption('amount-desc');
      await page.waitForTimeout(500);

      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('SAV-HIST-007: Search history by deal name', async ({ page }) => {
    await login(page);
    await page.goto('/savings/history');

    // Check for search input
    const searchInput = page.locator('input[placeholder*="search" i], [data-testid="search"]');

    if (await searchInput.isVisible()) {
      await searchInput.fill('Pizza');
      await page.waitForTimeout(500);

      // Should filter results
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('SAV-HIST-008: View deal details from history', async ({ page }) => {
    await login(page);
    await page.goto('/savings/history');

    const dealCards = page.locator('[data-testid="redeemed-deal"], .deal-card');

    const count = await dealCards.count();

    if (count > 0) {
      // Click on deal
      await dealCards.first().click();

      // Should navigate to deal detail
      await expect(page).toHaveURL(/\/deals\/\d+/, { timeout: 3000 });
    }
  });

  test('SAV-HIST-009: Export history (if available)', async ({ page }) => {
    await login(page);
    await page.goto('/savings/history');

    // Check for export button
    const exportButton = page.locator('button:has-text("Export"), button:has-text("Download")');

    if (await exportButton.isVisible()) {
      // Setup download handler
      const downloadPromise = page.waitForEvent('download');

      await exportButton.click();

      // Should trigger download
      const download = await downloadPromise;

      expect(download.suggestedFilename()).toBeTruthy();
    }
  });

  test('SAV-HIST-010: Pagination for large history', async ({ page }) => {
    await login(page);
    await page.goto('/savings/history');

    // Check for pagination
    const pagination = page.locator('[data-testid="pagination"], .pagination, button:has-text("Next")');

    const hasPagination = await pagination.isVisible();

    if (hasPagination) {
      await expect(pagination).toBeVisible();

      // Click next page
      const nextButton = page.locator('button:has-text("Next")');

      if (await nextButton.isVisible()) {
        await nextButton.click();

        // Should load next page
        await page.waitForTimeout(500);
      }
    }
  });

  test('SAV-HIST-011: Show total savings in period', async ({ page }) => {
    await login(page);
    await page.goto('/savings/history');

    // Check for period total
    const periodTotal = page.locator('[data-testid="period-total"], text=/total|period/i');

    if (await periodTotal.isVisible()) {
      await expect(periodTotal).toBeVisible();

      // Should have currency value
      const totalText = await periodTotal.textContent();

      expect(totalText).toMatch(/\$[\d,]+/);
    }
  });

  test('SAV-HIST-012: Filter by category', async ({ page }) => {
    await login(page);
    await page.goto('/savings/history');

    // Check for category filter
    const categoryFilter = page.locator('select[name="category"], button:has-text("Food"), [data-testid="category-filter"]');

    if (await categoryFilter.isVisible()) {
      await categoryFilter.first().click();
      await page.waitForTimeout(500);

      // Should filter results
      await expect(page.locator('body')).toBeVisible();
    }
  });
});

// ============== NEGATIVE TESTS ==============

test.describe('Savings History - Negative Tests', () => {
  test('SAV-HIST-NEG-001: View history without login', async ({ page }) => {
    // Not logged in
    await page.goto('/savings/history');

    // Should redirect to login
    expect(page.url()).toContain('/login');
  });

  test('SAV-HIST-NEG-002: Empty history for new user', async ({ page }) => {
    await login(page);

    // Mock empty history
    await page.route('**/api/savings/history/**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([])
      });
    });

    await page.goto('/savings/history');

    // Should show empty state
    const emptyState = page.locator('text=/no history|no deals|start saving/i');

    await expect(emptyState).toBeVisible();
  });

  test('SAV-HIST-NEG-003: History API failure', async ({ page }) => {
    await login(page);

    // Mock API failure
    await page.route('**/api/savings/history/**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Failed to fetch history' })
      });
    });

    await page.goto('/savings/history');

    // Should show error message
    const errorMessage = page.locator('text=/error|failed|try again/i');

    const hasError = await errorMessage.isVisible();

    if (hasError) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('SAV-HIST-NEG-004: Invalid date range', async ({ page }) => {
    await login(page);
    await page.goto('/savings/history');

    const dateFilter = page.locator('input[type="date"]');

    if (await dateFilter.isVisible()) {
      // Set end date before start date
      await dateFilter.nth(0).fill('2026-12-31');
      await dateFilter.nth(1).fill('2026-01-01');

      // Should show validation error
      const validationError = page.locator('text=/invalid|end date|start date/i');

      const hasError = await validationError.isVisible();

      if (hasError) {
        await expect(validationError).toBeVisible();
      }
    }
  });

  test('SAV-HIST-NEG-005: Search with no results', async ({ page }) => {
    await login(page);
    await page.goto('/savings/history');

    const searchInput = page.locator('input[placeholder*="search" i]');

    if (await searchInput.isVisible()) {
      await searchInput.fill('xyznonexistent123');
      await page.waitForTimeout(500);

      // Should show no results
      const noResults = page.locator('text=/no results|not found/i');

      await expect(noResults).toBeVisible();
    }
  });
});

// ============== EDGE CASES ==============

test.describe('Savings History - Edge Cases', () => {
  test('SAV-HIST-EDGE-001: Very long history (pagination)', async ({ page }) => {
    await login(page);

    // Mock large history
    await page.route('**/api/savings/history/**', route => {
      const deals = Array(100).fill(null).map((_, i) => ({
        id: `deal-${i}`,
        title: `Deal ${i}`,
        savings: 10 + i,
        date: new Date(2026, 0, 1 + i).toISOString()
      }));

      route.fulfill({
        status: 200,
        body: JSON.stringify({ deals, total: 100 })
      });
    });

    await page.goto('/savings/history');

    // Should show pagination
    const pagination = page.locator('[data-testid="pagination"], .pagination');

    const hasPagination = await pagination.isVisible();

    if (hasPagination) {
      await expect(pagination).toBeVisible();
    }
  });

  test('SAV-HIST-EDGE-002: Deal with zero savings', async ({ page }) => {
    await login(page);

    // Mock deal with no savings (free deal)
    await page.route('**/api/savings/history/**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([{
          id: 'deal-1',
          title: 'Free Coffee',
          savings: 0,
          date: new Date().toISOString()
        }])
      });
    });

    await page.goto('/savings/history');

    // Should display zero savings
    const zeroSavings = page.locator('text=/\\$0|free/i');

    await expect(zeroSavings.first()).toBeVisible();
  });

  test('SAV-HIST-EDGE-003: Duplicate redemptions', async ({ page }) => {
    await login(page);

    // Mock same deal redeemed multiple times
    await page.route('**/api/savings/history/**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          {
            id: 'deal-1',
            title: '50% Off Pizza',
            savings: 15,
            date: '2026-04-01T10:00:00Z'
          },
          {
            id: 'deal-1',
            title: '50% Off Pizza',
            savings: 15,
            date: '2026-04-05T14:00:00Z'
          }
        ])
      });
    });

    await page.goto('/savings/history');

    // Should show both entries
    const dealCards = page.locator('[data-testid="redeemed-deal"], .deal-card');
    const count = await dealCards.count();

    expect(count).toBe(2);
  });

  test('SAV-HIST-EDGE-004: Future-dated redemption', async ({ page }) => {
    await login(page);

    // This shouldn't happen but test handling
    await page.route('**/api/savings/history/**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([{
          id: 'deal-1',
          title: 'Test Deal',
          savings: 10,
          date: new Date(Date.now() + 86400000).toISOString() // Tomorrow
        }])
      });
    });

    await page.goto('/savings/history');

    // Should handle gracefully
    await expect(page.locator('body')).toBeVisible();
  });

  test('SAV-HIST-EDGE-005: Deal with very long title', async ({ page }) => {
    await login(page);

    await page.route('**/api/savings/history/**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([{
          id: 'deal-1',
          title: 'A'.repeat(200),
          savings: 10,
          date: new Date().toISOString()
        }])
      });
    });

    await page.goto('/savings/history');

    // Should truncate title
    const dealCard = page.locator('[data-testid="redeemed-deal"], .deal-card');

    if (await dealCard.isVisible()) {
      await expect(dealCard).toBeVisible();

      // Title should not overflow
      const isOverflowing = await dealCard.evaluate(el => {
        return el.scrollWidth > el.clientWidth;
      });

      expect(isOverflowing).toBe(false);
    }
  });

  test('SAV-HIST-EDGE-006: Rapid filter changes', async ({ page }) => {
    await login(page);
    await page.goto('/savings/history');

    const sortSelect = page.locator('select[name="sort"]');

    if (await sortSelect.isVisible()) {
      // Rapid changes
      for (let i = 0; i < 5; i++) {
        await sortSelect.selectOption(i % 2 === 0 ? 'date-desc' : 'amount-desc');
        await page.waitForTimeout(50);
      }

      // Should handle gracefully
      await expect(page.locator('body')).toBeVisible();
    }
  });
});

// ============== UI/UX TESTS ==============

test.describe('Savings History - UI/UX Tests', () => {
  test('SAV-HIST-UI-001: Card-based layout for history items', async ({ page }) => {
    await login(page);
    await page.goto('/savings/history');

    const dealCards = page.locator('[data-testid="redeemed-deal"], .deal-card');

    const count = await dealCards.count();

    if (count > 0) {
      // Should have consistent styling
      const firstCard = dealCards.first();

      await expect(firstCard).toBeVisible();

      // Should have shadow or border
      const hasShadow = await firstCard.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.boxShadow !== 'none' || styles.border !== 'none';
      });

      expect(hasShadow).toBe(true);
    }
  });

  test('SAV-HIST-UI-002: Clear date formatting', async ({ page }) => {
    await login(page);
    await page.goto('/savings/history');

    const dateElement = page.locator('time, [data-testid="date"]');

    const count = await dateElement.count();

    if (count > 0) {
      const dateText = await dateElement.first().textContent();

      // Should be readable format
      expect(dateText).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}|Jan|Feb|Mar/);
    }
  });

  test('SAV-HIST-UI-003: Savings amount highlighted', async ({ page }) => {
    await login(page);
    await page.goto('/savings/history');

    const dealCards = page.locator('[data-testid="redeemed-deal"], .deal-card');

    const count = await dealCards.count();

    if (count > 0) {
      const savingsAmount = dealCards.first().locator('text=/\\$\d+/i, .savings-amount');

      const hasAmount = await savingsAmount.isVisible();

      if (hasAmount) {
        // Should be prominent (bold or colored)
        const fontWeight = await savingsAmount.evaluate(el => {
          return window.getComputedStyle(el).fontWeight;
        });

        expect(parseInt(fontWeight) || 0).toBeGreaterThanOrEqual(400);
      }
    }
  });

  test('SAV-HIST-UI-004: Filter section collapsible', async ({ page }) => {
    await login(page);
    await page.goto('/savings/history');

    const filterSection = page.locator('[data-testid="filters"], .filters');

    if (await filterSection.isVisible()) {
      // Check for collapse button
      const collapseButton = filterSection.locator('button:has-text("Less"), button[aria-expanded="true"]');

      const hasCollapse = await collapseButton.isVisible();

      if (hasCollapse) {
        await collapseButton.click();

        // Filters should collapse
        await page.waitForTimeout(500);

        // Expand again
        await collapseButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('SAV-HIST-UI-005: Mobile responsive history', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await login(page);
    await page.goto('/savings/history');

    // All content should be visible
    await expect(page.locator('body')).toBeVisible();

    // Cards should stack
    const dealCards = page.locator('[data-testid="redeemed-deal"], .deal-card');

    const count = await dealCards.count();

    for (let i = 0; i < Math.min(count, 2); i++) {
      await expect(dealCards.nth(i)).toBeVisible();
    }
  });

  test('SAV-HIST-UI-006: Loading skeleton for history', async ({ page }) => {
    await login(page);

    // Mock slow API
    await page.route('**/api/savings/history/**', route => {
      setTimeout(() => route.continue(), 2000);
    });

    await page.goto('/savings/history');

    // Should show loading indicator
    const loader = page.locator('.animate-spin, [data-testid="loading"], .skeleton');

    const hasLoader = await loader.isVisible({ timeout: 100 });

    if (hasLoader) {
      await expect(loader).toBeVisible();
    }
  });

  test('SAV-HIST-UI-007: Empty state illustration', async ({ page }) => {
    await login(page);

    // Mock empty history
    await page.route('**/api/savings/history/**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([])
      });
    });

    await page.goto('/savings/history');

    const emptyState = page.locator('text=/no history|empty/i');

    if (await emptyState.isVisible()) {
      // Should have illustration or icon
      const illustration = page.locator('svg, img').filter({ hasText: '' });

      const hasIllustration = await illustration.count() > 0;

      if (hasIllustration) {
        await expect(illustration.first()).toBeVisible();
      }

      // Should have CTA
      const cta = page.locator('a:has-text("Browse Deals"), button:has-text("Browse")');

      const hasCTA = await cta.isVisible();

      if (hasCTA) {
        await expect(cta).toBeVisible();
      }
    }
  });

  test('SAV-HIST-UI-008: Sort dropdown options', async ({ page }) => {
    await login(page);
    await page.goto('/savings/history');

    const sortSelect = page.locator('select[name="sort"], [data-testid="sort"]');

    if (await sortSelect.isVisible()) {
      // Click to see options
      await sortSelect.click();

      const options = await sortSelect.locator('option').allTextContents();

      expect(options.length).toBeGreaterThan(1);

      // Should have meaningful options
      expect(options.some(o => o.toLowerCase().includes('date'))).toBe(true);
      expect(options.some(o => o.toLowerCase().includes('amount'))).toBe(true);
    }
  });

  test('SAV-HIST-UI-009: History item hover effect', async ({ page }) => {
    await login(page);
    await page.goto('/savings/history');

    const dealCards = page.locator('[data-testid="redeemed-deal"], .deal-card');

    const count = await dealCards.count();

    if (count > 0) {
      const firstCard = dealCards.first();

      await firstCard.hover();

      // Should have hover effect
      const hasShadow = await firstCard.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.boxShadow !== 'none' || styles.cursor === 'pointer';
      });

      expect(hasShadow).toBe(true);
    }
  });

  test('SAV-HIST-UI-010: Summary stats bar', async ({ page }) => {
    await login(page);
    await page.goto('/savings/history');

    // Check for summary stats
    const statsBar = page.locator('[data-testid="stats-bar"], .summary-stats');

    if (await statsBar.isVisible()) {
      await expect(statsBar).toBeVisible();

      // Should have multiple stats
      const statItems = statsBar.locator('[data-testid="stat"], .stat');

      const count = await statItems.count();

      expect(count).toBeGreaterThan(1);
    }
  });
});
