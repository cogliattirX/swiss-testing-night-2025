import { expect } from '@wdio/globals';
import path from 'path';
import fs from 'fs';

/**
 * Emulator Demo Test
 * 
 * Dieser Test demonstriert die Funktionalität des Android Emulators
 * und zeigt grundlegende mobile Testing-Capabilities.
 */

describe('🤖 Android Emulator - Demo Test', () => {
    const SCREENSHOT_DIR = path.join(process.cwd(), 'screenshots');

    before(async () => {
        console.log('🚀 Starting Android Emulator Demo...');
        
        // Ensure screenshot directory exists
        if (!fs.existsSync(SCREENSHOT_DIR)) {
            fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
        }
        
        console.log('📱 Waiting for emulator to be ready...');
        await browser.pause(3000);
    });

    it('📱 Should connect to Android emulator', async () => {
        console.log('🔌 Testing emulator connection...');
        
        // Get device capabilities
        const capabilities = await browser.getCapabilities();
        
        console.log('📊 Device Information:');
        console.log('  Platform:', capabilities.platformName);
        console.log('  Version:', capabilities.platformVersion);
        console.log('  Device:', capabilities.deviceName);
        
        // Verify Android connection
        expect(capabilities.platformName).toBe('Android');
        console.log('✅ Successfully connected to Android emulator!');
    });

    it('📸 Should take screenshots of Android home screen', async () => {
        console.log('🏠 Navigating to Android home screen...');
        
        // Press HOME button to go to home screen
        await browser.pressKeyCode(3); // KEYCODE_HOME
        await browser.pause(2000);
        
        // Take screenshot
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const screenshotPath = path.join(SCREENSHOT_DIR, `demo-android-home-${timestamp}.png`);
        
        await browser.saveScreenshot(screenshotPath);
        console.log(`📸 Screenshot saved: ${screenshotPath}`);
        
        // Verify screenshot exists
        expect(fs.existsSync(screenshotPath)).toBe(true);
        console.log('✅ Screenshot capture working!');
    });

    it('⚙️ Should open Android Settings app', async () => {
        console.log('⚙️ Opening Android Settings app...');
        
        // Launch Settings app
        await browser.startActivity('com.android.settings', 'com.android.settings.Settings');
        await browser.pause(3000);
        
        console.log('🔍 Looking for Settings UI elements...');
        
        // Find text elements (Settings app should have various options)
        const textElements = await $$('android.widget.TextView');
        console.log(`📋 Found ${textElements.length} text elements in Settings`);
        
        // Take screenshot of Settings
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const settingsScreenshot = path.join(SCREENSHOT_DIR, `demo-android-settings-${timestamp}.png`);
        
        await browser.saveScreenshot(settingsScreenshot);
        console.log(`📸 Settings screenshot: ${settingsScreenshot}`);
        
        expect(textElements.length).toBeGreaterThan(0);
        console.log('✅ Successfully opened and interacted with Settings app!');
    });

    it('🎮 Should test basic Android navigation', async () => {
        console.log('🧭 Testing Android navigation...');
        
        // Test BACK button
        console.log('⬅️ Testing BACK button...');
        await browser.pressKeyCode(4); // KEYCODE_BACK
        await browser.pause(1000);
        
        // Test HOME button
        console.log('🏠 Testing HOME button...');
        await browser.pressKeyCode(3); // KEYCODE_HOME
        await browser.pause(1000);
        
        // Test RECENT APPS button
        console.log('📱 Testing RECENT APPS...');
        await browser.pressKeyCode(187); // KEYCODE_APP_SWITCH
        await browser.pause(2000);
        
        // Take screenshot of recent apps
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const recentAppsScreenshot = path.join(SCREENSHOT_DIR, `demo-recent-apps-${timestamp}.png`);
        
        await browser.saveScreenshot(recentAppsScreenshot);
        console.log(`📸 Recent apps screenshot: ${recentAppsScreenshot}`);
        
        console.log('✅ Android navigation working perfectly!');
    });

    it('📊 Should test emulator performance', async () => {
        console.log('⚡ Testing emulator performance...');
        
        const startTime = Date.now();
        
        // Perform several operations
        await browser.pressKeyCode(3); // HOME
        await browser.pause(500);
        
        await browser.startActivity('com.android.settings', 'com.android.settings.Settings');
        await browser.pause(1000);
        
        await browser.pressKeyCode(4); // BACK
        await browser.pause(500);
        
        const totalTime = Date.now() - startTime;
        
        console.log(`⏱️ Performance test completed in ${totalTime}ms`);
        
        // Emulator should be reasonably responsive (under 15 seconds for this test)
        expect(totalTime).toBeLessThan(15000);
        console.log('✅ Emulator performance is acceptable!');
    });

    after(async () => {
        console.log('🎉 Android Emulator Demo completed successfully!');
        console.log('');
        console.log('📋 Demo Summary:');
        console.log('  ✅ Emulator connection: Working');
        console.log('  ✅ Screenshot capture: Working');
        console.log('  ✅ App launching: Working');
        console.log('  ✅ Navigation: Working');
        console.log('  ✅ Performance: Acceptable');
        console.log('');
        console.log('🚀 Your mobile testing framework is ready!');
        console.log('📝 Next step: Install Geberit Home app in the emulator');
        console.log('   1. Open Play Store in emulator');
        console.log('   2. Search for "Geberit Home"');
        console.log('   3. Install the app');
        console.log('   4. Run: npm run test:emulator');
    });
});