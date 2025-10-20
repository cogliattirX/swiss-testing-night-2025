# 🔧 Pixel 8a USB Debugging Troubleshooting

## Problem: Pixel 8a wird nicht von ADB erkannt

### Status: ✅ USB angeschlossen, ✅ Debugging aktiviert, ❓ Kein Popup

## Lösungsschritte:

### 1. **USB-Verbindungsmodus prüfen**
Auf dem Pixel 8a:
- **Benachrichtigungsleiste** nach unten ziehen
- **USB-Verbindungsnotifikation** antippen
- **Modus wechseln zu**: "Dateiübertragung/Android Auto" oder "PTP"

### 2. **Entwickleroptionen erneut prüfen**
Einstellungen → System → Entwickleroptionen:
- ✅ **"USB-Debugging"** eingeschaltet
- ✅ **"Entwickleroptionen"** aktiviert
- 🔄 **"USB-Debugging widerrufen"** antippen → "OK"
- 🔄 **USB-Debugging erneut aktivieren**

### 3. **USB-Kabel testen**
- **Anderes USB-Kabel** verwenden (manche Kabel sind nur zum Laden)
- **Anderer USB-Port** am Laptop
- **USB-C zu USB-A Adapter** falls nötig

### 4. **Windows-spezifische Schritte**
```powershell
# Google USB Driver installieren (falls noch nicht geschehen)
# Android Studio → SDK Manager → SDK Tools → Google USB Driver

# Device Manager öffnen und nach unbekannten Geräten suchen
devmgmt.msc
```

### 5. **Phone Troubleshooting**
Auf dem Pixel 8a:
```
Einstellungen → Apps → Android System WebView → Speicher → Cache löschen
Einstellungen → Apps → Google Play-Dienste → Speicher → Cache löschen
```

### 6. **Alternative: Wireless ADB (falls USB nicht funktioniert)**
```bash
# Erst über USB, dann wireless
adb tcpip 5555
adb connect [HANDY_IP]:5555
```

### 7. **Debug-Commands zum Testen**
```bash
# ADB Server Status
adb version

# Alle ADB Prozesse killen
taskkill /f /im adb.exe

# ADB mit erweiterten Logs
adb devices -l
```

## Was sollte passieren:
Wenn erfolgreich: `adb devices` zeigt:
```
List of devices attached
[DEVICE_ID]    device
```

## Nächster Schritt:
**Kannst du bitte folgendes probieren:**
1. USB-Verbindungsmodus auf "Dateiübertragung" ändern
2. USB-Debugging aus- und wieder einschalten
3. `adb devices` erneut ausführen

Falls immer noch nicht erkannt: Anderes USB-Kabel probieren! 🔌