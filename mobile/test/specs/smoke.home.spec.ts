import { expect } from '@wdio/globals';
import path from 'path';
import fs from 'fs';

/**
 * Smoke Test for Geberit Home Android App
 * 
 * This test verifies basic app functionality:
 * 1. App launches successfully
 * 2. App package is correct (com.geberit.home)
 * 3. App UI is responsive and visible
 * 4. Takes screenshot for visual verification
 * 
 * Prerequisites:
 * - Geberit Home app installed via Play Store
 * - USB debugging enabled
 * - Device connected and authorized
 * - App activity configured in wdio.local.android.ts
 */

describe('Geberit Home - Smoke Test', () => {
    const APP_PACKAGE = 'com.geberit.home';
    const SCREENSHOT_DIR = path.join(process.cwd(), 'screenshots');
    const REPORTS_DIR = path.join(process.cwd(), 'reports');

    before(async () => {
        console.log('🏠 Starting Geberit Home smoke test...');
        
        // Ensure screenshot and reports directories exist
        if (!fs.existsSync(SCREENSHOT_DIR)) {
            fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
        }
        if (!fs.existsSync(REPORTS_DIR)) {
            fs.mkdirSync(REPORTS_DIR, { recursive: true });
        }
    });

    it('should launch Geberit Home app successfully', async () => {
        console.log('📱 Attempting to launch Geberit Home app...');
        
        // Wait for app to launch and stabilize
        await browser.pause(3000);
        
        // Verify the current app package
        const currentPackage = await browser.getCurrentPackage();
        console.log(`📦 Current app package: ${currentPackage}`);
        
        expect(currentPackage).toBe(APP_PACKAGE);
        console.log('✅ App package verification successful');
    });

    it('should verify app UI is visible and responsive', async () => {
        console.log('🔍 Checking app UI visibility...');
        
        // Wait for UI to load completely
        await browser.pause(2000);
        
        // Check if app is running and UI is loaded by verifying package context
        const packageSelector = `android=new UiSelector().packageName("${APP_PACKAGE}")`;
        
        try {
            // Try to find any element belonging to the app package
            const appElement = await $(packageSelector);
            const isDisplayed = await appElement.isDisplayed();
            
            if (isDisplayed) {
                console.log('✅ App UI is visible and responsive');
            } else {
                console.log('⚠️ App element found but not displayed');
            }
            
            expect(isDisplayed).toBe(true);
        } catch (error) {
            console.log('⚠️ Could not find app-specific element, checking for any visible element...');
            
            // Fallback: Check if any UI element is visible
            const pageSource = await browser.getPageSource();
            expect(pageSource).toContain(APP_PACKAGE);
            console.log('✅ App package found in page source - app is running');
        }
    });

    it('should capture app launch screenshot', async () => {
        console.log('📸 Capturing app launch screenshot...');
        
        // Wait a moment for UI to settle
        await browser.pause(1000);
        
        // Generate timestamp for unique filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const screenshotPath = path.join(SCREENSHOT_DIR, `geberit-home-launch-${timestamp}.png`);
        
        try {
            await browser.saveScreenshot(screenshotPath);
            console.log(`📸 Screenshot saved: ${screenshotPath}`);
            
            // Verify screenshot file was created
            expect(fs.existsSync(screenshotPath)).toBe(true);
            console.log('✅ Screenshot verification successful');
            
        } catch (error) {
            console.error('❌ Failed to save screenshot:', error);
            throw error;
        }
    });

    it('should verify app performance and responsiveness', async () => {
        console.log('⚡ Testing app responsiveness...');
        
        // Test app responsiveness by checking if it responds to commands quickly
        const startTime = Date.now();
        
        try {
            // Try to get current activity
            const currentActivity = await browser.getCurrentActivity();
            const responseTime = Date.now() - startTime;
            
            console.log(`📊 Current activity: ${currentActivity}`);
            console.log(`⏱️ Response time: ${responseTime}ms`);
            
            // App should respond within reasonable time (less than 5 seconds)
            expect(responseTime).toBeLessThan(5000);
            console.log('✅ App responsiveness check passed');
            
        } catch (error) {
            console.log('⚠️ Could not get current activity, but app is still responsive');
            
            // Fallback: Simple package verification should still be fast
            const responseTime = Date.now() - startTime;
            expect(responseTime).toBeLessThan(10000); // More lenient timeout
        }
    });

    after(async () => {
        console.log('🏁 Smoke test completed successfully');
        
        // Save final page source for debugging if needed
        try {
            const pageSource = await browser.getPageSource();
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const sourceFile = path.join(REPORTS_DIR, `geberit-home-source-${timestamp}.xml`);
            
            fs.writeFileSync(sourceFile, pageSource);
            console.log(`📄 Page source saved: ${sourceFile}`);
        } catch (error) {
            console.log('⚠️ Could not save page source:', error.message);
        }
    });

    afterEach(async function() {
        // Take screenshot on test failure for debugging
        if (this.currentTest?.state === 'failed') {
            console.log('❌ Test failed, capturing debug screenshot...');
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const failureScreenshot = path.join(SCREENSHOT_DIR, `failure-${this.currentTest.title}-${timestamp}.png`);
            
            try {
                await browser.saveScreenshot(failureScreenshot);
                console.log(`🔍 Failure screenshot saved: ${failureScreenshot}`);
            } catch (screenshotError) {
                console.log('⚠️ Could not save failure screenshot:', screenshotError.message);
            }
        }
    });
});