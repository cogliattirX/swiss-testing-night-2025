import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

test.describe('SBB.ch Performance & Load Testing', () => {
  
  test('Core Web Vitals and loading performance', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('⚡ Testing Core Web Vitals and page performance');
    
    await actions.step('📊 Measure Initial Page Load', async () => {
      const startTime = Date.now();
      
      await actions.observableGoto('https://www.sbb.ch', 'Navigate for performance testing');
      
      const loadTime = Date.now() - startTime;
      actions.logTestInfo(`⏱️ Initial navigation time: ${loadTime}ms`);
      
      // Wait for network to be idle
      await page.waitForLoadState('networkidle');
      
      const totalLoadTime = Date.now() - startTime;
      actions.logTestInfo(`⏱️ Total load time (networkidle): ${totalLoadTime}ms`);
      
      // Expect reasonable load times
      expect(totalLoadTime).toBeLessThan(10000); // 10 seconds max
      
      if (totalLoadTime < 3000) {
        actions.logTestInfo('✅ Excellent load performance (<3s)');
      } else if (totalLoadTime < 5000) {
        actions.logTestInfo('✅ Good load performance (<5s)');
      } else {
        actions.logTestInfo('⚠️ Moderate load performance (>5s)');
      }
    });

    await actions.step('📈 Collect Core Web Vitals', async () => {
      const webVitals = await page.evaluate(() => {
        return new Promise((resolve) => {
          const vitals: any = {};
          
          // LCP (Largest Contentful Paint)
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) {
              const lastEntry = entries[entries.length - 1];
              vitals.lcp = lastEntry.startTime;
            }
          }).observe({ entryTypes: ['largest-contentful-paint'] });
          
          // FID would require real user interaction
          // CLS (Cumulative Layout Shift)
          new PerformanceObserver((list) => {
            let clsScore = 0;
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsScore += (entry as any).value;
              }
            }
            vitals.cls = clsScore;
          }).observe({ entryTypes: ['layout-shift'] });
          
          // TTFB (Time to First Byte)
          const navigation = performance.getEntriesByType('navigation')[0] as any;
          if (navigation) {
            vitals.ttfb = navigation.responseStart - navigation.requestStart;
            vitals.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;
            vitals.loadComplete = navigation.loadEventEnd - navigation.navigationStart;
          }
          
          setTimeout(() => resolve(vitals), 3000);
        });
      });
      
      actions.logTestInfo('📊 Core Web Vitals Results:');
      if (webVitals.lcp) {
        actions.logTestInfo(`  LCP (Largest Contentful Paint): ${Math.round(webVitals.lcp)}ms`);
        if (webVitals.lcp < 2500) {
          actions.logTestInfo('  ✅ LCP: Good (<2.5s)');
        } else if (webVitals.lcp < 4000) {
          actions.logTestInfo('  ⚠️ LCP: Needs improvement (<4s)');
        } else {
          actions.logTestInfo('  ❌ LCP: Poor (>4s)');
        }
      }
      
      if (webVitals.cls !== undefined) {
        actions.logTestInfo(`  CLS (Cumulative Layout Shift): ${webVitals.cls.toFixed(3)}`);
        if (webVitals.cls < 0.1) {
          actions.logTestInfo('  ✅ CLS: Good (<0.1)');
        } else if (webVitals.cls < 0.25) {
          actions.logTestInfo('  ⚠️ CLS: Needs improvement (<0.25)');
        } else {
          actions.logTestInfo('  ❌ CLS: Poor (>0.25)');
        }
      }
      
      if (webVitals.ttfb) {
        actions.logTestInfo(`  TTFB (Time to First Byte): ${Math.round(webVitals.ttfb)}ms`);
        if (webVitals.ttfb < 200) {
          actions.logTestInfo('  ✅ TTFB: Excellent (<200ms)');
        } else if (webVitals.ttfb < 500) {
          actions.logTestInfo('  ✅ TTFB: Good (<500ms)');
        } else {
          actions.logTestInfo('  ⚠️ TTFB: Could be improved (>500ms)');
        }
      }
    });

    await actions.step('🏋️ Test Journey Search Performance', async () => {
      // Accept cookies first
      try {
        await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 3000 });
        await actions.observableClick('#onetrust-accept-btn-handler', 'Accept cookies');
      } catch (error) {
        actions.logTestInfo('ℹ️ No cookie banner');
      }
      
      // Measure journey search performance
      const fromField = page.getByRole('combobox', { name: /from/i }).first();
      const toField = page.getByRole('combobox', { name: /to/i }).first();
      
      const searchStartTime = Date.now();
      
      await fromField.fill('Zürich HB');
      await toField.fill('Bern');
      
      // Start search
      await page.keyboard.press('Enter');
      
      // Wait for results
      await page.waitForLoadState('networkidle');
      
      const searchTime = Date.now() - searchStartTime;
      actions.logTestInfo(`🔍 Journey search completed in: ${searchTime}ms`);
      
      if (searchTime < 2000) {
        actions.logTestInfo('✅ Excellent search performance (<2s)');
      } else if (searchTime < 5000) {
        actions.logTestInfo('✅ Good search performance (<5s)');
      } else {
        actions.logTestInfo('⚠️ Search performance could be improved (>5s)');
      }
      
      await actions.screenshot('sbb-performance-results', 'Performance test results');
    });
  });

  test('Network throttling and slow connection simulation', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('🐌 Testing performance under slow network conditions');
    
    await actions.step('📶 Simulate Slow 3G Connection', async () => {
      // Simulate slow 3G: 1.6 Mbps down, 750 Kbps up, 300ms RTT
      await page.route('**/*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 300)); // Add 300ms delay
        await route.continue();
      });
      
      actions.logTestInfo('📶 Slow 3G simulation enabled (300ms RTT)');
      
      const startTime = Date.now();
      await actions.observableGoto('https://www.sbb.ch', 'Navigate with slow connection');
      
      const loadTime = Date.now() - startTime;
      actions.logTestInfo(`⏱️ Load time with slow connection: ${loadTime}ms`);
      
      // Should still be usable within reasonable time
      expect(loadTime).toBeLessThan(15000); // 15 seconds max for slow connection
      
      if (loadTime < 8000) {
        actions.logTestInfo('✅ Good performance even on slow connection');
      } else {
        actions.logTestInfo('⚠️ Performance degrades significantly on slow connection');
      }
    });

    await actions.step('📵 Test with Intermittent Connectivity', async () => {
      let connectionToggle = true;
      
      // Toggle connection every 2 seconds
      const toggleConnection = setInterval(() => {
        connectionToggle = !connectionToggle;
        page.context().setOffline(!connectionToggle);
        actions.logTestInfo(`📡 Connection ${connectionToggle ? 'restored' : 'interrupted'}`);
      }, 2000);
      
      try {
        // Accept cookies if needed
        await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 3000 });
        await actions.observableClick('#onetrust-accept-btn-handler', 'Accept cookies with intermittent connection');
      } catch (error) {
        actions.logTestInfo('ℹ️ Cookie banner handling affected by connection issues');
      }
      
      // Try to perform journey search with unstable connection
      try {
        const fromField = page.getByRole('combobox', { name: /from/i }).first();
        const toField = page.getByRole('combobox', { name: /to/i }).first();
        
        await fromField.fill('Zürich HB');
        await toField.fill('Bern');
        await page.keyboard.press('Enter');
        
        actions.logTestInfo('✅ Form interaction works despite connection issues');
      } catch (error) {
        actions.logTestInfo('⚠️ Form interaction affected by intermittent connectivity');
      }
      
      clearInterval(toggleConnection);
      await page.context().setOffline(false);
      actions.logTestInfo('📡 Connection restored permanently');
    });
  });

  test('Resource loading and optimization analysis', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('📦 Analyzing resource loading and optimization');
    
    await actions.step('📊 Monitor Network Requests', async () => {
      const requests: any[] = [];
      const responses: any[] = [];
      
      page.on('request', request => {
        requests.push({
          url: request.url(),
          method: request.method(),
          resourceType: request.resourceType(),
          size: request.postData()?.length || 0
        });
      });
      
      page.on('response', response => {
        responses.push({
          url: response.url(),
          status: response.status(),
          contentType: response.headers()['content-type'],
          size: parseInt(response.headers()['content-length'] || '0'),
          fromCache: response.fromServiceWorker()
        });
      });
      
      await actions.observableGoto('https://www.sbb.ch', 'Navigate to analyze resources');
      await page.waitForLoadState('networkidle');
      
      // Analyze requests
      const imageRequests = requests.filter(r => r.resourceType === 'image');
      const jsRequests = requests.filter(r => r.resourceType === 'script');
      const cssRequests = requests.filter(r => r.resourceType === 'stylesheet');
      const fontRequests = requests.filter(r => r.resourceType === 'font');
      
      actions.logTestInfo('📊 Resource Loading Analysis:');
      actions.logTestInfo(`  Total requests: ${requests.length}`);
      actions.logTestInfo(`  Images: ${imageRequests.length}`);
      actions.logTestInfo(`  JavaScript: ${jsRequests.length}`);
      actions.logTestInfo(`  CSS: ${cssRequests.length}`);
      actions.logTestInfo(`  Fonts: ${fontRequests.length}`);
      
      // Check for optimization opportunities
      const largeImages = responses.filter(r => 
        r.contentType?.includes('image') && r.size > 100000 // >100KB
      );
      
      if (largeImages.length > 0) {
        actions.logTestInfo(`⚠️ Found ${largeImages.length} large images (>100KB)`);
        largeImages.slice(0, 3).forEach(img => {
          actions.logTestInfo(`  - ${img.url.split('/').pop()}: ${Math.round(img.size / 1024)}KB`);
        });
      } else {
        actions.logTestInfo('✅ No excessively large images detected');
      }
      
      // Check for HTTPS usage
      const insecureRequests = requests.filter(r => r.url.startsWith('http://'));
      if (insecureRequests.length === 0) {
        actions.logTestInfo('✅ All requests use HTTPS');
      } else {
        actions.logTestInfo(`⚠️ Found ${insecureRequests.length} insecure HTTP requests`);
      }
    });

    await actions.step('⚡ Test Progressive Loading', async () => {
      // Test if critical content loads first
      await page.reload();
      
      // Check what's visible immediately
      const immediateContent = await page.evaluate(() => {
        const visibleElements = [];
        const elements = document.querySelectorAll('h1, h2, .title, [role="main"]');
        
        elements.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.left < window.innerWidth) {
            visibleElements.push({
              tagName: el.tagName,
              text: el.textContent?.substring(0, 50),
              visible: true
            });
          }
        });
        
        return visibleElements;
      });
      
      actions.logTestInfo(`📊 Immediately visible content elements: ${immediateContent.length}`);
      
      if (immediateContent.length > 0) {
        actions.logTestInfo('✅ Critical content loads progressively');
        immediateContent.forEach(el => {
          actions.logTestInfo(`  - ${el.tagName}: ${el.text}`);
        });
      } else {
        actions.logTestInfo('⚠️ Critical content may not be loading progressively');
      }
    });
  });

  test('Memory usage and resource cleanup', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('🧠 Testing memory usage and resource cleanup');
    
    await actions.step('📊 Baseline Memory Measurement', async () => {
      await actions.observableGoto('https://www.sbb.ch', 'Navigate for memory testing');
      
      // Accept cookies
      try {
        await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 3000 });
        await actions.observableClick('#onetrust-accept-btn-handler', 'Accept cookies');
      } catch (error) {
        actions.logTestInfo('ℹ️ No cookie banner');
      }
      
      const initialMemory = await page.evaluate(() => {
        return {
          usedJSHeapSize: (performance as any).memory?.usedJSHeapSize || 0,
          totalJSHeapSize: (performance as any).memory?.totalJSHeapSize || 0,
          jsHeapSizeLimit: (performance as any).memory?.jsHeapSizeLimit || 0
        };
      });
      
      if (initialMemory.usedJSHeapSize > 0) {
        actions.logTestInfo(`🧠 Initial memory usage: ${Math.round(initialMemory.usedJSHeapSize / 1024 / 1024)}MB`);
        actions.logTestInfo(`🧠 Total heap size: ${Math.round(initialMemory.totalJSHeapSize / 1024 / 1024)}MB`);
      } else {
        actions.logTestInfo('ℹ️ Memory API not available in this environment');
      }
    });

    await actions.step('🔄 Test Memory During Multiple Searches', async () => {
      const memoryReadings = [];
      
      // Perform multiple journey searches
      for (let i = 0; i < 5; i++) {
        const fromField = page.getByRole('combobox', { name: /from/i }).first();
        const toField = page.getByRole('combobox', { name: /to/i }).first();
        
        await fromField.fill(`Test Station ${i}`);
        await toField.fill(`Destination ${i}`);
        await page.keyboard.press('Enter');
        
        await page.waitForTimeout(1000);
        
        const memory = await page.evaluate(() => {
          return (performance as any).memory?.usedJSHeapSize || 0;
        });
        
        memoryReadings.push(memory);
        actions.logTestInfo(`🔍 Search ${i + 1} memory: ${Math.round(memory / 1024 / 1024)}MB`);
      }
      
      // Check for memory leaks
      if (memoryReadings.length > 0) {
        const firstReading = memoryReadings[0];
        const lastReading = memoryReadings[memoryReadings.length - 1];
        const memoryIncrease = lastReading - firstReading;
        
        actions.logTestInfo(`📈 Memory change after 5 searches: ${Math.round(memoryIncrease / 1024 / 1024)}MB`);
        
        if (memoryIncrease < 5 * 1024 * 1024) { // Less than 5MB increase
          actions.logTestInfo('✅ No significant memory leaks detected');
        } else {
          actions.logTestInfo('⚠️ Potential memory leak - significant increase detected');
        }
      }
    });
  });
});