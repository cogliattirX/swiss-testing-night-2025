import { test, expect } from '@playwright/test';
import { createObservableActions } from '../../../test-helpers/observability';

/**
 * Spezifischer Test für Maria Herzog aus Zürich
 * Testet eine vollständige Bestellung mit den ersten 3 Produkten
 */

test.describe('Bestellung für Maria Herzog', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the base URL
    await page.goto('/');
  });

  test('sollte komplette Bestellung für Maria Herzog mit ersten 3 Produkten durchführen', async ({ page }) => {
    const actions = createObservableActions(page);
    
    await actions.step('Login als Standard-Benutzer', async () => {
      await actions.observableFill('#user-name', 'standard_user', 'Benutzername eingeben');
      await actions.observableFill('#password', 'secret_sauce', 'Passwort eingeben');
      await actions.observableClick('#login-button', 'Login-Button klicken');
      await actions.observableExpect(
        () => expect(page).toHaveURL(/.*inventory.html/),
        'Erfolgreiches Login zur Produktübersicht verifizieren'
      );
    });

    await actions.step('Erste 3 Produkte in den Warenkorb legen', async () => {
      // Die ersten 3 Produkte auf der Sauce Demo Seite hinzufügen
      // 1. Sauce Labs Backpack
      await actions.observableClick('[data-test="add-to-cart-sauce-labs-backpack"]', 'Sauce Labs Backpack hinzufügen');
      await actions.observableExpect(
        () => expect(page.locator('.shopping_cart_badge')).toHaveText('1'),
        'Warenkorb zeigt 1 Artikel an'
      );
      
      // 2. Sauce Labs Bike Light  
      await actions.observableClick('[data-test="add-to-cart-sauce-labs-bike-light"]', 'Sauce Labs Bike Light hinzufügen');
      await actions.observableExpect(
        () => expect(page.locator('.shopping_cart_badge')).toHaveText('2'),
        'Warenkorb zeigt 2 Artikel an'
      );
      
      // 3. Sauce Labs Bolt T-Shirt
      await actions.observableClick('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]', 'Sauce Labs Bolt T-Shirt hinzufügen');
      await actions.observableExpect(
        () => expect(page.locator('.shopping_cart_badge')).toHaveText('3'),
        'Warenkorb zeigt 3 Artikel an'
      );
    });

    await actions.step('Warenkorb überprüfen und Produktauswahl verifizieren', async () => {
      await actions.observableClick('.shopping_cart_link', 'Zum Warenkorb navigieren');
      await actions.observableExpect(
        () => expect(page).toHaveURL(/.*cart.html/),
        'Warenkorb-Seite geladen'
      );
      
      // Verifiziere, dass alle 3 Produkte im Warenkorb sind
      const itemNames = page.locator('[data-test="inventory-item-name"]');
      await actions.observableExpect(
        () => expect(itemNames).toHaveCount(3),
        'Genau 3 Artikel im Warenkorb'
      );
      
      // Verifiziere die spezifischen Produkte
      await actions.observableExpect(
        () => expect(itemNames.nth(0)).toHaveText('Sauce Labs Backpack'),
        'Erstes Produkt: Sauce Labs Backpack'
      );
      await actions.observableExpect(
        () => expect(itemNames.nth(1)).toHaveText('Sauce Labs Bike Light'),
        'Zweites Produkt: Sauce Labs Bike Light'
      );
      await actions.observableExpect(
        () => expect(itemNames.nth(2)).toHaveText('Sauce Labs Bolt T-Shirt'),
        'Drittes Produkt: Sauce Labs Bolt T-Shirt'
      );
    });

    await actions.step('Checkout starten und Kundendaten für Maria Herzog eingeben', async () => {
      await actions.observableClick('[data-test="checkout"]', 'Checkout-Prozess starten');
      await actions.observableExpect(
        () => expect(page).toHaveURL(/.*checkout-step-one.html/),
        'Checkout-Formular-Seite erreicht'
      );
      
      // Kundendaten von Maria Herzog aus Zürich eingeben
      await actions.observableFill('[data-test="firstName"]', 'Maria', 'Vorname: Maria eingeben');
      await actions.observableFill('[data-test="lastName"]', 'Herzog', 'Nachname: Herzog eingeben');
      await actions.observableFill('[data-test="postalCode"]', '8000', 'Postleitzahl: 8000 Zürich eingeben');
      
      await actions.observableClick('[data-test="continue"]', 'Zur Bestellübersicht weiter');
    });

    await actions.step('Bestellübersicht prüfen und Preise verifizieren', async () => {
      await actions.observableExpect(
        () => expect(page).toHaveURL(/.*checkout-step-two.html/),
        'Bestellübersicht-Seite erreicht'
      );
      
      // Verifiziere Artikel in der Bestellübersicht
      const overviewItems = page.locator('[data-test="inventory-item-name"]');
      await actions.observableExpect(
        () => expect(overviewItems).toHaveCount(3),
        '3 Artikel in der Bestellübersicht'
      );
      
      // Verifiziere, dass die Kundendaten korrekt übernommen wurden (implizit durch erfolgreiche Navigation)
      // Die Sauce Demo zeigt die Kundendaten nicht explizit an, aber der erfolgreiche Übergang bestätigt die Eingabe
      
      // Preis-Verifizierung der ersten 3 Produkte
      // Sauce Labs Backpack: $29.99, Bike Light: $9.99, Bolt T-Shirt: $15.99
      // Gesamtsumme: $55.97
      await actions.observableExpect(
        () => expect(page.locator('[data-test="subtotal-label"]')).toHaveText('Item total: $55.97'),
        'Zwischensumme der 3 Produkte verifizieren: $55.97'
      );
      
      // Steuer und Gesamtsumme prüfen
      await actions.observableExpect(
        () => expect(page.locator('[data-test="tax-label"]')).toBeVisible(),
        'Steuer wird angezeigt'
      );
      await actions.observableExpect(
        () => expect(page.locator('[data-test="total-label"]')).toBeVisible(),
        'Gesamtsumme wird angezeigt'
      );
    });

    await actions.step('Bestellung für Maria Herzog abschließen', async () => {
      await actions.observableClick('[data-test="finish"]', 'Bestellung abschließen');
      await actions.observableExpect(
        () => expect(page).toHaveURL(/.*checkout-complete.html/),
        'Bestellbestätigung-Seite erreicht'
      );
      
      // Erfolgreiche Bestellbestätigung verifizieren
      await actions.observableExpect(
        () => expect(page.locator('[data-test="complete-header"]')).toHaveText('Thank you for your order!'),
        'Bestellbestätigung: Danke für die Bestellung'
      );
      
      await actions.observableExpect(
        () => expect(page.locator('[data-test="complete-text"]')).toBeVisible(),
        'Bestätigungstext ist sichtbar'
      );
      
      await actions.observableExpect(
        () => expect(page.locator('[data-test="pony-express"]')).toBeVisible(),
        'Pony Express Lieferungsymbol wird angezeigt'
      );
      
      // Log der erfolgreichen Bestellung
      actions.logTestInfo('✅ Bestellung erfolgreich abgeschlossen für Maria Herzog, 8000 Zürich');
      actions.logTestInfo('📦 Bestellte Produkte: Sauce Labs Backpack, Bike Light, Bolt T-Shirt');
      actions.logTestInfo('💰 Zwischensumme: $55.97 (ohne Steuern)');
    });

    await actions.step('Zurück zur Produktübersicht und Warenkorb-Status prüfen', async () => {
      await actions.observableClick('[data-test="back-to-products"]', 'Zurück zur Produktübersicht');
      await actions.observableExpect(
        () => expect(page).toHaveURL(/.*inventory.html/),
        'Zurück auf der Produktübersicht'
      );
      
      // Verifiziere, dass der Warenkorb nach der Bestellung leer ist
      await actions.observableExpect(
        () => expect(page.locator('.shopping_cart_badge')).not.toBeVisible(),
        'Warenkorb ist nach der Bestellung leer'
      );
      
      // Zusätzliche Verifizierung: Die hinzugefügten Produkte sollten wieder "Add to cart" Buttons haben
      await actions.observableExpect(
        () => expect(page.locator('[data-test="add-to-cart-sauce-labs-backpack"]')).toBeVisible(),
        'Backpack kann wieder hinzugefügt werden'
      );
      await actions.observableExpect(
        () => expect(page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]')).toBeVisible(),
        'Bike Light kann wieder hinzugefügt werden'
      );
      await actions.observableExpect(
        () => expect(page.locator('[data-test="add-to-cart-sauce-labs-bolt-t-shirt"]')).toBeVisible(),
        'Bolt T-Shirt kann wieder hinzugefügt werden'
      );
    });

    await actions.step('Test-Zusammenfassung und Dokumentation', async () => {
      // Screenshot der finalen Produktübersicht nach erfolgreicher Bestellung
      await actions.screenshot('maria-herzog-bestellung-komplett', 'Finale Produktübersicht nach Maria Herzog Bestellung');
      
      actions.logTestInfo('🎉 BESTELLUNG KOMPLETT ERFOLGREICH! 🎉');
      actions.logTestInfo('👤 Kunde: Maria Herzog');
      actions.logTestInfo('📍 Adresse: 8000 Zürich, Schweiz');
      actions.logTestInfo('🛒 Produkte: 3 Artikel (erste 3 Produkte der Liste)');
      actions.logTestInfo('✅ Vollständiger E-Commerce Flow erfolgreich getestet');
    });
  });
});