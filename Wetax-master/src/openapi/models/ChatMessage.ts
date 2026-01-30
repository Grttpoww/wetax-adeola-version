/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type ChatMessage = {
    tokens: number;
    timestamp: string;
    content: string;
    role: ChatMessage.role;
};
export namespace ChatMessage {
    export enum role {
        USER = 'user',
        ASSISTANT = 'assistant',
    }
}

