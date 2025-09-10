import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { orgSlug: string; expenseId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify organization membership and approval permissions
    const membership = await db.organizationMember.findFirst({
      where: {
        userId: session.user.id,
        organization: { slug: params.orgSlug },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Check approval permissions
    const canApprove = ['ORG_ADMIN', 'SUPER_ADMIN', 'DONOR_SPONSOR'].includes(membership.role)
    
    if (!canApprove) {
      return NextResponse.json({ error: 'Insufficient permissions to approve expenses' }, { status: 403 })
    }

    // Parse expense ID to get budget ID and timestamp
    const [budgetId, timestamp] = params.expenseId.split('_')
    
    if (!budgetId || !timestamp) {
      return NextResponse.json({ error: 'Invalid expense ID' }, { status: 400 })
    }

    // Get the project budget
    const projectBudget = await db.projectBudget.findFirst({
      where: {
        id: budgetId,
        project: { organizationId: membership.organizationId },
      },
    })

    if (!projectBudget) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    // Update expense in metadata
    const currentMetadata = projectBudget.metadata as any || {}
    const currentExpenses = currentMetadata.expenses || []
    
    const expenseIndex = currentExpenses.findIndex((expense: any) => 
      expense.reportedAt === timestamp
    )
    
    if (expenseIndex === -1) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }

    const expense = currentExpenses[expenseIndex]
    
    if (expense.status !== 'PENDING') {
      return NextResponse.json({ error: 'Expense has already been processed' }, { status: 400 })
    }

    // Update expense status
    currentExpenses[expenseIndex] = {
      ...expense,
      status: 'APPROVED',
      approvedBy: session.user.id,
      approvedAt: new Date().toISOString(),
    }

    // Update spent amount
    const newSpentAmount = Number(projectBudget.spentAmount) + Number(expense.amount)

    // Update database
    await db.projectBudget.update({
      where: { id: budgetId },
      data: {
        spentAmount: newSpentAmount,
        metadata: {
          ...currentMetadata,
          expenses: currentExpenses,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Expense approved successfully',
    })

  } catch (error) {
    console.error('Expense approval error:', error)
    return NextResponse.json(
      { error: 'Failed to approve expense' },
      { status: 500 }
    )
  }
}
