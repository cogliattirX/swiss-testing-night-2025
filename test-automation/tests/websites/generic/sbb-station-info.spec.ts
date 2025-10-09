import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

test.describe('SBB.ch Station Information Testing', () => {
  
  test('Test station facilities and service information', async ({ page }) => {
    const actions = createObservableActions(page);
    
    actions.logTestInfo('🚉 Testing station information and facilities');
    
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

    await actions.step('🔍 Look for Station Information Section', async () => {
      // Look for station information in navigation
      const stationInfoSelectors = [
        'a:has-text("Bahnhof")',
        'a:has-text("Station")',
        'a:has-text("Bahnhöfe")',
        'a:has-text("Stations")',
        'a:has-text("Services")',
        'a:has-text("Dienstleistungen")',
        '[href*="station"]',
        '[href*="bahnhof"]',
        '.station-info',
        '.services'
      ];
      
      let stationInfoFound = false;
      
      for (const selector of stationInfoSelectors) {
        const stationLink = page.locator(selector).first();
        const isVisible = await stationLink.isVisible().catch(() => false);
        
        if (isVisible) {
          const linkText = await stationLink.textContent();
          actions.logTestInfo(`🚉 Found station info link: "${linkText}"`);
          await stationLink.click();
          stationInfoFound = true;
          await page.waitForLoadState('networkidle');
          break;
        }
      }
      
      if (!stationInfoFound) {
        actions.logTestInfo('ℹ️ Station info not in main navigation, searching stations');
      }
    });

    await actions.step('🚉 Search for Major Station Information', async () => {
      // Search for a major station (Zürich HB) to get detailed information
      const searchSelectors = [
        'input[placeholder*="Station"]',
        'input[placeholder*="Bahnhof"]',
        'input[name*="station"]',
        'input[name*="search"]',
        '.search-input',
        '[data-testid*="search"]'
      ];
      
      let searchFound = false;
      
      for (const selector of searchSelectors) {
        const searchInput = page.locator(selector).first();
        const isVisible = await searchInput.isVisible().catch(() => false);
        
        if (isVisible) {
          await searchInput.fill('Zürich HB');
          actions.logTestInfo('🔍 Searching for Zürich HB station info');
          
          // Wait for autocomplete
          await page.waitForTimeout(1000);
          
          // Look for suggestion
          const suggestion = page.locator('text="Zürich HB"').first();
          const hasSuggestion = await suggestion.isVisible().catch(() => false);
          
          if (hasSuggestion) {
            await suggestion.click();
            actions.logTestInfo('✅ Selected Zürich HB from suggestions');
          } else {
            await page.keyboard.press('Enter');
          }
          
          searchFound = true;
          await page.waitForLoadState('networkidle');
          break;
        }
      }
      
      if (!searchFound) {
        // Try direct navigation to station page
        await page.goto('https://www.sbb.ch/de/bahnhof-services.html');
        actions.logTestInfo('🚉 Navigating directly to station services');
        await page.waitForLoadState('networkidle');
      }
    });

    await actions.step('🏢 Analyze Station Facilities Information', async () => {
      // Look for station facilities and services
      const facilitiesInfo = await page.evaluate(() => {
        const results = {
          facilitiesFound: [] as string[],
          servicesFound: [] as string[],
          accessibilityInfo: false,
          shoppingOptions: false,
          parkingInfo: false,
          wifiInfo: false,
          facilityCounts: {} as Record<string, number>
        };
        
        // Common station facilities
        const facilityKeywords = [
          'WC', 'Toilet', 'Restaurant', 'Café', 'Shop', 'Geschäft',
          'Parkplatz', 'Parking', 'Information', 'Schalter', 'Counter',
          'Geldautomat', 'ATM', 'Aufzug', 'Elevator', 'Rolltreppe', 'Escalator',
          'Billettautomat', 'Ticket machine', 'Warteraum', 'Waiting room'
        ];
        
        facilityKeywords.forEach(keyword => {
          if (document.body.textContent?.includes(keyword)) {
            results.facilitiesFound.push(keyword);
          }
        });
        
        // Services
        const serviceKeywords = [
          'Gepäckaufbewahrung', 'Luggage storage', 'Fundbüro', 'Lost and found',
          'Reisezentrum', 'Travel center', 'Vermietung', 'Rental',
          'Taxi', 'Bus', 'Tram', 'Anschluss', 'Connection'
        ];
        
        serviceKeywords.forEach(keyword => {
          if (document.body.textContent?.includes(keyword)) {
            results.servicesFound.push(keyword);
          }
        });
        
        // Accessibility information
        const accessibilityKeywords = [
          'Rollstuhl', 'Wheelchair', 'Barrierfrei', 'Accessible',
          'Behindert', 'Disabled', 'Mobilitäts', 'Mobility'
        ];
        results.accessibilityInfo = accessibilityKeywords.some(keyword => 
          document.body.textContent?.includes(keyword)
        );
        
        // Shopping options
        const shoppingKeywords = ['Shop', 'Geschäft', 'Einkauf', 'Shopping', 'Laden'];
        results.shoppingOptions = shoppingKeywords.some(keyword => 
          document.body.textContent?.includes(keyword)
        );
        
        // Parking information
        const parkingKeywords = ['Parkplatz', 'Parking', 'Park+Rail', 'P+R'];
        results.parkingInfo = parkingKeywords.some(keyword => 
          document.body.textContent?.includes(keyword)
        );
        
        // WiFi information
        const wifiKeywords = ['WiFi', 'WLAN', 'Internet', 'free wifi'];
        results.wifiInfo = wifiKeywords.some(keyword => 
          document.body.textContent?.includes(keyword)
        );
        
        return results;
      });
      
      actions.logTestInfo('🏢 Station facilities analysis:');
      if (facilitiesInfo.facilitiesFound.length > 0) {
        actions.logTestInfo(`  Facilities: ${facilitiesInfo.facilitiesFound.slice(0, 8).join(', ')}`);
      }
      if (facilitiesInfo.servicesFound.length > 0) {
        actions.logTestInfo(`  Services: ${facilitiesInfo.servicesFound.slice(0, 6).join(', ')}`);
      }
      actions.logTestInfo(`  Accessibility info: ${facilitiesInfo.accessibilityInfo ? '✅' : '❌'}`);
      actions.logTestInfo(`  Shopping options: ${facilitiesInfo.shoppingOptions ? '✅' : '❌'}`);
      actions.logTestInfo(`  Parking info: ${facilitiesInfo.parkingInfo ? '✅' : '❌'}`);
      actions.logTestInfo(`  WiFi info: ${facilitiesInfo.wifiInfo ? '✅' : '❌'}`);
      
      await actions.screenshot('station-facilities', 'Station facilities information');
    });

    await actions.step('♿ Test Accessibility Information', async () => {
      // Look specifically for accessibility features
      const accessibilityDetails = await page.evaluate(() => {
        const results = {
          wheelchairAccess: false,
          elevators: false,
          tactilePaving: false,
          audioAnnouncements: false,
          visualAids: false,
          assistanceServices: false,
          accessiblePlatforms: false
        };
        
        const bodyText = document.body.textContent || '';
        
        // Wheelchair accessibility
        const wheelchairKeywords = ['Rollstuhl', 'Wheelchair', 'rollstuhlgängig', 'wheelchair accessible'];
        results.wheelchairAccess = wheelchairKeywords.some(keyword => 
          bodyText.toLowerCase().includes(keyword.toLowerCase())
        );
        
        // Elevators
        const elevatorKeywords = ['Aufzug', 'Elevator', 'Lift'];
        results.elevators = elevatorKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        // Tactile paving
        const tactileKeywords = ['Taktil', 'Tactile', 'Blindenleitsystem', 'Führungsstreifen'];
        results.tactilePaving = tactileKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        // Audio announcements
        const audioKeywords = ['Durchsage', 'Announcement', 'Audio', 'Lautsprecher'];
        results.audioAnnouncements = audioKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        // Visual aids
        const visualKeywords = ['Anzeige', 'Display', 'Monitor', 'Visual', 'Bildschirm'];
        results.visualAids = visualKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        // Assistance services
        const assistanceKeywords = ['Hilfe', 'Assistance', 'Support', 'Unterstützung'];
        results.assistanceServices = assistanceKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        // Accessible platforms
        const platformKeywords = ['Gleis', 'Platform', 'Bahnsteig', 'stufenlos'];
        results.accessiblePlatforms = platformKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        return results;
      });
      
      actions.logTestInfo('♿ Accessibility features analysis:');
      actions.logTestInfo(`  Wheelchair access: ${accessibilityDetails.wheelchairAccess ? '✅' : '❌'}`);
      actions.logTestInfo(`  Elevators: ${accessibilityDetails.elevators ? '✅' : '❌'}`);
      actions.logTestInfo(`  Tactile paving: ${accessibilityDetails.tactilePaving ? '✅' : '❌'}`);
      actions.logTestInfo(`  Audio announcements: ${accessibilityDetails.audioAnnouncements ? '✅' : '❌'}`);
      actions.logTestInfo(`  Visual aids: ${accessibilityDetails.visualAids ? '✅' : '❌'}`);
      actions.logTestInfo(`  Assistance services: ${accessibilityDetails.assistanceServices ? '✅' : '❌'}`);
      actions.logTestInfo(`  Accessible platforms: ${accessibilityDetails.accessiblePlatforms ? '✅' : '❌'}`);
    });

    await actions.step('🅿️ Test Parking and Transportation Links', async () => {
      // Look for parking and local transportation information
      const transportInfo = await page.evaluate(() => {
        const results = {
          parkAndRail: false,
          bikeParking: false,
          carParking: false,
          publicTransport: false,
          taxiInfo: false,
          busConnections: false,
          tramConnections: false,
          parkingPrices: [] as string[]
        };
        
        const bodyText = document.body.textContent || '';
        
        // Park and Rail
        const parkRailKeywords = ['Park+Rail', 'P+R', 'Park and Rail'];
        results.parkAndRail = parkRailKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        // Bike parking
        const bikeKeywords = ['Velo', 'Bike', 'Fahrrad', 'Bicycle'];
        results.bikeParking = bikeKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        // Car parking
        const carKeywords = ['Auto', 'Car', 'Parkplatz', 'Parking'];
        results.carParking = carKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        // Public transport
        const publicTransportKeywords = ['ÖV', 'Bus', 'Tram', 'öffentlich'];
        results.publicTransport = publicTransportKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        // Taxi
        const taxiKeywords = ['Taxi', 'Cab'];
        results.taxiInfo = taxiKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        // Bus connections
        const busKeywords = ['Bus', 'Busbahnhof', 'Buslinie'];
        results.busConnections = busKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        // Tram connections
        const tramKeywords = ['Tram', 'Straßenbahn', 'Linie'];
        results.tramConnections = tramKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        // Parking prices
        const pricePattern = /CHF\s*\d+\.?\d*|Preis.*CHF|Tarif.*CHF/g;
        const priceMatches = bodyText.match(pricePattern);
        if (priceMatches) {
          results.parkingPrices = priceMatches.slice(0, 3);
        }
        
        return results;
      });
      
      actions.logTestInfo('🅿️ Transportation & parking analysis:');
      actions.logTestInfo(`  Park+Rail: ${transportInfo.parkAndRail ? '✅' : '❌'}`);
      actions.logTestInfo(`  Bike parking: ${transportInfo.bikeParking ? '✅' : '❌'}`);
      actions.logTestInfo(`  Car parking: ${transportInfo.carParking ? '✅' : '❌'}`);
      actions.logTestInfo(`  Public transport: ${transportInfo.publicTransport ? '✅' : '❌'}`);
      actions.logTestInfo(`  Taxi info: ${transportInfo.taxiInfo ? '✅' : '❌'}`);
      actions.logTestInfo(`  Bus connections: ${transportInfo.busConnections ? '✅' : '❌'}`);
      actions.logTestInfo(`  Tram connections: ${transportInfo.tramConnections ? '✅' : '❌'}`);
      
      if (transportInfo.parkingPrices.length > 0) {
        actions.logTestInfo(`  Parking prices: ${transportInfo.parkingPrices.join(', ')}`);
      }
    });

    await actions.step('🛍️ Test Station Shopping and Dining', async () => {
      // Look for shopping and dining options
      const shoppingDining = await page.evaluate(() => {
        const results = {
          restaurants: [] as string[],
          cafes: [] as string[],
          shops: [] as string[],
          convenienceStores: false,
          bakeries: false,
          pharmacies: false,
          bookstores: false,
          openingHours: false
        };
        
        const bodyText = document.body.textContent || '';
        
        // Restaurants
        const restaurantKeywords = ['Restaurant', 'Gastronomie', 'Ristorante'];
        restaurantKeywords.forEach(keyword => {
          if (bodyText.includes(keyword)) {
            results.restaurants.push(keyword);
          }
        });
        
        // Cafes
        const cafeKeywords = ['Café', 'Coffee', 'Kaffee', 'Starbucks', 'Espresso'];
        cafeKeywords.forEach(keyword => {
          if (bodyText.includes(keyword)) {
            results.cafes.push(keyword);
          }
        });
        
        // Shops
        const shopKeywords = ['Shop', 'Geschäft', 'Laden', 'Store'];
        shopKeywords.forEach(keyword => {
          if (bodyText.includes(keyword)) {
            results.shops.push(keyword);
          }
        });
        
        // Convenience stores
        const convenienceKeywords = ['Convenience', 'Kiosk', 'Coop', 'Migros'];
        results.convenienceStores = convenienceKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        // Bakeries
        const bakeryKeywords = ['Bäckerei', 'Bakery', 'Brot', 'Bread'];
        results.bakeries = bakeryKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        // Pharmacies
        const pharmacyKeywords = ['Apotheke', 'Pharmacy', 'Drogerie'];
        results.pharmacies = pharmacyKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        // Bookstores
        const bookKeywords = ['Buchhandlung', 'Bookstore', 'Buch', 'Book'];
        results.bookstores = bookKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        // Opening hours
        const hourKeywords = ['Öffnungszeiten', 'Opening hours', 'geöffnet', 'open'];
        results.openingHours = hourKeywords.some(keyword => 
          bodyText.includes(keyword)
        );
        
        return results;
      });
      
      actions.logTestInfo('🛍️ Shopping & dining analysis:');
      if (shoppingDining.restaurants.length > 0) {
        actions.logTestInfo(`  Restaurants: ${shoppingDining.restaurants.join(', ')}`);
      }
      if (shoppingDining.cafes.length > 0) {
        actions.logTestInfo(`  Cafes: ${shoppingDining.cafes.join(', ')}`);
      }
      if (shoppingDining.shops.length > 0) {
        actions.logTestInfo(`  Shops: ${shoppingDining.shops.join(', ')}`);
      }
      actions.logTestInfo(`  Convenience stores: ${shoppingDining.convenienceStores ? '✅' : '❌'}`);
      actions.logTestInfo(`  Bakeries: ${shoppingDining.bakeries ? '✅' : '❌'}`);
      actions.logTestInfo(`  Pharmacies: ${shoppingDining.pharmacies ? '✅' : '❌'}`);
      actions.logTestInfo(`  Bookstores: ${shoppingDining.bookstores ? '✅' : '❌'}`);
      actions.logTestInfo(`  Opening hours: ${shoppingDining.openingHours ? '✅' : '❌'}`);
      
      await actions.screenshot('station-shopping', 'Station shopping and dining options');
    });

    await actions.step('📞 Test Station Contact and Support', async () => {
      // Look for contact information and support services
      const contactInfo = await page.evaluate(() => {
        const results = {
          phoneNumbers: [] as string[],
          emailAddresses: [] as string[],
          informationDesk: false,
          customerService: false,
          emergencyInfo: false,
          lostAndFound: false,
          policeInfo: false
        };
        
        // Extract phone numbers
        const phonePattern = /(\+41|0041|0)\s*\d{2}\s*\d{3}\s*\d{2}\s*\d{2}/g;
        const phoneMatches = document.body.textContent?.match(phonePattern);
        if (phoneMatches) {
          results.phoneNumbers = [...new Set(phoneMatches)].slice(0, 3);
        }
        
        // Extract email addresses
        const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const emailMatches = document.body.textContent?.match(emailPattern);
        if (emailMatches) {
          results.emailAddresses = [...new Set(emailMatches)].slice(0, 3);
        }
        
        // Information desk
        const infoKeywords = ['Information', 'Auskunft', 'Schalter', 'Desk'];
        results.informationDesk = infoKeywords.some(keyword => 
          document.body.textContent?.includes(keyword)
        );
        
        // Customer service
        const serviceKeywords = ['Kundendienst', 'Customer service', 'Support', 'Kundenservice'];
        results.customerService = serviceKeywords.some(keyword => 
          document.body.textContent?.includes(keyword)
        );
        
        // Emergency information
        const emergencyKeywords = ['Notfall', 'Emergency', 'Hilfe', 'Help'];
        results.emergencyInfo = emergencyKeywords.some(keyword => 
          document.body.textContent?.includes(keyword)
        );
        
        // Lost and found
        const lostFoundKeywords = ['Fundbüro', 'Lost and found', 'Fundgegenstände'];
        results.lostAndFound = lostFoundKeywords.some(keyword => 
          document.body.textContent?.includes(keyword)
        );
        
        // Police information
        const policeKeywords = ['Polizei', 'Police', 'Sicherheit', 'Security'];
        results.policeInfo = policeKeywords.some(keyword => 
          document.body.textContent?.includes(keyword)
        );
        
        return results;
      });
      
      actions.logTestInfo('📞 Contact & support analysis:');
      if (contactInfo.phoneNumbers.length > 0) {
        actions.logTestInfo(`  Phone numbers: ${contactInfo.phoneNumbers.join(', ')}`);
      }
      if (contactInfo.emailAddresses.length > 0) {
        actions.logTestInfo(`  Email addresses: ${contactInfo.emailAddresses.join(', ')}`);
      }
      actions.logTestInfo(`  Information desk: ${contactInfo.informationDesk ? '✅' : '❌'}`);
      actions.logTestInfo(`  Customer service: ${contactInfo.customerService ? '✅' : '❌'}`);
      actions.logTestInfo(`  Emergency info: ${contactInfo.emergencyInfo ? '✅' : '❌'}`);
      actions.logTestInfo(`  Lost and found: ${contactInfo.lostAndFound ? '✅' : '❌'}`);
      actions.logTestInfo(`  Police info: ${contactInfo.policeInfo ? '✅' : '❌'}`);
    });

    await actions.step('📋 Station Information Summary', async () => {
      actions.logTestInfo('📋 Station Information Test Summary:');
      actions.logTestInfo('  🏢 Station facilities and services overview');
      actions.logTestInfo('  ♿ Accessibility features and support');
      actions.logTestInfo('  🅿️ Parking and transportation connections');
      actions.logTestInfo('  🛍️ Shopping and dining options');
      actions.logTestInfo('  📞 Contact information and support services');
      actions.logTestInfo('  🚉 Major station (Zürich HB) detailed analysis');
      
      await actions.screenshot('station-summary', 'Complete station information overview');
    });
  });
});