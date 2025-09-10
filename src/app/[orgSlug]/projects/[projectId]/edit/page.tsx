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

  // Check if user has permission to edit projects
  const canEdit = ['ORG_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER'].includes(membership.role)

  if (!canEdit) {
    redirect(`/${params.orgSlug}/projects/${params.projectId}`)
  }

  // Get project with comprehensive data for editing
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
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      },
      budgets: {
        orderBy: { createdAt: 'desc' },
      },
      tasks: {
        select: {
          id: true,
          title: true,
          status: true,
          assigneeId: true,
          phaseId: true,
        },
      },
      progressReports: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          reportType: true,
          status: true,
          createdAt: true,
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

  // Calculate current project metrics for display
  const projectMetrics = {
    totalTasks: project.tasks.length,
    completedTasks: project.tasks.filter(t => t.status === 'DONE').length,
    totalBudget: project.budgets.reduce((sum, b) => sum + Number(b.allocatedAmount), 0),
    spentBudget: project.budgets.reduce((sum, b) => sum + Number(b.spentAmount), 0),
    totalPhases: project.phases.length,
    activeBudgets: project.budgets.length,
    lastReportDate: project.progressReports[0]?.createdAt || null,
  }

  // Check financial permissions
  const canViewFinancials = ['ORG_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER', 'DONOR_SPONSOR'].includes(membership.role)
  const canEditBudgets = ['ORG_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER'].includes(membership.role)

  // Get organization team members for assignment options
  const teamMembers = membership.organization.members.map(member => ({
    id: member.userId,
    name: member.user.name,
    email: member.user.email,
    role: member.role,
    image: member.user.image,
  }))

  const enhancedProject = {
    ...project,
    metrics: projectMetrics,
  }

  return (
    <ProjectEditForm 
      project={enhancedProject}
      organizationSlug={params.orgSlug}
      userRole={membership.role}
      userId={session.user.id}
      teamMembers={teamMembers}
      permissions={{
        canEdit: true, // Already checked above
        canViewFinancials,
        canEditBudgets,
      }}
    />
  )
}
