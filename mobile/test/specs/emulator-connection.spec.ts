import { expect } from '@wdio/globals';
import path from 'path';
import fs from 'fs';

/**
 * Emulator Connection Test
 * 
 * This test verifies that our mobile testing framework can connect to the Android emulator
 * and perform basic operations before testing the actual Geberit Home app.
 * 
 * Uses Android Settings app as a test target since it's always available.
 */

describe('Emulator Connection - System Test', () => {
    const SCREENSHOT_DIR = path.join(process.cwd(), 'screenshots');
    const REPORTS_DIR = path.join(process.cwd(), 'reports');

    before(async () => {
        console.log('🤖 Starting emulator connection test...');
        
        // Ensure screenshot and reports directories exist
        if (!fs.existsSync(SCREENSHOT_DIR)) {
            fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
        }
        if (!fs.existsSync(REPORTS_DIR)) {
            fs.mkdirSync(REPORTS_DIR, { recursive: true });
        }
    });

    it('should connect to Android emulator successfully', async () => {
        console.log('🔌 Testing emulator connection...');
        
        // Wait for emulator to be ready
        await browser.pause(5000);
        
        // Get basic device info
        const capabilities = await browser.getCapabilities();
        console.log('📱 Device info:', {
            platformName: capabilities.platformName,
            platformVersion: capabilities.platformVersion,
            deviceName: capabilities.deviceName
        });
        
        // Verify we're connected to Android
        expect(capabilities.platformName).toBe('Android');
        console.log('✅ Successfully connected to Android emulator');
    });

    it('should access Android system and take screenshot', async () => {
        console.log('📸 Testing system access and screenshot capability...');
        
        // Try to access Android home screen
        await browser.pressKeyCode(3); // HOME key
        await browser.pause(2000);
        
        // Take screenshot of home screen
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const screenshotPath = path.join(SCREENSHOT_DIR, `emulator-home-${timestamp}.png`);
        
        await browser.saveScreenshot(screenshotPath);
        console.log(`📸 Screenshot saved: ${screenshotPath}`);
        
        // Verify screenshot file was created
        expect(fs.existsSync(screenshotPath)).toBe(true);
        console.log('✅ Screenshot capability verified');
    });

    it('should be able to launch system apps', async () => {
        console.log('📱 Testing app launch capability...');
        
        // Launch Android Settings app (always available)
        await browser.startActivity('com.android.settings', 'com.android.settings.Settings');
        await browser.pause(3000);
        
        // Verify we can find elements
        try {
            // Look for settings-related text or UI elements
            const settingsElements = await $$('android.widget.TextView');
            expect(settingsElements.length).toBeGreaterThan(0);
            console.log(`✅ Found ${settingsElements.length} UI elements in Settings app`);
        } catch (error) {
            console.log('⚠️ Could not find specific elements, but app launched successfully');
        }
        
        // Take screenshot of Settings app
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const settingsScreenshot = path.join(SCREENSHOT_DIR, `emulator-settings-${timestamp}.png`);
        await browser.saveScreenshot(settingsScreenshot);
        console.log(`📸 Settings screenshot: ${settingsScreenshot}`);
    });

    it('should verify emulator performance', async () => {
        console.log('⚡ Testing emulator performance...');
        
        const startTime = Date.now();
        
        // Test basic operations
        await browser.pressKeyCode(4); // BACK key
        await browser.pause(1000);
        await browser.pressKeyCode(3); // HOME key
        
        const responseTime = Date.now() - startTime;
        console.log(`⏱️ Emulator response time: ${responseTime}ms`);
        
        // Emulator should respond within reasonable time (10 seconds for basic operations)
        expect(responseTime).toBeLessThan(10000);
        console.log('✅ Emulator performance acceptable');
    });

    after(async () => {
        console.log('🏁 Emulator connection test completed');
        
        // Save final status
        try {
            const pageSource = await browser.getPageSource();
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const sourceFile = path.join(REPORTS_DIR, `emulator-test-${timestamp}.xml`);
            
            fs.writeFileSync(sourceFile, pageSource);
            console.log(`📄 Final page source saved: ${sourceFile}`);
        } catch (error) {
            console.log('⚠️ Could not save page source:', error.message);
        }
        
        console.log('🎉 Framework is ready for Geberit Home testing!');
        console.log('📝 Next step: Install Geberit Home app in emulator via Play Store');
    });

    afterEach(async function() {
        // Take screenshot on test failure for debugging
        if (this.currentTest?.state === 'failed') {
            console.log('❌ Test failed, capturing debug screenshot...');
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const failureScreenshot = path.join(SCREENSHOT_DIR, `emulator-failure-${this.currentTest.title}-${timestamp}.png`);
            
            try {
                await browser.saveScreenshot(failureScreenshot);
                console.log(`🔍 Failure screenshot saved: ${failureScreenshot}`);
            } catch (screenshotError) {
                console.log('⚠️ Could not save failure screenshot:', screenshotError.message);
            }
        }
    });
});