import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Put,
  Query,
  Request,
  Route,
  Security,
  Tags,
} from 'tsoa'
import {
  AdminLoginBody,
  AdminCreateUserBody,
  AdminUpdateUserBody,
  AdminUserFilters,
  AdminTaxReturnFilters,
  AdminDashboardResponse,
  AdminUserListResponse,
  AdminTaxReturnListResponse,
  AdminBulkActionBody,
  AdminSystemSettingsBody,
} from './api.types'
import {
  adminLogin,
  getDashboardStats,
  getAllUsers,
  getUserById,
  createUserAsAdmin,
  updateUserAsAdmin,
  deleteUserAsAdmin,
  getAllTaxReturns,
  getTaxReturnById,
  deleteTaxReturnAsAdmin,
  performBulkAction,
  getSystemSettings,
  updateSystemSettings,
  getAdminActivityLog,
  exportUserData,
  exportTaxReturnData,
  getSystemHealth,
  createTaxReturnWithPdf,
  processTaxPdf,
  createTaxReturnForUser,
} from './admin.service'
import { SecurityType } from '../enums'
import { AdminInjected, User, TaxReturn, AdminActivity } from '../types'
import express from 'express'

@Route('admin')
@Tags('Super Admin')
export class AdminController extends Controller {
  // Authentication
  @Post('login')
  public async adminLogin(
    @Body() body: AdminLoginBody,
  ): Promise<{ token: string; user: User } | { error: string }> {
    return adminLogin(body)
  }

  // Dashboard
  @Security(SecurityType.SuperAdmin)
  @Get('dashboard')
  public async getDashboard(@Request() injected: AdminInjected): Promise<AdminDashboardResponse> {
    return getDashboardStats(injected)
  }

  // User Management
  @Security(SecurityType.SuperAdmin)
  @Get('users')
  public async getAllUsers(
    @Request() injected: AdminInjected,
    @Query() page: number = 1,
    @Query() limit: number = 50,
    @Query() role?: string,
    @Query() validated?: boolean,
    @Query() isActive?: boolean,
    @Query() isSuperAdmin?: boolean,
    @Query() search?: string,
  ): Promise<AdminUserListResponse> {
    const filters: AdminUserFilters = {
      ...(role && { role: role as any }),
      ...(validated !== undefined && { validated }),
      ...(isActive !== undefined && { isActive }),
      ...(isSuperAdmin !== undefined && { isSuperAdmin }),
      ...(search && { search }),
    }
    return getAllUsers(injected, page, limit, filters)
  }

  @Security(SecurityType.SuperAdmin)
  @Get('users/{userId}')
  public async getUserById(
    @Path() userId: string,
    @Request() injected: AdminInjected,
  ): Promise<User & { taxReturns: TaxReturn[] }> {
    return getUserById(userId, injected)
  }

  @Security(SecurityType.SuperAdmin)
  @Post('users')
  public async createUser(
    @Body() body: AdminCreateUserBody,
    @Request() injected: AdminInjected,
  ): Promise<{ success: true; user: User } | { error: string }> {
    return createUserAsAdmin(body, injected)
  }

  @Security(SecurityType.SuperAdmin)
  @Put('users/{userId}')
  public async updateUser(
    @Path() userId: string,
    @Body() body: AdminUpdateUserBody,
    @Request() injected: AdminInjected,
  ): Promise<{ success: true; user: User } | { error: string }> {
    return updateUserAsAdmin(userId, body, injected)
  }

  @Security(SecurityType.SuperAdmin)
  @Delete('users/{userId}')
  public async deleteUser(
    @Path() userId: string,
    @Request() injected: AdminInjected,
  ): Promise<{ success: true } | { error: string }> {
    return deleteUserAsAdmin(userId, injected)
  }

  // Tax Return Management
  @Security(SecurityType.SuperAdmin)
  @Get('tax-returns')
  public async getAllTaxReturns(
    @Request() injected: AdminInjected,
    @Query() page: number = 1,
    @Query() limit: number = 50,
    @Query() userId?: string,
    @Query() year?: number,
    @Query() archived?: boolean,
    @Query() dateFrom?: string,
    @Query() dateTo?: string,
  ): Promise<AdminTaxReturnListResponse> {
    const filters: AdminTaxReturnFilters = {
      ...(userId && { userId }),
      ...(year && { year }),
      ...(archived !== undefined && { archived }),
      ...(dateFrom && { dateFrom }),
      ...(dateTo && { dateTo }),
    }
    return getAllTaxReturns(injected, page, limit, filters)
  }

  @Security(SecurityType.SuperAdmin)
  @Get('tax-returns/{taxReturnId}')
  public async getTaxReturnById(
    @Path() taxReturnId: string,
    @Request() injected: AdminInjected,
  ): Promise<TaxReturn & { user: User }> {
    return getTaxReturnById(taxReturnId, injected)
  }

  @Security(SecurityType.SuperAdmin)
  @Delete('tax-returns/{taxReturnId}')
  public async deleteTaxReturn(
    @Path() taxReturnId: string,
    @Request() injected: AdminInjected,
  ): Promise<{ success: true } | { error: string }> {
    return deleteTaxReturnAsAdmin(taxReturnId, injected)
  }

  // Bulk Actions
  @Security(SecurityType.SuperAdmin)
  @Post('users/bulk-action')
  public async performBulkAction(
    @Body() body: AdminBulkActionBody,
    @Request() injected: AdminInjected,
  ): Promise<{ success: true; affectedCount: number } | { error: string }> {
    return performBulkAction(body, injected)
  }

  // System Management
  @Security(SecurityType.SuperAdmin)
  @Get('system/settings')
  public async getSystemSettings(@Request() injected: AdminInjected): Promise<Record<string, any>> {
    return getSystemSettings(injected)
  }

  @Security(SecurityType.SuperAdmin)
  @Put('system/settings')
  public async updateSystemSettings(
    @Body() body: AdminSystemSettingsBody,
    @Request() injected: AdminInjected,
  ): Promise<{ success: true } | { error: string }> {
    return updateSystemSettings(body, injected)
  }

  @Security(SecurityType.SuperAdmin)
  @Get('system/health')
  public async getSystemHealth(@Request() injected: AdminInjected): Promise<{
    status: 'healthy' | 'warning' | 'critical'
    checks: Record<string, any>
    uptime: number
  }> {
    return getSystemHealth(injected)
  }

  // Activity & Audit
  @Security(SecurityType.SuperAdmin)
  @Get('activity')
  public async getActivityLog(
    @Request() injected: AdminInjected,
    @Query() page: number = 1,
    @Query() limit: number = 100,
    @Query() adminId?: string,
    @Query() action?: string,
    @Query() dateFrom?: string,
    @Query() dateTo?: string,
  ): Promise<{
    activities: AdminActivity[]
    pagination: { page: number; limit: number; total: number; totalPages: number }
  }> {
    return getAdminActivityLog(injected, page, limit, { adminId, action, dateFrom, dateTo })
  }

  // Data Export
  @Security(SecurityType.SuperAdmin)
  @Get('export/users')
  public async exportUsers(
    @Request() injected: AdminInjected,
    @Query() format: 'csv' | 'json' = 'csv',
  ): Promise<{ downloadUrl: string } | { data: any }> {
    return exportUserData(injected, format)
  }

  @Security(SecurityType.SuperAdmin)
  @Get('export/tax-returns')
  public async exportTaxReturns(
    @Request() injected: AdminInjected,
    @Query() format: 'csv' | 'json' = 'csv',
    @Query() year?: number,
  ): Promise<{ downloadUrl: string } | { data: any }> {
    return exportTaxReturnData(injected, format, year)
  }

  // Tax Return Creation with PDF Upload
  @Security(SecurityType.SuperAdmin)
  @Post('tax-returns/create-with-pdf')
  public async createTaxReturnWithPdf(
    @Request() injected: AdminInjected,
  ): Promise<{ success: true; taxReturn: TaxReturn } | { error: string }> {
    return createTaxReturnWithPdf(injected)
  }

  @Security(SecurityType.SuperAdmin)
  @Post('tax-returns/process-pdf')
  public async processTaxPdf(
    @Request() injected: AdminInjected,
  ): Promise<{ success: true; extractedData: any } | { error: string }> {
    return processTaxPdf(injected)
  }

  @Security(SecurityType.SuperAdmin)
  @Post('tax-returns/create-for-user')
  public async createTaxReturnForUser(
    @Body() body: { userId: string; year: number; extractedData?: any },
    @Request() injected: AdminInjected,
  ): Promise<{ success: true; taxReturn: TaxReturn } | { error: string }> {
    return createTaxReturnForUser(body, injected)
  }

  // Analytics
  @Security(SecurityType.SuperAdmin)
  @Get('analytics/users')
  public async getUserAnalytics(
    @Request() injected: AdminInjected,
    @Query() period: 'day' | 'week' | 'month' | 'year' = 'month',
  ): Promise<{
    registrations: Array<{ date: string; count: number }>
    activations: Array<{ date: string; count: number }>
    totalUsers: number
    growthRate: number
  }> {
    // Will be implemented in admin.service.ts
    throw new Error('Not implemented yet')
  }

  @Security(SecurityType.SuperAdmin)
  @Get('analytics/tax-returns')
  public async getTaxReturnAnalytics(
    @Request() injected: AdminInjected,
    @Query() period: 'day' | 'week' | 'month' | 'year' = 'month',
  ): Promise<{
    submissions: Array<{ date: string; count: number }>
    completions: Array<{ date: string; count: number }>
    avgTaxAmount: Array<{ date: string; amount: number }>
    totalRevenue: number
  }> {
    // Will be implemented in admin.service.ts
    throw new Error('Not implemented yet')
  }
}
