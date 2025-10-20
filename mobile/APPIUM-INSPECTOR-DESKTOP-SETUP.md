# 🔍 Appium Inspector Setup - Desktop Version

## 📥 Download & Installation

### Option A: GitHub Releases (Empfohlen)
1. Besuchen Sie: https://github.com/appium/appium-inspector/releases
2. Laden Sie die neueste `.exe` Datei für Windows herunter
3. Installieren Sie die Desktop-Anwendung

### Option B: Alternatives Tool - UI Automator Viewer
```powershell
# UI Automator Viewer starten (Teil des Android SDK)
%ANDROID_HOME%\tools\bin\uiautomatorviewer.bat
```

## ⚙️ Appium Inspector Configuration

### 🔗 Connection Settings:
- **Remote Host**: `127.0.0.1`
- **Remote Port**: `4723`
- **Remote Path**: `/`

### 📱 Desired Capabilities:
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

## 🎬 Recording Workflow

### Schritt 1: Session starten
1. Appium Inspector öffnen
2. Capabilities eingeben (siehe oben)
3. "Start Session" klicken
4. App sollte auf Emulator starten

### Schritt 2: Interactive Recording
1. **Select Elements**: Klicken Sie auf UI Elemente im Inspector
2. **View Properties**: Sehen Sie XPath, content-desc, resource-id
3. **Record Actions**: Inspector generiert Code für Klicks
4. **Copy Code**: Generierte Selektoren kopieren

### Schritt 3: Element Inspection
Für jedes Element sehen Sie:
- **XPath**: `//android.widget.Button[@content-desc="Tap to add product to cart"]`
- **Content Description**: `"Tap to add product to cart"`
- **Resource ID**: `com.saucelabs.mydemoapp.android:id/productTV`
- **Class Name**: `android.widget.Button`

## 📝 Code Generation
Der Inspector zeigt Ihnen Code wie:
```javascript
// Product click
await driver.$('//android.widget.ImageView[@content-desc="Product Image"]').click();

// Add to cart
await driver.$('//android.widget.Button[@content-desc="Tap to add product to cart"]').click();

// View cart  
await driver.$('//android.widget.RelativeLayout[@content-desc="View cart"]').click();
```

## 🚀 Nächste Schritte
1. Download & Install Appium Inspector Desktop
2. Session starten mit unseren Capabilities
3. Manuell durch My Demo App navigieren
4. Element-Selektoren sammeln
5. Ich erstelle daraus den finalen Test!