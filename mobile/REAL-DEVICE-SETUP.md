# 📱 Real Device Setup - Pixel 8a per USB

## Schritt 1: USB-Verbindung prüfen

### Voraussetzungen:
1. **Pixel 8a per USB-Kabel verbunden** ✓
2. **Entwickleroptionen aktiviert**:
   - Einstellungen → Über das Telefon
   - 7x auf "Build-Nummer" tippen
3. **USB-Debugging aktiviert**:
   - Einstellungen → Entwickleroptionen
   - "USB-Debugging" einschalten

### Gerät erkennen:
```bash
# ADB Geräte auflisten
adb devices

# Sollte zeigen:
# List of devices attached
# [DEVICE_ID]    device
```

## Schritt 2: Gerätestatus prüfen

```bash
# USB-Debugging Status
adb shell getprop ro.debuggable

# Geräte-Info
adb shell getprop ro.product.model
adb shell getprop ro.build.version.release

# Developer Optionen
adb shell settings get global development_settings_enabled
```

## Schritt 3: Real Device WDIO Configuration

```javascript
// config/wdio.real-device.js
capabilities: [{
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',
    'appium:deviceName': 'Real Pixel 8a',
    'appium:udid': '[DEVICE_ID]', // Aus adb devices
    'appium:newCommandTimeout': 240,
    'appium:appPackage': 'com.geberit.home',
    'appium:appActivity': '.MainActivity'
}]
```

## Fehlerbehebung:

### Falls "unauthorized" angezeigt wird:
1. **USB-Debugging Berechtigung** auf dem Handy bestätigen
2. **RSA-Key akzeptieren** im Popup
3. **"Immer von diesem Computer erlauben"** anhaken

### Falls "no devices" angezeigt wird:
1. **USB-Kabel** prüfen (Daten-Kabel, nicht nur Laden)
2. **USB-Modus** auf dem Handy auf "Dateiübertragung" stellen
3. **ADB Server neustarten**:
   ```bash
   adb kill-server
   adb start-server
   adb devices
   ```

### Windows-spezifische Checks:
```bash
# USB-Geräte in Device Manager prüfen
Get-PnpDevice | Where-Object {$_.FriendlyName -like "*Android*"}
```

## Nächster Schritt:
Sobald `adb devices` dein Pixel 8a als "device" zeigt, können wir die Real Device Tests starten!