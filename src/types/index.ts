// Core types for AgileTrack Pro
import type { Prisma } from '@prisma/client'

// Re-export Prisma enums for convenience
export {
  UserRole,
  ProjectStatus,
  ProjectMethodology,
  TaskStatus,
  TaskPriority,
  PhaseStatus,
  ReportType,
  ReportStatus,
} from '@prisma/client'

// Organization types
export type Organization = {
  id: string
  name: string
  slug: string
  settings?: any
  createdAt: Date
  updatedAt: Date
}

export type OrganizationWithMembers = Organization & {
  members: OrganizationMember[]
}

// User and membership types
export type User = {
  id: string
  name?: string | null
  email: string
  emailVerified?: Date | null
  image?: string | null
  avatarUrl?: string | null
  createdAt: Date
  updatedAt: Date
}
export type OrganizationMember = {
  id: string
  organizationId: string
  userId: string
  role: UserRole
  permissions?: any
  joinedAt: Date
  user: User
}

// Project types
export type Project = {
  id: string
  organizationId: string
  name: string
  description?: string | null
  methodology: ProjectMethodology
  status: ProjectStatus
  budget?: number | null
  startDate?: Date | null
  endDate?: Date | null
  metadata?: any
  settings?: any
  createdAt: Date
  updatedAt: Date
}

export type ProjectWithDetails = Project & {
  phases: ProjectPhase[]
  tasks: Task[]
  budgets: ProjectBudget[]
  progressReports: ProgressReport[]
}

export type ProjectPhase = {
  id: string
  projectId: string
  name: string
  description?: string | null
  startDate?: Date | null
  endDate?: Date | null
  budget?: number | null
  status: PhaseStatus
  metadata?: any
  createdAt: Date
  updatedAt: Date
}
// Task types
export type Task = {
  id: string
  projectId: string
  phaseId?: string | null
  parentId?: string | null
  assigneeId?: string | null
  creatorId: string
  wbsCode?: string | null
  title: string
  description?: string | null
  status: TaskStatus
  priority: TaskPriority
  estimatedHours?: number | null
  actualHours?: number | null
  startDate?: Date | null
  dueDate?: Date | null
  metadata?: any
  createdAt: Date
  updatedAt: Date
}

export type TaskWithDetails = Task & {
  assignee?: User | null
  creator: User
  subtasks: Task[]
  parent?: Task | null
}

// Financial types
export type ProjectBudget = {
  id: string
  projectId: string
  category: string
  allocatedAmount: number
  spentAmount: number
  approvedAmount: number
  metadata?: any
  createdAt: Date
  updatedAt: Date
}

// Progress reporting types
export type ProgressReport = {
  id: string
  projectId: string
  reporterId: string
  approverId?: string | null
  reportType: ReportType
  status: ReportStatus
  content: any
  attachments?: any
  submittedAt?: Date | null
  approvedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}
export type ProgressReportWithDetails = ProgressReport & {
  reporter: User
  approver?: User | null
  project: Project
}

// Session and authentication types
export type SessionUser = {
  id: string
  name?: string | null
  email: string
  image?: string | null
  organizationId?: string
  role?: UserRole
}

// API Response types
export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Form types for validation
export type CreateOrganizationInput = {
  name: string
  slug: string
}

export type CreateProjectInput = {
  name: string
  description?: string
  methodology: ProjectMethodology
  budget?: number
  startDate?: Date
  endDate?: Date
}

export type CreateTaskInput = {
  title: string
  description?: string
  phaseId?: string
  parentId?: string
  assigneeId?: string
  priority?: TaskPriority
  estimatedHours?: number
  startDate?: Date
  dueDate?: Date
}

// Dashboard types
export type DashboardStats = {
  totalProjects: number
  activeProjects: number
  completedTasks: number
  totalTasks: number
  totalBudget: number
  spentBudget: number
}

// Permission types
export type Permission = {
  resource: string
  action: string
}

export type RolePermissions = {
  [key in UserRole]: Permission[]
}