import { test, expect } from '@playwright/test';

test.describe('Complete Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
    await expect(page).toHaveURL(/.*inventory.html/);
  });

  test('should complete full checkout process successfully', async ({ page }) => {
    // Step 1: Add products to cart
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('[data-test="add-to-cart-sauce-labs-bike-light"]');

    // Verify items in cart
    await expect(page.locator('.shopping_cart_badge')).toHaveText('2');

    // Step 2: Navigate to cart
    await page.click('.shopping_cart_link');
    await expect(page).toHaveURL(/.*cart.html/);

    // Verify cart contents
    await expect(page.locator('.cart_item')).toHaveCount(2);
    const itemNames = page.locator('[data-test="inventory-item-name"]');
    await expect(itemNames.nth(0)).toHaveText('Sauce Labs Backpack');
    await expect(itemNames.nth(1)).toHaveText('Sauce Labs Bike Light');

    // Step 3: Proceed to checkout
    await page.click('[data-test="checkout"]');
    await expect(page).toHaveURL(/.*checkout-step-one.html/);

    // Step 4: Fill checkout information
    await page.fill('[data-test="firstName"]', 'John');
    await page.fill('[data-test="lastName"]', 'Doe');
    await page.fill('[data-test="postalCode"]', '12345');

    // Continue to overview
    await page.click('[data-test="continue"]');
    await expect(page).toHaveURL(/.*checkout-step-two.html/);

    // Step 5: Verify order overview
    await expect(page.locator('.cart_item')).toHaveCount(2);
    
    // Verify product details in overview
    const overviewItemNames = page.locator('[data-test="inventory-item-name"]');
    await expect(overviewItemNames.nth(0)).toHaveText('Sauce Labs Backpack');
    await expect(overviewItemNames.nth(1)).toHaveText('Sauce Labs Bike Light');

    // Verify payment and shipping information
    await expect(page.locator('[data-test="payment-info-value"]')).toHaveText('SauceCard #31337');
    await expect(page.locator('[data-test="shipping-info-value"]')).toHaveText('Free Pony Express Delivery!');

    // Verify pricing calculations
    const itemTotal = page.locator('[data-test="subtotal-label"]');
    const tax = page.locator('[data-test="tax-label"]');
    const total = page.locator('[data-test="total-label"]');

    await expect(itemTotal).toBeVisible();
    await expect(tax).toBeVisible();
    await expect(total).toBeVisible();

    // Verify total calculation (Backpack $29.99 + Bike Light $9.99 = $39.98)
    await expect(itemTotal).toHaveText('Item total: $39.98');

    // Step 6: Complete the order
    await page.click('[data-test="finish"]');
    await expect(page).toHaveURL(/.*checkout-complete.html/);

    // Step 7: Verify order completion
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
    await expect(page.locator('[data-test="complete-text"]')).toContainText('Your order has been dispatched');

    // Verify pony image is displayed
    await expect(page.locator('[data-test="pony-express"]')).toBeVisible();

    // Step 8: Return to products
    await page.click('[data-test="back-to-products"]');
    await expect(page).toHaveURL(/.*inventory.html/);

    // Verify cart is empty after successful order
    await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
  });

  test('should handle checkout with single item', async ({ page }) => {
    // Add single item
    await page.click('[data-test="add-to-cart-sauce-labs-fleece-jacket"]');
    
    // Complete checkout flow
    await page.click('.shopping_cart_link');
    await page.click('[data-test="checkout"]');
    
    // Fill form
    await page.fill('[data-test="firstName"]', 'Jane');
    await page.fill('[data-test="lastName"]', 'Smith');
    await page.fill('[data-test="postalCode"]', '67890');
    await page.click('[data-test="continue"]');
    
    // Verify single item in overview
    await expect(page.locator('.cart_item')).toHaveCount(1);
    const itemName = page.locator('[data-test="inventory-item-name"]');
    await expect(itemName).toHaveText('Sauce Labs Fleece Jacket');
    
    // Verify price calculation for single expensive item
    await expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $49.99');
    
    // Complete order
    await page.click('[data-test="finish"]');
    await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
  });

  test('should validate required fields in checkout form', async ({ page }) => {
    // Add item and navigate to checkout
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('.shopping_cart_link');
    await page.click('[data-test="checkout"]');

    // Try to continue without filling form
    await page.click('[data-test="continue"]');

    // Verify error message for missing first name
    await expect(page.locator('[data-test="error"]')).toHaveText('Error: First Name is required');

    // Fill first name only
    await page.fill('[data-test="firstName"]', 'John');
    await page.click('[data-test="continue"]');

    // Verify error message for missing last name
    await expect(page.locator('[data-test="error"]')).toHaveText('Error: Last Name is required');

    // Fill last name only (first name should be cleared)
    await page.fill('[data-test="lastName"]', 'Doe');
    await page.click('[data-test="continue"]');

    // Verify error message for missing postal code
    await expect(page.locator('[data-test="error"]')).toHaveText('Error: Postal Code is required');

    // Fill all required fields
    await page.fill('[data-test="firstName"]', 'John');
    await page.fill('[data-test="lastName"]', 'Doe');
    await page.fill('[data-test="postalCode"]', '12345');
    await page.click('[data-test="continue"]');

    // Verify successful navigation to overview
    await expect(page).toHaveURL(/.*checkout-step-two.html/);
  });

  test('should allow cancellation at different checkout steps', async ({ page }) => {
    // Add item to cart
    await page.click('[data-test="add-to-cart-sauce-labs-backpack"]');
    await page.click('.shopping_cart_link');

    // Test cancellation from cart
    await page.click('[data-test="continue-shopping"]');
    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1'); // Item should still be in cart

    // Return to cart and proceed to checkout
    await page.click('.shopping_cart_link');
    await page.click('[data-test="checkout"]');

    // Test cancellation from checkout form
    await page.click('[data-test="cancel"]');
    await expect(page).toHaveURL(/.*cart.html/);

    // Proceed to checkout form again
    await page.click('[data-test="checkout"]');
    await page.fill('[data-test="firstName"]', 'John');
    await page.fill('[data-test="lastName"]', 'Doe');
    await page.fill('[data-test="postalCode"]', '12345');
    await page.click('[data-test="continue"]');

    // Test cancellation from overview
    await page.click('[data-test="cancel"]');
    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1'); // Item should still be in cart
  });
});
