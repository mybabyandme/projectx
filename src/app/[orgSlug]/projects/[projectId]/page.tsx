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
      organization: true,
    },
  })

  if (!membership) {
    notFound()
  }

  // Get project with all related data
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
            take: 5, // Recent tasks for overview
          },
        },
      },
      tasks: {
        orderBy: { createdAt: 'desc' },
        take: 10, // Recent tasks
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
      budgets: {
        orderBy: { createdAt: 'desc' },
      },
      progressReports: {
        orderBy: { createdAt: 'desc' },
        take: 5,
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
    },
  })

  if (!project) {
    notFound()
  }

  // Check user permissions for this project
  const canEdit = ['ORG_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER'].includes(membership.role)
  const canViewFinancials = ['ORG_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER', 'DONOR_SPONSOR'].includes(membership.role)

  return (
    <ProjectView 
      project={project}
      organizationSlug={params.orgSlug}
      userRole={membership.role}
      canEdit={canEdit}
      canViewFinancials={canViewFinancials}
      userId={session.user.id}
    />
  )
}