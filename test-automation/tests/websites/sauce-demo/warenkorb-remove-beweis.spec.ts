import { test, expect } from '@playwright/test';

/**
 * Spezifischer Test: Warenkorb Remove-Funktionalität
 * Überprüft, ob Artikel wirklich aus dem Warenkorb entfernt werden können
 */

test.describe('Warenkorb Remove-Funktionalität Verifikation', () => {
  
  test('Beweis: Können Artikel aus dem Warenkorb entfernt werden?', async ({ page }) => {
    console.log('🔍 TESTE: Warenkorb Remove-Funktionalität');
    console.log('==========================================');
    
    // 1. Login
    await page.goto('/');
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
    console.log('✅ Login erfolgreich');
    
    // 2. Artikel zum Warenkorb hinzufügen
    const firstProduct = await page.locator('.inventory_item_name').first().textContent();
    console.log(`📦 Füge Produkt hinzu: "${firstProduct}"`);
    
    await page.locator('.btn_inventory').first().click();
    
    // 3. Warenkorb-Badge prüfen
    const cartBadge = await page.locator('.shopping_cart_badge');
    await expect(cartBadge).toBeVisible();
    const itemCount = await cartBadge.textContent();
    console.log(`🛒 Warenkorb enthält: ${itemCount} Artikel`);
    
    // 4. Zum Warenkorb navigieren
    await page.click('.shopping_cart_link');
    await expect(page).toHaveURL(/.*cart.html/);
    console.log('✅ Warenkorb-Seite erreicht');
    
    // 5. KRITISCHER TEST: Suche nach Remove-Button
    console.log('\n🔍 SUCHE NACH REMOVE-FUNKTIONALITÄT:');
    console.log('====================================');
    
    // Mögliche Remove-Button Selektoren
    const possibleRemoveSelectors = [
      '[data-test="remove"]',
      '[data-testid="remove"]', 
      'button:has-text("Remove")',
      'button:has-text("Entfernen")',
      '.btn_secondary',
      '.remove-button',
      '.cart_button',
      'button[id*="remove"]',
      'button[class*="remove"]'
    ];
    
    let removeButtonFound = false;
    let workingSelector = '';
    
    for (const selector of possibleRemoveSelectors) {
      const buttonExists = await page.locator(selector).count() > 0;
      console.log(`   ${selector}: ${buttonExists ? '✅ GEFUNDEN' : '❌ Nicht gefunden'}`);
      
      if (buttonExists && !removeButtonFound) {
        removeButtonFound = true;
        workingSelector = selector;
      }
    }
    
    // 6. Alle Buttons im Warenkorb analysieren
    console.log('\n🔍 ALLE BUTTONS IM WARENKORB:');
    console.log('============================');
    
    const allButtons = await page.locator('button').all();
    for (let i = 0; i < allButtons.length; i++) {
      const buttonText = await allButtons[i].textContent();
      const buttonId = await allButtons[i].getAttribute('id');
      const buttonClass = await allButtons[i].getAttribute('class');
      const dataTest = await allButtons[i].getAttribute('data-test');
      
      console.log(`   Button ${i + 1}:`);
      console.log(`     Text: "${buttonText}"`);
      console.log(`     ID: ${buttonId || 'keine'}`);
      console.log(`     Class: ${buttonClass || 'keine'}`);
      console.log(`     data-test: ${dataTest || 'keine'}`);
      console.log('');
    }
    
    // 7. FUNKTIONALITÄTS-TEST
    if (removeButtonFound) {
      console.log(`🎯 TESTE REMOVE-FUNKTIONALITÄT mit Selector: ${workingSelector}`);
      
      // Artikel-Anzahl vor dem Entfernen
      const itemsBefore = await page.locator('.cart_item').count();
      console.log(`   Artikel vor Remove: ${itemsBefore}`);
      
      // Remove-Button klicken
      await page.locator(workingSelector).first().click();
      
      // Warten auf Änderung
      await page.waitForTimeout(1000);
      
      // Artikel-Anzahl nach dem Entfernen
      const itemsAfter = await page.locator('.cart_item').count();
      console.log(`   Artikel nach Remove: ${itemsAfter}`);
      
      // Warenkorb-Badge prüfen
      const cartBadgeAfter = await page.locator('.shopping_cart_badge').count();
      console.log(`   Warenkorb-Badge sichtbar: ${cartBadgeAfter > 0}`);
      
      if (itemsAfter < itemsBefore) {
        console.log('✅ ERFOLG: Remove-Funktionalität arbeitet korrekt!');
        console.log('✅ Artikel wurde erfolgreich aus dem Warenkorb entfernt');
      } else {
        console.log('❌ FEHLER: Remove-Button existiert, aber entfernt keine Artikel');
      }
      
    } else {
      console.log('❌ ERGEBNIS: Keine Remove-Funktionalität gefunden!');
      console.log('❌ Bestätigung: Artikel können NICHT aus dem Warenkorb entfernt werden');
      
      // Screenshot für Beweis
      await page.screenshot({ 
        path: 'test-results/warenkorb-no-remove-button.png',
        fullPage: true 
      });
      console.log('📸 Screenshot gespeichert: warenkorb-no-remove-button.png');
    }
    
    // Test-Assertion für Beweisführung
    expect(removeButtonFound).toBeTruthy(); // Dieser Test wird fehlschlagen wenn keine Remove-Funktion existiert
  });
  
  test('Zusätzlicher Test: Detaillierte Warenkorb-Analyse', async ({ page }) => {
    console.log('\n🔬 DETAILLIERTE WARENKORB-ANALYSE');
    console.log('=================================');
    
    // Setup
    await page.goto('/');
    await page.fill('#user-name', 'standard_user');
    await page.fill('#password', 'secret_sauce');
    await page.click('#login-button');
    
    // Mehrere Artikel hinzufügen
    await page.locator('.btn_inventory').first().click();
    await page.locator('.btn_inventory').nth(1).click();
    
    await page.click('.shopping_cart_link');
    
    // HTML-Struktur des Warenkorbs analysieren
    const cartHTML = await page.locator('.cart_contents').innerHTML();
    console.log('📄 Warenkorb HTML-Struktur:');
    console.log(cartHTML);
    
    // Alle interaktiven Elemente finden
    const interactiveElements = await page.locator('button, a, input[type="button"], input[type="submit"]').all();
    
    console.log(`\n🎮 INTERAKTIVE ELEMENTE IM WARENKORB: ${interactiveElements.length}`);
    for (let i = 0; i < interactiveElements.length; i++) {
      const element = interactiveElements[i];
      const tagName = await element.evaluate(el => el.tagName);
      const text = await element.textContent();
      const onclick = await element.getAttribute('onclick');
      
      console.log(`   ${i + 1}. ${tagName}: "${text}" ${onclick ? `(onclick: ${onclick})` : ''}`);
    }
    
    // Prüfe spezifisch nach Remove-Pattern in der gesamten Seite
    const pageContent = await page.content();
    const removePatterns = ['remove', 'delete', 'entfernen', 'löschen', 'del'];
    
    console.log('\n🔍 SUCHE NACH REMOVE-PATTERNS IM HTML:');
    for (const pattern of removePatterns) {
      const found = pageContent.toLowerCase().includes(pattern);
      console.log(`   "${pattern}": ${found ? '✅ Gefunden' : '❌ Nicht gefunden'}`);
    }
  });
});

// Separater Test für direkten Beweis
test('🎯 DIREKTER BEWEIS: Remove-Funktionalität existiert oder nicht', async ({ page }) => {
  console.log('\n' + '='.repeat(60));
  console.log('🎯 DIREKTER BEWEIS: WARENKORB REMOVE-FUNKTIONALITÄT');
  console.log('='.repeat(60));
  
  // Setup
  await page.goto('/');
  await page.fill('#user-name', 'standard_user');
  await page.fill('#password', 'secret_sauce');
  await page.click('#login-button');
  
  // Artikel hinzufügen
  await page.locator('.btn_inventory').first().click();
  await page.click('.shopping_cart_link');
  
  // Der ultimative Test
  const removeButtons = await page.locator('button').filter({ hasText: /remove/i }).count();
  const removeByDataTest = await page.locator('[data-test*="remove"]').count();
  const removeByClass = await page.locator('[class*="remove"]').count();
  
  console.log('📊 REMOVE-BUTTON ANALYSE:');
  console.log(`   Buttons mit "remove" Text: ${removeButtons}`);
  console.log(`   Elemente mit data-test="remove": ${removeByDataTest}`);
  console.log(`   Elemente mit remove-Klasse: ${removeByClass}`);
  
  const totalRemoveOptions = removeButtons + removeByDataTest + removeByClass;
  
  if (totalRemoveOptions > 0) {
    console.log('✅ ERGEBNIS: Remove-Funktionalität IST VORHANDEN!');
    console.log('✅ Die ursprüngliche Bewertung war FALSCH');
    
    // Teste die Funktionalität
    if (removeButtons > 0) {
      await page.locator('button').filter({ hasText: /remove/i }).first().click();
    } else if (removeByDataTest > 0) {
      await page.locator('[data-test*="remove"]').first().click();
    } else {
      await page.locator('[class*="remove"]').first().click();
    }
    
    await page.waitForTimeout(1000);
    const remainingItems = await page.locator('.cart_item').count();
    console.log(`✅ Artikel nach Remove-Klick: ${remainingItems}`);
    
  } else {
    console.log('❌ ERGEBNIS: Remove-Funktionalität ist NICHT VORHANDEN!');
    console.log('❌ Die ursprüngliche Bewertung war KORREKT');
    
    // Beweise mit Screenshot
    await page.screenshot({ 
      path: 'test-results/beweis-keine-remove-funktion.png',
      fullPage: true 
    });
  }
  
  console.log('='.repeat(60));
});