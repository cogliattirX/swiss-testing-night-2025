import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

/**
 * E2E Test: Purchase Bike Light for Nina Schweigert
 * 
 * This test demonstrates a complete end-to-end e-commerce purchase flow:
 * - Login to Sauce Demo
 * - Find and select Sauce Labs Bike Light
 * - Complete checkout process with Swiss customer details
 * - Verify successful order completion
 * 
 * Customer Details:
 * - Name: Nina Schweigert
 * - Address: 8802 Kilchberg (Switzerland)
 */

test.describe('E2E Purchase Flow: Bike Light for Nina Schweigert', () => {
  
  test('Complete purchase of Sauce Labs Bike Light', async ({ page }) => {
    const actions = createObservableActions(page);
    
    console.log(`\n🛍️ Starting E2E Purchase Test for Nina Schweigert`);
    console.log(`═══════════════════════════════════════════════════════════`);
    console.log(`🎯 Goal: Purchase Sauce Labs Bike Light`);
    console.log(`📍 Delivery: 8802 Kilchberg, Switzerland`);
    console.log(`═══════════════════════════════════════════════════════════\n`);
    
    await test.step('🔐 Login to Sauce Demo', async () => {
      await actions.observableGoto('https://www.saucedemo.com/', 'Navigate to Sauce Demo login page');
      
      await actions.observableFill('#user-name', 'standard_user', 'Enter username');
      await actions.observableFill('#password', 'secret_sauce', 'Enter password');
      await actions.observableClick('#login-button', 'Click login button');
      
      // Verify successful login
      await expect(page).toHaveURL(/.*inventory.html/);
      await expect(page.locator('.title')).toHaveText('Products');
      
      console.log(`✅ Successfully logged in as standard_user`);
    });
    
    await test.step('🚴‍♀️ Find and Select Bike Light', async () => {
      // Look for the bike light product
      const bikeLight = page.locator('[data-test="inventory-item"]').filter({ 
        hasText: 'Sauce Labs Bike Light' 
      });
      
      await expect(bikeLight).toBeVisible();
      console.log(`👀 Found Sauce Labs Bike Light product`);
      
      // Get product details for verification
      const productName = await bikeLight.locator('[data-test="inventory-item-name"]').textContent();
      const productPrice = await bikeLight.locator('[data-test="inventory-item-price"]').textContent();
      
      console.log(`📦 Product: ${productName}`);
      console.log(`💰 Price: ${productPrice}`);
      
      // Add to cart
      await actions.observableClick(
        '[data-test="add-to-cart-sauce-labs-bike-light"]', 
        'Add Sauce Labs Bike Light to cart'
      );
      
      // Verify cart badge shows 1 item
      await expect(page.locator('[data-test="shopping-cart-badge"]')).toHaveText('1');
      console.log(`✅ Bike Light added to cart successfully`);
    });
    
    await test.step('🛒 Review Cart Contents', async () => {
      await actions.observableClick('[data-test="shopping-cart-link"]', 'Open shopping cart');
      
      // Verify we're in the cart page
      await expect(page).toHaveURL(/.*cart.html/);
      await expect(page.locator('.title')).toHaveText('Your Cart');
      
      // Verify bike light is in cart
      const cartItem = page.locator('[data-test="inventory-item"]');
      await expect(cartItem.locator('[data-test="inventory-item-name"]')).toHaveText('Sauce Labs Bike Light');
      
      console.log(`✅ Verified Bike Light is in cart`);
      
      // Proceed to checkout
      await actions.observableClick('[data-test="checkout"]', 'Proceed to checkout');
    });
    
    await test.step('📋 Fill Checkout Information for Nina Schweigert', async () => {
      // Verify we're on checkout page
      await expect(page).toHaveURL(/.*checkout-step-one.html/);
      await expect(page.locator('.title')).toHaveText('Checkout: Your Information');
      
      console.log(`📝 Filling checkout form for Nina Schweigert`);
      
      // Fill customer information
      await actions.observableFill('[data-test="firstName"]', 'Nina', 'Enter first name: Nina');
      await actions.observableFill('[data-test="lastName"]', 'Schweigert', 'Enter last name: Schweigert');
      await actions.observableFill('[data-test="postalCode"]', '8802', 'Enter postal code: 8802 Kilchberg');
      
      console.log(`✅ Customer details entered for Nina Schweigert, 8802 Kilchberg`);
      
      // Continue to overview
      await actions.observableClick('[data-test="continue"]', 'Continue to order overview');
    });
    
    await test.step('📄 Review Order Overview', async () => {
      // Verify we're on overview page
      await expect(page).toHaveURL(/.*checkout-step-two.html/);
      await expect(page.locator('.title')).toHaveText('Checkout: Overview');
      
      // Verify order details
      const orderItem = page.locator('[data-test="inventory-item"]');
      await expect(orderItem.locator('[data-test="inventory-item-name"]')).toHaveText('Sauce Labs Bike Light');
      
      // Get order summary
      const itemTotal = await page.locator('[data-test="subtotal-label"]').textContent();
      const tax = await page.locator('[data-test="tax-label"]').textContent();
      const total = await page.locator('[data-test="total-label"]').textContent();
      
      console.log(`📊 Order Summary:`);
      console.log(`   ${itemTotal}`);
      console.log(`   ${tax}`);
      console.log(`   ${total}`);
      console.log(`📦 Product: Sauce Labs Bike Light`);
      console.log(`👤 Customer: Nina Schweigert`);
      console.log(`📍 Location: 8802 Kilchberg, Switzerland`);
      
      // Take screenshot of order overview
      await actions.screenshot('nina-bike-light-order-overview', 'Order overview for Nina Schweigert');
    });
    
    await test.step('✅ Complete Purchase', async () => {
      // Finish the order
      await actions.observableClick('[data-test="finish"]', 'Complete the purchase');
      
      // Verify successful completion
      await expect(page).toHaveURL(/.*checkout-complete.html/);
      await expect(page.locator('.title')).toHaveText('Checkout: Complete!');
      
      // Verify success message
      const successMessage = page.locator('[data-test="complete-header"]');
      await expect(successMessage).toHaveText('Thank you for your order!');
      
      const orderConfirmation = page.locator('[data-test="complete-text"]');
      await expect(orderConfirmation).toBeVisible();
      
      console.log(`🎉 ORDER COMPLETED SUCCESSFULLY!`);
      console.log(`✅ Sauce Labs Bike Light purchased for Nina Schweigert`);
      console.log(`📍 Delivery address: 8802 Kilchberg, Switzerland`);
      console.log(`📧 Order confirmation displayed`);
      
      // Take final screenshot
      await actions.screenshot('nina-bike-light-purchase-complete', 'Successful purchase completion');
    });
    
    await test.step('📊 Generate Purchase Report', async () => {
      console.log(`\n🎯 ═══════════════════════════════════════════════════════════`);
      console.log(`📋 E2E PURCHASE TEST SUMMARY`);
      console.log(`═══════════════════════════════════════════════════════════`);
      console.log(`✅ Test Status: PASSED`);
      console.log(`🛍️ Product: Sauce Labs Bike Light`);
      console.log(`👤 Customer: Nina Schweigert`);
      console.log(`📍 Address: 8802 Kilchberg, Switzerland`);
      console.log(`🕐 Completed: ${new Date().toLocaleString()}`);
      console.log(`═══════════════════════════════════════════════════════════`);
      console.log(`\n💡 Business Value Demonstrated:`);
      console.log(`   ✅ Complete e-commerce purchase flow validation`);
      console.log(`   ✅ Real customer data handling (Swiss address)`);
      console.log(`   ✅ Product selection and cart management`);
      console.log(`   ✅ Checkout process with form validation`);
      console.log(`   ✅ Order completion verification`);
      console.log(`\n🎓 Workshop Learning Points:`);
      console.log(`   • AI-generated realistic business scenarios`);
      console.log(`   • Complete E2E test automation`);
      console.log(`   • Observable test execution for education`);
      console.log(`   • Professional test reporting and evidence`);
      console.log(`═══════════════════════════════════════════════════════════\n`);
    });
  });
  
  test('Verify bike light product exists and is available', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('🔍 Quick Product Availability Check', async () => {
      await actions.observableGoto('https://www.saucedemo.com/', 'Check product availability');
      
      await actions.observableFill('#user-name', 'standard_user', 'Login to check inventory');
      await actions.observableFill('#password', 'secret_sauce', 'Enter password');
      await actions.observableClick('#login-button', 'Access product catalog');
      
      // Verify bike light is available
      const bikeLight = page.locator('[data-test="inventory-item"]').filter({ 
        hasText: 'Sauce Labs Bike Light' 
      });
      
      await expect(bikeLight).toBeVisible();
      
      const addToCartButton = page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]');
      await expect(addToCartButton).toBeVisible();
      await expect(addToCartButton).toHaveText('Add to cart');
      
      console.log(`✅ Sauce Labs Bike Light is available for purchase`);
      console.log(`🎯 Ready for Nina Schweigert's order`);
    });
  });
});