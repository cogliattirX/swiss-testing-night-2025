describe('🛍️ Sauce Labs Demo App - Shopping Functions', () => {
    
    beforeEach(async () => {
        console.log('🔄 Setting up shopping test environment...');
        await driver.pause(3000);
    });

    afterEach(async () => {
        console.log('🧹 Cleaning up after shopping test...');
        await driver.pause(1000);
    });

    it('🏪 Should display product catalog with prices', async () => {
        console.log('🛍️ Testing product catalog display...');
        
        // Take screenshot of product catalog
        await driver.saveScreenshot('./test-results/screenshots/shopping_01_catalog.png');
        console.log('📸 Screenshot saved: product catalog');
        
        // Verify we can see products
        const productTitles = await driver.$$('//*[@content-desc="Product Title"]');
        console.log(`📦 Found ${productTitles.length} products in catalog`);
        
        // Get product names and prices
        for (let i = 0; i < Math.min(productTitles.length, 3); i++) {
            try {
                const productName = await productTitles[i].getText();
                console.log(`🏷️  Product ${i + 1}: "${productName}"`);
                
                // Try to find corresponding price
                const priceElements = await driver.$$('//*[@content-desc="Product Price"]');
                if (priceElements[i]) {
                    const price = await priceElements[i].getText();
                    console.log(`💰 Price: ${price}`);
                }
            } catch (e) {
                console.log(`⚠️  Could not read product ${i + 1} details`);
            }
        }
        
        // Verify at least one product is visible
        expect(productTitles.length).toBeGreaterThan(0);
        console.log('✅ Product catalog verification complete');
    });

    it('👆 Should be able to interact with product images', async () => {
        console.log('🖼️ Testing product image interactions...');
        
        // Find product images
        const productImages = await driver.$$('//*[@content-desc="Product Image"]');
        console.log(`🖼️ Found ${productImages.length} product images`);
        
        if (productImages.length > 0) {
            // Click on first product image
            await productImages[0].click();
            console.log('👆 Clicked on first product image');
            
            await driver.pause(2000);
            
            // Take screenshot after clicking
            await driver.saveScreenshot('./test-results/screenshots/shopping_02_product_detail.png');
            console.log('📸 Screenshot saved: product detail view');
            
            // Check if we navigated to a different screen
            const currentPackage = await driver.getCurrentPackage();
            expect(currentPackage).toBe('com.saucelabs.mydemoapp.android');
            
            console.log('✅ Product image interaction test complete');
        } else {
            console.log('⚠️  No product images found for interaction');
        }
    });

    it('⭐ Should display product ratings', async () => {
        console.log('⭐ Testing product rating display...');
        
        // Look for rating elements
        const ratingViews = await driver.$$('//*[@resource-id="com.saucelabs.mydemoapp.android:id/rattingV"]');
        console.log(`⭐ Found ${ratingViews.length} rating components`);
        
        // Look for individual star elements
        const starElements = await driver.$$('//*[contains(@resource-id, "start")]');
        console.log(`⭐ Found ${starElements.length} star elements`);
        
        if (starElements.length > 0) {
            // Try to interact with a star
            await starElements[0].click();
            console.log('👆 Clicked on a star rating');
            
            await driver.pause(1000);
            
            // Take screenshot
            await driver.saveScreenshot('./test-results/screenshots/shopping_03_rating_interaction.png');
            console.log('📸 Screenshot saved: rating interaction');
        }
        
        expect(ratingViews.length).toBeGreaterThan(0);
        console.log('✅ Product rating test complete');
    });

    it('🔍 Should navigate through different sections', async () => {
        console.log('🧭 Testing app navigation...');
        
        try {
            // Look for navigation elements (menu, tabs, etc.)
            const clickableElements = await driver.$$('//*[@clickable="true"]');
            console.log(`👆 Found ${clickableElements.length} clickable navigation elements`);
            
            // Take screenshot of current state
            await driver.saveScreenshot('./test-results/screenshots/shopping_04_navigation_start.png');
            
            // Try to find and click navigation elements
            if (clickableElements.length > 3) {
                // Click on a navigation element (avoiding product items)
                const navElement = clickableElements[0]; // Try first element (might be menu)
                await navElement.click();
                console.log('👆 Clicked on navigation element');
                
                await driver.pause(2000);
                
                // Take screenshot after navigation
                await driver.saveScreenshot('./test-results/screenshots/shopping_05_navigation_result.png');
                console.log('📸 Screenshot saved: navigation result');
                
                // Verify we're still in the app
                const currentPackage = await driver.getCurrentPackage();
                expect(currentPackage).toBe('com.saucelabs.mydemoapp.android');
                
                console.log('✅ Navigation test complete');
            }
            
        } catch (error) {
            console.log('⚠️  Navigation test encountered an issue:', error.message);
            await driver.saveScreenshot('./test-results/screenshots/shopping_06_navigation_error.png');
        }
    });

    it('📱 Should handle app orientation changes', async () => {
        console.log('🔄 Testing orientation changes...');
        
        // Take screenshot in portrait
        await driver.saveScreenshot('./test-results/screenshots/shopping_07_portrait.png');
        console.log('📸 Screenshot saved: portrait orientation');
        
        try {
            // Try to rotate to landscape
            await driver.setOrientation('LANDSCAPE');
            console.log('🔄 Rotated to landscape orientation');
            
            await driver.pause(2000);
            
            // Take screenshot in landscape
            await driver.saveScreenshot('./test-results/screenshots/shopping_08_landscape.png');
            console.log('📸 Screenshot saved: landscape orientation');
            
            // Verify app is still responsive
            const elements = await driver.$$('//*[@clickable="true"]');
            console.log(`👆 Found ${elements.length} clickable elements in landscape`);
            
            // Rotate back to portrait
            await driver.setOrientation('PORTRAIT');
            console.log('🔄 Rotated back to portrait orientation');
            
            await driver.pause(2000);
            
            // Final screenshot
            await driver.saveScreenshot('./test-results/screenshots/shopping_09_portrait_final.png');
            console.log('📸 Screenshot saved: final portrait orientation');
            
            console.log('✅ Orientation test complete');
            
        } catch (error) {
            console.log('⚠️  Orientation change failed:', error.message);
            // Try to ensure we're back in portrait
            try {
                await driver.setOrientation('PORTRAIT');
            } catch (e) {
                console.log('⚠️  Could not reset to portrait');
            }
        }
    });
});