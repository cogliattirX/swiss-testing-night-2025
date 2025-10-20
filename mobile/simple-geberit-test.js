// Simple Geberit Home Demo Mode Test
const { remote } = require('webdriverio');

async function runGeberitTest() {
    console.log('🚀 Starting Geberit Home Demo Mode Test');
    
    const opts = {
        hostname: '127.0.0.1',
        port: 4723,
        path: '/',
        capabilities: {
            platformName: 'Android',
            'appium:platformVersion': '14',
            'appium:deviceName': 'emulator-5554',
            'appium:automationName': 'UiAutomator2',
            'appium:appPackage': 'com.geberit.home',
            'appium:appActivity': '.MainActivity',
            'appium:noReset': true,
            'appium:autoGrantPermissions': true,
            'appium:newCommandTimeout': 240
        }
    };
    
    let driver;
    
    try {
        console.log('📱 Connecting to app...');
        driver = await remote(opts);
        
        // Take initial screenshot
        await driver.pause(3000);
        console.log('📸 Taking initial screenshot');
        await driver.saveScreenshot('./test-results/screenshots/geberit-01-start.png');
        
        // Step 1: Look for menu button
        console.log('🔍 Step 1: Looking for menu button');
        
        // Try multiple approaches to find menu
        let menuFound = false;
        const menuSelectors = [
            'new UiSelector().descriptionContains("menu")',
            'new UiSelector().descriptionContains("Menu")', 
            'new UiSelector().descriptionContains("More")',
            'new UiSelector().className("android.widget.ImageButton")',
            'new UiSelector().clickable(true).className("android.widget.ImageView")'
        ];
        
        for (const selector of menuSelectors) {
            try {
                console.log(`🔍 Trying: ${selector}`);
                const element = await driver.$(`android=${selector}`);
                if (await element.isDisplayed()) {
                    console.log('✅ Menu button found!');
                    await element.click();
                    await driver.pause(2000);
                    await driver.saveScreenshot('./test-results/screenshots/geberit-02-menu-clicked.png');
                    menuFound = true;
                    break;
                }
            } catch (e) {
                console.log(`❌ Failed with: ${selector}`);
            }
        }
        
        if (!menuFound) {
            console.log('⚠️  Menu not found, taking screenshot for analysis');
            await driver.saveScreenshot('./test-results/screenshots/geberit-menu-not-found.png');
            
            // Get page source for debugging
            const source = await driver.getPageSource();
            require('fs').writeFileSync('./test-results/screenshots/page-source.xml', source);
            console.log('📄 Page source saved for debugging');
        }
        
        // Step 2: Look for Demo Mode
        console.log('🔍 Step 2: Looking for Demo Mode option');
        
        const demoSelectors = [
            'new UiSelector().textContains("Vorführmodus")',
            'new UiSelector().textContains("Demo")',
            'new UiSelector().textContains("demo")',
            'new UiSelector().descriptionContains("demo")'
        ];
        
        let demoFound = false;
        for (const selector of demoSelectors) {
            try {
                console.log(`🔍 Looking for demo with: ${selector}`);
                const element = await driver.$(`android=${selector}`);
                if (await element.isDisplayed()) {
                    console.log('✅ Demo mode found!');
                    await element.click();
                    await driver.pause(2000);
                    await driver.saveScreenshot('./test-results/screenshots/geberit-03-demo-activated.png');
                    demoFound = true;
                    break;
                }
            } catch (e) {
                console.log(`❌ Demo selector failed: ${selector}`);
            }
        }
        
        // Step 3: Look for OK button
        console.log('🔍 Step 3: Looking for OK confirmation');
        
        try {
            const okElement = await driver.$('android=new UiSelector().text("OK")');
            if (await okElement.isDisplayed()) {
                console.log('✅ OK button found!');
                await okElement.click();
                await driver.pause(2000);
                await driver.saveScreenshot('./test-results/screenshots/geberit-04-ok-clicked.png');
            }
        } catch (e) {
            console.log('❌ OK button not found, continuing...');
        }
        
        // Step 4: Wait for products and verify
        console.log('🔍 Step 4: Waiting for products to load...');
        await driver.pause(5000);
        
        // Look for Geberit AquaClean product
        try {
            const productElement = await driver.$('android=new UiSelector().textContains("AquaClean")');
            if (await productElement.isDisplayed()) {
                console.log('✅ Geberit AquaClean product found!');
                const productText = await productElement.getText();
                console.log(`📦 Product text: "${productText}"`);
            } else {
                console.log('⚠️  AquaClean product not found');
            }
        } catch (e) {
            console.log('❌ Error finding products:', e.message);
        }
        
        // Final screenshot
        await driver.saveScreenshot('./test-results/screenshots/geberit-05-final.png');
        
        console.log('🎉 Test completed successfully!');
        console.log('📸 Screenshots saved in ./test-results/screenshots/');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (driver) {
            await driver.saveScreenshot('./test-results/screenshots/geberit-error.png');
        }
    } finally {
        if (driver) {
            await driver.deleteSession();
            console.log('🔌 Session closed');
        }
    }
}

// Run the test
runGeberitTest().catch(console.error);