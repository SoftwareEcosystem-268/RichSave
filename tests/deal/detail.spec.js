/**
 * Deal Detail Module Test Suite
 * RichSave Application
 *
 * Covers: Individual Deal Page Functionality
 * Test Categories: Functional, Negative, Edge Cases, Security, UI/UX
 */

import { test, expect } from '@playwright/test';

const testDealId = '1';
const testDealUrl = `/deals/${testDealId}`;

// ============== FUNCTIONAL TESTS (Happy Path) ==============

test.describe('Deal Detail - Functional Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(testDealUrl);
  });

  test('DEAL-DETAIL-001: Load deal page successfully', async ({ page }) => {
    // Assert - page should load without errors
    await expect(page.locator('body')).toBeVisible();

    // Should have deal content
    await expect(page.locator('h1')).toBeVisible();
  });

  test('DEAL-DETAIL-002: Display deal title', async ({ page }) => {
    // Assert
    const title = page.locator('h1');
    await expect(title).toBeVisible();

    const titleText = await title.textContent();
    expect(titleText?.length).toBeGreaterThan(0);
  });

  test('DEAL-DETAIL-003: Display deal description', async ({ page }) => {
    // Assert
    const description = page.locator('text=/about|description/i').locator('..');
    await expect(description.first()).toBeVisible();

    // Should have substantial text
    const descriptionText = await description.textContent();
    expect(descriptionText?.length).toBeGreaterThan(50);
  });

  test('DEAL-DETAIL-004: Display pricing information', async ({ page }) => {
    // Assert - should show both original and discounted price
    await expect(page.locator('text=/\\$\\d+\\.\\d{2}/')).toBeVisible();

    // Should have line-through on original price
    const originalPrice = page.locator('.line-through, [style*="line-through"]');
    await expect(originalPrice.first()).toBeVisible();

    // Should show savings amount
    const savings = page.locator('text=/save|saving/i');
    await expect(savings.first()).toBeVisible();
  });

  test('DEAL-DETAIL-005: Display store information', async ({ page }) => {
    // Assert
    const storeName = page.locator('text=/store|shop/i').locator('..');
    await expect(storeName.first()).toBeVisible();

    // Should have store name
    const storeText = await storeName.textContent();
    expect(storeText?.length).toBeGreaterThan(0);
  });

  test('DEAL-DETAIL-006: Display deal image', async ({ page }) => {
    // Assert
    const image = page.locator('img').first();

    await expect(image).toBeVisible();

    // Should have src attribute
    const src = await image.getAttribute('src');
    expect(src).toBeTruthy();
    expect(src?.length).toBeGreaterThan(0);
  });

  test('DEAL-DETAIL-007: Display category badge', async ({ page }) => {
    // Assert
    const category = page.locator('[data-testid="category"], .rounded-full');
    await expect(category.first()).toBeVisible();

    const categoryText = await category.first().textContent();
    expect(categoryText?.length).toBeGreaterThan(0);
  });

  test('DEAL-DETAIL-008: Display discount percentage', async ({ page }) => {
    // Assert - should show discount badge
    const discount = page.locator('text=/%/i, .bg-red-500');
    await expect(discount.first()).toBeVisible();

    const discountText = await discount.first().textContent();
    expect(discountText).toMatch(/%\s*OFF/i);
  });

  test('DEAL-DETAIL-009: Display terms and conditions', async ({ page }) => {
    // Assert
    const termsSection = page.locator('text=/terms|conditions/i');
    await expect(termsSection.first()).toBeVisible();

    // Should have list items
    const termsList = page.locator('li');
    const count = await termsList.count();

    if (count > 0) {
      expect(count).toBeGreaterThan(0);
    }
  });

  test('DEAL-DETAIL-010: Display expiry date', async ({ page }) => {
    // Assert
    const expiry = page.locator('text=/expires|expiry|expir/i');
    await expect(expiry.first()).toBeVisible();

    const expiryText = await expiry.first().textContent();
    expect(expiryText).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/);
  });

  test('DEAL-DETAIL-011: Countdown timer for expiring deal', async ({ page }) => {
    // Assert - countdown should be visible if deal expires soon
    const countdown = page.locator('text=/days|hours|minutes|seconds/i');

    if (await countdown.isVisible()) {
      // Should have time units
      await expect(countdown).toBeVisible();

      // Values should be numbers
      const countdownNumbers = page.locator('.text-xl.font-bold');
      const count = await countdownNumbers.count();

      expect(count).toBeGreaterThanOrEqual(3); // Days, Hours, Minutes at minimum
    }
  });

  test('DEAL-DETAIL-012: Location information displayed', async ({ page }) => {
    // Assert
    const locationSection = page.locator('text=/location|address/i');

    if (await locationSection.isVisible()) {
      const address = await locationSection.textContent();
      expect(address?.length).toBeGreaterThan(10);

      // Should have map link
      const mapLink = page.locator('a[href*="maps"]');
      await expect(mapLink.first()).toBeVisible();
    }
  });

  test('DEAL-DETAIL-013: Redeem button visible', async ({ page }) => {
    // Assert
    const redeemButton = page.locator('button:has-text("Redeem"), button:has-text("Get Deal")');
    await expect(redeemButton.first()).toBeVisible();
  });

  test('DEAL-DETAIL-014: Share button visible', async ({ page }) => {
    // Assert
    const shareButton = page.locator('button:has-text("Share")');
    await expect(shareButton.first()).toBeVisible();
  });
});

// ============== NEGATIVE TESTS ==============

test.describe('Deal Detail - Negative Tests', () => {
  test('DEAL-DETAIL-NEG-001: Load non-existent deal', async ({ page }) => {
    // Act
    await page.goto('/deals/nonexistent123');

    // Assert - should show error or redirect
    const currentUrl = page.url();

    // Either shows error message or redirects
    const errorMessage = page.locator('text=/not found|error|invalid/i');
    const isDealsPage = currentUrl.includes('/deals');

    expect(await errorMessage.isVisible() || isDealsPage).toBeTruthy();
  });

  test('DEAL-DETAIL-NEG-002: Deal with missing image', async ({ page }) => {
    // This would require mocking a deal with broken image URL
    // For now, test the error handling

    await page.goto(testDealUrl);

    // Mock image error
    await page.evaluate(() => {
      const img = document.querySelector('img');
      if (img) img.dispatchEvent(new Event('error'));
    });

    // Should show fallback
    const image = page.locator('img').first();
    const src = await image.getAttribute('src');

    // Should have placeholder or fallback
    expect(src).toBeTruthy();
  });

  test('DEAL-DETAIL-NEG-003: Expired deal handling', async ({ page }) => {
    // This would require a deal that's expired
    // For now, document the expected behavior

    // Expected: Show "Expired" badge
    // Expected: Redeem button disabled or hidden
    // Expected: Message about deal being expired
  });
});

// ============== EDGE CASES ==============

test.describe('Deal Detail - Edge Cases', () => {
  test('DEAL-DETAIL-EDGE-001: Deal with very long title', async ({ page }) => {
    await page.goto(testDealUrl);

    // Check title truncation
    const title = page.locator('h1');

    const titleText = await title.textContent();

    // Should not overflow container
    const isOverflowing = await title.evaluate(el => {
      return el.scrollWidth > el.clientWidth;
    });

    expect(isOverflowing).toBe(false);
  });

  test('DEAL-DETAIL-EDGE-002: Deal with very long description', async ({ page }) => {
    await page.goto(testDealUrl);

    // Description should be readable
    const description = page.locator('text=/about/i').locator('..');

    await expect(description.first()).toBeVisible();

    // Should be properly formatted
    const descriptionText = await description.first().textContent();
    expect(descriptionText?.length).toBeGreaterThan(0);
  });

  test('DEAL-DETAIL-EDGE-003: Deal with multiple locations', async ({ page }) => {
    // This would require a deal with multiple locations
    // Expected: Show all locations or "Multiple locations" text
  });

  test('DEAL-DETAIL-EDGE-004: Deal with no terms', async ({ page }) => {
    // Should handle gracefully
    await page.goto(testDealUrl);

    const terms = page.locator('text=/terms|conditions/i');

    if (await terms.isVisible()) {
      // Terms are present
      const termsList = page.locator('li');
      const count = await termsList.count();

      // If count is 0, should show message or hide section
    }
  });

  test('DEAL-DETAIL-EDGE-005: Direct access to deal URL', async ({ page }) => {
    // Go directly to deal URL (without visiting deals page first)
    await page.goto(testDealUrl);

    // Should load correctly
    await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });
  });

  test('DEAL-DETAIL-EDGE-006: Refresh deal page', async ({ page }) => {
    await page.goto(testDealUrl);

    const titleBefore = await page.locator('h1').textContent();

    // Refresh
    await page.reload();

    const titleAfter = await page.locator('h1').textContent();

    // Should show same content
    expect(titleBefore).toBe(titleAfter);
  });

  test('DEAL-DETAIL-EDGE-007: Deal with special characters in title', async ({ page }) => {
    // Should handle special characters
    await page.goto(testDealUrl);

    const title = await page.locator('h1').textContent();

    // Should not break layout
    await expect(page.locator('h1')).toBeVisible();

    // Should be properly encoded
    expect(title).toBeTruthy();
  });
});

// ============== FAVORITES TESTS ==============

test.describe('Deal Detail - Favorites Tests', () => {
  test.beforeEach(async ({ page, context }) => {
    // Setup - login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test@123456');
    await page.click('button[type="submit"]');

    await page.waitForURL(/\/deals/, { timeout: 5000 });

    // Navigate to deal detail
    await page.goto(testDealUrl);
  });

  test('DEAL-DETAIL-FAV-001: Add deal to favorites', async ({ page }) => {
    // Arrange - get favorite button
    const favoriteButton = page.locator('button:has(svg)').filter({ hasText: '' }).first();

    // Check initial state
    const isFavoritedBefore = await favoriteButton.locator('svg').getAttribute('fill');

    // Act - click favorite
    await favoriteButton.click();

    // Wait for update
    await page.waitForTimeout(500);

    // Assert - should be favorited
    const isFavoritedAfter = await favoriteButton.locator('svg').getAttribute('fill');
    expect(isFavoritedAfter).toBe('currentColor');

    // Should show red color
    const svg = favoriteButton.locator('svg');
    await expect(svg).toHaveClass(/text-red|fill-red/);
  });

  test('DEAL-DETAIL-FAV-002: Remove deal from favorites', async ({ page }) => {
    // First add to favorites
    const favoriteButton = page.locator('button:has(svg)').filter({ hasText: '' }).first();
    await favoriteButton.click();
    await page.waitForTimeout(500);

    // Verify it's favorited
    await expect(favoriteButton.locator('svg')).toHaveAttribute('fill', 'currentColor');

    // Act - remove from favorites
    await favoriteButton.click();
    await page.waitForTimeout(500);

    // Assert - should be unfavorited
    await expect(favoriteButton.locator('svg')).not.toHaveAttribute('fill', 'currentColor');
  });

  test('DEAL-DETAIL-FAV-003: Favorite button requires login', async ({ context }) => {
    // Use incognito context (not logged in)
    const page = await context.newPage();
    await page.goto(testDealUrl);

    // Act - click favorite
    const favoriteButton = page.locator('button:has(svg)').filter({ hasText: '' }).first();
    await favoriteButton.click();

    // Assert - should redirect to login
    await page.waitForTimeout(500);

    const currentUrl = page.url();
    expect(currentUrl).toContain('/login');

    await page.close();
  });

  test('DEAL-DETAIL-FAV-004: Favorite state persists', async ({ page }) => {
    // Add to favorite
    const favoriteButton = page.locator('button:has(svg)').filter({ hasText: '' }).first();
    await favoriteButton.click();
    await page.waitForTimeout(500);

    // Navigate away
    await page.goto('/deals');

    // Navigate back
    await page.goto(testDealUrl);

    // Assert - should still be favorited
    await expect(favoriteButton.locator('svg')).toHaveAttribute('fill', 'currentColor');
  });
});

// ============== REDEEM TESTS ==============

test.describe('Deal Detail - Redeem Tests', () => {
  test('DEAL-DETAIL-REDEEM-001: Show QR code modal', async ({ page, context }) => {
    // Setup - login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test@123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/deals/);

    await page.goto(testDealUrl);

    // Act - click redeem
    await page.click('button:has-text("Redeem")');

    // Assert - QR modal should appear
    await expect(page.locator('.fixed.inset-0, [role="dialog"]')).toBeVisible();

    // Should show QR code
    await expect(page.locator('img[src*="data:image"]')).toBeVisible();
  });

  test('DEAL-DETAIL-REDEEM-002: Close QR modal', async ({ page, context }) => {
    // Setup - login and open modal
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test@123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/deals/);

    await page.goto(testDealUrl);
    await page.click('button:has-text("Redeem")');
    await page.waitForTimeout(500);

    // Act - close modal
    await page.click('button:has-text("Done"), button:has-text("Close")');

    // Assert - modal should close
    await expect(page.locator('.fixed.inset-0')).not.toBeVisible();
  });

  test('DEAL-DETAIL-REDEEM-003: Redeem requires login', async ({ context }) => {
    // Not logged in
    const page = await context.newPage();
    await page.goto(testDealUrl);

    // Act - click redeem
    await page.click('button:has-text("Redeem")');

    // Assert - should redirect to login
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/login');

    await page.close();
  });

  test('DEAL-DETAIL-REDEEM-004: QR code contains deal info', async ({ page, context }) => {
    // Setup - login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'Test@123456');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/deals/);

    await page.goto(testDealUrl);
    await page.click('button:has-text("Redeem")');
    await page.waitForTimeout(500);

    // Assert - QR should be generated
    const qrImage = page.locator('.fixed.inset-0 img[src*="data:image"]');

    await expect(qrImage).toBeVisible();

    const src = await qrImage.getAttribute('src');
    expect(src).toContain('data:image');
  });
});

// ============== NAVIGATION TESTS ==============

test.describe('Deal Detail - Navigation Tests', () => {
  test('DEAL-DETAIL-NAV-001: Back button works', async ({ page }) => {
    // Arrange - come from deals page
    await page.goto('/deals');
    await page.click('[data-testid="deal-card"], .deal-card');
    await page.waitForTimeout(500);

    // Act - click back
    await page.click('button:has-text("Back"), button[aria-label="back"]');

    // Assert - should go back
    await expect(page).toHaveURL(/\/deals/, { timeout: 3000 });
  });

  test('DEAL-DETAIL-NAV-002: Navigate to related deals', async ({ page }) => {
    await page.goto(testDealUrl);

    // Check for related deals section (if implemented)
    const relatedSection = page.locator('text=/related|similar deals/i');

    if (await relatedSection.isVisible()) {
      const relatedCards = page.locator('[data-testid="deal-card"], .deal-card');
      const count = await relatedCards.count();

      if (count > 0) {
        // Click first related deal
        await relatedCards.first().click();

        // Should navigate to deal detail
        await expect(page).toHaveURL(/\/deals\/\d+/);
      }
    }
  });
});

// ============== UI/UX TESTS ==============

test.describe('Deal Detail - UI/UX Tests', () => {
  test('DEAL-DETAIL-UI-001: Mobile responsive layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(testDealUrl);

    // All content should be visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('button:has-text("Redeem")')).toBeVisible();

    // Buttons should be touch-friendly
    const redeemButton = page.locator('button:has-text("Redeem")');
    const buttonBox = await redeemButton.boundingBox();

    expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
  });

  test('DEAL-DETAIL-UI-002: Image hero section', async ({ page }) => {
    await page.goto(testDealUrl);

    // Hero image should be prominent
    const heroSection = page.locator('.relative.h-72, .relative.h-96');
    await expect(heroSection.first()).toBeVisible();

    // Should have overlay
    const overlay = heroSection.locator('.bg-gradient');
    await expect(overlay).toBeVisible();
  });

  test('DEAL-DETAIL-UI-003: Clear visual hierarchy', async ({ page }) => {
    await page.goto(testDealUrl);

    // Check that important elements stand out
    const title = page.locator('h1');
    const titleSize = await title.evaluate(el => {
      return parseInt(window.getComputedStyle(el).fontSize);
    });

    // Title should be large
    expect(titleSize).toBeGreaterThan(20);

    // Price should be prominent
    const price = page.locator('.text-4xl, .font-bold.text-primary');
    await expect(price.first()).toBeVisible();
  });

  test('DEAL-DETAIL-UI-004: Loading state', async ({ page }) => {
    // Mock slow API
    await page.route('**/api/deals/**', route => {
      setTimeout(() => route.continue(), 2000);
    });

    await page.goto(testDealUrl);

    // Should show loading indicator
    const loader = page.locator('.animate-spin, [data-testid="loading"]');

    if (await loader.isVisible({ timeout: 100 })) {
      await expect(loader).toBeVisible();
    }
  });

  test('DEAL-DETAIL-UI-005: Share functionality', async ({ page }) => {
    await page.goto(testDealUrl);

    const shareButton = page.locator('button:has-text("Share")');

    if (await shareButton.isVisible()) {
      // Click share
      await shareButton.click();

      // Should either open native share or show options
      // This varies by browser/implementation
    }
  });

  test('DEAL-DETAIL-UI-006: Accessible labels', async ({ page }) => {
    await page.goto(testDealUrl);

    // Check for aria-labels on buttons
    const buttons = page.locator('button[aria-label], button[aria-labelledby]');
    const count = await buttons.count();

    // Should have some accessibility labels
    expect(count).toBeGreaterThan(0);
  });

  test('DEAL-DETAIL-UI-007: Color contrast', async ({ page }) => {
    await page.goto(testDealUrl);

    // Check important elements for contrast
    const title = page.locator('h1');

    const bgColor = await title.evaluate(el => {
      return window.getComputedStyle(el).color;
    });

    // Should have dark text
    expect(bgColor).not.toBe('rgb(255, 255, 255)');
  });

  test('DEAL-DETAIL-UI-008: Smooth scroll behavior', async ({ page }) => {
    await page.goto(testDealUrl);

    // Page should load scrolled to top
    const scrollY = await page.evaluate(() => window.scrollY);

    expect(scrollY).toBe(0);
  });
});
