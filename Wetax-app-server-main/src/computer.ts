import {
  calculateEinkommenssteuerStaat,
  calculateMunicipalTax,
  calculateVermoegenssteuer,
  einkommenssteuerBundCalc,
} from './computeTaxes'
import { ComputedTaxReturnT, MunicipalityTaxRatesCache, TaxReturnData, wertschriftenEintrag } from './types'

export const computeTaxReturn = (
  data: TaxReturnData,
  municipalityRatesCache: MunicipalityTaxRatesCache,
): ComputedTaxReturnT => {
  const totalEinkuenfte = data.geldVerdient.data.reduce((acc, v) => acc + (v.nettolohn ?? 0), 0)
  const haupterwerb = data.geldVerdient.data.reduce((max, v) => {
    const currentNettolohn = v.nettolohn ?? 0
    return currentNettolohn > max ? currentNettolohn : max
  }, 0)

  const nebenerwerb = totalEinkuenfte - haupterwerb

  const totalAusbildungsKosten = data.inAusbildung.data.reduce((acc, v) => acc + (v.betrag ?? 0), 0)
  const selbstgetrageneKostenAusbildung =
    totalAusbildungsKosten - (data.beitragArbeitgeberAusbildung?.data?.betragArbeitGeber ?? 0)
  const veloArbeit = data?.veloArbeit?.start ? 700 : undefined
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
  const arbeitswegTotalBund = Math.min(
    (data.oevArbeit?.data?.kosten ?? 0) + (veloArbeit ?? 0) + autoMotorradArbeitTotal,
    3200,
  )
  const arbeitswegTotalStaat = Math.min(
    (data.oevArbeit?.data?.kosten ?? 0) + (veloArbeit ?? 0) + autoMotorradArbeitTotal,
    5200,
  )
  const essenNichtVerbilligt =
    data.verpflegungAufArbeit.start && !data.essenVerbilligungenVomArbeitgeber.start
      ? Math.min(15 * (data.verpflegungAufArbeit.data.anzahlTage ?? 0), 3200)
      : undefined
  const essenVerbilligungenVomArbeitgeber =
    data.verpflegungAufArbeit.start && data.essenVerbilligungenVomArbeitgeber.start
      ? Math.min(7.5 * (data.verpflegungAufArbeit.data.anzahlTage ?? 0), 1600)
      : undefined

  const schichtarbeit = data.schichtarbeit.start
    ? Math.min((data.schichtarbeit.data.wieVieleTageImJahr ?? 0) * 15, 3200)
    : undefined
  const uebrigeAbzuegeBeruf = Math.max(Math.min(4000, haupterwerb * 0.03), 2000)
  const auslagenNebenerwerb =
    totalEinkuenfte === haupterwerb ? undefined : Math.max(Math.min(0.2 * nebenerwerb, 2400), 800)
  const totalBerufsauslagenStaat =
    arbeitswegTotalStaat +
    Math.min(
      3200,
      (essenVerbilligungenVomArbeitgeber ?? 0) + (essenNichtVerbilligt ?? 0) + (schichtarbeit ?? 0),
    ) +
    uebrigeAbzuegeBeruf
  const totalBerufsauslagenBund =
    arbeitswegTotalBund +
    Math.min(
      3200,
      (essenVerbilligungenVomArbeitgeber ?? 0) + (essenNichtVerbilligt ?? 0) + (schichtarbeit ?? 0),
    ) +
    uebrigeAbzuegeBeruf

  const versicherungSubtotal =
    (data.versicherungspraemie.data.betrag ?? 0) + (data.privateUnfall.data.betrag ?? 0)
  const saeulen3oder2 = data.saeule3a.start || data.saeule2?.start

  const maxAbzugVersicherungStaat = saeulen3oder2 ? 2900 : 4350
  const maxAbzugVersicherungBund = saeulen3oder2 ? 1800 : 2700
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
  
  const totalAbzuegeStaat =
    totalBerufsauslagenStaat +
    (data.saeule3a?.data?.betrag ?? 0) +
    versicherungenTotalStaat +
    (data.ahvIVsaeule2Selber?.data.betrag ?? 0) +
    selbstgetrageneKostenAusbildung +
    kinderabzugStaat
  const totalAbzuegeBund =
    totalBerufsauslagenBund +
    (data.saeule3a?.data?.betrag ?? 0) +
    versicherungenTotalBund +
    (data.ahvIVsaeule2Selber?.data.betrag ?? 0) +
    selbstgetrageneKostenAusbildung +
    kinderabzugBund

  const nettoEinkommenStaat = Math.max(totalEinkuenfte - totalAbzuegeStaat, 0)
  const nettoEinkommenBund = Math.max(totalEinkuenfte - totalAbzuegeBund, 0)
  const spenden = data.spenden.data.reduce((acc, v) => acc + (v.betrag ?? 0), 0)
  const spendenStaat = spenden > 100 ? Math.min(spenden, nettoEinkommenStaat * 0.2) : undefined
  const spendenBund = spenden > 100 ? Math.min(spenden, nettoEinkommenBund * 0.2) : undefined
  const reineinkommenStaat = Math.max(nettoEinkommenStaat - (spendenStaat ?? 0), 0)
  const reineinkommenBund = Math.max(nettoEinkommenBund - (spendenBund ?? 0), 0)
  const einkommenssteuerBund = einkommenssteuerBundCalc(reineinkommenBund)
  
  // Calculate base cantonal tax (without municipality multiplier)
  const baseCantonalTax = calculateEinkommenssteuerStaat(
    reineinkommenStaat,
    data.personData?.data?.konfession ?? 'andere',
  )
  
  // Apply municipality Steuerfuss multiplier
  const einkommenssteuerStaat = calculateMunicipalTax(
    baseCantonalTax,
    data.personData?.data?.gemeindeBfsNumber,
    data.personData?.data?.konfession ?? 'andere',
    municipalityRatesCache,
  )
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

  data.aktien.data.map((v) =>
    wertschriftenArray.push({
      nennwertStueckzahl: v.stueckzahl,
      valorenNr: v.valorenNr,
      bezeichnungVermoegen: 'Aktie ' + (v.gesellschaftTitel ?? ''),
      steuerwertVermoegen: (v.stueckzahl ?? 0) * (v.steuerwertProStueck ?? 0),
    }),
  )

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

  const totalVermoegenswerte =
    totalSteuerwertVermoegen + bargeldGoldEdelmetalle + motorfahrzeugeAbzugTotal

  const vermoegenssteuerCalc = calculateVermoegenssteuer(totalVermoegenswerte)

  return {
    abzugarbeitsweg: 0,
    totalAusbildungsKosten: totalAusbildungsKosten,
    selbstgetrageneKostenAusbildung: selbstgetrageneKostenAusbildung,
    abzugAusbildungBund: Math.min(selbstgetrageneKostenAusbildung, 12400),
    abzugAusbildungStaat: Math.min(selbstgetrageneKostenAusbildung, 12900),
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
    totalAbzuegeStaat: totalAbzuegeStaat,
    totalAbzuegeBund: totalAbzuegeBund,
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
    bargeldGoldEdelmetalle: bargeldGoldEdelmetalle,
    motorfahrzeugeAbzugTotal: motorfahrzeugeAbzugTotal,
    totalVermoegenswerte: totalVermoegenswerte,
    vermoegenssteuerCalc: vermoegenssteuerCalc,
    ortUndDatum: ortUndDatum,
  }
}
