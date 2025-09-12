import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import ProjectView from '@/components/projects/view/project-view'

export default async function ProjectPage({
  params,
}: {
  params: { orgSlug: string; projectId: string }
}) {
  const session = await auth()
  
  if (!session?.user?.id) {
    notFound()
  }

  // Get organization membership
  const membership = await db.organizationMember.findFirst({
    where: {
      userId: session.user.id,
      organization: {
        slug: params.orgSlug,
      },
    },
    include: {
      organization: {
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!membership) {
    notFound()
  }

  // Get project with comprehensive related data
  const project = await db.project.findFirst({
    where: {
      id: params.projectId,
      organizationId: membership.organizationId,
    },
    include: {
      organization: true,
      phases: {
        orderBy: { order: 'asc' },
        include: {
          tasks: {
            orderBy: { createdAt: 'desc' },
            include: {
              assignee: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
              creator: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
      tasks: {
        orderBy: { createdAt: 'desc' },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          phase: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
      budgets: {
        orderBy: { createdAt: 'desc' },
      },
      progressReports: {
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          approver: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: {
          tasks: true,
          phases: true,
          budgets: true,
          progressReports: true,
        },
      },
    },
  })

  if (!project) {
    notFound()
  }

  // Calculate comprehensive project metrics
  const projectMetrics = {
    // Task metrics
    totalTasks: project.tasks.length,
    completedTasks: project.tasks.filter(t => t.status === 'DONE').length,
    inProgressTasks: project.tasks.filter(t => t.status === 'IN_PROGRESS').length,
    todoTasks: project.tasks.filter(t => t.status === 'TODO').length,
    overdueTasks: project.tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE'
    ).length,
    
    // Time metrics
    totalEstimatedHours: project.tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0),
    totalActualHours: project.tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0),
    
    // Budget metrics
    totalBudget: project.budgets.reduce((sum, b) => sum + Number(b.allocatedAmount), 0),
    spentBudget: project.budgets.reduce((sum, b) => sum + Number(b.spentAmount), 0),
    approvedBudget: project.budgets.reduce((sum, b) => sum + Number(b.approvedAmount), 0),
    budgetCategories: project.budgets.length,
    
    // Progress metrics
    lastProgressReport: project.progressReports[0] || null,
    pendingReports: project.progressReports.filter(r => r.status === 'PENDING').length,
    approvedReports: project.progressReports.filter(r => r.status === 'APPROVED').length,
    
    // Phase metrics
    totalPhases: project.phases.length,
    completedPhases: project.phases.filter(p => p.status === 'COMPLETED').length,
    activePhases: project.phases.filter(p => p.status === 'ACTIVE').length,
  }

  // Calculate derived metrics
  const taskCompletionRate = projectMetrics.totalTasks > 0 ? 
    (projectMetrics.completedTasks / projectMetrics.totalTasks) * 100 : 0
  
  const budgetUtilization = projectMetrics.totalBudget > 0 ? 
    (projectMetrics.spentBudget / projectMetrics.totalBudget) * 100 : 0
  
  const schedulePerformance = projectMetrics.totalEstimatedHours > 0 ? 
    (projectMetrics.totalEstimatedHours / (projectMetrics.totalActualHours || projectMetrics.totalEstimatedHours)) * 100 : 100
  
  // Determine overall project health
  const overallHealth = getProjectHealth(taskCompletionRate, budgetUtilization, projectMetrics.overdueTasks, projectMetrics.totalTasks)
  
  // Extract PQG data if it's a government project
  const pqgData = project.metadata ? extractPQGData(project.metadata as any) : null
  
  // Check user permissions for this project
  const canEdit = ['ORG_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER'].includes(membership.role)
  const canViewFinancials = ['ORG_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER', 'DONOR_SPONSOR'].includes(membership.role)
  const canCreateReports = ['ORG_ADMIN', 'PROJECT_MANAGER', 'MONITOR'].includes(membership.role)
  const canApproveReports = ['ORG_ADMIN', 'SUPER_ADMIN', 'DONOR_SPONSOR'].includes(membership.role)
  const canManageTasks = ['ORG_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER'].includes(membership.role)

  // Get team members for the project (members who have tasks assigned or can be assigned)
  const projectTeam = membership.organization.members.filter(member => 
    canManageTasks || project.tasks.some(task => task.assigneeId === member.userId)
  )

  const enhancedProject = {
    ...project,
    budget: project.budget ? Number(project.budget) : 0,
    budgets: project.budgets.map(budget => ({
      ...budget,
      allocatedAmount: Number(budget.allocatedAmount),
      spentAmount: Number(budget.spentAmount),
      approvedAmount: Number(budget.approvedAmount),
    })),
    metrics: {
      ...projectMetrics,
      taskCompletionRate,
      budgetUtilization,
      schedulePerformance,
      overallHealth,
    },
    pqgData,
    team: projectTeam,
  }

  return (
    <ProjectView 
      project={enhancedProject}
      organizationSlug={params.orgSlug}
      userRole={membership.role}
      userId={session.user.id}
      permissions={{
        canEdit,
        canViewFinancials,
        canCreateReports,
        canApproveReports,
        canManageTasks,
      }}
    />
  )
}

// Helper function to determine project health
function getProjectHealth(
  taskCompletionRate: number,
  budgetUtilization: number,
  overdueTasks: number,
  totalTasks: number
): 'GREEN' | 'YELLOW' | 'RED' {
  const overdueRate = totalTasks > 0 ? (overdueTasks / totalTasks) * 100 : 0
  
  // RED conditions
  if (
    taskCompletionRate < 50 ||
    budgetUtilization > 120 ||
    overdueRate > 25
  ) {
    return 'RED'
  }
  
  // YELLOW conditions
  if (
    taskCompletionRate < 75 ||
    budgetUtilization > 90 ||
    overdueRate > 10
  ) {
    return 'YELLOW'
  }
  
  // GREEN conditions
  return 'GREEN'
}

// Helper function to extract PQG data from project metadata
function extractPQGData(metadata: any) {
  if (!metadata) return null
  
  return {
    priority: metadata.pqgPriority || null, // Prioridade I-IV
    program: metadata.pqgProgram || null, // Program code and name
    indicators: metadata.pqgIndicators || [], // Specific indicators with targets
    ugb: metadata.ugb || null, // Unidade Gestora Beneficiária
    interventionArea: metadata.interventionArea || null, // Área de Intervenção
    location: metadata.location || null, // Province/District
  }
}
