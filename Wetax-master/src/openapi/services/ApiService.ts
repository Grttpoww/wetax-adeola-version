/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateTaxReturnBody } from '../models/CreateTaxReturnBody';
import type { LoginBody } from '../models/LoginBody';
import type { LoginEmailBody } from '../models/LoginEmailBody';
import type { RegisterBody } from '../models/RegisterBody';
import type { ScanBody } from '../models/ScanBody';
import type { ScanResponse } from '../models/ScanResponse';
import type { SubmitVerificationCodeBody } from '../models/SubmitVerificationCodeBody';
import type { TaxAmount } from '../models/TaxAmount';
import type { TaxReturn } from '../models/TaxReturn';
import type { UpdateUserDataBody } from '../models/UpdateUserDataBody';
import type { UserT } from '../models/UserT';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ApiService {
    /**
     * @param requestBody
     * @returns any Ok
     * @throws ApiError
     */
    public static register(
        requestBody: RegisterBody,
    ): CancelablePromise<({
        phoneNumber: string;
        success: boolean;
    } | {
        error: string;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/register',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any Ok
     * @throws ApiError
     */
    public static login(
        requestBody: LoginBody,
    ): CancelablePromise<({
        phoneNumber: string;
        success: boolean;
    } | {
        error: string;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/login',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any Ok
     * @throws ApiError
     */
    public static loginEmail(
        requestBody: LoginEmailBody,
    ): CancelablePromise<({
        user: UserT;
        token: string;
    } | {
        error: string;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/login-email',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any Ok
     * @throws ApiError
     */
    public static submitVerificationCode(
        requestBody: SubmitVerificationCodeBody,
    ): CancelablePromise<({
        user: UserT;
        token: string;
    } | {
        error: string;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/verification-code',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns UserT Ok
     * @throws ApiError
     */
    public static getUser(): CancelablePromise<UserT> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/user',
        });
    }
    /**
     * @returns any Ok
     * @throws ApiError
     */
    public static getMunicipalities(): CancelablePromise<{
        municipalities: Array<{
            hasCompleteData: boolean;
            name: string;
            bfsNumber: number;
        }>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/municipalities',
        });
    }
    /**
     * @param requestBody
     * @returns ScanResponse Ok
     * @throws ApiError
     */
    public static scan(
        requestBody: ScanBody,
    ): CancelablePromise<ScanResponse> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/scan',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns any Ok
     * @throws ApiError
     */
    public static updateUserData(
        requestBody: UpdateUserDataBody,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/user/update',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param taxReturnId
     * @returns TaxReturn Ok
     * @throws ApiError
     */
    public static getTaxReturn(
        taxReturnId: string,
    ): CancelablePromise<TaxReturn> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/tax-return/{taxReturnId}/get',
            path: {
                'taxReturnId': taxReturnId,
            },
        });
    }
    /**
     * @param taxReturnId
     * @param requestBody
     * @returns any Ok
     * @throws ApiError
     */
    public static updateTaxReturn(
        taxReturnId: string,
        requestBody: any,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/tax-return/{taxReturnId}/update',
            path: {
                'taxReturnId': taxReturnId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param requestBody
     * @returns TaxReturn Ok
     * @throws ApiError
     */
    public static createTaxReturn(
        requestBody: CreateTaxReturnBody,
    ): CancelablePromise<TaxReturn> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/tax-return/create',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param taxReturnId
     * @returns any Ok
     * @throws ApiError
     */
    public static archiveTaxReturn(
        taxReturnId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/tax-return/{taxReturnId}/archive',
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
    public static generatePdf(
        taxReturnId: string,
    ): CancelablePromise<{
        base64: any;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/{taxReturnId}/generate-pdf',
            path: {
                'taxReturnId': taxReturnId,
            },
        });
    }
    /**
     * @param taxReturnId
     * @returns TaxAmount Ok
     * @throws ApiError
     */
    public static getTaxAmount(
        taxReturnId: string,
    ): CancelablePromise<TaxAmount> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/{taxReturnId}/tax-amount',
            path: {
                'taxReturnId': taxReturnId,
            },
        });
    }
    /**
     * @returns any Ok
     * @throws ApiError
     */
    public static deleteAccount(): CancelablePromise<({
        success: boolean;
    } | {
        error: string;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/user/delete',
        });
    }
    /**
     * @param taxReturnId
     * @returns any Ok
     * @throws ApiError
     */
    public static exportEch0119(
        taxReturnId: string,
    ): CancelablePromise<{
        xml: string;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/tax-return/{taxReturnId}/export-ech0119',
            path: {
                'taxReturnId': taxReturnId,
            },
        });
    }
}
