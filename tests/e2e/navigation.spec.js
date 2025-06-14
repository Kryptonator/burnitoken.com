// tests/e2e/navigation.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for page to be loaded (try both approaches)
    try {
      await page.waitForSelector('#pageLoader', { state: 'hidden', timeout: 5000 });
    } catch (e) {
      // If page loader doesn't exist or doesn't hide, just wait for header
      console.log('Page loader might not exist or hide, waiting for header...');
    }
    await page.waitForSelector('header', { timeout: 10000 });
    // Wait a bit more for JavaScript to initialize
    await page.waitForTimeout(1000);
  });

  test('Navigation works and all sections are visible', async ({ page }) => {
    // Test navigation to tokenomics section
    await page.click('a[href="#tokenomics"]');
    await page.waitForTimeout(1000); // Wait for smooth scroll

    const tokenomicsSection = page.locator('#tokenomics');
    await expect(tokenomicsSection).toBeVisible();
  });

  test('Mobile menu opens and closes', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    const mobileMenuButton = page.locator('#mobile-menu-button');
    const mobileMenu = page.locator('#mobile-menu');

    // Menu should be hidden initially
    await expect(mobileMenu).toHaveClass(/hidden/);

    // Click to open menu
    await mobileMenuButton.click();
    // Wait for the menu to actually change
    await expect(mobileMenu).not.toHaveClass(/hidden/, { timeout: 5000 });

    // Click to close menu
    await mobileMenuButton.click();
    await expect(mobileMenu).toHaveClass(/hidden/, { timeout: 5000 });
  });

  test('Smooth scrolling to sections works', async ({ page }) => {
    // Test navigation to multiple sections
    const sections = ['#about', '#use-cases', '#token-schedule'];

    for (const section of sections) {
      await page.click(`a[href="${section}"]`);
      await page.waitForTimeout(1000);

      const sectionElement = page.locator(section);
      await expect(sectionElement).toBeVisible();
    }
  });

  test('Active navigation state updates on scroll', async ({ page }) => {
    // First scroll to top to ensure we start from hero section
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    // Navigate to about section using smooth scroll
    await page.click('a[href="#about"]');
    await page.waitForTimeout(2000); // Wait for smooth scroll to complete

    // Check if nav link is active - try different selectors
    const aboutNavLink = page.locator('header nav a[href="#about"]').first();
    await expect(aboutNavLink).toHaveClass(/active/, { timeout: 5000 });
  });
});
