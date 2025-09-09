import { z } from 'zod'

// Project template types
export const ProjectTemplate = z.enum(['GOVERNMENT', 'NGO', 'CORPORATE', 'AGILE', 'WATERFALL', 'CUSTOM'])
export const ProjectMethodology = z.enum(['AGILE', 'WATERFALL', 'HYBRID', 'KANBAN', 'SCRUM'])
export const ProjectPriority = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
export const ProjectStatus = z.enum(['DRAFT', 'PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'])

// Stakeholder roles and responsibilities
export const StakeholderRole = z.enum([
  'PROJECT_SPONSOR',
  'PROJECT_MANAGER', 
  'TECHNICAL_LEAD',
  'BUSINESS_ANALYST',
  'QUALITY_ASSURANCE',
  'STAKEHOLDER',
  'END_USER',
  'VENDOR',
  'CONSULTANT'
])

export const RACIResponsibility = z.enum(['RESPONSIBLE', 'ACCOUNTABLE', 'CONSULTED', 'INFORMED'])

// Risk assessment levels
export const RiskImpact = z.enum(['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'])
export const RiskProbability = z.enum(['VERY_LOW', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'])
export const RiskCategory = z.enum(['TECHNICAL', 'FINANCIAL', 'OPERATIONAL', 'STRATEGIC', 'EXTERNAL', 'COMPLIANCE'])

// Project basics schema
export const projectBasicsSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  template: ProjectTemplate,
  methodology: ProjectMethodology,
  priority: ProjectPriority,
  estimatedBudget: z.number().min(0, 'Budget must be positive'),
  currency: z.string().length(3, 'Invalid currency code'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  tags: z.array(z.string()).optional(),
})

// Project charter schema
export const projectCharterSchema = z.object({
  vision: z.string().min(50, 'Vision statement must be at least 50 characters'),
  objectives: z.array(z.string().min(10, 'Each objective must be at least 10 characters')).min(1, 'At least one objective is required'),
  scope: z.string().min(100, 'Scope must be at least 100 characters'),
  outOfScope: z.string().optional(),
  deliverables: z.array(z.object({
    name: z.string().min(3, 'Deliverable name is required'),
    description: z.string().min(10, 'Deliverable description is required'),
    dueDate: z.string().optional(),
    criteria: z.string().optional(),
  })).min(1, 'At least one deliverable is required'),
  assumptions: z.array(z.string()).optional(),
  constraints: z.array(z.string()).optional(),
  successCriteria: z.array(z.string().min(10, 'Success criteria must be specific')).min(1, 'At least one success criteria is required'),
})

// Stakeholder schema
export const stakeholderSchema = z.object({
  stakeholders: z.array(z.object({
    id: z.string(),
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email address'),
    role: StakeholderRole,
    organization: z.string().optional(),
    influence: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    interest: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    responsibilities: z.array(RACIResponsibility),
    contactInfo: z.object({
      phone: z.string().optional(),
      department: z.string().optional(),
    }).optional(),
  })).min(1, 'At least one stakeholder is required'),
})

// Risk assessment schema
export const riskAssessmentSchema = z.object({
  risks: z.array(z.object({
    id: z.string(),
    title: z.string().min(5, 'Risk title is required'),
    description: z.string().min(20, 'Risk description must be detailed'),
    category: RiskCategory,
    impact: RiskImpact,
    probability: RiskProbability,
    mitigation: z.string().min(20, 'Mitigation strategy is required'),
    contingency: z.string().optional(),
    owner: z.string().min(1, 'Risk owner is required'),
    dueDate: z.string().optional(),
    status: z.enum(['IDENTIFIED', 'ASSESSED', 'MITIGATED', 'CLOSED']).default('IDENTIFIED'),
  })),
})

// Complete project wizard schema
export const projectWizardSchema = z.object({
  basics: projectBasicsSchema,
  charter: projectCharterSchema,
  stakeholders: stakeholderSchema,
  risks: riskAssessmentSchema,
})

// Type exports
export type ProjectWizardData = z.infer<typeof projectWizardSchema>
export type ProjectBasics = z.infer<typeof projectBasicsSchema>
export type ProjectCharter = z.infer<typeof projectCharterSchema>
export type StakeholderData = z.infer<typeof stakeholderSchema>
export type RiskAssessment = z.infer<typeof riskAssessmentSchema>

// Project template configurations
export const PROJECT_TEMPLATES = {
  GOVERNMENT: {
    name: 'Government Project',
    description: 'Structured approach for government initiatives with compliance requirements',
    methodology: 'WATERFALL' as const,
    requiredStakeholders: ['PROJECT_SPONSOR', 'PROJECT_MANAGER', 'BUSINESS_ANALYST'],
    defaultRisks: ['COMPLIANCE', 'FINANCIAL', 'OPERATIONAL'],
    phases: ['Planning', 'Requirements', 'Design', 'Implementation', 'Testing', 'Deployment', 'Closure'],
  },
  NGO: {
    name: 'NGO Project',
    description: 'Community-focused project template for non-profit organizations',
    methodology: 'HYBRID' as const,
    requiredStakeholders: ['PROJECT_SPONSOR', 'PROJECT_MANAGER', 'STAKEHOLDER'],
    defaultRisks: ['FINANCIAL', 'EXTERNAL', 'OPERATIONAL'],
    phases: ['Planning', 'Community Engagement', 'Implementation', 'Monitoring', 'Evaluation'],
  },
  CORPORATE: {
    name: 'Corporate Project',
    description: 'Business-oriented project template for corporate initiatives',
    methodology: 'AGILE' as const,
    requiredStakeholders: ['PROJECT_SPONSOR', 'PROJECT_MANAGER', 'TECHNICAL_LEAD'],
    defaultRisks: ['STRATEGIC', 'TECHNICAL', 'FINANCIAL'],
    phases: ['Discovery', 'Planning', 'Development', 'Testing', 'Release', 'Support'],
  },
  AGILE: {
    name: 'Agile Project',
    description: 'Iterative development with continuous delivery',
    methodology: 'AGILE' as const,
    requiredStakeholders: ['PROJECT_MANAGER', 'TECHNICAL_LEAD', 'END_USER'],
    defaultRisks: ['TECHNICAL', 'OPERATIONAL'],
    phases: ['Sprint 0', 'Sprint Planning', 'Development Sprints', 'Release', 'Retrospective'],
  },
  WATERFALL: {
    name: 'Waterfall Project',
    description: 'Sequential project approach with defined phases',
    methodology: 'WATERFALL' as const,
    requiredStakeholders: ['PROJECT_SPONSOR', 'PROJECT_MANAGER', 'BUSINESS_ANALYST', 'TECHNICAL_LEAD'],
    defaultRisks: ['TECHNICAL', 'OPERATIONAL', 'STRATEGIC'],
    phases: ['Requirements', 'Design', 'Implementation', 'Testing', 'Deployment', 'Maintenance'],
  },
  CUSTOM: {
    name: 'Custom Project',
    description: 'Flexible template for unique project requirements',
    methodology: 'HYBRID' as const,
    requiredStakeholders: ['PROJECT_MANAGER'],
    defaultRisks: ['OPERATIONAL'],
    phases: ['Planning', 'Execution', 'Monitoring', 'Closure'],
  },
} as const