ICHZ# Credentials Fix - Finale Lösung

## Problem
EAS findet keine Credentials für dieses Projekt, obwohl Apple ID verifiziert ist.

## Lösung: Credentials explizit für dieses Projekt setzen

**Führe diesen Command in einem Terminal aus:**

```powershell
cd C:\Users\selin\OneDrive\Desktop\wetax\wetax_cb\Wetax-master
eas credentials --platform ios --profile development-adeola
```

**Oder ohne Profil (für alle):**
```powershell
eas credentials --platform ios
```

**Bei den Prompts:**
1. "Which build profile do you want to configure?" → Wähle `development-adeola`
2. "Do you want to log in to your Apple account?" → **`y`**
3. Gib deine Apple ID ein (falls nochmal gefragt)
4. Credentials werden dann für dieses Projekt gespeichert

**Nach erfolgreichem Setup:**
```powershell
eas build --profile development-adeola --platform ios --auto-submit
```

**Das sollte dann funktionieren!**

---

## Warum das nötig ist:
- Credentials sind pro Projekt/Bundle ID gespeichert
- Auch wenn Apple ID verifiziert ist, müssen Credentials für jedes Projekt explizit gesetzt werden
- Nach einmaligem Setup funktionieren alle zukünftigen Builds automatisch




