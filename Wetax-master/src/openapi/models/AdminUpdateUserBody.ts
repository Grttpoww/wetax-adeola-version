/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserRole } from './UserRole';
export type AdminUpdateUserBody = {
    isSuperAdmin?: boolean;
    role?: UserRole;
    isActive?: boolean;
    validated?: boolean;
    email?: string;
    phoneNumber?: string;
    ahvNumber?: string;
};

