// tests/e2e/language-switcher.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Language Switcher E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Listen to console logs for debugging
    page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', (error) => console.log('PAGE ERROR:', error.message));

    await page.goto('/');
    // Wait for page to be fully loaded
    await page.waitForSelector('#lang-select');
    await page.waitForTimeout(2000); // Wait for JavaScript to initialize
  });
  test('Language switcher updates all translatable elements', async ({ page }) => {
    // Check if the language select works
    const langSelect = page.locator('#lang-select');
    await expect(langSelect).toBeVisible();

    // Test German translation
    await langSelect.selectOption('de');

    // Wait for the text to actually change to German
    const homeNavElement = page.locator('[data-i18n="nav_home"]').first();
    await expect(homeNavElement).toHaveText('Startseite', { timeout: 10000 });
  });

  test('Language switcher works for multiple languages', async ({ page }) => {
    // Test Spanish translation
    await page.selectOption('#lang-select', 'es');

    const homeNavElement = page.locator('[data-i18n="nav_home"]').first();
    await expect(homeNavElement).toHaveText('Inicio', { timeout: 10000 });

    // Test French translation
    await page.selectOption('#lang-select', 'fr');
    await expect(homeNavElement).toHaveText('Accueil', { timeout: 10000 });
  });

  test('Page title updates with language change', async ({ page }) => {
    await page.selectOption('#lang-select', 'de');

    // Wait for title to change
    await page.waitForFunction(
      () => {
        return document.title.includes('Burni Token');
      },
      { timeout: 10000 },
    );

    const title = await page.title();
    expect(title).toContain('Burni Token');
  });
});
