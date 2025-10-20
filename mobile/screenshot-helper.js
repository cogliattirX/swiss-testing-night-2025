const { remote } = require('webdriverio');

async function takeScreenshot() {
    const driver = await remote({
        hostname: 'localhost',
        port: 4723,
        capabilities: {
            platformName: 'Android',
            'appium:deviceName': 'emulator-5554',
            'appium:appPackage': 'com.saucelabs.mydemoapp.android',
            'appium:appActivity': 'com.saucelabs.mydemoapp.android.view.activities.MainActivity',
            'appium:automationName': 'UiAutomator2',
            'appium:noReset': true,
            'appium:fullReset': false
        }
    });

    try {
        console.log('📱 Aktueller Screenshot wird erstellt...');
        await driver.saveScreenshot('./screenshots/current-app-state.png');
        console.log('✅ Screenshot gespeichert als: screenshots/current-app-state.png');
        
        console.log('🔍 Suche nach Hamburger-Menü...');
        const menuElements = await driver.$$('//android.widget.ImageView[@content-desc="open menu"]');
        if (menuElements.length > 0) {
            console.log('✅ Hamburger-Menü gefunden!');
        } else {
            console.log('❌ Hamburger-Menü nicht gefunden, suche nach alternativen Selektoren...');
            const altMenuElements = await driver.$$('//android.view.ViewGroup[contains(@content-desc, "menu")]');
            console.log(`Gefundene Menu-ähnliche Elemente: ${altMenuElements.length}`);
        }
        
    } catch (error) {
        console.error('❌ Fehler beim Screenshot:', error.message);
    } finally {
        await driver.deleteSession();
    }
}

takeScreenshot().catch(console.error);