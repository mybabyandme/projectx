import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const budgetSchema = z.object({
  projectId: z.string().min(1),
  category: z.string().min(1),
  allocatedAmount: z.number().positive(),
  description: z.string().optional(),
})

export async function POST(
  request: Request,
  { params }: { params: { orgSlug: string } }
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
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Check budget creation permissions
    const canEdit = ['ORG_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER'].includes(membership.role)
    
    if (!canEdit) {
      return NextResponse.json({ error: 'Insufficient permissions to create budgets' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = budgetSchema.parse(body)

    // Verify project belongs to organization
    const project = await db.project.findFirst({
      where: {
        id: validatedData.projectId,
        organizationId: membership.organizationId,
      },
    })

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Check if category already exists for this project
    const existingBudget = await db.projectBudget.findFirst({
      where: {
        projectId: validatedData.projectId,
        category: validatedData.category,
      },
    })

    if (existingBudget) {
      return NextResponse.json({ 
        error: 'Budget category already exists for this project' 
      }, { status: 400 })
    }

    // Create budget category
    const budget = await db.projectBudget.create({
      data: {
        projectId: validatedData.projectId,
        category: validatedData.category,
        allocatedAmount: validatedData.allocatedAmount,
        spentAmount: 0,
        approvedAmount: 0,
        metadata: {
          description: validatedData.description || '',
          createdBy: session.user.id,
          expenses: [],
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Budget category created successfully',
      budget: {
        id: budget.id,
        category: budget.category,
        allocatedAmount: budget.allocatedAmount,
        projectName: budget.project.name,
      },
    })

  } catch (error) {
    console.error('Budget creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid budget data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create budget category' },
      { status: 500 }
    )
  }
}

// Get budgets for organization
export async function GET(
  request: Request,
  { params }: { params: { orgSlug: string } }
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
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Check financial access
    const hasFinancialAccess = ['ORG_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER', 'DONOR_SPONSOR'].includes(membership.role)
    
    if (!hasFinancialAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get all project budgets for the organization
    const budgets = await db.projectBudget.findMany({
      where: {
        project: { organizationId: membership.organizationId },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: [
        { project: { name: 'asc' } },
        { category: 'asc' },
      ],
    })

    return NextResponse.json({ budgets })

  } catch (error) {
    console.error('Get budgets error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    )
  }
}
