import { Page, test, expect } from '@playwright/test';

/**
 * Enhanced Test Actions with Observability Support
 * Provides visual feedback, logging, and configurable delays for human-followable test execution
 */
export class ObservableTestActions {
  private slowdownMs: number;
  private recordingEnabled: boolean;
  private mode: string;
  
  constructor(private page: Page) {
    this.slowdownMs = parseInt(process.env.TEST_SLOWDOWN || '0');
    this.recordingEnabled = process.env.TEST_RECORDING === 'true';
    this.mode = process.env.TEST_MODE || 'ci';
    
    // Auto-detect if we should add delays based on config
    if (['debug', 'demo', 'workshop'].includes(this.mode)) {
      this.recordingEnabled = true;
    }
  }
  
  /**
   * Enhanced click with visual feedback and delay
   */
  async observableClick(selector: string, description?: string) {
    if (description && this.recordingEnabled) {
      console.log(`🖱️  ${description}: Clicking ${selector}`);
    }
    
    // Highlight element before clicking in demo modes
    if (this.mode !== 'ci') {
      await this.highlightElement(selector);
    }
    
    // Perform click
    await this.page.click(selector);
    
    // Add observable delay
    await this.addDelay();
  }
  
  /**
   * Enhanced fill with visual feedback
   */
  async observableFill(selector: string, value: string, description?: string) {
    if (description && this.recordingEnabled) {
      console.log(`⌨️  ${description}: Filling ${selector} with "${value}"`);
    }
    
    // Highlight element in demo modes
    if (this.mode !== 'ci') {
      await this.highlightElement(selector);
    }
    
    // Clear field first
    await this.page.fill(selector, '');
    
    if (this.mode === 'workshop' || this.mode === 'demo') {
      // Type character by character for better visibility
      await this.page.type(selector, value, { delay: Math.max(50, this.slowdownMs / 20) });
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
   * Navigate with logging
   */
  async observableGoto(url: string, description?: string) {
    if (description && this.recordingEnabled) {
      console.log(`🌐 ${description}: Navigating to ${url}`);
    }
    
    await this.page.goto(url);
    await this.addDelay();
  }
  
  /**
   * Wait with visual feedback
   */
  async observableWait(selector: string, description?: string) {
    if (description && this.recordingEnabled) {
      console.log(`⏳ ${description}: Waiting for ${selector}`);
    }
    
    await this.page.waitForSelector(selector);
    
    if (this.mode !== 'ci') {
      await this.highlightElement(selector);
    }
    
    await this.addDelay();
  }
  
  /**
   * Highlight element for better visibility
   */
  private async highlightElement(selector: string) {
    if (this.mode === 'ci') return;
    
    try {
      await this.page.evaluate((sel) => {
        const element = document.querySelector(sel) as HTMLElement;
        if (element) {
          const originalStyle = element.style.outline;
          const originalShadow = element.style.boxShadow;
          element.style.outline = '3px solid #ff6b6b';
          element.style.outlineOffset = '2px';
          element.style.boxShadow = '0 0 10px rgba(255, 107, 107, 0.5)';
          setTimeout(() => {
            element.style.outline = originalStyle;
            element.style.boxShadow = originalShadow;
          }, 1500);
        }
      }, selector);
      
      // Brief pause to show highlight
      await this.page.waitForTimeout(300);
    } catch (error) {
      // Ignore highlighting errors
    }
  }
  
  /**
   * Add configurable delay based on mode
   */
  private async addDelay() {
    const delays: Record<string, number> = {
      ci: 0,
      debug: 1000,
      demo: 2000,
      workshop: 3000
    };
    
    const delay = delays[this.mode] || this.slowdownMs;
    if (delay > 0) {
      await this.page.waitForTimeout(delay);
    }
  }
  
  /**
   * Log test information
   */
  logTestInfo(message: string) {
    if (this.recordingEnabled) {
      console.log(`ℹ️  ${message}`);
    }
  }
  
  /**
   * Take screenshot with description
   */
  async screenshot(name: string, description?: string) {
    if (description && this.recordingEnabled) {
      console.log(`📸 ${description}: Taking screenshot ${name}`);
    }
    
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }
}

/**
 * Helper function to create observable actions
 */
export function createObservableActions(page: Page): ObservableTestActions {
  return new ObservableTestActions(page);
}

/**
 * Test mode detection utilities
 */
export const TestModes = {
  isCIMode: () => process.env.TEST_MODE === 'ci' || process.env.CI === 'true',
  isDebugMode: () => process.env.TEST_MODE === 'debug',
  isDemoMode: () => process.env.TEST_MODE === 'demo',
  isWorkshopMode: () => process.env.TEST_MODE === 'workshop',
  isObservableMode: () => ['debug', 'demo', 'workshop'].includes(process.env.TEST_MODE || ''),
  getCurrentMode: () => process.env.TEST_MODE || 'ci'
};
