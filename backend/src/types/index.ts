import { Request } from 'express'
import { User as PrismaUser } from '@prisma/client'

// User type without sensitive fields for API responses
export type User = Omit<PrismaUser, 'passwordHash'>

// Extend Express Request to include user
export interface AuthenticatedRequest extends Request {
  user?: User
}

// JWT Payload
export interface JwtPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

// Pagination options
export interface PaginationOptions {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Query filters
export interface QueryFilters {
  search?: string
  status?: string
  role?: string
  companyId?: string
  projectId?: string
  userId?: string
  startDate?: Date
  endDate?: Date
  isActive?: boolean
  isApproved?: boolean
  isBillable?: boolean
}

// Email options
export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
  attachments?: Array<{
    filename: string
    path: string
  }>
}

// File upload options
export interface FileUploadOptions {
  fieldName: string
  maxSize: number
  allowedTypes: string[]
  destination: string
}

// Dashboard statistics
export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  totalHours: number
  billableHours: number
  approvedHours: number
  totalRevenue: number
  pendingRevenue: number
  totalInvoices: number
  paidInvoices: number
  overdueInvoices: number
}

// Time tracking statistics
export interface TimeTrackingStats {
  totalHours: number
  billableHours: number
  approvedHours: number
  pendingHours: number
  hoursByProject: Array<{
    projectId: string
    projectName: string
    companyName: string
    hours: number
    billableHours: number
    revenue: number
  }>
  hoursByUser: Array<{
    userId: string
    userName: string
    hours: number
    billableHours: number
    revenue: number
  }>
  hoursByDay: Array<{
    date: string
    hours: number
    billableHours: number
  }>
}

// Financial report data
export interface FinancialReport {
  period: {
    startDate: string
    endDate: string
  }
  revenue: {
    total: number
    paid: number
    pending: number
    overdue: number
  }
  expenses: {
    total: number
    byCategory: Array<{
      category: string
      amount: number
    }>
  }
  profit: {
    gross: number
    net: number
    margin: number
  }
  invoices: {
    total: number
    paid: number
    pending: number
    overdue: number
    averageValue: number
  }
  projects: {
    total: number
    completed: number
    active: number
    averageRevenue: number
  }
}

// Project report data
export interface ProjectReport {
  project: {
    id: string
    name: string
    status: string
    budget: number
    spent: number
    remaining: number
    progress: number
  }
  tasks: {
    total: number
    completed: number
    pending: number
    overdue: number
  }
  time: {
    estimated: number
    tracked: number
    billable: number
    approved: number
  }
  team: Array<{
    userId: string
    userName: string
    role: string
    hoursWorked: number
    tasksCompleted: number
  }>
  timeline: Array<{
    date: string
    hoursWorked: number
    tasksCompleted: number
  }>
}

// Notification types
export interface NotificationData {
  type: 'task_assigned' | 'task_completed' | 'time_approved' | 'invoice_paid' | 'contract_signed'
  title: string
  message: string
  userId: string
  entityId?: string
  entityType?: 'task' | 'project' | 'invoice' | 'contract'
  metadata?: Record<string, any>
}

// Audit log entry
export interface AuditLogEntry {
  userId: string
  action: string
  entityType: string
  entityId: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  timestamp: Date
}

// API error types
export class ApiError extends Error {
  statusCode: number
  errors?: Record<string, string[]>

  constructor(message: string, statusCode = 400, errors?: Record<string, string[]>) {
    super(message)
    this.statusCode = statusCode
    this.errors = errors
    this.name = 'ApiError'
  }
}

export class ValidationError extends ApiError {
  constructor(errors: Record<string, string[]>, message = 'Dados inválidos') {
    super(message, 422, errors)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Recurso não encontrado') {
    super(message, 404)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Não autorizado') {
    super(message, 401)
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Acesso negado') {
    super(message, 403)
    this.name = 'ForbiddenError'
  }
}

