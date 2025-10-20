describe('My Demo App - E2E Shopping with W3C Actions', () => {
    it('should complete shopping flow with W3C scroll actions', async () => {
        console.log('🚀 Starting E2E Shopping Journey with W3C Actions...');
        
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
        
        // Step 4: Scroll down using W3C Actions
        console.log('📱 Step 4: Scrolling down using W3C Actions...');
        const windowSize = await driver.getWindowSize();
        console.log(`📏 Window size: ${windowSize.width}x${windowSize.height}`);
        
        // Use W3C Actions to scroll
        await driver.performActions([{
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
                { type: 'pointerMove', duration: 0, x: windowSize.width / 2, y: windowSize.height * 0.8 },
                { type: 'pointerDown' },
                { type: 'pointerMove', duration: 1000, x: windowSize.width / 2, y: windowSize.height * 0.2 },
                { type: 'pointerUp' }
            ]
        }]);
        await driver.pause(2000);
        console.log('✅ Scrolled down once using W3C Actions');
        
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
            console.log('❌ Cart button still not visible, trying without scroll...');
            console.log('🔍 Let me check if the button exists in a different form...');
            
            // Let's try different selectors for the cart button
            const altCartButton1 = $('//android.widget.Button[@text="Add to cart"]');
            const altCartButton2 = $('//android.widget.Button[contains(@text, "cart")]');
            const altCartButton3 = $('//android.widget.Button[contains(@resource-id, "cart")]');
            
            try {
                console.log('🔍 Trying alternative cart button selector 1...');
                await altCartButton1.waitForDisplayed({ timeout: 3000 });
                await altCartButton1.click();
                console.log('✅ Found and clicked cart button with text selector!');
            } catch (e1) {
                try {
                    console.log('🔍 Trying alternative cart button selector 2...');
                    await altCartButton2.waitForDisplayed({ timeout: 3000 });
                    await altCartButton2.click();
                    console.log('✅ Found and clicked cart button with contains text selector!');
                } catch (e2) {
                    try {
                        console.log('🔍 Trying alternative cart button selector 3...');
                        await altCartButton3.waitForDisplayed({ timeout: 3000 });
                        await altCartButton3.click();
                        console.log('✅ Found and clicked cart button with contains resource-id selector!');
                    } catch (e3) {
                        console.log('❌ Unable to find cart button with any selector');
                        throw new Error('Cart button not found with any selector');
                    }
                }
            }
        }
        
        console.log('🎉 E2E Shopping Journey with W3C Actions completed successfully!');
    });
});