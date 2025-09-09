import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import TaskReports from '@/components/tasks/task-reports'

export default async function TaskReportsPage({
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

  // Get projects for filtering
  const projects = await db.project.findMany({
    where: {
      organizationId: membership.organizationId,
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  // Get team members for filtering
  const assignees = await db.organizationMember.findMany({
    where: {
      organizationId: membership.organizationId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  const assigneeList = assignees.map(member => ({
    id: member.user.id,
    name: member.user.name || member.user.email,
    email: member.user.email,
  }))

  return (
    <TaskReports 
      organizationSlug={params.orgSlug}
      projects={projects}
      assignees={assigneeList}
    />
  )
}
