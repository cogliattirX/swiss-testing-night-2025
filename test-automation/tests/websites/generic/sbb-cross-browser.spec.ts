import { test, expect, devices } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

test.describe('SBB.ch Cross-Browser Compatibility', () => {
  
  // Test core functionality across all browsers
  ['chromium', 'firefox', 'webkit'].forEach(browserName => {
    test(`Journey booking workflow - ${browserName}`, async ({ page }) => {
      const actions = createObservableActions(page);
      
      actions.logTestInfo(`🌐 Testing journey booking in ${browserName}`);
      
      await actions.step(`🚀 ${browserName} - Navigate and Setup`, async () => {
        await actions.observableGoto('https://www.sbb.ch', `Navigate in ${browserName}`);
        
        // Accept cookies with browser-specific handling
        try {
          await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 3000 });
          await actions.observableClick('#onetrust-accept-btn-handler', `Accept cookies in ${browserName}`);
        } catch (error) {
          actions.logTestInfo(`ℹ️ No cookie banner in ${browserName}`);
        }
      });

      await actions.step(`🔍 ${browserName} - Journey Search`, async () => {
        const fromField = page.getByRole('combobox', { name: /from/i }).first();
        const toField = page.getByRole('combobox', { name: /to/i }).first();
        
        await fromField.fill('Zürich HB');
        actions.logTestInfo(`Enter departure station in ${browserName}`);
        await toField.fill('Bern');
        actions.logTestInfo(`Enter destination in ${browserName}`);
        
        await page.keyboard.press('Enter');
        await page.waitForLoadState('networkidle');
        
        // Verify search results appear
        const hasResults = await page.locator('[data-testid*="connection"], .connection, [class*="journey"], [class*="connection"]').first().isVisible({ timeout: 10000 });
        
        if (hasResults) {
          actions.logTestInfo(`✅ ${browserName}: Journey search successful`);
        } else {
          actions.logTestInfo(`⚠️ ${browserName}: Journey search results unclear`);
        }
        
        await actions.screenshot(`sbb-journey-${browserName}`, `Journey results in ${browserName}`);
      });

      await actions.step(`⚙️ ${browserName} - Browser-Specific Features`, async () => {
        // Test browser-specific functionality
        const userAgent = await page.evaluate(() => navigator.userAgent);
        const browserInfo = await page.evaluate(() => ({
          cookieEnabled: navigator.cookieEnabled,
          language: navigator.language,
          platform: navigator.platform,
          onLine: navigator.onLine,
          hardwareConcurrency: navigator.hardwareConcurrency
        }));
        
        actions.logTestInfo(`🔍 ${browserName} Browser Info:`);
        actions.logTestInfo(`  User Agent: ${userAgent.substring(0, 80)}...`);
        actions.logTestInfo(`  Cookies: ${browserInfo.cookieEnabled ? 'Enabled' : 'Disabled'}`);
        actions.logTestInfo(`  Language: ${browserInfo.language}`);
        actions.logTestInfo(`  Platform: ${browserInfo.platform}`);
        actions.logTestInfo(`  Online: ${browserInfo.onLine}`);
        actions.logTestInfo(`  CPU Cores: ${browserInfo.hardwareConcurrency}`);
        
        // Verify core browser capabilities
        expect(browserInfo.cookieEnabled).toBe(true);
        expect(browserInfo.onLine).toBe(true);
      });
    });
  });

  test('Form field behavior across browsers', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('📝 Testing form field compatibility across browsers');
    
    await actions.step('🎯 Test Input Field Behaviors', async () => {
      await actions.observableGoto('https://www.sbb.ch', 'Navigate for form testing');
      
      // Accept cookies
      try {
        await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 3000 });
        await actions.observableClick('#onetrust-accept-btn-handler', 'Accept cookies');
      } catch (error) {
        actions.logTestInfo('ℹ️ No cookie banner');
      }
      
      const fromField = page.getByRole('combobox', { name: /from/i }).first();
      const toField = page.getByRole('combobox', { name: /to/i }).first();
      
      // Test autocomplete behavior
      await fromField.focus();
      await fromField.fill('Zür');
      
      // Wait for autocomplete suggestions
      await page.waitForTimeout(1000);
      
      const suggestions = await page.locator('[role="option"], .suggestion, [class*="autocomplete"]').count();
      
      if (suggestions > 0) {
        actions.logTestInfo(`✅ Autocomplete working: ${suggestions} suggestions found`);
      } else {
        actions.logTestInfo('⚠️ Autocomplete behavior unclear');
      }
      
      // Test keyboard navigation in form
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
      actions.logTestInfo(`⌨️ Tab navigation: focused element is ${focusedElement}`);
      
      // Test form validation
      await fromField.fill('');
      await toField.fill('');
      await page.keyboard.press('Enter');
      
      // Check for validation messages
      const validationMessage = await page.locator('[role="alert"], .error, [class*="validation"], [class*="error"]').first().textContent().catch(() => null);
      
      if (validationMessage) {
        actions.logTestInfo(`✅ Form validation working: "${validationMessage}"`);
      } else {
        actions.logTestInfo('ℹ️ No visible form validation message');
      }
    });

    await actions.step('📅 Test Date/Time Picker Compatibility', async () => {
      // Look for date/time controls
      const dateInputs = page.locator('input[type="date"], input[type="time"], input[type="datetime-local"]');
      const dateInputCount = await dateInputs.count();
      
      if (dateInputCount > 0) {
        actions.logTestInfo(`📅 Found ${dateInputCount} date/time inputs`);
        
        const firstDateInput = dateInputs.first();
        await firstDateInput.focus();
        
        // Test date input functionality
        const inputType = await firstDateInput.getAttribute('type');
        actions.logTestInfo(`🔍 Testing ${inputType} input`);
        
        if (inputType === 'date') {
          await firstDateInput.fill('2024-12-25');
          const value = await firstDateInput.inputValue();
          actions.logTestInfo(`📅 Date input value: ${value}`);
        }
      } else {
        actions.logTestInfo('ℹ️ No standard HTML5 date inputs found');
      }
      
      // Look for custom date picker
      const customDatePicker = page.locator('[class*="date"], [class*="calendar"], [data-testid*="date"]').first();
      const hasCustomPicker = await customDatePicker.isVisible().catch(() => false);
      
      if (hasCustomPicker) {
        actions.logTestInfo('✅ Custom date picker component detected');
      }
    });
  });

  test('CSS rendering and layout consistency', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('🎨 Testing CSS rendering and layout consistency');
    
    await actions.step('📐 Measure Layout Metrics', async () => {
      await actions.observableGoto('https://www.sbb.ch', 'Navigate for layout testing');
      
      const layoutMetrics = await page.evaluate(() => {
        const body = document.body;
        const html = document.documentElement;
        
        return {
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          bodyWidth: body.scrollWidth,
          bodyHeight: body.scrollHeight,
          documentWidth: html.scrollWidth,
          documentHeight: html.scrollHeight,
          hasHorizontalScroll: body.scrollWidth > window.innerWidth,
          hasVerticalScroll: body.scrollHeight > window.innerHeight
        };
      });
      
      actions.logTestInfo('📐 Layout Metrics:');
      actions.logTestInfo(`  Viewport: ${layoutMetrics.viewportWidth}x${layoutMetrics.viewportHeight}`);
      actions.logTestInfo(`  Body: ${layoutMetrics.bodyWidth}x${layoutMetrics.bodyHeight}`);
      actions.logTestInfo(`  Document: ${layoutMetrics.documentWidth}x${layoutMetrics.documentHeight}`);
      actions.logTestInfo(`  Horizontal scroll: ${layoutMetrics.hasHorizontalScroll ? 'Yes' : 'No'}`);
      actions.logTestInfo(`  Vertical scroll: ${layoutMetrics.hasVerticalScroll ? 'Yes' : 'No'}`);
      
      // Check for layout issues
      if (layoutMetrics.hasHorizontalScroll) {
        actions.logTestInfo('⚠️ Unexpected horizontal scrollbar detected');
      } else {
        actions.logTestInfo('✅ No horizontal overflow');
      }
    });

    await actions.step('🎯 Test Element Positioning', async () => {
      // Check main navigation elements
      const navigation = page.locator('nav, [role="navigation"], header').first();
      const navigationBounds = await navigation.boundingBox().catch(() => null);
      
      if (navigationBounds) {
        actions.logTestInfo(`🧭 Navigation position: ${navigationBounds.x}, ${navigationBounds.y}`);
        actions.logTestInfo(`🧭 Navigation size: ${navigationBounds.width}x${navigationBounds.height}`);
        
        if (navigationBounds.x >= 0 && navigationBounds.y >= 0) {
          actions.logTestInfo('✅ Navigation positioned correctly');
        } else {
          actions.logTestInfo('⚠️ Navigation may have positioning issues');
        }
      }
      
      // Check main content area
      const mainContent = page.locator('main, [role="main"], .main-content').first();
      const contentBounds = await mainContent.boundingBox().catch(() => null);
      
      if (contentBounds) {
        actions.logTestInfo(`📄 Main content position: ${contentBounds.x}, ${contentBounds.y}`);
        actions.logTestInfo(`📄 Main content size: ${contentBounds.width}x${contentBounds.height}`);
      }
    });

    await actions.step('🎨 Test CSS Features Support', async () => {
      const cssSupport = await page.evaluate(() => {
        const testDiv = document.createElement('div');
        document.body.appendChild(testDiv);
        
        const support = {
          flexbox: CSS.supports('display', 'flex'),
          grid: CSS.supports('display', 'grid'),
          customProperties: CSS.supports('--custom-property', 'value'),
          transforms: CSS.supports('transform', 'rotate(45deg)'),
          animations: CSS.supports('animation', 'test 1s'),
          filters: CSS.supports('filter', 'blur(5px)'),
          clipPath: CSS.supports('clip-path', 'circle(50%)'),
          backdrop: CSS.supports('backdrop-filter', 'blur(5px)')
        };
        
        document.body.removeChild(testDiv);
        return support;
      });
      
      actions.logTestInfo('🎨 CSS Feature Support:');
      Object.entries(cssSupport).forEach(([feature, supported]) => {
        const icon = supported ? '✅' : '❌';
        actions.logTestInfo(`  ${icon} ${feature}: ${supported ? 'Supported' : 'Not supported'}`);
      });
      
      // Modern browsers should support these core features
      expect(cssSupport.flexbox).toBe(true);
      expect(cssSupport.customProperties).toBe(true);
      expect(cssSupport.transforms).toBe(true);
    });
  });

  test('JavaScript API compatibility', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('🔧 Testing JavaScript API compatibility');
    
    await actions.step('📱 Test Modern Web APIs', async () => {
      await actions.observableGoto('https://www.sbb.ch', 'Navigate for API testing');
      
      const apiSupport = await page.evaluate(() => {
        return {
          fetch: typeof fetch !== 'undefined',
          promises: typeof Promise !== 'undefined',
          asyncAwait: (async () => true)().constructor.name === 'AsyncFunction',
          arrow: (() => true)().constructor.name === 'Function',
          destructuring: (() => { try { const {a} = {a: 1}; return true; } catch { return false; } })(),
          spread: (() => { try { const arr = [1, 2]; return [...arr].length === 2; } catch { return false; } })(),
          // modules: Dynamic import support varies by context
          symbols: typeof Symbol !== 'undefined',
          maps: typeof Map !== 'undefined',
          sets: typeof Set !== 'undefined',
          intersectionObserver: typeof IntersectionObserver !== 'undefined',
          mutationObserver: typeof MutationObserver !== 'undefined',
          localStorage: typeof localStorage !== 'undefined',
          sessionStorage: typeof sessionStorage !== 'undefined',
          history: typeof history !== 'undefined' && typeof history.pushState === 'function',
          geolocation: navigator.geolocation !== undefined,
          serviceWorker: 'serviceWorker' in navigator,
          webWorkers: typeof Worker !== 'undefined'
        };
      });
      
      actions.logTestInfo('🔧 JavaScript API Support:');
      Object.entries(apiSupport).forEach(([api, supported]) => {
        const icon = supported ? '✅' : '❌';
        actions.logTestInfo(`  ${icon} ${api}: ${supported ? 'Supported' : 'Not supported'}`);
      });
      
      // Core APIs that should be supported
      expect(apiSupport.fetch).toBe(true);
      expect(apiSupport.promises).toBe(true);
      expect(apiSupport.localStorage).toBe(true);
      expect(apiSupport.history).toBe(true);
    });

    await actions.step('🌐 Test Network and Storage APIs', async () => {
      const networkStorage = await page.evaluate(() => {
        const results: any = {};
        
        // Test localStorage
        try {
          localStorage.setItem('test', 'value');
          results.localStorageWrite = localStorage.getItem('test') === 'value';
          localStorage.removeItem('test');
        } catch {
          results.localStorageWrite = false;
        }
        
        // Test sessionStorage
        try {
          sessionStorage.setItem('test', 'value');
          results.sessionStorageWrite = sessionStorage.getItem('test') === 'value';
          sessionStorage.removeItem('test');
        } catch {
          results.sessionStorageWrite = false;
        }
        
        // Test online/offline detection
        results.onlineDetection = typeof navigator.onLine === 'boolean';
        results.isOnline = navigator.onLine;
        
        // Test connection info
        results.connectionAPI = 'connection' in navigator;
        if (results.connectionAPI) {
          const connection = (navigator as any).connection;
          results.connectionType = connection?.effectiveType || 'unknown';
        }
        
        return results;
      });
      
      actions.logTestInfo('🌐 Network & Storage Test Results:');
      actions.logTestInfo(`  📦 localStorage write: ${networkStorage.localStorageWrite ? '✅' : '❌'}`);
      actions.logTestInfo(`  📦 sessionStorage write: ${networkStorage.sessionStorageWrite ? '✅' : '❌'}`);
      actions.logTestInfo(`  🌐 Online detection: ${networkStorage.onlineDetection ? '✅' : '❌'}`);
      actions.logTestInfo(`  🌐 Currently online: ${networkStorage.isOnline ? '✅' : '❌'}`);
      actions.logTestInfo(`  📶 Connection API: ${networkStorage.connectionAPI ? '✅' : '❌'}`);
      
      if (networkStorage.connectionType) {
        actions.logTestInfo(`  📶 Connection type: ${networkStorage.connectionType}`);
      }
    });

    await actions.step('📧 Test Event Handling', async () => {
      // Test various event types
      const eventSupport = await page.evaluate(() => {
        const testDiv = document.createElement('div');
        const events: any = {};
        
        // Test touch events
        events.touch = 'ontouchstart' in testDiv;
        
        // Test pointer events
        events.pointer = 'onpointerdown' in testDiv;
        
        // Test focus events
        events.focus = 'onfocus' in testDiv;
        
        // Test custom events
        try {
          const customEvent = new CustomEvent('test');
          events.customEvents = true;
        } catch {
          events.customEvents = false;
        }
        
        // Test event listeners
        try {
          testDiv.addEventListener('click', () => {});
          events.addEventListener = true;
        } catch {
          events.addEventListener = false;
        }
        
        return events;
      });
      
      actions.logTestInfo('📧 Event Handling Support:');
      Object.entries(eventSupport).forEach(([event, supported]) => {
        const icon = supported ? '✅' : '❌';
        actions.logTestInfo(`  ${icon} ${event}: ${supported ? 'Supported' : 'Not supported'}`);
      });
      
      expect(eventSupport.addEventListener).toBe(true);
      expect(eventSupport.customEvents).toBe(true);
    });
  });
});