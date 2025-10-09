import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

test.describe('SBB.ch Real-time Information Testing', () => {
  
  test('Test real-time departure boards and live updates', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('🚂 Testing real-time departure information');
    
    await actions.step('🎯 Navigate to Departure Board', async () => {
      await actions.observableGoto('https://www.sbb.ch', 'Navigate to SBB homepage');
      
      // Accept cookies
      try {
        await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 3000 });
        await page.click('#onetrust-accept-btn-handler');
        actions.logTestInfo('Accept cookies');
      } catch (error) {
        actions.logTestInfo('ℹ️ No cookie banner');
      }
      
      // Look for departure board link
      const departureBoardSelectors = [
        'a:has-text("Abfahrtstafel")',
        'a:has-text("Departure")',
        'a:has-text("Departures")',
        '[data-testid*="departure"]',
        'nav a[href*="departure"]',
        'nav a[href*="abfahrt"]'
      ];
      
      let departureBoardFound = false;
      for (const selector of departureBoardSelectors) {
        const depBoard = page.locator(selector).first();
        const isVisible = await depBoard.isVisible().catch(() => false);
        
        if (isVisible) {
          await depBoard.click();
          actions.logTestInfo('📋 Clicked on departure board');
          departureBoardFound = true;
          break;
        }
      }
      
      if (!departureBoardFound) {
        actions.logTestInfo('ℹ️ Departure board not found, testing with station search');
      }
    });

    await actions.step('🚉 Search for Major Station Departures', async () => {
      // Search for Zürich HB departures
      const stationInput = page.locator('input[placeholder*="station"], input[placeholder*="Station"], input[name*="station"]').first();
      const hasStationInput = await stationInput.isVisible().catch(() => false);
      
      if (hasStationInput) {
        await stationInput.fill('Zürich HB');
        actions.logTestInfo('🏢 Searching for Zürich HB departures');
        
        // Wait for autocomplete and select
        await page.waitForTimeout(1000);
        
        const suggestion = page.locator('text="Zürich HB"').first();
        const hasSuggestion = await suggestion.isVisible().catch(() => false);
        
        if (hasSuggestion) {
          await suggestion.click();
          actions.logTestInfo('✅ Selected Zürich HB');
        }
        
        // Look for search button
        const searchButton = page.locator('button:has-text("Search"), button:has-text("Suchen")').first();
        const hasSearchButton = await searchButton.isVisible().catch(() => false);
        
        if (hasSearchButton) {
          await searchButton.click();
        } else {
          await page.keyboard.press('Enter');
        }
        
        await page.waitForLoadState('networkidle');
      } else {
        actions.logTestInfo('ℹ️ Station input not found, using navigation');
      }
    });

    await actions.step('⏰ Analyze Real-time Departure Information', async () => {
      // Look for departure times and real-time indicators
      const departureInfo = await page.evaluate(() => {
        const results = {
          departureCount: 0,
          hasRealTimeIndicators: false,
          hasDelayInfo: false,
          hasPlatformInfo: false,
          departureData: []
        };
        
        // Look for departure rows/cards
        const departureSelectors = [
          '.departure',
          '[class*="connection"]',
          '[class*="train"]',
          'tr[data-testid*="departure"]',
          '.timetable-row'
        ];
        
        for (const selector of departureSelectors) {
          const departures = document.querySelectorAll(selector);
          if (departures.length > 0) {
            results.departureCount = departures.length;
            break;
          }
        }
        
        // Look for real-time indicators
        const realTimeIndicators = [
          '.delay',
          '.on-time',
          '[class*="realtime"]',
          '[class*="live"]',
          '.status-delay',
          '.status-ontime'
        ];
        
        results.hasRealTimeIndicators = realTimeIndicators.some(selector => 
          document.querySelector(selector) !== null
        );
        
        // Look for delay information
        const delayTexts = ['Verspätung', 'Delay', '+', 'min'];
        results.hasDelayInfo = delayTexts.some(text => 
          document.body.textContent?.includes(text)
        );
        
        // Look for platform information
        const platformTexts = ['Gleis', 'Platform', 'Pl.', 'Gl.'];
        results.hasPlatformInfo = platformTexts.some(text => 
          document.body.textContent?.includes(text)
        );
        
        return results;
      });
      
      actions.logTestInfo('⏰ Real-time departure analysis:');
      actions.logTestInfo(`  Found departures: ${departureInfo.departureCount}`);
      actions.logTestInfo(`  Real-time indicators: ${departureInfo.hasRealTimeIndicators ? '✅' : '❌'}`);
      actions.logTestInfo(`  Delay information: ${departureInfo.hasDelayInfo ? '✅' : '❌'}`);
      actions.logTestInfo(`  Platform information: ${departureInfo.hasPlatformInfo ? '✅' : '❌'}`);
      
      await actions.screenshot('departure-board', 'Real-time departure board');
    });

    await actions.step('📱 Test Live Updates Functionality', async () => {
      // Check if page updates automatically
      const initialContent = await page.textContent('body');
      
      actions.logTestInfo('⏳ Waiting 30 seconds to check for live updates...');
      await page.waitForTimeout(30000);
      
      const updatedContent = await page.textContent('body');
      const contentChanged = initialContent !== updatedContent;
      
      actions.logTestInfo(`📱 Live updates: ${contentChanged ? '✅ Content changed' : 'ℹ️ No visible changes'}`);
      
      // Look for refresh/update buttons
      const refreshSelectors = [
        'button[aria-label*="refresh"]',
        'button[aria-label*="update"]',
        'button[aria-label*="aktualisieren"]',
        '.refresh-button',
        '.update-button'
      ];
      
      for (const selector of refreshSelectors) {
        const refreshButton = page.locator(selector).first();
        const isVisible = await refreshButton.isVisible().catch(() => false);
        
        if (isVisible) {
          await refreshButton.click();
          actions.logTestInfo('🔄 Manually triggered refresh');
          await page.waitForTimeout(2000);
          break;
        }
      }
    });

    await actions.step('🚧 Check for Service Disruptions', async () => {
      // Look for service disruption indicators
      const disruptionInfo = await page.evaluate(() => {
        const disruptionKeywords = [
          'Störung',
          'Disruption',
          'Verspätung',
          'Delay',
          'Ausfall',
          'Cancelled',
          'Umleitung',
          'Diversion'
        ];
        
        const foundDisruptions: string[] = [];
        disruptionKeywords.forEach(keyword => {
          if (document.body.textContent?.includes(keyword)) {
            foundDisruptions.push(keyword);
          }
        });
        
        // Look for warning/alert elements
        const alertElements = document.querySelectorAll('.alert, .warning, [role="alert"], .disruption');
        
        return {
          foundKeywords: foundDisruptions,
          alertElements: alertElements.length
        };
      });
      
      actions.logTestInfo('🚧 Service disruption check:');
      if (disruptionInfo.foundKeywords.length > 0) {
        actions.logTestInfo(`  Found disruption keywords: ${disruptionInfo.foundKeywords.join(', ')}`);
      } else {
        actions.logTestInfo('  ✅ No disruption keywords found');
      }
      
      actions.logTestInfo(`  Alert elements: ${disruptionInfo.alertElements}`);
    });
  });
});