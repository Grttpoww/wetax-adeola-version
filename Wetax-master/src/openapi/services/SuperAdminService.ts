/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdminActivity } from '../models/AdminActivity';
import type { AdminBulkActionBody } from '../models/AdminBulkActionBody';
import type { AdminCreateUserBody } from '../models/AdminCreateUserBody';
import type { AdminDashboardResponse } from '../models/AdminDashboardResponse';
import type { AdminLoginBody } from '../models/AdminLoginBody';
import type { AdminSystemSettingsBody } from '../models/AdminSystemSettingsBody';
import type { AdminTaxReturnListResponse } from '../models/AdminTaxReturnListResponse';
import type { AdminUpdateUserBody } from '../models/AdminUpdateUserBody';
import type { AdminUserListResponse } from '../models/AdminUserListResponse';
import type { Record_string_any_ } from '../models/Record_string_any_';
import type { TaxReturn } from '../models/TaxReturn';
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SuperAdminService {
    /**
     * @param requestBody
     * @returns any Ok
     * @throws ApiError
     */
    public static adminLogin(
        requestBody: AdminLoginBody,
    ): CancelablePromise<({
        user: User;
        token: string;
    } | {
        error: string;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns AdminDashboardResponse Ok
     * @throws ApiError
     */
    public static getDashboard(): CancelablePromise<AdminDashboardResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/dashboard',
        });
    }
    /**
     * @param page
     * @param limit
     * @param role
     * @param validated
     * @param isActive
     * @param isSuperAdmin
     * @param search
     * @returns AdminUserListResponse Ok
     * @throws ApiError
     */
    public static getAllUsers(
        page: number = 1,
        limit: number = 50,
        role?: string,
        validated?: boolean,
        isActive?: boolean,
        isSuperAdmin?: boolean,
        search?: string,
    ): CancelablePromise<AdminUserListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/users',
            query: {
                'page': page,
                'limit': limit,
                'role': role,
                'validated': validated,
                'isActive': isActive,
                'isSuperAdmin': isSuperAdmin,
                'search': search,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any Ok
     * @throws ApiError
     */
    public static createUser(
        requestBody: AdminCreateUserBody,
    ): CancelablePromise<({
        user: User;
        success: boolean;
    } | {
        error: string;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/users',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param userId
     * @returns any Ok
     * @throws ApiError
     */
    public static getUserById(
        userId: string,
    ): CancelablePromise<(User & {
        taxReturns: Array<TaxReturn>;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/users/{userId}',
            path: {
                'userId': userId,
            },
        });
    }
    /**
     * @param userId
     * @param requestBody
     * @returns any Ok
     * @throws ApiError
     */
    public static updateUser(
        userId: string,
        requestBody: AdminUpdateUserBody,
    ): CancelablePromise<({
        user: User;
        success: boolean;
    } | {
        error: string;
    })> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/admin/users/{userId}',
            path: {
                'userId': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param userId
     * @returns any Ok
     * @throws ApiError
     */
    public static deleteUser(
        userId: string,
    ): CancelablePromise<({
        success: boolean;
    } | {
        error: string;
    })> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/admin/users/{userId}',
            path: {
                'userId': userId,
            },
        });
    }
    /**
     * @param page
     * @param limit
     * @param userId
     * @param year
     * @param archived
     * @param dateFrom
     * @param dateTo
     * @returns AdminTaxReturnListResponse Ok
     * @throws ApiError
     */
    public static getAllTaxReturns(
        page: number = 1,
        limit: number = 50,
        userId?: string,
        year?: number,
        archived?: boolean,
        dateFrom?: string,
        dateTo?: string,
    ): CancelablePromise<AdminTaxReturnListResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/tax-returns',
            query: {
                'page': page,
                'limit': limit,
                'userId': userId,
                'year': year,
                'archived': archived,
                'dateFrom': dateFrom,
                'dateTo': dateTo,
            },
        });
    }
    /**
     * @param taxReturnId
     * @returns any Ok
     * @throws ApiError
     */
    public static getTaxReturnById(
        taxReturnId: string,
    ): CancelablePromise<(TaxReturn & {
        user: User;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/tax-returns/{taxReturnId}',
            path: {
                'taxReturnId': taxReturnId,
            },
        });
    }
    /**
     * @param taxReturnId
     * @returns any Ok
     * @throws ApiError
     */
    public static deleteTaxReturn(
        taxReturnId: string,
    ): CancelablePromise<({
        success: boolean;
    } | {
        error: string;
    })> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/admin/tax-returns/{taxReturnId}',
            path: {
                'taxReturnId': taxReturnId,
            },
        });
    }
    /**
     * @param requestBody
     * @returns any Ok
     * @throws ApiError
     */
    public static performBulkAction(
        requestBody: AdminBulkActionBody,
    ): CancelablePromise<({
        affectedCount: number;
        success: boolean;
    } | {
        error: string;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/users/bulk-action',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns Record_string_any_ Ok
     * @throws ApiError
     */
    public static getSystemSettings(): CancelablePromise<Record_string_any_> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/system/settings',
        });
    }
    /**
     * @param requestBody
     * @returns any Ok
     * @throws ApiError
     */
    public static updateSystemSettings(
        requestBody: AdminSystemSettingsBody,
    ): CancelablePromise<({
        success: boolean;
    } | {
        error: string;
    })> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/admin/system/settings',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any Ok
     * @throws ApiError
     */
    public static getSystemHealth(): CancelablePromise<{
        uptime: number;
        checks: Record_string_any_;
        status: 'healthy' | 'warning' | 'critical';
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/system/health',
        });
    }
    /**
     * @param page
     * @param limit
     * @param adminId
     * @param action
     * @param dateFrom
     * @param dateTo
     * @returns any Ok
     * @throws ApiError
     */
    public static getActivityLog(
        page: number = 1,
        limit: number = 100,
        adminId?: string,
        action?: string,
        dateFrom?: string,
        dateTo?: string,
    ): CancelablePromise<{
        pagination: {
            totalPages: number;
            total: number;
            limit: number;
            page: number;
        };
        activities: Array<AdminActivity>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/activity',
            query: {
                'page': page,
                'limit': limit,
                'adminId': adminId,
                'action': action,
                'dateFrom': dateFrom,
                'dateTo': dateTo,
            },
        });
    }
    /**
     * @param format
     * @returns any Ok
     * @throws ApiError
     */
    public static exportUsers(
        format: 'csv' | 'json' = 'csv',
    ): CancelablePromise<({
        downloadUrl: string;
    } | {
        data: any;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/export/users',
            query: {
                'format': format,
            },
        });
    }
    /**
     * @param format
     * @param year
     * @returns any Ok
     * @throws ApiError
     */
    public static exportTaxReturns(
        format: 'csv' | 'json' = 'csv',
        year?: number,
    ): CancelablePromise<({
        downloadUrl: string;
    } | {
        data: any;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/export/tax-returns',
            query: {
                'format': format,
                'year': year,
            },
        });
    }
    /**
     * @returns any Ok
     * @throws ApiError
     */
    public static createTaxReturnWithPdf(): CancelablePromise<({
        taxReturn: TaxReturn;
        success: boolean;
    } | {
        error: string;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/tax-returns/create-with-pdf',
        });
    }
    /**
     * @returns any Ok
     * @throws ApiError
     */
    public static processTaxPdf(): CancelablePromise<({
        extractedData: any;
        success: boolean;
    } | {
        error: string;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/tax-returns/process-pdf',
        });
    }
    /**
     * @param requestBody
     * @returns any Ok
     * @throws ApiError
     */
    public static createTaxReturnForUser(
        requestBody: {
            extractedData?: any;
            year: number;
            userId: string;
        },
    ): CancelablePromise<({
        taxReturn: TaxReturn;
        success: boolean;
    } | {
        error: string;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/admin/tax-returns/create-for-user',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param period
     * @returns any Ok
     * @throws ApiError
     */
    public static getUserAnalytics(
        period: 'day' | 'week' | 'month' | 'year' = 'month',
    ): CancelablePromise<{
        growthRate: number;
        totalUsers: number;
        activations: Array<{
            count: number;
            date: string;
        }>;
        registrations: Array<{
            count: number;
            date: string;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/analytics/users',
            query: {
                'period': period,
            },
        });
    }
    /**
     * @param period
     * @returns any Ok
     * @throws ApiError
     */
    public static getTaxReturnAnalytics(
        period: 'day' | 'week' | 'month' | 'year' = 'month',
    ): CancelablePromise<{
        totalRevenue: number;
        avgTaxAmount: Array<{
            amount: number;
            date: string;
        }>;
        completions: Array<{
            count: number;
            date: string;
        }>;
        submissions: Array<{
            count: number;
            date: string;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/admin/analytics/tax-returns',
            query: {
                'period': period,
            },
        });
    }
}
