// Advanced E2E Test Configuration with Appium Service
const config = {
    runner: 'local',
    
    specs: [
        '../test/specs/**/*.spec.js'
    ],
    
    maxInstances: 1,
    
    capabilities: [{
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        'appium:deviceName': 'Android Emulator',
        'appium:avd': 'Pixel_8a_API_36',
        'appium:avdLaunchTimeout': 120000,
        'appium:newCommandTimeout': 240,
        'appium:appPackage': 'com.saucelabs.mydemoapp.android',
        'appium:appActivity': '.view.activities.SplashActivity',
        'appium:noReset': true,
        'appium:fullReset': false,
        'appium:autoGrantPermissions': true
    }],
    
    logLevel: 'info',
    bail: 0,
    waitforTimeout: 30000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    
    framework: 'mocha',
    
    mochaOpts: {
        ui: 'bdd',
        timeout: 180000, // 3 minutes for advanced tests
        retries: 1
    },
    
    onPrepare: function () {
        console.log('🚀 Starting Advanced E2E Test...');
    },
    
    beforeSession: function (config, capabilities, specs) {
        console.log('🔧 Setting up advanced test session...');
    },
    
    before: function (capabilities, specs) {
        console.log('🎯 Advanced E2E Test Environment Ready');
        console.log(`📋 Test specs: ${specs.join(', ')}`);
    },
    
    afterTest: function(test, context, { error, result, duration, passed, retries }) {
        if (error) {
            console.log(`❌ Test failed: ${test.title}`);
        } else {
            console.log(`✅ Test passed: ${test.title} (${duration}ms)`);
        }
    },
    
    onComplete: function(exitCode, config, capabilities, results) {
        console.log('🏁 Advanced E2E Test Session Complete');
        console.log(`📊 Results: ${results.passed} passed, ${results.failed} failed`);
    },
    
    // Use built-in Appium service
    services: [
        ['appium', {
            args: {
                address: 'localhost',
                port: 4723,
                relaxedSecurity: true
            },
            logPath: './test-results/logs/'
        }]
    ],
    
    reporters: ['spec']
};

module.exports = { config };