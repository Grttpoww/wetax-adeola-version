# Tax Return Final Screens - User Flow Dokumentation

**Datum:** 2025-01-27  
**Zweck:** Dokumentation der letzten Screens vom letzten Tax Screen bis zur Einreichung

---

## Übersicht: Die letzten 4 Screens im Flow

Der User durchläuft am Ende des Tax Return Flows folgende Screens in dieser Reihenfolge:

1. **Übersicht** (Category Overview)
2. **Personalien** (Personendaten Formular)
3. **Rückzahlung Bank** (Bankdaten Formular)
4. **Generate PDF** (Download Screen - PDF & XML)

---

## Screen 1: Übersicht (endOverviewScreen)

### Was der User sieht:
- **Titel:** "Übersicht"
- **Typ:** Category Overview Screen
- **Kategorie:** `ScreenCategoryEnum.Uebersicht`
- **Icon:** Mail Icon (Entypo)

### Inhalt:
- Liste von Segmenten/Unterkategorien, die in dieser Kategorie verfügbar sind
- Jedes Segment zeigt:
  - Segment-Name (Text)
  - Status-Icon:
    - ✅ Grüner Checkmark (Ionicons "checkmark-circle") wenn `isDone === true`
    - ⚠️ Graues Ausrufezeichen (AntDesign "exclamation-circle") wenn nicht erledigt
  - Rechts-Pfeil (Octicons "chevron-right") zum Navigieren

### Buttons:
- **"Start" Button** (unten, blau, #1d2dba)
  - Navigiert zum nächsten Screen
  - Text: "Start"
  - Stil: 50px Höhe, abgerundete Ecken (borderRadius: 30)

### Navigation:
- **Zurück:** Vorheriger Screen im Flow
- **Weiter/Start:** Navigiert zum nächsten Screen (Personalien)

### Code-Quellen:
- **Definition:** `Wetax-master/src/view/authenticated/taxReturn/screens.ts` (Zeile 1656-1660)
- **Template:** `Wetax-master/src/view/authenticated/taxReturn/screenTemplates/Category.template.tsx`
- **Enum:** `ScreenEnum.Uebersicht` in `enums.ts` (Zeile 86)
- **Kategorie-Mapping:** `constants.tsx` (Zeile 254, 345)

---

## Screen 2: Personalien (personalienScreen)

### Was der User sieht:
- **Titel:** "Personalien Überprüfen"
- **Typ:** ObjForm (Objekt-Formular)
- **Data Key:** `personData`

### Formular-Felder:
1. **Vorname** (TextInput, placeholder: "Vorname")
2. **Nachname** (TextInput, placeholder: "Nachname")
3. **Geburtsdatum** (TextInput, placeholder: "Geburtsdatum")
4. **Zivilstand** (TextInput, placeholder: "Zivilstand")
5. **Konfession** (SelectInput mit Optionen):
   - Reformiert
   - Römisch-katholisch
   - Christ-katholisch
   - Andere
   - Keine
6. **Gemeinde** (NumberSelectInput, placeholder: "Gemeinde auswählen")
   - Items werden dynamisch in `FormObj.template.tsx` geladen
7. **Beruf** (TextInput, placeholder: "Beruf")
8. **Adresse** (TextInput, placeholder: "Musterstrasse 30")
9. **PLZ** (NumberInput, placeholder: "Postleitzahl", keyboardType: "number-pad")
10. **Stadt** (TextInput, placeholder: "Zürich")
11. **E-Mail** (TextInput, placeholder: "E-Mail", keyboardType: "email-address")

### Validierung (isDone):
Der Screen gilt als erledigt, wenn ALLE folgenden Felder ausgefüllt sind:
- vorname
- nachname
- geburtsdatum
- zivilstand
- konfession
- gemeindeBfsNumber
- beruf
- adresse
- plz
- stadt
- email

### Navigation:
- **Zurück:** Zur Übersicht
- **Weiter:** Zum nächsten Screen (Rückzahlung Bank)
- Navigation Bar zeigt "Zurück" und "Weiter"/"Überspringen" Buttons

### Code-Quellen:
- **Definition:** `Wetax-master/src/view/authenticated/taxReturn/screens.ts` (Zeile 1424-1562)
- **Template:** `Wetax-master/src/view/authenticated/taxReturn/screenTemplates/FormObj.template.tsx`
- **Enum:** `ScreenEnum.Personalien` in `enums.ts` (Zeile 78)

---

## Screen 3: Rückzahlung Bank (rueckzahlungBankScreen)

### Was der User sieht:
- **Titel:** "Bankdaten Überprüfen"
- **Typ:** ObjForm (Objekt-Formular)
- **Data Key:** `rueckzahlungBank`
- **Help Text:** (leer)

### Formular-Felder:
1. **Nachname** (TextInput, placeholder: "Nachname")
2. **Vorname** (TextInput, placeholder: "Vorname")
3. **IBAN** (TextInput, placeholder: "IBAN")
   - autoCapitalize: "characters"
   - autoCorrect: false

### Validierung (isDone):
Der Screen gilt als erledigt, wenn ALLE folgenden Felder ausgefüllt sind:
- nachname
- vorname
- iban

### Navigation:
- **Zurück:** Zu Personalien
- **Weiter:** Zum letzten Screen (Generate PDF)
- Navigation Bar zeigt "Zurück" und "Weiter"/"Überspringen" Buttons

### Code-Quellen:
- **Definition:** `Wetax-master/src/view/authenticated/taxReturn/screens.ts` (Zeile 1564-1602)
- **Template:** `Wetax-master/src/view/authenticated/taxReturn/screenTemplates/FormObj.template.tsx`
- **Enum:** `ScreenEnum.RueckzahlungBank` in `enums.ts` (Zeile 79)

---

## Screen 4: Generate PDF (generateScreen) - FINAL SCREEN

### Was der User sieht:
- **Titel:** "Laden Sie Ihre Steuererklärung herunter"
- **Typ:** GeneratePdf
- **Help Text:** (optional, nicht definiert)

### Inhalt:

#### Zustand 1: Subscription wird geprüft
- **Button:** "Checking subscription..." (disabled, grau)
- Wird angezeigt während `isCheckingSubscription === true`

#### Zustand 2: Aktive Subscription vorhanden ✅
- **Button 1:** "PDF herunterladen"
  - Typ: Dark Button (blau, #1D2DBA)
  - Loading State: Zeigt Spinner wenn `isDownloading === true`
  - Disabled wenn: `isDownloading || isDownloadingXml`
  - Stil: borderRadius: 30, padding: 24
  
- **Button 2:** "XML herunterladen"
  - Typ: Dark Button (blau, #1D2DBA)
  - Loading State: Zeigt Spinner wenn `isDownloadingXml === true`
  - Disabled wenn: `isDownloading || isDownloadingXml`
  - Stil: borderRadius: 30, marginTop: 12
  
- **Text unter Buttons:**
  - "✓ Active Subscription - Download unlimited PDFs and XML"
  - Farbe: #2e7d32 (grün)
  - Text-Align: center
  - Font-Size: 14

#### Zustand 3: Keine aktive Subscription ❌
- **Button:** "Abonnieren und PDF herunterladen"
  - Typ: Dark Button (blau, #1D2DBA)
  - Öffnet Payment Modal
  - Disabled wenn: `isDownloading || isDownloadingXml`

### Payment Modal (wird geöffnet wenn keine Subscription):
- **Overlay:** Halbtransparentes schwarzes Overlay (rgba(0,0,0,0.5))
- **Modal Content:**
  - Titel: "Laden Sie Ihre Steuererklärung herunter"
  - Preis Container:
    - Label: "Preis"
    - Betrag: "CHF 39.90/year"
    - Stil: Grauer Hintergrund (#F5F5F5), blauer Rahmen (#1D2DBA)
  - Beschreibung:
    - "Laden Sie Ihre vollständige Steuererklärung als PDF herunter."
    - Features Liste:
      - ✓ Professionell formatiert
      - ✓ Bereit zur Einreichung
      - ✓ Sofortiger Download
  - **Buttons:**
    - "Jetzt bezahlen" (blau, #1D2DBA)
      - Zeigt "Verarbeitung..." während Payment
      - Disabled während Payment
    - "Abbrechen" (grau, #666)

### Flows die ausgelöst werden:

#### PDF Download Flow:
1. **Prüfung:** Subscription Status wird geprüft
2. **API Call:** `ApiService.generatePdf(taxReturn._id)`
   - Endpoint: `GET /api/v1/{taxReturnId}/generate-pdf`
   - Returns: `{ base64: string }`
3. **File Creation:**
   - Dateiname: `Steuererklaerung_{timestamp}.pdf`
   - Speicherort: 
     - iOS: `cacheDirectory`
     - Android: `documentDirectory`
   - Encoding: base64
4. **Sharing:**
   - **iOS:** Sharing Sheet (expo-sharing)
     - MimeType: `application/pdf`
     - UTI: `com.adobe.pdf`
   - **Android:** Intent Launcher oder Sharing
     - Intent: `android.intent.action.VIEW`
     - Type: `application/pdf`
5. **Error Handling:**
   - Alert bei Fehler: "Download Fehler - PDF konnte nicht heruntergeladen werden"

#### XML Download Flow:
1. **API Call:** Direct fetch (nicht über OpenAPI Client)
   - Endpoint: `GET /api/v1/tax-return/{taxReturnId}/export-ech0119`
   - Headers:
     - `x-access-token`: Token aus AsyncStorage
     - `Accept`: `application/xml`
2. **File Creation:**
   - Dateiname: Aus `Content-Disposition` Header oder Default: `steuererklärung-{year}.xml`
   - Speicherort: 
     - iOS: `cacheDirectory`
     - Android: `documentDirectory`
   - Encoding: utf8
3. **Sharing:**
   - **iOS:** Sharing Sheet
     - MimeType: `application/xml`
     - UTI: `public.xml`
   - **Android:** Intent Launcher oder Sharing
     - Intent: `android.intent.action.VIEW`
     - Type: `application/xml`
4. **Error Handling:**
   - Alert bei Fehler: "Download Fehler - XML konnte nicht heruntergeladen werden"

#### Payment Flow (wenn keine Subscription):
1. **Button Click:** "Abonnieren und PDF herunterladen"
2. **Modal öffnet:** Payment Modal wird angezeigt
3. **Purchase Request:**
   - `RNIap.requestPurchase(SUBSCRIPTION_SKU)`
   - SKU: 
     - iOS: `'wetax.subscription.yearly'`
     - Android: `'wetax_subscription_yearly'`
4. **Purchase Listener:**
   - `purchaseUpdatedListener` wird getriggert
   - Receipt wird an Server gesendet: `SubscriptionService.activateSubscription()`
   - Transaction wird abgeschlossen: `RNIap.finishTransaction()`
5. **Success:**
   - Alert: "Subscription activated successfully!"
   - Modal schließt
   - Subscription Status wird neu geladen
   - User kann jetzt PDF/XML herunterladen

### Navigation:
- **Zurück:** Zu Rückzahlung Bank Screen
- **Weiter:** KEIN weiterer Screen - dies ist der letzte Screen im Flow
- Navigation Bar zeigt nur "Zurück" Button (kein "Weiter")

### Code-Quellen:
- **Definition:** `Wetax-master/src/view/authenticated/taxReturn/screens.ts` (Zeile 1767-1771)
- **Template:** `Wetax-master/src/view/authenticated/taxReturn/screenTemplates/GeneratePdf.template.tsx`
- **Enum:** `ScreenEnum.GeneratePdf` in `enums.ts` (Zeile 80)
- **Screen Type:** `ScreenTypeEnum.GeneratePdf` in `enums.ts` (Zeile 99)
- **Delegator:** `ScreenTemplateDelegator.tsx` (Zeile 58-60) rendert `GeneratePdfTemplate`

---

## Screen Flow Reihenfolge (aus screens.ts)

Die Screens sind in dieser Reihenfolge im `SCREENS` Array definiert:

```typescript
// ... (viele andere Screens davor)
endOverviewScreen,        // Screen 1: Übersicht
personalienScreen,         // Screen 2: Personalien
rueckzahlungBankScreen,    // Screen 3: Rückzahlung Bank
generateScreen,            // Screen 4: Generate PDF (FINAL)
```

**Quelle:** `Wetax-master/src/view/authenticated/taxReturn/screens.ts` (Zeile 1864-1868)

---

## Navigation Struktur

### Screen Manager Context
- **File:** `Wetax-master/src/view/authenticated/taxReturn/context/ScreenManager.context.tsx`
- **Funktionen:**
  - `next()`: Navigiert zum nächsten Screen im Flow
  - `previous()`: Navigiert zum vorherigen Screen
  - `setScreen(screenName)`: Springt zu einem spezifischen Screen

### Navigation Bar
- **File:** `Wetax-master/src/view/authenticated/taxReturn/scaffold/NavigationBar.tsx`
- **Buttons:**
  - "Zurück" Button (links)
  - "Weiter" oder "Überspringen" Button (rechts)
    - Zeigt "Weiter" wenn Screen bereits Daten hat (`hasValue === true`)
    - Zeigt "Überspringen" wenn Screen noch keine Daten hat

---

## Wichtige Hinweise

1. **Keine Einreichung direkt in der App:**
   - Der User kann die Steuererklärung nur als PDF oder XML herunterladen
   - Es gibt KEINEN "Einreichen" Button oder direkten Submit-Flow
   - Die Einreichung muss manuell durch den User erfolgen (z.B. per Post oder Online-Portal)

2. **Subscription erforderlich:**
   - PDF Download erfordert aktive Subscription
   - XML Download erfordert KEINE Subscription (kann direkt heruntergeladen werden)
   - Subscription kostet CHF 39.90/Jahr

3. **Platform-spezifisches Verhalten:**
   - iOS: Verwendet Sharing Sheet für Downloads
   - Android: Verwendet Intent Launcher oder Sharing

4. **File Storage:**
   - iOS: Files werden in `cacheDirectory` gespeichert
   - Android: Files werden in `documentDirectory` gespeichert

---

## Zusammenfassung: User Journey

```
[Viele Tax Return Screens...]
    ↓
1. Übersicht Screen
   - Kategorie-Übersicht
   - "Start" Button → Weiter
    ↓
2. Personalien Screen
   - Formular: Vorname, Nachname, Geburtsdatum, etc.
   - "Weiter" Button → Weiter
    ↓
3. Rückzahlung Bank Screen
   - Formular: Nachname, Vorname, IBAN
   - "Weiter" Button → Weiter
    ↓
4. Generate PDF Screen (FINAL)
   - Mit Subscription:
     • "PDF herunterladen" Button → PDF Download
     • "XML herunterladen" Button → XML Download
   - Ohne Subscription:
     • "Abonnieren und PDF herunterladen" Button → Payment Modal
   - KEIN weiterer Screen - Flow endet hier
```

---

## Code-Quellen Übersicht

| Screen | Definition | Template | Enum |
|--------|-----------|----------|------|
| Übersicht | `screens.ts:1656` | `Category.template.tsx` | `ScreenEnum.Uebersicht` |
| Personalien | `screens.ts:1424` | `FormObj.template.tsx` | `ScreenEnum.Personalien` |
| Rückzahlung Bank | `screens.ts:1564` | `FormObj.template.tsx` | `ScreenEnum.RueckzahlungBank` |
| Generate PDF | `screens.ts:1767` | `GeneratePdf.template.tsx` | `ScreenEnum.GeneratePdf` |

**Navigation:**
- `ScreenManager.context.tsx` - Screen Navigation Logic
- `NavigationBar.tsx` - Zurück/Weiter Buttons
- `TaxReturnNavigator.tsx` - Stack Navigator Setup
- `ScreenTemplateDelegator.tsx` - Screen Rendering Delegation


