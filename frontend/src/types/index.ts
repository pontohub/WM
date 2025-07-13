export type UserRole = 'ADMIN' | 'EMPLOYEE' | 'FREELANCER' | 'CLIENT'

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED'

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED'

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export type ContractStatus = 'DRAFT' | 'SENT' | 'SIGNED' | 'CANCELLED'

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'CANCELLED'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  avatarUrl?: string
  phone?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Company {
  id: string
  name: string
  email: string
  phone?: string
  website?: string
  address?: string
  taxId?: string
  logoUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  companyId: string
  name: string
  description?: string
  status: ProjectStatus
  startDate?: string
  endDate?: string
  budget?: number
  hourlyRate?: number
  createdBy: string
  createdAt: string
  updatedAt: string
  company?: Company
  creator?: User
  tasks?: Task[]
}

export interface Task {
  id: string
  projectId: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assignedTo?: string
  estimatedHours?: number
  dueDate?: string
  completedAt?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  project?: Project
  assignee?: User
  creator?: User
  timeEntries?: TimeEntry[]
  comments?: Comment[]
  subtasks?: Task[]
  parentTaskId?: string
}

export interface TimeEntry {
  id: string
  taskId: string
  userId: string
  description?: string
  startTime: string
  endTime?: string
  durationMinutes: number
  hourlyRate: number
  isBillable: boolean
  isApproved: boolean
  approvedBy?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
  task?: Task
  user?: User
  approver?: User
}

export interface Contract {
  id: string
  companyId: string
  projectId?: string
  title: string
  content: string
  status: ContractStatus
  totalValue?: number
  signedAt?: string
  signedByClient?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  company?: Company
  project?: Project
  creator?: User
}

export interface Invoice {
  id: string
  companyId: string
  projectId?: string
  invoiceNumber: string
  description?: string
  subtotal: number
  taxRate: number
  taxAmount: number
  totalAmount: number
  status: InvoiceStatus
  dueDate: string
  paidAt?: string
  createdBy: string
  createdAt: string
  updatedAt: string
  company?: Company
  project?: Project
  creator?: User
  items?: InvoiceItem[]
}

export interface InvoiceItem {
  id: string
  invoiceId: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface Comment {
  id: string
  taskId: string
  userId: string
  content: string
  createdAt: string
  updatedAt: string
  task?: Task
  user?: User
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: UserRole
}

export interface ApiResponse<T = any> {
  data?: T
  message?: string
  error?: boolean
  errors?: Record<string, string[]>
}

export interface PaginatedResponse<T = any> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  totalTasks: number
  completedTasks: number
  totalHours: number
  billableHours: number
  totalRevenue: number
  pendingInvoices: number
}

export interface TimeTrackingStats {
  totalHours: number
  billableHours: number
  approvedHours: number
  pendingHours: number
  hoursByProject: Array<{
    projectId: string
    projectName: string
    hours: number
  }>
}

