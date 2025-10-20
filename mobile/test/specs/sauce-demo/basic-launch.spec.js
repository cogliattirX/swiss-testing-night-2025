describe('🛒 Sauce Labs Demo App - Basic Functionality', () => {
    
    beforeEach(async () => {
        console.log('🔄 Setting up test environment...');
        // Wait for app to be ready
        await driver.pause(3000);
    });

    afterEach(async () => {
        console.log('🧹 Cleaning up after test...');
        await driver.pause(1000);
    });

    it('🚀 Should successfully launch the Sauce Labs Demo App', async () => {
        console.log('📱 Testing app launch and splash screen...');
        
        // Take screenshot of splash screen
        await driver.saveScreenshot('./test-results/screenshots/01_splash_screen.png');
        console.log('📸 Screenshot saved: splash screen');
        
        // Wait for splash screen to disappear and main screen to load
        await driver.pause(5000);
        
        // Check if we can find any main UI elements
        // The app might have different screens, let's explore what's available
        const pageSource = await driver.getPageSource();
        console.log('📄 Page source length:', pageSource.length);
        
        // Take screenshot of main screen
        await driver.saveScreenshot('./test-results/screenshots/02_main_screen.png');
        console.log('📸 Screenshot saved: main screen');
        
        // Look for common UI elements
        try {
            const elements = await driver.$$('*');
            console.log(`🔍 Found ${elements.length} UI elements on screen`);
            
            // Try to find clickable elements
            const clickableElements = await driver.$$('//*[@clickable="true"]');
            console.log(`👆 Found ${clickableElements.length} clickable elements`);
            
            if (clickableElements.length > 0) {
                console.log('✅ App loaded successfully with interactive elements');
            }
            
        } catch (error) {
            console.log('⚠️  Could not analyze UI elements:', error.message);
        }
        
        // Verify the app package is running
        const currentPackage = await driver.getCurrentPackage();
        console.log('📦 Current package:', currentPackage);
        
        // Assert that we're in the correct app
        expect(currentPackage).toBe('com.saucelabs.mydemoapp.android');
        console.log('✅ App launch verification complete');
    });

    it('🔍 Should explore available UI elements and navigation', async () => {
        console.log('🧭 Exploring app navigation and UI elements...');
        
        await driver.pause(3000);
        
        try {
            // Look for text elements that might indicate what screen we're on
            const textElements = await driver.$$('//*[@class="android.widget.TextView"]');
            console.log(`📝 Found ${textElements.length} text elements`);
            
            // Get text content from visible elements
            for (let i = 0; i < Math.min(textElements.length, 5); i++) {
                try {
                    const text = await textElements[i].getText();
                    if (text && text.trim()) {
                        console.log(`📄 Text element ${i + 1}: "${text}"`);
                    }
                } catch (e) {
                    // Element might not be visible or accessible
                }
            }
            
            // Look for buttons
            const buttons = await driver.$$('//*[@class="android.widget.Button"]');
            console.log(`🔘 Found ${buttons.length} buttons`);
            
            // Look for images
            const images = await driver.$$('//*[@class="android.widget.ImageView"]');
            console.log(`🖼️  Found ${images.length} images`);
            
            // Take a final screenshot
            await driver.saveScreenshot('./test-results/screenshots/03_ui_exploration.png');
            console.log('📸 Screenshot saved: UI exploration');
            
            console.log('✅ UI exploration complete');
            
        } catch (error) {
            console.log('❌ Error during UI exploration:', error.message);
            await driver.saveScreenshot('./test-results/screenshots/03_ui_exploration_error.png');
        }
    });

    it('🔄 Should handle app background and foreground', async () => {
        console.log('🔄 Testing app lifecycle (background/foreground)...');
        
        // Take screenshot before backgrounding
        await driver.saveScreenshot('./test-results/screenshots/04_before_background.png');
        
        // Send app to background
        await driver.background(2);
        console.log('⏸️  App sent to background for 2 seconds');
        
        // Take screenshot after returning to foreground
        await driver.saveScreenshot('./test-results/screenshots/05_after_background.png');
        
        // Verify app is still running
        const currentPackage = await driver.getCurrentPackage();
        expect(currentPackage).toBe('com.saucelabs.mydemoapp.android');
        
        console.log('✅ App lifecycle test complete');
    });
});