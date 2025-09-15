import { test, expect } from '@playwright/test';
import { createObservableActions, TestModes } from '../test-helpers/observability';

test.describe('Observable Demo Test', () => {
  test('Demonstrate observable test actions', async ({ page }) => {
    // Create observable actions wrapper
    const actions = createObservableActions(page);
    
    actions.logTestInfo(`Running in ${TestModes.getCurrentMode()} mode`);
    
    await actions.step('Navigate to Sauce Demo', async () => {
      await actions.observableGoto('https://www.saucedemo.com', 'Opening Sauce Demo website');
    });
    
    await actions.step('Login Process', async () => {
      await actions.observableFill('#user-name', 'standard_user', 'Enter username');
      await actions.observableFill('#password', 'secret_sauce', 'Enter password');
      await actions.observableClick('#login-button', 'Click login button');
    });
    
    await actions.step('Verify Login Success', async () => {
      await actions.observableWait('.inventory_list', 'Wait for products to load');
      
      await actions.observableExpect(async () => {
        await expect(page).toHaveURL(/inventory/);
      }, 'Verify URL contains inventory');
      
      await actions.observableExpect(async () => {
        await expect(page.locator('.title')).toHaveText('Products');
      }, 'Verify Products page title is visible');
    });
    
    await actions.step('Interactive Shopping Demo', async () => {
      // Add first product to cart
      await actions.observableClick('[data-test="add-to-cart-sauce-labs-backpack"]', 'Add Sauce Labs Backpack to cart');
      
      // Verify cart badge appears
      await actions.observableExpect(async () => {
        await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
      }, 'Verify cart shows 1 item');
      
      // Open cart
      await actions.observableClick('.shopping_cart_link', 'Open shopping cart');
      
      // Verify cart contents
      await actions.observableExpect(async () => {
        await expect(page.locator('.cart_item')).toBeVisible();
      }, 'Verify cart contains the added item');
    });
    
    if (TestModes.isObservableMode()) {
      await actions.screenshot('demo-final-state', 'Final state of the demo test');
    }
    
    actions.logTestInfo('Observable demo test completed successfully');
  });
});
