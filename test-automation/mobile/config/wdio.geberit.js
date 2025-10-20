exports.config = {
    // Test runner
    runner: 'local',
    
    // Specs
    specs: [
        './test/specs/geberit-home/**/*.js'
    ],
    
    // Capabilities
    capabilities: [{
        platformName: 'Android',
        'appium:platformVersion': '14', // Android API level for your emulator
        'appium:deviceName': 'Pixel_8a_API_36',
        'appium:automationName': 'UiAutomator2',
        'appium:appPackage': 'com.geberit.home',
        'appium:appActivity': '.MainActivity', // Main activity of Geberit Home app
        'appium:noReset': true, // Don't reset app state - keep user logged in
        'appium:fullReset': false,
        'appium:autoGrantPermissions': true,
        'appium:ensureWebviewsHavePages': true,
        'appium:nativeWebScreenshot': true,
        'appium:newCommandTimeout': 240,
        'appium:connectHardwareKeyboard': true
    }],
    
    // Appium service
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
    
    // Test configuration
    maxInstances: 1,
    logLevel: 'info',
    bail: 0,
    baseUrl: '',
    waitforTimeout: 30000,
    connectionRetryTimeout: 120000,
    connectionRetryCount: 3,
    
    // Framework
    framework: 'mocha',
    reporters: [
        'spec',
        ['allure', {
            outputDir: './test-results/allure-results',
            disableWebdriverStepsReporting: true,
            disableWebdriverScreenshotsReporting: false
        }]
    ],
    
    // Mocha options
    mochaOpts: {
        ui: 'bdd',
        timeout: 300000, // 5 minutes for complex mobile operations
        bail: false
    },
    
    // Hooks
    onPrepare: function (config, capabilities) {
        console.log('🚀 Starting Geberit Home App Testing');
        console.log('📱 Target App: com.geberit.home');
        console.log('🤖 Target Device: Pixel_8a_API_36 Emulator');
    },
    
    beforeSession: function (config, capabilities, specs) {
        console.log('📋 Test Session Starting');
        console.log(`📝 Running specs: ${specs.join(', ')}`);
    },
    
    before: function (capabilities, specs) {
        console.log('🔧 Setting up test environment');
        
        // Ensure screenshots directory exists
        const fs = require('fs');
        const path = './test-results/screenshots';
        if (!fs.existsSync(path)) {
            fs.mkdirSync(path, { recursive: true });
            console.log('📁 Created screenshots directory');
        }
    },
    
    afterTest: function(test, context, { error, result, duration, passed, retries }) {
        if (error) {
            console.log(`❌ Test failed: ${test.title}`);
            // Take screenshot on failure
            try {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const filename = `./test-results/screenshots/FAILURE-${test.title.replace(/[^a-zA-Z0-9]/g, '-')}-${timestamp}.png`;
                driver.saveScreenshot(filename);
                console.log(`📸 Failure screenshot: ${filename}`);
            } catch (screenshotError) {
                console.log('📸 Could not take failure screenshot:', screenshotError.message);
            }
        } else {
            console.log(`✅ Test passed: ${test.title} (${duration}ms)`);
        }
    },
    
    onComplete: function(exitCode, config, capabilities, results) {
        console.log('🏁 Test Execution Complete');
        console.log(`📊 Exit Code: ${exitCode}`);
        console.log('📁 Results saved in ./test-results/');
        
        if (results.failed === 0) {
            console.log('🎉 All tests passed!');
        } else {
            console.log(`⚠️  ${results.failed} test(s) failed out of ${results.failed + results.passed} total`);
        }
    }
};