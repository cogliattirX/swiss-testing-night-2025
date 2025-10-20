import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../test-helpers/observability';

/**
 * 🛒 WORKSHOP LIVE-DEMO: Kompletter E2E Checkout-Workflow
 * 
 * Persona: 👨‍💻 Test Implementation Engineer  
 * Ziel: Demonstration eines kompletten Kaufprozesses von Produktauswahl bis Bestellabschluss
 * Besonderheiten:
 * - Kompletter E2E Workflow: Login → Produktauswahl → Warenkorb → Checkout → Bestellung
 * - Umfassende Verifikationen bei jedem Schritt
 * - Observability Framework für perfekte Live-Demo
 * - Realistische Benutzerdaten und Validierungen
 */

test.describe('🛒 Workshop Demo: Kompletter E2E Checkout-Workflow', () => {
  test.beforeEach(async ({ page }) => {
    const actions = createObservableActions(page);
    
    await actions.step('🔐 Login vorbereiten', async () => {
      await actions.observableGoto('https://www.saucedemo.com', 'Saucedemo öffnen');
      await actions.observableFill('#user-name', 'standard_user', 'Standard User eingeben');
      await actions.observableFill('#password', 'secret_sauce', 'Passwort eingeben');
      await actions.observableClick('#login-button', 'Login durchführen');
      
      await actions.observableExpect(async () => {
        await expect(page).toHaveURL(/.*inventory.html/);
      }, 'Login erfolgreich - auf Produktseite');
    });
  });

  test('🎯 Kompletter Kaufprozess: Von Produktauswahl bis Bestellabschluss', async ({ page }) => {
    console.log('\n🛒 === E2E CHECKOUT WORKFLOW DEMO STARTET ===');
    console.log('🎯 Ziel: Kompletter Kaufprozess mit 2 Produkten');
    console.log('📋 Schritte: Auswahl → Warenkorb → Checkout → Bestellung → Abschluss\n');

    const actions = createObservableActions(page);

    await actions.step('🛍️ Produktauswahl - Artikel in Warenkorb legen', async () => {
      actions.logTestInfo('Wähle zwei Produkte aus...');
      
      // Erstes Produkt: Sauce Labs Backpack ($29.99)
      await actions.observableClick(
        '[data-test="add-to-cart-sauce-labs-backpack"]',
        'Sauce Labs Backpack ($29.99) hinzufügen'
      );
      
      // Zweites Produkt: Sauce Labs Bike Light ($9.99)  
      await actions.observableClick(
        '[data-test="add-to-cart-sauce-labs-bike-light"]',
        'Sauce Labs Bike Light ($9.99) hinzufügen'
      );
      
      // Verifiziere Warenkorb-Badge
      await actions.observableExpect(async () => {
        await expect(page.locator('.shopping_cart_badge')).toHaveText('2');
      }, 'Warenkorb zeigt 2 Artikel an');
      
      actions.logTestInfo('✅ Beide Produkte erfolgreich in Warenkorb gelegt!');
      await actions.screenshot('products-added', 'Produkte im Warenkorb');
    });

    await actions.step('🛒 Warenkorb öffnen und Inhalte prüfen', async () => {
      actions.logTestInfo('Öffne Warenkorb und prüfe Inhalte...');
      
      await actions.observableClick('.shopping_cart_link', 'Warenkorb öffnen');
      
      await actions.observableExpect(async () => {
        await expect(page).toHaveURL(/.*cart.html/);
      }, 'Warenkorb-Seite geladen');
      
      // Prüfe Anzahl der Artikel im Warenkorb
      await actions.observableExpect(async () => {
        await expect(page.locator('.cart_item')).toHaveCount(2);
      }, 'Zwei Artikel im Warenkorb vorhanden');
      
      // Verifiziere Produktnamen
      const itemNames = page.locator('[data-test="inventory-item-name"]');
      await actions.observableExpect(async () => {
        await expect(itemNames.nth(0)).toHaveText('Sauce Labs Backpack');
        await expect(itemNames.nth(1)).toHaveText('Sauce Labs Bike Light');
      }, 'Korrekte Produktnamen im Warenkorb');
      
      actions.logTestInfo('✅ Warenkorb-Inhalte korrekt verifiziert!');
      await actions.screenshot('cart-contents', 'Warenkorb-Übersicht');
    });

    await actions.step('📝 Checkout-Prozess starten', async () => {
      actions.logTestInfo('Starte Checkout-Prozess...');
      
      await actions.observableClick('[data-test="checkout"]', 'Checkout starten');
      
      await actions.observableExpect(async () => {
        await expect(page).toHaveURL(/.*checkout-step-one.html/);
      }, 'Checkout-Formular geladen');
      
      actions.logTestInfo('✅ Checkout-Schritt 1 erreicht!');
    });

    await actions.step('👤 Lieferinformationen eingeben', async () => {
      actions.logTestInfo('Fülle Lieferinformationen aus...');
      
      await actions.observableFill('[data-test="firstName"]', 'Max', 'Vorname eingeben');
      await actions.observableFill('[data-test="lastName"]', 'Mustermann', 'Nachname eingeben');
      await actions.observableFill('[data-test="postalCode"]', '10115', 'Postleitzahl Berlin eingeben');
      
      await actions.observableClick('[data-test="continue"]', 'Weiter zur Übersicht');
      
      await actions.observableExpect(async () => {
        await expect(page).toHaveURL(/.*checkout-step-two.html/);
      }, 'Bestellübersicht geladen');
      
      actions.logTestInfo('✅ Lieferinformationen erfolgreich eingegeben!');
      await actions.screenshot('shipping-info', 'Lieferinformationen eingegeben');
    });

    await actions.step('📊 Bestellübersicht prüfen und validieren', async () => {
      actions.logTestInfo('Prüfe Bestellübersicht und Preisberechnung...');
      
      // Verifiziere Produktanzahl in Übersicht
      await actions.observableExpect(async () => {
        await expect(page.locator('.cart_item')).toHaveCount(2);
      }, 'Beide Produkte in Übersicht angezeigt');
      
      // Verifiziere Produktnamen in Übersicht
      const overviewItemNames = page.locator('[data-test="inventory-item-name"]');
      await actions.observableExpect(async () => {
        await expect(overviewItemNames.nth(0)).toHaveText('Sauce Labs Backpack');
        await expect(overviewItemNames.nth(1)).toHaveText('Sauce Labs Bike Light');
      }, 'Produktnamen in Übersicht korrekt');
      
      // Verifiziere Zahlungs- und Versandinformationen
      await actions.observableExpect(async () => {
        await expect(page.locator('[data-test="payment-info-value"]')).toHaveText('SauceCard #31337');
        await expect(page.locator('[data-test="shipping-info-value"]')).toHaveText('Free Pony Express Delivery!');
      }, 'Zahlungs- und Versandinfo korrekt');
      
      // Verifiziere Preisberechnung (Backpack $29.99 + Bike Light $9.99 = $39.98)
      await actions.observableExpect(async () => {
        await expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $39.98');
      }, 'Zwischensumme korrekt berechnet ($39.98)');
      
      // Prüfe dass Steuer und Gesamtsumme angezeigt werden
      await actions.observableExpect(async () => {
        await expect(page.locator('[data-test="tax-label"]')).toBeVisible();
        await expect(page.locator('[data-test="total-label"]')).toBeVisible();
      }, 'Steuer und Gesamtsumme angezeigt');
      
      actions.logTestInfo('✅ Alle Bestelldetails korrekt verifiziert!');
      await actions.screenshot('order-overview', 'Komplette Bestellübersicht');
    });

    await actions.step('✅ Bestellung abschließen', async () => {
      actions.logTestInfo('Schließe Bestellung ab...');
      
      await actions.observableClick('[data-test="finish"]', 'Bestellung abschließen');
      
      await actions.observableExpect(async () => {
        await expect(page).toHaveURL(/.*checkout-complete.html/);
      }, 'Bestätigungsseite geladen');
      
      // Verifiziere Bestätigungsnachrichten
      await actions.observableExpect(async () => {
        await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
        await expect(page.locator('[data-test="complete-text"]')).toContainText('Your order has been dispatched');
      }, 'Bestellbestätigung angezeigt');
      
      // Verifiziere Pony Express Bild
      await actions.observableExpect(async () => {
        await expect(page.locator('[data-test="pony-express"]')).toBeVisible();
      }, 'Pony Express Lieferung bestätigt');
      
      actions.logTestInfo('✅ Bestellung erfolgreich abgeschlossen!');
      await actions.screenshot('order-complete', 'Bestellung abgeschlossen');
    });

    await actions.step('🏠 Zurück zur Produktseite', async () => {
      actions.logTestInfo('Kehre zur Produktseite zurück...');
      
      await actions.observableClick('[data-test="back-to-products"]', 'Zurück zu Produkten');
      
      await actions.observableExpect(async () => {
        await expect(page).toHaveURL(/.*inventory.html/);
      }, 'Zurück auf Produktseite');
      
      // Verifiziere dass Warenkorb nach erfolgreicher Bestellung leer ist
      await actions.observableExpect(async () => {
        await expect(page.locator('.shopping_cart_badge')).not.toBeVisible();
      }, 'Warenkorb ist nach Bestellung leer');
      
      actions.logTestInfo('✅ Zurück zur Produktseite - Warenkorb leer!');
      await actions.screenshot('back-to-products', 'Zurück zur Produktseite');
    });

    console.log('\n🎉 === E2E CHECKOUT WORKFLOW ERFOLGREICH ABGESCHLOSSEN ===');
    console.log('💰 Bestellwert: $39.98 (Backpack + Bike Light)');
    console.log('📦 Lieferung: Free Pony Express Delivery');
    console.log('👤 Kunde: Max Mustermann, 10115 Berlin');
    console.log('🎯 Alle 7 Workflow-Schritte erfolgreich durchlaufen!');
    console.log('📊 Test demonstriert kompletten E2E Kaufprozess\n');
  });

  test('🏃‍♂️ Express-Checkout: Einzelprodukt-Bestellung', async ({ page }) => {
    console.log('\n⚡ === EXPRESS-CHECKOUT DEMO ===');
    
    const actions = createObservableActions(page);

    await actions.step('🧥 Premium-Produkt auswählen', async () => {
      // Wähle das teuerste Produkt: Fleece Jacket ($49.99)
      await actions.observableClick(
        '[data-test="add-to-cart-sauce-labs-fleece-jacket"]',
        'Premium Fleece Jacket ($49.99) auswählen'
      );
      
      actions.logTestInfo('Premium-Produkt für Express-Checkout gewählt!');
    });

    await actions.step('⚡ Express-Checkout durchführen', async () => {
      await actions.observableClick('.shopping_cart_link', 'Direkt zum Warenkorb');
      await actions.observableClick('[data-test="checkout"]', 'Express-Checkout starten');
      
      // Schnelle Dateneingabe
      await actions.observableFill('[data-test="firstName"]', 'Anna', 'Express-Vorname');
      await actions.observableFill('[data-test="lastName"]', 'Schmidt', 'Express-Nachname');  
      await actions.observableFill('[data-test="postalCode"]', '80331', 'München PLZ');
      await actions.observableClick('[data-test="continue"]', 'Express-Weiter');
      
      // Verifiziere Premium-Preis
      await actions.observableExpect(async () => {
        await expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $49.99');
      }, 'Premium-Preis korrekt ($49.99)');
      
      await actions.observableClick('[data-test="finish"]', 'Express-Bestellung abschließen');
      
      await actions.observableExpect(async () => {
        await expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!');
      }, 'Express-Bestellung erfolgreich');
      
      actions.logTestInfo('⚡ Express-Checkout in Rekordzeit abgeschlossen!');
    });

    console.log('⚡ Express-Checkout Demo abgeschlossen - $49.99 Premium-Bestellung!\n');
  });
});