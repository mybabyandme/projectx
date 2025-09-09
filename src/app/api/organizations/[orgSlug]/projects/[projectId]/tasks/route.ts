import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

// Task creation/update schema
const taskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  assigneeId: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  phaseId: z.string().nullable().optional(),
  estimatedHours: z.number().nullable().optional(),
  startDate: z.string().datetime().nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  wbsCode: z.string().nullable().optional(),
})

// GET /api/organizations/[orgSlug]/projects/[projectId]/tasks
export async function GET(
  request: NextRequest,
  { params }: { params: { orgSlug: string; projectId: string } }
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

    // Get project tasks
    const tasks = await db.task.findMany({
      where: {
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
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/organizations/[orgSlug]/projects/[projectId]/tasks
export async function POST(
  request: NextRequest,
  { params }: { params: { orgSlug: string; projectId: string } }
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

    // Check if user can create tasks (PM, Admin, or Team Member)
    const canCreateTasks = ['ORG_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER'].includes(membership.role)
    if (!canCreateTasks) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Verify project exists and belongs to organization
    const project = await db.project.findFirst({
      where: {
        id: params.projectId,
        organizationId: membership.organizationId,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = taskSchema.parse(body)

    // Convert date strings to Date objects
    const taskData = {
      ...validatedData,
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
      dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
    }

    // Create task
    const task = await db.task.create({
      data: {
        ...taskData,
        projectId: params.projectId,
        creatorId: session.user.id,
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
      },
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    
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
