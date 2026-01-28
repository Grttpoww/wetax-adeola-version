/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BankkontoScanT } from './BankkontoScanT';
import type { LohnausweisScanT } from './LohnausweisScanT';
import type { ScanType_Bankkonto } from './ScanType_Bankkonto';
import type { ScanType_Lohnausweis } from './ScanType_Lohnausweis';
export type ScanResponse = {
    data: (LohnausweisScanT | BankkontoScanT);
    type: (ScanType_Lohnausweis | ScanType_Bankkonto);
};

