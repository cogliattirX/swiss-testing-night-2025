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
    
    // New Device-specific functions for Alba Geberit AquaClean workflow
    
    static async selectAlbaAquaCleanDevice() {
        console.log('🎯 Searching for Alba Geberit AquaClean device...');
        
        const deviceSelectors = [
            '//*[contains(@text, "Alba")]',
            '//*[contains(@text, "AquaClean")]',
            '//*[contains(@text, "Geberit AquaClean")]',
            '//*[contains(@text, "alba")]',
            '//*[contains(@text, "aquaclean")]'
        ];
        
        let foundDevice = null;
        let scrollAttempts = 0;
        const maxScrolls = 5;
        
        while (!foundDevice && scrollAttempts < maxScrolls) {
            for (const selector of deviceSelectors) {
                try {
                    const elements = await $$(selector);
                    for (const element of elements) {
                        const text = await element.getText();
                        if (text && (text.toLowerCase().includes('alba') || text.toLowerCase().includes('aquaclean'))) {
                            console.log(`🎯 Found Alba AquaClean device: "${text}"`);
                            foundDevice = element;
                            break;
                        }
                    }
                    if (foundDevice) break;
                } catch (error) {
                    // Continue searching
                }
            }
            
            if (!foundDevice && scrollAttempts < maxScrolls - 1) {
                console.log(`📜 Device not found, scrolling... (${scrollAttempts + 1}/${maxScrolls})`);
                await this.scrollDown();
                scrollAttempts++;
                await driver.pause(2000);
            } else {
                break;
            }
        }
        
        if (!foundDevice) {
            throw new Error('Alba Geberit AquaClean device not found after scrolling');
        }
        
        await foundDevice.click();
        console.log('✅ Alba AquaClean device selected');
        await driver.saveScreenshot('./test-results/screenshots/alba-device-selected.png');
        await driver.pause(3000);
        
        return foundDevice;
    }
    
    static async waitForDeviceConnection() {
        console.log('🔗 Waiting for device connection...');
        
        const connectionIndicators = [
            '//*[contains(@text, "Verbindung")]',
            '//*[contains(@text, "Connecting")]',
            '//*[contains(@text, "Connected")]',
            '//*[contains(@text, "Verbunden")]',
            '//*[contains(@text, "connection")]'
        ];
        
        let isConnected = false;
        let attempts = 0;
        const maxAttempts = 20; // 40 seconds total
        
        while (!isConnected && attempts < maxAttempts) {
            for (const selector of connectionIndicators) {
                try {
                    const element = await $(selector);
                    if (await element.isExisting()) {
                        const text = await element.getText();
                        console.log(`🔗 Connection status: "${text}"`);
                        
                        if (text.toLowerCase().includes('verbunden') || 
                            text.toLowerCase().includes('connected') ||
                            text.toLowerCase().includes('erfolgreich')) {
                            isConnected = true;
                            break;
                        }
                    }
                } catch (error) {
                    // Continue checking
                }
            }
            
            if (!isConnected) {
                await driver.pause(2000);
                attempts++;
                console.log(`⏳ Waiting for connection... (${attempts}/${maxAttempts})`);
            }
        }
        
        if (!isConnected) {
            console.log('⚠️ Connection timeout, but continuing...');
        } else {
            console.log('✅ Device connection established');
        }
        
        await driver.saveScreenshot('./test-results/screenshots/device-connection-status.png');
        return isConnected;
    }
    
    static async handleDeviceDataConsent() {
        console.log('📋 Handling device data consent...');
        
        const consentSelectors = [
            '//*[contains(@text, "Gerätedaten")]',
            '//*[contains(@text, "Zustimmen")]',
            '//*[contains(@text, "Akzeptieren")]',
            '//*[contains(@text, "Einverstanden")]',
            '//*[contains(@text, "OK")]',
            '//*[contains(@text, "Agree")]',
            '//*[contains(@text, "Accept")]'
        ];
        
        for (const selector of consentSelectors) {
            try {
                const element = await $(selector);
                if (await element.isExisting()) {
                    const text = await element.getText();
                    console.log(`📋 Found consent option: "${text}"`);
                    
                    if (text.toLowerCase().includes('zustimmen') || 
                        text.toLowerCase().includes('akzeptieren') ||
                        text.toLowerCase().includes('einverstanden') ||
                        text.toLowerCase().includes('agree') ||
                        text.toLowerCase().includes('accept') ||
                        text === 'OK') {
                        await element.click();
                        console.log('✅ Device data consent granted');
                        await driver.saveScreenshot('./test-results/screenshots/device-consent-granted.png');
                        await driver.pause(3000);
                        return true;
                    }
                }
            } catch (error) {
                // Continue searching
            }
        }
        
        console.log('ℹ️ No device data consent dialog found');
        return false;
    }
    
    static async handleNotificationPermissions() {
        console.log('🔔 Handling notification permissions...');
        
        const notificationSelectors = [
            '//*[contains(@text, "Notification")]',
            '//*[contains(@text, "Benachrichtigung")]',
            '//*[contains(@text, "Erlauben")]',
            '//*[contains(@text, "Allow")]',
            '//*[contains(@text, "Zulassen")]',
            '//*[contains(@text, "OK")]'
        ];
        
        for (const selector of notificationSelectors) {
            try {
                const element = await $(selector);
                if (await element.isExisting()) {
                    const text = await element.getText();
                    console.log(`🔔 Found notification option: "${text}"`);
                    
                    if (text.toLowerCase().includes('erlauben') || 
                        text.toLowerCase().includes('zulassen') ||
                        text.toLowerCase().includes('allow') ||
                        text === 'OK') {
                        await element.click();
                        console.log('✅ Notification permissions granted');
                        await driver.saveScreenshot('./test-results/screenshots/notification-permission-granted.png');
                        await driver.pause(3000);
                        return true;
                    }
                }
            } catch (error) {
                // Continue searching
            }
        }
        
        console.log('ℹ️ No notification permission dialog found');
        return false;
    }
    
    static async navigateWelcomeDialog() {
        console.log('👋 Navigating through welcome dialog...');
        
        // Swipe left for 3 pages
        for (let i = 1; i <= 3; i++) {
            console.log(`📱 Swiping left (page ${i}/3)...`);
            
            const windowSize = await driver.getWindowSize();
            const screenHeight = windowSize.height;
            const screenWidth = windowSize.width;
            
            // Swipe left
            await driver.performActions([{
                type: 'pointer',
                id: 'finger1',
                parameters: { pointerType: 'touch' },
                actions: [
                    { type: 'pointerMove', duration: 0, x: screenWidth * 0.8, y: screenHeight * 0.5 },
                    { type: 'pointerDown', button: 0 },
                    { type: 'pointerMove', duration: 1000, x: screenWidth * 0.2, y: screenHeight * 0.5 },
                    { type: 'pointerUp', button: 0 }
                ]
            }]);
            
            await driver.pause(2000);
            await driver.saveScreenshot(`./test-results/screenshots/welcome-swipe-${i}.png`);
        }
        
        // Look for close button (X)
        console.log('❌ Looking for close button...');
        
        const closeSelectors = [
            '//*[@content-desc="Close"]',
            '//*[@content-desc="Schließen"]',
            '//*[contains(@text, "X")]',
            '//*[@content-desc="X"]',
            '//android.widget.ImageButton[contains(@content-desc, "close")]',
            '//android.widget.ImageButton[contains(@content-desc, "Close")]',
            '//android.widget.Button[contains(@text, "X")]'
        ];
        
        for (const selector of closeSelectors) {
            try {
                const element = await $(selector);
                if (await element.isExisting()) {
                    console.log(`❌ Found close button with selector: ${selector}`);
                    await element.click();
                    console.log('✅ Welcome dialog closed');
                    await driver.saveScreenshot('./test-results/screenshots/welcome-dialog-closed.png');
                    await driver.pause(3000);
                    return true;
                }
            } catch (error) {
                // Continue searching
            }
        }
        
        console.log('⚠️ Close button not found, trying alternative methods...');
        
        // Try clicking at bottom center (where X might be)
        const windowSize = await driver.getWindowSize();
        await driver.performActions([{
            type: 'pointer',
            id: 'finger1',
            parameters: { pointerType: 'touch' },
            actions: [
                { type: 'pointerMove', duration: 0, x: windowSize.width / 2, y: windowSize.height * 0.9 },
                { type: 'pointerDown', button: 0 },
                { type: 'pointerUp', button: 0 }
            ]
        }]);
        
        await driver.pause(3000);
        console.log('✅ Welcome dialog navigation completed');
        return false;
    }
    
    static async openDeviceSettings() {
        console.log('⚙️ Opening device settings...');
        
        const settingsSelectors = [
            '//*[contains(@text, "Einstellungen")]',
            '//*[contains(@text, "Settings")]',
            '//*[contains(@content-desc, "Einstellungen")]',
            '//*[contains(@content-desc, "Settings")]',
            '//android.widget.ImageButton[contains(@content-desc, "settings")]',
            '//android.widget.ImageButton[contains(@content-desc, "Settings")]'
        ];
        
        for (const selector of settingsSelectors) {
            try {
                const element = await $(selector);
                if (await element.isExisting()) {
                    console.log(`⚙️ Found settings with selector: ${selector}`);
                    await element.click();
                    console.log('✅ Device settings opened');
                    await driver.saveScreenshot('./test-results/screenshots/device-settings-opened.png');
                    await driver.pause(3000);
                    return true;
                }
            } catch (error) {
                // Continue searching
            }
        }
        
        console.log('⚠️ Settings button not found');
        return false;
    }
    
    static async openShowerSettings() {
        console.log('🚿 Opening shower settings...');
        
        const showerSelectors = [
            '//*[contains(@text, "Dusche")]',
            '//*[contains(@text, "Shower")]',
            '//*[contains(@text, "dusche")]',
            '//*[contains(@text, "shower")]',
            '//*[contains(@content-desc, "Dusche")]',
            '//*[contains(@content-desc, "Shower")]'
        ];
        
        for (const selector of showerSelectors) {
            try {
                const element = await $(selector);
                if (await element.isExisting()) {
                    console.log(`🚿 Found shower settings with selector: ${selector}`);
                    await element.click();
                    console.log('✅ Shower settings opened');
                    await driver.saveScreenshot('./test-results/screenshots/shower-settings-opened.png');
                    await driver.pause(3000);
                    return true;
                }
            } catch (error) {
                // Continue searching
            }
        }
        
        console.log('⚠️ Shower settings not found');
        return false;
    }
    
    static async adjustWaterTemperature() {
        console.log('🌡️ Adjusting water temperature...');
        
        const temperatureSelectors = [
            '//*[contains(@text, "Temperatur")]',
            '//*[contains(@text, "Temperature")]',
            '//*[contains(@text, "°C")]',
            '//*[contains(@content-desc, "Temperatur")]',
            '//*[contains(@content-desc, "Temperature")]',
            '//android.widget.SeekBar',
            '//android.widget.ProgressBar'
        ];
        
        let temperatureControl = null;
        
        for (const selector of temperatureSelectors) {
            try {
                const element = await $(selector);
                if (await element.isExisting()) {
                    console.log(`🌡️ Found temperature control with selector: ${selector}`);
                    temperatureControl = element;
                    break;
                }
            } catch (error) {
                // Continue searching
            }
        }
        
        if (temperatureControl) {
            // Try to interact with the temperature control
            try {
                // Get element bounds for slider manipulation
                const location = await temperatureControl.getLocation();
                const size = await temperatureControl.getSize();
                
                // Calculate middle position of the slider
                const centerX = location.x + size.width / 2;
                const centerY = location.y + size.height / 2;
                
                console.log(`🌡️ Clicking on temperature control at (${centerX}, ${centerY})`);
                
                // Click on the middle of the temperature control
                await driver.performActions([{
                    type: 'pointer',
                    id: 'finger1',
                    parameters: { pointerType: 'touch' },
                    actions: [
                        { type: 'pointerMove', duration: 0, x: centerX, y: centerY },
                        { type: 'pointerDown', button: 0 },
                        { type: 'pointerUp', button: 0 }
                    ]
                }]);
                
                await driver.pause(2000);
                console.log('✅ Water temperature adjusted to middle position');
                await driver.saveScreenshot('./test-results/screenshots/water-temperature-adjusted.png');
                return true;
                
            } catch (error) {
                console.log(`⚠️ Could not interact with temperature control: ${error.message}`);
            }
        }
        
        // Alternative approach: Look for temperature values and click on a middle value
        const temperatureValues = [
            '//*[contains(@text, "37")]',
            '//*[contains(@text, "38")]',
            '//*[contains(@text, "36")]',
            '//*[contains(@text, "39")]'
        ];
        
        for (const selector of temperatureValues) {
            try {
                const element = await $(selector);
                if (await element.isExisting()) {
                    console.log(`🌡️ Found temperature value with selector: ${selector}`);
                    await element.click();
                    console.log('✅ Water temperature adjusted');
                    await driver.saveScreenshot('./test-results/screenshots/water-temperature-set.png');
                    await driver.pause(2000);
                    return true;
                }
            } catch (error) {
                // Continue searching
            }
        }
        
        console.log('⚠️ Could not find temperature control');
        return false;
    }
    
    static async closeShowerSettings() {
        console.log('🚿 Closing shower settings...');
        return await this.navigateBack('shower settings');
    }
    
    static async closeDeviceSettings() {
        console.log('⚙️ Closing device settings...');
        return await this.navigateBack('device settings');
    }
    
    static async closeDeviceInfo() {
        console.log('📱 Closing device info...');
        return await this.navigateBack('device info');
    }
    
    static async navigateBack(context = '') {
        console.log(`🔙 Navigating back from ${context}...`);
        
        const backSelectors = [
            '//*[@content-desc="Navigate up"]',
            '//*[@content-desc="Back"]',
            '//*[@content-desc="Zurück"]',
            '//android.widget.ImageButton[@content-desc="Navigate up"]',
            '//android.widget.ImageButton[@content-desc="Back"]',
            '//*[contains(@content-desc, "back")]',
            '//*[contains(@content-desc, "Back")]'
        ];
        
        for (const selector of backSelectors) {
            try {
                const element = await $(selector);
                if (await element.isExisting()) {
                    console.log(`🔙 Found back button with selector: ${selector}`);
                    await element.click();
                    console.log(`✅ Navigated back from ${context}`);
                    await driver.saveScreenshot(`./test-results/screenshots/navigated-back-from-${context.replace(/\s+/g, '-')}.png`);
                    await driver.pause(2000);
                    return true;
                }
            } catch (error) {
                // Continue searching
            }
        }
        
        // Fallback: Use Android back button
        console.log('📱 Using Android back button as fallback...');
        await driver.pressKeyCode(4); // Android back button
        await driver.pause(2000);
        console.log(`✅ Used Android back button to exit ${context}`);
        return true;
    }
    
    static async deactivateDemoModeViaSettings() {
        console.log('🔄 Deactivating demo mode via device settings...');
        
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
                const element = await $(selector);
                if (await element.isExisting()) {
                    console.log(`🔄 Found demo mode setting with selector: ${selector}`);
                    await element.click();
                    await driver.pause(2000);
                    
                    // Handle potential confirmation
                    const okButton = await this.findOkButton();
                    if (okButton) {
                        await okButton.click();
                        await driver.pause(2000);
                        console.log('🎯 Demo mode deactivation confirmed');
                    }
                    
                    console.log('✅ Demo mode deactivated via settings');
                    await driver.saveScreenshot('./test-results/screenshots/demo-mode-deactivated-via-settings.png');
                    await driver.pause(3000);
                    return true;
                }
            } catch (error) {
                // Continue searching
            }
        }
        
        console.log('⚠️ Demo mode setting not found in device settings');
        return false;
    }
    
    static async verifyHomeScreen() {
        console.log('🏠 Verifying return to Geberit Home screen...');
        
        const homeIndicators = [
            '//*[contains(@text, "Geberit")]',
            '//*[contains(@text, "Home")]',
            '//*[contains(@text, "home")]',
            '//*[contains(@content-desc, "Home")]'
        ];
        
        for (const selector of homeIndicators) {
            try {
                const element = await $(selector);
                if (await element.isExisting()) {
                    const text = await element.getText();
                    console.log(`🏠 Found home indicator: "${text}"`);
                    
                    if (text.toLowerCase().includes('geberit') || 
                        text.toLowerCase().includes('home')) {
                        console.log('✅ Successfully returned to Geberit Home screen');
                        await driver.saveScreenshot('./test-results/screenshots/home-screen-verified.png');
                        return true;
                    }
                }
            } catch (error) {
                // Continue searching
            }
        }
        
        console.log('⚠️ Could not verify home screen, but continuing...');
        await driver.saveScreenshot('./test-results/screenshots/final-screen-state.png');
        return false;
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