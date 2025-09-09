import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  methodology: z.enum(['AGILE', 'WATERFALL', 'HYBRID', 'KANBAN', 'SCRUM']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  budget: z.number().min(0).optional(),
  currency: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

// Update project
export async function PATCH(
  request: NextRequest,
  { params }: { params: { orgSlug: string; projectId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user has permission to edit projects
    const membership = await db.organizationMember.findFirst({
      where: {
        userId: session.user.id,
        organization: { slug: params.orgSlug },
        role: { in: ['ORG_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER'] }
      },
      include: { organization: true }
    })

    if (!membership) {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      )
    }

    // Verify project exists and belongs to organization
    const existingProject = await db.project.findFirst({
      where: {
        id: params.projectId,
        organizationId: membership.organizationId,
      }
    })

    if (!existingProject) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = updateProjectSchema.parse(body)

    // Update project
    const updatedProject = await db.project.update({
      where: {
        id: params.projectId,
      },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        methodology: validatedData.methodology,
        priority: validatedData.priority,
        budget: validatedData.budget,
        currency: validatedData.currency,
        startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: 'Project updated successfully',
      project: updatedProject
    })

  } catch (error) {
    console.error('Update project error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid project data', errors: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get single project
export async function GET(
  request: NextRequest,
  { params }: { params: { orgSlug: string; projectId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user has access to organization
    const membership = await db.organizationMember.findFirst({
      where: {
        userId: session.user.id,
        organization: { slug: params.orgSlug },
      },
      include: { organization: true }
    })

    if (!membership) {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      )
    }

    // Get project with related data
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
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
        },
        tasks: {
          orderBy: { createdAt: 'desc' },
          take: 10,
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
          },
        },
        budgets: {
          orderBy: { createdAt: 'desc' },
        },
        progressReports: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            reporter: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!project) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(project)

  } catch (error) {
    console.error('Get project error:', error)
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orgSlug: string; projectId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user has permission to delete projects
    const membership = await db.organizationMember.findFirst({
      where: {
        userId: session.user.id,
        organization: { slug: params.orgSlug },
        role: { in: ['ORG_ADMIN', 'SUPER_ADMIN'] } // Only admins can delete
      },
      include: { organization: true }
    })

    if (!membership) {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      )
    }

    // Verify project exists and belongs to organization
    const existingProject = await db.project.findFirst({
      where: {
        id: params.projectId,
        organizationId: membership.organizationId,
      }
    })

    if (!existingProject) {
      return NextResponse.json(
        { message: 'Project not found' },
        { status: 404 }
      )
    }

    // Delete project (cascade will handle related data)
    await db.project.delete({
      where: {
        id: params.projectId,
      },
    })

    return NextResponse.json({
      message: 'Project deleted successfully'
    })

  } catch (error) {
    console.error('Delete project error:', error)
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}