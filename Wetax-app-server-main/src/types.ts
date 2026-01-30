import { ObjectId } from 'mongodb'
import { UserRole } from './enums'

export type Zivilstand = 'ledig' | 'verheiratet' | 'geschieden' | 'verwitwet'

export type User = {
  _id: ObjectId
  created: Date
  verificationCode: string | undefined
  ahvNummer: string // format: '743.432.4362.394'
  phoneNumber: string
  email?: string
  validated: boolean
  isActive?: boolean
  role?: UserRole
  isSuperAdmin?: boolean
}

export type Injected = {
  user: User
}

export type TaxReturn = {
  _id: ObjectId
  userId: ObjectId
  year: number
  created: Date
  pdf?: string
  archived: boolean
  validated?: boolean
  data: TaxReturnData
}

export type TaxReturnData = {
  personData: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      geburtsdatum: string | undefined // format: '10.12.2002'
      vorname: string | undefined // 'Andri'
      nachname: string | undefined // 'Meier'
      adresse: string | undefined // 'Gossauerstrasse 42'
      plz: number | undefined // '8050'
      stadt: string | undefined // 'zurich'
      land: string | undefined // 'schweiz'
      taxMunicipality?: string | undefined // BFS number as string (used by eCH-0119 export)
      zivilstand: Zivilstand | undefined
      konfession: string | undefined
      beruf: string | undefined
      email: string | undefined
      gemeindeBfsNumber: number | undefined // BFS number of municipality

      // Partner-/Ehepartner-Logik (optional, additive)
      ahvNummer?: string | undefined
      partner2Vorname?: string | undefined
      partner2Nachname?: string | undefined
      partner2Geburtsdatum?: string | undefined
      partner2AhvNummer?: string | undefined
      partner2Beruf?: string | undefined
      partner2Konfession?: string | undefined
    }
  }
  rueckzahlungBank: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      vorname: string | undefined
      nachname: string | undefined
      iban: string | undefined
    }
  }
  inZuerich: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {}
  }
  verheiratet: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {}
  }
  hatKinder: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {}
  }
  kinderImHaushalt: {
    start: boolean | undefined
    finished: boolean | undefined
    data: Array<{
      vorname: string | undefined
      nachname: string | undefined
      geburtsdatum: string | undefined
      inAusbildung: boolean | undefined
      schuleOderLehrfirma: string | undefined
      voraussichtlichBis: string | undefined
      andererElternteilZahlt: boolean | undefined
      unterhaltsbeitragProJahr: number | undefined
    }>
  }
  kinderAusserhalb: {
    start: boolean | undefined
    finished: boolean | undefined
    data: Array<{
      vorname: string | undefined
      nachname: string | undefined
      geburtsdatum: string | undefined
      adresse: string | undefined
      inAusbildung: boolean | undefined
      schuleOderLehrfirma: string | undefined
      voraussichtlichBis: string | undefined
    }>
  }
  einkuenfteSozialversicherung: {
    start: boolean | undefined
    finished: boolean | undefined
    data: Array<{
      // Art der Einkünfte
      art: 'ahvIvRente' | 'pensionskasse' | 'arbeitgeberRente' | 'suva' | 'militarversicherung' | 'saeule3a' | 'leibrente' | 'sonstige' | undefined
      // Gesamtbetrag der erhaltenen Leistung (Vorkolonne)
      gesamtbetrag: number | undefined
      // Steuerbarer Betrag (Hauptkolonne) - wird automatisch berechnet
      steuerbarerBetrag: number | undefined
      // Zusätzliche Felder für automatische Berechnung (nicht editierbar im UI)
      // Für Pensionskassenrenten:
      rentenbeginn?: string | undefined // Format: YYYY.MM.DD
      eigenbeitraegeProzent?: number | undefined // Für Berechnung 80% vs 100%
      vorsorgeverhaeltnisBereits1985?: boolean | undefined // Für Berechnung 80% vs 100%
      // Für SUVA:
      unfalldatum?: string | undefined // Format: YYYY.MM.DD - für Berechnung 60%/80%/100%
      praemienVomVersicherten?: number | undefined // Prozent der Prämien vom Versicherten bezahlt
      // Für Leibrenten: Berechnungssatz (wird jährlich von ESTV publiziert)
      leibrenteBerechnungssatz?: number | undefined
    }>
  }
  erwerbsausfallentschaedigung: {
    start: boolean | undefined
    finished: boolean | undefined
    data: Array<{
      // Art der Entschädigung
      art: 'arbeitslosigkeit' | 'krankheit' | 'unfall' | 'militar' | 'mutterschaft' | 'sonstige' | undefined
      // Betrag der Entschädigung
      betrag: number | undefined
      // Zeitraum (von-bis)
      von: string | undefined // Format: YYYY.MM.DD
      bis: string | undefined // Format: YYYY.MM.DD
    }>
  }
  lebensOderRentenversicherung: {
    start: boolean | undefined
    finished: boolean | undefined
    data: Array<{
      // Art der Versicherung
      art: 'lebensversicherung' | 'rentenversicherung' | 'leibrente' | undefined
      // Gesamtbetrag der erhaltenen Leistung (Vorkolonne)
      gesamtbetrag: number | undefined
      // Steuerbarer Betrag (Hauptkolonne) - wird automatisch berechnet
      steuerbarerBetrag: number | undefined
      // Bei Leibrenten: Berechnungssatz (wird jährlich von ESTV publiziert, für automatische Berechnung)
      leibrenteBerechnungssatz?: number | undefined
    }>
  }
  geschaeftsOderKorporationsanteile: {
    start: boolean | undefined
    finished: boolean | undefined
    data: Array<{
      // Bezeichnung des Unternehmens/der Gemeinschaft
      bezeichnung: string | undefined
      // Beteiligungsquote in Prozent (z.B. 15 für 15%)
      beteiligungsquote: number | undefined
      // Ertrag aus Geschäfts-/Korporationsanteilen
      ertrag: number | undefined
      // Ist qualifizierte Beteiligung? (mindestens 10% des Grund- oder Stammkapitals)
      istQualifizierteBeteiligung: boolean | undefined
      // Bei qualifizierter Beteiligung: Bruttoertrag (für Teilbesteuerung)
      bruttoertrag?: number | undefined
      // Steuerbarer Anteil Staat (50% bei qualifizierter Beteiligung)
      steuerbarerAnteilStaat?: number | undefined
      // Steuerbarer Anteil Bund (70% bei qualifizierter Beteiligung)
      steuerbarerAnteilBund?: number | undefined
    }>
  }
  verschuldet: {
    start: boolean | undefined
    finished: boolean | undefined
    data: Array<{
      // Gläubiger mit genauer Adresse (für Schuldenverzeichnis)
      glauebiger: string | undefined
      glauebigerAdresse: string | undefined
      // Zinssatz in Prozent (z.B. 2.5 für 2.5%)
      zinssatz: number | undefined
      // Schuldhöhe per 31.12. (für Vermögenssteuer)
      schuldhoehe: number | undefined
      // Zinsen im Steuerjahr (für Schuldzinsenabzug, bereits in schuldzinsen erfasst)
      zinsenImJahr: number | undefined
    }>
  }
  schuldzinsen: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      // Summe aller im Steuerjahr bezahlten Schuldzinsen auf Privatvermögen (exkl. Baurechtszinsen)
      betrag: number | undefined
    }
  }
  geldVerdient: {
    start: boolean | undefined
    finished: boolean | undefined
    data: Array<{
      von: string | undefined
      bis: string | undefined
      arbeitgeber: string | undefined
      arbeitsort: string | undefined
      urlaubstage: number | undefined
      nettolohn: number | undefined
      uploadedLohnausweis: boolean | undefined
      anzahlarbeitstage: number | undefined
      person?: 1 | 2 // default: 1 (backward compatible)
    }>
  }
  oevArbeit: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      kosten: number | undefined
      partner2Kosten?: number | undefined
    }
  }
  veloArbeit: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      partner2VeloArbeit?: boolean | undefined
    }
  }
  autoMotorradArbeit: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      fehlenVonOev: boolean | undefined
      zeitersparnisUeber1h: boolean | undefined
      staendigeBenutzungArbeitszeit: boolean | undefined
      keinOevWeilKrankOderGebrechlich: boolean | undefined
      geleastesFahrzeug: boolean | undefined

      partner2FehlenVonOev?: boolean | undefined
      partner2ZeitersparnisUeber1h?: boolean | undefined
      partner2StaendigeBenutzungArbeitszeit?: boolean | undefined
      partner2KeinOevWeilKrankOderGebrechlich?: boolean | undefined
      partner2GeleastesFahrzeug?: boolean | undefined
    }
  }
  autoMotorradArbeitWege: {
    start: boolean | undefined
    finished: boolean | undefined
    data: Array<{
      arbeitsort: string | undefined
      anzahlArbeitstage: number | undefined
      anzahlKm: number | undefined
      fahrtenProTag: number | undefined
      rappenProKm: number | undefined
    }>
  }

  verpflegungAufArbeit: {
    start: boolean | undefined
    finished: boolean | undefined
    data: { anzahlTage: number | undefined; partner2AnzahlTage?: number | undefined }
  }
  essenVerbilligungenVomArbeitgeber: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {}
  }
  schichtarbeit: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      wieVieleTageImJahr: number | undefined
      immerSchichtarbeit: boolean | undefined
      partner2WieVieleTageImJahr?: number | undefined
      partner2ImmerSchichtarbeit?: boolean | undefined
    }
  }
  wochenaufenthalt: {
    start: boolean | undefined
    finished: boolean | undefined
    data: Array<{
      datum: string | undefined
      bezeichung: string | undefined
      betrag: number | undefined
    }>
  }
  inAusbildung: {
    start: boolean | undefined
    finished: boolean | undefined
    data: Array<{
      bezeichung: string | undefined
      betrag: number | undefined
      person?: 1 | 2 // default: 1 (backward compatible)
    }>
  }

  beitragArbeitgeberAusbildung: {
    start: boolean | undefined
    finished: boolean | undefined
    data: { betragArbeitGeber: number | undefined }
  }

  saeule2: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      ordentlichBetrag: number | undefined
      einkaufBetrag: number | undefined
      partner2OrdentlichBetrag?: number | undefined
      partner2EinkaufBetrag?: number | undefined
    }
  }
  ahvIVsaeule2Selber: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      betrag: number | undefined
      partner2Betrag?: number | undefined
    }
  }
  saeule3a: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      betrag: number | undefined
      partner2Betrag?: number | undefined
    }
  }

  versicherungspraemie: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      betrag: number | undefined
      partner2Betrag?: number | undefined
    }
  }
  privateUnfall: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      betrag: number | undefined
      partner2Betrag?: number | undefined
    }
  }
  spenden: {
    start: boolean | undefined
    finished: boolean | undefined
    data: Array<{
      datum: string | undefined
      bezeichnung: string | undefined
      betrag: number | undefined
    }>
  }
  bargeld: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      betrag: number | undefined
    }
  }
  edelmetalle: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      betrag: number | undefined
    }
  }

  bankkonto: {
    start: boolean | undefined
    finished: boolean | undefined
    data: Array<{
      bankGesellschaft: string | undefined
      kontoOderDepotNr: string | undefined
      staat: string | undefined
      bezeichnung: string | undefined
      waehrung: string | undefined
      steuerwertEndeJahr: number | undefined
      zinsUeber200: boolean | undefined
      zinsbetrag: number | undefined
    }>
  }
  aktien: {
    start: boolean | undefined
    finished: boolean | undefined
    data: Array<{
      valorenNr: string | undefined
      ISIN: string | undefined
      gesellschaftTitel: string | undefined
      staat: string | undefined
      waehrung: string | undefined
      steuerwertEndeJahr: number | undefined
      stueckzahl: number | undefined
      steuerwertProStueck: number | undefined
      // Dividendenertrag (als Einkommen, Ziffer 4)
      dividendenertrag: number | undefined
      // Beteiligungsquote in Prozent (für qualifizierte Beteiligungen, mindestens 10%)
      beteiligungsquote: number | undefined
      // Ist qualifizierte Beteiligung? (mindestens 10% des Grund- oder Stammkapitals)
      istQualifizierteBeteiligung: boolean | undefined
    }>
  }

  krypto: {
    start: boolean | undefined
    finished: boolean | undefined
    data: Array<{
      bank: string | undefined
      waehrung: string | undefined
      steuerwert: number | undefined
      stueckzahl: number | undefined
      steuerwertProStueck: number | undefined
      ertragMitVerrechnungssteuer: number | undefined
    }>
  }
  motorfahrzeug: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      bezeichung: string | undefined
      kaufjahr: number | undefined
      kaufpreis: number | undefined
    }
  }
  liegenschaften: {
    start: boolean | undefined
    finished: boolean | undefined
    // Array, da mehrere Liegenschaften möglich sind (In- und Ausland, verschiedene Kantone)
    data: Array<{
      // Freitext-Bezeichnung zur Wiedererkennung in der UI / PDF
      bezeichnung: string | undefined
      // Ort / Gemeinde (frei, BFS-Logik kann später ergänzt werden)
      ort: string | undefined
      // Kanton (z.B. 'ZH', 'BS') für spätere interkantonale Ausscheidung
      kanton: string | undefined
      // Jahresbruttoertrag der Liegenschaft:
      // - bei selbstgenutzten Objekten: Eigenmietwert gemäss Steuerveranlagung
      // - bei vermieteten Objekten: Netto-Mietzinseinnahmen (exkl. Nebenkosten)
      eigenmietwertOderMietertrag: number | undefined
      // Art des Unterhaltsabzugs:
      // - 'pauschal'  → Pauschalabzug gemäss ZH-Wegleitung (standardmässig 20% des Bruttomietertrags)
      // - 'effektiv' → Effektive Unterhalts- und Verwaltungskosten gemäss Belegen
      unterhaltArt: 'pauschal' | 'effektiv' | undefined
      // Effektiver Unterhaltsbetrag (nur relevant bei unterhaltArt === 'effektiv')
      unterhaltBetrag: number | undefined
      // Kennzeichnet vorwiegend geschäftlich genutzte Liegenschaften:
      // Bei geschäftlicher Nutzung ist gemäss Wegleitung kein Pauschalabzug zulässig.
      istGeschaeftlich: boolean | undefined
      // Vermögenssteuerwert der Liegenschaft per 31.12. (gemäss kantonalem Bewertungsbescheid / ZStB 21.1)
      vermoegenssteuerwert: number | undefined
    }>
  }
  unterhaltsbeitraege: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      // Unterhaltsbeiträge an geschiedenen/getrennten Ehegatten (voll abzugsfähig)
      anEhegatten: number | undefined
      // Unterhaltsbeiträge für minderjährige Kinder (bis 18. Altersjahr)
      // Array mit Betrag pro Kind
      fuerKinder: Array<{
        kindName: string | undefined
        geburtsdatum: string | undefined // Format: YYYY.MM.DD
        betrag: number | undefined
        // Monat, in dem das Kind 18 wird (für Berechnung)
        monat18Jahre: string | undefined // Format: YYYY.MM
      }>
      // Rentenleistungen (Ertragsanteil von Leibrenten/Verpfründungen)
      rentenleistungen: Array<{
        bezeichnung: string | undefined
        gesamtbetrag: number | undefined
        // Berechnungssatz (wird jährlich von ESTV publiziert)
        berechnungssatz: number | undefined
        // Abzugsfähiger Ertragsanteil (berechnet: gesamtbetrag * berechnungssatz / 100)
        abzugsfaehigerErtragsanteil: number | undefined
      }>
    }
  }
}

export type BankkontoScanT = {
  nachname: string // 'Meier'
  vorname: string // 'Hans'
  kontoinhaber: string // 'Hans Meier'
  bankGesellschaft: string // 'Zürcher Kantonalbank'
  iban: string // 'CH93 0076 2011 6238 5295 7'
  kontoOderDepotNr: string // '1234567890'
  staat: string // 'Schweiz'
  bezeichnung: string // 'Mein Privatkonto'
  waehrung: string // 'CHF'
  steuerwertEndeJahr: number // 10000
  zinsUeber200: boolean // true
  zinsbetrag: number // 250
}

export type LohnausweisScanT = {
  personData: {
    ahvNummmer: string //format: '743.439.4832.324'
    geburtsdatum: string //format: '21.06.2001'
    jahr: string //'2024'
    von: string //'20.10.2001'
    bis: string //'20.10.2020'
    vorname: string //'Daniel'
    nachname: string //'Mueller'
    adresse: string //'Gossauerstrasse 37'
    plz: number //'8050'
    stadt: string //'zurich'
    land: string //'schweiz'
  }
  lohn: {
    lohn: number //230003
    gehaltsNebenleistungen: {
      verpflegungUnterkunft: number //30
      privatanteilGeschaeftsfahrzeug: number //30
      andere: number //30
    }
    bruttolohn: number //230003
    beitraegeAHVIV: number //300
    beruflicheVorsorge: {
      ordentlicheBeitraege: number //300
      beitraegeFuerEinkauf: number
    }
    von: string //'2025.01.01'
    bis: string //'2025.12.31'
    nettolohn: number //203000
    arbeitgeber?: string //'Firma AG'
    arbeitsort?: string //'Zurich'
    spesenVerguetungen: {
      effektiveSpesen: {
        spesenReise: number //300
        spesenUebrige: number //20
      }
      pauschalSpesen: {
        spesenRepraesentation: number //30
        spesenAuto: number //30
        spesenUebrige: number //30
      }
      beitraegeWeiterbildung: number //2000
    }
  }
  aussteller: {
    ort: string //'zurich'
    datum: string //'20.11.2013'
  }
}

export type ComputedTaxReturnT = {
  abzugarbeitsweg: number
  totalAusbildungsKosten: number
  selbstgetrageneKostenAusbildung: number
  abzugAusbildungStaat: number
  abzugAusbildungBund: number
  veloArbeit: number | undefined
  anzahlKmProJahr1: number | undefined
  anzahlKmProJahr2: number | undefined
  totalAbzug1: number | undefined
  totalAbzug2: number | undefined
  autoMotorradArbeitTotal: number
  arbeitswegTotalStaat: number
  arbeitswegTotalBund: number
  essenVerbilligungenVomArbeitgeber: number | undefined
  essenNichtVerbilligt: number | undefined
  schichtarbeit: number | undefined
  uebrigeAbzuegeBeruf: number
  auslagenNebenerwerb: number | undefined
  totalBerufsauslagenStaat: number
  totalBerufsauslagenBund: number
  versicherungSubtotal: number
  versicherungenTotal: number
  bankverbindungRueckerstattung: string
  maxAbzugVersicherungBund: number
  maxAbzugVersicherungStaat: number
  versicherungenTotalStaat: number
  versicherungenTotalBund: number
  saeule2ja: string
  saeule2nein: string
  haupterwerb: number
  nebenerwerb: number | undefined
  totalEinkuenfte: number
  totalAbzuegeStaat: number
  totalAbzuegeBund: number
  nettoEinkommenStaat: number
  nettoEinkommenBund: number
  spendenStaat: number | undefined
  spendenBund: number | undefined
  reineinkommenStaat: number
  reineinkommenBund: number
  einkommenssteuerStaat: number
  einkommenssteuerBund: number
  wertschriften: wertschriftenEintrag[]
  totalSteuerwertVermoegen: number
  // Bruttoertrag aus Wertschriften mit Verrechnungssteuer (z.B. Zinsen, Dividenden)
  bruttoertragA: number
  bruttoerttragB: number
  totalBruttoertragAB: number
  verrechnungssteueranspruch: number

  // Immobilien / Liegenschaften
  // Nettoertrag aus Liegenschaften (Eigenmietwert + Mietzinsertrag - zulässige Unterhaltskosten)
  nettoertragLiegenschaften: number
  // Summe der Vermögenssteuerwerte aller Liegenschaften
  totalSteuerwertLiegenschaften: number

  // Wertschriftenertrag (Einkommen Ziffer 4)
  // Zinsen von Bankkonten/Guthaben
  wertschriftenertragZinsen: number
  // Dividenden von Aktien
  wertschriftenertragDividenden: number
  // Qualifizierte Beteiligungen (Teilbesteuerung)
  wertschriftenertragQualifizierteBeteiligungen: number
  // Freistellungsanteil qualifizierte Beteiligungen (Abzug Ziffer 16.5)
  freistellungsanteilQualifizierteBeteiligungenStaat: number
  freistellungsanteilQualifizierteBeteiligungenBund: number

  // Sozialversicherungen/Leibrenten (Einkommen Ziffer 3)
  einkuenfteSozialversicherungTotal: number

  // Unterhaltsbeiträge und Rentenleistungen (Abzug Ziffer 13)
  abzugUnterhaltsbeitraegeEhegatten: number
  abzugUnterhaltsbeitraegeKinder: number
  abzugRentenleistungen: number

  // Schulden (Vermögen Ziffer 34)
  totalSchulden: number

  bargeldGoldEdelmetalle: number
  motorfahrzeugeAbzugTotal: number
  totalVermoegenswerte: number
  vermoegenssteuerCalc: number
  ortUndDatum: string
}
export type wertschriftenEintrag = {
  originalWaehrung?: string
  nennwertStueckzahl?: number
  valorenNr?: string
  bezeichnungVermoegen: string
  steuerwertVermoegen: number
  wertMitVerrechnungssteuer?: number
  wertOhneVerrechnungssteuer?: number
}

export type PdfFieldsT = {
  [fieldKey: string]: (params: {
    computed: ComputedTaxReturnT
    data: TaxReturnData
    user: User
    year: number
  }) => string | undefined | null
}

export type TaxAmount = {
  grossIncome: number
  deductableAmount: number
  taxableIncome: number
  totalTaxes: number
}

// Super Admin Types
export type AdminUser = User & {
  isSuperAdmin: true
  role: UserRole.SuperAdmin
}

export type AdminInjected = {
  user: AdminUser
}

export type UserStats = {
  totalUsers: number
  activeUsers: number
  validatedUsers: number
  unvalidatedUsers: number
  superAdmins: number
}

export type TaxReturnStats = {
  totalReturns: number
  completedReturns: number
  archivedReturns: number
  activeReturns: number
  avgTaxAmount: number
  totalTaxAmount: number
}

export type SystemStats = {
  userStats: UserStats
  taxReturnStats: TaxReturnStats
  systemHealth: {
    dbStatus: 'connected' | 'disconnected' | 'error'
    lastBackup?: Date
    serverUptime: number
  }
}

export type UserManagement = {
  users: User[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type AdminActivity = {
  _id: ObjectId
  adminId: ObjectId
  action: string
  targetUserId?: ObjectId
  targetTaxReturnId?: ObjectId
  details: Record<string, any>
  timestamp: Date
}

export type MunicipalityTaxRates = {
  bfsNumber: number
  name: string
  baseRateWithoutChurch: number | null // Column 3: Gesamtsteuerfuss ohne Kirche
  rateWithReformedChurch: number | null // Column 4: Gesamtsteuerfuss mit ref. Kirche
  rateWithCatholicChurch: number | null // Column 5: Gesamtsteuerfuss mit kath. Kirche
  rateWithChristCatholicChurch: number | null // Column 6: Gesamtsteuerfuss mit christkath. Kirche
  juristischerSteuerfuss: number | null // Column 7: Juristischer Steuerfuss (for reference)
  definitiv: boolean // Column 8: "1" = true, "" = false
}

// In-memory cache: Map keyed by BFS number
export type MunicipalityTaxRatesCache = Map<number, MunicipalityTaxRates>

// Chat Types
export type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  tokens: number // input + output tokens for this message
}

export type ChatConversation = {
  _id: ObjectId
  userId: string // ObjectId as string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export type ChatTokenUsage = {
  _id: ObjectId
  userId: string // ObjectId as string
  totalTokens: number // cumulative lifetime tokens
  lastReset: Date // monthly reset date
  unlimitedAccess: boolean // admin override
  createdAt: Date
  updatedAt: Date
}
