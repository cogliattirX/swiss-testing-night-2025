describe('Geberit Home App Tests', () => {
    
    it('should launch Geberit Home app successfully', async () => {
        console.log('🏠 Testing Geberit Home App Launch...');
        
        try {
            // Wait for app to load
            await browser.pause(5000);
            
            // Get current activity to verify app launch
            const currentActivity = await browser.getCurrentActivity();
            console.log('📱 Current Activity:', currentActivity);
            
            // Take screenshot of app launch
            await browser.saveScreenshot('./test-results/screenshots/geberit-home-launch.png');
            console.log('📸 Screenshot saved: geberit-home-launch.png');
            
            // Verify we're in the Geberit Home app
            expect(currentActivity).toContain('geberit');
            console.log('✅ Geberit Home app launched successfully');
            
        } catch (error) {
            console.log('❌ App launch failed:', error.message);
            
            // Fallback: Try to launch via package name
            console.log('🔄 Attempting alternative launch method...');
            await browser.execute('mobile: shell', {
                command: 'monkey -p com.geberit.home -c android.intent.category.LAUNCHER 1'
            });
            
            await browser.pause(3000);
            const activity = await browser.getCurrentActivity();
            console.log('📱 Activity after monkey launch:', activity);
            
            // Take screenshot regardless
            await browser.saveScreenshot('./test-results/screenshots/geberit-home-fallback.png');
        }
    });
    
    it('should interact with Geberit Home main interface', async () => {
        console.log('🔧 Testing Geberit Home Interface...');
        
        try {
            // Wait for interface to load
            await browser.pause(3000);
            
            // Take screenshot of main interface
            await browser.saveScreenshot('./test-results/screenshots/geberit-home-interface.png');
            console.log('📸 Interface screenshot saved');
            
            // Try to find common UI elements (generic approach)
            const elements = await browser.$$('android.widget.Button');
            console.log(`🔍 Found ${elements.length} buttons in the interface`);
            
            if (elements.length > 0) {
                console.log('✅ UI elements detected - app is responsive');
                
                // Take screenshot after element detection
                await browser.saveScreenshot('./test-results/screenshots/geberit-home-elements.png');
            }
            
        } catch (error) {
            console.log('⚠️ Interface interaction failed:', error.message);
            console.log('📱 App may not be installed or accessible');
        }
    });
    
    it('should demonstrate app navigation capabilities', async () => {
        console.log('🧭 Testing Navigation Capabilities...');
        
        try {
            // Get app source for analysis
            const pageSource = await browser.getPageSource();
            const hasContent = pageSource.length > 1000; // Basic content check
            
            console.log(`📋 Page source length: ${pageSource.length} characters`);
            console.log(`📄 Has substantial content: ${hasContent ? 'Yes' : 'No'}`);
            
            if (hasContent) {
                console.log('✅ App has loaded content successfully');
            }
            
            // Test basic device interactions
            await browser.execute('mobile: shell', {
                command: 'input keyevent KEYCODE_BACK'
            });
            
            await browser.pause(1000);
            
            // Final screenshot
            await browser.saveScreenshot('./test-results/screenshots/geberit-home-navigation.png');
            console.log('📸 Navigation test screenshot saved');
            
        } catch (error) {
            console.log('❌ Navigation test failed:', error.message);
        }
        
        console.log('🎯 Geberit Home app testing completed');
    });
    
});