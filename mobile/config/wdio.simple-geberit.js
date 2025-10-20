exports.config = {
    // Test runner
    runner: 'local',
    
    // Host and port for existing Appium server
    hostname: 'localhost',
    port: 4723,
    path: '/',
    
    // Capabilities
    capabilities: [{
        platformName: 'Android',
        'appium:deviceName': 'emulator-5554',
        'appium:automationName': 'UiAutomator2',
        'appium:appPackage': 'com.geberit.home',
        'appium:appActivity': '.MainActivity',
        'appium:noReset': true,
        'appium:autoGrantPermissions': true,
        'appium:newCommandTimeout': 240
    }],
    
    // Test configuration
    logLevel: 'info',
    waitforTimeout: 30000,
    connectionRetryTimeout: 90000,
    connectionRetryCount: 3,
    
    // Framework
    framework: 'mocha',
    
    // Mocha options
    mochaOpts: {
        ui: 'bdd',
        timeout: 300000
    },
    
    // Hooks
    onPrepare: function () {
        console.log('🚀 Starting Geberit Home Test');
    },
    
    before: function () {
        // Ensure screenshots directory exists
        const fs = require('fs');
        const path = './test-results/screenshots';
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
        }
    }
};