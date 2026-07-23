const { test, expect } = require('@playwright/test');

test.describe('Home Page', () => {
  test('should load the home page successfully', async ({ page }) => {
    const response = await page.goto('/');
    
    // Ensure HTTP response is successful
    expect(response).not.toBeNull();
    expect(response.ok()).toBeTruthy();

    // Ensure body element is present in DOM
    await expect(page.locator('body')).toBeAttached();

    // Verify main page loader or app element is present
    const loader = page.locator('.loader, santa-app, #santa-app').first();
    await expect(loader).toBeAttached();
  });

  test('should have valid title or document structure', async ({ page }) => {
    await page.goto('/');
    
    // Validate page has HTML structure
    const body = page.locator('body');
    await expect(body).toBeAttached();
    
    // Verify title if set or fallback to data-title attribute check
    const title = await page.title();
    if (title) {
      expect(title.toLowerCase()).toContain('santa');
    } else {
      // In local dev server without static release build, data-title placeholder attribute exists
      const titleAttr = await page.locator('title').getAttribute('data-title');
      expect(titleAttr).not.toBeNull();
    }
  });
});
