import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import MyTasksView from '@/components/tasks/my-tasks-view'

export default async function MyTasksPage({
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

  // Get all tasks assigned to the current user across all projects in this organization
  const tasks = await db.task.findMany({
    where: {
      assigneeId: session.user.id,
      project: {
        organizationId: membership.organizationId,
      },
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          status: true,
          priority: true,
        },
      },
      phase: {
        select: {
          id: true,
          name: true,
        },
      },
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      parent: {
        select: {
          id: true,
          title: true,
        },
      },
      subtasks: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
    },
    orderBy: [
      { status: 'asc' }, // Prioritize active tasks
      { priority: 'desc' }, // Then by priority
      { dueDate: 'asc' }, // Then by due date
    ],
  })

  // Get summary statistics for all tasks (created by user, across org)
  const taskStats = await db.task.groupBy({
    by: ['status'],
    where: {
      assigneeId: session.user.id,
      project: {
        organizationId: membership.organizationId,
      },
    },
    _count: {
      status: true,
    },
  })

  return (
    <MyTasksView
      tasks={tasks}
      taskStats={taskStats}
      organizationSlug={params.orgSlug}
      userId={session.user.id}
      userRole={membership.role}
    />
  )
}
