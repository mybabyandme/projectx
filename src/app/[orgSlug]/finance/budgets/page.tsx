import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import BudgetManagement from '@/components/finance/budget-management'

export default async function BudgetsPage({
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
                },
              },
              _count: {
                select: {
                  tasks: true,
                  phases: true,
                },
              },
            },
            orderBy: { name: 'asc' },
          },
        },
      },
    },
  })

  if (!membership) {
    notFound()
  }

  // Calculate organization-wide budget statistics
  const orgStats = membership.organization.projects.reduce((acc, project) => {
    const projectAllocated = project.budgets.reduce((sum, b) => sum + Number(b.allocatedAmount), 0)
    const projectSpent = project.budgets.reduce((sum, b) => sum + Number(b.spentAmount), 0)
    const projectApproved = project.budgets.reduce((sum, b) => sum + Number(b.approvedAmount), 0)
    
    return {
      totalAllocated: acc.totalAllocated + projectAllocated,
      totalSpent: acc.totalSpent + projectSpent,
      totalApproved: acc.totalApproved + projectApproved,
      activeProjects: acc.activeProjects + (project.status === 'ACTIVE' ? 1 : 0),
    }
  }, { totalAllocated: 0, totalSpent: 0, totalApproved: 0, activeProjects: 0 })

  return (
    <BudgetManagement
      organizationSlug={params.orgSlug}
      userRole={membership.role}
      userId={session.user.id}
      projects={membership.organization.projects}
      organizationStats={orgStats}
      canEdit={['ORG_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER'].includes(membership.role)}
      canApprove={['ORG_ADMIN', 'SUPER_ADMIN', 'DONOR_SPONSOR'].includes(membership.role)}
    />
  )
}
