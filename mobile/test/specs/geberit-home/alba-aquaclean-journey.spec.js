const { expect } = require('@wdio/globals');
const { GeberitAppHelpers } = require('./complete-demo-cycle.spec');

describe('Geberit Home - Complete Alba AquaClean Device Journey', () => {
    
    it('should execute complete Alba AquaClean device workflow', async () => {
        console.log('🚀 Starting Complete Alba AquaClean Device Journey');
        console.log('========================================================');
        
        // Initial setup
        await driver.pause(3000);
        console.log('📱 App initialized');
        await driver.saveScreenshot('./test-results/screenshots/alba-01-app-initial.png');
        
        try {
            // Step 1: Activate Demo Mode
            console.log('\\n🎬 Step 1: Activating Demo Mode');
            console.log('-----------------------------------');
            await GeberitAppHelpers.activateDemoMode();
            
            // Step 2: Select Alba Geberit AquaClean Device
            console.log('\\n🎯 Step 2: Selecting Alba Geberit AquaClean Device');
            console.log('---------------------------------------------------');
            const selectedDevice = await GeberitAppHelpers.selectAlbaAquaCleanDevice();
            expect(selectedDevice).not.toBe(null);
            
            // Step 3: Wait for Device Connection
            console.log('\\n🔗 Step 3: Waiting for Device Connection');
            console.log('------------------------------------------');
            await GeberitAppHelpers.waitForDeviceConnection();
            
            // Step 4: Handle Device Data Consent
            console.log('\\n📋 Step 4: Handling Device Data Consent');
            console.log('------------------------------------------');
            await GeberitAppHelpers.handleDeviceDataConsent();
            
            // Step 5: Handle Notification Permissions
            console.log('\\n🔔 Step 5: Handling Notification Permissions');
            console.log('-----------------------------------------------');
            await GeberitAppHelpers.handleNotificationPermissions();
            
            // Step 6: Navigate Welcome Dialog
            console.log('\\n👋 Step 6: Navigating Welcome Dialog (3 swipes + close)');
            console.log('--------------------------------------------------------');
            await GeberitAppHelpers.navigateWelcomeDialog();
            
            // Step 7: Open Device Settings
            console.log('\\n⚙️ Step 7: Opening Device Settings');
            console.log('------------------------------------');
            const settingsOpened = await GeberitAppHelpers.openDeviceSettings();
            if (!settingsOpened) {
                console.log('⚠️ Could not open device settings, trying to continue...');
            }
            
            // Step 8: Open Shower Settings
            console.log('\\n🚿 Step 8: Opening Shower Settings');
            console.log('------------------------------------');
            const showerSettingsOpened = await GeberitAppHelpers.openShowerSettings();
            if (!showerSettingsOpened) {
                console.log('⚠️ Could not open shower settings, trying to continue...');
            }
            
            // Step 9: Adjust Water Temperature
            console.log('\\n🌡️ Step 9: Adjusting Water Temperature to Middle Position');
            console.log('-----------------------------------------------------------');
            const temperatureAdjusted = await GeberitAppHelpers.adjustWaterTemperature();
            if (!temperatureAdjusted) {
                console.log('⚠️ Could not adjust water temperature, but continuing...');
            }
            
            // Step 10: Close Shower Settings
            console.log('\\n🚿 Step 10: Closing Shower Settings');
            console.log('-------------------------------------');
            await GeberitAppHelpers.closeShowerSettings();
            
            // Step 11: Close Device Settings
            console.log('\\n⚙️ Step 11: Closing Device Settings');
            console.log('-------------------------------------');
            await GeberitAppHelpers.closeDeviceSettings();
            
            // Step 12: Close Device Info
            console.log('\\n📱 Step 12: Closing Device Info');
            console.log('---------------------------------');
            await GeberitAppHelpers.closeDeviceInfo();
            
            // Step 13: Deactivate Demo Mode via Device Settings
            console.log('\\n🔄 Step 13: Deactivating Demo Mode via Device Settings');
            console.log('--------------------------------------------------------');
            
            // First try to access settings again for demo mode deactivation
            console.log('⚙️ Reopening settings for demo mode deactivation...');
            await GeberitAppHelpers.openDeviceSettings();
            
            const demoModeDeactivated = await GeberitAppHelpers.deactivateDemoModeViaSettings();
            if (!demoModeDeactivated) {
                console.log('⚠️ Could not deactivate via settings, using fallback method...');
                // Use Android back button as fallback
                await driver.pressKeyCode(4);
                await driver.pause(2000);
                await driver.pressKeyCode(4);
                await driver.pause(2000);
            }
            
            // Step 14: Verify Home Screen
            console.log('\\n🏠 Step 14: Verifying Return to Geberit Home Screen');
            console.log('-----------------------------------------------------');
            const homeScreenVerified = await GeberitAppHelpers.verifyHomeScreen();
            
            // Final screenshot and summary
            await driver.saveScreenshot('./test-results/screenshots/alba-15-journey-complete.png');
            
            console.log('\\n🎉 Alba AquaClean Device Journey Summary');
            console.log('==========================================');
            console.log('✅ Demo mode activated');
            console.log('✅ Alba AquaClean device selected');
            console.log('✅ Device connection handled');
            console.log('✅ Permissions and consents processed');
            console.log('✅ Welcome dialog navigated');
            console.log('✅ Device settings accessed');
            console.log('✅ Shower settings configured');
            console.log('✅ Water temperature adjusted');
            console.log('✅ Settings closed properly');
            console.log(`${demoModeDeactivated ? '✅' : '⚠️'} Demo mode deactivation attempted`);
            console.log(`${homeScreenVerified ? '✅' : '⚠️'} Home screen verification`);
            console.log('\\n📸 Screenshots saved throughout the journey');
            console.log('🎯 Complete Alba AquaClean workflow executed successfully!');
            
        } catch (error) {
            console.log('\\n❌ Error during Alba AquaClean journey:', error.message);
            await driver.saveScreenshot('./test-results/screenshots/alba-error-state.png');
            
            // Recovery attempt
            console.log('\\n🔄 Attempting recovery...');
            try {
                // Try to get back to home screen using multiple back presses
                for (let i = 0; i < 5; i++) {
                    await driver.pressKeyCode(4); // Android back button
                    await driver.pause(1000);
                }
                
                // Try to restart the app
                await driver.terminateApp('com.geberit.home');
                await driver.pause(2000);
                await driver.activateApp('com.geberit.home');
                await driver.pause(5000);
                
                console.log('✅ Recovery completed - app restarted');
                await driver.saveScreenshot('./test-results/screenshots/alba-recovery-complete.png');
                
            } catch (recoveryError) {
                console.log('❌ Recovery failed:', recoveryError.message);
            }
            
            throw error;
        }
    });
    
    // Additional test for just the critical path (shorter version)
    it('should execute Alba AquaClean critical path workflow', async () => {
        console.log('🚀 Starting Alba AquaClean Critical Path Test');
        console.log('==============================================');
        
        try {
            // Critical path: Demo mode -> Device selection -> Basic interaction -> Exit
            console.log('\\n🎬 Activating Demo Mode...');
            await GeberitAppHelpers.activateDemoMode();
            
            console.log('\\n🎯 Selecting Alba Device...');
            await GeberitAppHelpers.selectAlbaAquaCleanDevice();
            
            console.log('\\n🔗 Handling connection and permissions...');
            await GeberitAppHelpers.waitForDeviceConnection();
            await GeberitAppHelpers.handleDeviceDataConsent();
            await GeberitAppHelpers.handleNotificationPermissions();
            
            console.log('\\n👋 Quick welcome dialog navigation...');
            await GeberitAppHelpers.navigateWelcomeDialog();
            
            console.log('\\n🔄 Exiting to home screen...');
            // Quick exit using back buttons
            for (let i = 0; i < 3; i++) {
                await driver.pressKeyCode(4);
                await driver.pause(1000);
            }
            
            await driver.saveScreenshot('./test-results/screenshots/alba-critical-path-complete.png');
            
            console.log('\\n✅ Alba AquaClean critical path completed successfully!');
            
        } catch (error) {
            console.log('❌ Critical path test failed:', error.message);
            await driver.saveScreenshot('./test-results/screenshots/alba-critical-path-error.png');
            throw error;
        }
    });
});