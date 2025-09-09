import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import ProjectWizardView from '@/components/projects/wizard/project-wizard-view'

export default async function NewProjectPage({
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
      organization: true,
    },
  })

  if (!membership) {
    notFound()
  }

  // Check if user has permission to create projects
  const canCreateProjects = ['ORG_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER'].includes(membership.role)

  if (!canCreateProjects) {
    notFound()
  }

  return <ProjectWizardView organizationSlug={params.orgSlug} />
}