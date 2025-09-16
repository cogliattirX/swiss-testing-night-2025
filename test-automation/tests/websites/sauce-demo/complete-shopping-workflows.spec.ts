import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

/**
 * Complete Shopping Workflow Tests
 * Tests various end-to-end shopping scenarios with different product combinations,
 * user types, and edge cases to ensure the complete purchase flow works correctly.
 */

test.describe('Complete Shopping Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the base URL
    await page.goto('/');
  });

  test('should complete order with cheapest products', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await actions.step('Login as standard user', async () => {
      await actions.observableFill('#user-name', 'standard_user', 'Enter username');
      await actions.observableFill('#password', 'secret_sauce', 'Enter password');
      await actions.observableClick('#login-button', 'Click login');
      await actions.observableExpect(
        () => expect(page).toHaveURL(/.*inventory.html/),
        'Verify successful login'
      );
    });

    await actions.step('Add cheapest products to cart', async () => {
      // Sauce Labs Onesie ($7.99) and Sauce Labs Bike Light ($9.99)
      await actions.observableClick('[data-test="add-to-cart-sauce-labs-onesie"]', 'Add Sauce Labs Onesie');
      await actions.observableClick('[data-test="add-to-cart-sauce-labs-bike-light"]', 'Add Sauce Labs Bike Light');
      
      await actions.observableExpect(
        () => expect(page.locator('.shopping_cart_badge')).toHaveText('2'),
        'Verify cart badge shows 2 items'
      );
    });

    await actions.step('Navigate to cart and verify contents', async () => {
      await actions.observableClick('.shopping_cart_link', 'Navigate to shopping cart');
      await actions.observableExpect(
        () => expect(page).toHaveURL(/.*cart.html/),
        'Verify cart page loaded'
      );
      
      const itemNames = page.locator('[data-test="inventory-item-name"]');
      await actions.observableExpect(
        () => expect(itemNames).toHaveCount(2),
        'Verify 2 items in cart'
      );
      await actions.observableExpect(
        () => expect(itemNames.nth(0)).toHaveText('Sauce Labs Onesie'),
        'Verify first item is Onesie'
      );
      await actions.observableExpect(
        () => expect(itemNames.nth(1)).toHaveText('Sauce Labs Bike Light'),
        'Verify second item is Bike Light'
      );
    });

    await actions.step('Proceed to checkout and fill information', async () => {
      await actions.observableClick('[data-test="checkout"]', 'Proceed to checkout');
      await actions.observableExpect(
        () => expect(page).toHaveURL(/.*checkout-step-one.html/),
        'Verify checkout form page'
      );
      
      await actions.observableFill('[data-test="firstName"]', 'Alex', 'Enter first name');
      await actions.observableFill('[data-test="lastName"]', 'Johnson', 'Enter last name');
      await actions.observableFill('[data-test="postalCode"]', '12345', 'Enter postal code');
      await actions.observableClick('[data-test="continue"]', 'Continue to overview');
    });

    await actions.step('Review order and verify pricing', async () => {
      await actions.observableExpect(
        () => expect(page).toHaveURL(/.*checkout-step-two.html/),
        'Verify order overview page'
      );
      
      // Verify items in overview
      const overviewItems = page.locator('[data-test="inventory-item-name"]');
      await actions.observableExpect(
        () => expect(overviewItems).toHaveCount(2),
        'Verify 2 items in overview'
      );
      
      // Verify total calculation (Onesie $7.99 + Bike Light $9.99 = $17.98)
      await actions.observableExpect(
        () => expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $17.98'),
        'Verify subtotal calculation'
      );
      
      // Verify tax and total are present
      await actions.observableExpect(
        () => expect(page.locator('[data-test="tax-label"]')).toBeVisible(),
        'Verify tax is displayed'
      );
      await actions.observableExpect(
        () => expect(page.locator('[data-test="total-label"]')).toBeVisible(),
        'Verify total is displayed'
      );
    });

    await actions.step('Complete the order', async () => {
      await actions.observableClick('[data-test="finish"]', 'Complete order');
      await actions.observableExpect(
        () => expect(page).toHaveURL(/.*checkout-complete.html/),
        'Verify order completion page'
      );
      
      await actions.observableExpect(
        () => expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!'),
        'Verify order completion message'
      );
      
      await actions.observableExpect(
        () => expect(page.locator('[data-test="pony-express"]')).toBeVisible(),
        'Verify pony express image'
      );
    });

    await actions.step('Return to products and verify cart is empty', async () => {
      await actions.observableClick('[data-test="back-to-products"]', 'Return to products');
      await actions.observableExpect(
        () => expect(page).toHaveURL(/.*inventory.html/),
        'Verify back on inventory page'
      );
      
      await actions.observableExpect(
        () => expect(page.locator('.shopping_cart_badge')).not.toBeVisible(),
        'Verify cart is empty after order'
      );
    });
  });

  test('should complete order with most expensive products', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await actions.step('Login and navigate to inventory', async () => {
      await actions.observableFill('#user-name', 'standard_user');
      await actions.observableFill('#password', 'secret_sauce');
      await actions.observableClick('#login-button');
      await expect(page).toHaveURL(/.*inventory.html/);
    });

    await actions.step('Add most expensive products', async () => {
      // Sauce Labs Fleece Jacket ($49.99) and Sauce Labs Backpack ($29.99)
      await actions.observableClick('[data-test="add-to-cart-sauce-labs-fleece-jacket"]', 'Add Fleece Jacket ($49.99)');
      await actions.observableClick('[data-test="add-to-cart-sauce-labs-backpack"]', 'Add Backpack ($29.99)');
      
      await actions.observableExpect(
        () => expect(page.locator('.shopping_cart_badge')).toHaveText('2'),
        'Verify 2 expensive items in cart'
      );
    });

    await actions.step('Complete checkout process', async () => {
      await actions.observableClick('.shopping_cart_link');
      await actions.observableClick('[data-test="checkout"]');
      
      await actions.observableFill('[data-test="firstName"]', 'Morgan');
      await actions.observableFill('[data-test="lastName"]', 'Taylor');
      await actions.observableFill('[data-test="postalCode"]', '54321');
      await actions.observableClick('[data-test="continue"]');
    });

    await actions.step('Verify high-value order total', async () => {
      // Verify total calculation (Fleece Jacket $49.99 + Backpack $29.99 = $79.98)
      await actions.observableExpect(
        () => expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $79.98'),
        'Verify high-value subtotal'
      );
      
      await actions.observableClick('[data-test="finish"]');
      await actions.observableExpect(
        () => expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!'),
        'Verify expensive order completion'
      );
    });
  });

  test('should complete order with all available products', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await actions.step('Login to start shopping', async () => {
      await actions.observableFill('#user-name', 'standard_user');
      await actions.observableFill('#password', 'secret_sauce');
      await actions.observableClick('#login-button');
      await expect(page).toHaveURL(/.*inventory.html/);
    });

    await actions.step('Add all products to cart', async () => {
      // Add all 6 products available on Sauce Demo
      const productButtons = [
        '[data-test="add-to-cart-sauce-labs-backpack"]',
        '[data-test="add-to-cart-sauce-labs-bike-light"]',
        '[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]',
        '[data-test="add-to-cart-sauce-labs-fleece-jacket"]',
        '[data-test="add-to-cart-sauce-labs-onesie"]',
        '[data-test="add-to-cart-test.allthethings()-t-shirt-(red)"]'
      ];
      
      for (const button of productButtons) {
        await actions.observableClick(button, `Add product to cart`);
      }
      
      await actions.observableExpect(
        () => expect(page.locator('.shopping_cart_badge')).toHaveText('6'),
        'Verify all 6 products in cart'
      );
    });

    await actions.step('Navigate to cart and verify all items', async () => {
      await actions.observableClick('.shopping_cart_link');
      
      const cartItems = page.locator('.cart_item');
      await actions.observableExpect(
        () => expect(cartItems).toHaveCount(6),
        'Verify all 6 items in cart view'
      );
      
      // Verify specific high-value items are present
      const itemNames = page.locator('[data-test="inventory-item-name"]');
      await actions.observableExpect(
        () => expect(itemNames).toContainText(['Sauce Labs Backpack', 'Sauce Labs Fleece Jacket']),
        'Verify high-value items included'
      );
    });

    await actions.step('Complete massive order checkout', async () => {
      await actions.observableClick('[data-test="checkout"]');
      
      await actions.observableFill('[data-test="firstName"]', 'Casey');
      await actions.observableFill('[data-test="lastName"]', 'Williams');
      await actions.observableFill('[data-test="postalCode"]', '98765');
      await actions.observableClick('[data-test="continue"]');
    });

    await actions.step('Verify complete inventory order total', async () => {
      // Total of all items: $29.99 + $9.99 + $15.99 + $49.99 + $7.99 + $15.99 = $129.94
      await actions.observableExpect(
        () => expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $129.94'),
        'Verify complete inventory subtotal'
      );
      
      const overviewItems = page.locator('.cart_item');
      await actions.observableExpect(
        () => expect(overviewItems).toHaveCount(6),
        'Verify all 6 items in final overview'
      );
      
      await actions.observableClick('[data-test="finish"]');
      await actions.observableExpect(
        () => expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!'),
        'Verify massive order completion'
      );
    });
  });

  test('should handle single item quick purchase', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await actions.step('Quick login and single item purchase', async () => {
      await actions.observableFill('#user-name', 'standard_user');
      await actions.observableFill('#password', 'secret_sauce');
      await actions.observableClick('#login-button');
      await expect(page).toHaveURL(/.*inventory.html/);
      
      // Quick purchase of T-shirt
      await actions.observableClick('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]', 'Quick add T-shirt');
      await actions.observableClick('.shopping_cart_link', 'Go to cart immediately');
      await actions.observableClick('[data-test="checkout"]', 'Express checkout');
      
      await actions.observableFill('[data-test="firstName"]', 'Sam');
      await actions.observableFill('[data-test="lastName"]', 'Quick');
      await actions.observableFill('[data-test="postalCode"]', '11111');
      await actions.observableClick('[data-test="continue"]');
      
      // Verify single item total
      await actions.observableExpect(
        () => expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $15.99'),
        'Verify T-shirt price'
      );
      
      await actions.observableClick('[data-test="finish"]');
      await actions.observableExpect(
        () => expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!'),
        'Verify quick purchase completion'
      );
    });
  });

  test('should complete order with product removal and re-addition', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await actions.step('Login and start complex shopping journey', async () => {
      await actions.observableFill('#user-name', 'standard_user');
      await actions.observableFill('#password', 'secret_sauce');
      await actions.observableClick('#login-button');
      await expect(page).toHaveURL(/.*inventory.html/);
    });

    await actions.step('Add, remove, and modify cart contents', async () => {
      // Initial adds
      await actions.observableClick('[data-test="add-to-cart-sauce-labs-backpack"]', 'Add Backpack');
      await actions.observableClick('[data-test="add-to-cart-sauce-labs-bike-light"]', 'Add Bike Light');
      await actions.observableClick('[data-test="add-to-cart-sauce-labs-fleece-jacket"]', 'Add Fleece Jacket');
      
      await actions.observableExpect(
        () => expect(page.locator('.shopping_cart_badge')).toHaveText('3'),
        'Verify 3 items initially added'
      );
      
      // Go to cart and remove expensive item
      await actions.observableClick('.shopping_cart_link', 'Navigate to cart');
      await actions.observableClick('[data-test="remove-sauce-labs-fleece-jacket"]', 'Remove expensive Fleece Jacket');
      
      await actions.observableExpect(
        () => expect(page.locator('.shopping_cart_badge')).toHaveText('2'),
        'Verify item removed from cart'
      );
      
      // Continue shopping and add different item
      await actions.observableClick('[data-test="continue-shopping"]', 'Continue shopping');
      await actions.observableClick('[data-test="add-to-cart-sauce-labs-onesie"]', 'Add cheaper Onesie instead');
      
      await actions.observableExpect(
        () => expect(page.locator('.shopping_cart_badge')).toHaveText('3'),
        'Verify cart updated with new item'
      );
    });

    await actions.step('Complete modified order', async () => {
      await actions.observableClick('.shopping_cart_link');
      
      // Verify final cart contents
      const finalItems = page.locator('[data-test="inventory-item-name"]');
      await actions.observableExpect(
        () => expect(finalItems).toHaveCount(3),
        'Verify 3 items in final cart'
      );
      
      await actions.observableClick('[data-test="checkout"]');
      await actions.observableFill('[data-test="firstName"]', 'Jordan');
      await actions.observableFill('[data-test="lastName"]', 'Modified');
      await actions.observableFill('[data-test="postalCode"]', '33333');
      await actions.observableClick('[data-test="continue"]');
      
      // Verify modified total (Backpack $29.99 + Bike Light $9.99 + Onesie $7.99 = $47.97)
      await actions.observableExpect(
        () => expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $47.97'),
        'Verify modified cart total'
      );
      
      await actions.observableClick('[data-test="finish"]');
      await actions.observableExpect(
        () => expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!'),
        'Verify modified order completion'
      );
    });
  });
});