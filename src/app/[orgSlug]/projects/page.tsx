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
                },
              },
              budgets: {
                select: {
                  allocatedAmount: true,
                  spentAmount: true,
                },
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

  return <ProjectsListView projects={membership.organization.projects} />
}