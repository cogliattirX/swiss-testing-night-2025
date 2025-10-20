exports.config = {
    runner: 'local',
    port: 4723,
    specs: [
        './test/specs/geberit-home/**/*.spec.js'
    ],
    maxInstances: 1,
    capabilities: [{
        platformName: 'Android',
        'appium:deviceName': 'emulator-5554',
        'appium:platformVersion': '11.0',
        'appium:automationName': 'UiAutomator2',
        'appium:appPackage': 'com.geberit.home',
        'appium:appActivity': 'com.geberit.home.MainActivity',
        'appium:noReset': false,
        'appium:fullReset': false,
        'appium:autoGrantPermissions': true,
        'appium:newCommandTimeout': 300,
        'appium:androidInstallTimeout': 120000
    }],
    logLevel: 'info',
    bail: 0,
    baseUrl: 'http://localhost',
    waitforTimeout: 30000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    services: [
        // Appium service disabled - assuming Appium is already running
        // ['appium', {
        //     command: 'appium',
        //     args: {
        //         relaxedSecurity: true,
        //         allowInsecure: ['chromedriver_autodownload'],
        //         address: 'localhost',
        //         port: 4723
        //     }
        // }]
    ],
    framework: 'mocha',
    reporters: [
        'spec'
        // Allure reporter disabled - requires additional package installation
        // ['allure', {
        //     outputDir: 'allure-results',
        //     disableWebdriverStepsReporting: true,
        //     disableWebdriverScreenshotsReporting: false
        // }]
    ],
    mochaOpts: {
        ui: 'bdd',
        timeout: 180000,
        compilers: ['js:@babel/register']
    },
    
    // Setup functions
    before: function (capabilities, specs) {
        console.log('🚀 Starting Geberit Home App Test Suite');
        console.log('📱 Device:', capabilities['appium:deviceName']);
        console.log('📦 App Package:', capabilities['appium:appPackage']);
        
        // Create screenshots directory
        const fs = require('fs');
        const path = require('path');
        const screenshotDir = path.join(process.cwd(), 'test-results', 'screenshots');
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }
    },
    
    beforeTest: function (test, context) {
        console.log(`\n🧪 Starting test: ${test.title}`);
        console.log(`📝 Description: ${test.fullTitle}`);
    },
    
    afterTest: function (test, context, { error, result, duration, passed, retries }) {
        if (passed) {
            console.log(`✅ Test passed: ${test.title} (${duration}ms)`);
        } else {
            console.log(`❌ Test failed: ${test.title}`);
            console.log(`💡 Error: ${error?.message || 'Unknown error'}`);
        }
    },
    
    after: function (result, capabilities, specs) {
        console.log('\n📊 Test Suite Complete');
        console.log('🔍 Check ./test-results/screenshots/ for captured screenshots');
    }
};