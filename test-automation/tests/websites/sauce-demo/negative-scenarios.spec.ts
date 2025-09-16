import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

/**
 * Negative Test Scenarios
 * Tests various failure conditions and edge cases to ensure proper error handling
 * and system resilience under invalid inputs and error conditions.
 */

test.describe('Negative Test Scenarios', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the base URL
    await page.goto('/');
  });

  test('should handle invalid login attempts with comprehensive error validation', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await actions.step('Test invalid username with valid password', async () => {
      await actions.observableFill('#user-name', 'invalid_user_123', 'Enter invalid username');
      await actions.observableFill('#password', 'secret_sauce', 'Enter valid password');
      await actions.observableClick('#login-button', 'Attempt login with invalid username');
      
      await actions.observableExpect(
        () => expect(page.locator('[data-test="error"]')).toBeVisible(),
        'Verify error message appears'
      );
      await actions.observableExpect(
        () => expect(page.locator('[data-test="error"]')).toHaveText('Epic sadface: Username and password do not match any user in this service'),
        'Verify specific error message for invalid credentials'
      );
      await actions.observableExpect(
        () => expect(page).toHaveURL(/.*saucedemo.com\/?$/),
        'Verify user remains on login page'
      );
    });

    await actions.step('Dismiss error and test empty credentials', async () => {
      await actions.observableClick('[data-test="error-button"]', 'Dismiss previous error');
      await actions.observableExpect(
        () => expect(page.locator('[data-test="error"]')).not.toBeVisible(),
        'Verify error is dismissed'
      );
      
      // Clear any existing values
      await actions.observableFill('#user-name', '', 'Clear username field');
      await actions.observableFill('#password', '', 'Clear password field');
      await actions.observableClick('#login-button', 'Attempt login with empty fields');
      
      await actions.observableExpect(
        () => expect(page.locator('[data-test="error"]')).toBeVisible(),
        'Verify error appears for empty credentials'
      );
      await actions.observableExpect(
        () => expect(page.locator('[data-test="error"]')).toHaveText('Epic sadface: Username is required'),
        'Verify username required error message'
      );
    });

    await actions.step('Test locked out user account', async () => {
      await actions.observableClick('[data-test="error-button"]', 'Dismiss username error');
      
      await actions.observableFill('#user-name', 'locked_out_user', 'Enter locked out username');
      await actions.observableFill('#password', 'secret_sauce', 'Enter correct password');
      await actions.observableClick('#login-button', 'Attempt login with locked account');
      
      await actions.observableExpect(
        () => expect(page.locator('[data-test="error"]')).toBeVisible(),
        'Verify locked out error appears'
      );
      await actions.observableExpect(
        () => expect(page.locator('[data-test="error"]')).toHaveText('Epic sadface: Sorry, this user has been locked out.'),
        'Verify locked out error message'
      );
      await actions.observableExpect(
        () => expect(page).toHaveURL(/.*saucedemo.com\/?$/),
        'Verify locked out user cannot access inventory'
      );
    });
  });

  test('should handle checkout form validation and incomplete information', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await actions.step('Login and add items to cart', async () => {
      await actions.observableFill('#user-name', 'standard_user', 'Login with valid user');
      await actions.observableFill('#password', 'secret_sauce', 'Enter password');
      await actions.observableClick('#login-button', 'Complete login');
      
      await actions.observableExpect(
        () => expect(page).toHaveURL(/.*inventory.html/),
        'Verify successful login'
      );
      
      // Add items to cart for checkout testing
      await actions.observableClick('[data-test="add-to-cart-sauce-labs-backpack"]', 'Add backpack to cart');
      await actions.observableClick('[data-test="add-to-cart-sauce-labs-bike-light"]', 'Add bike light to cart');
      
      await actions.observableExpect(
        () => expect(page.locator('.shopping_cart_badge')).toHaveText('2'),
        'Verify 2 items in cart'
      );
    });

    await actions.step('Navigate to checkout and test form validation', async () => {
      await actions.observableClick('.shopping_cart_link', 'Navigate to cart');
      await actions.observableClick('[data-test="checkout"]', 'Proceed to checkout');
      
      await actions.observableExpect(
        () => expect(page).toHaveURL(/.*checkout-step-one.html/),
        'Verify checkout form page'
      );
    });

    await actions.step('Test checkout with missing first name', async () => {
      // Leave first name empty, fill other fields
      await actions.observableFill('[data-test="lastName"]', 'TestUser', 'Enter last name only');
      await actions.observableFill('[data-test="postalCode"]', '12345', 'Enter postal code only');
      await actions.observableClick('[data-test="continue"]', 'Attempt continue with missing first name');
      
      await actions.observableExpect(
        () => expect(page.locator('[data-test="error"]')).toBeVisible(),
        'Verify error appears for missing first name'
      );
      await actions.observableExpect(
        () => expect(page.locator('[data-test="error"]')).toHaveText('Error: First Name is required'),
        'Verify first name required error'
      );
      await actions.observableExpect(
        () => expect(page).toHaveURL(/.*checkout-step-one.html/),
        'Verify remains on checkout form'
      );
    });

    await actions.step('Test checkout with missing last name', async () => {
      await actions.observableClick('[data-test="error-button"]', 'Dismiss first name error');
      
      await actions.observableFill('[data-test="firstName"]', 'Test', 'Enter first name');
      await actions.observableFill('[data-test="lastName"]', '', 'Clear last name');
      await actions.observableClick('[data-test="continue"]', 'Attempt continue with missing last name');
      
      await actions.observableExpect(
        () => expect(page.locator('[data-test="error"]')).toBeVisible(),
        'Verify error for missing last name'
      );
      await actions.observableExpect(
        () => expect(page.locator('[data-test="error"]')).toHaveText('Error: Last Name is required'),
        'Verify last name required error'
      );
    });

    await actions.step('Test checkout with missing postal code', async () => {
      await actions.observableClick('[data-test="error-button"]', 'Dismiss last name error');
      
      await actions.observableFill('[data-test="lastName"]', 'User', 'Enter last name');
      await actions.observableFill('[data-test="postalCode"]', '', 'Clear postal code');
      await actions.observableClick('[data-test="continue"]', 'Attempt continue with missing postal code');
      
      await actions.observableExpect(
        () => expect(page.locator('[data-test="error"]')).toBeVisible(),
        'Verify error for missing postal code'
      );
      await actions.observableExpect(
        () => expect(page.locator('[data-test="error"]')).toHaveText('Error: Postal Code is required'),
        'Verify postal code required error'
      );
    });

    await actions.step('Verify successful form completion after fixing errors', async () => {
      await actions.observableClick('[data-test="error-button"]', 'Dismiss postal code error');
      
      await actions.observableFill('[data-test="postalCode"]', '54321', 'Enter valid postal code');
      await actions.observableClick('[data-test="continue"]', 'Continue with complete form');
      
      await actions.observableExpect(
        () => expect(page).toHaveURL(/.*checkout-step-two.html/),
        'Verify successful navigation to order overview'
      );
    });
  });

  test('should handle cart operations and navigation restrictions for locked user', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await actions.step('Attempt unauthorized access to restricted pages', async () => {
      // Try to access inventory directly without login
      await actions.observableGoto('/inventory.html', 'Attempt direct access to inventory');
      await actions.observableExpect(
        () => expect(page).toHaveURL(/.*saucedemo.com\/?$/),
        'Verify redirect to login for unauthorized inventory access'
      );
      
      // Try to access cart directly
      await actions.observableGoto('/cart.html', 'Attempt direct access to cart');
      await actions.observableExpect(
        () => expect(page).toHaveURL(/.*saucedemo.com\/?$/),
        'Verify redirect to login for unauthorized cart access'
      );
      
      // Try to access checkout directly
      await actions.observableGoto('/checkout-step-one.html', 'Attempt direct access to checkout');
      await actions.observableExpect(
        () => expect(page).toHaveURL(/.*saucedemo.com\/?$/),
        'Verify redirect to login for unauthorized checkout access'
      );
    });

    await actions.step('Test cart operations with problem user', async () => {
      // Navigate back to login page
      await actions.observableGoto('/', 'Return to login page');
      
      // Login with problem user (has functional issues)
      await actions.observableFill('#user-name', 'problem_user', 'Login with problem user');
      await actions.observableFill('#password', 'secret_sauce', 'Enter password');
      await actions.observableClick('#login-button', 'Complete problem user login');
      
      await actions.observableExpect(
        () => expect(page).toHaveURL(/.*inventory.html/),
        'Verify problem user can login'
      );
    });

    await actions.step('Test cart functionality with problem user', async () => {
      // Add items to cart (should work despite being problem user)
      await actions.observableClick('[data-test="add-to-cart-sauce-labs-backpack"]', 'Add backpack with problem user');
      await actions.observableExpect(
        () => expect(page.locator('.shopping_cart_badge')).toHaveText('1'),
        'Verify problem user can add items to cart'
      );
      
      // Navigate to cart
      await actions.observableClick('.shopping_cart_link', 'Navigate to cart with problem user');
      await actions.observableExpect(
        () => expect(page).toHaveURL(/.*cart.html/),
        'Verify problem user can access cart'
      );
      
      // Verify item is in cart
      await actions.observableExpect(
        () => expect(page.locator('[data-test="inventory-item-name"]')).toHaveText('Sauce Labs Backpack'),
        'Verify backpack is in problem user cart'
      );
    });

    await actions.step('Test remove functionality and empty cart state', async () => {
      // Remove item from cart
      await actions.observableClick('[data-test="remove-sauce-labs-backpack"]', 'Remove backpack from cart');
      
      // Verify cart is empty
      await actions.observableExpect(
        () => expect(page.locator('.cart_item')).toHaveCount(0),
        'Verify cart is empty after removal'
      );
      await actions.observableExpect(
        () => expect(page.locator('.shopping_cart_badge')).not.toBeVisible(),
        'Verify cart badge disappears when empty'
      );
      
      // Try to proceed to checkout with empty cart
      await actions.observableClick('[data-test="checkout"]', 'Attempt checkout with empty cart');
      
      // Should still proceed (Sauce Demo allows empty cart checkout)
      await actions.observableExpect(
        () => expect(page).toHaveURL(/.*checkout-step-one.html/),
        'Verify empty cart checkout behavior'
      );
    });

    await actions.step('Test navigation back to inventory and logout', async () => {
      // Navigate back to inventory
      await actions.observableClick('[data-test="cancel"]', 'Cancel checkout and return');
      await actions.observableExpect(
        () => expect(page).toHaveURL(/.*cart.html/),
        'Verify return to cart page'
      );
      
      await actions.observableClick('[data-test="continue-shopping"]', 'Continue shopping from empty cart');
      await actions.observableExpect(
        () => expect(page).toHaveURL(/.*inventory.html/),
        'Verify return to inventory'
      );
      
      // Test logout functionality
      await actions.observableClick('#react-burger-menu-btn', 'Open hamburger menu');
      await actions.observableClick('#logout_sidebar_link', 'Click logout');
      
      await actions.observableExpect(
        () => expect(page).toHaveURL(/.*saucedemo.com\/?$/),
        'Verify successful logout to login page'
      );
    });
  });
});