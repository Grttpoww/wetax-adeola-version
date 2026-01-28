/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AdminActivity } from './AdminActivity';
import type { SystemStats } from './SystemStats';
export type AdminDashboardResponse = {
    alerts: Array<{
        timestamp: string;
        message: string;
        type: 'warning' | 'error' | 'info';
    }>;
    recentActivity: Array<AdminActivity>;
    stats: SystemStats;
};

