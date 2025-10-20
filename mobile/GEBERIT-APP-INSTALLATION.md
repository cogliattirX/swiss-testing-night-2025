# 🚀 Geberit Home App Installation Guide

## Methode 1: Google Play Store im Emulator (Empfohlen)

### Schritt 1: Play Store öffnen
```bash
adb shell "am start -a android.intent.action.MAIN -c android.intent.category.LAUNCHER -n com.android.vending/.AssetBrowserActivity"
```

### Schritt 2: Geberit Home suchen
- Im Emulator: Play Store öffnen
- Suche nach "Geberit Home"
- App installieren (kostenlos)

### Schritt 3: Installation verifizieren
```bash
adb shell "pm list packages | grep geberit"
```

## Methode 2: APK-Installation (Alternative)

### APK-Download-Probleme:
- APKPure: Cloudflare-Schutz
- APKMirror: App nicht verfügbar
- APKFab: Cloudflare-Schutz

### Lösungsansätze:
1. **Browser-Download**: APK manuell mit Browser herunterladen
2. **Play Store API**: Über Google Play Developer API
3. **Alternative Test-App**: Für Demo-Zwecke

## Methode 3: Test mit vorhandener App

Da Geberit Home möglicherweise nicht verfügbar ist, teste ich mit einer Standard-Android-App:

```bash
# Chrome Browser testen
adb shell "pm list packages | grep chrome"

# Calculator App testen
adb shell "pm list packages | grep calculator"

# Settings App testen (immer verfügbar)
adb shell "am start -n com.android.settings/.Settings"
```

## Nächste Schritte

1. ✅ Emulator läuft und ist automatisierbar
2. 🔄 App-Installation über Play Store
3. 🔄 Package-Name ermitteln: `com.geberit.home`
4. 🔄 Main Activity detektieren
5. 🔄 WebDriverIO-Konfiguration anpassen
6. 🔄 Test-Suite erstellen

## Empfehlung

**Verwende den Google Play Store im Emulator für echte App-Installation:**
1. Öffne Emulator (sollte bereits laufen)
2. Öffne Play Store
3. Suche "Geberit Home"
4. Installiere App
5. Teste mit unserem Framework

Das ist der zuverlässigste Weg für echte App-Tests!