/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Record_string_any_ } from './Record_string_any_';
export type ChatMessageResponse = {
    action?: {
        params?: Record_string_any_;
        value?: any;
        path?: string;
        screen?: string;
        type: ChatMessageResponse.type;
    };
    message: string;
};
export namespace ChatMessageResponse {
    export enum type {
        NAVIGATE = 'navigate',
        UPDATE = 'update',
    }
}

