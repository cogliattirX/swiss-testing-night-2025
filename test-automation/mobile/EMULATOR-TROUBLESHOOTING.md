# Android Emulator Troubleshooting Guide

## 🚨 Problem: Emulator startet, aber shuts down automatisch

### Beobachtete Symptome
- Emulator bootet erfolgreich mit vollständigen Log-Nachrichten
- "Successfully loaded snapshot 'default_boot'" wird angezeigt
- Intel Arc Graphics werden erkannt, aber mit OpenGL-Problemen
- Nach erfolgreichem Boot: "Wait for emulator (pid XXXXX) 20 seconds to shutdown gracefully"
- ADB kann das Gerät nicht erkennen (`adb devices` zeigt leere Liste)

### Identifizierte Ursachen

#### 1. Intel Arc Graphics Driver Kompatibilitätsprobleme
```
ERROR: Critical: Failed to load opengl32sw (Das angegebene Modul wurde nicht gefunden.)
WARNING: Software OpenGL failed. Falling back to system OpenGL.
```

#### 2. Hardware-Acceleration Konflikte
- Windows Hypervisor Platform (WHPX) läuft, aber GPU-Emulation schlägt fehl
- Software Rendering (SwiftShader) funktioniert teilweise, aber nicht stabil

#### 3. Snapshot/State Management Issues
```
WARNING: Not saving state: RAM not mapped as shared
```

### Versuchte Lösungsmethoden

#### ❌ Gescheiterte Ansätze:
1. **Standard Hardware GPU**: `-gpu host`
   - Intel Arc Graphics Kompatibilitätsprobleme
   
2. **Software Rendering**: `-gpu swiftshader_indirect`
   - Lädt, aber instabile Verbindung
   
3. **No Snapshot Modes**: `-no-snapshot-save`, `-no-snapshot`, `-writable-system`
   - Boot-Prozess funktioniert, aber Shutdown-Problem bleibt
   
4. **Boot Animation Disabled**: `-no-boot-anim`
   - Keine Verbesserung der Stabilität

### 🔧 Empfohlene Lösungsstrategien

#### Option A: Unterschiedliche GPU-Modi testen
```powershell
# Versuche diese GPU-Modi in Reihenfolge:
emulator -avd Pixel_8a_API_36 -gpu angle_indirect
emulator -avd Pixel_8a_API_36 -gpu mesa
emulator -avd Pixel_8a_API_36 -gpu off
```

#### Option B: Ältere API-Level verwenden
```powershell
# Erstelle AVD mit Android 28 (API 28) für bessere Kompatibilität
avdmanager create avd -n "Stable_API28" -k "system-images;android-28;google_apis;x86" -c 2048M
emulator -avd Stable_API28 -gpu swiftshader_indirect
```

#### Option C: Hardware-Beschleunigung deaktivieren
```powershell
emulator -avd Pixel_8a_API_36 -accel off -gpu off
```

#### Option D: Environment Variables setzen
```powershell
$env:ANDROID_EMULATOR_USE_SYSTEM_LIBS = 1
$env:QT_QPA_PLATFORM = "windows"
emulator -avd Pixel_8a_API_36
```

### 🔍 Diagnostik-Befehle

```powershell
# System-Info sammeln
Get-ComputerInfo | Select-Object CsProcessors, TotalPhysicalMemory
wmic path win32_VideoController get name

# Emulator-Info
emulator -list-avds
emulator -help-gpu
```

### 💡 Alternative Lösungsansätze

#### 1. Android Studio Device Manager verwenden
- Öffne Android Studio
- Tools > Device Manager
- Erstelle neues Virtual Device mit "Cold Boot"
- Teste verschiedene System Images

#### 2. Genymotion als Alternative
- Kommerzielle Alternative mit besserer Hardware-Kompatibilität
- Desktop-Version für persönliche Nutzung kostenlos

#### 3. Cloud-basierte Emulation
- Firebase Test Lab
- AWS Device Farm
- Sauce Labs Real Devices

### 📋 Nächste Schritte für unser Projekt

1. **Sofortige Lösung**: Real Device Testing aktivieren
   - USB Debugging Setup verbessern
   - Driver-Probleme lösen
   
2. **Mittelfristig**: Stable Emulator Configuration
   - API 28 mit x86 System Image testen
   - GPU-Rendering komplett deaktivieren
   
3. **Langfristig**: Cloud Testing Integration
   - Firebase Test Lab Setup
   - CI/CD Pipeline mit Cloud Devices

### 🎯 Praktische Empfehlung

**Für die heutige Demo/Workshop:**
1. Real Device Setup prioritisieren
2. USB-Verbindung troubleshooting 
3. Fallback: Browser-based Testing mit Chrome DevTools Mobile Emulation

Das mobile Testing Framework ist vollständig vorbereitet und kann sofort mit einem funktionierenden Device verwendet werden.