import { test, expect } from '@playwright/test';

test.describe('Product Sorting Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
    await expect(page).toHaveURL(/.*inventory.html/);
  });

  test('should sort products by name A to Z', async ({ page }) => {
    // Select Name (A to Z) sorting
    await page.selectOption('.product_sort_container', 'az');

    // Get all product names
    const productNames = await page.locator('.inventory_item_name').allTextContents();

    // Verify they are sorted alphabetically A-Z
    const sortedNames = [...productNames].sort();
    expect(productNames).toEqual(sortedNames);

    // Verify specific order (first few items)
    await expect(page.locator('.inventory_item_name').first()).toHaveText('Sauce Labs Backpack');
  });

  test('should sort products by name Z to A', async ({ page }) => {
    // Select Name (Z to A) sorting
    await page.selectOption('.product_sort_container', 'za');

    // Get all product names
    const productNames = await page.locator('.inventory_item_name').allTextContents();

    // Verify they are sorted alphabetically Z-A
    const sortedNames = [...productNames].sort().reverse();
    expect(productNames).toEqual(sortedNames);

    // Verify specific order (first item should be last alphabetically)
    await expect(page.locator('.inventory_item_name').first()).toHaveText('Test.allTheThings() T-Shirt (Red)');
  });

  test('should sort products by price low to high', async ({ page }) => {
    // Select Price (low to high) sorting
    await page.selectOption('.product_sort_container', 'lohi');

    // Get all product prices and convert to numbers
    const priceTexts = await page.locator('.inventory_item_price').allTextContents();
    const prices = priceTexts.map(price => parseFloat(price.replace('$', '')));

    // Verify they are sorted by price ascending
    const sortedPrices = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sortedPrices);

    // Verify first item has lowest price
    await expect(page.locator('.inventory_item_price').first()).toHaveText('$7.99');
    await expect(page.locator('.inventory_item_name').first()).toHaveText('Sauce Labs Onesie');
  });

  test('should sort products by price high to low', async ({ page }) => {
    // Select Price (high to low) sorting
    await page.selectOption('.product_sort_container', 'hilo');

    // Get all product prices and convert to numbers
    const priceTexts = await page.locator('.inventory_item_price').allTextContents();
    const prices = priceTexts.map(price => parseFloat(price.replace('$', '')));

    // Verify they are sorted by price descending
    const sortedPrices = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(sortedPrices);

    // Verify first item has highest price
    await expect(page.locator('.inventory_item_price').first()).toHaveText('$49.99');
    await expect(page.locator('.inventory_item_name').first()).toHaveText('Sauce Labs Fleece Jacket');
  });

  test('should maintain sorting when adding items to cart', async ({ page }) => {
    // Sort by price low to high
    await page.selectOption('.product_sort_container', 'lohi');

    // Add item to cart
    await page.click('[data-test="add-to-cart-sauce-labs-onesie"]');

    // Verify cart badge shows 1
    await expect(page.locator('.shopping_cart_badge')).toHaveText('1');

    // Verify sorting dropdown still shows correct selection
    await expect(page.locator('.product_sort_container')).toHaveValue('lohi');
  });

  test('should display all 6 products regardless of sorting', async ({ page }) => {
    const sortOptions = ['az', 'za', 'lohi', 'hilo'];

    for (const option of sortOptions) {
      // Select sorting option
      await page.selectOption('.product_sort_container', option);

      // Verify 6 products are displayed
      const products = page.locator('.inventory_item');
      await expect(products).toHaveCount(6);

      // Verify all expected products are present (check by data-test attributes)
      const expectedProducts = [
        'sauce-labs-backpack',
        'sauce-labs-bike-light',
        'sauce-labs-bolt-t-shirt',
        'sauce-labs-fleece-jacket',
        'sauce-labs-onesie',
        'test.allthethings()-t-shirt-(red)'
      ];

      for (const product of expectedProducts) {
        await expect(page.locator(`[data-test="add-to-cart-${product}"]`)).toBeVisible();
      }
    }
  });
});
