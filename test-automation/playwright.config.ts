import { defineConfig, devices } from '@playwright/test';

/**
 * Enhanced Playwright Configuration with Observability Support
 * Supports multiple execution modes: ci, debug, demo, workshop
 * @see https://playwright.dev/docs/test-configuration
 */

interface ObservabilityConfig {
  mode: 'ci' | 'debug' | 'demo' | 'workshop';
  slowdown: number;
  recording: boolean;
  tracing: boolean;
  screenshots: 'on' | 'only-on-failure' | 'off';
  video: 'on' | 'retain-on-failure' | 'off';
  headed: boolean;
  workers: number;
}

const getObservabilityConfig = (): ObservabilityConfig => {
  const mode = (process.env.TEST_MODE as ObservabilityConfig['mode']) || 'ci';
  
  const configs: Record<string, ObservabilityConfig> = {
    ci: {
      mode: 'ci',
      slowdown: 0,
      recording: false,
      tracing: false,
      screenshots: 'only-on-failure',
      video: 'retain-on-failure',
      headed: false,
      workers: process.env.CI ? 1 : 4
    },
    debug: {
      mode: 'debug',
      slowdown: 1000,
      recording: true,
      tracing: true,
      screenshots: 'on',
      video: 'on',
      headed: true,
      workers: 1
    },
    demo: {
      mode: 'demo',
      slowdown: 2000,
      recording: true,
      tracing: true,
      screenshots: 'on',
      video: 'on',
      headed: true,
      workers: 1
    },
    workshop: {
      mode: 'workshop',
      slowdown: 3000,
      recording: true,
      tracing: true,
      screenshots: 'on',
      video: 'on',
      headed: true,
      workers: 1
    }
  };
  
  return configs[mode];
};

const observabilityConfig = getObservabilityConfig();

export default defineConfig({
  testDir: './tests',
  timeout: observabilityConfig.mode === 'ci' ? 30000 : 120000,
  expect: {
    timeout: observabilityConfig.mode === 'ci' ? 5000 : 15000
  },
  fullyParallel: observabilityConfig.mode === 'ci',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: observabilityConfig.workers,
  
  reporter: [
    ['html', { 
      open: observabilityConfig.mode !== 'ci' ? 'always' : 'never',
      outputFolder: 'playwright-report'
    }],
    ['list'],
    ...(observabilityConfig.mode !== 'ci' ? [['line']] : []),
    ...(process.env.CI ? [['github']] : [])
  ],
  
  use: {
    baseURL: 'https://www.saucedemo.com',
    
    // Observability settings
    trace: observabilityConfig.tracing ? 'on' : 'on-first-retry',
    screenshot: observabilityConfig.screenshots,
    video: observabilityConfig.video,
    
    // Human-followable execution timeouts
    actionTimeout: observabilityConfig.mode === 'ci' ? 10000 : 30000,
    navigationTimeout: observabilityConfig.mode === 'ci' ? 15000 : 45000,
    
    // Enhanced video settings for demos
    ...(observabilityConfig.mode !== 'ci' && {
      videoSize: { width: 1920, height: 1080 }
    })
  },

  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        headless: !observabilityConfig.headed,
        launchOptions: {
          slowMo: observabilityConfig.slowdown,
          devtools: observabilityConfig.mode === 'debug'
        }
      },
    },
    // Include other browsers only in CI mode for speed
    ...(observabilityConfig.mode === 'ci' ? [
      {
        name: 'firefox',
        use: { 
          ...devices['Desktop Firefox'],
          headless: true
        },
      },
      {
        name: 'webkit',
        use: { 
          ...devices['Desktop Safari'],
          headless: true
        },
      }
    ] : [])
  ],
});
