import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import AdvancedReporting from '@/components/reports/advanced-reporting'

export default async function ReportsPage({
  params,
}: {
  params: { orgSlug: string }
}) {
  const session = await auth()
  
  if (!session?.user?.id) {
    notFound()
  }

  // Get organization membership
  const membership = await db.organizationMember.findFirst({
    where: {
      userId: session.user.id,
      organization: { slug: params.orgSlug },
    },
    include: {
      organization: {
        include: {
          projects: {
            include: {
              tasks: {
                select: {
                  id: true,
                  status: true,
                  priority: true,
                  dueDate: true,
                  actualHours: true,
                  estimatedHours: true,
                  createdAt: true,
                  updatedAt: true,
                },
              },
              phases: {
                select: {
                  id: true,
                  name: true,
                  status: true,
                  startDate: true,
                  endDate: true,
                },
              },
              budgets: {
                select: {
                  id: true,
                  category: true,
                  allocatedAmount: true,
                  spentAmount: true,
                  metadata: true,
                },
              },
              progressReports: {
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: {
                  reporter: {
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
                },
              },
            },
            orderBy: { updatedAt: 'desc' },
          },
          members: {
            include: {
              user: {
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
    },
  })

  if (!membership) {
    notFound()
  }

  // Process data for advanced reporting
  const reportingData = {
    organization: membership.organization,
    projects: membership.organization.projects.map(project => {
      // Calculate project metrics
      const totalTasks = project.tasks.length
      const completedTasks = project.tasks.filter(t => t.status === 'DONE').length
      const overdueTasks = project.tasks.filter(t => 
        t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE'
      ).length
      
      const totalBudget = project.budgets.reduce((sum, b) => sum + Number(b.allocatedAmount), 0)
      const spentBudget = project.budgets.reduce((sum, b) => sum + Number(b.spentAmount), 0)
      
      const totalEstimatedHours = project.tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0)
      const totalActualHours = project.tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0)
      
      // Calculate performance indicators
      const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
      const budgetUtilization = totalBudget > 0 ? (spentBudget / totalBudget) * 100 : 0
      const schedulePerformance = totalEstimatedHours > 0 ? (totalEstimatedHours / (totalActualHours || totalEstimatedHours)) * 100 : 100
      
      // Determine overall project health (traffic light system)
      const overallHealth = getProjectHealth(taskCompletionRate, budgetUtilization, overdueTasks, totalTasks)
      
      return {
        ...project,
        metrics: {
          totalTasks,
          completedTasks,
          overdueTasks,
          taskCompletionRate,
          totalBudget,
          spentBudget,
          budgetUtilization,
          totalEstimatedHours,
          totalActualHours,
          schedulePerformance,
          overallHealth,
        },
        // Extract PQG-related metadata if project is government type
        pqgData: project.metadata ? extractPQGData(project.metadata) : null,
      }
    }),
    userRole: membership.role,
    canCreateReports: ['ORG_ADMIN', 'PROJECT_MANAGER', 'MONITOR'].includes(membership.role),
    canExport: ['ORG_ADMIN', 'PROJECT_MANAGER', 'MONITOR', 'DONOR_SPONSOR'].includes(membership.role),
  }

  return (
    <AdvancedReporting
      organizationSlug={params.orgSlug}
      userId={session.user.id}
      reportingData={reportingData}
    />
  )
}

// Helper function to determine project health based on multiple factors
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

// Helper function to extract PQG-related data from project metadata
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
