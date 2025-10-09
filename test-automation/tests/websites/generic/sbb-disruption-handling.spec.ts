import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

test.describe('SBB.ch Disruption Management Testing', () => {
  
  test('Test disruption information and alternative route handling', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('🚧 Testing disruption management and alternative routes');
    
    await actions.step('🏠 Navigate to SBB Homepage', async () => {
      await actions.observableGoto('https://www.sbb.ch', 'Navigate to SBB homepage');
      
      // Accept cookies
      try {
        await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 3000 });
        await page.click('#onetrust-accept-btn-handler');
        actions.logTestInfo('Accept cookies');
      } catch (error) {
        actions.logTestInfo('ℹ️ No cookie banner');
      }
    });

    await actions.step('🚨 Look for Disruption Information', async () => {
      // Check homepage for disruption banners and notices
      const disruptionBanners = await page.evaluate(() => {
        const results = {
          hasDisruptionBanner: false,
          disruptionKeywords: [] as string[],
          alertElements: 0,
          warningElements: 0,
          bannerTexts: [] as string[]
        };
        
        // Look for alert/warning elements
        const alertSelectors = [
          '.alert', '.warning', '.disruption', '.notice',
          '[role="alert"]', '[class*="alert"]', '[class*="warning"]',
          '[class*="disruption"]', '[class*="notice"]'
        ];
        
        alertSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            results.alertElements += elements.length;
            results.hasDisruptionBanner = true;
            
            elements.forEach((element, index) => {
              if (index < 3) { // First 3 elements
                const text = element.textContent?.trim();
                if (text && text.length > 10 && text.length < 200) {
                  results.bannerTexts.push(text);
                }
              }
            });
          }
        });
        
        // Look for disruption-related keywords
        const disruptionKeywords = [
          'Störung', 'Disruption', 'Verspätung', 'Delay', 'Ausfall', 'Cancelled',
          'Umleitung', 'Diversion', 'Ersatzverkehr', 'Replacement service',
          'Baustelle', 'Construction', 'gesperrt', 'closed', 'Unterbruch', 'Interruption'
        ];
        
        disruptionKeywords.forEach(keyword => {
          if (document.body.textContent?.includes(keyword)) {
            results.disruptionKeywords.push(keyword);
          }
        });
        
        return results;
      });
      
      actions.logTestInfo('🚨 Disruption banner analysis:');
      actions.logTestInfo(`  Has disruption banner: ${disruptionBanners.hasDisruptionBanner ? '✅' : '❌'}`);
      actions.logTestInfo(`  Alert elements: ${disruptionBanners.alertElements}`);
      
      if (disruptionBanners.disruptionKeywords.length > 0) {
        actions.logTestInfo(`  Disruption keywords: ${disruptionBanners.disruptionKeywords.slice(0, 5).join(', ')}`);
      }
      
      if (disruptionBanners.bannerTexts.length > 0) {
        actions.logTestInfo('📢 Found disruption messages:');
        disruptionBanners.bannerTexts.forEach((text, index) => {
          actions.logTestInfo(`  ${index + 1}. ${text}`);
        });
      }
      
      await actions.screenshot('disruption-homepage', 'Homepage disruption information');
    });

    await actions.step('🔍 Look for Disruption Information Section', async () => {
      // Look for dedicated disruption/traffic info section
      const disruptionSectionSelectors = [
        'a:has-text("Störungen")',
        'a:has-text("Disruptions")',
        'a:has-text("Verkehrslage")',
        'a:has-text("Traffic")',
        'a:has-text("Betriebslage")',
        'a:has-text("Service status")',
        '[href*="disruption"]',
        '[href*="störung"]',
        '[href*="traffic"]',
        '.disruption-link',
        '.traffic-info'
      ];
      
      let disruptionSectionFound = false;
      
      for (const selector of disruptionSectionSelectors) {
        const disruptionLink = page.locator(selector).first();
        const isVisible = await disruptionLink.isVisible().catch(() => false);
        
        if (isVisible) {
          const linkText = await disruptionLink.textContent();
          actions.logTestInfo(`🚨 Found disruption section: "${linkText}"`);
          await disruptionLink.click();
          disruptionSectionFound = true;
          await page.waitForLoadState('networkidle');
          break;
        }
      }
      
      if (!disruptionSectionFound) {
        actions.logTestInfo('ℹ️ Dedicated disruption section not found, checking in journey planning');
      }
    });

    await actions.step('🚂 Plan Journey to Test Disruption Detection', async () => {
      // Plan a journey to see if any disruptions are shown
      const fromInput = page.locator('input[placeholder*="Von"], input[placeholder*="From"], input[name*="from"]').first();
      const hasFromInput = await fromInput.isVisible().catch(() => false);
      
      if (hasFromInput) {
        await fromInput.fill('Basel');
        actions.logTestInfo('🏁 Testing route: Basel');
        
        await page.waitForTimeout(1000);
        
        const toInput = page.locator('input[placeholder*="Nach"], input[placeholder*="To"], input[name*="to"]').first();
        const hasToInput = await toInput.isVisible().catch(() => false);
        
        if (hasToInput) {
          await toInput.fill('Genève');
          actions.logTestInfo('🎯 Testing route: → Genève');
          
          await page.waitForTimeout(1000);
          
          // Search for connections
          const searchButton = page.locator('button:has-text("Verbindungen suchen"), button:has-text("Search connections")').first();
          const hasSearchButton = await searchButton.isVisible().catch(() => false);
          
          if (hasSearchButton) {
            await searchButton.click();
            actions.logTestInfo('🔍 Searching connections for disruption testing...');
            await page.waitForLoadState('networkidle');
          }
        }
      }
    });

    await actions.step('⚠️ Analyze Connection Results for Disruptions', async () => {
      // Check connection results for disruption indicators
      const connectionDisruptions = await page.evaluate(() => {
        const results = {
          delayIndicators: [] as string[],
          cancellationIndicators: [] as string[],
          alternativeRoutes: false,
          replacementServices: false,
          disruptionWarnings: [] as string[],
          affectedLines: [] as string[]
        };
        
        // Look for delay indicators
        const delayPattern = /\+\s*\d+\s*min|\d+\s*min\s*Verspätung|delayed\s*\d+/gi;
        const delayMatches = document.body.textContent?.match(delayPattern);
        if (delayMatches) {
          results.delayIndicators = [...new Set(delayMatches)].slice(0, 5);
        }
        
        // Look for cancellation indicators
        const cancellationKeywords = ['ausfall', 'cancelled', 'gestrichen', 'entfällt'];
        cancellationKeywords.forEach(keyword => {
          if (document.body.textContent?.toLowerCase().includes(keyword.toLowerCase())) {
            results.cancellationIndicators.push(keyword);
          }
        });
        
        // Look for alternative routes
        const alternativeKeywords = ['alternativ', 'alternative', 'umweg', 'detour', 'andere Route'];
        results.alternativeRoutes = alternativeKeywords.some(keyword => 
          document.body.textContent?.toLowerCase().includes(keyword.toLowerCase())
        );
        
        // Look for replacement services
        const replacementKeywords = ['ersatzverkehr', 'replacement', 'ersatzbus', 'bus service'];
        results.replacementServices = replacementKeywords.some(keyword => 
          document.body.textContent?.toLowerCase().includes(keyword.toLowerCase())
        );
        
        // Extract disruption warnings from visible elements
        const warningElements = document.querySelectorAll('.warning, .alert, .disruption, [class*="warning"], [class*="alert"]');
        warningElements.forEach((element, index) => {
          if (index < 3) { // First 3 warnings
            const text = element.textContent?.trim();
            if (text && text.length > 15 && text.length < 150) {
              results.disruptionWarnings.push(text);
            }
          }
        });
        
        // Look for affected line information
        const linePattern = /(IC\s*\d+|IR\s*\d+|RE\s*\d+|S\s*\d+)/gi;
        const lineMatches = document.body.textContent?.match(linePattern);
        if (lineMatches) {
          results.affectedLines = [...new Set(lineMatches)].slice(0, 5);
        }
        
        return results;
      });
      
      actions.logTestInfo('⚠️ Disruption analysis in connections:');
      if (connectionDisruptions.delayIndicators.length > 0) {
        actions.logTestInfo(`  Delays found: ${connectionDisruptions.delayIndicators.join(', ')}`);
      }
      if (connectionDisruptions.cancellationIndicators.length > 0) {
        actions.logTestInfo(`  Cancellations: ${connectionDisruptions.cancellationIndicators.join(', ')}`);
      }
      actions.logTestInfo(`  Alternative routes: ${connectionDisruptions.alternativeRoutes ? '✅' : '❌'}`);
      actions.logTestInfo(`  Replacement services: ${connectionDisruptions.replacementServices ? '✅' : '❌'}`);
      
      if (connectionDisruptions.affectedLines.length > 0) {
        actions.logTestInfo(`  Affected lines: ${connectionDisruptions.affectedLines.join(', ')}`);
      }
      
      if (connectionDisruptions.disruptionWarnings.length > 0) {
        actions.logTestInfo('🚨 Disruption warnings:');
        connectionDisruptions.disruptionWarnings.forEach((warning, index) => {
          actions.logTestInfo(`  ${index + 1}. ${warning}`);
        });
      }
      
      await actions.screenshot('connection-disruptions', 'Connection results with disruption info');
    });

    await actions.step('🔄 Test Alternative Route Suggestions', async () => {
      // Look for alternative route suggestions or "more options" buttons
      const alternativeRouteOptions = await page.evaluate(() => {
        const results = {
          moreOptionsButton: false,
          earlierLaterOptions: false,
          routeVariations: false,
          viaOptions: false,
          differentTransportModes: false
        };
        
        // Look for "more options" type buttons
        const moreOptionsKeywords = ['mehr optionen', 'more options', 'weitere verbindungen', 'more connections'];
        const buttons = document.querySelectorAll('button');
        for (const button of buttons) {
          const text = button.textContent?.toLowerCase() || '';
          if (moreOptionsKeywords.some(keyword => text.includes(keyword))) {
            results.moreOptionsButton = true;
            break;
          }
        }
        
        // Look for earlier/later options
        const timingKeywords = ['früher', 'später', 'earlier', 'later'];
        results.earlierLaterOptions = timingKeywords.some(keyword => 
          document.body.textContent?.toLowerCase().includes(keyword.toLowerCase())
        );
        
        // Look for route variations
        const variationKeywords = ['via', 'über', 'route', 'weg'];
        results.routeVariations = variationKeywords.some(keyword => 
          document.body.textContent?.toLowerCase().includes(keyword.toLowerCase())
        );
        
        // Look for via options
        const viaKeywords = ['via', 'über'];
        results.viaOptions = viaKeywords.some(keyword => 
          document.body.textContent?.includes(keyword)
        );
        
        // Look for different transport modes
        const transportKeywords = ['bus', 'flugzeug', 'flight', 'auto', 'car'];
        results.differentTransportModes = transportKeywords.some(keyword => 
          document.body.textContent?.toLowerCase().includes(keyword.toLowerCase())
        );
        
        return results;
      });
      
      actions.logTestInfo('🔄 Alternative route options:');
      actions.logTestInfo(`  More options button: ${alternativeRouteOptions.moreOptionsButton ? '✅' : '❌'}`);
      actions.logTestInfo(`  Earlier/later options: ${alternativeRouteOptions.earlierLaterOptions ? '✅' : '❌'}`);
      actions.logTestInfo(`  Route variations: ${alternativeRouteOptions.routeVariations ? '✅' : '❌'}`);
      actions.logTestInfo(`  Via options: ${alternativeRouteOptions.viaOptions ? '✅' : '❌'}`);
      actions.logTestInfo(`  Different transport modes: ${alternativeRouteOptions.differentTransportModes ? '✅' : '❌'}`);
      
      // Try to click "later" button if available
      const laterButton = page.locator('button:has-text("später"), button:has-text("later")').first();
      const hasLaterButton = await laterButton.isVisible().catch(() => false);
      
      if (hasLaterButton) {
        await laterButton.click();
        actions.logTestInfo('⏰ Clicked for later departures');
        await page.waitForTimeout(2000);
      }
    });

    await actions.step('📱 Test Real-time Updates', async () => {
      // Check for real-time update functionality
      const realTimeFeatures = await page.evaluate(() => {
        const results = {
          liveUpdates: false,
          refreshButton: false,
          autoUpdate: false,
          lastUpdated: false,
          pushNotifications: false
        };
        
        // Look for live update indicators
        const liveKeywords = ['live', 'real-time', 'echtzeit', 'aktuell'];
        results.liveUpdates = liveKeywords.some(keyword => 
          document.body.textContent?.toLowerCase().includes(keyword.toLowerCase())
        );
        
        // Look for refresh functionality
        const refreshElements = document.querySelectorAll('button, [role="button"]');
        for (const element of refreshElements) {
          const text = element.textContent?.toLowerCase() || '';
          const ariaLabel = element.getAttribute('aria-label')?.toLowerCase() || '';
          if (text.includes('refresh') || text.includes('aktualisieren') || 
              ariaLabel.includes('refresh') || ariaLabel.includes('update')) {
            results.refreshButton = true;
            break;
          }
        }
        
        // Look for auto-update mentions
        const autoUpdateKeywords = ['automatisch', 'automatic', 'auto-update'];
        results.autoUpdate = autoUpdateKeywords.some(keyword => 
          document.body.textContent?.toLowerCase().includes(keyword.toLowerCase())
        );
        
        // Look for last updated timestamp
        const timestampKeywords = ['zuletzt aktualisiert', 'last updated', 'stand'];
        results.lastUpdated = timestampKeywords.some(keyword => 
          document.body.textContent?.toLowerCase().includes(keyword.toLowerCase())
        );
        
        // Look for notification mentions
        const notificationKeywords = ['benachrichtigung', 'notification', 'alert', 'push'];
        results.pushNotifications = notificationKeywords.some(keyword => 
          document.body.textContent?.toLowerCase().includes(keyword.toLowerCase())
        );
        
        return results;
      });
      
      actions.logTestInfo('📱 Real-time update features:');
      actions.logTestInfo(`  Live updates: ${realTimeFeatures.liveUpdates ? '✅' : '❌'}`);
      actions.logTestInfo(`  Refresh button: ${realTimeFeatures.refreshButton ? '✅' : '❌'}`);
      actions.logTestInfo(`  Auto update: ${realTimeFeatures.autoUpdate ? '✅' : '❌'}`);
      actions.logTestInfo(`  Last updated info: ${realTimeFeatures.lastUpdated ? '✅' : '❌'}`);
      actions.logTestInfo(`  Push notifications: ${realTimeFeatures.pushNotifications ? '✅' : '❌'}`);
      
      // Try to find and click refresh button
      const refreshButton = page.locator('button[aria-label*="refresh"], button[aria-label*="update"], button:has-text("aktualisieren")').first();
      const hasRefreshButton = await refreshButton.isVisible().catch(() => false);
      
      if (hasRefreshButton) {
        await refreshButton.click();
        actions.logTestInfo('🔄 Clicked refresh button');
        await page.waitForTimeout(3000);
      }
    });

    await actions.step('🚨 Test Disruption Detail Information', async () => {
      // Look for detailed disruption information
      const disruptionDetails = await page.evaluate(() => {
        const results = {
          affectedRoutes: [] as string[],
          expectedDuration: false,
          causeInformation: false,
          updateFrequency: false,
          contactInfo: false,
          compensationInfo: false
        };
        
        // Extract affected routes
        const routePattern = /(Basel|Zürich|Bern|Genève|Lausanne|Luzern)\s*(-|–|→)\s*(Basel|Zürich|Bern|Genève|Lausanne|Luzern)/gi;
        const routeMatches = document.body.textContent?.match(routePattern);
        if (routeMatches) {
          results.affectedRoutes = [...new Set(routeMatches)].slice(0, 3);
        }
        
        // Look for expected duration
        const durationKeywords = ['voraussichtlich', 'expected', 'duration', 'dauer', 'bis'];
        results.expectedDuration = durationKeywords.some(keyword => 
          document.body.textContent?.toLowerCase().includes(keyword.toLowerCase())
        );
        
        // Look for cause information
        const causeKeywords = ['grund', 'cause', 'ursache', 'reason', 'aufgrund', 'wegen'];
        results.causeInformation = causeKeywords.some(keyword => 
          document.body.textContent?.toLowerCase().includes(keyword.toLowerCase())
        );
        
        // Look for update frequency
        const updateKeywords = ['update', 'aktualisierung', 'information', 'regelmäßig'];
        results.updateFrequency = updateKeywords.some(keyword => 
          document.body.textContent?.toLowerCase().includes(keyword.toLowerCase())
        );
        
        // Look for contact information
        const contactKeywords = ['kontakt', 'contact', 'hotline', 'service'];
        results.contactInfo = contactKeywords.some(keyword => 
          document.body.textContent?.toLowerCase().includes(keyword.toLowerCase())
        );
        
        // Look for compensation information
        const compensationKeywords = ['entschädigung', 'compensation', 'rückerstattung', 'refund'];
        results.compensationInfo = compensationKeywords.some(keyword => 
          document.body.textContent?.toLowerCase().includes(keyword.toLowerCase())
        );
        
        return results;
      });
      
      actions.logTestInfo('🚨 Disruption detail analysis:');
      if (disruptionDetails.affectedRoutes.length > 0) {
        actions.logTestInfo(`  Affected routes: ${disruptionDetails.affectedRoutes.join(', ')}`);
      }
      actions.logTestInfo(`  Expected duration: ${disruptionDetails.expectedDuration ? '✅' : '❌'}`);
      actions.logTestInfo(`  Cause information: ${disruptionDetails.causeInformation ? '✅' : '❌'}`);
      actions.logTestInfo(`  Update frequency: ${disruptionDetails.updateFrequency ? '✅' : '❌'}`);
      actions.logTestInfo(`  Contact info: ${disruptionDetails.contactInfo ? '✅' : '❌'}`);
      actions.logTestInfo(`  Compensation info: ${disruptionDetails.compensationInfo ? '✅' : '❌'}`);
      
      await actions.screenshot('disruption-details', 'Detailed disruption information');
    });

    await actions.step('📋 Disruption Management Summary', async () => {
      actions.logTestInfo('📋 Disruption Management Test Summary:');
      actions.logTestInfo('  🚨 Homepage disruption banners and alerts');
      actions.logTestInfo('  🚂 Journey planning disruption detection');
      actions.logTestInfo('  ⚠️ Connection results disruption analysis');
      actions.logTestInfo('  🔄 Alternative route suggestions');
      actions.logTestInfo('  📱 Real-time update functionality');
      actions.logTestInfo('  🚨 Detailed disruption information');
      actions.logTestInfo('  🔧 Disruption handling workflow testing');
      
      await actions.screenshot('disruption-summary', 'Complete disruption management overview');
    });
  });
});