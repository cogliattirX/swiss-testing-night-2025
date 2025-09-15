import { test, expect, devices } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

/**
 * Universal Cross-Browser Compatibility Testing Suite
 * 
 * As a Cross-Platform Testing Engineer, this suite validates
 * website functionality across multiple browsers and devices.
 */

test.describe('Cross-Browser Compatibility Testing', () => {
  const testUrl = 'https://www.saucedemo.com/';
  
  // Test across different browsers
  const browsers = ['chromium', 'firefox', 'webkit'];
  
  browsers.forEach(browserName => {
    test(`Core functionality in ${browserName}`, async ({ page, browserName: browser }) => {
      // Only run this test on the specified browser
      test.skip(browser !== browserName, `Skipping ${browserName} test in ${browser}`);
      
      const actions = createObservableActions(page);
      
      console.log(`\n🌐 CROSS-BROWSER TEST: ${browserName.toUpperCase()}`);
      console.log(`═══════════════════════════════════════════════════════════`);
      
      await test.step('Browser Detection and Basic Loading', async () => {
        await actions.observableGoto(testUrl, `Loading in ${browserName}`);
        
        // Detect browser features
        const browserInfo = await page.evaluate(() => {
          return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            cookieEnabled: navigator.cookieEnabled,
            onLine: navigator.onLine,
            language: navigator.language,
            plugins: navigator.plugins.length,
            javaEnabled: typeof navigator.javaEnabled === 'function' ? navigator.javaEnabled() : false,
            doNotTrack: navigator.doNotTrack,
            hardwareConcurrency: navigator.hardwareConcurrency,
            deviceMemory: (navigator as any).deviceMemory,
            viewport: {
              width: window.innerWidth,
              height: window.innerHeight,
              devicePixelRatio: window.devicePixelRatio
            }
          };
        });
        
        console.log(`🔍 Browser Info for ${browserName}:`);
        console.log(`   Platform: ${browserInfo.platform}`);
        console.log(`   Language: ${browserInfo.language}`);
        console.log(`   Viewport: ${browserInfo.viewport.width}x${browserInfo.viewport.height}`);
        console.log(`   Device Pixel Ratio: ${browserInfo.viewport.devicePixelRatio}`);
        console.log(`   Hardware Concurrency: ${browserInfo.hardwareConcurrency}`);
        console.log(`   Cookies Enabled: ${browserInfo.cookieEnabled}`);
        
        await actions.screenshot(`${browserName}-initial-load`, `${browserName} initial page load`);
      });
      
      await test.step('Login Functionality Cross-Browser', async () => {
        await actions.observableFill('#user-name', 'standard_user', `Enter username in ${browserName}`);
        await actions.observableFill('#password', 'secret_sauce', `Enter password in ${browserName}`);
        await actions.observableClick('#login-button', `Login in ${browserName}`);
        
        await actions.observableWait('.inventory_list', `Wait for inventory in ${browserName}`);
        
        await actions.observableExpect(async () => {
          await expect(page).toHaveURL(/inventory/);
        }, `Verify login success in ${browserName}`);
        
        console.log(`✅ Login functionality works in ${browserName}`);
      });
      
      await test.step('Shopping Cart Cross-Browser', async () => {
        await actions.observableClick('[data-test="add-to-cart-sauce-labs-backpack"]', `Add item to cart in ${browserName}`);
        
        await actions.observableExpect(async () => {
          await expect(page.locator('.shopping_cart_badge')).toHaveText('1');
        }, `Verify cart badge in ${browserName}`);
        
        await actions.observableClick('.shopping_cart_link', `Open cart in ${browserName}`);
        
        await actions.observableExpect(async () => {
          await expect(page.locator('.cart_item')).toBeVisible();
        }, `Verify cart contents in ${browserName}`);
        
        console.log(`✅ Shopping cart functionality works in ${browserName}`);
        await actions.screenshot(`${browserName}-cart-state`, `${browserName} cart functionality`);
      });
      
      await test.step('CSS Rendering and Layout Validation', async () => {
        // Check for layout consistency
        const layoutMetrics = await page.evaluate(() => {
          const inventory = document.querySelector('.inventory_list');
          const cartIcon = document.querySelector('.shopping_cart_link');
          const header = document.querySelector('.app_logo');
          
          return {
            inventoryVisible: inventory ? window.getComputedStyle(inventory).display !== 'none' : false,
            cartIconVisible: cartIcon ? window.getComputedStyle(cartIcon).display !== 'none' : false,
            headerVisible: header ? window.getComputedStyle(header).display !== 'none' : false,
            inventoryGrid: inventory ? {
              display: window.getComputedStyle(inventory).display,
              flexDirection: window.getComputedStyle(inventory).flexDirection,
              gridTemplateColumns: window.getComputedStyle(inventory).gridTemplateColumns
            } : null
          };
        });
        
        expect(layoutMetrics.inventoryVisible).toBeTruthy();
        expect(layoutMetrics.cartIconVisible).toBeTruthy();
        expect(layoutMetrics.headerVisible).toBeTruthy();
        
        console.log(`✅ Layout renders correctly in ${browserName}`);
        console.log(`   Inventory display: ${layoutMetrics.inventoryGrid?.display}`);
      });
      
      await test.step('JavaScript Functionality Validation', async () => {
        // Test dynamic content and interactions
        const jsFeatures = await page.evaluate(() => {
          const features = {
            localStorageAvailable: typeof Storage !== 'undefined' && window.localStorage !== null,
            sessionStorageAvailable: typeof Storage !== 'undefined' && window.sessionStorage !== null,
            fetchAvailable: typeof fetch !== 'undefined',
            promiseAvailable: typeof Promise !== 'undefined',
            arrayMethodsAvailable: typeof Array.prototype.map === 'function' && typeof Array.prototype.filter === 'function' && typeof Array.prototype.reduce === 'function',
            es6FeaturesAvailable: (() => {
              try {
                // Test arrow functions, const/let, template literals
                eval('const test = () => `template literal`; test();');
                return true;
              } catch (e) {
                return false;
              }
            })(),
            consoleAvailable: typeof console !== 'undefined'
          };
          
          return features;
        });
        
        console.log(`🔧 JavaScript Features in ${browserName}:`);
        Object.entries(jsFeatures).forEach(([feature, available]) => {
          console.log(`   ${feature}: ${available ? '✅' : '❌'}`);
        });
        
        // All modern features should be available
        expect(jsFeatures.localStorageAvailable).toBeTruthy();
        expect(jsFeatures.fetchAvailable).toBeTruthy();
        expect(jsFeatures.promiseAvailable).toBeTruthy();
        expect(jsFeatures.arrayMethodsAvailable).toBeTruthy();
      });
    });
  });
  
  test('Responsive Design Cross-Device Testing', async ({ page }) => {
    const actions = createObservableActions(page);
    
    const deviceTests = [
      { name: 'Desktop', width: 1920, height: 1080 },
      { name: 'Laptop', width: 1366, height: 768 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Mobile Large', width: 414, height: 896 },
      { name: 'Mobile Small', width: 375, height: 667 }
    ];
    
    for (const device of deviceTests) {
      await test.step(`Responsive Design: ${device.name} (${device.width}x${device.height})`, async () => {
        await page.setViewportSize({ width: device.width, height: device.height });
        await actions.observableGoto(testUrl, `Loading on ${device.name}`);
        
        // Check responsive behavior
        const responsiveMetrics = await page.evaluate(() => {
          const inventory = document.querySelector('.inventory_list');
          const header = document.querySelector('.header_container');
          const footer = document.querySelector('.footer');
          
          return {
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            documentWidth: document.documentElement.scrollWidth,
            documentHeight: document.documentElement.scrollHeight,
            hasHorizontalScroll: document.documentElement.scrollWidth > window.innerWidth,
            hasVerticalScroll: document.documentElement.scrollHeight > window.innerHeight,
            inventoryLayout: inventory ? {
              display: window.getComputedStyle(inventory).display,
              flexWrap: window.getComputedStyle(inventory).flexWrap,
              gridTemplateColumns: window.getComputedStyle(inventory).gridTemplateColumns
            } : null,
            headerHeight: header ? header.getBoundingClientRect().height : 0,
            footerHeight: footer ? footer.getBoundingClientRect().height : 0
          };
        });
        
        console.log(`📱 ${device.name} Responsive Analysis:`);
        console.log(`   Viewport: ${responsiveMetrics.viewportWidth}x${responsiveMetrics.viewportHeight}`);
        console.log(`   Document: ${responsiveMetrics.documentWidth}x${responsiveMetrics.documentHeight}`);
        console.log(`   Horizontal scroll: ${responsiveMetrics.hasHorizontalScroll ? '❌' : '✅'}`);
        console.log(`   Vertical scroll: ${responsiveMetrics.hasVerticalScroll ? '📜' : '✅'}`);
        
        // Responsive design should not have horizontal scroll
        expect(responsiveMetrics.hasHorizontalScroll).toBeFalsy();
        
        // Take screenshot for visual comparison
        await actions.screenshot(`responsive-${device.name.toLowerCase().replace(' ', '-')}`, `${device.name} responsive layout`);
        
        // Test basic functionality on each device size
        if (device.width >= 768) { // Desktop and tablet
          await actions.observableFill('#user-name', 'standard_user', `Login on ${device.name}`);
          await actions.observableFill('#password', 'secret_sauce', `Password on ${device.name}`);
          await actions.observableClick('#login-button', `Submit on ${device.name}`);
          
          await actions.observableWait('.inventory_list', `Wait for content on ${device.name}`);
          console.log(`✅ Login functionality works on ${device.name}`);
          
          // Go back to login page for next device test
          await page.goto(testUrl);
        }
      });
    }
    
    // Reset to standard desktop size
    await page.setViewportSize({ width: 1280, height: 720 });
  });
  
  test('Feature Detection and Graceful Degradation', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await test.step('Modern Web APIs Availability', async () => {
      await actions.observableGoto(testUrl, 'Loading for feature detection');
      
      const webApis = await page.evaluate(() => {
        return {
          // Core APIs
          fetch: typeof fetch !== 'undefined',
          localStorage: typeof localStorage !== 'undefined',
          sessionStorage: typeof sessionStorage !== 'undefined',
          history: typeof history !== 'undefined' && typeof history.pushState !== 'undefined',
          
          // Form APIs
          formData: typeof FormData !== 'undefined',
          urlSearchParams: typeof URLSearchParams !== 'undefined',
          
          // Media APIs
          matchMedia: typeof matchMedia !== 'undefined',
          
          // Performance APIs
          performanceNow: typeof performance !== 'undefined' && typeof performance.now !== 'undefined',
          performanceObserver: typeof PerformanceObserver !== 'undefined',
          
          // Security APIs
          crypto: typeof crypto !== 'undefined' && typeof crypto.getRandomValues !== 'undefined',
          
          // ES6+ Features
          promises: typeof Promise !== 'undefined',
          symbols: typeof Symbol !== 'undefined',
          maps: typeof Map !== 'undefined',
          sets: typeof Set !== 'undefined',
          weakMaps: typeof WeakMap !== 'undefined',
          
          // DOM APIs
          querySelector: typeof document.querySelector !== 'undefined',
          addEventListener: typeof EventTarget !== 'undefined',
          classList: document.createElement('div').classList !== undefined,
          
          // CSS Features
          cssSupports: typeof CSS !== 'undefined' && typeof CSS.supports !== 'undefined',
          flexbox: CSS && CSS.supports ? CSS.supports('display', 'flex') : false,
          grid: CSS && CSS.supports ? CSS.supports('display', 'grid') : false,
          customProperties: CSS && CSS.supports ? CSS.supports('(--custom: property)') : false,
        };
      });
      
      console.log('\n🔍 WEB API FEATURE DETECTION:');
      console.log('═══════════════════════════════════════════════════════════');
      
      Object.entries(webApis).forEach(([api, supported]) => {
        console.log(`   ${api}: ${supported ? '✅' : '❌'}`);
      });
      
      // Critical features should be available
      expect(webApis.fetch).toBeTruthy();
      expect(webApis.localStorage).toBeTruthy();
      expect(webApis.promises).toBeTruthy();
      expect(webApis.querySelector).toBeTruthy();
      expect(webApis.addEventListener).toBeTruthy();
      
      // Modern CSS features should be available
      expect(webApis.flexbox).toBeTruthy();
      expect(webApis.grid).toBeTruthy();
      
      console.log('✅ All critical web APIs are available');
    });
    
    await test.step('Browser Compatibility Score', async () => {
      const compatibilityScore = await page.evaluate(() => {
        let score = 100;
        const features = [
          { name: 'fetch', check: () => typeof fetch !== 'undefined', weight: 15 },
          { name: 'localStorage', check: () => typeof localStorage !== 'undefined', weight: 10 },
          { name: 'flexbox', check: () => CSS && CSS.supports && CSS.supports('display', 'flex'), weight: 10 },
          { name: 'grid', check: () => CSS && CSS.supports && CSS.supports('display', 'grid'), weight: 10 },
          { name: 'es6', check: () => typeof Promise !== 'undefined' && typeof Symbol !== 'undefined', weight: 15 },
          { name: 'webgl', check: () => {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
          }, weight: 5 },
          { name: 'serviceworker', check: () => 'serviceWorker' in navigator, weight: 5 },
          { name: 'webworkers', check: () => typeof Worker !== 'undefined', weight: 5 },
          { name: 'customelements', check: () => 'customElements' in window, weight: 5 },
          { name: 'modules', check: () => {
            const script = document.createElement('script');
            return 'noModule' in script;
          }, weight: 10 },
        ];
        
        const results: any = {};
        features.forEach(feature => {
          try {
            const supported = feature.check();
            results[feature.name] = supported;
            if (!supported) {
              score -= feature.weight;
            }
          } catch (e) {
            results[feature.name] = false;
            score -= feature.weight;
          }
        });
        
        return { score: Math.max(0, score), results };
      });
      
      console.log(`\n🏆 BROWSER COMPATIBILITY SUMMARY:`);
      console.log(`═══════════════════════════════════════════════════════════`);
      console.log(`🎯 Compatibility Score: ${compatibilityScore.score}/100`);
      
      let grade = 'F';
      if (compatibilityScore.score >= 95) grade = 'A+';
      else if (compatibilityScore.score >= 90) grade = 'A';
      else if (compatibilityScore.score >= 85) grade = 'B+';
      else if (compatibilityScore.score >= 80) grade = 'B';
      else if (compatibilityScore.score >= 75) grade = 'C+';
      else if (compatibilityScore.score >= 70) grade = 'C';
      else if (compatibilityScore.score >= 65) grade = 'D';
      
      console.log(`🏅 Grade: ${grade}`);
      
      console.log(`\n📊 Feature Support:`);
      Object.entries(compatibilityScore.results).forEach(([feature, supported]) => {
        console.log(`   ${feature}: ${supported ? '✅' : '❌'}`);
      });
      
      console.log(`═══════════════════════════════════════════════════════════\n`);
      
      // Assert minimum compatibility
      expect(compatibilityScore.score).toBeGreaterThan(80);
    });
  });
});
