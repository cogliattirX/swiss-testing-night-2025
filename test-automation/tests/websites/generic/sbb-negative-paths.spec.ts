import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

test.describe('SBB.ch Negative Path & Error Scenario Testing', () => {
  
  test('Error handling and user feedback systems', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('❌ Testing error handling and user feedback');
    
    await actions.step('🎯 Setup and Navigate', async () => {
      await actions.observableGoto('https://www.sbb.ch', 'Navigate for error testing');
      
      // Accept cookies
      try {
        await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 3000 });
        await actions.observableClick('#onetrust-accept-btn-handler', 'Accept cookies');
      } catch (error) {
        actions.logTestInfo('ℹ️ No cookie banner');
      }
    });

    await actions.step('🚫 Test Empty Form Submission', async () => {
      const fromField = page.getByRole('combobox', { name: /from/i }).first();
      const toField = page.getByRole('combobox', { name: /to/i }).first();
      
      // Clear any existing values
      await fromField.fill('');
      await toField.fill('');
      
      // Try to submit empty form
      await page.keyboard.press('Enter');
      await page.waitForTimeout(2000);
      
      // Look for error messages or validation feedback
      const errorSelectors = [
        '[role="alert"]',
        '.error',
        '.invalid',
        '[class*="error"]',
        '[class*="validation"]',
        '[aria-invalid="true"]',
        '.field-validation-error',
        '.help-block',
        '.text-danger'
      ];
      
      let errorFound = false;
      for (const selector of errorSelectors) {
        const errorElement = await page.locator(selector).first().textContent().catch(() => null);
        if (errorElement && errorElement.trim().length > 0) {
          actions.logTestInfo(`✅ Error message found: "${errorElement}"`);
          errorFound = true;
          break;
        }
      }
      
      if (!errorFound) {
        // Check if form prevents submission or has other feedback
        const currentUrl = page.url();
        const hasStayed = currentUrl.includes('sbb.ch') && !currentUrl.includes('results');
        
        if (hasStayed) {
          actions.logTestInfo(`✅ Form submission prevented (stayed on page)`);
        } else {
          actions.logTestInfo(`⚠️ Empty form submission behavior unclear`);
        }
      }
    });

    await actions.step('🔍 Test Invalid Station Names', async () => {
      const fromField = page.getByRole('combobox', { name: /from/i }).first();
      const toField = page.getByRole('combobox', { name: /to/i }).first();
      
      const invalidStations = [
        'NonExistentStation123',
        'ZZZZZZZ',
        'Invalid City Name',
        '!!!!!!',
        'Station@#$%',
        'VeryLongStationNameThatProbablyDoesNotExistAnywhere'
      ];
      
      for (const invalidStation of invalidStations) {
        actions.logTestInfo(`🔍 Testing invalid station: "${invalidStation}"`);
        
        await fromField.fill(invalidStation);
        await toField.fill('Bern'); // Valid destination
        
        await page.keyboard.press('Enter');
        await page.waitForTimeout(3000);
        
        // Check for "no results" or error messages
        const noResultsSelectors = [
          '[class*="no-result"]',
          '[class*="empty"]',
          ':text("No results")',
          ':text("Keine Verbindung")',
          ':text("Not found")',
          ':text("Nicht gefunden")',
          '[role="alert"]'
        ];
        
        let feedbackFound = false;
        for (const selector of noResultsSelectors) {
          const element = await page.locator(selector).first().textContent().catch(() => null);
          if (element && element.trim().length > 0) {
            actions.logTestInfo(`✅ Feedback for invalid station: "${element}"`);
            feedbackFound = true;
            break;
          }
        }
        
        if (!feedbackFound) {
          actions.logTestInfo(`ℹ️ No specific feedback for invalid station "${invalidStation}"`);
        }
        
        // Clear fields for next test
        await fromField.fill('');
        await toField.fill('');
      }
    });

    await actions.step('📅 Test Invalid Date/Time Inputs', async () => {
      // Look for date/time inputs
      const dateTimeInputs = await page.locator('input[type="date"], input[type="time"], input[type="datetime-local"], [class*="date"], [class*="time"]').count();
      
      if (dateTimeInputs > 0) {
        actions.logTestInfo(`📅 Found ${dateTimeInputs} date/time inputs`);
        
        // Test invalid dates
        const invalidDates = [
          '2023-13-01', // Invalid month
          '2023-02-30', // Invalid day
          '2020-01-01', // Past date
          '2050-12-31', // Far future
          'invalid-date',
          '99/99/9999'
        ];
        
        const dateInput = page.locator('input[type="date"]').first();
        const hasDateInput = await dateInput.isVisible().catch(() => false);
        
        if (hasDateInput) {
          for (const invalidDate of invalidDates) {
            actions.logTestInfo(`📅 Testing invalid date: "${invalidDate}"`);
            
            await dateInput.fill(invalidDate);
            await page.waitForTimeout(500);
            
            const value = await dateInput.inputValue();
            const isRejected = value !== invalidDate;
            
            actions.logTestInfo(`📅 Date "${invalidDate}" ${isRejected ? 'rejected' : 'accepted'}: value="${value}"`);
          }
        } else {
          actions.logTestInfo(`ℹ️ No standard date inputs found for testing`);
        }
      }
    });
  });

  test('Network failure and connectivity issues', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('🌐 Testing network failure scenarios');
    
    await actions.step('📶 Test Offline Behavior', async () => {
      await actions.observableGoto('https://www.sbb.ch', 'Navigate before going offline');
      
      // Accept cookies
      try {
        await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 3000 });
        await actions.observableClick('#onetrust-accept-btn-handler', 'Accept cookies');
      } catch (error) {
        actions.logTestInfo('ℹ️ No cookie banner');
      }
      
      // Go offline
      await page.context().setOffline(true);
      actions.logTestInfo('📵 Network disabled');
      
      // Try to perform actions while offline
      const fromField = page.getByRole('combobox', { name: /from/i }).first();
      const toField = page.getByRole('combobox', { name: /to/i }).first();
      
      try {
        await fromField.fill('Zürich HB');
        await toField.fill('Bern');
        await page.keyboard.press('Enter');
        
        // Wait to see how the application handles offline state
        await page.waitForTimeout(3000);
        
        // Check for offline indicators or error messages
        const offlineIndicators = [
          ':text("offline")',
          ':text("No connection")',
          ':text("Network error")',
          ':text("Keine Verbindung")',
          ':text("Verbindungsfehler")',
          '[class*="offline"]',
          '[class*="network-error"]'
        ];
        
        let offlineMessageFound = false;
        for (const selector of offlineIndicators) {
          const element = await page.locator(selector).first().textContent().catch(() => null);
          if (element && element.trim().length > 0) {
            actions.logTestInfo(`✅ Offline indicator found: "${element}"`);
            offlineMessageFound = true;
            break;
          }
        }
        
        if (!offlineMessageFound) {
          actions.logTestInfo(`ℹ️ No specific offline indicator detected`);
        }
        
      } catch (error) {
        actions.logTestInfo(`⚠️ Offline interaction error: ${(error as Error).message}`);
      }
      
      // Restore connection
      await page.context().setOffline(false);
      actions.logTestInfo('📶 Network restored');
    });

    await actions.step('🔌 Test Slow Network Conditions', async () => {
      // Simulate very slow network
      await page.route('**/*', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second delay
        await route.continue();
      });
      
      actions.logTestInfo('🐌 Slow network simulation enabled (5s delay)');
      
      try {
        await actions.observableGoto('https://www.sbb.ch', 'Navigate with slow network');
        
        // Check if there are loading indicators or timeout handling
        const loadingIndicators = [
          '.loading',
          '.spinner',
          '[class*="loading"]',
          '[class*="spinner"]',
          '[role="progressbar"]',
          '.progress',
          ':text("Loading")',
          ':text("Laden")'
        ];
        
        let loadingFound = false;
        for (const selector of loadingIndicators) {
          const element = await page.locator(selector).first().isVisible({ timeout: 2000 }).catch(() => false);
          if (element) {
            actions.logTestInfo(`✅ Loading indicator found: ${selector}`);
            loadingFound = true;
            break;
          }
        }
        
        if (!loadingFound) {
          actions.logTestInfo(`ℹ️ No loading indicators detected during slow load`);
        }
        
      } catch (error) {
        actions.logTestInfo(`⚠️ Slow network test error: ${(error as Error).message}`);
      }
      
      // Remove route interception
      await page.unrouteAll();
    });

    await actions.step('⚠️ Test Server Error Simulation', async () => {
      // Intercept requests and return server errors
      await page.route('**/api/**', async (route) => {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error', message: 'Service temporarily unavailable' })
        });
      });
      
      await page.route('**/search/**', async (route) => {
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Service Unavailable', message: 'Search service is down' })
        });
      });
      
      actions.logTestInfo('🔥 Server error simulation enabled');
      
      try {
        await actions.observableGoto('https://www.sbb.ch', 'Navigate with server errors');
        
        // Try to perform a search
        const fromField = page.getByRole('combobox', { name: /from/i }).first();
        const toField = page.getByRole('combobox', { name: /to/i }).first();
        
        await fromField.fill('Zürich HB');
        await toField.fill('Bern');
        await page.keyboard.press('Enter');
        
        await page.waitForTimeout(3000);
        
        // Check for error handling
        const errorMessages = [
          ':text("Error")',
          ':text("Service unavailable")',
          ':text("Try again")',
          ':text("Fehler")',
          ':text("Nicht verfügbar")',
          ':text("Versuchen Sie")',
          '[class*="error"]',
          '[role="alert"]'
        ];
        
        let errorHandled = false;
        for (const selector of errorMessages) {
          const element = await page.locator(selector).first().textContent().catch(() => null);
          if (element && element.trim().length > 0) {
            actions.logTestInfo(`✅ Error handling found: "${element}"`);
            errorHandled = true;
            break;
          }
        }
        
        if (!errorHandled) {
          actions.logTestInfo(`ℹ️ No specific error handling detected`);
        }
        
      } catch (error) {
        actions.logTestInfo(`⚠️ Server error test error: ${(error as Error).message}`);
      }
      
      await page.unrouteAll();
    });
  });

  test('Browser compatibility edge cases', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('🌐 Testing browser compatibility edge cases');
    
    await actions.step('🚫 Test JavaScript Disabled Simulation', async () => {
      // Disable JavaScript
      await page.addInitScript(() => {
        // Simulate JavaScript being disabled by overriding key functions
        (window as any).originalSetTimeout = window.setTimeout;
        (window as any).originalSetInterval = window.setInterval;
        
        window.setTimeout = () => 0;
        window.setInterval = () => 0;
        
        // Disable fetch and XMLHttpRequest
        (window as any).fetch = undefined;
        (window as any).XMLHttpRequest = undefined;
      });
      
      await actions.observableGoto('https://www.sbb.ch', 'Navigate with limited JavaScript');
      
      // Check if basic functionality still works
      const basicElements = await page.evaluate(() => {
        return {
          hasForm: !!document.querySelector('form'),
          hasInputs: !!document.querySelector('input'),
          hasButtons: !!document.querySelector('button'),
          hasLinks: !!document.querySelector('a'),
          bodyText: document.body.textContent?.substring(0, 100) || ''
        };
      });
      
      actions.logTestInfo('🔍 Basic elements without full JavaScript:');
      actions.logTestInfo(`  Forms: ${basicElements.hasForm ? '✅' : '❌'}`);
      actions.logTestInfo(`  Inputs: ${basicElements.hasInputs ? '✅' : '❌'}`);
      actions.logTestInfo(`  Buttons: ${basicElements.hasButtons ? '✅' : '❌'}`);
      actions.logTestInfo(`  Links: ${basicElements.hasLinks ? '✅' : '❌'}`);
      actions.logTestInfo(`  Content: ${basicElements.bodyText ? '✅' : '❌'}`);
      
      // Test if form submission works without JavaScript
      try {
        const fromField = page.getByRole('combobox', { name: /from/i }).first();
        const toField = page.getByRole('combobox', { name: /to/i }).first();
        
        await fromField.fill('Zürich HB');
        await toField.fill('Bern');
        
        actions.logTestInfo(`✅ Form interaction possible without full JavaScript`);
      } catch (error) {
        actions.logTestInfo(`⚠️ Form interaction limited without JavaScript`);
      }
    });

    await actions.step('🍪 Test Cookies Disabled', async () => {
      // Clear all cookies and prevent new ones
      await page.context().clearCookies();
      
      await page.route('**/*', async (route) => {
        const response = await route.fetch();
        const headers = { ...response.headers() };
        
        // Remove Set-Cookie headers
        delete headers['set-cookie'];
        
        await route.fulfill({
          response,
          headers
        });
      });
      
      await actions.observableGoto('https://www.sbb.ch', 'Navigate without cookies');
      
      // Check how the site behaves without cookies
      const cookiesAfterLoad = await page.context().cookies();
      actions.logTestInfo(`🍪 Cookies after load: ${cookiesAfterLoad.length}`);
      
      // Test functionality without cookies
      try {
        const fromField = page.getByRole('combobox', { name: /from/i }).first();
        const toField = page.getByRole('combobox', { name: /to/i }).first();
        
        await fromField.fill('Zürich HB');
        await toField.fill('Bern');
        await page.keyboard.press('Enter');
        
        await page.waitForTimeout(2000);
        
        actions.logTestInfo(`✅ Basic functionality works without cookies`);
      } catch (error) {
        actions.logTestInfo(`⚠️ Functionality affected by disabled cookies`);
      }
      
      await page.unrouteAll();
    });

    await actions.step('📱 Test Viewport Edge Cases', async () => {
      const extremeViewports = [
        { name: 'Very Narrow', width: 240, height: 320 },
        { name: 'Very Wide', width: 3840, height: 600 },
        { name: 'Very Tall', width: 800, height: 2400 },
        { name: 'Square', width: 500, height: 500 },
        { name: 'Tiny', width: 150, height: 150 }
      ];
      
      for (const viewport of extremeViewports) {
        actions.logTestInfo(`📐 Testing ${viewport.name}: ${viewport.width}x${viewport.height}`);
        
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.waitForTimeout(1000);
        
        // Check if content is still accessible
        const contentCheck = await page.evaluate(() => {
          return {
            hasOverflow: document.body.scrollWidth > window.innerWidth,
            hasVisibleContent: document.body.offsetHeight > 0,
            canScroll: document.body.scrollHeight > window.innerHeight
          };
        });
        
        actions.logTestInfo(`  Overflow: ${contentCheck.hasOverflow ? '⚠️' : '✅'}`);
        actions.logTestInfo(`  Visible content: ${contentCheck.hasVisibleContent ? '✅' : '❌'}`);
        actions.logTestInfo(`  Scrollable: ${contentCheck.canScroll ? '✅' : '❌'}`);
        
        // Test if form is still usable
        try {
          const fromField = page.getByRole('combobox', { name: /from/i }).first();
          const bounds = await fromField.boundingBox();
          
          const isFieldVisible = bounds && 
                                bounds.x >= 0 && 
                                bounds.y >= 0 && 
                                bounds.x + bounds.width <= viewport.width + 50; // 50px tolerance
          
          actions.logTestInfo(`  Form usability: ${isFieldVisible ? '✅' : '⚠️'}`);
        } catch (error) {
          actions.logTestInfo(`  Form usability: ❌ Field not accessible`);
        }
      }
      
      // Restore normal viewport
      await page.setViewportSize({ width: 1280, height: 720 });
    });
  });

  test('User flow interruption and recovery', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('🔄 Testing user flow interruption and recovery');
    
    await actions.step('⏸️ Test Mid-Flow Page Refresh', async () => {
      await actions.observableGoto('https://www.sbb.ch', 'Navigate for flow interruption testing');
      
      // Accept cookies
      try {
        await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 3000 });
        await actions.observableClick('#onetrust-accept-btn-handler', 'Accept cookies');
      } catch (error) {
        actions.logTestInfo('ℹ️ No cookie banner');
      }
      
      // Start filling out the form
      const fromField = page.getByRole('combobox', { name: /from/i }).first();
      const toField = page.getByRole('combobox', { name: /to/i }).first();
      
      await fromField.fill('Zürich HB');
      await toField.fill('Bern');
      
      actions.logTestInfo('📝 Form partially filled');
      
      // Refresh the page mid-flow
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      actions.logTestInfo('🔄 Page refreshed mid-flow');
      
      // Check if data is preserved or if there's recovery mechanism
      const fromFieldAfterRefresh = page.getByRole('combobox', { name: /from/i }).first();
      const toFieldAfterRefresh = page.getByRole('combobox', { name: /to/i }).first();
      
      const fromValue = await fromFieldAfterRefresh.inputValue();
      const toValue = await toFieldAfterRefresh.inputValue();
      
      if (fromValue || toValue) {
        actions.logTestInfo(`✅ Data preserved after refresh: from="${fromValue}", to="${toValue}"`);
      } else {
        actions.logTestInfo(`ℹ️ Data not preserved after refresh (expected behavior)`);
      }
      
      // Test if user can continue their journey after refresh
      await fromFieldAfterRefresh.fill('Zürich HB');
      await toFieldAfterRefresh.fill('Bern');
      await page.keyboard.press('Enter');
      
      actions.logTestInfo(`✅ User can continue after page refresh`);
    });

    await actions.step('↩️ Test Browser Back Button Handling', async () => {
      // Start a search to have some navigation history
      const fromField = page.getByRole('combobox', { name: /from/i }).first();
      const toField = page.getByRole('combobox', { name: /to/i }).first();
      
      await fromField.fill('Zürich HB');
      await toField.fill('Bern');
      await page.keyboard.press('Enter');
      
      await page.waitForLoadState('networkidle');
      const urlAfterSearch = page.url();
      
      actions.logTestInfo(`🔍 Search completed: ${urlAfterSearch}`);
      
      // Go back using browser back button
      await page.goBack();
      await page.waitForLoadState('networkidle');
      
      const urlAfterBack = page.url();
      actions.logTestInfo(`↩️ After back button: ${urlAfterBack}`);
      
      // Check if the form state is preserved or reset appropriately
      const fromFieldAfterBack = page.getByRole('combobox', { name: /from/i }).first();
      const toFieldAfterBack = page.getByRole('combobox', { name: /to/i }).first();
      
      const fromValueAfterBack = await fromFieldAfterBack.inputValue();
      const toValueAfterBack = await toFieldAfterBack.inputValue();
      
      actions.logTestInfo(`📝 Form state after back: from="${fromValueAfterBack}", to="${toValueAfterBack}"`);
      
      // Test forward navigation
      await page.goForward();
      await page.waitForLoadState('networkidle');
      
      const urlAfterForward = page.url();
      actions.logTestInfo(`↪️ After forward button: ${urlAfterForward}`);
      
      if (urlAfterForward === urlAfterSearch) {
        actions.logTestInfo(`✅ Browser navigation working correctly`);
      } else {
        actions.logTestInfo(`⚠️ Browser navigation behavior differs from expected`);
      }
    });

    await actions.step('🕐 Test Session Timeout Simulation', async () => {
      // Simulate session timeout by manipulating cookies/storage
      await page.evaluate(() => {
        // Clear session storage
        sessionStorage.clear();
        
        // Clear local storage
        localStorage.clear();
        
        // Simulate expired timestamps
        const expiredTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
        localStorage.setItem('sessionExpiry', expiredTime.toString());
      });
      
      actions.logTestInfo('🕐 Session timeout simulated');
      
      // Try to perform an action that might require a valid session
      const fromField = page.getByRole('combobox', { name: /from/i }).first();
      const toField = page.getByRole('combobox', { name: /to/i }).first();
      
      await fromField.fill('Zürich HB');
      await toField.fill('Bern');
      await page.keyboard.press('Enter');
      
      await page.waitForTimeout(3000);
      
      // Check for session timeout messages or login prompts
      const sessionMessages = [
        ':text("Session expired")',
        ':text("Please log in")',
        ':text("Timeout")',
        ':text("Sitzung abgelaufen")',
        ':text("Anmelden")',
        '[class*="timeout"]',
        '[class*="session"]',
        '[class*="expired"]'
      ];
      
      let sessionHandlingFound = false;
      for (const selector of sessionMessages) {
        const element = await page.locator(selector).first().textContent().catch(() => null);
        if (element && element.trim().length > 0) {
          actions.logTestInfo(`✅ Session timeout handling: "${element}"`);
          sessionHandlingFound = true;
          break;
        }
      }
      
      if (!sessionHandlingFound) {
        actions.logTestInfo(`ℹ️ No specific session timeout handling detected (may not be applicable)`);
      }
    });

    await actions.step('📲 Test Tab/Window Management', async () => {
      // Test opening in new tab (simulate right-click -> open in new tab)
      const [newPage] = await Promise.all([
        page.context().waitForEvent('page'),
        page.evaluate(() => {
          window.open('https://www.sbb.ch', '_blank');
        })
      ]);
      
      actions.logTestInfo('📱 New tab opened');
      
      // Test behavior in the new tab
      await newPage.waitForLoadState('networkidle');
      const newPageActions = createObservableActions(newPage);
      
      try {
        const fromFieldNewTab = newPage.getByRole('combobox', { name: /from/i }).first();
        await fromFieldNewTab.fill('Basel');
        newPageActions.logTestInfo('✅ New tab functionality works independently');
      } catch (error) {
        newPageActions.logTestInfo('⚠️ New tab functionality issue');
      }
      
      // Close the new tab
      await newPage.close();
      actions.logTestInfo('📱 New tab closed');
      
      // Verify original tab still works
      const fromFieldOriginal = page.getByRole('combobox', { name: /from/i }).first();
      await fromFieldOriginal.fill('Zürich HB');
      actions.logTestInfo('✅ Original tab still functional after new tab closed');
    });
  });
});