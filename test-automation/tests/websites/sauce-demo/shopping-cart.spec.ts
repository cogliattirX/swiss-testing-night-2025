import { test, expect } from '@playwright/test';

test.describe('Shopping Cart Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
    await expect(page).toHaveURL(/.*inventory.html/);
  });

  test('should add items to cart and update badge count', async ({ page }) => {
    // Verify initial cart badge is not visible
    const cartBadge = page.locator('.shopping_cart_badge');
    await expect(cartBadge).not.toBeVisible();

    // Add first item to cart
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    
    // Verify cart badge shows 1
    await expect(cartBadge).toBeVisible();
    await expect(cartBadge).toHaveText('1');

    // Add second item to cart
    await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
    
    // Verify cart badge shows 2
    await expect(cartBadge).toHaveText('2');

    // Add third item to cart
    await page.click('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]');
    
    // Verify cart badge shows 3
    await expect(cartBadge).toHaveText('3');
  });

  test('should display correct items in cart', async ({ page }) => {
    // Add specific items to cart
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('[data-test="add-to-cart-sauce-labs-fleece-jacket"]');

    // Navigate to cart
    await page.click('.shopping_cart_link');
    await expect(page).toHaveURL(/.*cart.html/);

    // Verify cart contains correct items
    const cartItems = page.locator('.cart_item');
    await expect(cartItems).toHaveCount(2);

    // Verify specific items are present
    const itemNames = page.locator('[data-test="inventory-item-name"]');
    await expect(itemNames.nth(0)).toHaveText('Sauce Labs Backpack');
    await expect(itemNames.nth(1)).toHaveText('Sauce Labs Fleece Jacket');
  });

  test('should remove items from cart', async ({ page }) => {
    // Add items to cart
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');
    
    // Verify cart badge shows 2
    const cartBadge = page.locator('.shopping_cart_badge');
    await expect(cartBadge).toHaveText('2');

    // Navigate to cart
    await page.click('.shopping_cart_link');

    // Remove first item
    await page.click('[data-test="remove-sauce-labs-backpack"]');
    
    // Verify cart badge shows 1
    await expect(cartBadge).toHaveText('1');
    
    // Verify only one item remains
    const cartItems = page.locator('.cart_item');
    await expect(cartItems).toHaveCount(1);
    
    // Verify correct item remains
    const remainingItems = page.locator('[data-test="inventory-item-name"]');
    await expect(remainingItems).toHaveCount(1);
    await expect(remainingItems.first()).toHaveText('Sauce Labs Bike Light');

    // Remove remaining item
    await page.click('[data-test="remove-sauce-labs-bike-light"]');
    
    // Verify cart badge is hidden
    await expect(cartBadge).not.toBeVisible();
    
    // Verify cart is empty
    await expect(cartItems).toHaveCount(0);
  });

  test('should persist cart contents across page navigation', async ({ page }) => {
    // Add item to cart
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    
    // Navigate to product details
    await page.click('#item_4_title_link');
    await expect(page).toHaveURL(/.*inventory-item.html\?id=4/);
    
    // Verify cart badge persists
    const cartBadge = page.locator('.shopping_cart_badge');
    await expect(cartBadge).toHaveText('1');
    
    // Navigate back to inventory
    await page.click('#back-to-products');
    await expect(page).toHaveURL(/.*inventory.html/);
    
    // Verify cart badge still shows 1
    await expect(cartBadge).toHaveText('1');
    
    // Navigate to cart and verify item is still there
    await page.click('.shopping_cart_link');
    const cartItemName = page.locator('[data-test="inventory-item-name"]');
    await expect(cartItemName).toHaveText('Sauce Labs Backpack');
  });
});
