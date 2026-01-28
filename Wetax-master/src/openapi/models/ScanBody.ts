/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MimeType } from './MimeType';
import type { ScanType_Bankkonto } from './ScanType_Bankkonto';
import type { ScanType_Lohnausweis } from './ScanType_Lohnausweis';
export type ScanBody = {
    mimeType: MimeType;
    data: string;
    type: (ScanType_Lohnausweis | ScanType_Bankkonto);
};

