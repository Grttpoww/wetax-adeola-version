/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type TaxReturnData = {
    liegenschaften: {
        data: any;
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
            betrag?: number;
        };
        finished?: boolean;
        start?: boolean;
    };
    versicherungspraemie: {
        data: {
            betrag?: number;
        };
        finished?: boolean;
        start?: boolean;
    };
    saeule3a: {
        data: {
            betrag?: number;
        };
        finished?: boolean;
        start?: boolean;
    };
    ahvIVsaeule2Selber: {
        data: {
            betrag?: number;
        };
        finished?: boolean;
        start?: boolean;
    };
    saeule2: {
        data: {
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
        data: any;
        finished?: boolean;
        start?: boolean;
    };
    oevArbeit: {
        data: {
            kosten?: number;
        };
        finished?: boolean;
        start?: boolean;
    };
    geldVerdient: {
        data: Array<{
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
    verschuldet: {
        data: any;
        finished?: boolean;
        start?: boolean;
    };
    geschaeftsOderKorporationsanteile: {
        data: any;
        finished?: boolean;
        start?: boolean;
    };
    lebensOderRentenversicherung: {
        data: any;
        finished?: boolean;
        start?: boolean;
    };
    erwerbsausfallentschaedigung: {
        data: any;
        finished?: boolean;
        start?: boolean;
    };
    einkuenfteSozialversicherung: {
        data: any;
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
            gemeindeBfsNumber?: number;
            email?: string;
            beruf?: string;
            konfession?: string;
            zivilstand?: string;
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

