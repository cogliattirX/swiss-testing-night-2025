exports.config = {
    runner: 'local',
    
    specs: [
        'C:/git/swiss-testing-night-2025/mobile/test/specs/sauce-demo/*.spec.js'
    ],
    
    capabilities: [{
        platformName: 'Android',
        'appium:deviceName': 'emulator-5554',
        'appium:automationName': 'UiAutomator2',
        'appium:appPackage': 'com.saucelabs.mydemoapp.android',
        'appium:appActivity': '.view.activities.SplashActivity',
        'appium:noReset': false,
        'appium:autoGrantPermissions': true,
        'appium:newCommandTimeout': 300
    }],
    
    services: [
        ['appium', {
            command: 'appium',
            args: {
                port: 4723,
                address: 'localhost'
            },
            logPath: './test-results/logs/'
        }]
    ],
    
    logLevel: 'info',
    waitforTimeout: 30000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    
    framework: 'mocha',
    reporters: ['spec'],
    
    mochaOpts: {
        ui: 'bdd',
        timeout: 300000
    },
    
    onPrepare: function () {
        console.log('🛒 Starting Sauce Labs Demo App Tests');
        const fs = require('fs');
        if (!fs.existsSync('./test-results/screenshots')) {
            fs.mkdirSync('./test-results/screenshots', { recursive: true });
        }
        if (!fs.existsSync('./test-results/logs')) {
            fs.mkdirSync('./test-results/logs', { recursive: true });
        }
    },
    
    beforeTest: function (test, context) {
        console.log(`📱 Starting test: ${test.title}`);
    },
    
    afterTest: function(test, context, { error, result, duration, passed, retries }) {
        if (error) {
            console.log(`❌ Test failed: ${test.title}`);
            // Take screenshot on failure
            driver.saveScreenshot(`./test-results/screenshots/FAILED_${test.title.replace(/\s+/g, '_')}_${Date.now()}.png`);
        } else {
            console.log(`✅ Test passed: ${test.title}`);
        }
    }
};