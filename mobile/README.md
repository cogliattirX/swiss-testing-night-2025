# 📱 Geberit Home - Mobile Testing Framework

Dieses mobile Testing-Framework ermöglicht automatisierte Tests der **Geberit Home Android App** unter Verwendung von WebDriverIO, Appium und TypeScript.

## 🎯 Überblick

Das Framework testet die bereits installierte Geberit Home App (über Play Store) auf einem realen Android-Gerät (Pixel 8a) ohne APK-Installation. Die Tests nutzen moderne TypeScript-Patterns und defensive Timeouts für stabile Ausführung.

## 📋 Voraussetzungen

### 🛠️ Software-Anforderungen

| Tool | Version | Beschreibung |
|------|---------|--------------|
| **Node.js** | 20.x LTS | JavaScript Runtime (empfohlen: 20.15.0+) |
| **Java** | 17+ | Für Android SDK und Appium |
| **Android SDK** | Latest | Platform Tools für ADB |
| **Appium** | 3.x | Mobile Automation Server (empfohlen: 3.0.0+) |
| **UiAutomator2** | 5.x+ | Android Automation Driver |

### 📱 Hardware-Anforderungen

- **Android-Gerät**: Pixel 8a (oder ähnlich)
- **USB-Debugging**: Aktiviert
- **Entwickler-Optionen**: Aktiviert
- **Geberit Home App**: Über Play Store installiert

### ⚙️ Warum diese Versionen?

- **Node 20 LTS**: Stabile TypeScript-Unterstützung und native ES Modules
- **Appium 3.x**: Neueste Architektur mit verbesserter Plugin-Unterstützung
- **UiAutomator2**: Muss zwingend für moderne Android-Geräte (API 21+) verwendet werden
- **TypeScript**: Bessere IDE-Unterstützung und Fehlerprävention

## 🚀 Einmalige Einrichtung

### 1. Globale Tools installieren

```powershell
# Appium global installieren
npm install -g appium

# UiAutomator2 Driver installieren (WICHTIG für Android)
appium driver install uiautomator2

# Überprüfen der Installation
appium driver list
appium -v
```

### 2. Android-Gerät vorbereiten

```powershell
# USB-Debugging testen
adb devices
# Ergebnis sollte sein: [DEVICE_ID]    device (NICHT unauthorized)

# Bei 'unauthorized': USB-Debugging Dialog am Handy bestätigen
# Bei 'no devices': USB-Kabel/Verbindung prüfen
```

### 3. App Activity ermitteln

**WICHTIG**: Diese Activity muss in `config/wdio.local.android.ts` eingetragen werden!

```powershell
# Hauptmethode: Activity per ADB ermitteln
adb shell "cmd package resolve-activity --brief com.geberit.home | tail -n 1"

# Alternative Methode (falls erste nicht funktioniert):
adb shell dumpsys package com.geberit.home | findstr -i MAIN

# Beispiel-Ergebnis: com.geberit.home/.ui.MainActivity
# Dann eintragen: 'appium:appActivity': '.ui.MainActivity'
```

### 4. UDID setzen (optional)

```powershell
# Device ID automatisch ermitteln und setzen
$env:ANDROID_UDID = (adb devices | Select-String -Pattern "^\w+" | Select-Object -First 1).Matches.Value

# Oder manuell setzen:
$env:ANDROID_UDID = "1A051FDF600478"  # Ihre Device ID hier eintragen
```

## 📁 Projekt-Setup

### 1. Dependencies installieren

```powershell
cd mobile
npm install
```

### 2. Activity konfigurieren

Öffnen Sie `config/wdio.local.android.ts` und ersetzen Sie:

```typescript
'appium:appActivity': '<TO_BE_FILLED>'
```

mit der ermittelten Activity, z.B.:

```typescript
'appium:appActivity': '.ui.MainActivity'  // Ohne com.geberit.home Prefix
```

### 3. Ersten Test ausführen

```powershell
# Test starten
npm run dev

# Mit Debug-Output
npm run test:debug
```

## 🚀 Schnellstart (Copy & Paste)

### Für echtes Gerät (Pixel 8a):
```powershell
# Schritt 1: Globale Tools
npm install -g appium
appium driver install uiautomator2

# Schritt 2: Device prüfen
adb devices

# Schritt 3: Activity ermitteln und notieren
adb shell "cmd package resolve-activity --brief com.geberit.home | tail -n 1"

# Schritt 4: Projekt installieren
cd mobile
npm install

# Schritt 5: Umgebung prüfen
npm run check:env

# Schritt 6: Activity in config/wdio.local.android.ts eintragen
# Schritt 7: Test starten
npm run dev
```

### Für Android Emulator:
```powershell
# Schritt 1: Android Studio installieren (falls noch nicht geschehen)
# Schritt 2: Projekt setup
cd mobile
npm install

# Schritt 3: Emulator erstellen
npm run setup:emulator

# Schritt 4: Geberit Home app im Emulator installieren (über Play Store)
# Schritt 5: Activity ermitteln
adb shell "cmd package resolve-activity --brief com.geberit.home | tail -n 1"

# Schritt 6: Activity in config/wdio.emulator.android.ts eintragen
# Schritt 7: Emulator-Test starten
npm run test:emulator
```

## 📝 Verfügbare Scripts

```powershell
# Real Device Testing
npm run dev              # Standard Test auf echtem Gerät
npm run test             # Gleich wie dev
npm run test:debug       # Mit Debug-Ausgabe

# Emulator Testing
npm run test:emulator         # Test auf Android Emulator
npm run test:emulator:debug   # Emulator mit Debug-Ausgabe
npm run setup:emulator        # Emulator erstellen und konfigurieren

# Environment & Maintenance
npm run check:env        # Umgebung und Setup überprüfen
npm run lint             # Code-Qualität prüfen
npm run lint:fix         # Code automatisch formatieren
npm run clean            # Reports und Screenshots löschen
```

## 🧪 Test-Struktur

### Smoke Test (`test/specs/smoke.home.spec.ts`)

Der Grundtest überprüft:

1. ✅ **App Launch**: Erfolgreiche App-Öffnung
2. ✅ **Package Verification**: Korrekte App (com.geberit.home)
3. ✅ **UI Responsiveness**: App reagiert auf Befehle
4. ✅ **Screenshot Capture**: Visueller Nachweis
5. ✅ **Performance Check**: Antwortzeiten < 5 Sekunden

### Test-Ausgaben

- **Screenshots**: `screenshots/geberit-home-launch-[datum].png`
- **Failure Screenshots**: `screenshots/failure-[test]-[timestamp].png`
- **Test Reports**: `reports/results-[id].xml` (JUnit Format)
- **Page Sources**: `reports/geberit-home-source-[timestamp].xml`

## 📱 Android Emulator Setup

### Automatisches Setup

Das Framework erstellt automatisch einen Pixel 8a Emulator:

```powershell
npm run setup:emulator
```

**Was passiert:**
1. ✅ Prüft Android SDK Installation
2. ✅ Installiert Android 14 (API 34) System Image
3. ✅ Erstellt AVD "Pixel_8a_API_34" mit optimierten Einstellungen
4. ✅ Startet Emulator zum Test
5. ✅ Konfiguriert Performance-Optimierungen

### Emulator-spezifische Features

- **Längere Timeouts**: 3-5 Minuten für Emulator-Startup
- **Auto-Wipe**: Sauberer Zustand bei jedem Test
- **Performance-Optimierungen**: GPU-Acceleration, reduzierte Animations
- **Erweiterte Logs**: Detaillierte Debug-Informationen

### Emulator vs. Real Device

| Feature | Real Device (Pixel 8a) | Android Emulator |
|---------|------------------------|------------------|
| **Geschwindigkeit** | ⚡ Sehr schnell | 🐌 Langsamer |
| **Stabilität** | ✅ Sehr stabil | ⚠️ Kann variieren |
| **Setup** | 📱 USB + App | 💻 Vollautomatisch |
| **CI/CD** | ❌ Schwierig | ✅ Ideal |
| **Debugging** | 🔍 Hardware-nah | 🛠️ Vollzugriff |
| **Parallelisierung** | ❌ Ein Gerät | ✅ Mehrere AVDs |

### Wann welche Option wählen?

**Real Device (Pixel 8a)** für:
- 🚀 Schnelle lokale Entwicklung
- 📱 Hardware-spezifische Tests
- 🔋 Performance-kritische Tests
- 📸 Kamera/Sensor-Tests

**Android Emulator** für:
- 🤖 CI/CD Pipelines
- 🧪 Regressionstests
- 🔄 Automatisierte Nightly Builds
- 👥 Team-Entwicklung ohne Hardware

## 🔧 Konfiguration

### WebDriverIO Capabilities

```typescript
capabilities: [{
    platformName: 'Android',
    'appium:automationName': 'UiAutomator2',    // MUSS UiAutomator2 sein
    'appium:udid': process.env.ANDROID_UDID,   // Auto-detect wenn nicht gesetzt
    'appium:appPackage': 'com.geberit.home',   // Play Store App
    'appium:appActivity': '.ui.MainActivity',   // Ihre ermittelte Activity
    'appium:noReset': true,                    // App nicht zurücksetzen
    'appium:newCommandTimeout': 240,           // 4 Min Timeout
    'appium:autoGrantPermissions': true        // Permissions automatisch
}]
```

### Timeouts & Stabilität

```typescript
// Global timeouts (in config)
waitforTimeout: 30000,           // 30s Standard-Wait
connectionRetryTimeout: 120000,  // 2 Min Connection-Retry
mochaOpts: { timeout: 120000 }   // 2 Min pro Test

// Browser timeouts (in before hook)
implicit: 15000,    // Element-Finding
script: 60000,      // Script-Execution
pageLoad: 60000     // Page-Load
```

## 🚨 Troubleshooting

### Problem: `adb devices` zeigt `unauthorized`

**Lösung:**
```powershell
# 1. USB-Debugging Dialog am Handy bestätigen
# 2. RSA-Schlüssel dauerhaft speichern
# 3. ADB neu starten
adb kill-server
adb start-server
adb devices
```

### Problem: Kein Gerät gefunden

**Lösung:**
```powershell
# USB-Treiber prüfen
adb devices -l

# USB-Kabel wechseln (Daten-Kabel, nicht nur Laden)
# USB-Port wechseln (bevorzugt USB 3.0)
# Windows: Geräte-Manager > Android Device prüfen
```

### Problem: Appium startet nicht

**Lösung:**
```powershell
# Port prüfen (Standard: 4723)
netstat -an | findstr 4723

# Appium manuell mit Debug starten
appium --log-level debug

# Appium vollständig neu installieren
npm uninstall -g appium
npm install -g appium
appium driver install uiautomator2
```

### Problem: App startet nicht

**Häufige Ursachen:**
1. **Falsche Activity**: Activity-Ermittlung wiederholen
2. **App nicht installiert**: Play Store Installation prüfen
3. **Permissions**: App manuell einmal öffnen
4. **Package Name**: `com.geberit.home` korrekt?

**Debug-Schritte:**
```powershell
# App-Installation prüfen
adb shell pm list packages | findstr geberit

# App manuell starten
adb shell am start -n com.geberit.home/.ui.MainActivity

# Aktuell laufende Activities anzeigen
adb shell "dumpsys activity activities | findstr -i 'geberit'"
```

### Problem: Tests laufen zu langsam

**Optimierungen:**
1. **Timeouts reduzieren** (für bekannte Umgebung)
2. **Parallele Tests vermeiden** (maxInstances: 1)
3. **Screenshots bei Erfolg deaktivieren**
4. **Implizite Waits optimieren**

## 🔄 CI/CD Integration (Vorbereitung)

### GitHub Actions (Konzept)

```yaml
# Zukünftige .github/workflows/mobile-tests.yml
name: Mobile Tests
on: [push, pull_request]

jobs:
  android-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      # Android Emulator Setup
      - name: Setup Android SDK
        uses: android-actions/setup-android@v3
      
      - name: Create AVD
        run: |
          avdmanager create avd -n test -k "system-images;android-30;google_apis;x86_64"
      
      # Appium & Tests
      - name: Install Appium
        run: |
          npm install -g appium
          appium driver install uiautomator2
      
      - name: Start Emulator & Run Tests
        run: |
          emulator -avd test -no-window &
          cd mobile && npm ci && npm test
```

### Erweiterte CI-Features

- **Matrix Testing**: Mehrere Android-Versionen
- **Artifact Upload**: Screenshots und Reports
- **Slack Notifications**: Bei Fehlern
- **Performance Monitoring**: Test-Zeiten verfolgen

## 📊 Metriken & Monitoring

### Test-Erfolg messen

```typescript
// In Tests eingebaute Metriken:
- Response Times: < 5000ms
- Screenshot Quality: File Size > 0
- Package Verification: 100% Match
- UI Element Detection: Success Rate
```

### Langzeit-Überwachung

- **Daily Smoke Tests**: Automatische Ausführung
- **Performance Trends**: Response Time Tracking
- **Device Compatibility**: Multi-Device Matrix
- **App Version Changes**: Regression Detection

## 📚 Nächste Schritte

### Kurzfristig (nach erfolgreichem Smoke Test)

1. **Login Flow Tests**: Benutzeranmeldung
2. **Navigation Tests**: App-Menü durchlaufen
3. **Form Interaction**: Eingabefelder testen
4. **Deep Linking**: URL-Handler testen

### Langfristig

1. **Page Object Pattern**: Wartbare Test-Struktur
2. **Test Data Management**: JSON-basierte Testdaten
3. **Visual Regression**: Screenshot-Vergleiche
4. **Performance Tests**: Memory/CPU Monitoring

## 💡 Tipps & Best Practices

### Entwicklung

- **Defensive Timeouts**: Lieber 1s länger warten als Test-Flakiness
- **Aussagekräftige Logs**: Jeder Step sollte Console-Output haben
- **Screenshot bei Failure**: Automatisch in afterEach Hook
- **Page Source Capture**: XML-Dump für Debugging

### Wartung

- **Regelmäßige Updates**: WDIO/Appium monatlich updaten
- **Device Farm**: Später auf Cloud-Devices erweitern
- **Test Parallelization**: Einzelne Features isoliert testen
- **Monitoring**: Appium-Server Health Checks

---

## 📞 Support

Bei Problemen:

1. **Logs prüfen**: `reports/` Ordner nach Fehlermeldungen durchsuchen
2. **Device Status**: `adb devices` und `adb logcat` für Live-Debugging
3. **Appium Status**: `appium doctor` für System-Validation
4. **Community**: WebDriverIO Discord für spezifische Fragen

**Happy Testing! 🚀**