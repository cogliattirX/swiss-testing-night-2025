import { test, expect } from '@playwright/test';

test.describe('Error Handling and Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should handle locked out user login', async ({ page }) => {
    // Attempt login with locked out user
    await page.fill('#user-name', 'locked_out_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');

    // Verify error message is displayed
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Epic sadface: Sorry, this user has been locked out.');

    // Verify user remains on login page
    await expect(page).toHaveURL(/.*saucedemo.com\/?$/);

    // Verify error can be dismissed
    await page.click('[data-test="error-button"]');
    await expect(errorMessage).not.toBeVisible();

    // Note: Form fields are not automatically cleared after error dismissal in Sauce Demo
    // This is expected behavior for this application
  });

  test('should handle invalid username', async ({ page }) => {
    // Attempt login with invalid username
    await page.fill('#user-name', 'invalid_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');

    // Verify error message
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Epic sadface: Username and password do not match any user in this service');

    // Verify user remains on login page
    await expect(page).toHaveURL(/.*saucedemo.com\/?$/);
  });

  test('should handle invalid password', async ({ page }) => {
    // Attempt login with valid username but invalid password
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'wrong_password');
    await page.click('#login-button');

    // Verify error message
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Epic sadface: Username and password do not match any user in this service');
  });

  test('should handle empty username field', async ({ page }) => {
    // Attempt login with empty username
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');

    // Verify error message for missing username
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Epic sadface: Username is required');
  });

  test('should handle empty password field', async ({ page }) => {
    // Attempt login with empty password
    await page.fill('#user-name', 'standard_user');
    await page.click('#login-button');

    // Verify error message for missing password
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Epic sadface: Password is required');
  });

  test('should handle empty form submission', async ({ page }) => {
    // Attempt login with both fields empty
    await page.click('#login-button');

    // Verify error message for missing username (first required field)
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Epic sadface: Username is required');
  });

  test('should handle problem user login and display issues', async ({ page }) => {
    // Login with problem user
    await page.fill('#user-name', 'problem_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');

    // Verify successful login (problem user can login)
    await expect(page).toHaveURL(/.*inventory.html/);

    // Verify that images might not load properly (this user has image loading issues)
    // We'll check that the page loads but images may have issues
    const productImages = page.locator('.inventory_item_img img');
    await expect(productImages).toHaveCount(6); // Should have 6 product images

    // Problem user should still be able to add items to cart
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
  });

  test('should handle performance glitch user', async ({ page }) => {
    // Login with performance glitch user
    await page.fill('#user-name', 'performance_glitch_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');

    // This user experiences performance issues, so we need longer timeouts
    // Verify successful login (may take longer)
    await expect(page).toHaveURL(/.*inventory.html/, { timeout: 10000 });

    // Verify page loads completely
    await expect(page.locator('.title')).toHaveText('Products');
    const productItems = page.locator('.inventory_item');
    await expect(productItems).toHaveCount(6);
  });

  test('should handle direct URL access without authentication', async ({ page }) => {
    // Try to access inventory page directly without login
    await page.goto('/inventory.html');

    // Should be redirected to login page
    await expect(page).toHaveURL(/.*saucedemo.com\/?$/);

    // Try to access cart page directly
    await page.goto('/cart.html');
    await expect(page).toHaveURL(/.*saucedemo.com\/?$/);

    // Try to access checkout page directly
    await page.goto('/checkout-step-one.html');
    await expect(page).toHaveURL(/.*saucedemo.com\/?$/);
  });

  test('should maintain error state during multiple failed login attempts', async ({ page }) => {
    // First failed attempt
    await page.fill('#user-name', 'invalid_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');

    let errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();

    // Dismiss error
    await page.click('[data-test="error-button"]');
    await expect(errorMessage).not.toBeVisible();

    // Second failed attempt with different credentials
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'wrong_password');
    await page.click('#login-button');

    // Verify error message appears again
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toHaveText('Epic sadface: Username and password do not match any user in this service');

    // Verify correct credentials work after errors
    await page.click('[data-test="error-button"]');
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');

    // Should successfully login
    await expect(page).toHaveURL(/.*inventory.html/);
  });
});
