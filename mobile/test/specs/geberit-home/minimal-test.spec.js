const { expect } = require('@wdio/globals');

describe('Geberit Home - Minimal Connection Test', () => {
    it('should connect to app and take screenshot', async () => {
        console.log('🚀 Starting minimal Geberit Home test');
        
        // Wait for app to load
        await driver.pause(3000);
        console.log('📱 App should be loaded');
        
        // Take initial screenshot
        await driver.saveScreenshot('./test-results/screenshots/minimal-test-01-connected.png');
        console.log('📸 Screenshot taken: minimal-test-01-connected.png');
        
        // Get app package name to verify connection
        const currentPackage = await driver.getCurrentPackage();
        console.log(`📦 Current app package: ${currentPackage}`);
        
        // Verify we're connected to the right app
        expect(currentPackage).toBe('com.geberit.home');
        console.log('✅ Successfully connected to Geberit Home app');
        
        // Get screen size for reference
        const windowSize = await driver.getWindowSize();
        console.log(`📐 Screen size: ${windowSize.width} x ${windowSize.height}`);
        
        console.log('🎉 Minimal test completed successfully!');
    });
});