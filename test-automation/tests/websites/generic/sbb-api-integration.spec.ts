import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

test.describe('SBB.ch API Integration Testing', () => {
  
  test('Test API calls and data integration patterns', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('🔌 Testing API integration and data flow');
    
    // Enable network monitoring
    const networkRequests: any[] = [];
    const apiCalls: any[] = [];
    
    page.on('request', request => {
      networkRequests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        timestamp: Date.now()
      });
      
      // Filter for API calls
      if (request.url().includes('/api/') || 
          request.url().includes('api.') || 
          request.url().includes('.json') ||
          request.method() !== 'GET' ||
          request.url().includes('search') ||
          request.url().includes('timetable') ||
          request.url().includes('connection')) {
        apiCalls.push({
          url: request.url(),
          method: request.method(),
          timestamp: Date.now()
        });
      }
    });
    
    await actions.step('🏠 Navigate to SBB and Monitor Network', async () => {
      await actions.observableGoto('https://www.sbb.ch', 'Navigate to SBB homepage');
      
      // Accept cookies
      try {
        await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 3000 });
        await page.click('#onetrust-accept-btn-handler');
        actions.logTestInfo('Accept cookies');
      } catch (error) {
        actions.logTestInfo('ℹ️ No cookie banner');
      }
      
      // Wait for initial page load and network activity
      await page.waitForLoadState('networkidle');
      
      actions.logTestInfo(`📊 Initial network requests: ${networkRequests.length}`);
      actions.logTestInfo(`🔌 Potential API calls: ${apiCalls.length}`);
    });

    await actions.step('🔍 Analyze Initial API Requests', async () => {
      // Analyze the types of requests made on page load
      const requestAnalysis = networkRequests.reduce((acc: any, req) => {
        const url = new URL(req.url);
        const domain = url.hostname;
        const path = url.pathname;
        
        // Categorize requests
        if (path.includes('/api/') || domain.includes('api.')) {
          acc.apiRequests++;
        } else if (path.includes('.js')) {
          acc.jsRequests++;
        } else if (path.includes('.css')) {
          acc.cssRequests++;
        } else if (path.includes('.json')) {
          acc.jsonRequests++;
        } else if (path.includes('analytics') || path.includes('tracking')) {
          acc.analyticsRequests++;
        } else {
          acc.otherRequests++;
        }
        
        // Track domains
        if (!acc.domains.includes(domain)) {
          acc.domains.push(domain);
        }
        
        return acc;
      }, {
        apiRequests: 0,
        jsRequests: 0,
        cssRequests: 0,
        jsonRequests: 0,
        analyticsRequests: 0,
        otherRequests: 0,
        domains: []
      });
      
      actions.logTestInfo('🔍 Network request analysis:');
      actions.logTestInfo(`  API requests: ${requestAnalysis.apiRequests}`);
      actions.logTestInfo(`  JavaScript files: ${requestAnalysis.jsRequests}`);
      actions.logTestInfo(`  CSS files: ${requestAnalysis.cssRequests}`);
      actions.logTestInfo(`  JSON requests: ${requestAnalysis.jsonRequests}`);
      actions.logTestInfo(`  Analytics/tracking: ${requestAnalysis.analyticsRequests}`);
      actions.logTestInfo(`  Other requests: ${requestAnalysis.otherRequests}`);
      actions.logTestInfo(`  Unique domains: ${requestAnalysis.domains.length}`);
      
      if (requestAnalysis.domains.length > 0) {
        actions.logTestInfo(`  Top domains: ${requestAnalysis.domains.slice(0, 5).join(', ')}`);
      }
    });

    await actions.step('🚂 Trigger Journey Search and Monitor APIs', async () => {
      // Clear previous API calls to focus on search
      apiCalls.length = 0;
      
      // Perform a journey search to trigger API calls
      const fromInput = page.locator('input[placeholder*="Von"], input[placeholder*="From"], input[name*="from"]').first();
      const hasFromInput = await fromInput.isVisible().catch(() => false);
      
      if (hasFromInput) {
        await fromInput.fill('Zürich HB');
        actions.logTestInfo('🏁 Journey origin: Zürich HB');
        
        // Wait for autocomplete API calls
        await page.waitForTimeout(2000);
        
        const toInput = page.locator('input[placeholder*="Nach"], input[placeholder*="To"], input[name*="to"]').first();
        const hasToInput = await toInput.isVisible().catch(() => false);
        
        if (hasToInput) {
          await toInput.fill('Basel SBB');
          actions.logTestInfo('🎯 Journey destination: Basel SBB');
          
          // Wait for autocomplete API calls
          await page.waitForTimeout(2000);
          
          // Search for connections
          const searchButton = page.locator('button:has-text("Verbindungen suchen"), button:has-text("Search connections")').first();
          const hasSearchButton = await searchButton.isVisible().catch(() => false);
          
          if (hasSearchButton) {
            await searchButton.click();
            actions.logTestInfo('🔍 Executing journey search...');
            
            // Wait for search API calls to complete
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(3000);
          }
        }
      }
      
      actions.logTestInfo(`🔌 API calls during search: ${apiCalls.length}`);
    });

    await actions.step('📊 Analyze Search API Patterns', async () => {
      // Analyze the API calls made during search
      const searchAPIs = apiCalls.slice(-10); // Last 10 API calls
      
      const apiAnalysis = {
        autocompleteAPIs: 0,
        searchAPIs: 0,
        timetableAPIs: 0,
        locationAPIs: 0,
        uniqueEndpoints: [] as string[]
      };
      
      searchAPIs.forEach(api => {
        const url = api.url.toLowerCase();
        
        if (url.includes('autocomplete') || url.includes('suggest') || url.includes('location')) {
          apiAnalysis.autocompleteAPIs++;
        }
        if (url.includes('search') || url.includes('connection') || url.includes('journey')) {
          apiAnalysis.searchAPIs++;
        }
        if (url.includes('timetable') || url.includes('schedule')) {
          apiAnalysis.timetableAPIs++;
        }
        if (url.includes('location') || url.includes('station')) {
          apiAnalysis.locationAPIs++;
        }
        
        // Extract endpoint patterns
        try {
          const urlObj = new URL(api.url);
          const endpoint = urlObj.pathname;
          if (!apiAnalysis.uniqueEndpoints.includes(endpoint)) {
            apiAnalysis.uniqueEndpoints.push(endpoint);
          }
        } catch (error) {
          // Invalid URL, skip
        }
      });
      
      actions.logTestInfo('📊 Search API analysis:');
      actions.logTestInfo(`  Autocomplete APIs: ${apiAnalysis.autocompleteAPIs}`);
      actions.logTestInfo(`  Search APIs: ${apiAnalysis.searchAPIs}`);
      actions.logTestInfo(`  Timetable APIs: ${apiAnalysis.timetableAPIs}`);
      actions.logTestInfo(`  Location APIs: ${apiAnalysis.locationAPIs}`);
      
      if (apiAnalysis.uniqueEndpoints.length > 0) {
        actions.logTestInfo(`  Unique endpoints: ${apiAnalysis.uniqueEndpoints.slice(0, 3).join(', ')}`);
      }
      
      // Log some actual API URLs (first few)
      if (searchAPIs.length > 0) {
        actions.logTestInfo('🔗 Sample API calls:');
        searchAPIs.slice(0, 3).forEach((api, index) => {
          const shortUrl = api.url.length > 80 ? api.url.substring(0, 80) + '...' : api.url;
          actions.logTestInfo(`  ${index + 1}. ${api.method} ${shortUrl}`);
        });
      }
    });

    await actions.step('🔄 Test Real-time Data Updates', async () => {
      // Monitor for real-time updates and polling
      const beforeCount = networkRequests.length;
      
      actions.logTestInfo('⏳ Monitoring for real-time updates (30 seconds)...');
      
      // Wait and monitor for automatic updates
      await page.waitForTimeout(30000);
      
      const afterCount = networkRequests.length;
      const newRequests = afterCount - beforeCount;
      
      actions.logTestInfo(`🔄 Real-time monitoring results:`);
      actions.logTestInfo(`  New requests in 30s: ${newRequests}`);
      
      if (newRequests > 0) {
        // Analyze the new requests for polling patterns
        const recentRequests = networkRequests.slice(-newRequests);
        const pollingPatterns = recentRequests.filter(req => 
          req.url.includes('status') || 
          req.url.includes('live') || 
          req.url.includes('update') ||
          req.url.includes('realtime')
        );
        
        actions.logTestInfo(`  Potential polling requests: ${pollingPatterns.length}`);
        
        if (pollingPatterns.length > 0) {
          actions.logTestInfo('📡 Polling detected:');
          pollingPatterns.slice(0, 2).forEach((req, index) => {
            const shortUrl = req.url.length > 60 ? req.url.substring(0, 60) + '...' : req.url;
            actions.logTestInfo(`  ${index + 1}. ${shortUrl}`);
          });
        }
      } else {
        actions.logTestInfo('  No automatic polling detected');
      }
    });

    await actions.step('🔍 Inspect Client-Side Data Processing', async () => {
      // Analyze how data is processed on the client side
      const clientDataAnalysis = await page.evaluate(() => {
        const results = {
          hasLocalStorage: false,
          hasSessionStorage: false,
          hasIndexedDB: false,
          hasServiceWorker: false,
          localStorageKeys: [] as string[],
          sessionStorageKeys: [] as string[],
          globalVariables: [] as string[]
        };
        
        // Check browser storage
        try {
          results.hasLocalStorage = !!window.localStorage;
          results.localStorageKeys = Object.keys(localStorage).slice(0, 5);
        } catch (e) {
          results.hasLocalStorage = false;
        }
        
        try {
          results.hasSessionStorage = !!window.sessionStorage;
          results.sessionStorageKeys = Object.keys(sessionStorage).slice(0, 5);
        } catch (e) {
          results.hasSessionStorage = false;
        }
        
        // Check for IndexedDB
        results.hasIndexedDB = !!window.indexedDB;
        
        // Check for Service Worker
        results.hasServiceWorker = 'serviceWorker' in navigator;
        
        // Look for global SBB-related variables
        const globalKeys = Object.keys(window);
        const sbbKeys = globalKeys.filter(key => 
          key.toLowerCase().includes('sbb') || 
          key.toLowerCase().includes('timetable') ||
          key.toLowerCase().includes('connection') ||
          key.toLowerCase().includes('journey')
        );
        results.globalVariables = sbbKeys.slice(0, 5);
        
        return results;
      });
      
      actions.logTestInfo('🔍 Client-side data analysis:');
      actions.logTestInfo(`  Local storage: ${clientDataAnalysis.hasLocalStorage ? '✅' : '❌'}`);
      actions.logTestInfo(`  Session storage: ${clientDataAnalysis.hasSessionStorage ? '✅' : '❌'}`);
      actions.logTestInfo(`  IndexedDB: ${clientDataAnalysis.hasIndexedDB ? '✅' : '❌'}`);
      actions.logTestInfo(`  Service Worker: ${clientDataAnalysis.hasServiceWorker ? '✅' : '❌'}`);
      
      if (clientDataAnalysis.localStorageKeys.length > 0) {
        actions.logTestInfo(`  LocalStorage keys: ${clientDataAnalysis.localStorageKeys.join(', ')}`);
      }
      
      if (clientDataAnalysis.sessionStorageKeys.length > 0) {
        actions.logTestInfo(`  SessionStorage keys: ${clientDataAnalysis.sessionStorageKeys.join(', ')}`);
      }
      
      if (clientDataAnalysis.globalVariables.length > 0) {
        actions.logTestInfo(`  SBB global variables: ${clientDataAnalysis.globalVariables.join(', ')}`);
      }
    });

    await actions.step('🌐 Test Error Handling and Fallbacks', async () => {
      // Test error handling by temporarily blocking network
      actions.logTestInfo('🌐 Testing error handling...');
      
      // Try to trigger an error scenario
      await page.route('**/api/**', route => {
        // Block API calls to simulate network issues
        route.abort();
      });
      
      // Try to perform another search
      const newFromInput = page.locator('input[placeholder*="Von"], input[placeholder*="From"], input[name*="from"]').first();
      const hasNewFromInput = await newFromInput.isVisible().catch(() => false);
      
      if (hasNewFromInput) {
        await newFromInput.clear();
        await newFromInput.fill('Luzern');
        
        await page.waitForTimeout(2000);
        
        // Look for error messages or fallback behavior
        const errorAnalysis = await page.evaluate(() => {
          const results = {
            hasErrorMessages: false,
            hasLoadingStates: false,
            hasRetryButtons: false,
            errorTexts: [] as string[]
          };
          
          // Look for error indicators
          const errorKeywords = ['error', 'fehler', 'problem', 'not available', 'nicht verfügbar'];
          errorKeywords.forEach(keyword => {
            if (document.body.textContent?.toLowerCase().includes(keyword.toLowerCase())) {
              results.hasErrorMessages = true;
              results.errorTexts.push(keyword);
            }
          });
          
          // Look for loading states
          const loadingElements = document.querySelectorAll('.loading, .spinner, [class*="loading"], [class*="spinner"]');
          results.hasLoadingStates = loadingElements.length > 0;
          
          // Look for retry functionality
          const retryButtons = document.querySelectorAll('button');
          for (const button of retryButtons) {
            const text = button.textContent?.toLowerCase() || '';
            if (text.includes('retry') || text.includes('wiederholen') || text.includes('noch')) {
              results.hasRetryButtons = true;
              break;
            }
          }
          
          return results;
        });
        
        actions.logTestInfo('🌐 Error handling analysis:');
        actions.logTestInfo(`  Error messages: ${errorAnalysis.hasErrorMessages ? '✅' : '❌'}`);
        actions.logTestInfo(`  Loading states: ${errorAnalysis.hasLoadingStates ? '✅' : '❌'}`);
        actions.logTestInfo(`  Retry buttons: ${errorAnalysis.hasRetryButtons ? '✅' : '❌'}`);
        
        if (errorAnalysis.errorTexts.length > 0) {
          actions.logTestInfo(`  Error indicators: ${errorAnalysis.errorTexts.join(', ')}`);
        }
      }
      
      // Restore network access
      await page.unroute('**/api/**');
    });

    await actions.step('📈 Performance and Caching Analysis', async () => {
      // Analyze caching headers and performance patterns
      const performanceAnalysis = await page.evaluate(() => {
        const results = {
          hasCacheStorage: false,
          performanceEntries: 0,
          navigationTiming: {} as any,
          resourceTimings: [] as any[]
        };
        
        // Check for Cache API
        results.hasCacheStorage = 'caches' in window;
        
        // Get performance entries
        if ('performance' in window) {
          const entries = performance.getEntries();
          results.performanceEntries = entries.length;
          
          // Navigation timing
          const navigation = performance.getEntriesByType('navigation')[0] as any;
          if (navigation) {
            results.navigationTiming = {
              domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
              loadComplete: Math.round(navigation.loadEventEnd - navigation.loadEventStart)
            };
          }
          
          // Resource timings for API calls
          const resources = performance.getEntriesByType('resource');
          results.resourceTimings = resources
            .filter((resource: any) => resource.name.includes('api') || resource.name.includes('.json'))
            .slice(0, 3)
            .map((resource: any) => ({
              name: resource.name,
              duration: Math.round(resource.duration),
              transferSize: resource.transferSize || 0
            }));
        }
        
        return results;
      });
      
      actions.logTestInfo('📈 Performance analysis:');
      actions.logTestInfo(`  Cache Storage API: ${performanceAnalysis.hasCacheStorage ? '✅' : '❌'}`);
      actions.logTestInfo(`  Performance entries: ${performanceAnalysis.performanceEntries}`);
      
      if (performanceAnalysis.navigationTiming.domContentLoaded) {
        actions.logTestInfo(`  DOM content loaded: ${performanceAnalysis.navigationTiming.domContentLoaded}ms`);
      }
      
      if (performanceAnalysis.resourceTimings.length > 0) {
        actions.logTestInfo('📊 API performance:');
        performanceAnalysis.resourceTimings.forEach((timing, index) => {
          const shortName = timing.name.length > 50 ? '...' + timing.name.slice(-47) : timing.name;
          actions.logTestInfo(`  ${index + 1}. ${shortName} (${timing.duration}ms, ${timing.transferSize}b)`);
        });
      }
      
      await actions.screenshot('api-integration', 'API integration testing results');
    });

    await actions.step('📋 API Integration Summary', async () => {
      const totalRequests = networkRequests.length;
      const totalApiCalls = apiCalls.length;
      
      actions.logTestInfo('📋 API Integration Test Summary:');
      actions.logTestInfo(`  🔌 Total network requests monitored: ${totalRequests}`);
      actions.logTestInfo(`  📊 API calls identified: ${totalApiCalls}`);
      actions.logTestInfo('  🚂 Journey search API flow analysis');
      actions.logTestInfo('  🔄 Real-time data update monitoring');
      actions.logTestInfo('  🔍 Client-side data processing inspection');
      actions.logTestInfo('  🌐 Error handling and network resilience testing');
      actions.logTestInfo('  📈 Performance and caching analysis');
      
      // Summary statistics
      const requestTypes = networkRequests.reduce((acc: any, req) => {
        acc[req.method] = (acc[req.method] || 0) + 1;
        return acc;
      }, {});
      
      actions.logTestInfo('📊 Request method distribution:');
      Object.entries(requestTypes).forEach(([method, count]) => {
        actions.logTestInfo(`  ${method}: ${count}`);
      });
    });
  });
});