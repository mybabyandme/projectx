import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import TeamManagementView from '@/components/team/team-management-view'

export default async function TeamPage({
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
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                  createdAt: true,
                },
              },
            },
            orderBy: {
              joinedAt: 'desc',
            },
          },
        },
      },
    },
  })

  if (!membership) {
    notFound()
  }

  // Check if user has permission to manage team
  const canManageTeam = ['ORG_ADMIN', 'SUPER_ADMIN'].includes(membership.role)

  return (
    <TeamManagementView 
      members={membership.organization.members}
      currentUserRole={membership.role}
      canManageTeam={canManageTeam}
      organizationSlug={params.orgSlug}
    />
  )
}