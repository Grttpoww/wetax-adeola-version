# Store vs Internal Distribution - Erklärung

## ✅ Was "store" bedeutet:

**`distribution: "store"`** = App Store Distribution
- ✅ **Kann für App Store Submission verwendet werden**
- ✅ **Kann für TestFlight verwendet werden** (TestFlight akzeptiert store builds)
- ✅ **Verwendet App Store Distribution Certificate**
- ✅ **Das ist korrekt für TestFlight!**

## ❌ Was "internal" bedeutet:

**`distribution: "internal"`** = Ad-Hoc Distribution
- ❌ **NUR für direkte Installation auf Geräten** (nicht über App Store/TestFlight)
- ❌ **Braucht UDIDs der Test-Geräte**
- ❌ **Kann NICHT zu TestFlight hochgeladen werden**
- ❌ **Braucht separate Credentials** (die fehlen wegen Apple Server Error)

## 📊 Vergleich:

| Distribution | App Store | TestFlight | Direkte Installation | Credentials Status |
|--------------|-----------|------------|---------------------|-------------------|
| **store** | ✅ Ja | ✅ Ja | ❌ Nein | ✅ Vorhanden |
| **internal** | ❌ Nein | ❌ Nein | ✅ Ja | ❌ Fehlen |

## ✅ Dein aktueller Build:

- **Distribution**: `store` ✅
- **Kann zu TestFlight hochgeladen werden**: ✅ Ja
- **Kann zum App Store**: ✅ Ja (aber du musst es nicht)
- **Credentials**: ✅ Vorhanden und funktionieren

## 🎯 Fazit:

**"store" ist KORREKT für TestFlight!**

- Du kannst den Build zu TestFlight hochladen
- Du musst ihn NICHT zum App Store releasen
- TestFlight akzeptiert store builds

**Der Build ist also korrekt konfiguriert!** ✅



