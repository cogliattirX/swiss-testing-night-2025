import type { Options } from '@wdio/types';
import path from 'path';

const config: Options.Testrunner = {
    //
    // ====================
    // Runner Configuration
    // ====================
    runner: 'local',
    
    //
    // ==================
    // Specify Test Files
    // ==================
    specs: [
        '../test/specs/**/*.spec.ts'
    ],
    
    // Patterns to exclude.
    exclude: [
        // 'path/to/excluded/files'
    ],
    
    //
    // ============
    // Capabilities
    // ============
    maxInstances: 1, // Run tests sequentially for stability
    
    capabilities: [{
        // Standard Android capabilities
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        
        // Device configuration
        'appium:udid': process.env.ANDROID_UDID || 'auto-detect', // Will be auto-detected if not set
        'appium:deviceName': 'Android Device', // Generic name for real device
        
        // App configuration - START INSTALLED APP (NOT APK)
        'appium:appPackage': 'com.geberit.home',
        'appium:appActivity': '<TO_BE_FILLED>', // Replace with actual activity after running ADB command
        
        // App behavior settings
        'appium:noReset': true, // Don't reset app state - use existing installation
        'appium:fullReset': false, // Don't uninstall/reinstall app
        'appium:autoGrantPermissions': true, // Grant permissions automatically
        
        // Performance and timeout settings
        'appium:newCommandTimeout': 240, // 4 minutes timeout for commands
        'appium:androidInstallTimeout': 90000, // 90 seconds for app operations
        'appium:uiautomator2ServerInstallTimeout': 60000, // 60 seconds for UIAutomator2 server
        
        // Stability settings
        'appium:systemPort': 8200, // Fixed port for UIAutomator2 server
        'appium:skipServerInstallation': false,
        'appium:skipDeviceInitialization': false,
        
        // Logging
        'appium:enablePerformanceLogging': true,
        'appium:printPageSourceOnFindFailure': true
    }],
    
    //
    // ===================
    // Test Configurations
    // ===================
    logLevel: 'info',
    bail: 0, // Don't stop on first failure
    baseUrl: '', // Not needed for mobile testing
    waitforTimeout: 30000, // 30 seconds default wait
    connectionRetryTimeout: 120000, // 2 minutes for connection retry
    connectionRetryCount: 3,
    
    //
    // ==================
    // Test Framework
    // ==================
    framework: 'mocha',
    
    //
    // =================
    // Mocha Options
    // =================
    mochaOpts: {
        ui: 'bdd',
        timeout: 120000, // 2 minutes per test
        retries: 1 // Retry failed tests once
    },
    
    //
    // =====
    // Hooks
    // =====
    /**
     * Gets executed once before all workers get launched.
     */
    onPrepare: function (config, capabilities) {
        console.log('🚀 Starting mobile test execution...');
        console.log('📱 Target device UDID:', process.env.ANDROID_UDID || 'auto-detect');
        console.log('📦 Target app package:', 'com.geberit.home');
    },
    
    /**
     * Gets executed before a worker process is spawned.
     */
    onWorkerStart: function (cid, caps, specs, args, execArgv) {
        console.log(`🔧 Starting worker process ${cid}`);
    },
    
    /**
     * Gets executed just before initialising the webdriver session.
     */
    beforeSession: function (config, capabilities, specs, cid) {
        console.log('🔌 Initializing WebDriver session...');
    },
    
    /**
     * Gets executed before test execution begins.
     */
    before: function (capabilities, specs) {
        // Global setup for all tests
        console.log('🧪 Setting up test environment...');
        
        // Set global timeouts
        browser.setTimeout({
            'implicit': 15000, // 15 seconds for element finding
            'script': 60000,   // 1 minute for script execution
            'pageLoad': 60000  // 1 minute for page load
        });
    },
    
    /**
     * Gets executed after each test.
     */
    afterTest: async function(test, context, { error, result, duration, passed, retries }) {
        if (error) {
            console.log('❌ Test failed, capturing debug information...');
            
            // Take screenshot on failure
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const screenshotPath = path.join(process.cwd(), 'screenshots', `failure-${timestamp}.png`);
            
            try {
                await browser.saveScreenshot(screenshotPath);
                console.log('📸 Screenshot saved:', screenshotPath);
            } catch (screenshotError) {
                console.log('⚠️ Could not save screenshot:', screenshotError.message);
            }
            
            // Save page source on failure
            try {
                const pageSource = await browser.getPageSource();
                const pageSourcePath = path.join(process.cwd(), 'reports', `failure-${timestamp}-source.xml`);
                require('fs').writeFileSync(pageSourcePath, pageSource);
                console.log('📄 Page source saved:', pageSourcePath);
            } catch (sourceError) {
                console.log('⚠️ Could not save page source:', sourceError.message);
            }
        }
    },
    
    /**
     * Gets executed after all tests are done.
     */
    after: function (result, capabilities, specs) {
        console.log('🏁 Test execution completed');
    },
    
    //
    // ========
    // Services
    // ========
    services: [
        ['appium', {
            // Appium service configuration
            command: 'appium',
            logPath: './reports/',
            args: {
                // Appium server arguments
                port: 4723, // Default Appium port
                host: 'localhost',
                relaxedSecurity: true,
                allowInsecure: ['chromedriver_autodownload'],
                driverLogLevel: 'info'
            }
        }]
    ],
    
    //
    // =========
    // Reporters
    // =========
    reporters: [
        'spec',
        ['junit', {
            outputDir: './reports',
            outputFileFormat: function(options) {
                return `results-${options.cid}.xml`;
            }
        }]
    ]
};

export { config };