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
    maxInstances: 1, // Run tests sequentially for emulator stability
    
    capabilities: [{
        // Standard Android capabilities for EMULATOR
        platformName: 'Android',
        'appium:automationName': 'UiAutomator2',
        
        // Emulator configuration
        'appium:avd': 'Pixel_8a_API_34', // Will be created during setup
        'appium:avdLaunchTimeout': 180000, // 3 minutes for emulator startup
        'appium:avdReadyTimeout': 180000, // 3 minutes for emulator ready
        'appium:deviceName': 'Android Emulator',
        'appium:platformVersion': '14.0', // Android 14 (API 34)
        
        // App configuration - START INSTALLED APP (NOT APK)
        'appium:appPackage': 'com.geberit.home',
        'appium:appActivity': '<TO_BE_FILLED>', // Replace with actual activity
        
        // App behavior settings for emulator
        'appium:noReset': true, // Don't reset app state
        'appium:fullReset': false, // Don't uninstall/reinstall app
        'appium:autoGrantPermissions': true, // Grant permissions automatically
        
        // Performance and timeout settings (more lenient for emulator)
        'appium:newCommandTimeout': 300, // 5 minutes timeout for emulator
        'appium:androidInstallTimeout': 120000, // 2 minutes for app operations
        'appium:uiautomator2ServerInstallTimeout': 120000, // 2 minutes for UIAutomator2 server
        
        // Emulator-specific settings
        'appium:systemPort': 8201, // Different port from real device
        'appium:skipServerInstallation': false,
        'appium:skipDeviceInitialization': false,
        'appium:clearSystemFiles': true, // Clean emulator state
        
        // Emulator performance optimizations
        'appium:ignoreUnimportantViews': true, // Speed up element finding
        'appium:disableAndroidWatchers': true, // Reduce CPU usage
        'appium:skipLogcatCapture': false, // Keep logs for debugging
        
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
    waitforTimeout: 45000, // 45 seconds default wait (longer for emulator)
    connectionRetryTimeout: 180000, // 3 minutes for connection retry
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
        timeout: 180000, // 3 minutes per test (emulator can be slow)
        retries: 2 // Retry failed tests twice for emulator flakiness
    },
    
    //
    // =====
    // Hooks
    // =====
    /**
     * Gets executed once before all workers get launched.
     */
    onPrepare: function (config, capabilities) {
        console.log('🚀 Starting EMULATOR mobile test execution...');
        console.log('📱 Target emulator AVD: Pixel_8a_API_34');
        console.log('📦 Target app package:', 'com.geberit.home');
        console.log('⏱️ Emulator startup timeout: 3 minutes');
    },
    
    /**
     * Gets executed before a worker process is spawned.
     */
    onWorkerStart: function (cid, caps, specs, args, execArgv) {
        console.log(`🔧 Starting emulator worker process ${cid}`);
        console.log('⚠️ Emulator tests may take longer to initialize...');
    },
    
    /**
     * Gets executed just before initialising the webdriver session.
     */
    beforeSession: function (config, capabilities, specs, cid) {
        console.log('🔌 Initializing WebDriver session for emulator...');
        console.log('📱 Starting Android emulator (this may take a few minutes)...');
    },
    
    /**
     * Gets executed before test execution begins.
     */
    before: function (capabilities, specs) {
        // Global setup for all tests
        console.log('🧪 Setting up emulator test environment...');
        
        // Set global timeouts (more lenient for emulator)
        browser.setTimeout({
            'implicit': 20000, // 20 seconds for element finding
            'script': 90000,   // 1.5 minutes for script execution
            'pageLoad': 90000  // 1.5 minutes for page load
        });
        
        console.log('✅ Emulator environment ready');
    },
    
    /**
     * Gets executed after each test.
     */
    afterTest: async function(test, context, { error, result, duration, passed, retries }) {
        if (error) {
            console.log('❌ Emulator test failed, capturing debug information...');
            
            // Take screenshot on failure
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const screenshotPath = path.join(process.cwd(), 'screenshots', `emulator-failure-${timestamp}.png`);
            
            try {
                await browser.saveScreenshot(screenshotPath);
                console.log('📸 Emulator failure screenshot saved:', screenshotPath);
            } catch (screenshotError) {
                console.log('⚠️ Could not save emulator screenshot:', screenshotError.message);
            }
            
            // Save page source on failure
            try {
                const pageSource = await browser.getPageSource();
                const pageSourcePath = path.join(process.cwd(), 'reports', `emulator-failure-${timestamp}-source.xml`);
                require('fs').writeFileSync(pageSourcePath, pageSource);
                console.log('📄 Emulator page source saved:', pageSourcePath);
            } catch (sourceError) {
                console.log('⚠️ Could not save emulator page source:', sourceError.message);
            }
        }
    },
    
    /**
     * Gets executed after all tests are done.
     */
    after: function (result, capabilities, specs) {
        console.log('🏁 Emulator test execution completed');
        console.log('📱 Emulator will remain running for manual inspection if needed');
    },
    
    //
    // ========
    // Services
    // ========
    services: [
        ['appium', {
            // Appium service configuration for emulator
            command: 'appium',
            logPath: './reports/',
            args: {
                // Appium server arguments
                port: 4723, // Default Appium port
                host: 'localhost',
                relaxedSecurity: true,
                allowInsecure: ['chromedriver_autodownload'],
                driverLogLevel: 'info',
                // Emulator-specific arguments
                sessionOverride: true, // Allow session override for emulator restarts
                debugLogSpacing: true // Better log formatting for debugging
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
                return `emulator-results-${options.cid}.xml`;
            }
        }]
    ]
};

export { config };