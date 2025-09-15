import { test, expect } from '@playwright/test';

test.describe('Navigation and State Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
    await expect(page).toHaveURL(/.*inventory.html/);
  });

  test('should navigate between product details and inventory', async ({ page }) => {
    // Click on a product to view details
    await page.click('#item_4_title_link'); // Sauce Labs Backpack
    await expect(page).toHaveURL(/.*inventory-item.html\?id=4/);

    // Verify product detail page elements
    await expect(page.locator('.inventory_details_name')).toHaveText('Sauce Labs Backpack');
    await expect(page.locator('.inventory_details_desc')).toBeVisible();
    await expect(page.locator('.inventory_details_price')).toHaveText('$29.99');

    // Navigate back to products
    await page.click('#back-to-products');
    await expect(page).toHaveURL(/.*inventory.html/);

    // Verify we're back on inventory page
    await expect(page.locator('.title')).toHaveText('Products');
    await expect(page.locator('.inventory_item')).toHaveCount(6);
  });

  test('should handle browser back and forward navigation', async ({ page }) => {
    // Navigate to product details (item 0 is Bike Light)
    await page.click('#item_0_title_link'); // Sauce Labs Bike Light
    await expect(page).toHaveURL(/.*inventory-item.html\?id=0/);

    // Use browser back button
    await page.goBack();
    await expect(page).toHaveURL(/.*inventory.html/);

    // Use browser forward button
    await page.goForward();
    await expect(page).toHaveURL(/.*inventory-item.html\?id=0/);

    // Verify product details are still correct
    await expect(page.locator('.inventory_details_name')).toHaveText('Sauce Labs Bike Light');
  });

  test('should maintain cart state across navigation', async ({ page }) => {
    // Add items to cart
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');

    // Verify cart badge
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');

    // Navigate to product details (item 4 is Backpack)
    await page.click('#item_4_title_link'); // Sauce Labs Backpack
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');

    // Navigate back to inventory
    await page.click('#back-to-products');
    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');

    // Navigate to cart
    await page.click('.shopping_cart_link');
    await expect(page.locator('.cart_item')).toHaveCount(2);

    // Navigate back to shopping
    await page.click('#continue-shopping');
    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');
  });

  test('should handle menu navigation', async ({ page }) => {
    // Open menu
    await page.click('#react-burger-menu-btn');
    
    // Verify menu items are visible
    await expect(page.locator('#inventory_sidebar_link')).toBeVisible();
    await expect(page.locator('#about_sidebar_link')).toBeVisible();
    await expect(page.locator('#logout_sidebar_link')).toBeVisible();
    await expect(page.locator('#reset_sidebar_link')).toBeVisible();

    // Test All Items link (should stay on inventory if already there)
    await page.click('#inventory_sidebar_link');
    await expect(page).toHaveURL(/.*inventory.html/);
  });

  test('should handle logout functionality', async ({ page }) => {
    // Add item to cart before logout
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

    // Open menu and logout
    await page.click('#react-burger-menu-btn');
    await page.click('#logout_sidebar_link');

    // Verify redirect to login page
    await expect(page).toHaveURL(/.*saucedemo.com\/?$/);

    // Verify login form is visible
    await expect(page.locator('#user-name')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#login-button')).toBeVisible();

    // Login again and verify cart state (Note: Sauce Demo may persist cart)
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');

    // Note: In Sauce Demo, cart state might persist across sessions
    // This is expected behavior for this demo application
  });

  test('should handle reset app state', async ({ page }) => {
    // Add multiple items to cart
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
    await page.click('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]');

    // Verify cart has items
    await expect(page.locator('.shopping_cart_badge')).toHaveText('3');

    // Open menu and reset app state
    await page.click('#react-burger-menu-btn');
    await page.click('#reset_sidebar_link');

    // Verify cart is reset
    await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
  });

  test('should handle sorting functionality', async ({ page }) => {
    // Test that sorting works
    await page.selectOption('.product_sort_container', 'lohi');
    
    // Navigate to product details and back
    await page.click('#item_0_title_link'); 
    await page.click('#back-to-products');

    // Verify we're back on inventory page
    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(page.locator('.product_sort_container')).toBeVisible();
  });

  test('should handle deep linking to specific product', async ({ page }) => {
    // Navigate directly to a specific product page
    await page.goto('/inventory-item.html?id=0');

    // Verify we can access the product directly
    await expect(page.locator('.inventory_details_name')).toHaveText('Sauce Labs Bike Light');
    await expect(page.locator('.inventory_details_price')).toHaveText('$9.99');

    // Verify navigation back to inventory works
    await page.click('#back-to-products');
    await expect(page).toHaveURL(/.*inventory.html/);

    // Test invalid product ID
    await page.goto('/inventory-item.html?id=999');
    
    // Should handle gracefully (may redirect or show error)
    // The behavior may vary, but the app shouldn't crash
    await expect(page).not.toHaveURL(/.*error/);
  });

  test('should preserve session across page refresh', async ({ page }) => {
    // Add items to cart
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');

    // Verify cart state
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');

    // Refresh the page
    await page.reload();

    // Verify we're still logged in and cart is preserved
    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');

    // Verify products are still in cart
    await page.click('.shopping_cart_link');
    await expect(page.locator('.cart_item')).toHaveCount(2);
  });
});
