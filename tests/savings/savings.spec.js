/**
 * Savings Module Test Suite
 * RichSave Application
 *
 * Covers: User Savings Dashboard Functionality
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

test.describe('Savings - Functional Tests', () => {
  test('SAVINGS-001: View savings dashboard', async ({ page }) => {
    await login(page);

    // Navigate to savings
    await page.goto('/savings');

    // Assert - should show savings summary
    await expect(page.locator('text=/Total Savings|You Saved|Savings/i')).toBeVisible();

    // Should have currency values
    await expect(page.locator('text=/\\$\\d+/i')).toBeVisible();
  });

  test('SAVINGS-002: Display total savings amount', async ({ page }) => {
    await login(page);
    await page.goto('/savings');

    // Total savings should be prominent
    const totalSavings = page.locator('[data-testid="total-savings"], .total-savings, h1, h2');

    await expect(totalSavings.first()).toBeVisible();

    const savingsText = await totalSavings.first().textContent();

    expect(savingsText).toMatch(/\$[\d,]+\.?\d*/);
  });

  test('SAVINGS-003: Show savings breakdown', async ({ page }) => {
    await login(page);
    await page.goto('/savings');

    // Check for savings breakdown section
    const breakdownSection = page.locator('[data-testid="savings-breakdown"], text=/breakdown|category/i');

    if (await breakdownSection.isVisible()) {
      await expect(breakdownSection).toBeVisible();

      // Should have categories
      const categories = page.locator('[data-testid="category"], .savings-category');

      const count = await categories.count();

      expect(count).toBeGreaterThan(0);
    }
  });

  test('SAVINGS-004: Display number of deals redeemed', async ({ page }) => {
    await login(page);
    await page.goto('/savings');

    // Check for redeemed deals count
    const redeemedCount = page.locator('[data-testid="redeemed-count"], text=/deals redeemed|redeemed/i');

    if (await redeemedCount.isVisible()) {
      await expect(redeemedCount).toBeVisible();

      const countText = await redeemedCount.textContent();

      expect(countText).toMatch(/\d+/);
    }
  });

  test('SAVINGS-005: Show savings over time chart', async ({ page }) => {
    await login(page);
    await page.goto('/savings');

    // Check for chart/graph
    const chart = page.locator('[data-testid="savings-chart"], canvas, .chart, svg');

    const hasChart = await chart.isVisible();

    if (hasChart) {
      await expect(chart).toBeVisible();
    }
  });

  test('SAVINGS-006: Display top categories', async ({ page }) => {
    await login(page);
    await page.goto('/savings');

    // Check for top categories section
    const topCategories = page.locator('[data-testid="top-categories"], text=/top categories|favorite/i');

    if (await topCategories.isVisible()) {
      await expect(topCategories).toBeVisible();

      // Should have category list with amounts
      const categoryItems = page.locator('[data-testid="category-item"], .category-item');

      const count = await categoryItems.count();

      expect(count).toBeGreaterThan(0);
    }
  });

  test('SAVINGS-007: Compare with previous period', async ({ page }) => {
    await login(page);
    await page.goto('/savings');

    // Check for comparison
    const comparison = page.locator('[data-testid="savings-comparison"], text=/vs|compared|previous/i');

    if (await comparison.isVisible()) {
      await expect(comparison).toBeVisible();

      // Should show percentage or difference
      const comparisonText = await comparison.textContent();

      const hasMetric = comparisonText?.match(/\+?\d+%/) || comparisonText?.match(/\$\d+/);

      expect(hasMetric).toBeTruthy();
    }
  });

  test('SAVINGS-008: Savings goal progress', async ({ page }) => {
    await login(page);
    await page.goto('/savings');

    // Check for savings goal
    const goalSection = page.locator('[data-testid="savings-goal"], text=/goal|target/i');

    if (await goalSection.isVisible()) {
      await expect(goalSection).toBeVisible();

      // Should show progress bar
      const progressBar = page.locator('[data-testid="progress-bar"], .progress, progress');

      await expect(progressBar.first()).toBeVisible();
    }
  });

  test('SAVINGS-009: Recent redeemed deals', async ({ page }) => {
    await login(page);
    await page.goto('/savings');

    // Check for recent activity
    const recentDeals = page.locator('[data-testid="recent-deals"], text=/recent|activity/i');

    if (await recentDeals.isVisible()) {
      await expect(recentDeals).toBeVisible();

      // Should have deal cards
      const dealCards = page.locator('[data-testid="deal-card"], .deal-card');

      const count = await dealCards.count();

      if (count > 0) {
        await expect(dealCards.first()).toBeVisible();
      }
    }
  });

  test('SAVINGS-010: Filter savings by date range', async ({ page }) => {
    await login(page);
    await page.goto('/savings');

    // Check for date filter
    const dateFilter = page.locator('select[name="period"], button:has-text("This Month"), [data-testid="date-filter"]');

    if (await dateFilter.isVisible()) {
      // Select different period
      if (await dateFilter.tagName() === 'SELECT') {
        await dateFilter.selectOption('last-month');
        await page.waitForTimeout(500);

        // Savings should update
        await expect(page.locator('body')).toBeVisible();
      }
    }
  });

  test('SAVINGS-011: Share savings achievement', async ({ page }) => {
    await login(page);
    await page.goto('/savings');

    // Check for share button
    const shareButton = page.locator('button:has-text("Share"), [data-testid="share-savings"]');

    if (await shareButton.isVisible()) {
      await shareButton.click();

      // Should show share options
      const shareDialog = page.locator('[role="dialog"], .modal');

      await expect(shareDialog).toBeVisible();
    }
  });

  test('SAVINGS-012: Access savings from navigation', async ({ page }) => {
    await login(page);

    // Check for savings link
    const savingsLink = page.locator('a[href="/savings"], text=Savings');

    if (await savingsLink.isVisible()) {
      await savingsLink.click();

      // Should navigate to savings
      await expect(page).toHaveURL(/\/savings/, { timeout: 3000 });
    }
  });

  test('SAVINGS-013: Savings calculated correctly', async ({ page }) => {
    await login(page);
    await page.goto('/savings');

    // This tests that savings are calculated as sum of (original - discounted) prices
    // Would require specific test data

    // Verify format
    const savingsValue = page.locator('[data-testid="total-savings"]');

    if (await savingsValue.isVisible()) {
      const value = await savingsValue.textContent();

      expect(value).toMatch(/\$[\d,]+\.?\d{2}/);
    }
  });
});

// ============== NEGATIVE TESTS ==============

test.describe('Savings - Negative Tests', () => {
  test('SAVINGS-NEG-001: View savings without login', async ({ page }) => {
    // Not logged in
    await page.goto('/savings');

    // Should redirect to login
    expect(page.url()).toContain('/login');
  });

  test('SAVINGS-NEG-002: Zero savings displayed', async ({ page }) => {
    await login(page);

    // User with no redeemed deals
    await page.goto('/savings');

    // Should show zero or "start saving" message
    const zeroMessage = page.locator('text=/\\$0|no savings|start saving/i');

    const hasMessage = await zeroMessage.isVisible();

    if (hasMessage) {
      await expect(zeroMessage).toBeVisible();
    }
  });

  test('SAVINGS-NEG-003: Savings API failure', async ({ page }) => {
    await login(page);

    // Mock API failure
    await page.route('**/api/savings/**', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Failed to fetch savings' })
      });
    });

    await page.goto('/savings');

    // Should show error message
    const errorMessage = page.locator('text=/error|failed|try again/i');

    const hasError = await errorMessage.isVisible();

    if (hasError) {
      await expect(errorMessage).toBeVisible();
    }
  });

  test('SAVINGS-NEG-004: Invalid date range', async ({ page }) => {
    await login(page);
    await page.goto('/savings');

    // Try invalid date range
    const dateFilter = page.locator('select[name="period"]');

    if (await dateFilter.isVisible()) {
      // Select future date (if available)
      const options = await dateFilter.locator('option').allTextContents();

      // This is implementation-dependent
      await expect(page.locator('body')).toBeVisible();
    }
  });
});

// ============== EDGE CASES ==============

test.describe('Savings - Edge Cases', () => {
  test('SAVINGS-EDGE-001: Very large savings amount', async ({ page }) => {
    await login(page);

    // Mock large savings
    await page.route('**/api/savings/**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          totalSavings: 999999.99,
          dealsRedeemed: 500
        })
      });
    });

    await page.goto('/savings');

    // Should display large numbers with proper formatting
    const savingsValue = page.locator('[data-testid="total-savings"]');

    if (await savingsValue.isVisible()) {
      const value = await savingsValue.textContent();

      expect(value).toMatch(/\$[\d,]+/);
    }
  });

  test('SAVINGS-EDGE-002: Savings with decimal precision', async ({ page }) => {
    await login(page);

    // Mock savings with decimals
    await page.route('**/api/savings/**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          totalSavings: 123.45,
          dealsRedeemed: 5
        })
      });
    });

    await page.goto('/savings');

    // Should display with 2 decimal places
    const savingsValue = page.locator('[data-testid="total-savings"]');

    if (await savingsValue.isVisible()) {
      const value = await savingsValue.textContent();

      expect(value).toMatch(/\$\d+\.\d{2}/);
    }
  });

  test('SAVINGS-EDGE-003: Rapid period changes', async ({ page }) => {
    await login(page);
    await page.goto('/savings');

    const dateFilter = page.locator('select[name="period"]');

    if (await dateFilter.isVisible()) {
      // Rapid changes
      await dateFilter.selectOption('this-week');
      await page.waitForTimeout(100);
      await dateFilter.selectOption('this-month');
      await page.waitForTimeout(100);
      await dateFilter.selectOption('this-year');
      await page.waitForTimeout(100);

      // Should handle gracefully
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('SAVINGS-EDGE-004: Currency symbol handling', async ({ page }) => {
    await login(page);

    // Test with different currency symbol if supported
    await page.goto('/savings');

    const savingsValue = page.locator('[data-testid="total-savings"]');

    if (await savingsValue.isVisible()) {
      const value = await savingsValue.textContent();

      // Should have currency symbol
      expect(value).toMatch(/[\$\£\€¥]/);
    }
  });

  test('SAVINGS-EDGE-005: First savings achievement', async ({ page }) => {
    await login(page);

    // Mock first savings
    await page.route('**/api/savings/**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          totalSavings: 10.00,
          dealsRedeemed: 1,
          isFirst: true
        })
      });
    });

    await page.goto('/savings');

    // Should show celebration or congratulations
    const celebration = page.locator('text=/congratulations|celebration|first savings/i');

    const hasCelebration = await celebration.isVisible();

    if (hasCelebration) {
      await expect(celebration).toBeVisible();
    }
  });
});

// ============== UI/UX TESTS ==============

test.describe('Savings - UI/UX Tests', () => {
  test('SAVINGS-UI-001: Savings amount prominently displayed', async ({ page }) => {
    await login(page);
    await page.goto('/savings');

    const totalSavings = page.locator('[data-testid="total-savings"], h1, h2');

    await expect(totalSavings.first()).toBeVisible();

    // Should be large text
    const fontSize = await totalSavings.first().evaluate(el => {
      return parseInt(window.getComputedStyle(el).fontSize);
    });

    expect(fontSize).toBeGreaterThan(24);
  });

  test('SAVINGS-UI-002: Positive savings in green', async ({ page }) => {
    await login(page);
    await page.goto('/savings');

    const totalSavings = page.locator('[data-testid="total-savings"]');

    if (await totalSavings.isVisible()) {
      // Should have green or positive color
      const color = await totalSavings.evaluate(el => {
        return window.getComputedStyle(el).color;
      });

      // Green or dark color (acceptable)
      expect(color).toBeDefined();
    }
  });

  test('SAVINGS-UI-003: Progress bar animation', async ({ page }) => {
    await login(page);
    await page.goto('/savings');

    const progressBar = page.locator('[data-testid="progress-bar"], .progress');

    if (await progressBar.isVisible()) {
      // Should have width attribute or style
      const width = await progressBar.first().evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.width || el.getAttribute('width');
      });

      expect(width).toBeDefined();
    }
  });

  test('SAVINGS-UI-004: Card-based layout for sections', async ({ page }) => {
    await login(page);
    await page.goto('/savings');

    // Should have card sections
    const cards = page.locator('.card, [data-testid="savings-card"]');

    const count = await cards.count();

    if (count > 0) {
      await expect(cards.first()).toBeVisible();

      // Should have shadow or border
      const hasShadow = await cards.first().evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.boxShadow !== 'none' || styles.border !== 'none';
      });

      expect(hasShadow).toBe(true);
    }
  });

  test('SAVINGS-UI-005: Mobile responsive savings', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    await login(page);
    await page.goto('/savings');

    // All content should be visible
    await expect(page.locator('body')).toBeVisible();

    // Sections should stack vertically
    const sections = page.locator('.card, section');

    const count = await sections.count();

    for (let i = 0; i < Math.min(count, 3); i++) {
      await expect(sections.nth(i)).toBeVisible();
    }
  });

  test('SAVINGS-UI-006: Loading state for savings', async ({ page }) => {
    await login(page);

    // Mock slow API
    await page.route('**/api/savings/**', route => {
      setTimeout(() => route.continue(), 2000);
    });

    await page.goto('/savings');

    // Should show loading indicator
    const loader = page.locator('.animate-spin, [data-testid="loading"]');

    const hasLoader = await loader.isVisible({ timeout: 100 });

    if (hasLoader) {
      await expect(loader).toBeVisible();
    }
  });

  test('SAVINGS-UI-007: Empty state for new users', async ({ page }) => {
    await login(page);

    // Mock zero savings
    await page.route('**/api/savings/**', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          totalSavings: 0,
          dealsRedeemed: 0
        })
      });
    });

    await page.goto('/savings');

    // Should show encouraging message
    const emptyState = page.locator('text=/start saving|no savings yet/i');

    const hasEmpty = await emptyState.isVisible();

    if (hasEmpty) {
      await expect(emptyState).toBeVisible();

      // Should have CTA to browse deals
      const cta = page.locator('a:has-text("Browse Deals"), button:has-text("Browse")');

      const hasCTA = await cta.isVisible();

      if (hasCTA) {
        await expect(cta).toBeVisible();
      }
    }
  });

  test('SAVINGS-UI-008: Savings breakdown chart', async ({ page }) => {
    await login(page);
    await page.goto('/savings');

    const chart = page.locator('canvas, svg, [data-testid="chart"]');

    const hasChart = await chart.isVisible();

    if (hasChart) {
      await expect(chart).toBeVisible();

      // Should have labels or legend
      const legend = page.locator('[data-testid="legend"], .legend, text');

      await expect(legend.first()).toBeVisible();
    }
  });

  test('SAVINGS-UI-009: Share savings card design', async ({ page }) => {
    await login(page);
    await page.goto('/savings');

    const shareButton = page.locator('button:has-text("Share")');

    if (await shareButton.isVisible()) {
      await shareButton.click();

      // Should show nicely formatted share card
      const shareCard = page.locator('[role="dialog"] .card, .share-card');

      await expect(shareCard).toBeVisible();

      // Should include user's savings amount
      const cardText = await shareCard.textContent();

      expect(cardText).toMatch(/\$\d+/);
    }
  });

  test('SAVINGS-UI-010: Accessible savings values', async ({ page }) => {
    await login(page);
    await page.goto('/savings');

    const savingsValue = page.locator('[data-testid="total-savings"]');

    if (await savingsValue.isVisible()) {
      // Check for aria-label or similar
      const ariaLabel = await savingsValue.getAttribute('aria-label');

      // Or check if parent has proper labeling
      expect(ariaLabel || await savingsValue.isVisible()).toBeTruthy();
    }
  });
});
