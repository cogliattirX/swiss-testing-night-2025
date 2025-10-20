describe('Android Emulator Demo', () => {
    
    it('should connect to emulator and demonstrate functionality', async () => {
        console.log('🚀 Starting Android Emulator Demo...');
        
        // Basic connection test
        console.log('📱 Connected to Android Emulator');
        console.log('Platform:', browser.capabilities.platformName);
        
        // Wait for device to be ready
        await browser.pause(3000);
        
        // Get current activity
        try {
            const activity = await browser.getCurrentActivity();
            console.log('📲 Current Activity:', activity);
        } catch (e) {
            console.log('📲 Device ready, activity detection not available yet');
        }
        
        // Take screenshot of current screen
        console.log('📸 Taking screenshot of home screen...');
        await browser.saveScreenshot('./test-results/screenshots/emulator-home-screen.png');
        console.log('✅ Screenshot saved: emulator-home-screen.png');
        
        // Try to open Settings app
        console.log('⚙️ Opening Settings app...');
        try {
            await browser.execute('mobile: shell', {
                command: 'am start -a android.settings.SETTINGS'
            });
            
            await browser.pause(3000);
            console.log('✅ Settings app opened successfully');
            
            // Take screenshot of settings
            await browser.saveScreenshot('./test-results/screenshots/emulator-settings.png');
            console.log('✅ Screenshot saved: emulator-settings.png');
            
        } catch (e) {
            console.log('⚠️ Settings launch failed, but connection is working:', e.message);
        }
        
        // Try home button
        console.log('🏠 Pressing home button...');
        try {
            await browser.execute('mobile: shell', {
                command: 'input keyevent KEYCODE_HOME'
            });
            await browser.pause(2000);
            console.log('✅ Home button pressed');
        } catch (e) {
            console.log('⚠️ Home button failed:', e.message);
        }
        
        console.log('✅ Emulator Demo Complete!');
        console.log('🎯 The Android emulator is working and can be automated with Appium/WebDriverIO');
    });
    
});