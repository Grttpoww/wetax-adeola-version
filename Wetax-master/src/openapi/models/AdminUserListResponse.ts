/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from './User';
export type AdminUserListResponse = {
    pagination: {
        totalPages: number;
        total: number;
        limit: number;
        page: number;
    };
    users: Array<User>;
};

