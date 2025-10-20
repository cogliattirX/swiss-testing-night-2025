const { remote } = require('webdriverio');

async function findMenuElements() {
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
        console.log('🔍 Suche nach verschiedenen Menu-Elementen...');
        
        // Verschiedene mögliche Selektoren für Hamburger-Menu
        const selectors = [
            '//android.widget.ImageView[@content-desc="open menu"]',
            '//android.widget.ImageView[contains(@content-desc, "menu")]',
            '//android.widget.ImageView[contains(@content-desc, "Menu")]',
            '//android.widget.ImageView[contains(@content-desc, "navigation")]',
            '//android.view.ViewGroup[contains(@content-desc, "menu")]',
            '//android.widget.Button[contains(@content-desc, "menu")]',
            '//*[@content-desc="More options"]',
            '//*[contains(@content-desc, "hamburger")]',
            '//*[contains(@content-desc, "drawer")]',
            '//android.widget.ImageView[@resource-id="android:id/home"]'
        ];

        for (let i = 0; i < selectors.length; i++) {
            const selector = selectors[i];
            console.log(`\nTeste Selektor ${i + 1}: ${selector}`);
            try {
                const elements = await driver.$$(selector);
                console.log(`✅ Gefunden: ${elements.length} Elemente`);
                if (elements.length > 0) {
                    // Erstes gefundenes Element analysieren
                    const element = elements[0];
                    const text = await element.getText().catch(() => 'N/A');
                    const contentDesc = await element.getAttribute('content-desc').catch(() => 'N/A');
                    const resourceId = await element.getAttribute('resource-id').catch(() => 'N/A');
                    console.log(`  Text: ${text}`);
                    console.log(`  Content-Desc: ${contentDesc}`);
                    console.log(`  Resource-ID: ${resourceId}`);
                }
            } catch (error) {
                console.log(`❌ Fehler: ${error.message}`);
            }
        }

        // Allgemeine Suche nach allen klickbaren Elementen
        console.log('\n🔍 Suche nach allen klickbaren Elementen...');
        const clickableElements = await driver.$$('//*[@clickable="true"]');
        console.log(`Gefundene klickbare Elemente: ${clickableElements.length}`);
        
        // Zeige die ersten 10 klickbaren Elemente
        for (let i = 0; i < Math.min(clickableElements.length, 10); i++) {
            const element = clickableElements[i];
            const text = await element.getText().catch(() => '');
            const contentDesc = await element.getAttribute('content-desc').catch(() => '');
            const className = await element.getAttribute('class').catch(() => '');
            
            if (text || contentDesc) {
                console.log(`  ${i + 1}. Text: "${text}" | Desc: "${contentDesc}" | Class: ${className}`);
            }
        }
        
    } catch (error) {
        console.error('❌ Fehler:', error.message);
    } finally {
        await driver.deleteSession();
    }
}

findMenuElements().catch(console.error);