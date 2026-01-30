import { ScanType } from './enums'
import { TaxReturnData } from './types'

export const DEFAULT_TAX_RETURN_DATA: TaxReturnData = {
  personData: {
    start: undefined,
    finished: undefined,
    data: {
      geburtsdatum: undefined, // format: '10.12.2002'
      vorname: undefined, // 'Andri'
      nachname: undefined, // 'Meier'
      adresse: undefined, // 'Gossauerstrasse 42'
      plz: undefined, // '8050'
      stadt: undefined, // 'zurich'
      land: undefined, // 'schweiz'
      zivilstand: undefined,
      konfession: undefined,
      beruf: undefined,
      email: undefined,
      gemeindeBfsNumber: undefined,
      ahvNummer: undefined,
      partner2Vorname: undefined,
      partner2Nachname: undefined,
      partner2Geburtsdatum: undefined,
      partner2AhvNummer: undefined,
      partner2Beruf: undefined,
      partner2Konfession: undefined,
    },
  },
  rueckzahlungBank: {
    start: undefined,
    finished: undefined,
    data: {
      vorname: undefined,
      nachname: undefined,
      iban: undefined,
    },
  },
  inZuerich: {
    start: undefined,
    finished: undefined,
    data: {},
  },
  verheiratet: {
    start: undefined,
    finished: undefined,
    data: {},
  },
  hatKinder: {
    start: undefined,
    finished: undefined,
    data: {},
  },
  kinderImHaushalt: {
    start: undefined,
    finished: undefined,
    data: [],
  },
  kinderAusserhalb: {
    start: undefined,
    finished: undefined,
    data: [],
  },
  einkuenfteSozialversicherung: {
    start: undefined,
    finished: undefined,
    data: [],
  },
  erwerbsausfallentschaedigung: {
    start: undefined,
    finished: undefined,
    data: [],
  },
  lebensOderRentenversicherung: {
    start: undefined,
    finished: undefined,
    data: [],
  },
  geschaeftsOderKorporationsanteile: {
    start: undefined,
    finished: undefined,
    data: [],
  },
  verschuldet: {
    start: undefined,
    finished: undefined,
    data: [],
  },
  schuldzinsen: {
    start: undefined,
    finished: undefined,
    data: {
      betrag: undefined,
    },
  },
  geldVerdient: {
    start: undefined,
    finished: undefined,
    data: [],
  },
  oevArbeit: {
    start: undefined,
    finished: undefined,
    data: {
      kosten: undefined,
      partner2Kosten: undefined,
    },
  },
  veloArbeit: {
    start: undefined,
    finished: undefined,
    data: {
      partner2VeloArbeit: undefined,
    },
  },
  autoMotorradArbeit: {
    start: undefined,
    finished: undefined,
    data: {
      fehlenVonOev: undefined,
      zeitersparnisUeber1h: undefined,
      staendigeBenutzungArbeitszeit: undefined,
      keinOevWeilKrankOderGebrechlich: undefined,
      geleastesFahrzeug: undefined,
      partner2FehlenVonOev: undefined,
      partner2ZeitersparnisUeber1h: undefined,
      partner2StaendigeBenutzungArbeitszeit: undefined,
      partner2KeinOevWeilKrankOderGebrechlich: undefined,
      partner2GeleastesFahrzeug: undefined,
    },
  },
  autoMotorradArbeitWege: {
    start: undefined,
    finished: undefined,
    data: [],
  },
  verpflegungAufArbeit: {
    start: undefined,
    finished: undefined,
    data: { anzahlTage: undefined, partner2AnzahlTage: undefined },
  },
  essenVerbilligungenVomArbeitgeber: {
    start: undefined,
    finished: undefined,
    data: {},
  },
  schichtarbeit: {
    start: undefined,
    finished: undefined,
    data: {
      wieVieleTageImJahr: undefined,
      immerSchichtarbeit: undefined,
      partner2WieVieleTageImJahr: undefined,
      partner2ImmerSchichtarbeit: undefined,
    },
  },
  wochenaufenthalt: {
    start: undefined,
    finished: undefined,
    data: [],
  },

  inAusbildung: {
    start: undefined,
    finished: undefined,
    data: [],
  },

  beitragArbeitgeberAusbildung: {
    start: undefined,
    finished: undefined,
    data: { betragArbeitGeber: undefined },
  },

  saeule2: {
    start: undefined,
    finished: undefined,
    data: {
      ordentlichBetrag: undefined,
      einkaufBetrag: undefined,
      partner2OrdentlichBetrag: undefined,
      partner2EinkaufBetrag: undefined,
    },
  },
  ahvIVsaeule2Selber: {
    start: undefined,
    finished: undefined,
    data: {
      betrag: undefined,
      partner2Betrag: undefined,
    },
  },
  saeule3a: {
    start: undefined,
    finished: undefined,
    data: {
      betrag: undefined,
      partner2Betrag: undefined,
    },
  },
  versicherungspraemie: {
    start: undefined,
    finished: undefined,
    data: {
      betrag: undefined,
      partner2Betrag: undefined,
    },
  },
  privateUnfall: {
    start: undefined,
    finished: undefined,
    data: {
      betrag: undefined,
      partner2Betrag: undefined,
    },
  },
  spenden: {
    start: undefined,
    finished: undefined,
    data: [],
  },
  bargeld: {
    start: undefined,
    finished: undefined,
    data: {
      betrag: undefined,
    },
  },
  edelmetalle: {
    start: undefined,
    finished: undefined,
    data: {
      betrag: undefined,
    },
  },
  bankkonto: {
    start: undefined,
    finished: undefined,
    data: [],
  },
  aktien: {
    start: undefined,
    finished: undefined,
    data: [],
  },
  krypto: {
    start: undefined,
    finished: undefined,
    data: [],
  },
  motorfahrzeug: {
    start: undefined,
    finished: undefined,
    data: { bezeichung: undefined, kaufjahr: undefined, kaufpreis: undefined },
  },
  liegenschaften: {
    start: undefined,
    finished: undefined,
    // Default: keine Liegenschaften erfasst
    data: [],
  },
  unterhaltsbeitraege: {
    start: undefined,
    finished: undefined,
    data: {
      anEhegatten: undefined,
      fuerKinder: [],
      rentenleistungen: [],
    },
  },
}

export const scanTypeToGptPrompt: Record<ScanType, string> = {
  [ScanType.Lohnausweis]: `Please analyze the attached image and fill out the detailed JSON file containing the following information: (the comments are sample values)
                        
  export type Lohnausweis = {
    personData: {
      ahvNummmer: string //format: '743.439.4832.324'
      geburtsdatum: string //format: '21.06.2001'
      jahr: string //'2024'
      von: string //'2025.01.01'
      bis: string //'2025.12.31'
      vorname: string //'Daniel'
      nachname: string //'Mueller'
      adresse: string //'Gossauerstrasse 37'
      plz: number //'8050'
      stadt: string //'zurich'
      land: string //'schweiz'
    },
    lohn: {
      lohn: number //230003
      gehaltsNebenleistungen: {
        verpflegungUnterkunft: number //30
        privatanteilGeschaeftsfahrzeug: number //30
        andere: number //30
      },
      bruttolohn: number //230003
      beitraegeAHVIV: number //300
      beruflicheVorsorge: {
        ordentlicheBeitraege: number //300
        beitraegeFuerEinkauf: number //30
      },
      von: string //'2025.01.01'
      bis: string //'2025.12.31'
      nettolohn: number //203000
      arbeitgeber: string //'Firma AG'
      arbeitsort: string //'Zurich'
      spesenVerguetungen: {
        effektiveSpesen: {
          spesenReise: number //300
          spesenUebrige: number //20
        },
        pauschalSpesen: {
          spesenRepraesentation: number //30
          spesenAuto: number //30
          spesenUebrige: number //30
        },
        beitraegeWeiterbildung: number //2000
      }
    },
    aussteller: {
      ort: string //'zurich'
      datum: string //'20.11.2013'
    }
  }`,

  [ScanType.TaxDocument]: `You are an expert Swiss tax document analyzer. Analyze this tax document image and extract all relevant information.
Return a JSON object with the following structure, extracting only the information that is clearly visible in the document:

{
  "documentType": "string (e.g., 'salary_certificate', 'tax_return', 'tax_statement', 'bank_statement')",
  "taxYear": "number or null",
  "personalInfo": {
    "firstName": "string or null",
    "lastName": "string or null", 
    "ahvNumber": "string (format: 123.456.789.01) or null",
    "address": "string or null",
    "postalCode": "string or null",
    "city": "string or null",
    "birthDate": "string (format: YYYY.MM.DD) or null",
    "maritalStatus": "string or null",
    "profession": "string or null",
    "email": "string or null"
  },
  "income": {
    "grossSalary": "number or null (CHF)",
    "netSalary": "number or null (CHF)",
    "bonuses": "number or null (CHF)",
    "otherIncome": "number or null (CHF)",
    "totalIncome": "number or null (CHF)",
    "employer": "string or null",
    "workLocation": "string or null"
  },
  "deductions": {
    "ahvContributions": "number or null (CHF)",
    "pensionContributions": "number or null (CHF)",
    "insurancePremiums": "number or null (CHF)",
    "professionalExpenses": "number or null (CHF)",
    "educationExpenses": "number or null (CHF)",
    "donations": "number or null (CHF)",
    "medicalExpenses": "number or null (CHF)",
    "totalDeductions": "number or null (CHF)"
  },
  "taxes": {
    "federalTax": "number or null (CHF)",
    "stateTax": "number or null (CHF)",
    "municipalTax": "number or null (CHF)",
    "churchTax": "number or null (CHF)",
    "totalTax": "number or null (CHF)",
    "taxWithheld": "number or null (CHF)"
  },
  "bankInfo": {
    "iban": "string or null",
    "bankName": "string or null",
    "accountHolder": "string or null"
  },
  "extractedText": "string (all visible text from the document for reference)",
  "confidence": "string (high/medium/low based on document clarity)"
}

Important instructions:
- Extract only information that is clearly visible and readable
- Use null for any field that is not visible or unclear
- All monetary amounts should be in Swiss Francs (CHF)
- Preserve exact formatting for AHV numbers (e.g., 123.456.789.01)
- Include all visible text in the extractedText field for verification
- Be conservative with confidence - only use "high" if the document is very clear`,

  [ScanType.Bankkonto]: `Please analyze the attached image and fill out the detailed JSON file containing the following information: (the comments are sample values)
                        
  export type Bankkonto = {
    personData: {
      ahvNummmer: string //format: '743.439.4832.324'
      vorname: string //'Daniel'
      nachname: string //'Mueller'
      adresse: string //'Gossauerstrasse 37'
      plz: number //'8050'
      stadt: string //'zurich'
      land: string //'schweiz'
    },
    vorname: string // 'Hans'
    nachname: string // 'Meier'
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
  }`,
}
