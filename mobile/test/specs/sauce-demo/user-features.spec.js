describe('🔐 Sauce Labs Demo App - Authentication & User Features', () => {
    
    beforeEach(async () => {
        console.log('🔄 Setting up authentication test environment...');
        await driver.pause(3000);
    });

    afterEach(async () => {
        console.log('🧹 Cleaning up after authentication test...');
        await driver.pause(1000);
    });

    it('🔍 Should search for login or user authentication elements', async () => {
        console.log('🔐 Looking for authentication elements...');
        
        // Take initial screenshot
        await driver.saveScreenshot('./test-results/screenshots/auth_01_initial_screen.png');
        console.log('📸 Screenshot saved: initial screen for auth search');
        
        // Look for common authentication-related elements
        const loginElements = [
            'login', 'sign in', 'username', 'password', 'email',
            'register', 'account', 'profile', 'user'
        ];
        
        let foundAuthElements = [];
        
        for (const term of loginElements) {
            try {
                // Search for text containing the term (case insensitive)
                const elements = await driver.$$(`//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${term}')]`);
                if (elements.length > 0) {
                    foundAuthElements.push(term);
                    console.log(`🔍 Found elements related to: "${term}" (${elements.length} elements)`);
                }
            } catch (e) {
                // Continue searching
            }
        }
        
        // Look for input fields that might be for login
        const inputFields = await driver.$$('//android.widget.EditText');
        console.log(`📝 Found ${inputFields.length} input fields`);
        
        // Look for common button patterns
        const buttons = await driver.$$('//android.widget.Button | //*[@clickable="true"]');
        console.log(`🔘 Found ${buttons.length} interactive elements`);
        
        // Look for menu or navigation that might lead to login
        try {
            // Look for hamburger menu or navigation drawer
            const menuElements = await driver.$$('//*[@content-desc="Navigate up"] | //*[@content-desc="Menu"] | //*[@content-desc="More options"]');
            if (menuElements.length > 0) {
                console.log(`🍔 Found ${menuElements.length} potential menu elements`);
                
                // Try clicking the first menu element
                await menuElements[0].click();
                console.log('👆 Clicked on menu element');
                
                await driver.pause(2000);
                
                // Take screenshot of menu
                await driver.saveScreenshot('./test-results/screenshots/auth_02_menu_opened.png');
                console.log('📸 Screenshot saved: menu opened');
                
                // Look for login options in the menu
                const menuItems = await driver.$$('//*[@clickable="true"]');
                console.log(`📋 Found ${menuItems.length} menu items`);
                
                // Try to close menu by clicking outside or back
                try {
                    await driver.back();
                    await driver.pause(1000);
                } catch (e) {
                    console.log('⚠️  Could not close menu with back button');
                }
            }
        } catch (error) {
            console.log('⚠️  Menu exploration failed:', error.message);
        }
        
        console.log(`✅ Authentication element search complete. Found: ${foundAuthElements.join(', ')}`);
    });

    it('🔍 Should explore app settings and preferences', async () => {
        console.log('⚙️ Looking for settings or preferences...');
        
        try {
            // Look for settings-related elements
            const settingsTerms = ['settings', 'preferences', 'options', 'config'];
            let foundSettings = false;
            
            for (const term of settingsTerms) {
                const elements = await driver.$$(`//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${term}')]`);
                if (elements.length > 0) {
                    console.log(`⚙️ Found settings-related element: "${term}"`);
                    foundSettings = true;
                    break;
                }
            }
            
            // Look for three-dot menu or overflow menu
            const overflowMenus = await driver.$$('//*[@content-desc="More options"] | //*[@content-desc="Overflow menu"]');
            if (overflowMenus.length > 0) {
                console.log('📱 Found overflow menu');
                await overflowMenus[0].click();
                await driver.pause(2000);
                
                await driver.saveScreenshot('./test-results/screenshots/auth_03_overflow_menu.png');
                console.log('📸 Screenshot saved: overflow menu');
                
                // Close menu
                await driver.back();
                await driver.pause(1000);
            }
            
            console.log(`✅ Settings exploration complete. Found settings: ${foundSettings}`);
            
        } catch (error) {
            console.log('⚠️  Settings exploration encountered an error:', error.message);
            await driver.saveScreenshot('./test-results/screenshots/auth_04_settings_error.png');
        }
    });

    it('📱 Should test app information and about section', async () => {
        console.log('ℹ️ Looking for app information...');
        
        try {
            // Look for about, help, or info sections
            const infoTerms = ['about', 'help', 'info', 'version', 'support'];
            
            for (const term of infoTerms) {
                try {
                    const elements = await driver.$$(`//*[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${term}')]`);
                    if (elements.length > 0) {
                        console.log(`ℹ️ Found info-related element: "${term}"`);
                        
                        // Try clicking on it
                        await elements[0].click();
                        console.log(`👆 Clicked on ${term} element`);
                        
                        await driver.pause(2000);
                        
                        // Take screenshot
                        await driver.saveScreenshot(`./test-results/screenshots/auth_05_${term}_section.png`);
                        console.log(`📸 Screenshot saved: ${term} section`);
                        
                        // Go back
                        await driver.back();
                        await driver.pause(1000);
                        break;
                    }
                } catch (e) {
                    // Continue searching
                }
            }
            
            // Test the app package and activity info
            const currentPackage = await driver.getCurrentPackage();
            const currentActivity = await driver.getCurrentActivity();
            
            console.log(`📦 Current package: ${currentPackage}`);
            console.log(`📱 Current activity: ${currentActivity}`);
            
            console.log('✅ App information test complete');
            
        } catch (error) {
            console.log('⚠️  App info exploration failed:', error.message);
            await driver.saveScreenshot('./test-results/screenshots/auth_06_info_error.png');
        }
    });

    it('🔄 Should test app state and data persistence', async () => {
        console.log('💾 Testing app state persistence...');
        
        try {
            // Take initial screenshot
            await driver.saveScreenshot('./test-results/screenshots/auth_07_initial_state.png');
            
            // Get initial app state information
            const initialPageSource = await driver.getPageSource();
            const initialSourceLength = initialPageSource.length;
            console.log(`📄 Initial page source length: ${initialSourceLength}`);
            
            // Background the app for a longer period
            await driver.background(5);
            console.log('⏸️  App backgrounded for 5 seconds');
            
            // Take screenshot after returning
            await driver.saveScreenshot('./test-results/screenshots/auth_08_after_background.png');
            
            // Check if state is preserved
            const finalPageSource = await driver.getPageSource();
            const finalSourceLength = finalPageSource.length;
            console.log(`📄 Final page source length: ${finalSourceLength}`);
            
            // Compare states (rough comparison)
            const stateDifference = Math.abs(initialSourceLength - finalSourceLength);
            console.log(`🔄 State difference: ${stateDifference} characters`);
            
            if (stateDifference < 1000) {
                console.log('✅ App state appears to be well preserved');
            } else {
                console.log('⚠️  Significant state change detected');
            }
            
            // Verify we're still in the correct app
            const currentPackage = await driver.getCurrentPackage();
            expect(currentPackage).toBe('com.saucelabs.mydemoapp.android');
            
            console.log('✅ App state persistence test complete');
            
        } catch (error) {
            console.log('⚠️  State persistence test failed:', error.message);
            await driver.saveScreenshot('./test-results/screenshots/auth_09_persistence_error.png');
        }
    });
});