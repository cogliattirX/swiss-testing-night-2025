import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

test.describe('SBB.ch Mobile App Comparison Testing', () => {
  
  test('Test mobile responsiveness and app feature comparison', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('📱 Testing mobile experience and app comparison');
    
    await actions.step('🏠 Navigate to SBB Homepage in Desktop View', async () => {
      await actions.observableGoto('https://www.sbb.ch', 'Navigate to SBB homepage');
      
      // Accept cookies
      try {
        await page.waitForSelector('#onetrust-accept-btn-handler', { timeout: 3000 });
        await page.click('#onetrust-accept-btn-handler');
        actions.logTestInfo('Accept cookies');
      } catch (error) {
        actions.logTestInfo('ℹ️ No cookie banner');
      }
      
      await actions.screenshot('desktop-homepage', 'Desktop homepage view');
    });

    await actions.step('📱 Switch to Mobile Viewport', async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
      actions.logTestInfo('📱 Switched to mobile viewport (375x667)');
      
      // Wait for responsive adjustments
      await page.waitForTimeout(2000);
      
      await actions.screenshot('mobile-homepage', 'Mobile homepage view');
    });

    await actions.step('🔍 Analyze Mobile Navigation', async () => {
      // Analyze mobile navigation structure
      const mobileNavigation = await page.evaluate(() => {
        const results = {
          hasHamburgerMenu: false,
          hasBottomNavigation: false,
          hasSearchButton: false,
          navigationItems: [] as string[],
          responsiveElements: 0,
          mobileOptimizedButtons: 0
        };
        
        // Look for hamburger menu
        const hamburgerSelectors = [
          '.hamburger', '.menu-toggle', '[aria-label*="menu"]',
          '.nav-toggle', '.mobile-menu-toggle', 'button[class*="menu"]'
        ];
        
        hamburgerSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            results.hasHamburgerMenu = true;
          }
        });
        
        // Look for bottom navigation
        const bottomNavSelectors = [
          '.bottom-nav', '.bottom-navigation', '.tab-bar',
          'nav[class*="bottom"]', '.footer-nav'
        ];
        
        bottomNavSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            results.hasBottomNavigation = true;
          }
        });
        
        // Look for search functionality
        const searchElements = document.querySelectorAll('input[type="search"], input[placeholder*="Search"], .search-button');
        results.hasSearchButton = searchElements.length > 0;
        
        // Extract navigation items
        const navElements = document.querySelectorAll('nav a, .navigation a, .menu a');
        navElements.forEach((element, index) => {
          if (index < 8) { // First 8 nav items
            const text = element.textContent?.trim();
            if (text && text.length < 30) {
              results.navigationItems.push(text);
            }
          }
        });
        
        // Count responsive elements
        const responsiveElements = document.querySelectorAll('[class*="responsive"], [class*="mobile"], [class*="xs-"]');
        results.responsiveElements = responsiveElements.length;
        
        // Count mobile-optimized buttons
        const buttons = document.querySelectorAll('button');
        buttons.forEach(button => {
          const rect = button.getBoundingClientRect();
          if (rect.height >= 44) { // iOS recommended minimum touch target
            results.mobileOptimizedButtons++;
          }
        });
        
        return results;
      });
      
      actions.logTestInfo('🔍 Mobile navigation analysis:');
      actions.logTestInfo(`  Hamburger menu: ${mobileNavigation.hasHamburgerMenu ? '✅' : '❌'}`);
      actions.logTestInfo(`  Bottom navigation: ${mobileNavigation.hasBottomNavigation ? '✅' : '❌'}`);
      actions.logTestInfo(`  Search functionality: ${mobileNavigation.hasSearchButton ? '✅' : '❌'}`);
      actions.logTestInfo(`  Responsive elements: ${mobileNavigation.responsiveElements}`);
      actions.logTestInfo(`  Mobile-optimized buttons: ${mobileNavigation.mobileOptimizedButtons}`);
      
      if (mobileNavigation.navigationItems.length > 0) {
        actions.logTestInfo(`  Navigation items: ${mobileNavigation.navigationItems.slice(0, 5).join(', ')}`);
      }
    });

    await actions.step('🎯 Test Mobile Journey Planning', async () => {
      // Test journey planning on mobile
      const fromInput = page.locator('input[placeholder*="Von"], input[placeholder*="From"], input[name*="from"]').first();
      const hasFromInput = await fromInput.isVisible().catch(() => false);
      
      if (hasFromInput) {
        // Test mobile keyboard interaction
        await fromInput.tap();
        await fromInput.fill('Zürich');
        actions.logTestInfo('📱 Mobile origin input: Zürich');
        
        await page.waitForTimeout(1000);
        
        const toInput = page.locator('input[placeholder*="Nach"], input[placeholder*="To"], input[name*="to"]').first();
        const hasToInput = await toInput.isVisible().catch(() => false);
        
        if (hasToInput) {
          await toInput.tap();
          await toInput.fill('Bern');
          actions.logTestInfo('📱 Mobile destination input: Bern');
          
          await page.waitForTimeout(1000);
        }
        
        // Test mobile search button
        const searchButton = page.locator('button:has-text("Verbindungen suchen"), button:has-text("Search connections")').first();
        const hasSearchButton = await searchButton.isVisible().catch(() => false);
        
        if (hasSearchButton) {
          await searchButton.tap();
          actions.logTestInfo('📱 Mobile search executed');
          await page.waitForLoadState('networkidle');
        }
      }
      
      await actions.screenshot('mobile-journey-planning', 'Mobile journey planning interface');
    });

    await actions.step('📊 Analyze Mobile Results Layout', async () => {
      // Analyze how results are displayed on mobile
      const mobileResultsLayout = await page.evaluate(() => {
        const results = {
          hasCardLayout: false,
          hasStackedLayout: false,
          hasHorizontalScroll: false,
          connectionCards: 0,
          touchOptimized: false,
          hasSwipeGestures: false
        };
        
        // Look for card-based layout
        const cardElements = document.querySelectorAll('.card, [class*="card"], .connection, [class*="connection"]');
        results.connectionCards = cardElements.length;
        results.hasCardLayout = cardElements.length > 0;
        
        // Check for stacked layout
        const stackElements = document.querySelectorAll('[class*="stack"], [class*="vertical"], .list-item');
        results.hasStackedLayout = stackElements.length > 0;
        
        // Check for horizontal scroll containers
        const scrollElements = document.querySelectorAll('[style*="overflow-x"], [class*="scroll"], [class*="swipe"]');
        results.hasHorizontalScroll = scrollElements.length > 0;
        
        // Check for touch-optimized elements
        const touchElements = document.querySelectorAll('button, a, [role="button"]');
        let touchOptimizedCount = 0;
        touchElements.forEach(element => {
          const rect = element.getBoundingClientRect();
          if (rect.height >= 44 && rect.width >= 44) { // Apple's recommended touch target size
            touchOptimizedCount++;
          }
        });
        results.touchOptimized = touchOptimizedCount > 0;
        
        // Look for swipe gesture indicators
        const swipeKeywords = ['swipe', 'gesture', 'touch'];
        const bodyText = document.body.textContent || '';
        results.hasSwipeGestures = swipeKeywords.some(keyword => 
          bodyText.toLowerCase().includes(keyword.toLowerCase())
        );
        
        return results;
      });
      
      actions.logTestInfo('📊 Mobile results layout analysis:');
      actions.logTestInfo(`  Card layout: ${mobileResultsLayout.hasCardLayout ? '✅' : '❌'}`);
      actions.logTestInfo(`  Stacked layout: ${mobileResultsLayout.hasStackedLayout ? '✅' : '❌'}`);
      actions.logTestInfo(`  Horizontal scroll: ${mobileResultsLayout.hasHorizontalScroll ? '✅' : '❌'}`);
      actions.logTestInfo(`  Connection cards: ${mobileResultsLayout.connectionCards}`);
      actions.logTestInfo(`  Touch optimized: ${mobileResultsLayout.touchOptimized ? '✅' : '❌'}`);
      actions.logTestInfo(`  Swipe gestures: ${mobileResultsLayout.hasSwipeGestures ? '✅' : '❌'}`);
    });

    await actions.step('📱 Look for Mobile App Promotion', async () => {
      // Look for mobile app download links and promotion
      const appPromotion = await page.evaluate(() => {
        const results = {
          hasAppBanner: false,
          hasAppStoreLinks: false,
          appPromotionText: [] as string[],
          downloadButtons: 0,
          qrCodePresent: false,
          smartBannerPresent: false
        };
        
        // Look for app banners
        const appBannerSelectors = [
          '.app-banner', '.mobile-app-banner', '[class*="app-promo"]',
          '.download-app', '.app-download'
        ];
        
        appBannerSelectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          if (elements.length > 0) {
            results.hasAppBanner = true;
          }
        });
        
        // Look for app store links
        const appStoreKeywords = ['app store', 'google play', 'ios', 'android', 'download'];
        const links = document.querySelectorAll('a');
        links.forEach(link => {
          const href = link.getAttribute('href') || '';
          const text = link.textContent?.toLowerCase() || '';
          if (href.includes('apple.com/app') || href.includes('play.google.com') ||
              appStoreKeywords.some(keyword => text.includes(keyword))) {
            results.hasAppStoreLinks = true;
            results.downloadButtons++;
          }
        });
        
        // Look for app promotion text
        const appKeywords = ['SBB App', 'Mobile App', 'Download', 'Herunterladen'];
        appKeywords.forEach(keyword => {
          if (document.body.textContent?.includes(keyword)) {
            results.appPromotionText.push(keyword);
          }
        });
        
        // Look for QR codes
        const qrElements = document.querySelectorAll('img[alt*="QR"], img[src*="qr"], .qr-code');
        results.qrCodePresent = qrElements.length > 0;
        
        // Check for smart app banner
        const metaTags = document.querySelectorAll('meta[name*="apple-itunes-app"], meta[name*="google-play-app"]');
        results.smartBannerPresent = metaTags.length > 0;
        
        return results;
      });
      
      actions.logTestInfo('📱 Mobile app promotion analysis:');
      actions.logTestInfo(`  App banner: ${appPromotion.hasAppBanner ? '✅' : '❌'}`);
      actions.logTestInfo(`  App store links: ${appPromotion.hasAppStoreLinks ? '✅' : '❌'}`);
      actions.logTestInfo(`  Download buttons: ${appPromotion.downloadButtons}`);
      actions.logTestInfo(`  QR code present: ${appPromotion.qrCodePresent ? '✅' : '❌'}`);
      actions.logTestInfo(`  Smart banner: ${appPromotion.smartBannerPresent ? '✅' : '❌'}`);
      
      if (appPromotion.appPromotionText.length > 0) {
        actions.logTestInfo(`  App promotion text: ${appPromotion.appPromotionText.join(', ')}`);
      }
      
      await actions.screenshot('mobile-app-promotion', 'Mobile app promotion elements');
    });

    await actions.step('⚡ Test Mobile Performance Features', async () => {
      // Analyze mobile-specific performance features
      const mobilePerformance = await page.evaluate(() => {
        const results = {
          hasProgressiveWebApp: false,
          hasOfflineCapability: false,
          hasLocationServices: false,
          hasPushNotifications: false,
          hasServiceWorker: false,
          hasManifest: false
        };
        
        // Check for PWA manifest
        const manifestLink = document.querySelector('link[rel="manifest"]');
        results.hasManifest = manifestLink !== null;
        
        // Check for service worker
        results.hasServiceWorker = 'serviceWorker' in navigator;
        
        // Look for location services
        const locationKeywords = ['Standort', 'Location', 'GPS', 'Position'];
        results.hasLocationServices = locationKeywords.some(keyword => 
          document.body.textContent?.includes(keyword)
        );
        
        // Look for push notification mentions
        const notificationKeywords = ['Benachrichtigung', 'Notification', 'Push', 'Alert'];
        results.hasPushNotifications = notificationKeywords.some(keyword => 
          document.body.textContent?.includes(keyword)
        );
        
        // Look for offline capability mentions
        const offlineKeywords = ['Offline', 'ohne Internet', 'cached', 'speichern'];
        results.hasOfflineCapability = offlineKeywords.some(keyword => 
          document.body.textContent?.includes(keyword)
        );
        
        // Check for PWA features
        const pwaKeywords = ['installieren', 'install', 'home screen', 'startbildschirm'];
        results.hasProgressiveWebApp = pwaKeywords.some(keyword => 
          document.body.textContent?.toLowerCase().includes(keyword.toLowerCase())
        );
        
        return results;
      });
      
      actions.logTestInfo('⚡ Mobile performance features:');
      actions.logTestInfo(`  Progressive Web App: ${mobilePerformance.hasProgressiveWebApp ? '✅' : '❌'}`);
      actions.logTestInfo(`  Offline capability: ${mobilePerformance.hasOfflineCapability ? '✅' : '❌'}`);
      actions.logTestInfo(`  Location services: ${mobilePerformance.hasLocationServices ? '✅' : '❌'}`);
      actions.logTestInfo(`  Push notifications: ${mobilePerformance.hasPushNotifications ? '✅' : '❌'}`);
      actions.logTestInfo(`  Service worker: ${mobilePerformance.hasServiceWorker ? '✅' : '❌'}`);
      actions.logTestInfo(`  Manifest file: ${mobilePerformance.hasManifest ? '✅' : '❌'}`);
    });

    await actions.step('📋 Test Different Mobile Breakpoints', async () => {
      // Test different mobile device sizes
      const breakpoints = [
        { name: 'iPhone SE', width: 375, height: 667 },
        { name: 'iPhone 12', width: 390, height: 844 },
        { name: 'Samsung Galaxy', width: 360, height: 740 },
        { name: 'iPad Mini', width: 768, height: 1024 }
      ];
      
      for (const breakpoint of breakpoints.slice(0, 2)) { // Test first 2 breakpoints
        await page.setViewportSize({ width: breakpoint.width, height: breakpoint.height });
        actions.logTestInfo(`📱 Testing ${breakpoint.name} (${breakpoint.width}x${breakpoint.height})`);
        
        await page.waitForTimeout(1000);
        
        // Check if layout adapts properly
        const layoutCheck = await page.evaluate(() => {
          return {
            hasHorizontalOverflow: document.body.scrollWidth > window.innerWidth,
            mainContentVisible: document.querySelector('main, .main-content, .content') !== null,
            navigationAccessible: document.querySelector('nav, .navigation') !== null
          };
        });
        
        actions.logTestInfo(`  Horizontal overflow: ${layoutCheck.hasHorizontalOverflow ? '❌' : '✅'}`);
        actions.logTestInfo(`  Main content visible: ${layoutCheck.mainContentVisible ? '✅' : '❌'}`);
        actions.logTestInfo(`  Navigation accessible: ${layoutCheck.navigationAccessible ? '✅' : '❌'}`);
        
        await actions.screenshot(`mobile-${breakpoint.name.toLowerCase().replace(' ', '-')}`, `${breakpoint.name} viewport`);
      }
    });

    await actions.step('🔄 Compare Web vs App Features', async () => {
      // Analyze web features vs suggested app features
      const featureComparison = await page.evaluate(() => {
        const results = {
          webFeatures: [] as string[],
          appOnlyFeatures: [] as string[],
          sharedFeatures: [] as string[],
          appAdvantages: [] as string[]
        };
        
        // Common web features
        const webFeatureKeywords = [
          'Verbindungen suchen', 'Search connections', 'Fahrplan', 'Timetable',
          'Tickets kaufen', 'Buy tickets', 'Störungen', 'Disruptions'
        ];
        
        webFeatureKeywords.forEach(feature => {
          if (document.body.textContent?.includes(feature)) {
            results.webFeatures.push(feature);
          }
        });
        
        // App-only features mentioned
        const appOnlyKeywords = [
          'Offline', 'GPS', 'Push notifications', 'Kamera', 'Camera',
          'Barcode', 'NFC', 'Touch ID', 'Face ID'
        ];
        
        appOnlyKeywords.forEach(feature => {
          if (document.body.textContent?.includes(feature)) {
            results.appOnlyFeatures.push(feature);
          }
        });
        
        // App advantages mentioned
        const appAdvantageKeywords = [
          'schneller', 'faster', 'einfacher', 'easier', 'bequemer', 'convenient',
          'personalisiert', 'personalized', 'favoriten', 'favorites'
        ];
        
        appAdvantageKeywords.forEach(advantage => {
          if (document.body.textContent?.toLowerCase().includes(advantage.toLowerCase())) {
            results.appAdvantages.push(advantage);
          }
        });
        
        return results;
      });
      
      actions.logTestInfo('🔄 Web vs App feature comparison:');
      if (featureComparison.webFeatures.length > 0) {
        actions.logTestInfo(`  Web features: ${featureComparison.webFeatures.slice(0, 4).join(', ')}`);
      }
      if (featureComparison.appOnlyFeatures.length > 0) {
        actions.logTestInfo(`  App-only features: ${featureComparison.appOnlyFeatures.join(', ')}`);
      }
      if (featureComparison.appAdvantages.length > 0) {
        actions.logTestInfo(`  App advantages: ${featureComparison.appAdvantages.join(', ')}`);
      }
    });

    await actions.step('📋 Mobile App Comparison Summary', async () => {
      actions.logTestInfo('📋 Mobile App Comparison Test Summary:');
      actions.logTestInfo('  📱 Mobile navigation and responsiveness');
      actions.logTestInfo('  🎯 Mobile journey planning interface');
      actions.logTestInfo('  📊 Mobile results layout optimization');
      actions.logTestInfo('  📱 Mobile app promotion and download options');
      actions.logTestInfo('  ⚡ Progressive Web App features');
      actions.logTestInfo('  📋 Multiple device breakpoint testing');
      actions.logTestInfo('  🔄 Web vs native app feature comparison');
      
      await actions.screenshot('mobile-summary', 'Complete mobile experience overview');
      
      // Reset to desktop viewport for next tests
      await page.setViewportSize({ width: 1280, height: 720 });
      actions.logTestInfo('🖥️ Reset to desktop viewport');
    });
  });
});