/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserRole } from './UserRole';
export type AdminCreateUserBody = {
    isSuperAdmin?: boolean;
    role?: UserRole;
    email?: string;
    phoneNumber: string;
    ahvNumber: string;
};

