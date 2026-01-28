import { create } from 'domain'
import {
  formatNumberWithSpaces,
  formatNumberWithSpacesDecimal,
  formatTextWithSpaces,
  formatTextWithExtraSpaces,
  formatNumberWithExtraSpaces,
  formatNumberWithDoubleSpaces
} from './api/api.service'
import { computeTaxReturn } from './computer'
import { PdfFieldsT } from './types'

const createWertschriftenFields = (n: number): PdfFieldsT =>
  new Array(n).fill('').reduce((acc, _, index) => {
    return {
      ...acc,

      [`originalWaehrung${index + 1}`]: ({ computed }) =>
        formatTextWithSpaces(computed?.wertschriften[index]?.originalWaehrung),
      [`nennwertStueckzahl${index + 1}`]: ({ computed }) =>
        formatNumberWithSpaces(computed?.wertschriften[index]?.nennwertStueckzahl),
      [`valorenNr${index + 1}`]: ({ computed }) =>
        formatTextWithSpaces(computed?.wertschriften[index]?.valorenNr),
      [`bezeichnungVermoegen${index + 1}`]: ({ computed }) =>
        computed?.wertschriften[index]?.bezeichnungVermoegen,
      [`steuerwertVermoegen${index + 1}`]: ({ computed }) =>
        formatNumberWithSpaces(computed?.wertschriften[index]?.steuerwertVermoegen),
      [`wertMitVerrechnungssteuer${index + 1}`]: ({ computed }) =>
        formatNumberWithSpaces(computed?.wertschriften[index]?.wertMitVerrechnungssteuer),
      [`wertOhneVerrechnungssteuer${index + 1}`]: ({ computed }) =>
        formatNumberWithSpaces(computed?.wertschriften[index]?.wertOhneVerrechnungssteuer),
    } as PdfFieldsT
  }, {} as PdfFieldsT)

export const pdfFields: PdfFieldsT = {
  ahvNummer: ({ user }) => formatTextWithExtraSpaces(user?.ahvNummer),

  gemeinde: ({ data }) => 'Zürich',
  vorname: ({ data }) => data.personData?.data?.vorname,
  nachname: ({ data }) => data.personData?.data?.nachname,
  jahr: ({ year }) => formatNumberWithDoubleSpaces(year),
  bezeichungAusbildung1: ({ data }) => data.inAusbildung?.data[0]?.bezeichung,
  ausbildungKosten1: ({ data }) => formatNumberWithSpaces(data.inAusbildung?.data[0]?.betrag),
  bezeichungAusbildung2: ({ data }) => data.inAusbildung?.data[1]?.bezeichung,
  ausbildungKosten2: ({ data }) => formatNumberWithSpaces(data.inAusbildung?.data[1]?.betrag),
  bezeichungAusbildung3: ({ data }) => data.inAusbildung?.data[2]?.bezeichung,
  ausbildungKosten3: ({ data }) => formatNumberWithSpaces(data.inAusbildung?.data[2]?.betrag),
  totalAusbildungsKosten: ({ computed }) => formatNumberWithExtraSpaces(computed.totalAusbildungsKosten),
  beitragArbeitgeber: ({ data }) =>
    formatNumberWithExtraSpaces(data.beitragArbeitgeberAusbildung?.data?.betragArbeitGeber),
  selbstgetrageneKostenAusbildung: ({ computed }) =>
    formatNumberWithExtraSpaces(computed.selbstgetrageneKostenAusbildung),
  abzugAusbildungStaat: ({ computed }) => formatNumberWithExtraSpaces(computed.abzugAusbildungStaat),
  abzugAusbildungBund: ({ computed }) => formatNumberWithExtraSpaces(computed.abzugAusbildungBund),

  arbeitgeber: ({ data }) => data.geldVerdient.data[0]?.arbeitgeber,
  arbeitsort: ({ data }) => data.geldVerdient.data[0]?.arbeitsort,
  oevArbeit: ({ data }) => formatNumberWithExtraSpaces(data.oevArbeit.data.kosten),
  veloArbeit: ({ computed }) => formatNumberWithExtraSpaces(computed.veloArbeit),
  autoMotorradArbeitsOrt1: ({ data }) => data.autoMotorradArbeitWege?.data[0]?.arbeitsort,
  autoMotorradArbeitsOrt2: ({ data }) => data.autoMotorradArbeitWege?.data[1]?.arbeitsort,
  anzahlArbeitstage1: ({ data }) =>
    formatNumberWithExtraSpaces(data.autoMotorradArbeitWege?.data[0]?.anzahlArbeitstage),
  anzahlArbeitstage2: ({ data }) =>
    formatNumberWithExtraSpaces(data.autoMotorradArbeitWege?.data[1]?.anzahlArbeitstage),
  anzahlKm1: ({ data }) => formatNumberWithExtraSpaces(data.autoMotorradArbeitWege?.data[0]?.anzahlKm),
  anzahlKm2: ({ data }) => formatNumberWithExtraSpaces(data.autoMotorradArbeitWege?.data[1]?.anzahlKm),
  fahrtenProTag1: ({ data }) =>
    formatNumberWithSpaces(data.autoMotorradArbeitWege?.data[0]?.fahrtenProTag),
  fahrtenProTag2: ({ data }) =>
    formatNumberWithSpaces(data.autoMotorradArbeitWege?.data[1]?.fahrtenProTag),
  anzahlKmProJahr1: ({ computed }) => formatNumberWithSpaces(computed.anzahlKmProJahr1),
  anzahlKmProJahr2: ({ computed }) => formatNumberWithSpaces(computed.anzahlKmProJahr2),
  rappenProKm1: ({ data }) => formatNumberWithSpaces(data.autoMotorradArbeitWege?.data[0]?.rappenProKm),
  rappenProKm2: ({ data }) => formatNumberWithSpaces(data.autoMotorradArbeitWege?.data[1]?.rappenProKm),
  totalAbzug1: ({ computed }) => formatNumberWithSpaces(computed.totalAbzug1),
  totalAbzug2: ({ computed }) => formatNumberWithSpaces(computed.totalAbzug2),
  autoMotorradArbeitTotal: ({ computed }) => formatNumberWithExtraSpaces(computed.autoMotorradArbeitTotal),
  arbeitswegTotalStaat: ({ computed }) => formatNumberWithExtraSpaces(computed.arbeitswegTotalStaat),
  arbeitswegTotalBund: ({ computed }) => formatNumberWithExtraSpaces(computed.arbeitswegTotalBund),
  essenVerbilligungenVomArbeitgeberStaat: ({ computed }) =>
    formatNumberWithExtraSpaces(computed?.essenVerbilligungenVomArbeitgeber),
  essenVerbilligungenVomArbeitgeberBund: ({ computed }) =>
    formatNumberWithExtraSpaces(computed?.essenVerbilligungenVomArbeitgeber),
  essenNichtVerbilligt: ({ computed }) => formatNumberWithExtraSpaces(computed.essenNichtVerbilligt),
  schichtarbeit: ({ computed }) => formatNumberWithExtraSpaces(computed.schichtarbeit),
  tageSchichtarbeit: ({ data }) => formatNumberWithExtraSpaces(data.schichtarbeit.data.wieVieleTageImJahr),
  uebrigeAbzuegeBeruf: ({ computed }) => formatNumberWithExtraSpaces(computed.uebrigeAbzuegeBeruf),
  auslagenNebenerwerb: ({ computed }) => formatNumberWithExtraSpaces(computed.auslagenNebenerwerb),
  totalBerufsauslagenStaat: ({ computed }) => formatNumberWithExtraSpaces(computed.totalBerufsauslagenStaat),
  totalBerufsauslagenBund: ({ computed }) => formatNumberWithExtraSpaces(computed.totalBerufsauslagenBund),
  fehlenOev: ({ data }) => (data.autoMotorradArbeit?.data?.fehlenVonOev ? 'X' : ''),
  ueber1h: ({ data }) => (data.autoMotorradArbeit?.data?.zeitersparnisUeber1h ? 'X' : ''),
  staendigeBenutzung: ({ data }) =>
    data.autoMotorradArbeit?.data?.staendigeBenutzungArbeitszeit ? 'X' : '',
  krankOderGebrechlich: ({ data }) =>
    data.autoMotorradArbeit?.data?.keinOevWeilKrankOderGebrechlich ? 'X' : '',
  //versicherungen blatt
  privateKrankenversicherung: ({ data }) =>
    formatNumberWithSpaces(data.versicherungspraemie.data.betrag),
  privateUnfall: ({ data }) => formatNumberWithSpaces(data.privateUnfall.data.betrag),
  versicherungenSubtotal: ({ computed }) => formatNumberWithSpaces(computed.versicherungSubtotal),
  versicherungenTotal: ({ computed }) => formatNumberWithSpaces(computed.versicherungenTotal),
  maxAbzugVersicherungStaat: ({ computed }) =>
    formatNumberWithSpaces(computed.maxAbzugVersicherungStaat),
  maxAbzugVersicherungBund: ({ computed }) => formatNumberWithSpaces(computed.maxAbzugVersicherungBund),
  versicherungenTotalStaat: ({ computed }) => formatNumberWithSpaces(computed.versicherungenTotalStaat),
  versicherungenTotalBund: ({ computed }) => formatNumberWithSpaces(computed.versicherungenTotalBund),
  //wertschriften und guthabenverzeichnis
  bankverbindungRueckerstattung: ({ computed }) => computed.bankverbindungRueckerstattung,

  //steuererklärung hauptblatt
  geburtsdatum: ({ data }) => data.personData.data.geburtsdatum,
  zivilstand: ({ data }) => data.personData.data.zivilstand,
  konfession: ({ data }) => data.personData.data.konfession,
  beruf: ({ data }) => data.personData?.data?.beruf,
  telefon: ({ user }) => user?.phoneNumber,
  email: ({ data }) => data.personData?.data?.email,
  pensionskasse2SaeuleJa: ({ computed }) => computed.saeule2ja,
  pensionskasse2SaeuleNein: ({ computed }) => computed.saeule2nein,
  letzteGemeinde: () => 'Zürich',
  haupterwerb: ({ computed }) => formatNumberWithSpaces(computed.haupterwerb),
  nebenerwerb: ({ computed }) => formatNumberWithSpaces(computed.nebenerwerb),
  totalEinkuenfte: ({ computed }) => formatNumberWithSpaces(computed.totalEinkuenfte),

  saeule3aEinbezahlt: ({ data }) => formatNumberWithSpaces(data.saeule3a?.data?.betrag),
  beitraegeAhvIv: ({ data }) => formatNumberWithSpaces(data.ahvIVsaeule2Selber?.data?.betrag),
  totalAbzuegeStaat: ({ computed }) => formatNumberWithSpaces(computed.totalAbzuegeStaat),
  totalAbzuegeBund: ({ computed }) => formatNumberWithSpaces(computed.totalAbzuegeBund),
  nettoEinkommenStaat: ({ computed }) => formatNumberWithSpaces(computed.nettoEinkommenStaat),
  nettoEinkommenBund: ({ computed }) => formatNumberWithSpaces(computed.nettoEinkommenBund),
  spendenStaat: ({ computed }) => formatNumberWithSpaces(computed.spendenStaat),
  spendenBund: ({ computed }) => formatNumberWithSpaces(computed.spendenBund),
  reineinkommenStaat: ({ computed }) => formatNumberWithSpaces(computed.reineinkommenStaat),
  reineinkommenBund: ({ computed }) => formatNumberWithSpaces(computed.reineinkommenBund),
  einkommenssteuerStaat: ({ computed }) => formatNumberWithSpaces(computed.einkommenssteuerStaat),
  einkommenssteuerBund: ({ computed }) => formatNumberWithSpaces(computed.einkommenssteuerBund),

  //vermoegen In und Ausland
  ...createWertschriftenFields(8),

  totalSteuerwertVermoegen: ({ computed }) => formatNumberWithSpaces(computed.totalSteuerwertVermoegen),
  bruttoertragA: ({ computed }) => formatNumberWithSpaces(computed.bruttoertragA),
  bruttoertragB: ({ computed }) => formatNumberWithSpaces(computed.bruttoerttragB),
  totalBruttoertragAB: ({ computed }) => formatNumberWithSpaces(computed.totalBruttoertragAB),
  verrechnungssteueranspruch: ({ computed }) =>
    formatNumberWithSpacesDecimal(computed.verrechnungssteueranspruch),
  bargeldGoldEdelmetalle: ({ computed }) => formatNumberWithSpaces(computed.bargeldGoldEdelmetalle),
  motorfahrzeugBezeichnung: ({ data }) => data.motorfahrzeug?.data?.bezeichung,
  kaufpreisMotorfahrzeug: ({ data }) => formatNumberWithSpaces(data.motorfahrzeug?.data?.kaufpreis),
  jahrgangMotorfahrzeug: ({ data }) => formatNumberWithSpaces(data.motorfahrzeug?.data?.kaufjahr),
  motorfahrzeugeAbzugTotal: ({ computed }) => formatNumberWithSpaces(computed.motorfahrzeugeAbzugTotal),
  totalVermoegenswerte: ({ computed }) => formatNumberWithSpaces(computed.totalVermoegenswerte),
  vermoegenssteuerCalc: ({ computed }) => formatNumberWithSpaces(computed.vermoegenssteuerCalc),
  ortUndDatum: ({ computed }) => computed.ortUndDatum,
}
