import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

// Task update schema
const taskUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  assigneeId: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  phaseId: z.string().nullable().optional(),
  estimatedHours: z.number().nullable().optional(),
  actualHours: z.number().nullable().optional(),
  startDate: z.string().datetime().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  wbsCode: z.string().nullable().optional(),
})

// GET /api/organizations/[orgSlug]/projects/[projectId]/tasks/[taskId]
export async function GET(
  request: NextRequest,
  { params }: { params: { orgSlug: string; projectId: string; taskId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify organization membership
    const membership = await db.organizationMember.findFirst({
      where: {
        userId: session.user.id,
        organization: { slug: params.orgSlug },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get specific task
    const task = await db.task.findFirst({
      where: {
        id: params.taskId,
        projectId: params.projectId,
        project: { organizationId: membership.organizationId },
      },
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
        phase: {
          select: {
            id: true,
            name: true,
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
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({ task })
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/organizations/[orgSlug]/projects/[projectId]/tasks/[taskId]
export async function PUT(
  request: NextRequest,
  { params }: { params: { orgSlug: string; projectId: string; taskId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify organization membership and permissions
    const membership = await db.organizationMember.findFirst({
      where: {
        userId: session.user.id,
        organization: { slug: params.orgSlug },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if user can edit tasks
    const canEditTasks = ['ORG_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER'].includes(membership.role)
    if (!canEditTasks) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Verify task exists and belongs to project/organization
    const existingTask = await db.task.findFirst({
      where: {
        id: params.taskId,
        projectId: params.projectId,
        project: { organizationId: membership.organizationId },
      },
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Check if user is task creator, assignee, or has admin permissions
    const canEditThisTask = 
      existingTask.creatorId === session.user.id ||
      existingTask.assigneeId === session.user.id ||
      ['ORG_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER'].includes(membership.role)

    if (!canEditThisTask) {
      return NextResponse.json({ error: 'Cannot edit this task' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = taskUpdateSchema.parse(body)

    // Convert date strings to Date objects
    const updateData = {
      ...validatedData,
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : undefined,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
    }

    // Remove undefined values
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    )

    // Update task
    const updatedTask = await db.task.update({
      where: { id: params.taskId },
      data: cleanUpdateData,
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
        phase: {
          select: {
            id: true,
            name: true,
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
    })

    return NextResponse.json({ task: updatedTask })
  } catch (error) {
    console.error('Error updating task:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/organizations/[orgSlug]/projects/[projectId]/tasks/[taskId]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orgSlug: string; projectId: string; taskId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify organization membership and permissions
    const membership = await db.organizationMember.findFirst({
      where: {
        userId: session.user.id,
        organization: { slug: params.orgSlug },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if user can delete tasks (admins and PMs only)
    const canDeleteTasks = ['ORG_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER'].includes(membership.role)
    if (!canDeleteTasks) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Verify task exists and belongs to project/organization
    const existingTask = await db.task.findFirst({
      where: {
        id: params.taskId,
        projectId: params.projectId,
        project: { organizationId: membership.organizationId },
      },
    })

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Delete task (this will also handle subtasks due to CASCADE)
    await db.task.delete({
      where: { id: params.taskId },
    })

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
