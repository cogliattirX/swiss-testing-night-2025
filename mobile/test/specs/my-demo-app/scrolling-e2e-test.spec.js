describe('My Demo App - E2E Shopping with Scrolling', () => {
    it('should complete shopping flow with proper scrolling', async () => {
        console.log('🚀 Starting E2E Shopping Journey with Scrolling...');
        
        // Step 1: Wait for app to load
        console.log('📱 Step 1: Waiting for app to load...');
        await $('//android.widget.TextView[@text="Products"]').waitForDisplayed({ timeout: 10000 });
        console.log('✅ Products screen loaded');
        await driver.pause(2000);
        
        // Step 2: Select product
        console.log('📱 Step 2: Selecting product...');
        const backpackProduct = await $('//android.widget.TextView[@text="Sauce Labs Backpack"]');
        await backpackProduct.waitForDisplayed({ timeout: 5000 });
        await driver.pause(1000);
        await backpackProduct.click();
        console.log('✅ Product selected');
        await driver.pause(3000);
        
        // Step 3: Verify product details are loaded
        console.log('📱 Step 3: Verifying product details...');
        await $('//android.widget.TextView[@text="Sauce Labs Backpack"]').waitForDisplayed({ timeout: 5000 });
        await $('//android.widget.TextView[@text="$ 29.99"]').waitForDisplayed({ timeout: 5000 });
        console.log('✅ Product details verified');
        await driver.pause(2000);
        
        // Step 4: Scroll to see Add to Cart button
        console.log('📱 Step 4: Scrolling to Add to Cart button...');
        // First try to find the button
        const cartButton = $('//android.widget.Button[@resource-id="com.saucelabs.mydemoapp.android:id/cartBt"]');
        
        // Scroll down to make the button visible
        await driver.execute('mobile: scroll', {
            direction: 'down'
        });
        await driver.pause(1000);
        
        // Try again
        await cartButton.waitForDisplayed({ timeout: 10000 });
        console.log('✅ Cart button is now visible');
        
        // Step 5: Add to cart
        console.log('📱 Step 5: Adding to cart...');
        await cartButton.click();
        console.log('✅ Added to cart');
        await driver.pause(3000);
        
        // Step 6: Verify cart navigation or success
        console.log('📱 Step 6: Verifying cart action...');
        // Try to find cart icon or cart screen elements
        const cartIcon = await $('//android.widget.RelativeLayout[@resource-id="com.saucelabs.mydemoapp.android:id/cartRL"]');
        if (await cartIcon.isDisplayed()) {
            console.log('✅ Cart icon visible - product likely added');
        }
        
        console.log('🎉 E2E Shopping Journey with Scrolling completed successfully!');
    });
});