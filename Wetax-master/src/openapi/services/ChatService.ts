/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ChatHistoryResponse } from '../models/ChatHistoryResponse';
import type { ChatMessageResponse } from '../models/ChatMessageResponse';
import type { ChatUsageResponse } from '../models/ChatUsageResponse';
import type { SendChatMessageBody } from '../models/SendChatMessageBody';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ChatService {
    /**
     * @param requestBody
     * @returns any Ok
     * @throws ApiError
     */
    public static sendMessage(
        requestBody: SendChatMessageBody,
    ): CancelablePromise<(ChatMessageResponse | {
        error: string;
    })> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/v1/chat/message',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @returns any Ok
     * @throws ApiError
     */
    public static getHistory(): CancelablePromise<(ChatHistoryResponse | {
        error: string;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/chat/history',
        });
    }
    /**
     * @returns any Ok
     * @throws ApiError
     */
    public static getUsage(): CancelablePromise<(ChatUsageResponse | {
        error: string;
    })> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/v1/chat/usage',
        });
    }
}
