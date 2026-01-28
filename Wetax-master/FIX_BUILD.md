# Build Fix - Finale Lösung

## Problem
EAS fragt nach Apple-Credentials, aber Terminal kann nicht interaktiv antworten.

## Lösung: Credentials manuell setzen (EINMALIG)

**Führe diesen Command in einem NEUEN Terminal aus (nicht über Cursor):**

```powershell
cd C:\Users\selin\OneDrive\Desktop\wetax\wetax_cb\Wetax-master
eas credentials --platform ios
```

**Bei den Prompts:**
1. "Do you want to log in to your Apple account?" → **`y`**
2. Gib deine Apple ID ein
3. Gib dein Passwort ein (oder App-Specific Password bei 2FA)

**Nach erfolgreicher Credential-Konfiguration:**
```powershell
eas build --profile development-adeola --platform ios --auto-submit
```

**Das funktioniert dann automatisch ohne weitere Prompts!**

---

## Warum das funktioniert:
- Credentials werden einmalig auf dem EAS Server gespeichert
- Zukünftige Builds verwenden diese automatisch
- Keine interaktiven Prompts mehr nötig

---

**WICHTIG: Führe `eas credentials --platform ios` in einem normalen PowerShell-Terminal aus, nicht über Cursor!**



