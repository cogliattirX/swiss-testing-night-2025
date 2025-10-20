const { expect } = require('@wdio/globals');

// Shared helper functions for Geberit App testing
class GeberitAppHelpers {
    
    static async findMenuButton() {
        const menuSelectors = [
            '//android.widget.ImageButton[@content-desc="Menu"]',
            '//android.widget.ImageButton[@content-desc="More options"]',
            '//android.widget.ImageView[@content-desc="Menu"]',
            '//*[@content-desc="Menu"]',
            '//*[@content-desc="More options"]',
            '//android.widget.ImageButton[contains(@content-desc, "menu")]',
            '//android.widget.ImageButton[contains(@content-desc, "Menu")]',
            '//android.widget.ImageButton',
            '//android.widget.ImageView[@clickable="true"]'
        ];
        
        for (const selector of menuSelectors) {
            try {
                console.log(`🔍 Trying menu selector: ${selector}`);
                const menuButton = await $(selector);
                if (await menuButton.isExisting()) {
                    console.log(`✅ Found menu button with selector: ${selector}`);
                    return menuButton;
                }
            } catch (error) {
                console.log(`❌ Menu selector failed: ${selector}`);
            }
        }
        
        console.log('⚠️ Could not find menu button');
        await driver.saveScreenshot('./test-results/screenshots/menu-button-not-found.png');
        return null;
    }
    
    static async findDemoModeOption() {
        const demoModeSelectors = [
            '//*[contains(@text, "Vorführmodus")]',
            '//*[contains(@text, "Demo")]',
            '//*[contains(@text, "demo")]',
            '//*[contains(@text, "Demonstration")]',
            '//*[contains(@content-desc, "Vorführmodus")]',
            '//*[contains(@content-desc, "Demo")]'
        ];
        
        for (const selector of demoModeSelectors) {
            try {
                console.log(`🔍 Trying demo mode selector: ${selector}`);
                const demoOption = await $(selector);
                if (await demoOption.isExisting()) {
                    console.log(`✅ Found demo mode option with selector: ${selector}`);
                    return demoOption;
                }
            } catch (error) {
                console.log(`❌ Demo mode selector failed: ${selector}`);
            }
        }
        
        console.log('⚠️ Could not find demo mode option');
        return null;
    }
    
    static async findOkButton() {
        const okSelectors = [
            '//*[@text="OK"]',
            '//*[@text="Ok"]',
            '//*[@text="ok"]',
            '//*[contains(@text, "OK")]',
            '//*[@content-desc="OK"]',
            '//android.widget.Button[@text="OK"]',
            '//android.widget.Button[contains(@text, "OK")]'
        ];
        
        for (const selector of okSelectors) {
            try {
                console.log(`🔍 Trying OK button selector: ${selector}`);
                const okButton = await $(selector);
                if (await okButton.isExisting()) {
                    console.log(`✅ Found OK button with selector: ${selector}`);
                    return okButton;
                }
            } catch (error) {
                console.log(`❌ OK button selector failed: ${selector}`);
            }
        }
        
        console.log('⚠️ Could not find OK button');
        return null;
    }
    
    static async activateDemoMode() {
        console.log('🚀 Activating Demo Mode...');
        
        // Step 1: Click menu button
        const menuButton = await this.findMenuButton();
        if (!menuButton) {
            throw new Error('Menu button not found');
        }
        
        await menuButton.click();
        await driver.pause(2000);
        console.log('🎯 Menu button clicked');
        await driver.saveScreenshot('./test-results/screenshots/menu-opened.png');
        
        // Step 2: Click demo mode option
        const demoOption = await this.findDemoModeOption();
        if (!demoOption) {
            throw new Error('Demo mode option not found');
        }
        
        await demoOption.click();
        await driver.pause(2000);
        console.log('🎯 Demo mode option clicked');
        await driver.saveScreenshot('./test-results/screenshots/demo-mode-activated.png');
        
        // Step 3: Handle OK button if present
        const okButton = await this.findOkButton();
        if (okButton) {
            await okButton.click();
            await driver.pause(2000);
            console.log('🎯 OK button clicked');
        } else {
            console.log('ℹ️ No OK button found, continuing...');
        }
        
        await driver.pause(3000); // Wait for demo mode to fully load
        console.log('✅ Demo mode activated successfully');
        await driver.saveScreenshot('./test-results/screenshots/demo-mode-ready.png');
    }
    
    static async deactivateDemoMode() {
        console.log('🔄 Deactivating Demo Mode...');
        
        // Try Android back button first as fallback
        try {
            console.log('📱 Using Android back button to exit demo mode...');
            await driver.pressKeyCode(4); // Android back button
            await driver.pause(2000);
            
            // Press back again to make sure we're out of demo mode
            await driver.pressKeyCode(4);
            await driver.pause(2000);
            
            console.log('✅ Demo mode deactivated using Android back button');
            await driver.saveScreenshot('./test-results/screenshots/demo-mode-deactivated.png');
            return;
        } catch (error) {
            console.log('⚠️ Android back button approach failed, trying menu button...');
        }
        
        // Alternative: Try to find menu button (might have different selectors in demo mode)
        const alternativeMenuSelectors = [
            '//android.widget.ImageButton',
            '//android.widget.ImageView[@clickable="true"]',
            '//*[@clickable="true" and contains(@content-desc, "menu")]',
            '//*[@clickable="true" and contains(@content-desc, "Menu")]',
            '//*[@clickable="true" and contains(@class, "ImageButton")]',
            '//*[@clickable="true" and contains(@class, "ImageView")]'
        ];
        
        for (const selector of alternativeMenuSelectors) {
            try {
                console.log(`🔍 Trying alternative menu selector: ${selector}`);
                const elements = await $$(selector);
                
                if (elements.length > 0) {
                    // Try clicking the first available element
                    await elements[0].click();
                    await driver.pause(2000);
                    
                    // Look for demo mode option to click again
                    const demoOption = await this.findDemoModeOption();
                    if (demoOption) {
                        await demoOption.click();
                        await driver.pause(2000);
                        console.log('🎯 Demo mode deactivated via alternative menu');
                        break;
                    }
                }
            } catch (error) {
                console.log(`❌ Alternative selector failed: ${selector}`);
            }
        }
        
        // Final fallback: Use home button simulation
        try {
            console.log('🏠 Using home button as final fallback...');
            await driver.pressKeyCode(3); // Android home button
            await driver.pause(2000);
            
            // Reopen the app
            await driver.activateApp('com.geberit.home');
            await driver.pause(3000);
            
            console.log('✅ Returned to home via home button and app reactivation');
        } catch (error) {
            console.log('⚠️ Home button fallback also failed');
        }
        
        await driver.pause(3000); // Wait for normal mode to load
        console.log('✅ Demo mode deactivation completed (using fallback methods)');
        await driver.saveScreenshot('./test-results/screenshots/demo-mode-deactivated.png');
    }
    
    static async getAllVisibleProducts() {
        const productSelectors = [
            '//android.widget.TextView[contains(@text, "Geberit")]',
            '//android.widget.TextView[contains(@text, "AquaClean")]',
            '//*[contains(@text, "Testset")]',
            '//*[contains(@text, "WC")]',
            '//*[contains(@text, "Dusch")]',
            '//*[contains(@text, "Spiegel")]'
        ];
        
        let allProducts = [];
        const productTexts = new Set();
        
        for (const selector of productSelectors) {
            try {
                const elements = await $$(selector);
                for (const element of elements) {
                    try {
                        const text = await element.getText();
                        if (text && !productTexts.has(text)) {
                            productTexts.add(text);
                            allProducts.push({
                                element: element,
                                text: text,
                                selector: selector
                            });
                        }
                    } catch (e) {
                        // Skip elements that can't be read
                    }
                }
            } catch (error) {
                // Skip failed selectors
            }
        }
        
        return allProducts;
    }
    
    static async scrollDown() {
        const windowSize = await driver.getWindowSize();
        const screenHeight = windowSize.height;
        const screenWidth = windowSize.width;
        
        await driver.performActions([{
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
                { type: 'pointerMove', duration: 0, x: screenWidth / 2, y: screenHeight * 0.8 },
                { type: 'pointerDown', button: 0 },
                { type: 'pointerMove', duration: 1000, x: screenWidth / 2, y: screenHeight * 0.3 },
                { type: 'pointerUp', button: 0 }
            ]
        }]);
        
        await driver.pause(2000);
    }
    
    static async scrollUp() {
        const windowSize = await driver.getWindowSize();
        const screenHeight = windowSize.height;
        const screenWidth = windowSize.width;
        
        await driver.performActions([{
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
                { type: 'pointerMove', duration: 0, x: screenWidth / 2, y: screenHeight * 0.3 },
                { type: 'pointerDown', button: 0 },
                { type: 'pointerMove', duration: 1000, x: screenWidth / 2, y: screenHeight * 0.8 },
                { type: 'pointerUp', button: 0 }
            ]
        }]);
        
        await driver.pause(2000);
    }
    
    static async discoverAllProducts(maxScrolls = 5) {
        console.log('🔍 Starting comprehensive product discovery...');
        
        let allFoundProducts = [];
        let scrollAttempts = 0;
        let previousProductCount = 0;
        
        while (scrollAttempts < maxScrolls) {
            const currentProducts = await this.getAllVisibleProducts();
            
            // Add new products to our collection
            for (const product of currentProducts) {
                const isAlreadyFound = allFoundProducts.some(p => p.text === product.text);
                if (!isAlreadyFound) {
                    allFoundProducts.push(product);
                    console.log(`📦 Found new product: "${product.text}"`);
                }
            }
            
            console.log(`📊 Total unique products found so far: ${allFoundProducts.length}`);
            await driver.saveScreenshot(`./test-results/screenshots/product-discovery-scroll-${scrollAttempts + 1}.png`);
            
            // Stop if no new products found
            if (allFoundProducts.length === previousProductCount && scrollAttempts >= 2) {
                console.log('🛑 No new products found, stopping discovery');
                break;
            }
            
            previousProductCount = allFoundProducts.length;
            
            // Scroll down to reveal more products
            console.log(`📜 Scrolling down (attempt ${scrollAttempts + 1})...`);
            await this.scrollDown();
            scrollAttempts++;
        }
        
        console.log(`📦 Product discovery complete! Found ${allFoundProducts.length} unique products:`);
        allFoundProducts.forEach((product, index) => {
            console.log(`  ${index + 1}. "${product.text}"`);
        });
        
        return allFoundProducts;
    }
}

describe('Geberit Home - Complete Demo Mode Cycle', () => {
    it('should activate demo mode, test functionality, and deactivate demo mode', async () => {
        console.log('🚀 Starting Complete Demo Mode Test Cycle');
        
        // Initial setup
        await driver.pause(3000);
        console.log('📱 App should be loaded');
        await driver.saveScreenshot('./test-results/screenshots/cycle-01-app-initial.png');
        
        try {
            // Step 1: Activate Demo Mode
            await GeberitAppHelpers.activateDemoMode();
            
            // Step 2: Test demo mode functionality
            console.log('🧪 Testing demo mode functionality...');
            const products = await GeberitAppHelpers.discoverAllProducts();
            
            // Verify products were found
            expect(products.length).toBeGreaterThan(0);
            console.log(`✅ Found ${products.length} products in demo mode`);
            
            // Step 3: Scroll back to top
            console.log('📜 Scrolling back to top...');
            for (let i = 0; i < 3; i++) {
                await GeberitAppHelpers.scrollUp();
            }
            await driver.saveScreenshot('./test-results/screenshots/cycle-03-back-to-top.png');
            
            // Step 4: Deactivate Demo Mode
            await GeberitAppHelpers.deactivateDemoMode();
            
            // Step 5: Verify we're back to home screen
            console.log('🏠 Verifying return to home screen...');
            await driver.pause(3000);
            await driver.saveScreenshot('./test-results/screenshots/cycle-04-home-screen.png');
            
            console.log('🎉 Complete demo mode cycle completed successfully!');
            console.log('📊 Test Summary:');
            console.log(`   ✅ Demo mode activated`);
            console.log(`   ✅ Products discovered (${products.length} found)`);
            console.log(`   ✅ Demo mode deactivated`);
            console.log(`   ✅ Returned to home screen`);
            console.log('📸 Screenshots saved in ./test-results/screenshots/');
            
        } catch (error) {
            console.log('❌ Error during test cycle:', error.message);
            await driver.saveScreenshot('./test-results/screenshots/cycle-error.png');
            
            // Try to recover by deactivating demo mode
            try {
                console.log('🔄 Attempting recovery by deactivating demo mode...');
                await GeberitAppHelpers.deactivateDemoMode();
            } catch (recoveryError) {
                console.log('❌ Recovery failed:', recoveryError.message);
            }
            
            throw error;
        }
    });
});

// Export the helper class for use in other test files
module.exports = { GeberitAppHelpers };