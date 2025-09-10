import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import FinancialReports from '@/components/finance/financial-reports'

export default async function FinancialReportsPage({
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
              budgets: {
                orderBy: { createdAt: 'desc' },
              },
              tasks: {
                select: {
                  id: true,
                  status: true,
                  actualHours: true,
                  estimatedHours: true,
                },
              },
              _count: {
                select: {
                  tasks: true,
                  phases: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      },
    },
  })

  if (!membership) {
    notFound()
  }

  // Process financial data for reports
  const organizationData = {
    ...membership.organization,
    financialSummary: membership.organization.projects.reduce((acc, project) => {
      const projectAllocated = project.budgets.reduce((sum, b) => sum + Number(b.allocatedAmount), 0)
      const projectSpent = project.budgets.reduce((sum, b) => sum + Number(b.spentAmount), 0)
      const projectApproved = project.budgets.reduce((sum, b) => sum + Number(b.approvedAmount), 0)
      
      // Calculate project expenses from metadata
      const projectExpenses = project.budgets.flatMap(budget => {
        const metadata = budget.metadata as any
        return metadata?.expenses || []
      })

      return {
        totalAllocated: acc.totalAllocated + projectAllocated,
        totalSpent: acc.totalSpent + projectSpent,
        totalApproved: acc.totalApproved + projectApproved,
        totalExpenses: acc.totalExpenses + projectExpenses.length,
        pendingExpenses: acc.pendingExpenses + projectExpenses.filter((e: any) => e.status === 'PENDING').length,
        projectCount: acc.projectCount + 1,
        activeProjectCount: acc.activeProjectCount + (project.status === 'ACTIVE' ? 1 : 0),
      }
    }, { 
      totalAllocated: 0, 
      totalSpent: 0, 
      totalApproved: 0, 
      totalExpenses: 0, 
      pendingExpenses: 0, 
      projectCount: 0, 
      activeProjectCount: 0 
    })
  }

  return (
    <FinancialReports
      organizationSlug={params.orgSlug}
      userRole={membership.role}
      userId={session.user.id}
      organizationData={organizationData}
      canExport={['ORG_ADMIN', 'SUPER_ADMIN', 'DONOR_SPONSOR', 'PROJECT_MANAGER'].includes(membership.role)}
    />
  )
}
