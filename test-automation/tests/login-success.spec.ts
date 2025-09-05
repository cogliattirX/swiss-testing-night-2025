import { test, expect } from '@playwright/test';

test('Login with standard user succeeds', async ({ page }) => {
  // Go to Sauce Demo login page
  await page.goto('https://www.saucedemo.com/');

  // Fill in credentials
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');

  // Assert successful login by checking URL and page title
  await expect(page).toHaveURL(/.*inventory.html/);
  await expect(page.locator('.title')).toHaveText('Products');
});
