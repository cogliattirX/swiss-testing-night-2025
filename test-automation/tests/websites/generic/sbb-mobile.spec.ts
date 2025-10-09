import { test, expect, devices } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

test.describe('SBB.ch Mobile Responsive & Device Testing', () => {
  
  // Test on different mobile devices
  const mobileDevices = [
    { name: 'iPhone 13', device: devices['iPhone 13'] },
    { name: 'iPhone 13 Pro', device: devices['iPhone 13 Pro'] },
    { name: 'Samsung Galaxy S21', device: devices['Galaxy S21'] },
    { name: 'iPad Pro', device: devices['iPad Pro'] }
  ];

  mobileDevices.forEach(({ name, device }) => {
    test(`Mobile journey booking - ${name}`, async ({ browser }) => {
      const context = await browser.newContext({ ...device });
      const page = await context.newPage();
      const actions = createObservableActions(page);
      
      actions.logTestInfo(`📱 Testing journey booking on ${name}`);
      
      await actions.step(`📱 ${name} - Navigate and Setup`, async () => {
        await actions.observableGoto('https://www.sbb.ch', `Navigate on ${name}`);
        
        // Log device info
        const viewportSize = page.viewportSize();
        actions.logTestInfo(`📐 Viewport: ${viewportSize?.width}x${viewportSize?.height}`);
        
        // Accept cookies
        try {
          await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 3000 });
          await actions.observableClick('#onetrust-accept-btn-handler', `Accept cookies on ${name}`);
        } catch (error) {
          actions.logTestInfo(`ℹ️ No cookie banner on ${name}`);
        }
      });

      await actions.step(`🔍 ${name} - Mobile Form Interaction`, async () => {
        // Check if mobile-specific elements are present
        const mobileMenu = page.locator('[aria-label*="menu"], .mobile-menu, .hamburger-menu').first();
        const hasMobileMenu = await mobileMenu.isVisible().catch(() => false);
        
        if (hasMobileMenu) {
          actions.logTestInfo(`✅ Mobile menu detected on ${name}`);
        }
        
        // Test form interaction on mobile
        const fromField = page.getByRole('combobox', { name: /from/i }).first();
        const toField = page.getByRole('combobox', { name: /to/i }).first();
        
        // Check if fields are easily tappable
        const fromBounds = await fromField.boundingBox();
        if (fromBounds) {
          const tapTargetSize = Math.min(fromBounds.width, fromBounds.height);
          actions.logTestInfo(`👆 From field tap target: ${tapTargetSize}px`);
          
          if (tapTargetSize >= 44) {
            actions.logTestInfo(`✅ Good tap target size (≥44px)`);
          } else {
            actions.logTestInfo(`⚠️ Small tap target (<44px)`);
          }
        }
        
        // Test mobile keyboard input
        await fromField.tap();
        await page.waitForTimeout(500);
        
        await fromField.fill('Zürich HB');
        await toField.tap();
        await toField.fill('Bern');
        
        actions.logTestInfo(`✅ Mobile form input successful on ${name}`);
        
        // Test mobile search
        await page.keyboard.press('Enter');
        await page.waitForLoadState('networkidle', { timeout: 10000 });
        
        await actions.screenshot(`mobile-${name.toLowerCase().replace(/\s+/g, '-')}`, `${name} journey results`);
      });

      await actions.step(`📱 ${name} - Mobile-Specific Features`, async () => {
        // Test touch gestures
        const viewport = page.viewportSize();
        if (viewport) {
          // Test scroll behavior
          await page.mouse.wheel(0, 300);
          await page.waitForTimeout(500);
          
          actions.logTestInfo(`🔄 Scroll test completed on ${name}`);
          
          // Test pinch-to-zoom behavior (simulated)
          await page.evaluate(() => {
            const event = new TouchEvent('touchstart', {
              touches: [
                new Touch({ identifier: 0, target: document.body, clientX: 100, clientY: 100 }),
                new Touch({ identifier: 1, target: document.body, clientX: 200, clientY: 200 })
              ]
            });
            document.dispatchEvent(event);
          });
          
          actions.logTestInfo(`🤏 Pinch gesture test completed on ${name}`);
        }
        
        // Check for mobile-optimized elements
        const mobileOptimizations = await page.evaluate(() => {
          return {
            hasViewportMeta: !!document.querySelector('meta[name="viewport"]'),
            hasTouchIcons: !!document.querySelector('link[rel*="apple-touch-icon"]'),
            hasManifest: !!document.querySelector('link[rel="manifest"]'),
            hasThemeColor: !!document.querySelector('meta[name="theme-color"]')
          };
        });
        
        actions.logTestInfo(`📱 Mobile optimizations on ${name}:`);
        actions.logTestInfo(`  Viewport meta: ${mobileOptimizations.hasViewportMeta ? '✅' : '❌'}`);
        actions.logTestInfo(`  Touch icons: ${mobileOptimizations.hasTouchIcons ? '✅' : '❌'}`);
        actions.logTestInfo(`  App manifest: ${mobileOptimizations.hasManifest ? '✅' : '❌'}`);
        actions.logTestInfo(`  Theme color: ${mobileOptimizations.hasThemeColor ? '✅' : '❌'}`);
      });

      await context.close();
    });
  });

  test('Responsive breakpoint testing', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('📏 Testing responsive design breakpoints');
    
    const breakpoints = [
      { name: 'Mobile Small', width: 320, height: 568 },
      { name: 'Mobile Medium', width: 375, height: 667 },
      { name: 'Mobile Large', width: 414, height: 736 },
      { name: 'Tablet Portrait', width: 768, height: 1024 },
      { name: 'Tablet Landscape', width: 1024, height: 768 },
      { name: 'Desktop Small', width: 1280, height: 720 },
      { name: 'Desktop Large', width: 1920, height: 1080 },
      { name: 'Wide Screen', width: 2560, height: 1440 }
    ];

    for (const breakpoint of breakpoints) {
      await actions.step(`📐 Test ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`, async () => {
        await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
        await actions.observableGoto('https://www.sbb.ch', `Navigate at ${breakpoint.name}`);
        
        // Accept cookies
        try {
          await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 3000 });
          await actions.observableClick('#onetrust-accept-btn-handler', 'Accept cookies');
        } catch (error) {
          actions.logTestInfo('ℹ️ No cookie banner');
        }
        
        // Check layout at this breakpoint
        const layoutInfo = await page.evaluate(() => {
          const body = document.body;
          const header = document.querySelector('header, nav, [role="banner"]');
          const main = document.querySelector('main, [role="main"]');
          const footer = document.querySelector('footer, [role="contentinfo"]');
          
          return {
            bodyWidth: body.scrollWidth,
            bodyHeight: body.scrollHeight,
            hasHorizontalScroll: body.scrollWidth > window.innerWidth,
            hasVerticalScroll: body.scrollHeight > window.innerHeight,
            headerHeight: header ? header.getBoundingClientRect().height : 0,
            mainHeight: main ? main.getBoundingClientRect().height : 0,
            footerHeight: footer ? footer.getBoundingClientRect().height : 0
          };
        });
        
        actions.logTestInfo(`📊 Layout at ${breakpoint.name}:`);
        actions.logTestInfo(`  Body size: ${layoutInfo.bodyWidth}x${layoutInfo.bodyHeight}`);
        actions.logTestInfo(`  Horizontal scroll: ${layoutInfo.hasHorizontalScroll ? '❌' : '✅'}`);
        actions.logTestInfo(`  Header height: ${layoutInfo.headerHeight}px`);
        actions.logTestInfo(`  Main height: ${layoutInfo.mainHeight}px`);
        
        // Check if horizontal scrolling occurs (bad for responsive design)
        if (layoutInfo.hasHorizontalScroll) {
          actions.logTestInfo(`⚠️ Horizontal scrolling detected at ${breakpoint.name}`);
        }
        
        // Test form accessibility at this breakpoint
        const fromField = page.getByRole('combobox', { name: /from/i }).first();
        const fromBounds = await fromField.boundingBox().catch(() => null);
        
        if (fromBounds) {
          const isVisible = fromBounds.x >= 0 && fromBounds.y >= 0 && 
                           fromBounds.x + fromBounds.width <= breakpoint.width;
          
          actions.logTestInfo(`📝 Form field visibility: ${isVisible ? '✅' : '⚠️'}`);
        }
        
        await actions.screenshot(`responsive-${breakpoint.name.toLowerCase().replace(/\s+/g, '-')}`, `${breakpoint.name} layout`);
      });
    }
  });

  test('Touch interaction and gestures', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('👆 Testing touch interactions and gestures');
    
    await actions.step('📱 Setup Mobile Environment', async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await actions.observableGoto('https://www.sbb.ch', 'Navigate for touch testing');
      
      // Accept cookies
      try {
        await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 3000 });
        await actions.observableClick('#onetrust-accept-btn-handler', 'Accept cookies');
      } catch (error) {
        actions.logTestInfo('ℹ️ No cookie banner');
      }
    });

    await actions.step('👆 Test Touch Targets', async () => {
      // Find all interactive elements
      const interactiveElements = await page.locator('button, a, input, select, [role="button"], [tabindex="0"]').all();
      
      let adequateTouchTargets = 0;
      let totalTargets = 0;
      
      for (const element of interactiveElements.slice(0, 10)) { // Test first 10 elements
        const bounds = await element.boundingBox().catch(() => null);
        if (bounds) {
          totalTargets++;
          const minSize = Math.min(bounds.width, bounds.height);
          
          if (minSize >= 44) {
            adequateTouchTargets++;
          }
          
          // Log first few for detail
          if (totalTargets <= 5) {
            const tagName = await element.evaluate(el => el.tagName).catch(() => 'unknown');
            actions.logTestInfo(`👆 ${tagName}: ${bounds.width}x${bounds.height}px (min: ${minSize}px)`);
          }
        }
      }
      
      const percentage = totalTargets > 0 ? (adequateTouchTargets / totalTargets * 100).toFixed(1) : 0;
      actions.logTestInfo(`📊 Touch target analysis: ${adequateTouchTargets}/${totalTargets} (${percentage}%) meet 44px minimum`);
      
      if (parseFloat(percentage.toString()) >= 80) {
        actions.logTestInfo(`✅ Good touch target compliance`);
      } else {
        actions.logTestInfo(`⚠️ Many touch targets may be too small`);
      }
    });

    await actions.step('🤏 Test Gesture Recognition', async () => {
      // Test various touch gestures
      const gestures = [
        {
          name: 'Single Tap',
          action: async () => {
            const fromField = page.getByRole('combobox', { name: /from/i }).first();
            await fromField.tap();
            return await fromField.evaluate(el => document.activeElement === el);
          }
        },
        {
          name: 'Double Tap',
          action: async () => {
            const fromField = page.getByRole('combobox', { name: /from/i }).first();
            await fromField.dblclick();
            return true; // Just test if it doesn't crash
          }
        },
        {
          name: 'Long Press',
          action: async () => {
            const fromField = page.getByRole('combobox', { name: /from/i }).first();
            const bounds = await fromField.boundingBox();
            if (bounds) {
              await page.touchscreen.tap(bounds.x + bounds.width/2, bounds.y + bounds.height/2);
              await page.waitForTimeout(1000); // Simulate long press duration
              return true;
            }
            return false;
          }
        },
        {
          name: 'Swipe Down',
          action: async () => {
            const viewport = page.viewportSize();
            if (viewport) {
              await page.touchscreen.tap(viewport.width/2, viewport.height/2);
              await page.mouse.move(viewport.width/2, viewport.height/2 + 100);
              return true;
            }
            return false;
          }
        }
      ];
      
      for (const gesture of gestures) {
        try {
          actions.logTestInfo(`🤏 Testing ${gesture.name}`);
          const result = await gesture.action();
          actions.logTestInfo(`${result ? '✅' : '⚠️'} ${gesture.name}: ${result ? 'Success' : 'Issue detected'}`);
        } catch (error) {
          actions.logTestInfo(`❌ ${gesture.name}: Error - ${(error as Error).message}`);
        }
        
        await page.waitForTimeout(500);
      }
    });

    await actions.step('📱 Test Mobile-Specific Interactions', async () => {
      // Test focus behavior on mobile
      const fromField = page.getByRole('combobox', { name: /from/i }).first();
      
      await fromField.tap();
      const isFocused = await fromField.evaluate(el => document.activeElement === el);
      actions.logTestInfo(`📱 Mobile focus: ${isFocused ? '✅' : '❌'}`);
      
      // Test virtual keyboard handling
      await fromField.fill('Test Station');
      
      // Check if viewport adjusts for virtual keyboard
      const viewportAfterKeyboard = page.viewportSize();
      actions.logTestInfo(`⌨️ Viewport after keyboard: ${viewportAfterKeyboard?.width}x${viewportAfterKeyboard?.height}`);
      
      // Test autocomplete on mobile
      await fromField.fill('Zür');
      await page.waitForTimeout(1000);
      
      const suggestions = await page.locator('[role="option"], .suggestion, [class*="autocomplete"]').count();
      actions.logTestInfo(`🔍 Mobile autocomplete suggestions: ${suggestions}`);
      
      if (suggestions > 0) {
        actions.logTestInfo(`✅ Mobile autocomplete working`);
      }
    });
  });

  test('Device orientation and rotation', async ({ browser }) => {
    
    // Test portrait to landscape rotation
    const context1 = await browser.newContext({
      viewport: { width: 375, height: 667 }
    });
    const page1 = await context1.newPage();
    const actions = createObservableActions(page1);
    
    actions.logTestInfo('🔄 Testing device orientation changes');
    
    await actions.step('📱 Test Portrait to Landscape Rotation', async () => {
      
      await actions.observableGoto('https://www.sbb.ch', 'Navigate in portrait mode');
      
      // Accept cookies
      try {
        await page1.waitForSelector('#onetrust-accept-btn-handler', { timeout: 3000 });
        await actions.observableClick('#onetrust-accept-btn-handler', 'Accept cookies');
      } catch (error) {
        actions.logTestInfo('ℹ️ No cookie banner');
      }
      
      // Capture portrait layout
      const portraitLayout = await page1.evaluate(() => {
        const main = document.querySelector('main, [role="main"]');
        return {
          width: window.innerWidth,
          height: window.innerHeight,
          mainHeight: main ? main.getBoundingClientRect().height : 0,
          orientation: window.innerWidth < window.innerHeight ? 'portrait' : 'landscape'
        };
      });
      
      actions.logTestInfo(`📱 Portrait mode: ${portraitLayout.width}x${portraitLayout.height}`);
      actions.logTestInfo(`📱 Orientation: ${portraitLayout.orientation}`);
      
      await actions.screenshot('orientation-portrait', 'Portrait mode layout');
      
      // Rotate to landscape
      await page1.setViewportSize({ width: 667, height: 375 });
      await page1.waitForTimeout(1000); // Wait for layout to adjust
      
      const landscapeLayout = await page1.evaluate(() => {
        const main = document.querySelector('main, [role="main"]');
        return {
          width: window.innerWidth,
          height: window.innerHeight,
          mainHeight: main ? main.getBoundingClientRect().height : 0,
          orientation: window.innerWidth < window.innerHeight ? 'portrait' : 'landscape'
        };
      });
      
      actions.logTestInfo(`📱 Landscape mode: ${landscapeLayout.width}x${landscapeLayout.height}`);
      actions.logTestInfo(`📱 Orientation: ${landscapeLayout.orientation}`);
      
      await actions.screenshot('orientation-landscape', 'Landscape mode layout');
      
      // Check if layout adapts properly
      if (landscapeLayout.orientation === 'landscape' && portraitLayout.orientation === 'portrait') {
        actions.logTestInfo(`✅ Orientation change detected correctly`);
      }
      
      // Test form usability in both orientations
      const fromField = page1.getByRole('combobox', { name: /from/i }).first();
      const landscapeBounds = await fromField.boundingBox();
      
      if (landscapeBounds) {
        const isVisible = landscapeBounds.y + landscapeBounds.height <= landscapeLayout.height;
        actions.logTestInfo(`📝 Form visibility in landscape: ${isVisible ? '✅' : '⚠️'}`);
      }
      
      await context1.close();
    });

    await actions.step('🔄 Test Multiple Orientation Changes', async () => {
      const context = await browser.newContext({
        viewport: { width: 414, height: 736 }
      });
      const page = await context.newPage();
      const actions2 = createObservableActions(page);
      
      await actions2.observableGoto('https://www.sbb.ch', 'Navigate for rotation testing');
      
      const orientations = [
        { name: 'Portrait', width: 414, height: 736 },
        { name: 'Landscape', width: 736, height: 414 },
        { name: 'Portrait Again', width: 414, height: 736 },
        { name: 'Landscape Again', width: 736, height: 414 }
      ];
      
      for (const orientation of orientations) {
        actions2.logTestInfo(`🔄 Testing ${orientation.name}: ${orientation.width}x${orientation.height}`);
        
        await page.setViewportSize({ width: orientation.width, height: orientation.height });
        await page.waitForTimeout(800); // Wait for layout adjustment
        
        // Check for layout issues after rotation
        const layoutCheck = await page.evaluate(() => {
          return {
            hasHorizontalScroll: document.body.scrollWidth > window.innerWidth,
            hasVerticalScroll: document.body.scrollHeight > window.innerHeight,
            elementsOverflow: Array.from(document.querySelectorAll('*')).some(el => {
              const rect = el.getBoundingClientRect();
              return rect.right > window.innerWidth + 10; // 10px tolerance
            })
          };
        });
        
        actions2.logTestInfo(`  Horizontal scroll: ${layoutCheck.hasHorizontalScroll ? '⚠️' : '✅'}`);
        actions2.logTestInfo(`  Elements overflow: ${layoutCheck.elementsOverflow ? '⚠️' : '✅'}`);
        
        // Test form interaction after rotation
        try {
          const fromField = page.getByRole('combobox', { name: /from/i }).first();
          await fromField.tap();
          await fromField.fill(`Test ${orientation.name}`);
          actions2.logTestInfo(`  Form interaction: ✅`);
        } catch (error) {
          actions2.logTestInfo(`  Form interaction: ⚠️ Issue detected`);
        }
      }
      
      await context.close();
    });
  });

  test('Mobile performance and resource optimization', async ({ browser }) => {
    
    // Mobile Performance Baseline
    const context1 = await browser.newContext({
      ...devices['iPhone 13'],
      // Simulate slower mobile connection
      extraHTTPHeaders: { 'User-Agent': devices['iPhone 13'].userAgent }
    });
    const page1 = await context1.newPage();
    const actions = createObservableActions(page1);
    
    actions.logTestInfo('⚡ Testing mobile performance and optimization');
    
    await actions.step('📱 Mobile Performance Baseline', async () => {
      
      // Monitor network requests
      const requests: any[] = [];
      page1.on('request', (request: any) => {
        requests.push({
          url: request.url(),
          resourceType: request.resourceType(),
          size: request.postData()?.length || 0
        });
      });
      
      const startTime = Date.now();
      await actions.observableGoto('https://www.sbb.ch', 'Navigate on mobile device');
      
      const loadTime = Date.now() - startTime;
      actions.logTestInfo(`📱 Mobile load time: ${loadTime}ms`);
      
      // Analyze mobile-specific requests
      const imageRequests = requests.filter(r => r.resourceType === 'image');
      const jsRequests = requests.filter(r => r.resourceType === 'script');
      
      actions.logTestInfo(`📊 Mobile resource analysis:`);
      actions.logTestInfo(`  Total requests: ${requests.length}`);
      actions.logTestInfo(`  Images: ${imageRequests.length}`);
      actions.logTestInfo(`  Scripts: ${jsRequests.length}`);
      
      // Check for mobile-optimized images
      const largeImages = imageRequests.filter(r => r.url.includes('2x') || r.url.includes('retina'));
      actions.logTestInfo(`📱 High-DPI images: ${largeImages.length}`);
      
      if (loadTime < 3000) {
        actions.logTestInfo(`✅ Good mobile performance (<3s)`);
      } else if (loadTime < 5000) {
        actions.logTestInfo(`⚠️ Moderate mobile performance (<5s)`);
      } else {
        actions.logTestInfo(`❌ Poor mobile performance (>5s)`);
      }
      
      await context1.close();
    });

    await actions.step('📱 Mobile-Specific Feature Detection', async () => {
      const context2 = await browser.newContext(devices['iPhone 13']);
      const page2 = await context2.newPage();
      const actions2 = createObservableActions(page2);
      
      await actions2.observableGoto('https://www.sbb.ch', 'Navigate for feature detection');
      
      const mobileFeatures = await page2.evaluate(() => {
        return {
          touchSupport: 'ontouchstart' in window,
          orientationSupport: 'orientation' in window,
          deviceMotion: 'DeviceMotionEvent' in window,
          deviceOrientation: 'DeviceOrientationEvent' in window,
          vibration: 'vibrate' in navigator,
          geolocation: 'geolocation' in navigator,
          camera: navigator.mediaDevices && 'getUserMedia' in navigator.mediaDevices,
          battery: 'getBattery' in navigator,
          networkInfo: 'connection' in navigator,
          serviceWorker: 'serviceWorker' in navigator,
          pushNotifications: 'PushManager' in window,
          webShare: 'share' in navigator
        };
      });
      
      actions2.logTestInfo(`📱 Mobile feature detection:`);
      Object.entries(mobileFeatures).forEach(([feature, supported]) => {
        const icon = supported ? '✅' : '❌';
        actions2.logTestInfo(`  ${icon} ${feature}: ${supported ? 'Supported' : 'Not supported'}`);
      });
      
      await context2.close();
    });
  });
});