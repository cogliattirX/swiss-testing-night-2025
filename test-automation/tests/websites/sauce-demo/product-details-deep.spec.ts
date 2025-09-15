import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

/**
 * Enhanced Product Details Testing Suite
 * 
 * As a Test Implementation Engineer, this suite provides comprehensive
 * product catalog and detail page testing beyond basic functionality.
 */

test.describe('Product Details Deep Testing', () => {
  test.beforeEach(async ({ page }) => {
    const actions = createObservableActions(page);
    await actions.observableGoto('https://www.saucedemo.com', 'Navigate to Sauce Demo');
    await actions.observableFill('#user-name', 'standard_user', 'Enter username');
    await actions.observableFill('#password', 'secret_sauce', 'Enter password');
    await actions.observableClick('#login-button', 'Login to application');
    await actions.observableWait('.inventory_list', 'Wait for product inventory');
  });

  test('should display all product information correctly', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Verify Product Grid Layout', async () => {
      // Check that all 6 products are displayed
      const productItems = page.locator('.inventory_item');
      await actions.observableExpect(async () => {
        await expect(productItems).toHaveCount(6);
      }, 'Verify exactly 6 products are displayed');

      // Verify each product has required elements
      for (let i = 0; i < 6; i++) {
        const product = productItems.nth(i);
        
        await actions.observableExpect(async () => {
          await expect(product.locator('.inventory_item_img')).toBeVisible();
        }, `Product ${i + 1}: Verify image is visible`);
        
        await actions.observableExpect(async () => {
          await expect(product.locator('.inventory_item_name')).toBeVisible();
        }, `Product ${i + 1}: Verify name is visible`);
        
        await actions.observableExpect(async () => {
          await expect(product.locator('.inventory_item_desc')).toBeVisible();
        }, `Product ${i + 1}: Verify description is visible`);
        
        await actions.observableExpect(async () => {
          await expect(product.locator('.inventory_item_price')).toBeVisible();
        }, `Product ${i + 1}: Verify price is visible`);
        
        await actions.observableExpect(async () => {
          await expect(product.locator('button[id*="add-to-cart"]')).toBeVisible();
        }, `Product ${i + 1}: Verify add to cart button is visible`);
      }
    });

    await test.step('Verify Product Data Consistency', async () => {
      // Get all product names and verify they are unique
      const productNames = await page.locator('.inventory_item_name').allTextContents();
      const uniqueNames = [...new Set(productNames)];
      
      expect(uniqueNames.length).toBe(6);
      console.log(`✅ All 6 products have unique names: ${productNames.join(', ')}`);
      
      // Verify all prices are properly formatted
      const prices = await page.locator('.inventory_item_price').allTextContents();
      prices.forEach((price, index) => {
        expect(price).toMatch(/^\$\d+\.\d{2}$/);
        console.log(`✅ Product ${index + 1} price properly formatted: ${price}`);
      });
    });

    await test.step('Test Product Image Loading', async () => {
      const productImages = page.locator('.inventory_item_img img');
      
      for (let i = 0; i < 6; i++) {
        const img = productImages.nth(i);
        
        // Check image has src attribute
        await actions.observableExpect(async () => {
          await expect(img).toHaveAttribute('src');
        }, `Product ${i + 1}: Verify image has src attribute`);
        
        // Check image has alt text for accessibility
        await actions.observableExpect(async () => {
          await expect(img).toHaveAttribute('alt');
        }, `Product ${i + 1}: Verify image has alt text`);
        
        // Verify image loads by checking natural dimensions
        const isLoaded = await img.evaluate((img: HTMLImageElement) => {
          return img.naturalWidth > 0 && img.naturalHeight > 0;
        });
        
        expect(isLoaded).toBeTruthy();
        console.log(`✅ Product ${i + 1} image loaded successfully`);
      }
    });
  });

  test('should handle product interaction patterns', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Test Add to Cart for All Products', async () => {
      const productItems = page.locator('.inventory_item');
      
      for (let i = 0; i < 6; i++) {
        const addButton = productItems.nth(i).locator('button[id*="add-to-cart"]');
        const productName = await productItems.nth(i).locator('.inventory_item_name').textContent();
        const productSlug = productName?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        await actions.observableClick(`[data-test="add-to-cart-${productSlug}"]`, `Add product ${i + 1} to cart`);
        
        // Verify button changes to "Remove"
        await actions.observableExpect(async () => {
          await expect(addButton).toContainText('Remove');
        }, `Product ${i + 1}: Verify button changes to Remove`);
        
        // Verify cart badge updates
        await actions.observableExpect(async () => {
          await expect(page.locator('.shopping_cart_badge')).toHaveText(`${i + 1}`);
        }, `Verify cart badge shows ${i + 1} items`);
      }
      
      await actions.screenshot('all-products-added', 'All products added to cart state');
    });

    await test.step('Test Remove from Cart for All Products', async () => {
      const productItems = page.locator('.inventory_item');
      
      for (let i = 0; i < 6; i++) {
        const productName = await productItems.nth(i).locator('.inventory_item_name').textContent();
        const productSlug = productName?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        await actions.observableClick(`[data-test="remove-${productSlug}"]`, `Remove product ${i + 1} from cart`);
        
        // Verify button changes back to "Add to cart"
        const addButton = productItems.nth(i).locator('button[id*="add-to-cart"]');
        await actions.observableExpect(async () => {
          await expect(addButton).toContainText('Add to cart');
        }, `Product ${i + 1}: Verify button changes back to Add to cart`);
        
        // Verify cart badge updates (or disappears when empty)
        if (i < 5) {
          await actions.observableExpect(async () => {
            await expect(page.locator('.shopping_cart_badge')).toHaveText(`${5 - i}`);
          }, `Verify cart badge shows ${5 - i} items`);
        } else {
          await actions.observableExpect(async () => {
            await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
          }, 'Verify cart badge disappears when empty');
        }
      }
    });
  });

  test('should validate product sorting maintains data integrity', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Collect Product Data in Default Order', async () => {
      const defaultProducts = await page.locator('.inventory_item').evaluateAll(items => {
        return items.map(item => ({
          name: item.querySelector('.inventory_item_name')?.textContent || '',
          price: item.querySelector('.inventory_item_price')?.textContent || '',
          description: item.querySelector('.inventory_item_desc')?.textContent || ''
        }));
      });
      
      console.log('Default product order:', defaultProducts.map(p => p.name));
      
      await test.step('Test Name A-Z Sorting', async () => {
        await actions.observableClick('.product_sort_container', 'Open sort dropdown');
        await actions.observableClick('option[value="az"]', 'Select Name A-Z sorting');
        
        const sortedProducts = await page.locator('.inventory_item').evaluateAll(items => {
          return items.map(item => ({
            name: item.querySelector('.inventory_item_name')?.textContent || '',
            price: item.querySelector('.inventory_item_price')?.textContent || '',
            description: item.querySelector('.inventory_item_desc')?.textContent || ''
          }));
        });
        
        // Verify data integrity after sorting
        expect(sortedProducts.length).toBe(defaultProducts.length);
        
        // Verify all original products are still present
        defaultProducts.forEach(originalProduct => {
          const found = sortedProducts.find(p => 
            p.name === originalProduct.name && 
            p.price === originalProduct.price && 
            p.description === originalProduct.description
          );
          expect(found).toBeTruthy();
        });
        
        // Verify names are in alphabetical order
        const names = sortedProducts.map(p => p.name);
        const sortedNames = [...names].sort();
        expect(names).toEqual(sortedNames);
        
        console.log('✅ Name A-Z sorting maintains data integrity');
      });
    });
  });

  test('should handle accessibility requirements for products', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Verify Keyboard Navigation', async () => {
      // Test tab navigation through products
      await page.keyboard.press('Tab'); // Skip to first interactive element
      
      for (let i = 0; i < 6; i++) {
        // Navigate to each add to cart button
        const focusedElement = await page.evaluateHandle(() => document.activeElement);
        const tagName = await focusedElement.evaluate(el => el?.tagName);
        
        if (tagName === 'BUTTON') {
          // Press Enter to activate button
          await page.keyboard.press('Enter');
          
          // Verify action worked
          await actions.observableExpect(async () => {
            await expect(page.locator('.shopping_cart_badge')).toBeVisible();
          }, `Keyboard interaction ${i + 1}: Verify product added to cart`);
          
          // Press Tab to move to next button
          await page.keyboard.press('Tab');
        }
      }
      
      console.log('✅ Keyboard navigation works for all product buttons');
    });

    await test.step('Verify Screen Reader Support', async () => {
      const productItems = page.locator('.inventory_item');
      
      for (let i = 0; i < 6; i++) {
        const product = productItems.nth(i);
        
        // Check for proper ARIA labels or text content
        const button = product.locator('button[id*="add-to-cart"], button[id*="remove"]');
        const buttonText = await button.textContent();
        
        expect(buttonText).toBeTruthy();
        expect(buttonText?.trim().length).toBeGreaterThan(0);
        
        // Verify button has accessible name
        const accessibleName = await button.evaluate(btn => {
          return btn.getAttribute('aria-label') || btn.textContent?.trim() || '';
        });
        
        expect(accessibleName.length).toBeGreaterThan(0);
        console.log(`✅ Product ${i + 1} button has accessible name: "${accessibleName}"`);
      }
    });
  });

  test('should handle edge cases and error conditions', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Test Rapid Button Interactions', async () => {
      const firstProduct = page.locator('.inventory_item').first();
      const addButton = firstProduct.locator('button[id*="add-to-cart"]');
      
      // Rapidly click add/remove buttons
      for (let i = 0; i < 5; i++) {
        await addButton.click();
        await page.waitForTimeout(100);
        await addButton.click();
        await page.waitForTimeout(100);
      }
      
      // Verify final state is consistent
      const finalButtonText = await addButton.textContent();
      const cartBadge = page.locator('.shopping_cart_badge');
      
      if (finalButtonText?.includes('Remove')) {
        await actions.observableExpect(async () => {
          await expect(cartBadge).toHaveText('1');
        }, 'Rapid clicks: Verify consistent cart state when item added');
      } else {
        await actions.observableExpect(async () => {
          await expect(cartBadge).not.toBeVisible();
        }, 'Rapid clicks: Verify consistent cart state when item removed');
      }
      
      console.log('✅ Rapid button interactions handle correctly');
    });

    await test.step('Test Product State Persistence Across Navigation', async () => {
      // Add some products to cart
      await actions.observableClick('[data-test="add-to-cart-sauce-labs-backpack"]', 'Add backpack to cart');
      await actions.observableClick('[data-test="add-to-cart-sauce-labs-bike-light"]', 'Add bike light to cart');
      
      // Navigate away and back
      await actions.observableClick('#react-burger-menu-btn', 'Open menu');
      await actions.observableClick('#about_sidebar_link', 'Navigate to About page');
      await page.goBack();
      
      // Verify products are still in cart
      await actions.observableExpect(async () => {
        await expect(page.locator('.shopping_cart_badge')).toHaveText('2');
      }, 'Verify cart state persists after navigation');
      
      // Verify correct buttons show "Remove"
      await actions.observableExpect(async () => {
        await expect(page.locator('[data-test="remove-sauce-labs-backpack"]')).toBeVisible();
      }, 'Verify backpack shows Remove button after navigation');
      
      await actions.observableExpect(async () => {
        await expect(page.locator('[data-test="remove-sauce-labs-bike-light"]')).toBeVisible();
      }, 'Verify bike light shows Remove button after navigation');
      
      console.log('✅ Product states persist correctly across navigation');
    });
  });
});
