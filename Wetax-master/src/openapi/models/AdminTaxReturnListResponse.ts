/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Pick_User__id_or_ahvNummer_or_phoneNumber_or_email_ } from './Pick_User__id_or_ahvNummer_or_phoneNumber_or_email_';
import type { TaxReturn } from './TaxReturn';
export type AdminTaxReturnListResponse = {
    pagination: {
        totalPages: number;
        total: number;
        limit: number;
        page: number;
    };
    taxReturns: Array<(TaxReturn & {
        user: Pick_User__id_or_ahvNummer_or_phoneNumber_or_email_;
    })>;
};

