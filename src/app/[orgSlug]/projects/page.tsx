import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import ProjectsListView from '@/components/projects/projects-list-view'

export default async function ProjectsPage({
  params,
}: {
  params: { orgSlug: string }
}) {
  const session = await auth()
  
  if (!session?.user?.id) {
    notFound()
  }

  // Get organization and user membership
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
          projects: {
            include: {
              tasks: {
                select: {
                  id: true,
                  status: true,
                  priority: true,
                  dueDate: true,
                },
              },
              budgets: {
                select: {
                  allocatedAmount: true,
                  spentAmount: true,
                  approvedAmount: true,
                },
              },
              phases: {
                select: {
                  id: true,
                  name: true,
                  status: true,
                },
                orderBy: {
                  order: 'asc',
                },
              },
              progressReports: {
                select: {
                  id: true,
                  status: true,
                  createdAt: true,
                },
                orderBy: {
                  createdAt: 'desc',
                },
                take: 1,
              },
            },
            orderBy: {
              updatedAt: 'desc',
            },
          },
        },
      },
    },
  })

  if (!membership) {
    notFound()
  }

  // Check user permissions
  const canCreateProjects = ['ORG_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER'].includes(membership.role)
  const canEditProjects = ['ORG_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER'].includes(membership.role)
  const canViewFinancials = ['ORG_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER', 'DONOR_SPONSOR'].includes(membership.role)

  // Convert Decimal objects to numbers for client component compatibility
  const serializedProjects = membership.organization.projects.map(project => ({
    ...project,
    budget: project.budget ? Number(project.budget) : 0,
    budgets: project.budgets.map(budget => ({
      ...budget,
      allocatedAmount: Number(budget.allocatedAmount),
      spentAmount: Number(budget.spentAmount),
      approvedAmount: Number(budget.approvedAmount),
    })),
  }))

  return (
    <ProjectsListView 
      projects={serializedProjects}
      organizationSlug={params.orgSlug}
      userRole={membership.role}
      canCreateProjects={canCreateProjects}
      canEditProjects={canEditProjects}
      canViewFinancials={canViewFinancials}
    />
  )
}