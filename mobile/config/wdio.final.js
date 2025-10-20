exports.config = {
    runner: 'local',
    
    specs: [
        './test/specs/geberit-home/demo-mode.spec.js'
    ],
    
    capabilities: [{
        platformName: 'Android',
        'appium:deviceName': 'emulator-5554',
        'appium:automationName': 'UiAutomator2',
        'appium:appPackage': 'com.geberit.home',
        'appium:appActivity': '.MainActivity',
        'appium:noReset': true,
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
        console.log('🚀 Starting Geberit Home Test');
        const fs = require('fs');
        if (!fs.existsSync('./test-results/screenshots')) {
            fs.mkdirSync('./test-results/screenshots', { recursive: true });
        }
        if (!fs.existsSync('./test-results/logs')) {
            fs.mkdirSync('./test-results/logs', { recursive: true });
        }
    }
};