import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'
import ProjectEditForm from '@/components/projects/edit/project-edit-form'

export default async function ProjectEditPage({
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

  // Check if user has permission to edit projects
  const canEdit = ['ORG_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER'].includes(membership.role)

  if (!canEdit) {
    redirect(`/${params.orgSlug}/projects/${params.projectId}`)
  }

  // Get project
  const project = await db.project.findFirst({
    where: {
      id: params.projectId,
      organizationId: membership.organizationId,
    },
    include: {
      organization: true,
      phases: {
        orderBy: { order: 'asc' },
      },
      budgets: true,
    },
  })

  if (!project) {
    notFound()
  }

  return (
    <ProjectEditForm 
      project={project}
      organizationSlug={params.orgSlug}
    />
  )
}