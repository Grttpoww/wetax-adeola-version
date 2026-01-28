import { ObjectId } from 'mongodb'
import { db, CollectionEnum } from '../db'
import { generateToken } from '../jwt'
import { UserRole } from '../enums'
import { DEFAULT_TAX_RETURN_DATA } from '../constants'
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
  AdminInjected,
  User,
  TaxReturn,
  AdminActivity,
  UserStats,
  TaxReturnStats,
  SystemStats,
} from '../types'
import { calculateAnzahlArbeitstage } from '../util'

// Super Admin Authentication
export const adminLogin = async (
  params: AdminLoginBody,
): Promise<{ token: string; user: User } | { error: string }> => {
  try {
    // For demo purposes, using a simple email/password check
    // In production, use proper password hashing with bcrypt
    const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@wetax.ch'
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin123!'

    if (params.email !== adminEmail || params.password !== adminPassword) {
      return { error: 'Invalid admin credentials' }
    }

    // Find or create super admin user
    let adminUser = await db().users.findOne({
      email: params.email,
      isSuperAdmin: true,
    })

    if (!adminUser) {
      // Create super admin user if doesn't exist
      adminUser = {
        _id: new ObjectId(),
        created: new Date(),
        verificationCode: undefined,
        ahvNummer: '999.999.999.99', // Special AHV for super admin
        phoneNumber: '+41000000000',
        email: params.email,
        validated: true,
        isActive: true,
        role: UserRole.SuperAdmin,
        isSuperAdmin: true,
      }
      await db().users.insertOne(adminUser)
    }

    const token = await generateToken(adminUser)

    return { token, user: adminUser }
  } catch (error) {
    console.error('Admin login error:', error)
    return { error: 'Login failed' }
  }
}

// Dashboard Statistics
export const getDashboardStats = async (injected: AdminInjected): Promise<AdminDashboardResponse> => {
  try {
    const userStats = await getUserStats()
    const taxReturnStats = await getTaxReturnStats()
    const recentActivity = await getRecentAdminActivity(10)
    const alerts = await getSystemAlerts()

    return {
      stats: {
        userStats,
        taxReturnStats,
        systemHealth: {
          dbStatus: 'connected',
          lastBackup: new Date(),
          serverUptime: process.uptime(),
        },
      },
      recentActivity,
      alerts,
    }
  } catch (error) {
    console.error('Dashboard stats error:', error)
    throw new Error('Failed to load dashboard stats')
  }
}

// User Management
export const getAllUsers = async (
  injected: AdminInjected,
  page: number = 1,
  limit: number = 50,
  filters: AdminUserFilters = {},
): Promise<AdminUserListResponse> => {
  try {
    const skip = (page - 1) * limit
    const query: any = {}

    // Apply filters
    if (filters.role) query.role = filters.role
    if (filters.validated !== undefined) query.validated = filters.validated
    if (filters.isActive !== undefined) query.isActive = filters.isActive
    if (filters.isSuperAdmin !== undefined) query.isSuperAdmin = filters.isSuperAdmin
    if (filters.search) {
      query.$or = [
        { ahvNummer: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { phoneNumber: { $regex: filters.search, $options: 'i' } },
      ]
    }

    const users = await db().users.find(query).skip(skip).limit(limit).toArray()
    const total = await db().users.countDocuments(query)

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error('Get all users error:', error)
    throw new Error('Failed to fetch users')
  }
}

export const getUserById = async (
  userId: string,
  injected: AdminInjected,
): Promise<User & { taxReturns: TaxReturn[] }> => {
  try {
    const user = await db().users.findOne({ _id: new ObjectId(userId) })
    if (!user) {
      throw new Error('User not found')
    }

    const taxReturns = await db()
      .taxReturns.find({ userId: new ObjectId(userId) })
      .toArray()

    return { ...user, taxReturns }
  } catch (error) {
    console.error('Get user by ID error:', error)
    throw new Error('Failed to fetch user')
  }
}

export const createUserAsAdmin = async (
  params: AdminCreateUserBody,
  injected: AdminInjected,
): Promise<{ success: true; user: User } | { error: string }> => {
  try {
    // Check if user already exists
    const existingUser = await db().users.findOne({ ahvNummer: params.ahvNumber })
    if (existingUser) {
      return { error: 'User with this AHV number already exists' }
    }

    const newUser: User = {
      _id: new ObjectId(),
      created: new Date(),
      verificationCode: undefined,
      ahvNummer: params.ahvNumber,
      phoneNumber: params.phoneNumber,
      email: params.email,
      validated: true, // Admin-created users are auto-validated
      isActive: false,
      role: params.role || UserRole.User,
      isSuperAdmin: params.isSuperAdmin || false,
    }

    await db().users.insertOne(newUser)

    return { success: true, user: newUser }
  } catch (error) {
    console.error('Create user error:', error)
    return { error: 'Failed to create user' }
  }
}

export const updateUserAsAdmin = async (
  userId: string,
  params: AdminUpdateUserBody,
  injected: AdminInjected,
): Promise<{ success: true; user: User } | { error: string }> => {
  try {
    const result = await db().users.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      { $set: params },
      { returnDocument: 'after' },
    )

    if (!result) {
      return { error: 'User not found' }
    }

    return { success: true, user: result }
  } catch (error) {
    console.error('Update user error:', error)
    return { error: 'Failed to update user' }
  }
}

export const deleteUserAsAdmin = async (
  userId: string,
  injected: AdminInjected,
): Promise<{ success: true } | { error: string }> => {
  try {
    // Hard delete - actually remove the user from database
    const result = await db().users.deleteOne({ _id: new ObjectId(userId) })

    if (result.deletedCount === 0) {
      return { error: 'User not found' }
    }

    // Also delete all user's tax returns (optional - you might want to keep these for audit purposes)
    await db().taxReturns.deleteMany({ userId: new ObjectId(userId) })

    return { success: true }
  } catch (error) {
    console.error('Delete user error:', error)
    return { error: 'Failed to delete user' }
  }
}

// Tax Return Management
export const getAllTaxReturns = async (
  injected: AdminInjected,
  page: number = 1,
  limit: number = 50,
  filters: AdminTaxReturnFilters = {},
): Promise<AdminTaxReturnListResponse> => {
  try {
    const skip = (page - 1) * limit
    const query: any = {}

    // Apply filters
    if (filters.userId) query.userId = new ObjectId(filters.userId)
    if (filters.year) query.year = filters.year
    if (filters.archived !== undefined) query.archived = filters.archived
    if (filters.dateFrom || filters.dateTo) {
      query.created = {}
      if (filters.dateFrom) query.created.$gte = new Date(filters.dateFrom)
      if (filters.dateTo) query.created.$lte = new Date(filters.dateTo)
    }

    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          userId: 1,
          year: 1,
          created: 1,
          archived: 1,
          data: 1,
          'user._id': 1,
          'user.ahvNummer': 1,
          'user.phoneNumber': 1,
          'user.email': 1,
        },
      },
      { $skip: skip },
      { $limit: limit },
    ]

    const taxReturns = await db().taxReturns.aggregate(pipeline).toArray()
    const total = await db().taxReturns.countDocuments(query)

    return {
      taxReturns: taxReturns as any[], // Type assertion for MongoDB aggregation result
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error('Get all tax returns error:', error)
    throw new Error('Failed to fetch tax returns')
  }
}

export const getTaxReturnById = async (
  taxReturnId: string,
  injected: AdminInjected,
): Promise<TaxReturn & { user: User }> => {
  try {
    const pipeline = [
      { $match: { _id: new ObjectId(taxReturnId) } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
    ]

    const result = await db().taxReturns.aggregate(pipeline).toArray()
    if (result.length === 0) {
      throw new Error('Tax return not found')
    }

    return result[0] as any // Type assertion for MongoDB aggregation result
  } catch (error) {
    console.error('Get tax return by ID error:', error)
    throw new Error('Failed to fetch tax return')
  }
}

export const deleteTaxReturnAsAdmin = async (
  taxReturnId: string,
  injected: AdminInjected,
): Promise<{ success: true } | { error: string }> => {
  try {
    const result = await db().taxReturns.updateOne(
      { _id: new ObjectId(taxReturnId) },
      { $set: { archived: true } },
    )

    if (result.matchedCount === 0) {
      return { error: 'Tax return not found' }
    }

    return { success: true }
  } catch (error) {
    console.error('Delete tax return error:', error)
    return { error: 'Failed to delete tax return' }
  }
}

// Bulk Actions
export const performBulkAction = async (
  params: AdminBulkActionBody,
  injected: AdminInjected,
): Promise<{ success: true; affectedCount: number } | { error: string }> => {
  try {
    const userIds = params.userIds.map((id) => new ObjectId(id))
    let updateData: any = {}

    switch (params.action) {
      case 'activate':
        updateData = { isActive: true }
        break
      case 'deactivate':
        updateData = { isActive: false }
        break
      case 'validate':
        updateData = { validated: true }
        break
      case 'invalidate':
        updateData = { validated: false }
        break
      case 'delete':
        updateData = { isActive: false, validated: false }
        break
      default:
        return { error: 'Invalid action' }
    }

    const result = await db().users.updateMany({ _id: { $in: userIds } }, { $set: updateData })

    return { success: true, affectedCount: result.modifiedCount }
  } catch (error) {
    console.error('Bulk action error:', error)
    return { error: 'Failed to perform bulk action' }
  }
}

// System Management
export const getSystemSettings = async (injected: AdminInjected): Promise<Record<string, any>> => {
  // In a real implementation, these would come from a settings collection
  return {
    maintenanceMode: false,
    allowNewRegistrations: true,
    maxTaxReturnsPerUser: 5,
    systemMessage: '',
    version: '1.0.0',
    lastBackup: new Date(),
  }
}

export const updateSystemSettings = async (
  params: AdminSystemSettingsBody,
  injected: AdminInjected,
): Promise<{ success: true } | { error: string }> => {
  try {
    return { success: true }
  } catch (error) {
    console.error('Update system settings error:', error)
    return { error: 'Failed to update settings' }
  }
}

export const getSystemHealth = async (injected: AdminInjected) => {
  try {
    // Database connection check - simplified ping
    let dbStatus = true
    try {
      await db().users.findOne({})
    } catch (e) {
      dbStatus = false
    }

    // Memory usage
    const memUsage = process.memoryUsage()

    // Server uptime
    const uptime = process.uptime()

    const checks = {
      database: dbStatus ? 'healthy' : 'error',
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
        external: Math.round(memUsage.external / 1024 / 1024) + ' MB',
      },
      uptime: Math.round(uptime / 60) + ' minutes',
    }

    const status: 'healthy' | 'critical' = dbStatus ? 'healthy' : 'critical'

    return { status, checks, uptime }
  } catch (error: any) {
    return {
      status: 'critical' as const,
      checks: { error: error?.message || 'Unknown error' },
      uptime: process.uptime(),
    }
  }
}

// Activity Logging
export const getAdminActivityLog = async (
  injected: AdminInjected,
  page: number = 1,
  limit: number = 100,
  filters: any = {},
) => {
  try {
    const skip = (page - 1) * limit
    const query: any = {}

    if (filters.adminId) query.adminId = new ObjectId(filters.adminId)
    if (filters.action) query.action = { $regex: filters.action, $options: 'i' }
    if (filters.dateFrom || filters.dateTo) {
      query.timestamp = {}
      if (filters.dateFrom) query.timestamp.$gte = new Date(filters.dateFrom)
      if (filters.dateTo) query.timestamp.$lte = new Date(filters.dateTo)
    }

    const activities = await db()
    [CollectionEnum.AdminActivities].find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const total = await db()[CollectionEnum.AdminActivities].countDocuments(query)

    return {
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error('Get activity log error:', error)
    throw new Error('Failed to fetch activity log')
  }
}

// Data Export
export const exportUserData = async (injected: AdminInjected, format: 'csv' | 'json') => {
  try {
    const users = await db().users.find({}).toArray()

    if (format === 'json') {
      return { data: users }
    } else {
      // In a real implementation, generate CSV file and return download URL
      return { downloadUrl: '/downloads/users.csv' }
    }
  } catch (error) {
    console.error('Export user data error:', error)
    throw new Error('Failed to export user data')
  }
}

export const exportTaxReturnData = async (
  injected: AdminInjected,
  format: 'csv' | 'json',
  year?: number,
) => {
  try {
    const query = year ? { year } : {}
    const taxReturns = await db().taxReturns.find(query).toArray()

    if (format === 'json') {
      return { data: taxReturns }
    } else {
      // In a real implementation, generate CSV file and return download URL
      return { downloadUrl: `/downloads/tax-returns${year ? `-${year}` : ''}.csv` }
    }
  } catch (error) {
    console.error('Export tax return data error:', error)
    throw new Error('Failed to export tax return data')
  }
}

// Helper Functions
const getUserStats = async (): Promise<UserStats> => {
  const totalUsers = await db().users.countDocuments({})
  const activeUsers = await db().users.countDocuments({ isActive: true })
  const validatedUsers = await db().users.countDocuments({ validated: true })
  const unvalidatedUsers = await db().users.countDocuments({ validated: false })
  const superAdmins = await db().users.countDocuments({ isSuperAdmin: true })

  return {
    totalUsers,
    activeUsers,
    validatedUsers,
    unvalidatedUsers,
    superAdmins,
  }
}

const getTaxReturnStats = async (): Promise<TaxReturnStats> => {
  const totalReturns = await db().taxReturns.countDocuments({})
  const completedReturns = await db().taxReturns.countDocuments({
    'data.personData.finished': true,
  })
  const archivedReturns = await db().taxReturns.countDocuments({ archived: true })
  const activeReturns = await db().taxReturns.countDocuments({ archived: false })

  // Calculate average tax amount (simplified)
  const pipeline = [
    { $match: { archived: false } },
    { $group: { _id: null, avgTax: { $avg: '$calculatedTax' }, totalTax: { $sum: '$calculatedTax' } } },
  ]
  const result = await db().taxReturns.aggregate(pipeline).toArray()
  const avgTaxAmount = result[0]?.avgTax || 0
  const totalTaxAmount = result[0]?.totalTax || 0

  return {
    totalReturns,
    completedReturns,
    archivedReturns,
    activeReturns,
    avgTaxAmount,
    totalTaxAmount,
  }
}

const getRecentAdminActivity = async (limit: number = 10): Promise<AdminActivity[]> => {
  try {
    return await db()
    [CollectionEnum.AdminActivities].find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray()
  } catch (error) {
    return []
  }
}

const getSystemAlerts = async () => {
  const alerts = []

  // Check for system issues
  try {
    const userCount = await db().users.countDocuments({})
    if (userCount > 10000) {
      alerts.push({
        type: 'warning' as const,
        message: 'High user count detected. Consider performance optimization.',
        timestamp: new Date(),
      })
    }

    const unvalidatedCount = await db().users.countDocuments({ validated: false })
    if (unvalidatedCount > 100) {
      alerts.push({
        type: 'info' as const,
        message: `${unvalidatedCount} unvalidated users pending review.`,
        timestamp: new Date(),
      })
    }
  } catch (error) {
    alerts.push({
      type: 'error' as const,
      message: 'Database connection issues detected.',
      timestamp: new Date(),
    })
  }

  return alerts
}

// Tax Return Management with PDF Upload
export const createTaxReturnWithPdf = async (
  injected: AdminInjected,
): Promise<{ success: true; taxReturn: TaxReturn } | { error: string }> => {
  try {
    // This function will be called after PDF upload through multipart form data
    // The actual PDF processing logic will be in processTaxPdf
    const newTaxReturn: TaxReturn = {
      _id: new ObjectId(),
      userId: new ObjectId(), // Will be set when associating with user
      year: new Date().getFullYear(),
      created: new Date(),
      archived: false,
      validated: true,
      data: DEFAULT_TAX_RETURN_DATA, // Use the default data structure
    }

    return { success: true, taxReturn: newTaxReturn }
  } catch (error) {
    console.error('Create tax return with PDF error:', error)
    return { error: 'Failed to create tax return with PDF upload' }
  }
}

export const processTaxPdf = async (
  injected: AdminInjected,
): Promise<{ success: true; extractedData: any } | { error: string }> => {
  try {
    // This function will process the uploaded PDF file using OpenAI
    // For now, return a placeholder response
    const extractedData = {
      personalInfo: {
        firstName: 'Extracted Name',
        lastName: 'Extracted Surname',
        ahvNumber: '123.456.789.01',
      },
      income: {
        salary: 75000,
        otherIncome: 5000,
      },
      deductions: {
        insurance: 3000,
        donations: 1000,
      },
    }

    return { success: true, extractedData }
  } catch (error) {
    console.error('Process tax PDF error:', error)
    return { error: 'Failed to process PDF with OpenAI' }
  }
}

export const createTaxReturnForUser = async (
  params: { userId: string; year: number; extractedData?: any },
  injected: AdminInjected,
): Promise<{ success: true; taxReturn: TaxReturn } | { error: string }> => {
  try {
    // Verify user exists
    const user = await db().users.findOne({ _id: new ObjectId(params.userId) })
    if (!user) {
      return { error: 'User not found' }
    }

    // Check if tax return already exists for this user and year
    const existingReturn = await db().taxReturns.findOne({
      userId: new ObjectId(params.userId),
      year: params.year,
    })

    if (existingReturn) {
      return { error: `Tax return already exists for user ${user.ahvNummer} for year ${params.year}` }
    }

    // Create new tax return with extracted data
    const taxReturnData = params.extractedData || DEFAULT_TAX_RETURN_DATA

    // Automatically calculate anzahlarbeitstage for geldVerdient entries
    if (taxReturnData.geldVerdient?.data && Array.isArray(taxReturnData.geldVerdient.data)) {
      taxReturnData.geldVerdient.data = taxReturnData.geldVerdient.data.map((entry: any) => ({
        ...entry,
        anzahlarbeitstage: calculateAnzahlArbeitstage(entry.von, entry.bis, entry.urlaubstage),
      }))
    }

    const newTaxReturn: TaxReturn = {
      _id: new ObjectId(),
      userId: new ObjectId(params.userId),
      year: params.year,
      created: new Date(),
      archived: false,
      validated: true,
      data: taxReturnData,
    }

    await db().taxReturns.insertOne(newTaxReturn)

    // Log admin activity
    const activity: AdminActivity = {
      _id: new ObjectId(),
      adminId: injected.user._id,
      action: 'create_tax_return',
      details: {
        userId: params.userId,
        year: params.year,
        method: 'admin_panel_with_pdf',
      },
      timestamp: new Date(),
    }

    await db()[CollectionEnum.AdminActivities].insertOne(activity)

    return { success: true, taxReturn: newTaxReturn }
  } catch (error) {
    console.error('Create tax return for user error:', error)
    return { error: 'Failed to create tax return for user' }
  }
}
