# Test Execution Observability & Recording Configuration

## Problem: Fast-Paced Test Execution

Current test execution is optimized for CI/CD speed but difficult for human observation:
- Tests run at maximum speed for efficiency
- Browser actions happen too quickly to follow
- No built-in recording or slowdown capabilities
- Difficult to debug or demonstrate test behavior

## 🎯 **Solution: Configurable Test Execution Modes**

### **1. Enhanced Playwright Configuration**

```typescript
// playwright.config.ts - Enhanced for observability
import { defineConfig, devices } from '@playwright/test';

interface ObservabilityConfig {
  mode: 'ci' | 'debug' | 'demo' | 'workshop';
  slowdown: number;
  recording: boolean;
  tracing: boolean;
  screenshots: 'on' | 'only-on-failure' | 'off';
  video: 'on' | 'retain-on-failure' | 'off';
}

const getObservabilityConfig = (): ObservabilityConfig => {
  const mode = process.env.TEST_MODE as ObservabilityConfig['mode'] || 'ci';
  
  const configs: Record<string, ObservabilityConfig> = {
    ci: {
      mode: 'ci',
      slowdown: 0,
      recording: false,
      tracing: false,
      screenshots: 'only-on-failure',
      video: 'retain-on-failure'
    },
    debug: {
      mode: 'debug',
      slowdown: 1000,
      recording: true,
      tracing: true,
      screenshots: 'on',
      video: 'on'
    },
    demo: {
      mode: 'demo',
      slowdown: 2000,
      recording: true,
      tracing: true,
      screenshots: 'on',
      video: 'on'
    },
    workshop: {
      mode: 'workshop',
      slowdown: 3000,
      recording: true,
      tracing: true,
      screenshots: 'on',
      video: 'on'
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
  workers: observabilityConfig.mode === 'ci' ? undefined : 1,
  
  reporter: [
    ['html', { 
      open: observabilityConfig.mode !== 'ci' ? 'always' : 'never',
      outputFolder: 'playwright-report'
    }],
    ['list'],
    ...(observabilityConfig.mode !== 'ci' ? [['line']] : [])
  ],
  
  use: {
    baseURL: 'https://www.saucedemo.com',
    
    // Observability settings
    trace: observabilityConfig.tracing ? 'on' : 'on-first-retry',
    screenshot: observabilityConfig.screenshots,
    video: observabilityConfig.video,
    
    // Human-followable execution
    actionTimeout: observabilityConfig.mode === 'ci' ? 10000 : 30000,
    navigationTimeout: observabilityConfig.mode === 'ci' ? 15000 : 45000,
    
    // Custom slowdown implementation
    ...(observabilityConfig.slowdown > 0 && {
      // Add slowdown to every action
      extraHTTPHeaders: {
        'X-Test-Mode': observabilityConfig.mode
      }
    })
  },

  projects: [
    {
      name: 'chromium-observability',
      use: { 
        ...devices['Desktop Chrome'],
        // Headed mode for demo/workshop
        headless: observabilityConfig.mode === 'ci',
        // Slower execution for human observation
        launchOptions: {
          slowMo: observabilityConfig.slowdown,
          devtools: observabilityConfig.mode === 'debug'
        }
      },
    },
    // Include other browsers only in CI mode
    ...(observabilityConfig.mode === 'ci' ? [
      {
        name: 'firefox',
        use: { ...devices['Desktop Firefox'] },
      },
      {
        name: 'webkit',
        use: { ...devices['Desktop Safari'] },
      }
    ] : [])
  ],
});
```

### **2. Enhanced Package.json Scripts**

```json
{
  "scripts": {
    "test": "playwright test",
    "test:ci": "TEST_MODE=ci playwright test",
    "test:debug": "TEST_MODE=debug playwright test --headed --debug",
    "test:demo": "TEST_MODE=demo playwright test --headed --project=chromium-observability",
    "test:workshop": "TEST_MODE=workshop playwright test --headed --project=chromium-observability",
    "test:slow": "TEST_MODE=demo playwright test --headed --project=chromium-observability --workers=1",
    "test:record": "TEST_MODE=workshop playwright test --headed --project=chromium-observability --workers=1",
    "test:single": "TEST_MODE=demo playwright test --headed --project=chromium-observability --workers=1",
    "test:trace": "TEST_MODE=debug playwright test --trace on",
    "report": "playwright show-report",
    "trace:show": "playwright show-trace"
  }
}
```

### **3. Custom Test Helpers for Observability**

```typescript
// test-helpers/observability.ts
export class ObservableTestActions {
  private slowdownMs: number;
  private recordingEnabled: boolean;
  
  constructor(private page: Page) {
    this.slowdownMs = parseInt(process.env.TEST_SLOWDOWN || '0');
    this.recordingEnabled = process.env.TEST_RECORDING === 'true';
  }
  
  /**
   * Enhanced click with visual feedback and delay
   */
  async observableClick(selector: string, description?: string) {
    if (description && this.recordingEnabled) {
      console.log(`🖱️  ${description}: Clicking ${selector}`);
    }
    
    // Highlight element before clicking
    await this.highlightElement(selector);
    
    // Perform click
    await this.page.click(selector);
    
    // Add observable delay
    if (this.slowdownMs > 0) {
      await this.page.waitForTimeout(this.slowdownMs);
    }
  }
  
  /**
   * Enhanced fill with visual feedback
   */
  async observableFill(selector: string, value: string, description?: string) {
    if (description && this.recordingEnabled) {
      console.log(`⌨️  ${description}: Filling ${selector} with "${value}"`);
    }
    
    await this.highlightElement(selector);
    
    // Clear field first
    await this.page.fill(selector, '');
    
    if (this.slowdownMs > 0) {
      // Type character by character for better visibility
      await this.page.type(selector, value, { delay: Math.max(50, this.slowdownMs / 10) });
    } else {
      await this.page.fill(selector, value);
    }
    
    await this.addDelay();
  }
  
  /**
   * Enhanced assertion with visual feedback
   */
  async observableExpect(assertion: () => Promise<void>, description?: string) {
    if (description && this.recordingEnabled) {
      console.log(`✅ ${description}: Verifying assertion`);
    }
    
    try {
      await assertion();
      if (this.recordingEnabled) {
        console.log(`✅ Assertion passed: ${description}`);
      }
    } catch (error) {
      if (this.recordingEnabled) {
        console.log(`❌ Assertion failed: ${description}`);
      }
      throw error;
    }
    
    await this.addDelay();
  }
  
  /**
   * Add step annotation for better tracing
   */
  async step(stepName: string, action: () => Promise<void>) {
    await test.step(stepName, async () => {
      if (this.recordingEnabled) {
        console.log(`🔄 Step: ${stepName}`);
      }
      await action();
    });
  }
  
  /**
   * Highlight element for better visibility
   */
  private async highlightElement(selector: string) {
    if (this.slowdownMs > 0) {
      await this.page.evaluate((sel) => {
        const element = document.querySelector(sel);
        if (element) {
          const originalStyle = element.style.outline;
          element.style.outline = '3px solid red';
          element.style.outlineOffset = '2px';
          setTimeout(() => {
            element.style.outline = originalStyle;
          }, 1000);
        }
      }, selector);
    }
  }
  
  /**
   * Add configurable delay
   */
  private async addDelay() {
    if (this.slowdownMs > 0) {
      await this.page.waitForTimeout(this.slowdownMs);
    }
  }
}
```

### **4. Enhanced Test Example with Observability**

```typescript
// tests/observable-login.spec.ts
import { test, expect } from '@playwright/test';
import { ObservableTestActions } from '../test-helpers/observability';

test.describe('Observable Login Tests', () => {
  test('Login with visual feedback and recording', async ({ page }) => {
    const actions = new ObservableTestActions(page);
    
    await actions.step('Navigate to login page', async () => {
      await page.goto('/');
      await actions.observableExpected(
        () => expect(page.locator('#login-box')).toBeVisible(),
        'Login form is displayed'
      );
    });
    
    await actions.step('Enter credentials', async () => {
      await actions.observableFill(
        '#user-name', 
        'standard_user',
        'Enter username'
      );
      
      await actions.observableFill(
        '#password',
        'secret_sauce', 
        'Enter password'
      );
    });
    
    await actions.step('Submit login form', async () => {
      await actions.observableClick(
        '#login-button',
        'Click login button'
      );
    });
    
    await actions.step('Verify successful login', async () => {
      await actions.observableExpect(
        () => expect(page).toHaveURL(/.*inventory.html/),
        'Redirected to inventory page'
      );
      
      await actions.observableExpect(
        () => expect(page.locator('.title')).toHaveText('Products'),
        'Products page title is displayed'
      );
    });
  });
});
```

## 🎥 **Recording and Video Configuration**

### **Enhanced Video Recording Settings**

```typescript
// config/video-config.ts
export const VIDEO_SETTINGS = {
  ci: {
    video: 'retain-on-failure',
    videoSize: { width: 1280, height: 720 }
  },
  demo: {
    video: 'on',
    videoSize: { width: 1920, height: 1080 }
  },
  workshop: {
    video: 'on',
    videoSize: { width: 1920, height: 1080 }
  }
};

// Custom video recording with annotations
export class EnhancedVideoRecorder {
  async startRecording(page: Page, testName: string) {
    await page.video()?.path();
    
    // Add test metadata to video
    await page.evaluate((name) => {
      console.log(`🎬 Recording started: ${name}`);
    }, testName);
  }
  
  async addVideoAnnotation(page: Page, message: string) {
    await page.evaluate((msg) => {
      console.log(`📝 ${msg}`);
    }, message);
  }
  
  async stopRecording(page: Page) {
    const videoPath = await page.video()?.path();
    await page.evaluate(() => {
      console.log('🎬 Recording stopped');
    });
    return videoPath;
  }
}
```

## 📊 **Usage Instructions**

### **For Development/Debugging:**
```bash
# Slow execution with visual feedback
npm run test:debug

# Demo mode for presentations
npm run test:demo

# Workshop mode with maximum observability
npm run test:workshop

# Record specific test
TEST_MODE=workshop npx playwright test tests/login-success.spec.ts --headed
```

### **For CI/CD (optimized speed):**
```bash
# Normal CI execution
npm run test:ci

# Production deployment
TEST_MODE=ci npx playwright test
```

### **For Workshop Demonstrations:**
```bash
# Workshop mode with recording
npm run test:workshop

# Show trace after execution
npm run trace:show

# Show HTML report
npm run report
```

## 🔧 **Environment Variables Configuration**

```bash
# .env.local for local development
TEST_MODE=demo
TEST_SLOWDOWN=2000
TEST_RECORDING=true
PLAYWRIGHT_HEADED=true

# .env.ci for CI/CD
TEST_MODE=ci
TEST_SLOWDOWN=0
TEST_RECORDING=false
PLAYWRIGHT_HEADED=false
```

This configuration provides complete control over test execution speed and observability, making tests suitable for both efficient CI/CD execution and human-friendly demonstration scenarios.
