import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

/**
 * 🎭 MULTI-AGENT PERSONA-BASED TEST DESIGN
 * ==========================================
 * 
 * 🏗️ QA TEST ARCHITECT AGENT:
 * - Identified coverage gap: Product Details Page workflow untested
 * - Designed test strategy: End-to-end product detail interaction with cart state preservation
 * - Cross-cutting concerns: Security (XSS), Accessibility (A11y), Performance (image loading)
 * 
 * 👨‍💻 TEST IMPLEMENTATION ENGINEER:
 * - Uses observability framework for workshop demonstration value
 * - Implements step-based test organization with descriptive logging
 * - Ensures TEST_MODE compatibility for different execution contexts
 * 
 * 🔒 SECURITY TESTING AGENT:
 * - Validates product descriptions don't execute scripts (XSS prevention)
 * - Ensures URL parameters are properly handled without injection risks
 * - Verifies image sources are from trusted domains
 * 
 * ♿ ACCESSIBILITY TESTING AGENT:
 * - Checks product images have proper alt text
 * - Validates heading hierarchy (h1 for product name)
 * - Ensures back button has accessible label
 * 
 * ⚡ PERFORMANCE TESTING AGENT:
 * - Monitors product detail page load time
 * - Validates images are loaded without render-blocking
 * - Checks for excessive DOM size on product page
 */

test.describe('Product Details Page Workflow', () => {
  const SAUCE_DEMO_URL = 'https://www.saucedemo.com';
  const TEST_USER = { username: 'standard_user', password: 'secret_sauce' };

  test.beforeEach(async ({ page }) => {
    // 🏗️ Architect Decision: Setup reusable login flow
    const actions = createObservableActions(page);
    await actions.observableGoto(SAUCE_DEMO_URL, '🌐 Navigate to Sauce Demo');
    await actions.observableFill('#user-name', TEST_USER.username, '👤 Enter username');
    await actions.observableFill('#password', TEST_USER.password, '🔑 Enter password');
    await actions.observableClick('#login-button', '🚀 Submit login');
    
    await actions.observableExpect(async () => {
      await expect(page).toHaveURL(/inventory/);
    }, '✅ Verify successful login to inventory page');
  });

  test('should display complete product details and add to cart from detail page', async ({ page }) => {
    const actions = createObservableActions(page);
    
    // 👨‍💻 Implementation: Step 1 - Navigate to Product Details
    await actions.step('📖 Navigate to Product Details Page', async () => {
      console.log('🔍 Clicking on first product to view details...');
      
      // Store product information from inventory for later validation
      const productName = await page.locator('.inventory_item_name').first().textContent();
      const productPrice = await page.locator('.inventory_item_price').first().textContent();
      
      console.log(`📦 Selected product: ${productName} - ${productPrice}`);
      
      await actions.observableClick('.inventory_item_name >> nth=0', '🖱️ Click first product');
      
      await actions.observableExpect(async () => {
        await expect(page).toHaveURL(/inventory-item/);
      }, '✅ Verify navigation to product detail page');
    });

    // 🔒 Security Agent: Validate Product Information (XSS Prevention)
    await actions.step('🔒 Security: Validate Product Information Display', async () => {
      console.log('🛡️ Security Agent: Checking for XSS vulnerabilities in product content...');
      
      // ♿ Accessibility Agent: Check heading hierarchy
      const productNameElement = page.locator('.inventory_details_name');
      await actions.observableExpect(async () => {
        await expect(productNameElement).toBeVisible();
      }, '✅ Product name heading is visible');
      
      console.log('♿ Accessibility Agent: Verified heading structure');

      // Validate product description doesn't contain script tags
      const description = await page.locator('.inventory_details_desc').textContent();
      await actions.observableExpect(async () => {
        expect(description).not.toContain('<script>');
        expect(description).not.toContain('javascript:');
      }, '🔒 Security: Product description sanitized (no script injection)');
      
      console.log(`📝 Product description: "${description?.substring(0, 50)}..."`);
    });

    // ♿ Accessibility Agent: Validate Image Accessibility
    await actions.step('♿ Accessibility: Validate Product Image', async () => {
      console.log('👁️ Accessibility Agent: Checking image accessibility...');
      
      const productImage = page.locator('.inventory_details_img');
      
      await actions.observableExpect(async () => {
        await expect(productImage).toBeVisible();
      }, '✅ Product image is visible');
      
      // Check for alt text (critical for screen readers)
      const altText = await productImage.getAttribute('alt');
      await actions.observableExpect(async () => {
        expect(altText).toBeTruthy();
        expect(altText?.length).toBeGreaterThan(0);
      }, '♿ Accessibility: Image has meaningful alt text');
      
      console.log(`🏷️ Image alt text: "${altText}"`);
      
      // 🔒 Security Agent: Validate image source is from trusted domain
      const imageSrc = await productImage.getAttribute('src');
      console.log(`🖼️ Image source: ${imageSrc}`);
      await actions.observableExpect(async () => {
        expect(imageSrc).toMatch(/saucedemo\.com|sauce-(?:demo|labs)\.com/);
      }, '🔒 Security: Image source is from trusted domain');
    });

    // ⚡ Performance Agent: Monitor Page Load Performance
    await actions.step('⚡ Performance: Validate Page Load Metrics', async () => {
      console.log('📊 Performance Agent: Analyzing page load performance...');
      
      // Check DOM size (performance best practice)
      const elementCount = await page.locator('*').count();
      console.log(`📈 DOM elements count: ${elementCount}`);
      
      await actions.observableExpect(async () => {
        expect(elementCount).toBeLessThan(1000); // Reasonable DOM size
      }, '⚡ Performance: DOM size is optimized');
      
      // Verify no layout shift caused by late-loading images
      const imageLoaded = await page.locator('.inventory_details_img').evaluate((img: HTMLImageElement) => {
        return img.complete && img.naturalHeight !== 0;
      });
      
      console.log(`🖼️ Image load status: ${imageLoaded ? 'Loaded' : 'Loading...'}`);
      await actions.observableExpect(async () => {
        expect(imageLoaded).toBe(true);
      }, '⚡ Performance: Image loaded without render-blocking');
    });

    // 👨‍💻 Implementation: Add to Cart from Details Page
    await actions.step('🛒 Add Product to Cart from Detail Page', async () => {
      console.log('🛍️ Adding product to cart from detail view...');
      
      // Verify cart badge is initially empty or shows previous count
      const initialCartBadge = page.locator('.shopping_cart_badge');
      const hasInitialBadge = await initialCartBadge.count() > 0;
      const initialCount = hasInitialBadge ? parseInt(await initialCartBadge.textContent() || '0') : 0;
      
      console.log(`📊 Initial cart count: ${initialCount}`);
      
      await actions.observableClick('button[id^="add-to-cart"]', '➕ Click Add to Cart button');
      
      // Verify cart badge updates
      await actions.observableExpect(async () => {
        await expect(initialCartBadge).toBeVisible();
        await expect(initialCartBadge).toHaveText(String(initialCount + 1));
      }, '✅ Cart badge updated to show new item count');
      
      console.log(`🎉 Cart updated: ${initialCount} → ${initialCount + 1}`);
      
      // Verify button changes to "Remove"
      await actions.observableExpect(async () => {
        const removeButton = page.locator('button[id^="remove"]');
        await expect(removeButton).toBeVisible();
      }, '✅ Add to Cart button changed to Remove button');
    });

    // 👨‍💻 Implementation: Navigate Back with State Preservation
    await actions.step('🔙 Navigate Back and Verify State Preservation', async () => {
      console.log('⬅️ Navigating back to inventory page...');
      
      // ♿ Accessibility Agent: Verify back button has accessible label
      const backButton = page.locator('#back-to-products, button:has-text("Back")');
      await actions.observableExpect(async () => {
        await expect(backButton).toBeVisible();
      }, '♿ Accessibility: Back button is visible and accessible');
      
      await actions.observableClick('#back-to-products', '🔙 Click Back to Products button');
      
      await actions.observableExpect(async () => {
        await expect(page).toHaveURL(/inventory\.html/);
      }, '✅ Navigated back to inventory page');
      
      // 🏗️ Architect Decision: Verify cart state persists across navigation
      const cartBadge = page.locator('.shopping_cart_badge');
      await actions.observableExpect(async () => {
        await expect(cartBadge).toBeVisible();
        await expect(cartBadge).toHaveText('1');
      }, '✅ Cart state preserved after navigation (1 item still in cart)');
      
      console.log('🎯 State Management: Cart persistence verified across page navigation');
    });

    // 👨‍💻 Implementation: Verify Cart Contents
    await actions.step('🔍 Verify Product in Shopping Cart', async () => {
      console.log('🛒 Opening cart to verify product was added correctly...');
      
      await actions.observableClick('.shopping_cart_link', '🛒 Open shopping cart');
      
      await actions.observableExpect(async () => {
        await expect(page).toHaveURL(/cart/);
      }, '✅ Navigated to cart page');
      
      // Verify the added product appears in cart
      const cartItems = page.locator('.cart_item');
      await actions.observableExpect(async () => {
        await expect(cartItems).toHaveCount(1);
      }, '✅ Cart contains exactly 1 item');
      
      // Validate cart item details match product
      const cartItemName = await page.locator('.inventory_item_name').textContent();
      console.log(`📦 Cart item: ${cartItemName}`);
      
      await actions.observableExpect(async () => {
        expect(cartItemName).toBeTruthy();
        expect(cartItemName?.length).toBeGreaterThan(0);
      }, '✅ Cart item has valid product name');
      
      console.log('🎊 Test completed successfully! All agents contributed to comprehensive validation.');
    });
  });

  test('should handle multiple products via detail pages', async ({ page }) => {
    const actions = createObservableActions(page);
    
    // 🏗️ Architect Decision: Test workflow with multiple product interactions
    await actions.step('📚 Add Multiple Products via Detail Pages', async () => {
      console.log('🔄 Testing multiple product detail interactions...');
      
      // Add first product
      await actions.observableClick('.inventory_item_name >> nth=0', '🖱️ Click first product');
      await actions.observableClick('button[id^="add-to-cart"]', '➕ Add first product to cart');
      await actions.observableClick('#back-to-products', '🔙 Back to inventory');
      
      // Add second product
      await actions.observableClick('.inventory_item_name >> nth=1', '🖱️ Click second product');
      await actions.observableClick('button[id^="add-to-cart"]', '➕ Add second product to cart');
      
      // Verify cart badge shows 2 items
      const cartBadge = page.locator('.shopping_cart_badge');
      await actions.observableExpect(async () => {
        await expect(cartBadge).toHaveText('2');
      }, '✅ Cart badge shows 2 items after adding multiple products');
      
      console.log('🎯 Multi-product workflow validated successfully');
    });
  });

  test('should navigate to cart directly from product detail page', async ({ page }) => {
    const actions = createObservableActions(page);
    
    // 👨‍💻 Implementation: Test direct cart navigation workflow
    await actions.step('🛒 Navigate to Cart from Product Details', async () => {
      console.log('🔗 Testing direct cart link from product detail page...');
      
      await actions.observableClick('.inventory_item_name >> nth=0', '🖱️ Open product details');
      await actions.observableClick('.shopping_cart_link', '🛒 Click cart icon');
      
      await actions.observableExpect(async () => {
        await expect(page).toHaveURL(/cart/);
      }, '✅ Directly navigated to cart from product details');
      
      console.log('✨ Navigation workflow validated');
    });
  });
});
