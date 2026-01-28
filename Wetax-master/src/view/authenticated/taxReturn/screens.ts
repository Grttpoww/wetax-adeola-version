import { Lens } from 'monocle-ts'
import { FormFieldType } from '../../../components/form/form.types'
import { ScreenEnum, ScreenTypeEnum } from './enums'
import { GeneratePdf, ScreenT } from './types'
import { TaxReturnData } from '../../../openapi'

const inZuerichScreen: ScreenT<'inZuerich'> = {
  name: ScreenEnum.LivingInZurich,
  title: 'Wohnort',
  type: ScreenTypeEnum.YesNo,
  question: 'Wohnst du in der Stadt Zürich?',
  text: '',
  dataKey: 'inZuerich',
  isDone: (v) => v.start !== undefined,
}

const verheiratetScreen: ScreenT<'verheiratet'> = {
  name: ScreenEnum.Verheiratet,
  type: ScreenTypeEnum.YesNo,
  title: 'Zivilstand',

  question: 'Bist du Verheiratet?',
  text: '',
  dataKey: 'verheiratet',
  isDone: (v) => v.start !== undefined,
  update: (res, data) => ({
    ...data,
    personData: {
      ...data.personData,
      data: {
        ...data.personData.data,
        zivilstand: res.start ? 'Verheiratet' : 'Ledig',
      },
    },
  }),
}

const kinderImHaushaltYesNoScreen: ScreenT<'kinderImHaushalt'> = {
  name: ScreenEnum.KinderImHaushaltYesNo,
  type: ScreenTypeEnum.YesNo,
  dataKey: 'kinderImHaushalt',
  title: 'Kinder im Haushalt',
  question: 'Hast du Kinder im Haushalt?',
  text: 'Kinder, die bei dir wohnen',
  isDone: (v) => v.start !== undefined,
}

const kinderImHaushaltOverviewScreen: ScreenT<
  'kinderImHaushalt',
  TaxReturnData['kinderImHaushalt']['data'][0]
> = {
  name: ScreenEnum.KinderImHaushaltOverview,
  type: ScreenTypeEnum.ArrayOverview,
  title: 'Kinder im Haushalt - Übersicht',
  dataKey: 'kinderImHaushalt',
  helpText: 'Gib alle Kinder an, die bei dir im Haushalt leben (max. 3).',
  detailScreen: ScreenEnum.KinderImHaushaltDetail,
  getLabel: (data) => `${data.vorname || ''} ${data.nachname || ''}`.trim() || 'Nicht ausgefüllt',
  getSublabel: (data) => data.geburtsdatum || '',
  isDone: (v) => v.data.length > 0 && v.data.length <= 3,
  hide: (v) => v.start !== true,
  maxItems: 3,
}

const kinderImHaushaltDetailScreen: ScreenT<
  'kinderImHaushalt',
  TaxReturnData['kinderImHaushalt']['data'][0]
> = {
  name: ScreenEnum.KinderImHaushaltDetail,
  type: ScreenTypeEnum.ArrayForm,
  title: 'Kind Hinzufügen',
  dataKey: 'kinderImHaushalt',
  helpText: 'Gib die Informationen zum Kind ein.',
  getLabel: (data) => `${data.vorname || ''} ${data.nachname || ''}`.trim() || 'Nicht ausgefüllt',
  overviewScreen: ScreenEnum.KinderImHaushaltOverview,
  isDone: (v) => v.finished === true,
  hide: (v) => v.start !== true,
  form: {
    fields: [
      {
        label: 'Vorname',
        type: FormFieldType.TextInput,
        inputProps: { placeholder: 'Vorname' },
        lens: Lens.fromProp<TaxReturnData['kinderImHaushalt']['data'][0]>()('vorname'),
      },
      {
        label: 'Nachname',
        type: FormFieldType.TextInput,
        inputProps: { placeholder: 'Nachname' },
        lens: Lens.fromProp<TaxReturnData['kinderImHaushalt']['data'][0]>()('nachname'),
      },
      {
        label: 'Geburtsdatum',
        type: FormFieldType.DatePicker,
        lens: Lens.fromProp<TaxReturnData['kinderImHaushalt']['data'][0]>()('geburtsdatum'),
        defaultDate: '2010.01.01',
      },
      {
        label: 'In Ausbildung',
        type: FormFieldType.Checkbox,
        lens: Lens.fromProp<TaxReturnData['kinderImHaushalt']['data'][0]>()('inAusbildung'),
      },
      {
        label: 'Schule oder Lehrfirma',
        type: FormFieldType.TextInput,
        inputProps: { placeholder: 'Schule oder Lehrfirma' },
        lens: Lens.fromProp<TaxReturnData['kinderImHaushalt']['data'][0]>()('schuleOderLehrfirma'),
        isVisible: (data) => data.inAusbildung === true,
      },
      {
        label: 'Voraussichtlich bis',
        type: FormFieldType.DatePicker,
        lens: Lens.fromProp<TaxReturnData['kinderImHaushalt']['data'][0]>()('voraussichtlichBis'),
        defaultDate: '2025.12.31',
        isVisible: (data) => data.inAusbildung === true,
      },
      {
        label: 'Leistet der andere Elternteil Unterhaltsbeiträge?',
        type: FormFieldType.Checkbox,
        lens: Lens.fromProp<TaxReturnData['kinderImHaushalt']['data'][0]>()('andererElternteilZahlt'),
      },
      {
        label: 'Betrag pro Jahr (CHF)',
        type: FormFieldType.CurrencyInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'Betrag',
        },
        lens: Lens.fromProp<TaxReturnData['kinderImHaushalt']['data'][0]>()('unterhaltsbeitragProJahr'),
        isVisible: (data) => data.andererElternteilZahlt === true,
      },
    ],
  },
}

const kinderAusserhalbYesNoScreen: ScreenT<'kinderAusserhalb'> = {
  name: ScreenEnum.KinderAusserhalbYesNo,
  type: ScreenTypeEnum.YesNo,
  dataKey: 'kinderAusserhalb',
  title: 'Kinder ausserhalb des Haushalts',
  question: 'Hast du Kinder ausserhalb des Haushalts, für die du unterhaltspflichtig bist?',
  text: 'Kinder, die nicht bei dir wohnen',
  isDone: (v) => v.start !== undefined,
}

const kinderAusserhalbOverviewScreen: ScreenT<
  'kinderAusserhalb',
  TaxReturnData['kinderAusserhalb']['data'][0]
> = {
  name: ScreenEnum.KinderAusserhalbOverview,
  type: ScreenTypeEnum.ArrayOverview,
  title: 'Kinder ausserhalb - Übersicht',
  dataKey: 'kinderAusserhalb',
  helpText: 'Gib alle Kinder an, die ausserhalb deines Haushalts leben und für die du unterhaltspflichtig bist (max. 2).',
  detailScreen: ScreenEnum.KinderAusserhalbDetail,
  getLabel: (data) => `${data.vorname || ''} ${data.nachname || ''}`.trim() || 'Nicht ausgefüllt',
  getSublabel: (data) => data.adresse || '',
  isDone: (v) => v.data.length > 0 && v.data.length <= 2,
  hide: (v) => v.start !== true,
  maxItems: 2,
}

const kinderAusserhalbDetailScreen: ScreenT<
  'kinderAusserhalb',
  TaxReturnData['kinderAusserhalb']['data'][0]
> = {
  name: ScreenEnum.KinderAusserhalbDetail,
  type: ScreenTypeEnum.ArrayForm,
  title: 'Kind Hinzufügen',
  dataKey: 'kinderAusserhalb',
  helpText: 'Gib die Informationen zum Kind ein.',
  getLabel: (data) => `${data.vorname || ''} ${data.nachname || ''}`.trim() || 'Nicht ausgefüllt',
  overviewScreen: ScreenEnum.KinderAusserhalbOverview,
  isDone: (v) => v.finished === true,
  hide: (v) => v.start !== true,
  form: {
    fields: [
      {
        label: 'Vorname',
        type: FormFieldType.TextInput,
        inputProps: { placeholder: 'Vorname' },
        lens: Lens.fromProp<TaxReturnData['kinderAusserhalb']['data'][0]>()('vorname'),
      },
      {
        label: 'Nachname',
        type: FormFieldType.TextInput,
        inputProps: { placeholder: 'Nachname' },
        lens: Lens.fromProp<TaxReturnData['kinderAusserhalb']['data'][0]>()('nachname'),
      },
      {
        label: 'Geburtsdatum',
        type: FormFieldType.DatePicker,
        lens: Lens.fromProp<TaxReturnData['kinderAusserhalb']['data'][0]>()('geburtsdatum'),
        defaultDate: '2010.01.01',
      },
      {
        label: 'Adresse',
        type: FormFieldType.TextInput,
        inputProps: { placeholder: 'Strasse, PLZ, Ort' },
        lens: Lens.fromProp<TaxReturnData['kinderAusserhalb']['data'][0]>()('adresse'),
      },
      {
        label: 'In Ausbildung',
        type: FormFieldType.Checkbox,
        lens: Lens.fromProp<TaxReturnData['kinderAusserhalb']['data'][0]>()('inAusbildung'),
      },
      {
        label: 'Schule oder Lehrfirma',
        type: FormFieldType.TextInput,
        inputProps: { placeholder: 'Schule oder Lehrfirma' },
        lens: Lens.fromProp<TaxReturnData['kinderAusserhalb']['data'][0]>()('schuleOderLehrfirma'),
        isVisible: (data) => data.inAusbildung === true,
      },
      {
        label: 'Voraussichtlich bis',
        type: FormFieldType.DatePicker,
        lens: Lens.fromProp<TaxReturnData['kinderAusserhalb']['data'][0]>()('voraussichtlichBis'),
        defaultDate: '2025.12.31',
        isVisible: (data) => data.inAusbildung === true,
      },
    ],
  },
}

const hatKinderScreen: ScreenT<'hatKinder'> = {
  name: ScreenEnum.HatKinder,
  type: ScreenTypeEnum.YesNo,
  title: 'Kinder',

  question: 'Hast du Kinder?',
  text: '',
  dataKey: 'hatKinder',
  isDone: (v) => v.start !== undefined,
}

const sozialUndVersicherungseinnahmenScreen: ScreenT<'einkuenfteSozialversicherung'> = {
  name: ScreenEnum.SozialUndVersicherungseinnahmen,
  type: ScreenTypeEnum.YesNo,
  title: 'Sozial- und Versicherungseinnahmen',

  question: 'Hast du schon mal Geld aus Versicherungen oder sozialen Sicherungssystemen erhalten?',
  text: 'z.B. Arbeitslosengeld, Krankengeld, Mutterschaftsgeld, Rente',
  dataKey: 'einkuenfteSozialversicherung',
  isDone: (v) => v.start !== undefined,
}
const erwerbsausfallentschaedigungScreen: ScreenT<'erwerbsausfallentschaedigung'> = {
  name: ScreenEnum.Erwerbsausfallentschädigung,
  type: ScreenTypeEnum.YesNo,
  title: 'Erwerbsausfallentschädigung',

  question:
    'Hast du schon mal eine Entschädigung bekommen, weil du vorübergehend nicht arbeiten konntest?',
  text: 'z.B. wegen Krankheit, Unfall, Militärdienst oder Mutterschaft',
  dataKey: 'erwerbsausfallentschaedigung',
  isDone: (v) => v.start !== undefined,
}

const lebensOderRentenversicherung: ScreenT<'lebensOderRentenversicherung'> = {
  name: ScreenEnum.LebensOderRentenversicherung,
  type: ScreenTypeEnum.YesNo,
  title: 'Rentenversicherung',

  question: 'Hast du schon mal Geld aus einer Lebens- oder Rentenversicherung erhalten?',
  text: '',
  dataKey: 'lebensOderRentenversicherung',
  isDone: (v) => v.start !== undefined,
}
const geschaeftsOderKorporationsanteileScreen: ScreenT<'geschaeftsOderKorporationsanteile'> = {
  name: ScreenEnum.GeschaeftsOderKorporationsanteile,
  type: ScreenTypeEnum.YesNo,
  title: 'Geschäfts- oder Korporationsanteile',

  question: 'Besitzt du Anteile an einem Unternehmen oder einer Gemeinschaft?',
  text: '',
  dataKey: 'geschaeftsOderKorporationsanteile',
  isDone: (v) => v.start !== undefined,
}

const verschuldetScreen: ScreenT<'verschuldet'> = {
  name: ScreenEnum.Verschuldet,
  type: ScreenTypeEnum.YesNo,
  title: 'Schulden',

  question: 'Hast du aktuell Schulden?',
  text: 'z.B. Kredite, Kreditkartenschulden, privates Darlehen',
  dataKey: 'verschuldet',
  isDone: (v) => v.start !== undefined,
}
const geldVerdientScreen: ScreenT<'geldVerdient'> = {
  name: ScreenEnum.GeldVerdient,
  type: ScreenTypeEnum.YesNo,
  title: 'Lohn',
  question: 'Hast du dieses Jahr Geld verdient?',
  dataKey: 'geldVerdient',
  isDone: (v) => v.start !== undefined,
}

const geldVerdientOverviewScreen: ScreenT<'geldVerdient', TaxReturnData['geldVerdient']['data'][0]> = {
  name: ScreenEnum.GeldVerdientOverview,
  type: ScreenTypeEnum.ArrayOverview,
  title: 'Überblick Einkünfte',
  text: 'Falls du noch andere Einkommen hast, füge sie bitte hinzu.',
  dataKey: 'geldVerdient',
  detailScreen: ScreenEnum.GeldVerdientDetail,
  getLabel: (data) => data.arbeitgeber || 'Not finished',
  getSublabel: (data) => `CHF ${data.nettolohn || 0}`,
  isDone: (v) => v.finished === true,
  hide: (v) => v.start !== true,
}

const geldVerdientDetailScreen: ScreenT<'geldVerdient', TaxReturnData['geldVerdient']['data'][0]> = {
  name: ScreenEnum.GeldVerdientDetail,
  type: ScreenTypeEnum.ArrayForm,
  title: 'Lohn Hinzufügen',
  dataKey: 'geldVerdient',
  getLabel: (data) => data.arbeitgeber || 'Not finished',
  overviewScreen: ScreenEnum.GeldVerdientOverview,
  isDone: (v) => v.finished === true,
  hide: (v) => v.start !== true,
  form: {
    fields: [
      {
        label: 'von',
        type: FormFieldType.DatePicker,
        lens: Lens.fromProp<TaxReturnData['geldVerdient']['data'][0]>()('von'),
        defaultDate: '2024.04.01',
      },
      {
        label: 'bis',
        type: FormFieldType.DatePicker,
        lens: Lens.fromProp<TaxReturnData['geldVerdient']['data'][0]>()('bis'),
        defaultDate: '2025.03.31',
      },
      {
        label: 'Arbeitgeber',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Arbeitgeber',
        },
        lens: Lens.fromProp<TaxReturnData['geldVerdient']['data'][0]>()('arbeitgeber'),
      },
      {
        label: 'Arbeitsort',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Arbeitsort',
        },
        lens: Lens.fromProp<TaxReturnData['geldVerdient']['data'][0]>()('arbeitsort'),
      },
      {
        label: 'Nettolohn',
        type: FormFieldType.CurrencyInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: '',
        },
        lens: Lens.fromProp<TaxReturnData['geldVerdient']['data'][0]>()('nettolohn'),
      },
      {
        label: 'Urlaubstage',
        type: FormFieldType.NumberInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'Urlaubstage',
        },
        lens: Lens.fromProp<TaxReturnData['geldVerdient']['data'][0]>()('urlaubstage'),
      }
    ],
  },
}

const oevArbeitScreen: ScreenT<'oevArbeit'> = {
  name: ScreenEnum.OevArbeit,
  type: ScreenTypeEnum.YesNo,
  title: 'Öffentliche Verkehrsmittel zur Arbeit',

  question: 'Fährst du mit öffentlichen Verkehrsmitteln zur Arbeit?',
  text: 'z.B. Bus, Zug, Tram',
  helpText:
    'Wenn du regelmässig mit öffentlichen Verkehrsmitteln (Bahn, Schiff, Straßenbahn, Autobus) zur Arbeit fährst, kannst du dies angeben und es wird dir dann von den Steuern abgezogen.',
  dataKey: 'oevArbeit',
  isDone: (v) => v.start !== undefined,
}

const oevAboKostenScreen: ScreenT<'oevArbeit', { name: boolean | null }> = {
  name: ScreenEnum.OevArbeitKosten,
  type: ScreenTypeEnum.ObjForm,
  helpText:
    'Wenn du regelmässig mit öffentlichen Verkehrsmitteln (Bahn, Schiff, Straßenbahn, Autobus) zur Arbeit fährst, kannst du dies angeben und es wird dir dann von den Steuern abgezogen.',
  dataKey: 'oevArbeit',
  title: 'Kosten ÖV Abo',
  form: {
    fields: [
      {
        label: 'Kosten von deinem ÖV Abo',
        type: FormFieldType.CurrencyInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: '',
        },
        lens: Lens.fromProp<TaxReturnData['oevArbeit']['data']>()('kosten'),
      },
    ],
  },
  isDone: (v) => v.start !== undefined,
  hide: (v) => v.start !== true,
}

const veloArbeitScreen: ScreenT<'veloArbeit'> = {
  name: ScreenEnum.VeloArbeit,
  type: ScreenTypeEnum.YesNo,
  title: 'Fahrrad oder Kleinmotorrad',

  question: 'Hast du ein Fahrrad oder Kleinmotorrad, das du zur Arbeit nutzt?',
  text: 'Wenn du regelmässig mit dem Fahrrad oder Kleinmotorrad mit gelbem Kontrollschild zur Arbeit fährst, können wir dir im Jahr CHF 700 von den Steuern abziehen.',
  dataKey: 'veloArbeit',
  isDone: (v) => v.start !== undefined,
}

const autoMotorradArbeitScreen: ScreenT<'autoMotorradArbeit'> = {
  name: ScreenEnum.AutoMotorradArbeit,
  type: ScreenTypeEnum.YesNo,
  title: 'Privates Auto oder Motorrad zur Arbeit',
  question: 'Fährst du mit deinem eigenen Auto oder Motorrad zur Arbeit?',
  text: 'Wichtig: Nur private Fahrzeuge. Falls du ein Geschäftsfahrzeug besitzt, kannst du dies nicht von den Steuern abziehen.',
  dataKey: 'autoMotorradArbeit',
  isDone: (v) => v.start !== undefined,
}

const autoMotorradArbeitCheckboxesScreen: ScreenT<
  'autoMotorradArbeit',
  TaxReturnData['autoMotorradArbeit']['data']
> = {
  name: ScreenEnum.AutoMotorradArbeitCheckboxes,
  type: ScreenTypeEnum.ObjForm,
  dataKey: 'autoMotorradArbeit',
  title: 'Begründung für die Benützung eines privaten Motorfahrzeuges',
  helpText:
    'Man kann nur die Benutzung des privaten Motorfahrzeugs abziehen, wenn einer der vier Fälle zutrifft.',
  isDone: (v) =>
    v.data.fehlenVonOev !== null ||
    v.data.zeitersparnisUeber1h !== null ||
    v.data.staendigeBenutzungArbeitszeit !== null ||
    v.data.keinOevWeilKrankOderGebrechlich !== undefined,

  hide: (v) => v.start !== true,
  form: {
    fields: [
      {
        label:
          'Fehlen eines öffentlichen Verkehrsmittels (nächste Haltestelle ist über 1 km entfernt oder es fährt kein öffentliches Verkehrsmittel zu Arbeitsbeginn oder -ende)',
        type: FormFieldType.Checkbox,
        lens: Lens.fromProp<TaxReturnData['autoMotorradArbeit']['data']>()('fehlenVonOev'),
      },
      {
        label: 'Zeitersparnis von über 1 Stunde bei Benützung des privaten Motorfahrzeuges',
        type: FormFieldType.Checkbox,
        lens: Lens.fromProp<TaxReturnData['autoMotorradArbeit']['data']>()('zeitersparnisUeber1h'),
      },
      {
        label:
          'Ständige Benützung während der Arbeitszeit auf Verlangen und gegen Entschädigung des Arbeitgebers (bitte Bescheinigung des Arztes beilegen)',
        type: FormFieldType.Checkbox,
        lens: Lens.fromProp<TaxReturnData['autoMotorradArbeit']['data']>()(
          'staendigeBenutzungArbeitszeit',
        ),
      },
      {
        label:
          'Unmöglichkeit der Benützung des öffentl. Verkehrsmittels zufolge Krankheit/Gebrechlichkeit',
        type: FormFieldType.Checkbox,
        lens: Lens.fromProp<TaxReturnData['autoMotorradArbeit']['data']>()(
          'keinOevWeilKrankOderGebrechlich',
        ),
      },
      // {
      //   label: 'Ist das benutzte private Fahrzeug geleast?',
      //   type: FormFieldType.Checkbox,
      //   lens: Lens.fromProp<TaxReturnData['autoMotorradArbeit']['data']>()('geleastesFahrzeug'),
      // },
    ],
  },
}

const autoMotorradArbeitWegeDetailScreen: ScreenT<
  'autoMotorradArbeitWege',
  TaxReturnData['autoMotorradArbeitWege']['data'][0]
> = {
  name: ScreenEnum.AutoMotorradArbeitWegeDetail,
  type: ScreenTypeEnum.ArrayForm,
  title: 'Motorfahrzeuge Hinzufügen',
  dataKey: 'autoMotorradArbeitWege',
  text: '',
  getLabel: (data) => data.arbeitsort || 'Not finished',
  overviewScreen: ScreenEnum.AutoMotorradArbeitWegeOverview,
  isDone: (v) => v.finished === true,
  hide: (_, v) =>
    v.autoMotorradArbeit.start !== true ||
    (!(v.autoMotorradArbeit.data.fehlenVonOev ?? false) &&
      !(v.autoMotorradArbeit.data.keinOevWeilKrankOderGebrechlich ?? false) &&
      !(v.autoMotorradArbeit.data.staendigeBenutzungArbeitszeit ?? false) &&
      !(v.autoMotorradArbeit.data.zeitersparnisUeber1h ?? false)),
  form: {
    fields: [
      {
        label: 'Arbeitsort',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Arbeitsort',
        },
        lens: Lens.fromProp<TaxReturnData['autoMotorradArbeitWege']['data'][0]>()('arbeitsort'),
      },
      {
        label: 'anzahl Arbeitstage',
        type: FormFieldType.NumberInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
        },
        lens: Lens.fromProp<TaxReturnData['autoMotorradArbeitWege']['data'][0]>()('anzahlArbeitstage'),
      },
      {
        label: 'anzahl km für ein Weg',
        type: FormFieldType.NumberInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'anzahl km',
        },
        lens: Lens.fromProp<TaxReturnData['autoMotorradArbeitWege']['data'][0]>()('anzahlKm'),
      },
      {
        label: 'fahrten pro Tag',
        type: FormFieldType.NumberInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'fahrten pro Tag',
        },
        lens: Lens.fromProp<TaxReturnData['autoMotorradArbeitWege']['data'][0]>()('fahrtenProTag'),
      },
      {
        label: 'Rappen pro km',
        type: FormFieldType.NumberSelectInput,
        items: [
          {
            label: 'Auto (70 Rappen/km)',
            value: 70,
          },
          {
            label: 'Motorrad (40 Rappen/km)',
            value: 40,
          },
        ],
        lens: Lens.fromProp<TaxReturnData['autoMotorradArbeitWege']['data'][0]>()('rappenProKm'),
      },
    ],
  },
}
const autoMotorradArbeitWegeOverviewScreen: ScreenT<
  'autoMotorradArbeitWege',
  TaxReturnData['autoMotorradArbeitWege']['data'][0]
> = {
  name: ScreenEnum.AutoMotorradArbeitWegeOverview,
  type: ScreenTypeEnum.ArrayOverview,
  title: 'Motorfahrzeuge Überblick',
  dataKey: 'autoMotorradArbeitWege',
  detailScreen: ScreenEnum.AutoMotorradArbeitWegeDetail,
  getLabel: (data) => data.arbeitsort || 'Not finished',
  getSublabel: ({ anzahlArbeitstage = 0, anzahlKm = 0, fahrtenProTag = 0, rappenProKm = 0 }) =>
    `CHF ${(parseInt(anzahlArbeitstage as any) * anzahlKm * fahrtenProTag * rappenProKm) / 100}`,
  isDone: (v) => v.finished === true,
  hide: (_, v) =>
    v.autoMotorradArbeit.start !== true ||
    (!(v.autoMotorradArbeit.data.fehlenVonOev ?? false) &&
      !(v.autoMotorradArbeit.data.keinOevWeilKrankOderGebrechlich ?? false) &&
      !(v.autoMotorradArbeit.data.staendigeBenutzungArbeitszeit ?? false) &&
      !(v.autoMotorradArbeit.data.zeitersparnisUeber1h ?? false)),
}

const verpflegungAufArbeitScreen: ScreenT<'verpflegungAufArbeit'> = {
  name: ScreenEnum.VerpflegungAufArbeit,
  type: ScreenTypeEnum.YesNo,
  title: 'Verpflegung auf der Arbeit',
  question: 'Nimmst du regelmäßig eine Mahlzeit während der Arbeit ein?',
  text: 'z.B. Mittagessen',
  dataKey: 'verpflegungAufArbeit',
  isDone: (v) => v.start !== undefined,
}

const tageVerpflegungAufArbeitScreen: ScreenT<
  'verpflegungAufArbeit',
  TaxReturnData['verpflegungAufArbeit']['data']
> = {
  name: ScreenEnum.TageVerpflegungAufArbeit,
  type: ScreenTypeEnum.ObjForm,
  dataKey: 'verpflegungAufArbeit',
  title: 'Tage Verpflegung Arbeit',
  helpText: 'Basierend darauf können wir dir bis zu CHF 3200 von den Steuern abziehen',
  form: {
    fields: [
      {
        label: 'Anzahl Tage im Jahr Verpflegung auf Arbeit',
        description: 'Ein volles Arbeitsjahr entspricht 260 Arbeitstagen',
        type: FormFieldType.NumberInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'anzahl Tage Verpflegung',
        },

        lens: Lens.fromProp<TaxReturnData['verpflegungAufArbeit']['data']>()('anzahlTage'),
      },
    ],
  },
  hide: (v) => v.start !== true,
  isDone: (v) => v.data.anzahlTage !== undefined,
}

const essenVerbilligungenVomArbeitgeberScreen: ScreenT<'essenVerbilligungenVomArbeitgeber'> = {
  name: ScreenEnum.EssenVerbilligungenVomArbeitgeber,
  type: ScreenTypeEnum.YesNo,
  title: 'Vergünstigung für auswärtige Verpflegung',
  question: 'Bekommst du Rabatte oder Unterstützung für dein Essen auf der Arbeit?',
  text: '',
  helpText:
    "Wenn der Arbeitgeber die Verpflegung verbilligt anbietet (z.B. in der Kantine, im Personalrestaurant, durch Essenszuschüsse oder Essensgutscheine), können pro Arbeitstag maximal CHF 7.50 geltend gemacht werden. Bei regelmässiger auswärtiger Verpflegung können im Jahr höchstens CHF 1'600 abgezogen werden.",
  dataKey: 'essenVerbilligungenVomArbeitgeber',
  isDone: (v) => v.start !== undefined,
  hide: (_, v) => v.verpflegungAufArbeit.start !== true,
}

const schichtarbeitScreen: ScreenT<'schichtarbeit'> = {
  name: ScreenEnum.Schichtarbeit,
  type: ScreenTypeEnum.YesNo,
  title: 'Schicht-/Nachtarbeit',
  question: 'Arbeitest du regelmäßig in der Nacht oder in Schichten, die mindestens 8 Stunden dauern?',
  helpText: `Falls ja, können wir dir pro Schichttag CHF 15 von den Steuern abziehen (max. CHF 3'200/Jahr)`,
  dataKey: 'schichtarbeit',
  isDone: (v) => v.start !== undefined,
}

const tageSchichtArbeitScreen: ScreenT<'schichtarbeit', TaxReturnData['schichtarbeit']['data']> = {
  name: ScreenEnum.tageSchichtArbeit,
  type: ScreenTypeEnum.ObjForm,
  dataKey: 'schichtarbeit',
  title: 'Tage Schichtarbeit',

  form: {
    fields: [
      {
        label: 'Anzahl Tage im Jahr Schichtarbeit',
        type: FormFieldType.NumberInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'anzahl Tage Schichtarbeit',
        },
        lens: Lens.fromProp<TaxReturnData['schichtarbeit']['data']>()('wieVieleTageImJahr'),
      },
    ],
  },
  hide: (v) => v.start !== true,
  isDone: (v) => v.data.wieVieleTageImJahr !== undefined,
}

const wochenaufenthaltScreen: ScreenT<'wochenaufenthalt'> = {
  name: ScreenEnum.Wochenaufenthalt,
  type: ScreenTypeEnum.YesNo,
  title: 'Wochenaufenthalt',
  question:
    'Lebst du während der Arbeitswoche an einem anderen Ort und kehrst nur am Wochenende nach Hause zurück?',
  text: '',
  dataKey: 'wochenaufenthalt',
  isDone: (v) => v.start !== undefined,
}
const wochenaufenthaltOverviewScreen: ScreenT<
  'wochenaufenthalt',
  TaxReturnData['wochenaufenthalt']['data'][0]
> = {
  name: ScreenEnum.WochenaufenthaltOverview,
  type: ScreenTypeEnum.ArrayOverview,
  title: 'Überblick',
  dataKey: 'wochenaufenthalt',
  helpText: `Mehrkosten bei auswärtigem Wochenaufenthalt sind abzugsfähig. Dazu zählen beruflich bedingte Mehrkosten für Verpflegung, Unterkunft und wöchentliche Heimkehr. Für auswärtige Verpflegung beim Abendessen können CHF 15 pro Arbeitstag oder bei ganzjährigem Wochenaufenthalt CHF 3’200 jährlich abgezogen werden. Als Unterkunftsmehrkosten gilt der Mietzins für ein Zimmer. Für die wöchentliche Heimkehr sind in der Regel nur Kosten für öffentliche Verkehrsmittel (z. B. SBB-Generalabonnement) abziehbar; diese sind unter Ziffer 1 des Berufsauslagenblatts aufzuführen.`,
  detailScreen: ScreenEnum.WochenaufenthaltDetail,
  getLabel: (data) => data.bezeichung || 'Not finished',
  getSublabel: (data) => `CHF ${data.betrag || 0}`,
  isDone: (v) => v.finished === true,
  hide: (v) => v.start !== true,
}

const wochenaufenthaltDetailScreen: ScreenT<
  'wochenaufenthalt',
  TaxReturnData['wochenaufenthalt']['data'][0]
> = {
  name: ScreenEnum.WochenaufenthaltDetail,
  type: ScreenTypeEnum.ArrayForm,
  title: 'Wochenaufenthalt Hinzufügen',
  dataKey: 'wochenaufenthalt',
  helpText: `Mehrkosten bei auswärtigem Wochenaufenthalt sind abzugsfähig. Dazu zählen beruflich bedingte Mehrkosten für Verpflegung, Unterkunft und wöchentliche Heimkehr. Für auswärtige Verpflegung beim Abendessen können CHF 15 pro Arbeitstag oder bei ganzjährigem Wochenaufenthalt CHF 3’200 jährlich abgezogen werden. Als Unterkunftsmehrkosten gilt der Mietzins für ein Zimmer. Für die wöchentliche Heimkehr sind in der Regel nur Kosten für öffentliche Verkehrsmittel (z. B. SBB-Generalabonnement) abziehbar; diese sind unter Ziffer 1 des Berufsauslagenblatts aufzuführen.`,
  getLabel: (data) => data.bezeichung || 'Not finished',
  overviewScreen: ScreenEnum.WochenaufenthaltOverview,
  isDone: (v) => v.finished === true,
  hide: (v) => v.start !== true,
  form: {
    fields: [
      {
        label: 'Datum',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Datum',
        },
        lens: Lens.fromProp<TaxReturnData['wochenaufenthalt']['data'][0]>()('datum'),
      },
      {
        label: 'Bezeichnung',
        type: FormFieldType.TextInput,
        lens: Lens.fromProp<TaxReturnData['wochenaufenthalt']['data'][0]>()('bezeichung'),
      },
      {
        label: 'Betrag',
        type: FormFieldType.CurrencyInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'Betrag',
        },
        lens: Lens.fromProp<TaxReturnData['wochenaufenthalt']['data'][0]>()('betrag'),
      },
    ],
  },
}

const inAusbildungScreen: ScreenT<'inAusbildung'> = {
  name: ScreenEnum.InAusbildungYesNo,
  type: ScreenTypeEnum.YesNo,
  title: 'Berufsorientierte Aus- und Weiterbildung',
  text: '',
  question: 'Hast du in letzter Zeit eine berufliche Weiterbildung oder Schulung gemacht?',
  dataKey: 'inAusbildung',
  isDone: (v) => v.start !== undefined,
}

const inAusbildungOverview: ScreenT<'inAusbildung', TaxReturnData['inAusbildung']['data'][0]> = {
  name: ScreenEnum.InAusbildungOverview,
  type: ScreenTypeEnum.ArrayOverview,
  title: 'Übersicht Aus- und Weiterbildung',
  dataKey: 'inAusbildung',
  helpText: `Gib die Kosten der Aus- oder Weiterbildung an die du besucht hast.
  Massgebend für den Zeitpunkt der Abzugsfähigkeit der berufsorientierten Aus- und Weiterbildungskosten ist die Fälligkeit bzw. die Zahlung und nicht der Kursbesuch.`,
  detailScreen: ScreenEnum.InAusbildungDetail,
  getLabel: (data) => data.bezeichung || 'Not finished',
  getSublabel: (data) => `CHF ${data.betrag || 0}`,
  isDone: (v) => v.data.length > 0,
  hide: (v) => v.start !== true,
}

const inAusbildungDetail: ScreenT<'inAusbildung', TaxReturnData['inAusbildung']['data'][0]> = {
  name: ScreenEnum.InAusbildungDetail,
  type: ScreenTypeEnum.ArrayForm,
  title: 'Ausbildung Detail',
  dataKey: 'inAusbildung',
  helpText: `Gib die Kosten der Aus- oder Weiterbildung an die du besucht hast.
   Massgebend für den Zeitpunkt der Abzugsfähigkeit der berufsorientierten Aus- und Weiterbildungskosten ist die Fälligkeit bzw. die Zahlung und nicht der Kursbesuch.`,
  getLabel: (data) => data.bezeichung || 'Not finished',
  overviewScreen: ScreenEnum.InAusbildungOverview,
  form: {
    fields: [
      {
        label: 'Bezeichung',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Bezeichung',
        },
        lens: Lens.fromProp<TaxReturnData['inAusbildung']['data'][0]>()('bezeichung'),
      },
      {
        label: 'Betrag',
        type: FormFieldType.CurrencyInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: '',
        },
        lens: Lens.fromProp<TaxReturnData['inAusbildung']['data'][0]>()('betrag'),
      },
      // NOTE: betragArbeitGeber is in beitragArbeitgeberAusbildung, not inAusbildung
      // This field should be removed or moved to correct screen
      // {
      //   label: 'Wie viel hat dein Arbeitgeber daran bezahlt?',
      //   type: FormFieldType.CurrencyInput,
      //   inputProps: {
      //     autoCorrect: false,
      //     keyboardType: 'number-pad',
      //     maxLength: 16,
      //     placeholder: '',
      //   },
      //   lens: Lens.fromProp<TaxReturnData['inAusbildung']['data'][0]>()('betragArbeitGeber'),
      // },
    ],
  },
  isDone: (v) => v.finished === true,
  hide: (v) => v.start !== true,
}

const saeule2YesNoScreen: ScreenT<'saeule2'> = {
  name: ScreenEnum.Saeule2YesNo,
  type: ScreenTypeEnum.YesNo,
  dataKey: 'saeule2',
  title: 'Säule 2',
  text: 'Du kannst das im Lohnausweis nachschauen bei 10.1 und 10.2 wenn da zahlen stehen dann clicke auf Ja.',
  question: 'Hat dein Arbeitgeber in deine Pensionskasse (Säule 2) eingezahlt?',
  isDone: (v) => v.start !== undefined,
}

const saeule3aYesNoScreen: ScreenT<'saeule3a'> = {
  name: ScreenEnum.Saeule3aYesNo,
  type: ScreenTypeEnum.YesNo,
  dataKey: 'saeule3a',
  title: 'Säule 3a',
  text: '',
  helpText: `Einzutragen sind die 2024 tatsächlich bezahlten Prämien und Beiträge an die gebundene Selbstvorsorge (Säule 3a):
• Mit beruflicher Vorsorge (2. Säule): maximal CHF 7’056
• Ohne berufliche Vorsorge: 20% des Erwerbseinkommens, höchstens CHF 35’280
Belege der Versicherung oder Bankstiftung sind beizulegen.`,
  question: 'Hast du in die private Altersvorsorge (Säule 3a) eingezahlt?',
  isDone: (v) => v.start !== undefined,
}

const saeule3aAmountScreen: ScreenT<'saeule3a', TaxReturnData['saeule3a']['data']> = {
  name: ScreenEnum.Saeule3aAmount,
  type: ScreenTypeEnum.ObjForm,
  dataKey: 'saeule3a',
  title: 'Säule 3a',
  isDone: (v) => v.data.betrag !== undefined,
  hide: (v) => v.start !== true,
  form: {
    fields: [
      {
        label: 'Wie viel hast du in die Säule 3a eingezahlt?',
        type: FormFieldType.CurrencyInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'Betrag eingezahlt in Säule 3a',
        },
        lens: Lens.fromProp<TaxReturnData['saeule3a']['data']>()('betrag'),
      },
    ],
  },
}

const versicherungspraemieYesNoScreen: ScreenT<'versicherungspraemie'> = {
  name: ScreenEnum.VersicherungspraemieYesNo,
  type: ScreenTypeEnum.YesNo,
  dataKey: 'versicherungspraemie',
  title: 'Versicherungsprämien',
  text: 'z.B. für Kranken-, Auto- oder Hausratversicherung',
  question: 'Hast du dieses Jahr Versicherungsbeiträge gezahlt?',
  isDone: (v) => v.start !== undefined,
}

const versicherungspraemieAmountScreen: ScreenT<
  'versicherungspraemie',
  TaxReturnData['versicherungspraemie']['data']
> = {
  name: ScreenEnum.VersicherungspraemieAmount,
  type: ScreenTypeEnum.ObjForm,
  dataKey: 'versicherungspraemie',
  title: 'Säule 3a',
  isDone: (v) => v.data.betrag !== undefined,
  hide: (v) => v.start !== true,
  form: {
    fields: [
      {
        label: 'Wie viel hast du an Versicherungsprämie bezahlt?',
        type: FormFieldType.CurrencyInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'Versicherungsprämie Betrag',
        },
        lens: Lens.fromProp<TaxReturnData['versicherungspraemie']['data']>()('betrag'),
      },
    ],
  },
}

const privateUnfallYesNoScreen: ScreenT<'privateUnfall'> = {
  name: ScreenEnum.PrivateUnfallYesNo,
  type: ScreenTypeEnum.YesNo,
  dataKey: 'privateUnfall',
  title: 'Private Unfallversicherungsgebühren',
  text: '',
  question: 'Hast du eine private Unfallversicherung abgeschlossen und Beiträge gezahlt?',
  isDone: (v) => v.start !== undefined,
}
const privateUnfallAmountScreen: ScreenT<'privateUnfall', TaxReturnData['privateUnfall']['data']> = {
  name: ScreenEnum.PrivateUnfallAmount,
  type: ScreenTypeEnum.ObjForm,
  dataKey: 'privateUnfall',
  title: 'Private Unfallversicherungsgebühren',
  isDone: (v) => v.data.betrag !== undefined,
  hide: (v) => v.start !== true,
  form: {
    fields: [
      {
        label: 'Wie viel hast du an die Private Unfallversicherung bezahlt?',
        type: FormFieldType.CurrencyInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'Private Unfallversicherung Betrag',
        },
        lens: Lens.fromProp<TaxReturnData['privateUnfall']['data']>()('betrag'),
      },
    ],
  },
}

const spendenYesNoScreen: ScreenT<'spenden'> = {
  name: ScreenEnum.SpendenYesNo,
  type: ScreenTypeEnum.YesNo,
  dataKey: 'spenden',
  title: 'Spenden',
  text: '',
  helpText: `Abzugsfähig sind freiwillige Geld- und Vermögenszuwendungen an Bund, Kantone, Gemeinden oder steuerbefreite gemeinnützige Institutionen in der Schweiz, sofern sie im Steuerjahr mindestens CHF 100 betragen und 20% des Nettoeinkommens (Ziffer 21) nicht übersteigen. Eine Aufstellung der Zuwendungen ist beizulegen.`,
  question: 'Hast du dieses Jahr gespendet?',
  isDone: (v) => v.start !== undefined,
}

const spendenDetailScreen: ScreenT<'spenden', TaxReturnData['spenden']['data'][0]> = {
  name: ScreenEnum.SpendenDetail,
  type: ScreenTypeEnum.ArrayForm,
  title: 'Spenden',
  dataKey: 'spenden',
  getLabel: (data) => data.bezeichnung || 'Not finished',
  overviewScreen: ScreenEnum.SpendenOverview,
  isDone: (v) => v.finished === true,
  hide: (v) => v.start !== true,
  form: {
    fields: [
      {
        label: 'Datum',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: '20.10.2015',
        },
        lens: Lens.fromProp<TaxReturnData['spenden']['data'][0]>()('datum'),
      },
      {
        label: 'Bezeichnung',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Bezeichnung',
        },
        lens: Lens.fromProp<TaxReturnData['spenden']['data'][0]>()('bezeichnung'),
      },
      {
        label: 'Betrag',
        type: FormFieldType.CurrencyInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'Betrag',
        },
        lens: Lens.fromProp<TaxReturnData['spenden']['data'][0]>()('betrag'),
      },
    ],
  },
}

const spendenOverviewScreen: ScreenT<'spenden', TaxReturnData['spenden']['data'][0]> = {
  name: ScreenEnum.SpendenOverview,
  type: ScreenTypeEnum.ArrayOverview,
  title: 'Übersicht Spenden',
  dataKey: 'spenden',
  detailScreen: ScreenEnum.SpendenDetail,
  getLabel: (data) => data.bezeichnung || 'Not finished',
  getSublabel: (data) => `CHF ${data.betrag || 0}`,
  isDone: (v) => v.finished === true,
  hide: (v) => v.start !== true,
}

const bargeldYesNoScreen: ScreenT<'bargeld'> = {
  name: ScreenEnum.BargeldYesNo,
  type: ScreenTypeEnum.YesNo,
  dataKey: 'bargeld',
  title: 'Bargeld',
  text: '',
  question: 'Hast du grosse Mengen Bargeld?',
  isDone: (v) => v.start !== undefined,
}

const bargeldAmountScreen: ScreenT<'bargeld', TaxReturnData['bargeld']['data']> = {
  name: ScreenEnum.BargeldAmount,
  type: ScreenTypeEnum.ObjForm,
  dataKey: 'bargeld',
  title: 'Bargeld',
  helpText: `Falls du signifikante Mengen an Bargeld besitzt, musst du diese hier angeben.`,
  isDone: (v) => v.data.betrag !== undefined,
  hide: (v) => v.start !== true,
  form: {
    fields: [
      {
        label: 'Wie viel Bargeld besitzt du?',
        type: FormFieldType.CurrencyInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'Betrag Bargeld',
        },
        lens: Lens.fromProp<TaxReturnData['bargeld']['data']>()('betrag'),
      },
    ],
  },
}
const edelmetalleYesNoScreen: ScreenT<'edelmetalle'> = {
  name: ScreenEnum.EdelmetalleYesNo,
  type: ScreenTypeEnum.YesNo,
  dataKey: 'edelmetalle',
  title: 'Edelmetalle',
  helpText: 'Falls ja dann ist der Wert zum Tageskurs anzugeben',
  question: 'Besitzt du größere Mengen Edelmetalle?',
  text: 'z.B. Gold, Silber',
  isDone: (v) => v.start !== undefined,
}

const edelmetalleAmount: ScreenT<'edelmetalle', TaxReturnData['edelmetalle']['data']> = {
  name: ScreenEnum.EdelmetalleAmount,
  type: ScreenTypeEnum.ObjForm,
  dataKey: 'edelmetalle',
  title: 'Edelmetalle',
  isDone: (v) => v.data.betrag !== undefined,
  hide: (v) => v.start !== true,
  form: {
    fields: [
      {
        label: 'Wie viel Wert haben alle deine Edelmetalle??',
        type: FormFieldType.CurrencyInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'Total Wert Edelmetalle',
        },
        lens: Lens.fromProp<TaxReturnData['bargeld']['data']>()('betrag'),
      },
    ],
  },
}

const bankkontoOverview: ScreenT<'bankkonto', TaxReturnData['bankkonto']['data'][0]> = {
  name: ScreenEnum.BankkontoOverview,
  type: ScreenTypeEnum.ArrayOverview,
  title: 'Bankkonten',
  dataKey: 'bankkonto',
  text: `Gib alle Bankkonten (im In- oder Ausland) hier an.`,
  detailScreen: ScreenEnum.BankkontoDetail,
  getLabel: (data) => data.bezeichnung || 'Not finished',
  getSublabel: (data) => `CHF ${data.steuerwertEndeJahr || 0}`,
  isDone: (v) => v.finished === true,
}

const bankkontoDetail: ScreenT<'bankkonto', TaxReturnData['bankkonto']['data'][0]> = {
  name: ScreenEnum.BankkontoDetail,
  type: ScreenTypeEnum.ArrayForm,
  title: 'Bankkonto',
  dataKey: 'bankkonto',
  text: '',
  helpText: `Gib alle deine Bankkonten hier an`,
  getLabel: (data) => data.bezeichnung || 'Not finished',
  overviewScreen: ScreenEnum.BankkontoOverview,
  isDone: (v) => v.finished === true,
  form: {
    fields: [
      {
        label: 'Bank, Gesellschaft',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Name der Bank',
        },
        lens: Lens.fromProp<TaxReturnData['bankkonto']['data'][0]>()('bankGesellschaft'),
      },
      {
        label: 'Konto-/Depot-Nr.',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Konto-/Depot-Nr.',
        },
        lens: Lens.fromProp<TaxReturnData['bankkonto']['data'][0]>()('kontoOderDepotNr'),
      },
      {
        label: 'Staat',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Staat',
        },
        lens: Lens.fromProp<TaxReturnData['bankkonto']['data'][0]>()('staat'),
      },
      {
        label: 'Bezeichnung',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Bezeichnung',
        },
        lens: Lens.fromProp<TaxReturnData['bankkonto']['data'][0]>()('bezeichnung'),
      },
      {
        label: 'Währung',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Währung',
        },
        lens: Lens.fromProp<TaxReturnData['bankkonto']['data'][0]>()('waehrung'),
      },
      {
        label: 'Total Guthaben ende Jahr',
        type: FormFieldType.NumberInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'Total Guthaben ende Jahr',
        },
        lens: Lens.fromProp<TaxReturnData['bankkonto']['data'][0]>()('steuerwertEndeJahr'),
      },
      {
        label: 'Wurde eine Verrechnungsstyeuer abgezogen vom Zins? (Bruttozins über 200 CHF)',
        type: FormFieldType.Checkbox,
        lens: Lens.fromProp<TaxReturnData['bankkonto']['data'][0]>()('zinsUeber200'),
      },
      {
        label: 'Brutto Zinsbetrag (Voller Zinsbetrag ohne Abzug)',
        type: FormFieldType.NumberInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'Brutto Zinsbetrag',
        },
        lens: Lens.fromProp<TaxReturnData['bankkonto']['data'][0]>()('zinsbetrag'),
      },
    ],
  },
}

const aktienYesNoScreen: ScreenT<'aktien'> = {
  name: ScreenEnum.AktienYesNo,
  type: ScreenTypeEnum.YesNo,
  dataKey: 'aktien',
  title: 'Aktien',
  text: 'Gib alle Aktien an die du besitzt.',
  question: 'Besitzt du Aktien?',
  isDone: (v) => v.start !== undefined,
  noScreen: ScreenEnum.KryptoYesNo,
}

const aktienDetailScreen: ScreenT<'aktien', TaxReturnData['aktien']['data'][0]> = {
  name: ScreenEnum.AktienDetail,
  type: ScreenTypeEnum.ArrayForm,
  title: 'Aktien',
  dataKey: 'aktien',
  text: '',
  getLabel: (data) => data.gesellschaftTitel || 'Not finished',
  overviewScreen: ScreenEnum.AktienOverview,
  isDone: (v) => v.finished === true,
  form: {
    fields: [
      {
        label: 'Valoren-Nr.',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Valoren-Nr.',
        },
        lens: Lens.fromProp<TaxReturnData['aktien']['data'][0]>()('valorenNr'),
      },
      {
        label: 'ISIN',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'ISIN',
        },
        lens: Lens.fromProp<TaxReturnData['aktien']['data'][0]>()('ISIN'),
      },
      {
        label: 'Gesellschaft, Titel',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Gesellschaft, Titel',
        },
        lens: Lens.fromProp<TaxReturnData['aktien']['data'][0]>()('gesellschaftTitel'),
      },

      {
        label: 'Staat',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Staat',
        },
        lens: Lens.fromProp<TaxReturnData['aktien']['data'][0]>()('staat'),
      },

      {
        label: 'Währung',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Währung',
        },
        lens: Lens.fromProp<TaxReturnData['aktien']['data'][0]>()('waehrung'),
      },
      {
        label: 'Stückzahl',
        type: FormFieldType.NumberInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'Stückzahl',
        },
        lens: Lens.fromProp<TaxReturnData['aktien']['data'][0]>()('stueckzahl'),
      },
      {
        label: 'Steuerwert pro Stück',
        type: FormFieldType.NumberInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'Steuerwert pro Stück',
        },
        lens: Lens.fromProp<TaxReturnData['aktien']['data'][0]>()('steuerwertProStueck'),
      },
      {
        label: 'Steuerwert per 31.12.',
        type: FormFieldType.NumberInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'Steuerwert',
        },
        lens: Lens.fromProp<TaxReturnData['aktien']['data'][0]>()('steuerwertEndeJahr'),
      },
    ],
  },
}
const aktienOverviewScreen: ScreenT<'aktien', TaxReturnData['aktien']['data'][0]> = {
  name: ScreenEnum.AktienOverview,
  type: ScreenTypeEnum.ArrayOverview,
  title: 'Aktien Überblick',
  text: 'Gib alle Aktien an die du besitzt.',
  dataKey: 'aktien',
  detailScreen: ScreenEnum.AktienDetail,
  getLabel: (data) => data.gesellschaftTitel || 'Not finished',
  getSublabel: ({ steuerwertEndeJahr = 0, stueckzahl = 0 }) =>
    `CHF ${steuerwertEndeJahr * stueckzahl || 0}`,
  isDone: (v) => v.finished === true,
}

const kryptoYesNoScreen: ScreenT<'krypto'> = {
  name: ScreenEnum.KryptoYesNo,
  type: ScreenTypeEnum.YesNo,
  dataKey: 'krypto',
  title: 'Kryptowährungen',
  text: '',
  question: 'Besitzt du Kryptowährungen?',
  isDone: (v) => v.start !== undefined,
  noScreen: ScreenEnum.MotorfahrzeugYesNo,
}

const kryptoDetailScreen: ScreenT<'krypto', TaxReturnData['krypto']['data'][0]> = {
  name: ScreenEnum.KryptoDetail,
  type: ScreenTypeEnum.ArrayForm,
  title: 'Kryptowährungen',
  dataKey: 'krypto',
  text: '',
  getLabel: (data) => data.waehrung || 'Not finished',
  overviewScreen: ScreenEnum.KryptoOverview,
  isDone: (v) => v.finished === true,
  form: {
    fields: [
      {
        label: 'Bank, Gesellschaft',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Bank, Gesellschaft',
        },
        lens: Lens.fromProp<TaxReturnData['krypto']['data'][0]>()('bank'),
      },

      {
        label: 'Kryptowährung',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Kryptowährung',
        },
        lens: Lens.fromProp<TaxReturnData['krypto']['data'][0]>()('waehrung'),
      },
      {
        label: 'Stückzahl',
        type: FormFieldType.NumberInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'Stückzahl',
        },
        lens: Lens.fromProp<TaxReturnData['krypto']['data'][0]>()('stueckzahl'),
      },
      {
        label: 'Steuerwert pro Stück',
        type: FormFieldType.NumberInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'Steuerwert pro Stück',
        },
        lens: Lens.fromProp<TaxReturnData['krypto']['data'][0]>()('steuerwertProStueck'),
      },
      {
        label: 'Steuerwert per 31.12.',
        type: FormFieldType.NumberInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'Steuerwert',
        },
        lens: Lens.fromProp<TaxReturnData['krypto']['data'][0]>()('steuerwert'),
      },
    ],
  },
}
const kryptoOverviewScreen: ScreenT<'krypto', TaxReturnData['krypto']['data'][0]> = {
  name: ScreenEnum.KryptoOverview,
  type: ScreenTypeEnum.ArrayOverview,
  title: 'Überblick Kryptowährungen',
  text: 'Gib alle Kryptowährungen an die du besitzt.',
  dataKey: 'krypto',
  detailScreen: ScreenEnum.KryptoDetail,
  getLabel: (data) => data.waehrung || 'Not finished',
  getSublabel: ({ steuerwertProStueck = 0, stueckzahl = 0, ...data }) =>
    `CHF ${steuerwertProStueck * stueckzahl || 0}`,
  isDone: (v) => v.finished === true,
}

const motorfahrzeugYesNoScreen: ScreenT<'motorfahrzeug'> = {
  name: ScreenEnum.MotorfahrzeugYesNo,
  type: ScreenTypeEnum.YesNo,
  dataKey: 'motorfahrzeug',
  title: 'Motorfahrzeug',
  text: '',
  question: 'Hast du ein eigenes Auto oder Motorrad?',
  isDone: (v) => v?.start !== undefined,
}
const motorfahrzeugDetailScreen: ScreenT<'motorfahrzeug', TaxReturnData['motorfahrzeug']['data']> = {
  name: ScreenEnum.MotorfahrzeugDetail,
  type: ScreenTypeEnum.ObjForm,
  dataKey: 'motorfahrzeug',
  title: 'Motorfahrzeug',
  isDone: (v) =>
    v.data.bezeichung !== undefined && v.data.kaufjahr !== undefined && v.data.kaufpreis !== undefined,
  hide: (v) => v?.start !== true,
  form: {
    fields: [
      {
        label: 'Bezeichnung',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Bezeichnung',
        },
        lens: Lens.fromProp<TaxReturnData['motorfahrzeug']['data']>()('bezeichung'),
      },

      {
        label: 'Kaufjahr',
        type: FormFieldType.NumberInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'Kaufjahr',
        },
        lens: Lens.fromProp<TaxReturnData['motorfahrzeug']['data']>()('kaufjahr'),
      },
      {
        label: 'Kaufpreis',
        type: FormFieldType.CurrencyInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'Kaufpreis',
        },
        lens: Lens.fromProp<TaxReturnData['motorfahrzeug']['data']>()('kaufpreis'),
      },
    ],
  },
}

const personalienScreen: ScreenT<'personData', TaxReturnData['personData']['data']> = {
  name: ScreenEnum.Personalien,
  type: ScreenTypeEnum.ObjForm,
  dataKey: 'personData',
  title: 'Personalien Überprüfen',
  isDone: (v) => {
    const d = v.data
    return !!(
      d.vorname &&
      d.nachname &&
      d.geburtsdatum &&
      d.zivilstand &&
      d.konfession &&
      d.gemeindeBfsNumber &&
      d.beruf &&
      d.adresse &&
      d.plz &&
      d.stadt &&
      d.email
    )
  },
  form: {
    fields: [
      {
        label: 'Vorname',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Vorname',
        },
        lens: Lens.fromProp<TaxReturnData['personData']['data']>()('vorname'),
      },
      {
        label: 'Nachname',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Nachname',
        },
        lens: Lens.fromProp<TaxReturnData['personData']['data']>()('nachname'),
      },
      {
        label: 'Geburtsdatum',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Geburtsdatum',
        },
        lens: Lens.fromProp<TaxReturnData['personData']['data']>()('geburtsdatum'),
      },
      {
        label: 'Zivilstand',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Zivilstand',
        },
        lens: Lens.fromProp<TaxReturnData['personData']['data']>()('zivilstand'),
      },
      {
        label: 'Konfession',
        type: FormFieldType.SelectInput,
        items: [
          {
            label: 'Reformiert',
            value: 'reformiert',
          },
          {
            label: 'Römisch-katholisch',
            value: 'roemischKatholisch',
          },
          {
            label: 'Christ-katholisch',
            value: 'christKatholisch',
          },
          {
            label: 'Andere',
            value: 'andere',
          },
          {
            label: 'Keine',
            value: 'keine',
          },
        ],
        lens: Lens.fromProp<TaxReturnData['personData']['data']>()('konfession'),
      },
      {
        label: 'Gemeinde',
        type: FormFieldType.NumberSelectInput,
        inputProps: {
          placeholder: 'Gemeinde auswählen',
        },
        // Items will be populated dynamically in FormObj.template.tsx
        items: [],
        lens: Lens.fromProp<TaxReturnData['personData']['data']>()('gemeindeBfsNumber'),
      },
      {
        label: 'Beruf',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Beruf',
        },
        lens: Lens.fromProp<TaxReturnData['personData']['data']>()('beruf'),
      },
      {
        label: 'Adresse',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Musterstrasse 30',
        },
        lens: Lens.fromProp<TaxReturnData['personData']['data']>()('adresse'),
      },
      {
        label: 'PLZ',
        type: FormFieldType.NumberInput,
        inputProps: {
          autoCorrect: false,
          keyboardType: 'number-pad',
          maxLength: 16,
          placeholder: 'Postleitzahl',
        },
        lens: Lens.fromProp<TaxReturnData['personData']['data']>()('plz'),
      },
      {
        label: 'Stadt',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Zürich',
        },
        lens: Lens.fromProp<TaxReturnData['personData']['data']>()('stadt'),
      },
      {
        label: 'E-Mail',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'E-Mail',
          keyboardType: 'email-address',
        },
        lens: Lens.fromProp<TaxReturnData['personData']['data']>()('email'),
      },
    ],
  },
}

const rueckzahlungBankScreen: ScreenT<'rueckzahlungBank', TaxReturnData['rueckzahlungBank']['data']> = {
  name: ScreenEnum.RueckzahlungBank,
  type: ScreenTypeEnum.ObjForm,
  dataKey: 'rueckzahlungBank',
  title: 'Bankdaten Überprüfen',
  helpText: '',
  isDone: (v) =>
    v?.data?.nachname !== undefined && v?.data?.vorname !== undefined && v?.data?.iban !== undefined,
  form: {
    fields: [
      {
        label: 'Nachname',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Nachname',
        },
        lens: Lens.fromProp<TaxReturnData['rueckzahlungBank']['data']>()('nachname'),
      },
      {
        label: 'Vorname',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'Vorname',
        },
        lens: Lens.fromProp<TaxReturnData['rueckzahlungBank']['data']>()('vorname'),
      },
      {
        label: 'IBAN',
        type: FormFieldType.TextInput,
        inputProps: {
          placeholder: 'IBAN',
          autoCapitalize: 'characters',
          autoCorrect: false,
        },
        lens: Lens.fromProp<TaxReturnData['rueckzahlungBank']['data']>()('iban'),
      },
    ],
  },
}

const eignungsfragenOverviewScreen: ScreenT<'motorfahrzeug', TaxReturnData['motorfahrzeug']['data']> = {
  name: ScreenEnum.Eignungsfragen,
  type: ScreenTypeEnum.CategoryOverview,
  helpText:
    'Wir stellen dir ein paar Eignungsfragen, um sicherzugehen, dass du die App auch benutzen kannst.',
  title: 'Eignungsfragen',
}

const einkuenfteOverviewScreen: ScreenT<'motorfahrzeug', TaxReturnData['motorfahrzeug']['data']> = {
  name: ScreenEnum.Einkuenfte,
  type: ScreenTypeEnum.CategoryOverview,
  helpText:
    'Hier musst du all deine Einkünfte angeben. Für jeden Ort, an dem du gearbeitet hast, solltest du einen Lohnausweis erhalten haben, den du dann einscannen oder manuell hier eintragen kannst.',
  title: 'Einkünfte',
}

const abzuegeOverviewScreen: ScreenT<'motorfahrzeug', TaxReturnData['motorfahrzeug']['data']> = {
  name: ScreenEnum.Abzuege,
  type: ScreenTypeEnum.CategoryOverview,
  helpText:
    'Alles, was du hier eingibst, können wir bei der Steuerberechnung von deinen Einkünften abziehen und dir dadurch Geld ersparen.',
  title: 'Abzüge',
  isDone: (_, allData) => {
    // Show green tick if any deduction array has at least one entry
    return (
      (allData?.autoMotorradArbeitWege?.data?.length ?? 0) > 0 ||
      (allData?.wochenaufenthalt?.data?.length ?? 0) > 0 ||
      (allData?.inAusbildung?.data?.length ?? 0) > 0 ||
      (allData?.spenden?.data?.length ?? 0) > 0
    )
  },
}

const vermoegenOverviewScreen: ScreenT<'motorfahrzeug', TaxReturnData['motorfahrzeug']['data']> = {
  name: ScreenEnum.Vermoegen,
  type: ScreenTypeEnum.CategoryOverview,
  helpText:
    'Hier musst du dein Vermögen angeben, das aus Bargeld, Edelmetallen, Bankkonten, Kryptowährungen, Aktien und Motorfahrzeugen bestehen kann.',
  title: 'Vermögen',
  isDone: (_, allData) => {
    // Show green tick if any asset has been added
    return (
      (allData?.bankkonto?.data?.length ?? 0) > 0 ||
      (allData?.aktien?.data?.length ?? 0) > 0 ||
      (allData?.krypto?.data?.length ?? 0) > 0 ||
      (allData?.motorfahrzeug?.data?.kaufpreis !== undefined && allData?.motorfahrzeug?.data?.kaufpreis !== null) ||
      (allData?.bargeld?.data?.betrag !== undefined && allData?.bargeld?.data?.betrag !== null) ||
      (allData?.edelmetalle?.data?.betrag !== undefined && allData?.edelmetalle?.data?.betrag !== null)
    )
  },
}

const endOverviewScreen: ScreenT<'motorfahrzeug', TaxReturnData['motorfahrzeug']['data']> = {
  name: ScreenEnum.Uebersicht,
  type: ScreenTypeEnum.CategoryOverview,
  title: 'Übersicht',
}

const lohausweisUpload: ScreenT<'geldVerdient', TaxReturnData['geldVerdient']['data'][0]> = {
  name: ScreenEnum.LohnausweisHochladen,
  type: ScreenTypeEnum.ScanOrUploadArray,
  title: 'Lohnausweis hochladen',
  text: 'Bitte lade deinen Lohnausweis hoch.',
  helpText:
    'Ein Lohnausweis ist ein offizielles Dokument in der Schweiz, das von Arbeitgebern ausgestellt wird und das Einkommen sowie die Sozialversicherungsabzüge eines Arbeitnehmers für ein Kalenderjahr detailliert auflistet. Er dient als Grundlage für die Steuererklärung und die Berechnung der Sozialversicherungsbeiträge.',
  isDone: () => false,
  dataKey: 'geldVerdient',
  updateItem: (res, _) => {
    // Type guard: Check if res.data has lohn property (LohnausweisScanT)
    if ('lohn' in (res.data || {})) {
      const lohnData = (res.data as any).lohn
      return {
        arbeitgeber: lohnData?.arbeitgeber,
        arbeitsort: lohnData?.arbeitsort,
        nettolohn: lohnData?.nettolohn,
        bis: lohnData?.bis,
        von: lohnData?.von,
      }
    }
    return {}
  },
  // hier alle notwendigen updates machen
  update: (res, data) => {
    // Type guard: Check if res.data has lohn and personData properties
    if ('lohn' in (res.data || {}) && 'personData' in (res.data || {})) {
      const resData = res.data as any
      return {
        ...data,
        personData: {
          ...data.personData,
          data: {
            ...data.personData.data,
            vorname: resData.personData?.vorname,
            nachname: resData.personData?.nachname,
            adresse: resData.personData?.adresse,
            plz: resData.personData?.plz,
            stadt: resData.personData?.stadt,
            geburtsdatum: resData.personData?.geburtsdatum,
          },
        },
        saeule2: {
          ...data.saeule2,
          data: {
            ordentlichBetrag: resData.lohn?.beruflicheVorsorge?.ordentlicheBeitraege,
            einkaufBetrag: resData.lohn?.beruflicheVorsorge?.beitraegeFuerEinkauf,
          },
        },
      }
    }
    return data
  },
}
const bankkontoUpload: ScreenT<'bankkonto', TaxReturnData['bankkonto']['data'][0]> = {
  name: ScreenEnum.BankkontoHochladen,
  type: ScreenTypeEnum.ScanOrUploadArrayBankkonto,
  title: 'Bankkonto hochladen',
  text: 'Bitte lade deinen Bankkonto hoch.',
  helpText:
    '',
  isDone: (v) => (v?.data?.length ?? 0) > 0,
  dataKey: 'bankkonto',
  updateItem: (res, _) => ({
    zinsbetrag: res.data?.zinsbetrag,
    zinsUeber200: res.data?.zinsUeber200,
    steuerwertEndeJahr: res.data?.steuerwertEndeJahr,
    waehrung: res.data?.waehrung,
    bezeichnung: res.data?.bezeichnung,
    staat: res.data?.staat,
    kontoOderDepotNr: res.data?.kontoOderDepotNr,
    bankGesellschaft: res.data?.bankGesellschaft,
  }),
  // hier alle notwendigen updates machen
  update: (res, data) => ({
    ...data,
    bankkonto: {
      ...data.bankkonto,
      data: [
        ...data.bankkonto.data,
        {
          zinsbetrag: res.data?.zinsbetrag,
          zinsUeber200: res.data?.zinsUeber200,
          steuerwertEndeJahr: res.data?.steuerwertEndeJahr,
          waehrung: res.data?.waehrung,
          bezeichnung: res.data?.bezeichnung,
          staat: res.data?.staat,
          kontoOderDepotNr: res.data?.kontoOderDepotNr,
          bankGesellschaft: res.data?.bankGesellschaft,
        },
      ],
    },
    rueckzahlungBank: {
      ...data.rueckzahlungBank,
      data: {
        ...data.rueckzahlungBank.data,
        nachname: res.data?.nachname,
        vorname: res.data?.vorname,
        iban: res.data?.iban,
      },
    },
  }),
}


const generateScreen: GeneratePdf = {
  name: ScreenEnum.GeneratePdf,
  type: ScreenTypeEnum.GeneratePdf,
  title: 'Laden Sie Ihre Steuererklärung herunter',
}

export const DEFAULT_SCREEN = inZuerichScreen

export const SCREENS: Array<ScreenT<any, any>> = [
  //Eignungsfragen
  eignungsfragenOverviewScreen,
  inZuerichScreen,

  verheiratetScreen,
  kinderImHaushaltYesNoScreen,
  kinderImHaushaltOverviewScreen,
  kinderImHaushaltDetailScreen,
  kinderAusserhalbYesNoScreen,
  kinderAusserhalbOverviewScreen,
  kinderAusserhalbDetailScreen,
  hatKinderScreen,
  sozialUndVersicherungseinnahmenScreen,
  erwerbsausfallentschaedigungScreen,
  lebensOderRentenversicherung,
  geschaeftsOderKorporationsanteileScreen,
  verschuldetScreen,

  //Einkuenfte
  einkuenfteOverviewScreen,
  geldVerdientScreen,
  lohausweisUpload,

  geldVerdientDetailScreen,
  geldVerdientOverviewScreen,

  //Abzuege
  abzuegeOverviewScreen,

  oevArbeitScreen,
  oevAboKostenScreen,
  veloArbeitScreen,
  autoMotorradArbeitScreen,
  autoMotorradArbeitCheckboxesScreen,

  autoMotorradArbeitWegeDetailScreen,
  autoMotorradArbeitWegeOverviewScreen,

  verpflegungAufArbeitScreen,
  tageVerpflegungAufArbeitScreen,
  essenVerbilligungenVomArbeitgeberScreen,
  schichtarbeitScreen,
  tageSchichtArbeitScreen,

  wochenaufenthaltScreen,
  wochenaufenthaltDetailScreen,
  wochenaufenthaltOverviewScreen,

  inAusbildungScreen,
  inAusbildungOverview,
  inAusbildungDetail,

  // beitragArbeitgeberAusbildungYesNoScreen,
  // beitragArbeitgeberAusbildungAmountScreen,
  saeule2YesNoScreen,
  saeule3aYesNoScreen,
  saeule3aAmountScreen,
  versicherungspraemieYesNoScreen,
  versicherungspraemieAmountScreen,
  privateUnfallYesNoScreen,
  privateUnfallAmountScreen,
  spendenYesNoScreen,
  spendenOverviewScreen,
  spendenDetailScreen,

  //Vermoegen
  vermoegenOverviewScreen,

  bargeldYesNoScreen,
  bargeldAmountScreen,
  edelmetalleYesNoScreen,
  edelmetalleAmount,
  bankkontoUpload,
  bankkontoDetail,
  bankkontoOverview,
  aktienYesNoScreen,

  aktienDetailScreen,
  aktienOverviewScreen,

  kryptoYesNoScreen,

  kryptoDetailScreen,
  kryptoOverviewScreen,

  motorfahrzeugYesNoScreen,
  motorfahrzeugDetailScreen,

  endOverviewScreen,
  personalienScreen,
  rueckzahlungBankScreen,
  generateScreen,
]

export const mapScreenToIndex = Object.fromEntries(SCREENS.map((screen, index) => [screen.name, index]))
