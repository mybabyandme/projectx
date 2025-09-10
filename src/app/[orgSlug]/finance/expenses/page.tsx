import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import ExpenseManagement from '@/components/finance/expense-management'

export default async function ExpensesPage({
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
      organization: { slug: params.orgSlug },
    },
    include: {
      organization: {
        include: {
          projects: {
            where: {
              status: { in: ['ACTIVE', 'PLANNING'] },
            },
            select: {
              id: true,
              name: true,
              status: true,
              budgets: {
                select: {
                  id: true,
                  category: true,
                  allocatedAmount: true,
                  spentAmount: true,
                },
              },
            },
            orderBy: { name: 'asc' },
          },
        },
      },
    },
  })

  if (!membership) {
    notFound()
  }

  // Get recent expenses with project and user information
  const expenses = await db.projectBudget.findMany({
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
    take: 50, // Recent expenses
  })

  // Process expenses from metadata
  const processedExpenses = expenses.flatMap((budget) => {
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
      reportedBy: expense.reportedBy,
      reportedAt: new Date(expense.reportedAt),
      status: expense.status || 'PENDING',
      approvedBy: expense.approvedBy,
      approvedAt: expense.approvedAt ? new Date(expense.approvedAt) : null,
    }))
  }).sort((a, b) => b.reportedAt.getTime() - a.reportedAt.getTime())

  return (
    <ExpenseManagement
      organizationSlug={params.orgSlug}
      userRole={membership.role}
      userId={session.user.id}
      projects={membership.organization.projects}
      expenses={processedExpenses}
      canApprove={['ORG_ADMIN', 'SUPER_ADMIN', 'DONOR_SPONSOR'].includes(membership.role)}
    />
  )
}
