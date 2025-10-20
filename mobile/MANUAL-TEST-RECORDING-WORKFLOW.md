# 📹 Manual Test Recording & Analysis Workflow

## 🎬 Schritt 1: Screen Recording
```powershell
# Android Screen Recording starten
adb shell screenrecord /sdcard/test-recording.mp4

# Ihre manuellen Tests durchführen...

# Recording stoppen (Ctrl+C) und herunterladen
adb pull /sdcard/test-recording.mp4 ./recordings/
```

## 🔍 Schritt 2: UI Element Dumps erstellen
```powershell
# UI Dump bei jedem wichtigen Schritt
adb shell uiautomator dump /sdcard/ui-dump-step1.xml
adb pull /sdcard/ui-dump-step1.xml ./ui-dumps/

adb shell uiautomator dump /sdcard/ui-dump-step2.xml  
adb pull /sdcard/ui-dump-step2.xml ./ui-dumps/

# usw. für jeden Workflow-Schritt
```

## 📋 Schritt 3: Manual Test Protocol
Während Sie testen, dokumentieren Sie:

### 🛍️ Shopping Workflow Steps:
1. **App Start**: `com.saucelabs.mydemoapp.android` öffnen
2. **Product 1**: Welches Produkt? Welcher Button? Welche Navigation?
3. **Product 2**: Wie zurück zum Katalog? Welche UI-Elemente?
4. **Cart Access**: Welchen Button für Warenkorb? Wo located?
5. **Checkout**: Welche Buttons? Welche Felder?
6. **Login**: Welche Credentials sichtbar? Wo eingeben?
7. **Address**: Welche Felder required? 
8. **Order**: Final Button? Confirmation?

## 🔧 Schritt 4: Selector Extraction
Für jedes UI Element notieren:
- **Element Type**: Button, TextView, ImageView
- **Content Description**: @content-desc Wert
- **Text**: Sichtbarer Text
- **Resource ID**: @resource-id falls vorhanden
- **XPath**: Vollständiger Pfad

## 📝 Schritt 5: Test Code Generation
Ich konvertiere Ihre Dokumentation in:
```javascript
// Basierend auf Ihren manuellen Steps
await driver.$('IHRE_GEFUNDENEN_SELECTORS').click();
await driver.$('IHRE_CART_BUTTON_SELECTOR').click();
// etc.
```