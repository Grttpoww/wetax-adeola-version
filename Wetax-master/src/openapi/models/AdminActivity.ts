/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ObjectId } from './ObjectId';
import type { Record_string_any_ } from './Record_string_any_';
export type AdminActivity = {
    timestamp: string;
    details: Record_string_any_;
    targetTaxReturnId?: ObjectId;
    targetUserId?: ObjectId;
    action: string;
    adminId: ObjectId;
    _id: ObjectId;
};

