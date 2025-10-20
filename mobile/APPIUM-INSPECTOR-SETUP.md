# 📱 Appium Inspector Setup für Manual Test Recording

## 🚀 Schritt 1: Appium Inspector starten
```powershell
# Appium Inspector starten (falls noch nicht installiert)
npm install -g appium-inspector

# Appium Inspector GUI öffnen
appium-inspector
```

## ⚙️ Schritt 2: Connection Settings
```json
{
  "platformName": "Android",
  "appium:deviceName": "emulator-5554", 
  "appium:automationName": "UiAutomator2",
  "appium:appPackage": "com.saucelabs.mydemoapp.android",
  "appium:appActivity": ".view.activities.SplashActivity",
  "appium:noReset": false,
  "appium:autoGrantPermissions": true
}
```

## 🎬 Schritt 3: Recording Process
1. **Connect**: Verbindung zu Emulator herstellen
2. **Record**: Ihre manuellen Aktionen werden als Code generiert
3. **Export**: Generated Code als Basis für unseren Test verwenden

## 📝 Schritt 4: Element Selectors erfassen
- Jedes UI-Element wird mit XPath/ID dokumentiert
- Actions werden als WebDriver Code generiert
- Screenshots werden automatisch erstellt

## 🔄 Schritt 5: Test-Code Generierung
Der Appium Inspector generiert Code wie:
```javascript
await driver.$('//android.widget.ImageView[@content-desc="Product Image"]').click();
await driver.$('//android.widget.Button[@content-desc="Tap to add product to cart"]').click();
await driver.$('//android.widget.RelativeLayout[@content-desc="View cart"]').click();
```