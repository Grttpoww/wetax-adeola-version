/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TaxReturnStats } from './TaxReturnStats';
import type { UserStats } from './UserStats';
export type SystemStats = {
    systemHealth: {
        serverUptime: number;
        lastBackup?: string;
        dbStatus: SystemStats.dbStatus;
    };
    taxReturnStats: TaxReturnStats;
    userStats: UserStats;
};
export namespace SystemStats {
    export enum dbStatus {
        CONNECTED = 'connected',
        DISCONNECTED = 'disconnected',
        ERROR = 'error',
    }
}

