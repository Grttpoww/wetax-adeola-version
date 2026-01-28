/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type LohnausweisScanT = {
    aussteller: {
        datum: string;
        ort: string;
    };
    lohn: {
        spesenVerguetungen: {
            beitraegeWeiterbildung: number;
            pauschalSpesen: {
                spesenUebrige: number;
                spesenAuto: number;
                spesenRepraesentation: number;
            };
            effektiveSpesen: {
                spesenUebrige: number;
                spesenReise: number;
            };
        };
        nettolohn: number;
        bis: string;
        von: string;
        beruflicheVorsorge: {
            beitraegeFuerEinkauf: number;
            ordentlicheBeitraege: number;
        };
        beitraegeAHVIV: number;
        bruttolohn: number;
        gehaltsNebenleistungen: {
            andere: number;
            privatanteilGeschaeftsfahrzeug: number;
            verpflegungUnterkunft: number;
        };
        lohn: number;
    };
    personData: {
        land: string;
        stadt: string;
        plz: number;
        adresse: string;
        nachname: string;
        vorname: string;
        bis: string;
        von: string;
        jahr: string;
        geburtsdatum: string;
        ahvNummmer: string;
    };
};

