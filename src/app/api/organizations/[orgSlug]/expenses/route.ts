import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const expenseSchema = z.object({
  projectId: z.string().min(1),
  category: z.string().optional(),
  amount: z.number().positive(),
  description: z.string().min(1),
  expenseDate: z.string(), // ISO date string
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

    // Parse and validate request body
    const body = await request.json()
    const validatedData = expenseSchema.parse(body)

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

    // Create expense entry in project budget
    const category = validatedData.category || 'General'
    
    // Find or create budget category
    let projectBudget = await db.projectBudget.findFirst({
      where: {
        projectId: validatedData.projectId,
        category: category,
      },
    })

    if (!projectBudget) {
      // Create new budget category with zero allocation
      projectBudget = await db.projectBudget.create({
        data: {
          projectId: validatedData.projectId,
          category: category,
          allocatedAmount: 0,
          spentAmount: 0,
          approvedAmount: 0,
          metadata: {
            expenses: [],
          },
        },
      })
    }

    // Add expense to metadata
    const currentMetadata = projectBudget.metadata as any || {}
    const currentExpenses = currentMetadata.expenses || []
    
    const newExpense = {
      amount: validatedData.amount,
      description: validatedData.description,
      expenseDate: validatedData.expenseDate,
      reportedBy: session.user.id,
      reportedAt: new Date().toISOString(),
      status: 'PENDING',
    }

    const updatedExpenses = [...currentExpenses, newExpense]

    // Update project budget with new expense
    await db.projectBudget.update({
      where: { id: projectBudget.id },
      data: {
        metadata: {
          ...currentMetadata,
          expenses: updatedExpenses,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Expense submitted successfully',
      expenseId: `${projectBudget.id}_${newExpense.reportedAt}`,
    })

  } catch (error) {
    console.error('Expense submission error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid expense data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to submit expense' },
      { status: 500 }
    )
  }
}

// Get expenses for organization
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

    // Get all project budgets with expenses
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
      orderBy: { updatedAt: 'desc' },
    })

    // Process expenses from metadata
    const expenses = budgets.flatMap((budget) => {
      const metadata = budget.metadata as any
      if (!metadata?.expenses) return []
      
      return metadata.expenses.map((expense: any) => ({
        id: `${budget.id}_${expense.reportedAt}`,
        budgetId: budget.id,
        projectId: budget.project.id,
        projectName: budget.project.name,
        category: budget.category,
        amount: expense.amount,
        description: expense.description,
        expenseDate: expense.expenseDate,
        reportedBy: expense.reportedBy,
        reportedAt: expense.reportedAt,
        status: expense.status || 'PENDING',
        approvedBy: expense.approvedBy,
        approvedAt: expense.approvedAt,
      }))
    }).sort((a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime())

    return NextResponse.json({ expenses })

  } catch (error) {
    console.error('Get expenses error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    )
  }
}
