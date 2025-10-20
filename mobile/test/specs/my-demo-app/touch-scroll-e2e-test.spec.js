describe('My Demo App - E2E Shopping with Touch Scrolling', () => {
    it('should complete shopping flow with touch scroll', async () => {
        console.log('🚀 Starting E2E Shopping Journey with Touch Scrolling...');
        
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
        
        // Step 4: Scroll down using touch actions to find cart button
        console.log('📱 Step 4: Scrolling down using touch actions...');
        const windowSize = await driver.getWindowSize();
        console.log(`📏 Window size: ${windowSize.width}x${windowSize.height}`);
        
        // Scroll down by swiping
        await driver.touchAction([
            { action: 'press', x: windowSize.width / 2, y: windowSize.height * 0.8 },
            { action: 'moveTo', x: windowSize.width / 2, y: windowSize.height * 0.2 },
            { action: 'release' }
        ]);
        await driver.pause(2000);
        console.log('✅ Scrolled down once');
        
        // Step 5: Try to find cart button now
        console.log('📱 Step 5: Looking for Add to Cart button...');
        const cartButton = $('//android.widget.Button[@resource-id="com.saucelabs.mydemoapp.android:id/cartBt"]');
        
        try {
            await cartButton.waitForDisplayed({ timeout: 5000 });
            console.log('✅ Cart button is now visible!');
            
            // Step 6: Add to cart
            console.log('📱 Step 6: Adding to cart...');
            await cartButton.click();
            console.log('✅ Added to cart');
            await driver.pause(3000);
            
            // Step 7: Verify cart action
            console.log('📱 Step 7: Verifying cart action...');
            const cartIcon = await $('//android.widget.RelativeLayout[@resource-id="com.saucelabs.mydemoapp.android:id/cartRL"]');
            if (await cartIcon.isDisplayed()) {
                console.log('✅ Cart icon visible - product likely added');
            }
        } catch (error) {
            console.log('❌ Cart button still not visible, scrolling more...');
            
            // Try scrolling again
            await driver.touchAction([
                { action: 'press', x: windowSize.width / 2, y: windowSize.height * 0.8 },
                { action: 'moveTo', x: windowSize.width / 2, y: windowSize.height * 0.2 },
                { action: 'release' }
            ]);
            await driver.pause(2000);
            console.log('✅ Scrolled down again');
            
            // Try one more time
            await cartButton.waitForDisplayed({ timeout: 10000 });
            console.log('✅ Cart button is now visible after additional scroll!');
            await cartButton.click();
            console.log('✅ Added to cart');
        }
        
        console.log('🎉 E2E Shopping Journey with Touch Scrolling completed successfully!');
    });
});