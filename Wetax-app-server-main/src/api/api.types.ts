import { ScanType, UserRole } from '../enums'
import {
  LohnausweisScanT,
  TaxReturn,
  TaxReturnData,
  User,
  UserStats,
  TaxReturnStats,
  SystemStats,
  UserManagement,
  AdminActivity,
  BankkontoScanT,
} from '../types'

export type RegisterBody = { ahvNumber: string; phoneNumber: string; email: string; isActive?: boolean }
// export type RegisterBody = { ahvNumber: string; phoneNumber: string }

export type LoginBody = { ahvNumber: string }
export type LoginEmailBody = { email: string }

export type SubmitVerificationCodeBody = {
  code: string
  ahvNumber: string
}

export type MimeType = 'image/png' | 'image/jpeg' | 'application/pdf'

export type ScanBody = {
  type: ScanType.Lohnausweis | ScanType.Bankkonto
  data: string // base64
  mimeType: MimeType
}

// export type ScanBodyBankkonto = {
//   type: ScanTypeBankkonto.Bankkonto
//   data: string // base64
//   mimeType: MimeType
// }

export type ScanResponse = {
  type: ScanType.Lohnausweis | ScanType.Bankkonto
  data: LohnausweisScanT | BankkontoScanT
}

// export type ScanResponseBankkonto = {
//   type: ScanTypeBankkonto.Bankkonto
//   data: BankkontoScanT
// }

export type UpdateUserDataBody = {
  ahvNumber?: string
  phoneNumber?: string
  email?: string
}

export type UpdateTaxReturnBody = {
  data: TaxReturnData
}

export type CreateTaxReturnBody = {
  year: number
}

export type UserT = {
  user: User
  returns: Array<TaxReturn>
}

// Super Admin API Types
export type AdminLoginBody = {
  email: string
  password: string
}

export type AdminCreateUserBody = {
  ahvNumber: string
  phoneNumber: string
  email?: string
  role?: UserRole
  isSuperAdmin?: boolean
}

export type AdminUpdateUserBody = {
  ahvNumber?: string
  phoneNumber?: string
  email?: string
  validated?: boolean
  isActive?: boolean
  role?: UserRole
  isSuperAdmin?: boolean
}

export type AdminUserFilters = {
  role?: UserRole
  validated?: boolean
  isActive?: boolean
  isSuperAdmin?: boolean
  search?: string // Search by name, email, or AHV number
}

export type AdminTaxReturnFilters = {
  userId?: string
  year?: number
  archived?: boolean
  dateFrom?: string
  dateTo?: string
}

export type AdminDashboardResponse = {
  stats: SystemStats
  recentActivity: AdminActivity[]
  alerts: Array<{
    type: 'warning' | 'error' | 'info'
    message: string
    timestamp: Date
  }>
}

export type AdminUserListResponse = {
  users: User[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type AdminTaxReturnListResponse = {
  taxReturns: Array<TaxReturn & { user: Pick<User, '_id' | 'ahvNummer' | 'phoneNumber' | 'email'> }>
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export type AdminBulkActionBody = {
  userIds: string[]
  action: 'activate' | 'deactivate' | 'validate' | 'invalidate' | 'delete'
}

export type AdminSystemSettingsBody = {
  maintenanceMode?: boolean
  allowNewRegistrations?: boolean
  maxTaxReturnsPerUser?: number
  systemMessage?: string
}
