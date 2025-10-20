// My Demo App - Simplified E2E Test (Crash-Resistant Version)
// Based on recorded session but with better stability

describe('My Demo App - Stable E2E Shopping Journey', () => {
    
    it('should complete basic shopping flow with proper waits', async () => {
        console.log('🚀 Starting Stable E2E Shopping Journey Test...');
        
        // STEP 1: Wait for app to fully load
        console.log('📱 Step 1: Waiting for app to load...');
        await browser.pause(5000); // Longer initial wait
        
        // Verify main screen is loaded
        const productsTitle = await $('//android.widget.TextView[@text="Products"]');
        await productsTitle.waitForDisplayed({ timeout: 10000 });
        console.log('✅ Products screen loaded');
        
        // STEP 2: Select first product with better targeting
        console.log('📱 Step 2: Selecting product...');
        
        // Use the specific Sauce Labs Backpack title instead of generic image
        const backpackTitle = await $('//android.widget.TextView[@text="Sauce Labs Backpack"]');
        await backpackTitle.waitForDisplayed({ timeout: 10000 });
        await browser.pause(1000);
        await backpackTitle.click();
        await browser.pause(3000);
        
        console.log('✅ Product selected');
        
        // STEP 3: Verify product details page
        console.log('📱 Step 3: Verifying product details...');
        
        // Wait for product details to load
        const productDetailsTitle = await $('//android.widget.TextView[@text="Sauce Labs Backpack"]');
        await productDetailsTitle.waitForDisplayed({ timeout: 10000 });
        
        const productPrice = await $('//android.widget.TextView[@text="$ 29.99"]');
        await productPrice.waitForDisplayed({ timeout: 5000 });
        
        console.log('✅ Product details verified');
        
        // STEP 4: Add to cart
        console.log('📱 Step 4: Adding to cart...');
        
        const addToCartBtn = await $('//android.widget.Button[@resource-id="com.saucelabs.mydemoapp.android:id/cartBt"]');
        await addToCartBtn.waitForDisplayed({ timeout: 10000 });
        await browser.pause(1000);
        await addToCartBtn.click();
        await browser.pause(3000);
        
        console.log('✅ Added to cart');
        
        // STEP 5: Go to cart
        console.log('📱 Step 5: Opening cart...');
        
        const cartIcon = await $('//android.widget.RelativeLayout[@content-desc="View cart"]');
        await cartIcon.waitForDisplayed({ timeout: 10000 });
        await browser.pause(1000);
        await cartIcon.click();
        await browser.pause(3000);
        
        // Verify cart screen
        const cartTitle = await $('//android.widget.TextView[@text="My Cart"]');
        await cartTitle.waitForDisplayed({ timeout: 10000 });
        
        console.log('✅ Cart opened and verified');
        
        console.log('🎉 Basic E2E flow completed successfully!');
        console.log('📊 Test completed without crashes - ready for full automation');
        
    });
});