import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const updateBudgetSchema = z.object({
  allocatedAmount: z.number().positive(),
  description: z.string().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: { orgSlug: string; budgetId: string } }
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

    // Check budget editing permissions
    const canEdit = ['ORG_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER'].includes(membership.role)
    
    if (!canEdit) {
      return NextResponse.json({ error: 'Insufficient permissions to edit budgets' }, { status: 403 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateBudgetSchema.parse(body)

    // Get the budget and verify it belongs to the organization
    const budget = await db.projectBudget.findFirst({
      where: {
        id: params.budgetId,
        project: { organizationId: membership.organizationId },
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

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }

    // Validate that new allocated amount is not less than spent amount
    if (validatedData.allocatedAmount < Number(budget.spentAmount)) {
      return NextResponse.json({ 
        error: `Allocated amount cannot be less than already spent amount ($${budget.spentAmount})` 
      }, { status: 400 })
    }

    // Update budget metadata
    const currentMetadata = budget.metadata as any || {}
    const updatedMetadata = {
      ...currentMetadata,
      description: validatedData.description || currentMetadata.description || '',
      lastModifiedBy: session.user.id,
      lastModifiedAt: new Date().toISOString(),
    }

    // Update the budget
    const updatedBudget = await db.projectBudget.update({
      where: { id: params.budgetId },
      data: {
        allocatedAmount: validatedData.allocatedAmount,
        metadata: updatedMetadata,
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
      message: 'Budget updated successfully',
      budget: {
        id: updatedBudget.id,
        category: updatedBudget.category,
        allocatedAmount: updatedBudget.allocatedAmount,
        spentAmount: updatedBudget.spentAmount,
        projectName: updatedBudget.project.name,
      },
    })

  } catch (error) {
    console.error('Budget update error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid budget data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update budget' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { orgSlug: string; budgetId: string } }
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

    // Check deletion permissions (only admins can delete budgets)
    const canDelete = ['ORG_ADMIN', 'SUPER_ADMIN'].includes(membership.role)
    
    if (!canDelete) {
      return NextResponse.json({ error: 'Insufficient permissions to delete budgets' }, { status: 403 })
    }

    // Get the budget and verify it belongs to the organization
    const budget = await db.projectBudget.findFirst({
      where: {
        id: params.budgetId,
        project: { organizationId: membership.organizationId },
      },
    })

    if (!budget) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }

    // Check if budget has been used (has spent amount > 0)
    if (Number(budget.spentAmount) > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete budget category with recorded expenses' 
      }, { status: 400 })
    }

    // Delete the budget
    await db.projectBudget.delete({
      where: { id: params.budgetId },
    })

    return NextResponse.json({
      success: true,
      message: 'Budget category deleted successfully',
    })

  } catch (error) {
    console.error('Budget deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 }
    )
  }
}
