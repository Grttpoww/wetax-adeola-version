import { ObjectId } from 'mongodb'
import { UserRole } from './enums'

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
      zivilstand: string | undefined
      konfession: string | undefined
      beruf: string | undefined
      email: string | undefined
      gemeindeBfsNumber: number | undefined // BFS number of municipality
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
    data: {}
  }
  erwerbsausfallentschaedigung: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {}
  }
  lebensOderRentenversicherung: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {}
  }
  geschaeftsOderKorporationsanteile: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {}
  }
  verschuldet: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {}
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
    }>
  }
  oevArbeit: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      kosten: number | undefined
    }
  }
  veloArbeit: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {}
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
    data: { anzahlTage: number | undefined }
  }
  essenVerbilligungenVomArbeitgeber: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {}
  }
  schichtarbeit: {
    start: boolean | undefined
    finished: boolean | undefined
    data: { wieVieleTageImJahr: number | undefined; immerSchichtarbeit: boolean | undefined }
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
    }
  }
  ahvIVsaeule2Selber: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      betrag: number | undefined
    }
  }
  saeule3a: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      betrag: number | undefined
    }
  }

  versicherungspraemie: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      betrag: number | undefined
    }
  }
  privateUnfall: {
    start: boolean | undefined
    finished: boolean | undefined
    data: {
      betrag: number | undefined
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

    data: {}
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
  bruttoertragA: number
  bruttoerttragB: number
  totalBruttoertragAB: number
  verrechnungssteueranspruch: number

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
