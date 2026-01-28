/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ObjectId } from './ObjectId';
import type { TaxReturnData } from './TaxReturnData';
export type TaxReturn = {
    data: TaxReturnData;
    validated?: boolean;
    archived: boolean;
    pdf?: string;
    created: string;
    year: number;
    userId: ObjectId;
    _id: ObjectId;
};

