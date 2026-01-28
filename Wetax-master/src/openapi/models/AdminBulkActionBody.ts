/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type AdminBulkActionBody = {
    action: AdminBulkActionBody.action;
    userIds: Array<string>;
};
export namespace AdminBulkActionBody {
    export enum action {
        ACTIVATE = 'activate',
        DEACTIVATE = 'deactivate',
        VALIDATE = 'validate',
        INVALIDATE = 'invalidate',
        DELETE = 'delete',
    }
}

