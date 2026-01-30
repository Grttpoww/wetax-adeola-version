/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Zivilstand } from './Zivilstand';
export type TaxReturnData = {
    unterhaltsbeitraege: {
        data: {
            rentenleistungen: Array<{
                abzugsfaehigerErtragsanteil?: number;
                berechnungssatz?: number;
                gesamtbetrag?: number;
                bezeichnung?: string;
            }>;
            fuerKinder: Array<{
                monat18Jahre?: string;
                betrag?: number;
                geburtsdatum?: string;
                kindName?: string;
            }>;
            anEhegatten?: number;
        };
        finished?: boolean;
        start?: boolean;
    };
    liegenschaften: {
        data: Array<{
            vermoegenssteuerwert?: number;
            istGeschaeftlich?: boolean;
            unterhaltBetrag?: number;
            unterhaltArt?: 'pauschal' | 'effektiv';
            eigenmietwertOderMietertrag?: number;
            kanton?: string;
            ort?: string;
            bezeichnung?: string;
        }>;
        finished?: boolean;
        start?: boolean;
    };
    motorfahrzeug: {
        data: {
            kaufpreis?: number;
            kaufjahr?: number;
            bezeichung?: string;
        };
        finished?: boolean;
        start?: boolean;
    };
    krypto: {
        data: Array<{
            ertragMitVerrechnungssteuer?: number;
            steuerwertProStueck?: number;
            stueckzahl?: number;
            steuerwert?: number;
            waehrung?: string;
            bank?: string;
        }>;
        finished?: boolean;
        start?: boolean;
    };
    aktien: {
        data: Array<{
            istQualifizierteBeteiligung?: boolean;
            beteiligungsquote?: number;
            dividendenertrag?: number;
            steuerwertProStueck?: number;
            stueckzahl?: number;
            steuerwertEndeJahr?: number;
            waehrung?: string;
            staat?: string;
            gesellschaftTitel?: string;
            ISIN?: string;
            valorenNr?: string;
        }>;
        finished?: boolean;
        start?: boolean;
    };
    bankkonto: {
        data: Array<{
            zinsbetrag?: number;
            zinsUeber200?: boolean;
            steuerwertEndeJahr?: number;
            waehrung?: string;
            bezeichnung?: string;
            staat?: string;
            kontoOderDepotNr?: string;
            bankGesellschaft?: string;
        }>;
        finished?: boolean;
        start?: boolean;
    };
    edelmetalle: {
        data: {
            betrag?: number;
        };
        finished?: boolean;
        start?: boolean;
    };
    bargeld: {
        data: {
            betrag?: number;
        };
        finished?: boolean;
        start?: boolean;
    };
    spenden: {
        data: Array<{
            betrag?: number;
            bezeichnung?: string;
            datum?: string;
        }>;
        finished?: boolean;
        start?: boolean;
    };
    privateUnfall: {
        data: {
            partner2Betrag?: number;
            betrag?: number;
        };
        finished?: boolean;
        start?: boolean;
    };
    versicherungspraemie: {
        data: {
            partner2Betrag?: number;
            betrag?: number;
        };
        finished?: boolean;
        start?: boolean;
    };
    saeule3a: {
        data: {
            partner2Betrag?: number;
            betrag?: number;
        };
        finished?: boolean;
        start?: boolean;
    };
    ahvIVsaeule2Selber: {
        data: {
            partner2Betrag?: number;
            betrag?: number;
        };
        finished?: boolean;
        start?: boolean;
    };
    saeule2: {
        data: {
            partner2EinkaufBetrag?: number;
            partner2OrdentlichBetrag?: number;
            einkaufBetrag?: number;
            ordentlichBetrag?: number;
        };
        finished?: boolean;
        start?: boolean;
    };
    beitragArbeitgeberAusbildung: {
        data: {
            betragArbeitGeber?: number;
        };
        finished?: boolean;
        start?: boolean;
    };
    inAusbildung: {
        data: Array<{
            person?: 1 | 2;
            betrag?: number;
            bezeichung?: string;
        }>;
        finished?: boolean;
        start?: boolean;
    };
    wochenaufenthalt: {
        data: Array<{
            betrag?: number;
            bezeichung?: string;
            datum?: string;
        }>;
        finished?: boolean;
        start?: boolean;
    };
    schichtarbeit: {
        data: {
            partner2ImmerSchichtarbeit?: boolean;
            partner2WieVieleTageImJahr?: number;
            immerSchichtarbeit?: boolean;
            wieVieleTageImJahr?: number;
        };
        finished?: boolean;
        start?: boolean;
    };
    essenVerbilligungenVomArbeitgeber: {
        data: any;
        finished?: boolean;
        start?: boolean;
    };
    verpflegungAufArbeit: {
        data: {
            partner2AnzahlTage?: number;
            anzahlTage?: number;
        };
        finished?: boolean;
        start?: boolean;
    };
    autoMotorradArbeitWege: {
        data: Array<{
            rappenProKm?: number;
            fahrtenProTag?: number;
            anzahlKm?: number;
            anzahlArbeitstage?: number;
            arbeitsort?: string;
        }>;
        finished?: boolean;
        start?: boolean;
    };
    autoMotorradArbeit: {
        data: {
            partner2GeleastesFahrzeug?: boolean;
            partner2KeinOevWeilKrankOderGebrechlich?: boolean;
            partner2StaendigeBenutzungArbeitszeit?: boolean;
            partner2ZeitersparnisUeber1h?: boolean;
            partner2FehlenVonOev?: boolean;
            geleastesFahrzeug?: boolean;
            keinOevWeilKrankOderGebrechlich?: boolean;
            staendigeBenutzungArbeitszeit?: boolean;
            zeitersparnisUeber1h?: boolean;
            fehlenVonOev?: boolean;
        };
        finished?: boolean;
        start?: boolean;
    };
    veloArbeit: {
        data: {
            partner2VeloArbeit?: boolean;
        };
        finished?: boolean;
        start?: boolean;
    };
    oevArbeit: {
        data: {
            partner2Kosten?: number;
            kosten?: number;
        };
        finished?: boolean;
        start?: boolean;
    };
    geldVerdient: {
        data: Array<{
            person?: 1 | 2;
            anzahlarbeitstage?: number;
            uploadedLohnausweis?: boolean;
            nettolohn?: number;
            urlaubstage?: number;
            arbeitsort?: string;
            arbeitgeber?: string;
            bis?: string;
            von?: string;
        }>;
        finished?: boolean;
        start?: boolean;
    };
    schuldzinsen: {
        data: {
            betrag?: number;
        };
        finished?: boolean;
        start?: boolean;
    };
    verschuldet: {
        data: Array<{
            zinsenImJahr?: number;
            schuldhoehe?: number;
            zinssatz?: number;
            glauebigerAdresse?: string;
            glauebiger?: string;
        }>;
        finished?: boolean;
        start?: boolean;
    };
    geschaeftsOderKorporationsanteile: {
        data: Array<{
            steuerbarerAnteilBund?: number;
            steuerbarerAnteilStaat?: number;
            bruttoertrag?: number;
            istQualifizierteBeteiligung?: boolean;
            ertrag?: number;
            beteiligungsquote?: number;
            bezeichnung?: string;
        }>;
        finished?: boolean;
        start?: boolean;
    };
    lebensOderRentenversicherung: {
        data: Array<{
            leibrenteBerechnungssatz?: number;
            steuerbarerBetrag?: number;
            steuerbarerAnteilProzent?: number;
            gesamtbetrag?: number;
            art?: 'lebensversicherung' | 'rentenversicherung' | 'leibrente';
        }>;
        finished?: boolean;
        start?: boolean;
    };
    erwerbsausfallentschaedigung: {
        data: Array<{
            bis?: string;
            von?: string;
            betrag?: number;
            art?: 'arbeitslosigkeit' | 'krankheit' | 'unfall' | 'militar' | 'mutterschaft' | 'sonstige';
        }>;
        finished?: boolean;
        start?: boolean;
    };
    einkuenfteSozialversicherung: {
        data: Array<{
            leibrenteBerechnungssatz?: number;
            vorsorgeverhaeltnisBereits1985?: boolean;
            eigenbeitraegeProzent?: number;
            rentenbeginn?: string;
            steuerbarerBetrag?: number;
            steuerbarerAnteilProzent?: number;
            gesamtbetrag?: number;
            art?: 'ahvIvRente' | 'pensionskasse' | 'arbeitgeberRente' | 'suva' | 'militarversicherung' | 'saeule3a' | 'leibrente' | 'sonstige';
        }>;
        finished?: boolean;
        start?: boolean;
    };
    kinderAusserhalb: {
        data: Array<{
            voraussichtlichBis?: string;
            schuleOderLehrfirma?: string;
            inAusbildung?: boolean;
            adresse?: string;
            geburtsdatum?: string;
            nachname?: string;
            vorname?: string;
        }>;
        finished?: boolean;
        start?: boolean;
    };
    kinderImHaushalt: {
        data: Array<{
            unterhaltsbeitragProJahr?: number;
            andererElternteilZahlt?: boolean;
            voraussichtlichBis?: string;
            schuleOderLehrfirma?: string;
            inAusbildung?: boolean;
            geburtsdatum?: string;
            nachname?: string;
            vorname?: string;
        }>;
        finished?: boolean;
        start?: boolean;
    };
    hatKinder: {
        data: any;
        finished?: boolean;
        start?: boolean;
    };
    verheiratet: {
        data: any;
        finished?: boolean;
        start?: boolean;
    };
    inZuerich: {
        data: any;
        finished?: boolean;
        start?: boolean;
    };
    rueckzahlungBank: {
        data: {
            iban?: string;
            nachname?: string;
            vorname?: string;
        };
        finished?: boolean;
        start?: boolean;
    };
    personData: {
        data: {
            partner2Konfession?: string;
            partner2Beruf?: string;
            partner2AhvNummer?: string;
            partner2Geburtsdatum?: string;
            partner2Nachname?: string;
            partner2Vorname?: string;
            ahvNummer?: string;
            gemeindeBfsNumber?: number;
            email?: string;
            beruf?: string;
            konfession?: string;
            zivilstand?: Zivilstand;
            taxMunicipality?: string;
            land?: string;
            stadt?: string;
            plz?: number;
            adresse?: string;
            nachname?: string;
            vorname?: string;
            geburtsdatum?: string;
        };
        finished?: boolean;
        start?: boolean;
    };
};

