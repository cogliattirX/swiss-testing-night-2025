import { test, expect } from '@playwright/test';

test.describe('Sauce Demo Login', () => {
  test('should login with standard user', async ({ page }) => {
    await page.goto('/');
    
    // Login
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
    
    // Verify successful login
    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(page.locator('.title')).toHaveText('Products');
  });
});
