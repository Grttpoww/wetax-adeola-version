/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ObjectId } from './ObjectId';
import type { UserRole } from './UserRole';
export type User = {
    isSuperAdmin?: boolean;
    role?: UserRole;
    isActive?: boolean;
    validated: boolean;
    email?: string;
    phoneNumber: string;
    ahvNummer: string;
    verificationCode?: string;
    created: string;
    _id: ObjectId;
};

