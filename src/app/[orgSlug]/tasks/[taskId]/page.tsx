import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import TaskDetailView from '@/components/tasks/task-detail-view'

export default async function TaskDetailPage({
  params,
}: {
  params: { orgSlug: string; taskId: string }
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

  // Get task with all related data
  const task = await db.task.findFirst({
    where: {
      id: params.taskId,
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
          organizationId: true,
        },
      },
      phase: {
        select: {
          id: true,
          name: true,
          status: true,
        },
      },
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
          image: true,
        },
      },
      parent: {
        select: {
          id: true,
          title: true,
          status: true,
        },
      },
      subtasks: {
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          dueDate: true,
          assignee: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  })

  if (!task) {
    notFound()
  }

  // Check user permissions
  const canEdit = ['ORG_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER'].includes(membership.role) ||
                 task.assigneeId === session.user.id ||
                 task.creatorId === session.user.id

  return (
    <TaskDetailView 
      task={task}
      organizationSlug={params.orgSlug}
      userRole={membership.role}
      canEdit={canEdit}
      userId={session.user.id}
    />
  )
}
