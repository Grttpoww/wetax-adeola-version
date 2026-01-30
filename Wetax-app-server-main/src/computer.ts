import {
  calculateEinkommenssteuerStaat,
  calculateMunicipalTax,
  calculateTaxMarried,
  calculateVermoegenssteuer,
  einkommenssteuerBundCalc,
} from './computeTaxes'
import { ComputedTaxReturnT, MunicipalityTaxRatesCache, TaxReturnData, wertschriftenEintrag } from './types'

// Helper function to get insurance premium limits based on marital status
function getVersicherungspraemienLimit(
  zivilstand: string | undefined,
  hasBeitraege: boolean,
  steuertyp: 'staat' | 'bund',
): number {
  const isMarried = zivilstand === 'verheiratet'
  
  if (steuertyp === 'staat') {
    if (isMarried) {
      return hasBeitraege ? 5800 : 8700 // Verdoppelt für Verheiratete
    } else {
      return hasBeitraege ? 2900 : 4350
    }
  } else {
    // bund
    if (isMarried) {
      return hasBeitraege ? 3600 : 5400 // Verdoppelt für Verheiratete
    } else {
      return hasBeitraege ? 1800 : 2700
    }
  }
}

// Helper function to get professional expenses limits (per person, not doubled)
function getBerufsauslagenLimit(zivilstand: string | undefined, typ: 'fahrkostenStaat' | 'fahrkostenBund' | 'verpflegung'): number {
  // Limits are per person, not doubled for married couples
  if (typ === 'fahrkostenStaat') return 5200
  if (typ === 'fahrkostenBund') return 3300 // ⚠️ CORRECTED from 3200
  if (typ === 'verpflegung') return 3200
  return 0
}

export const computeTaxReturn = (
  data: TaxReturnData,
  municipalityRatesCache: MunicipalityTaxRatesCache,
): ComputedTaxReturnT => {
  const zivilstand = data.personData?.data?.zivilstand
  const isMarried = zivilstand === 'verheiratet'

  // Liegenschaften: Nettoertrag und Vermögenssteuerwerte
  // Siehe Wegleitung tax-rules-zurich-2025.md:
  // - 2.6 Nettoertrag aus Liegenschaften
  // - 5.2 Liegenschaften (Vermögenssteuerwerte)
  // - 9.6.1 Pauschalabzug Liegenschaftsunterhalt (20% des Bruttomietertrags, nicht bei Geschäftsliegenschaften)
  let nettoertragLiegenschaften = 0
  let totalSteuerwertLiegenschaften = 0

  data.liegenschaften?.data?.forEach((l) => {
    const bruttoErtrag = l.eigenmietwertOderMietertrag ?? 0

    // Unterhaltskosten gemäss Wahl pauschal/effektiv
    let unterhalt = 0
    if (l.unterhaltArt === 'pauschal') {
      // Pauschalabzug: 20% des Bruttomietertrags (vgl. tax-rules-zurich-2025.md, Abschnitt 9.6.1)
      // Hinweis: Bei vorwiegend geschäftlicher Nutzung ist ein Pauschalabzug nicht zulässig.
      unterhalt = l.istGeschaeftlich ? 0 : bruttoErtrag * 0.2
    } else if (l.unterhaltArt === 'effektiv') {
      unterhalt = l.unterhaltBetrag ?? 0
    }

    nettoertragLiegenschaften += bruttoErtrag - unterhalt
    totalSteuerwertLiegenschaften += l.vermoegenssteuerwert ?? 0
  })

  // Separate income by person if married
  // Bisherige Logik basiert nur auf Erwerbseinkommen (geldVerdient).
  // Für die Gesamteinkünfte werden neu auch die Nettoerträge aus Liegenschaften einbezogen.
  let totalEinkuenfte: number
  let person1Income = 0
  let person2Income = 0
  let haupterwerb: number
  let nebenerwerb: number | undefined
  
  // Wertschriftenertrag (Einkommen Ziffer 4) - außerhalb if/else definiert
  let wertschriftenertragZinsen = 0
  let wertschriftenertragDividenden = 0
  let wertschriftenertragQualifizierteBeteiligungen = 0
  let freistellungsanteilQualifizierteBeteiligungenStaat = 0
  let freistellungsanteilQualifizierteBeteiligungenBund = 0
  let einkuenfteSozialversicherungTotal = 0
  let erwerbsausfallentschaedigungTotal = 0
  let lebensOderRentenversicherungTotal = 0
  let ertragGeschaeftsanteile = 0

  if (isMarried) {
    person1Income = data.geldVerdient.data
      .filter((v) => v.person === 1 || v.person === undefined)
      .reduce((acc, v) => acc + (v.nettolohn ?? 0), 0)

    person2Income = data.geldVerdient.data
      .filter((v) => v.person === 2)
      .reduce((acc, v) => acc + (v.nettolohn ?? 0), 0)

    const einkuenfteLohn = person1Income + person2Income
    haupterwerb = Math.max(person1Income, person2Income)
  } else {
    const einkuenfteLohn = data.geldVerdient.data.reduce((acc, v) => acc + (v.nettolohn ?? 0), 0)
    haupterwerb = data.geldVerdient.data.reduce((max, v) => {
      const currentNettolohn = v.nettolohn ?? 0
      return currentNettolohn > max ? currentNettolohn : max
    }, 0)
  }
  
  // Berechnung der Wertschriftenerträge (außerhalb if/else, da für beide Fälle gleich)
  wertschriftenertragZinsen = data.bankkonto?.data?.reduce((acc, v) => acc + (v.zinsbetrag ?? 0), 0) ?? 0
  wertschriftenertragDividenden = data.aktien?.data?.reduce((acc, v) => acc + (v.dividendenertrag ?? 0), 0) ?? 0
  
  // Qualifizierte Beteiligungen (mindestens 10%): Teilbesteuerung
  // Staat: 50% steuerbar, 50% Freistellung
  // Bund: 70% steuerbar, 30% Freistellung
  data.aktien?.data?.forEach((aktie) => {
    if (aktie.istQualifizierteBeteiligung && aktie.dividendenertrag) {
      const bruttoertrag = aktie.dividendenertrag
      wertschriftenertragQualifizierteBeteiligungen += bruttoertrag
      freistellungsanteilQualifizierteBeteiligungenStaat += bruttoertrag * 0.5 // 50% Freistellung
      freistellungsanteilQualifizierteBeteiligungenBund += bruttoertrag * 0.3 // 30% Freistellung
    }
  })
  
  // Geschäfts- und Korporationsanteile (Einkommen Ziffer 5.3)
  ertragGeschaeftsanteile = data.geschaeftsOderKorporationsanteile?.data?.reduce((acc, v) => acc + (v.ertrag ?? 0), 0) ?? 0
  
  // Sozialversicherungen/Leibrenten (Einkommen Ziffer 3)
  // Berechne steuerbare Beträge für Sozialversicherungseinkünfte automatisch
  data.einkuenfteSozialversicherung?.data?.forEach((einkunft) => {
    if (!einkunft.gesamtbetrag) return
    
    let steuerbarerBetrag = 0
    
    switch (einkunft.art) {
      case 'ahvIvRente':
      case 'saeule3a':
      case 'arbeitgeberRente':
      case 'militarversicherung':
      case 'sonstige':
        // Immer 100% steuerbar
        steuerbarerBetrag = einkunft.gesamtbetrag
        break
        
      case 'pensionskasse':
        // 80% oder 100% gemäss Wegleitung
        const rentenbeginn = einkunft.rentenbeginn
        const eigenbeitraegeProzent = einkunft.eigenbeitraegeProzent ?? 0
        const vorsorgeverhaeltnisBereits1985 = einkunft.vorsorgeverhaeltnisBereits1985 ?? false
        
        // Prüfe Bedingungen für 80%
        let is80Percent = false
        if (rentenbeginn) {
          const [year, month, day] = rentenbeginn.split('.').map(Number)
          const rentenbeginnDate = new Date(year, month - 1, day)
          const cutOff1987 = new Date(1987, 0, 1) // 1.1.1987
          const cutOff2001 = new Date(2001, 11, 31) // 31.12.2001
          const cutOff1985 = new Date(1985, 11, 31) // 31.12.1985
          
          // Rentenbeginn vor 1.1.1987 und Eigenbeiträge ≥20%
          if (rentenbeginnDate < cutOff1987 && eigenbeitraegeProzent >= 20) {
            is80Percent = true
          }
          // Rentenbeginn 1.1.1987-31.12.2001, Vorsorgeverhältnis bereits 31.12.1985 bestanden, Eigenbeiträge ≥20%
          else if (
            rentenbeginnDate >= cutOff1987 &&
            rentenbeginnDate <= cutOff2001 &&
            vorsorgeverhaeltnisBereits1985 &&
            eigenbeitraegeProzent >= 20
          ) {
            is80Percent = true
          }
        }
        
        steuerbarerBetrag = is80Percent ? einkunft.gesamtbetrag * 0.8 : einkunft.gesamtbetrag
        break
        
      case 'suva':
        // 60% / 80% / 100% gemäss Unfalldatum & Prämien
        const unfalldatum = einkunft.unfalldatum
        const praemienVomVersicherten = einkunft.praemienVomVersicherten ?? 0
        
        if (unfalldatum) {
          const [year, month, day] = unfalldatum.split('.').map(Number)
          const unfalldatumDate = new Date(year, month - 1, day)
          const cutOff1986 = new Date(1986, 0, 1) // 1.1.1986
          
          if (unfalldatumDate < cutOff1986) {
            // Nichtberufsunfall vor 1.1.1986
            if (praemienVomVersicherten === 100) {
              steuerbarerBetrag = einkunft.gesamtbetrag * 0.6 // 60%
            } else if (praemienVomVersicherten >= 20) {
              steuerbarerBetrag = einkunft.gesamtbetrag * 0.8 // 80%
            } else {
              steuerbarerBetrag = einkunft.gesamtbetrag // 100%
            }
          } else {
            steuerbarerBetrag = einkunft.gesamtbetrag // 100%
          }
        } else {
          steuerbarerBetrag = einkunft.gesamtbetrag // 100% (Fallback)
        }
        break
        
      case 'leibrente':
        // Ertragsanteil gemäss ESTV-Berechnungssatz
        const berechnungssatz = einkunft.leibrenteBerechnungssatz ?? 0
        steuerbarerBetrag = einkunft.gesamtbetrag * (berechnungssatz / 100)
        break
        
      default:
        // Fallback: 100%
        steuerbarerBetrag = einkunft.gesamtbetrag
    }
    
    // Aktualisiere steuerbarerBetrag im Datenobjekt (falls noch nicht gesetzt)
    if (einkunft.steuerbarerBetrag === undefined) {
      einkunft.steuerbarerBetrag = steuerbarerBetrag
    }
    
    einkuenfteSozialversicherungTotal += steuerbarerBetrag
  })
  
  // Erwerbsausfallentschädigungen (Einkommen Ziffer 3.3)
  erwerbsausfallentschaedigungTotal = data.erwerbsausfallentschaedigung?.data?.reduce((acc, v) => acc + (v.betrag ?? 0), 0) ?? 0
  
  // Lebens- und Rentenversicherungen (Einkommen Ziffer 3)
  data.lebensOderRentenversicherung?.data?.forEach((versicherung) => {
    if (!versicherung.gesamtbetrag) return
    
    let steuerbarerBetrag = 0
    
    switch (versicherung.art) {
      case 'lebensversicherung':
      case 'rentenversicherung':
        // Immer 100% steuerbar (gemäss Wegleitung)
        steuerbarerBetrag = versicherung.gesamtbetrag
        break
        
      case 'leibrente':
        // Ertragsanteil gemäss ESTV-Berechnungssatz
        const berechnungssatz = versicherung.leibrenteBerechnungssatz ?? 0
        steuerbarerBetrag = versicherung.gesamtbetrag * (berechnungssatz / 100)
        break
        
      default:
        // Fallback: 100%
        steuerbarerBetrag = versicherung.gesamtbetrag
    }
    
    // Aktualisiere steuerbarerBetrag im Datenobjekt (falls noch nicht gesetzt)
    if (versicherung.steuerbarerBetrag === undefined) {
      versicherung.steuerbarerBetrag = steuerbarerBetrag
    }
    
    lebensOderRentenversicherungTotal += steuerbarerBetrag
  })
  
  // Gesamte Einkünfte aus Wertschriften (nur steuerbarer Anteil)
  const wertschriftenertragSteuerbar = wertschriftenertragZinsen + 
    wertschriftenertragDividenden + 
    (wertschriftenertragQualifizierteBeteiligungen * 0.5) // Nur 50% steuerbar bei qualifizierten Beteiligungen
  
  // Berechne totalEinkuenfte mit allen neuen Einkünften
  const einkuenfteLohn = isMarried ? person1Income + person2Income : data.geldVerdient.data.reduce((acc, v) => acc + (v.nettolohn ?? 0), 0)
  totalEinkuenfte = einkuenfteLohn + 
    nettoertragLiegenschaften + wertschriftenertragSteuerbar + 
    einkuenfteSozialversicherungTotal + erwerbsausfallentschaedigungTotal + 
    lebensOderRentenversicherungTotal + ertragGeschaeftsanteile
  
  // Nebenerwerb = Gesamteinkünfte - Haupterwerb
  nebenerwerb = totalEinkuenfte - haupterwerb
  
  // Ausbildung: Separate by person if married
  let totalAusbildungsKosten: number
  let person1AusbildungKosten = 0
  let person2AusbildungKosten = 0
  let selbstgetrageneKostenAusbildung: number
  
  if (isMarried) {
    person1AusbildungKosten = data.inAusbildung.data
      .filter((v) => v.person === 1 || v.person === undefined)
      .reduce((acc, v) => acc + (v.betrag ?? 0), 0)
    
    person2AusbildungKosten = data.inAusbildung.data
      .filter((v) => v.person === 2)
      .reduce((acc, v) => acc + (v.betrag ?? 0), 0)
    
    totalAusbildungsKosten = person1AusbildungKosten + person2AusbildungKosten
    
    const paidByEmployer = data.beitragArbeitgeberAusbildung?.data?.betragArbeitGeber ?? 0
    // Assume employer contribution applies to person 1
    selbstgetrageneKostenAusbildung = totalAusbildungsKosten - paidByEmployer
  } else {
    totalAusbildungsKosten = data.inAusbildung.data.reduce((acc, v) => acc + (v.betrag ?? 0), 0)
    selbstgetrageneKostenAusbildung =
      totalAusbildungsKosten - (data.beitragArbeitgeberAusbildung?.data?.betragArbeitGeber ?? 0)
  }
  
  // VeloArbeit: Separate by person if married
  const veloArbeitPerson1 = data?.veloArbeit?.start ? 700 : 0
  const veloArbeitPerson2 = isMarried && data?.veloArbeit?.data?.partner2VeloArbeit ? 700 : 0
  const veloArbeit = veloArbeitPerson1 + veloArbeitPerson2 > 0 ? veloArbeitPerson1 + veloArbeitPerson2 : undefined
  
  // AutoMotorradArbeitWege: Calculate per person
  const anzahlKmProJahr1 =
    (data.autoMotorradArbeitWege?.data[0]?.anzahlArbeitstage ?? 0) *
    (data.autoMotorradArbeitWege?.data[0]?.anzahlKm ?? 0) *
    (data.autoMotorradArbeitWege?.data[0]?.fahrtenProTag ?? 0)
  const anzahlKmProJahr2 =
    (data.autoMotorradArbeitWege?.data[1]?.anzahlArbeitstage ?? 0) *
    (data.autoMotorradArbeitWege?.data[1]?.anzahlKm ?? 0) *
    (data.autoMotorradArbeitWege?.data[1]?.fahrtenProTag ?? 0)
  const totalAbzug1 = anzahlKmProJahr1 * (data.autoMotorradArbeitWege?.data[0]?.rappenProKm ?? 0) * 0.01
  const totalAbzug2 = anzahlKmProJahr2 * (data.autoMotorradArbeitWege?.data[1]?.rappenProKm ?? 0) * 0.01
  const autoMotorradArbeitTotal = totalAbzug1 + totalAbzug2
  
  // ÖV Arbeit: Separate by person if married
  const oevKostenPerson1 = data.oevArbeit?.data?.kosten ?? 0
  const oevKostenPerson2 = isMarried ? (data.oevArbeit?.data?.partner2Kosten ?? 0) : 0
  const oevKostenTotal = oevKostenPerson1 + oevKostenPerson2
  
  // Fahrkosten Limits (per person, not doubled)
  // WICHTIG: Auto/Motorrad ist NICHT in Berufsauslagen (nur im Vermögen als Freizeitauto)
  // Nur ÖV + Velo zählen als Fahrtkosten in Berufsauslagen
  const fahrkostenLimitStaat = getBerufsauslagenLimit(zivilstand, 'fahrkostenStaat')
  const fahrkostenLimitBund = getBerufsauslagenLimit(zivilstand, 'fahrkostenBund')
  
  // Fahrkosten NUR ÖV + Velo (KEIN Auto)
  const arbeitswegPerson1Staat = Math.min(
    oevKostenPerson1 + veloArbeitPerson1,
    fahrkostenLimitStaat,
  )
  const arbeitswegPerson2Staat = isMarried
    ? Math.min(oevKostenPerson2 + veloArbeitPerson2, fahrkostenLimitStaat)
    : 0
  const arbeitswegTotalStaat = arbeitswegPerson1Staat + arbeitswegPerson2Staat
  
  const arbeitswegPerson1Bund = Math.min(
    oevKostenPerson1 + veloArbeitPerson1,
    fahrkostenLimitBund,
  )
  const arbeitswegPerson2Bund = isMarried
    ? Math.min(oevKostenPerson2 + veloArbeitPerson2, fahrkostenLimitBund)
    : 0
  const arbeitswegTotalBund = arbeitswegPerson1Bund + arbeitswegPerson2Bund
  
  // Verpflegung: Separate by person if married
  const verpflegungLimit = getBerufsauslagenLimit(zivilstand, 'verpflegung')
  
  const verpflegungPerson1Tage = data.verpflegungAufArbeit.data.anzahlTage ?? 0
  const verpflegungPerson2Tage = isMarried ? (data.verpflegungAufArbeit.data.partner2AnzahlTage ?? 0) : 0
  
  const essenNichtVerbilligtPerson1 =
    data.verpflegungAufArbeit.start && !data.essenVerbilligungenVomArbeitgeber.start
      ? Math.min(15 * verpflegungPerson1Tage, verpflegungLimit)
      : 0
  const essenNichtVerbilligtPerson2 = isMarried
    ? data.verpflegungAufArbeit.start && !data.essenVerbilligungenVomArbeitgeber.start
      ? Math.min(15 * verpflegungPerson2Tage, verpflegungLimit)
      : 0
    : 0
  const essenNichtVerbilligt =
    essenNichtVerbilligtPerson1 + essenNichtVerbilligtPerson2 > 0
      ? essenNichtVerbilligtPerson1 + essenNichtVerbilligtPerson2
      : undefined
  
  const essenVerbilligungenPerson1 =
    data.verpflegungAufArbeit.start && data.essenVerbilligungenVomArbeitgeber.start
      ? Math.min(7.5 * verpflegungPerson1Tage, 1600)
      : 0
  const essenVerbilligungenPerson2 = isMarried
    ? data.verpflegungAufArbeit.start && data.essenVerbilligungenVomArbeitgeber.start
      ? Math.min(7.5 * verpflegungPerson2Tage, 1600)
      : 0
    : 0
  const essenVerbilligungenVomArbeitgeber =
    essenVerbilligungenPerson1 + essenVerbilligungenPerson2 > 0
      ? essenVerbilligungenPerson1 + essenVerbilligungenPerson2
      : undefined
  
  // Schichtarbeit: Separate by person if married
  const schichtarbeitPerson1 = data.schichtarbeit.start
    ? Math.min((data.schichtarbeit.data.wieVieleTageImJahr ?? 0) * 15, verpflegungLimit)
    : 0
  const schichtarbeitPerson2 = isMarried && data.schichtarbeit.start
    ? Math.min((data.schichtarbeit.data.partner2WieVieleTageImJahr ?? 0) * 15, verpflegungLimit)
    : 0
  const schichtarbeit =
    schichtarbeitPerson1 + schichtarbeitPerson2 > 0 ? schichtarbeitPerson1 + schichtarbeitPerson2 : undefined
  
  // Übrige Berufskosten: Calculate per person if married
  let uebrigeAbzuegeBeruf: number
  if (isMarried) {
    const person1Haupterwerb = person1Income
    const person2Haupterwerb = person2Income
    const uebrigePerson1 = Math.max(Math.min(4000, person1Haupterwerb * 0.03), 2000)
    const uebrigePerson2 = Math.max(Math.min(4000, person2Haupterwerb * 0.03), 2000)
    uebrigeAbzuegeBeruf = uebrigePerson1 + uebrigePerson2
  } else {
    uebrigeAbzuegeBeruf = Math.max(Math.min(4000, haupterwerb * 0.03), 2000)
  }
  
  const auslagenNebenerwerb =
    totalEinkuenfte === haupterwerb ? undefined : Math.max(Math.min(0.2 * (nebenerwerb ?? 0), 2400), 800)
  
  const totalBerufsauslagenStaat =
    arbeitswegTotalStaat +
    Math.min(
      verpflegungLimit,
      (essenVerbilligungenVomArbeitgeber ?? 0) + (essenNichtVerbilligt ?? 0) + (schichtarbeit ?? 0),
    ) +
    uebrigeAbzuegeBeruf
  const totalBerufsauslagenBund =
    arbeitswegTotalBund +
    Math.min(
      verpflegungLimit,
      (essenVerbilligungenVomArbeitgeber ?? 0) + (essenNichtVerbilligt ?? 0) + (schichtarbeit ?? 0),
    ) +
    uebrigeAbzuegeBeruf
  
  // Versicherungsprämien: Aggregate both persons, apply married limits
  const versicherungPerson1 =
    (data.versicherungspraemie.data.betrag ?? 0) + (data.privateUnfall.data.betrag ?? 0)
  const versicherungPerson2 = isMarried
    ? (data.versicherungspraemie.data.partner2Betrag ?? 0) + (data.privateUnfall.data.partner2Betrag ?? 0)
    : 0
  const versicherungSubtotal = versicherungPerson1 + versicherungPerson2
  
  const saeulen3oder2 = !!(data.saeule3a.start || data.saeule2?.start)
  
  const maxAbzugVersicherungStaat = getVersicherungspraemienLimit(zivilstand, saeulen3oder2, 'staat')
  const maxAbzugVersicherungBund = getVersicherungspraemienLimit(zivilstand, saeulen3oder2, 'bund')
  const versicherungenTotalStaat = Math.min(maxAbzugVersicherungStaat, versicherungSubtotal)
  const versicherungenTotalBund = Math.min(maxAbzugVersicherungBund, versicherungSubtotal)
  const bankverbindungRueckerstattung =
    (data.rueckzahlungBank?.data?.vorname ?? '') +
    ' ' +
    (data.rueckzahlungBank?.data?.nachname ?? '') +
    ' ' +
    (data.rueckzahlungBank?.data?.iban ?? '').trim()
  
  // Kinderabzüge berechnen
  const anzahlKinderImHaushalt = data.kinderImHaushalt?.data?.length ?? 0
  const anzahlKinderAusserhalb = data.kinderAusserhalb?.data?.length ?? 0
  const totalKinder = anzahlKinderImHaushalt + anzahlKinderAusserhalb
  
  // Abzüge: 9'300 CHF pro Kind für Staatssteuer, 6'800 CHF pro Kind für Bundessteuer
  const kinderabzugStaat = totalKinder * 9300
  const kinderabzugBund = totalKinder * 6800
  
  // Säule 3a: Separate limits per person (7258 CHF each)
  const saeule3aLimit = 7258
  const saeule3aPerson1 = Math.min(data.saeule3a?.data?.betrag ?? 0, saeule3aLimit)
  const saeule3aPerson2 = isMarried ? Math.min(data.saeule3a?.data?.partner2Betrag ?? 0, saeule3aLimit) : 0
  const saeule3aTotal = saeule3aPerson1 + saeule3aPerson2
  
  // AHV/IV Säule 2: Separate by person if married
  const ahvIVPerson1 = data.ahvIVsaeule2Selber?.data.betrag ?? 0
  const ahvIVPerson2 = isMarried ? (data.ahvIVsaeule2Selber?.data.partner2Betrag ?? 0) : 0
  const ahvIVTotal = ahvIVPerson1 + ahvIVPerson2
  
  // Weiterbildung Limits: Separate per person (Staat: 12400, Bund: 13000)
  let abzugAusbildungStaat: number
  let abzugAusbildungBund: number
  
  if (isMarried) {
    const person1Selbstgetragene = person1AusbildungKosten - (data.beitragArbeitgeberAusbildung?.data?.betragArbeitGeber ?? 0)
    const person2Selbstgetragene = person2AusbildungKosten
    abzugAusbildungStaat = Math.min(person1Selbstgetragene, 12400) + Math.min(person2Selbstgetragene, 12400)
    abzugAusbildungBund = Math.min(person1Selbstgetragene, 13000) + Math.min(person2Selbstgetragene, 13000)
  } else {
    abzugAusbildungStaat = Math.min(selbstgetrageneKostenAusbildung, 12400)
    abzugAusbildungBund = Math.min(selbstgetrageneKostenAusbildung, 13000)
  }
  
  // Schuldzinsenabzug wird später berechnet (nach totalBruttoertragAB)
  // Hier erstmal 0 setzen, wird später überschrieben
  let schuldzinsenAbzug = 0
  
  const totalAbzuegeStaat =
    totalBerufsauslagenStaat +
    saeule3aTotal +
    versicherungenTotalStaat +
    ahvIVTotal +
    abzugAusbildungStaat +
    kinderabzugStaat
  
  const totalAbzuegeBund =
    totalBerufsauslagenBund +
    saeule3aTotal +
    versicherungenTotalBund +
    ahvIVTotal +
    abzugAusbildungBund +
    kinderabzugBund
  
  // Nettoeinkommen wird später berechnet (nach schuldzinsenAbzug)
  let nettoEinkommenStaat = 0
  let nettoEinkommenBund = 0
  
  // Spenden
  const spenden = data.spenden.data.reduce((acc, v) => acc + (v.betrag ?? 0), 0)
  const spendenStaat = spenden > 100 ? Math.min(spenden, nettoEinkommenStaat * 0.2) : undefined
  const spendenBund = spenden > 100 ? Math.min(spenden, nettoEinkommenBund * 0.2) : undefined
  
  // NEUE ABZÜGE FÜR VERHEIRATETE
  
  // 1. Sonderabzug Erwerbstätigkeit (nur Verheiratet)
  let sonderabzugErwerbstaetigkeitStaat = 0
  let sonderabzugErwerbstaetigkeitBund = 0
  
  if (isMarried) {
    // Berechne Erwerbseinkommen nach allen Abzügen
    const person1Erwerbseinkommen = Math.max(
      person1Income -
        arbeitswegPerson1Staat -
        (essenVerbilligungenPerson1 + essenNichtVerbilligtPerson1 + schichtarbeitPerson1) -
        uebrigeAbzuegeBeruf / 2 -
        saeule3aPerson1 -
        versicherungPerson1 -
        ahvIVPerson1 -
        Math.min(person1AusbildungKosten, 12400),
      0,
    )
    
    const person2Erwerbseinkommen = Math.max(
      person2Income -
        arbeitswegPerson2Staat -
        (essenVerbilligungenPerson2 + essenNichtVerbilligtPerson2 + schichtarbeitPerson2) -
        uebrigeAbzuegeBeruf / 2 -
        saeule3aPerson2 -
        versicherungPerson2 -
        ahvIVPerson2 -
        Math.min(person2AusbildungKosten, 12400),
      0,
    )
    
    const niedrigeresEinkommen = Math.min(person1Erwerbseinkommen, person2Erwerbseinkommen)
    
    // Staatssteuer: min(niedrigeresEinkommen, 6100)
    sonderabzugErwerbstaetigkeitStaat = Math.min(niedrigeresEinkommen, 6100)
    
    // Bundessteuer: Komplexe Formel
    if (niedrigeresEinkommen === 0) {
      sonderabzugErwerbstaetigkeitBund = 0
    } else if (niedrigeresEinkommen < 8600) {
      sonderabzugErwerbstaetigkeitBund = niedrigeresEinkommen
    } else {
      const berechnet = niedrigeresEinkommen * 0.5
      sonderabzugErwerbstaetigkeitBund = Math.max(8600, Math.min(berechnet, 14100))
    }
  }
  
  // 2. Verheiratetenabzug (nur Bundessteuer, CHF 2800)
  const verheiratetenabzugBund = isMarried ? 2800 : 0
  
  // Reineinkommen nach Spenden und neuen Abzügen
  // Platzhalter: reineinkommenStaat/Bund werden nach Berechnung der Schuldzinsen gesetzt
  let reineinkommenStaat = 0
  let reineinkommenBund = 0
  
  // Steuerberechnung: Splitting-Verfahren für Verheiratete
  let einkommenssteuerBund: number
  let einkommenssteuerStaat: number
  
  if (isMarried) {
    // Splitting-Verfahren
    einkommenssteuerBund = calculateTaxMarried(reineinkommenBund, 'bund')
    
    // Für Staat: Base cantonal tax mit Splitting, dann Municipal multiplier
    const baseCantonalTax = calculateTaxMarried(
      reineinkommenStaat,
      'staat',
      data.personData?.data?.konfession ?? 'andere',
    )
    einkommenssteuerStaat = calculateMunicipalTax(
      baseCantonalTax,
      data.personData?.data?.gemeindeBfsNumber,
      data.personData?.data?.konfession ?? 'andere',
      municipalityRatesCache,
    )
  } else {
    // Ledig: Wie bisher
    einkommenssteuerBund = einkommenssteuerBundCalc(reineinkommenBund)
    
    const baseCantonalTax = calculateEinkommenssteuerStaat(
      reineinkommenStaat,
      data.personData?.data?.konfession ?? 'andere',
    )
    einkommenssteuerStaat = calculateMunicipalTax(
      baseCantonalTax,
      data.personData?.data?.gemeindeBfsNumber,
      data.personData?.data?.konfession ?? 'andere',
      municipalityRatesCache,
    )
  }
  const bargeldGoldEdelmetalle = (data.bargeld?.data.betrag ?? 0) + (data.edelmetalle?.data.betrag ?? 0)
  const currentDate = new Date()
  const ortUndDatum =
    'Zürich, ' +
    currentDate.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })

  const wertschriftenArray: wertschriftenEintrag[] = []
  data.bankkonto.data.map((v) =>
    wertschriftenArray.push({
      originalWaehrung: v.waehrung,
      bezeichnungVermoegen: 'Bankkonto ' + (v.bezeichnung ?? ''),
      steuerwertVermoegen: v.steuerwertEndeJahr ?? 0,
      wertMitVerrechnungssteuer: v.zinsUeber200 ? v.zinsbetrag : undefined,
      wertOhneVerrechnungssteuer: v.zinsUeber200 ? undefined : v.zinsbetrag,
    }),
  )

  data.krypto.data.map((v) =>
    wertschriftenArray.push({
      nennwertStueckzahl: v.stueckzahl,
      bezeichnungVermoegen: 'Kryptowährung ' + (v.waehrung ?? ''),
      steuerwertVermoegen: v.steuerwert ?? 0,
    }),
  )

  data.aktien.data.map((v) => {
    // Prüfe ob schweizerische Aktie (staat === 'CH')
    const isSwiss = v.staat === 'CH'
    const dividendenertrag = v.dividendenertrag ?? 0
    
    wertschriftenArray.push({
      nennwertStueckzahl: v.stueckzahl,
      valorenNr: v.valorenNr,
      bezeichnungVermoegen: 'Aktie ' + (v.gesellschaftTitel ?? ''),
      steuerwertVermoegen: (v.stueckzahl ?? 0) * (v.steuerwertProStueck ?? 0),
      // Dividenden: schweizerische Aktien haben Verrechnungssteuer (Kolonne A)
      // ausländische Aktien haben keine Verrechnungssteuer (Kolonne B)
      wertMitVerrechnungssteuer: isSwiss && dividendenertrag > 0 ? dividendenertrag : undefined,
      wertOhneVerrechnungssteuer: !isSwiss && dividendenertrag > 0 ? dividendenertrag : undefined,
    })
  })

  const totalSteuerwertVermoegen = wertschriftenArray.reduce(
    (acc, v) => acc + (v.steuerwertVermoegen ?? 0),
    0,
  )
  const bruttoertragA = wertschriftenArray.reduce(
    (acc, v) => acc + (v.wertMitVerrechnungssteuer ?? 0),
    0,
  )
  const bruttoertragB = wertschriftenArray.reduce(
    (acc, v) => acc + (v.wertOhneVerrechnungssteuer ?? 0),
    0,
  )
  const totalBruttoertragAB = bruttoertragA + bruttoertragB
  const verrechnungssteueranspruch = bruttoertragA * 0.35
  const motorfahrzeugeAbzugTotal =
    (data.motorfahrzeug?.data?.kaufpreis ?? 0) *
    Math.pow(0.6, 2023 - (data.motorfahrzeug?.data?.kaufjahr ?? 2000))

  // Unterhaltsbeiträge und Rentenleistungen (Abzug Ziffer 13)
  // Unterhaltsbeiträge an geschiedenen/getrennten Ehegatten (voll abzugsfähig)
  const abzugUnterhaltsbeitraegeEhegatten = data.unterhaltsbeitraege?.data?.anEhegatten ?? 0
  
  // Unterhaltsbeiträge für minderjährige Kinder (bis 18. Altersjahr)
  let abzugUnterhaltsbeitraegeKinder = 0
  data.unterhaltsbeitraege?.data?.fuerKinder?.forEach((kind) => {
    // Prüfe ob Kind im Steuerjahr 2025 noch nicht 18 geworden ist
    // Vereinfacht: Wenn monat18Jahre gesetzt ist, nur bis zu diesem Monat abzugsfähig
    // Sonst: vollständig abzugsfähig (Annahme: Kind ist noch nicht 18)
    if (kind.monat18Jahre) {
      // Kind wird 2025 18: nur bis zu diesem Monat abzugsfähig
      // Vereinfacht: nehmen wir den vollen Betrag (genaue Berechnung würde Monatsanteile erfordern)
      abzugUnterhaltsbeitraegeKinder += kind.betrag ?? 0
    } else {
      // Kind ist noch nicht 18: vollständig abzugsfähig
      abzugUnterhaltsbeitraegeKinder += kind.betrag ?? 0
    }
  })
  
  // Rentenleistungen (Ertragsanteil von Leibrenten/Verpfründungen)
  let abzugRentenleistungen = 0
  data.unterhaltsbeitraege?.data?.rentenleistungen?.forEach((rente) => {
    if (rente.abzugsfaehigerErtragsanteil !== undefined) {
      abzugRentenleistungen += rente.abzugsfaehigerErtragsanteil
    } else if (rente.gesamtbetrag && rente.berechnungssatz) {
      // Berechnung: Gesamtbetrag * Berechnungssatz / 100
      abzugRentenleistungen += rente.gesamtbetrag * (rente.berechnungssatz / 100)
    }
  })
  
  // Schulden (Vermögen Ziffer 34): Summe aller Schulden per 31.12.
  const totalSchulden = data.verschuldet?.data?.reduce((acc, v) => acc + (v.schuldhoehe ?? 0), 0) ?? 0
  
  // Schuldzinsenabzug gemäss Wegleitung (Ziffer 12):
  // Maximal abzugsfähig: Bruttoertrag Wertschriften + Bruttoertrag Liegenschaften (inkl. Eigenmietwert) + 50'000
  const schuldzinsenBezahlt = data.schuldzinsen?.data?.betrag ?? 0
  const bruttoErtragLiegenschaftenTotal =
    data.liegenschaften?.data?.reduce((acc, l) => acc + (l.eigenmietwertOderMietertrag ?? 0), 0) ?? 0
  const maxSchuldzinsenAbzug = totalBruttoertragAB + bruttoErtragLiegenschaftenTotal + 50000
  schuldzinsenAbzug = Math.min(schuldzinsenBezahlt, maxSchuldzinsenAbzug)
  
  // Jetzt die finalen totalAbzuege mit Schuldzinsen berechnen
  const totalAbzuegeStaatFinal = totalAbzuegeStaat + schuldzinsenAbzug
  const totalAbzuegeBundFinal = totalAbzuegeBund + schuldzinsenAbzug
  
  // Nettoeinkommen mit Schuldzinsen berechnen
  nettoEinkommenStaat = Math.max(totalEinkuenfte - totalAbzuegeStaatFinal, 0)
  nettoEinkommenBund = Math.max(totalEinkuenfte - totalAbzuegeBundFinal, 0)

  // Reineinkommen nach Spenden, Unterhaltsbeiträgen und neuen Abzügen
  // WICHTIG: Schuldzinsen sind bereits in totalAbzuegeStaat/Bund enthalten, daher hier NICHT nochmal abziehen!
  reineinkommenStaat = Math.max(
    nettoEinkommenStaat - (spendenStaat ?? 0) - sonderabzugErwerbstaetigkeitStaat - 
    abzugUnterhaltsbeitraegeEhegatten - abzugUnterhaltsbeitraegeKinder - abzugRentenleistungen -
    freistellungsanteilQualifizierteBeteiligungenStaat, // Freistellungsanteil qualifizierte Beteiligungen (Ziffer 16.5)
    0,
  )
  reineinkommenBund = Math.max(
    nettoEinkommenBund -
      (spendenBund ?? 0) -
      sonderabzugErwerbstaetigkeitBund -
      verheiratetenabzugBund -
      abzugUnterhaltsbeitraegeEhegatten - abzugUnterhaltsbeitraegeKinder - abzugRentenleistungen -
      freistellungsanteilQualifizierteBeteiligungenBund, // Freistellungsanteil qualifizierte Beteiligungen (Ziffer 16.5)
    0,
  )

  const totalVermoegenswerte =
    totalSteuerwertVermoegen +
    bargeldGoldEdelmetalle +
    motorfahrzeugeAbzugTotal +
    totalSteuerwertLiegenschaften - // Liegenschaften sind bereits enthalten
    totalSchulden // Schulden werden von Vermögenssteuer abgezogen (Ziffer 34)

  const vermoegenssteuerCalc = calculateVermoegenssteuer(Math.max(totalVermoegenswerte, 0)) // Sicherstellen, dass nicht negativ

  return {
    abzugarbeitsweg: 0,
    totalAusbildungsKosten: totalAusbildungsKosten,
    selbstgetrageneKostenAusbildung: selbstgetrageneKostenAusbildung,
    abzugAusbildungBund: abzugAusbildungBund,
    abzugAusbildungStaat: abzugAusbildungStaat,
    veloArbeit: veloArbeit,
    anzahlKmProJahr1: anzahlKmProJahr1 === 0 ? undefined : anzahlKmProJahr1,
    anzahlKmProJahr2: anzahlKmProJahr2 === 0 ? undefined : anzahlKmProJahr2,
    totalAbzug1: totalAbzug1 === 0 ? undefined : totalAbzug1,
    totalAbzug2: totalAbzug2 === 0 ? undefined : totalAbzug2,
    autoMotorradArbeitTotal: autoMotorradArbeitTotal,
    arbeitswegTotalBund: arbeitswegTotalBund,
    arbeitswegTotalStaat: arbeitswegTotalStaat,
    essenVerbilligungenVomArbeitgeber: essenVerbilligungenVomArbeitgeber,
    essenNichtVerbilligt: essenNichtVerbilligt,
    schichtarbeit: schichtarbeit,
    uebrigeAbzuegeBeruf: uebrigeAbzuegeBeruf,

    auslagenNebenerwerb: auslagenNebenerwerb,

    totalBerufsauslagenStaat: totalBerufsauslagenStaat,
    totalBerufsauslagenBund: totalBerufsauslagenBund,
    versicherungSubtotal: versicherungSubtotal,
    versicherungenTotal: versicherungSubtotal,
    bankverbindungRueckerstattung: bankverbindungRueckerstattung,

    maxAbzugVersicherungBund: maxAbzugVersicherungBund,
    maxAbzugVersicherungStaat: maxAbzugVersicherungStaat,
    versicherungenTotalBund: versicherungenTotalBund,
    versicherungenTotalStaat: versicherungenTotalStaat,
    saeule2ja: data.saeule2?.start ? 'X' : '',
    saeule2nein: data.saeule2?.start ? '' : 'X',
    haupterwerb: haupterwerb,
    nebenerwerb: nebenerwerb === 0 ? undefined : nebenerwerb,
    totalEinkuenfte: totalEinkuenfte,
    totalAbzuegeStaat: totalAbzuegeStaatFinal, // Enthält Schuldzinsen
    totalAbzuegeBund: totalAbzuegeBundFinal, // Enthält Schuldzinsen
    nettoEinkommenStaat: nettoEinkommenStaat,
    nettoEinkommenBund: nettoEinkommenBund,
    spendenStaat: spendenStaat,
    spendenBund: spendenBund,
    reineinkommenStaat: reineinkommenStaat,
    reineinkommenBund: reineinkommenBund,
    einkommenssteuerStaat: einkommenssteuerStaat,
    einkommenssteuerBund: einkommenssteuerBund,
    wertschriften: wertschriftenArray,
    totalSteuerwertVermoegen: totalSteuerwertVermoegen,
    bruttoertragA: bruttoertragA,
    bruttoerttragB: bruttoertragB,
    totalBruttoertragAB: totalBruttoertragAB,
    verrechnungssteueranspruch: verrechnungssteueranspruch,
    nettoertragLiegenschaften: nettoertragLiegenschaften,
    totalSteuerwertLiegenschaften: totalSteuerwertLiegenschaften,
    
    // Wertschriftenertrag (Einkommen Ziffer 4)
    wertschriftenertragZinsen: wertschriftenertragZinsen,
    wertschriftenertragDividenden: wertschriftenertragDividenden,
    wertschriftenertragQualifizierteBeteiligungen: wertschriftenertragQualifizierteBeteiligungen,
    freistellungsanteilQualifizierteBeteiligungenStaat: freistellungsanteilQualifizierteBeteiligungenStaat,
    freistellungsanteilQualifizierteBeteiligungenBund: freistellungsanteilQualifizierteBeteiligungenBund,
    
    // Sozialversicherungen/Leibrenten (Einkommen Ziffer 3)
    einkuenfteSozialversicherungTotal: einkuenfteSozialversicherungTotal + erwerbsausfallentschaedigungTotal + lebensOderRentenversicherungTotal,
    
    // Unterhaltsbeiträge und Rentenleistungen (Abzug Ziffer 13)
    abzugUnterhaltsbeitraegeEhegatten: abzugUnterhaltsbeitraegeEhegatten,
    abzugUnterhaltsbeitraegeKinder: abzugUnterhaltsbeitraegeKinder,
    abzugRentenleistungen: abzugRentenleistungen,
    
    // Schulden (Vermögen Ziffer 34)
    totalSchulden: totalSchulden,
    
    bargeldGoldEdelmetalle: bargeldGoldEdelmetalle,
    motorfahrzeugeAbzugTotal: motorfahrzeugeAbzugTotal,
    totalVermoegenswerte: totalVermoegenswerte,
    vermoegenssteuerCalc: vermoegenssteuerCalc,
    ortUndDatum: ortUndDatum,
  }
}
