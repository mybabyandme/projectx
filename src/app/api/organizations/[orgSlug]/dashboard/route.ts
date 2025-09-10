import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

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
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Get real-time dashboard metrics
    const [
      projectStats,
      taskStats,
      memberCount,
      budgetStats,
      recentActivity,
      upcomingDeadlines,
    ] = await Promise.all([
      // Project statistics
      db.project.groupBy({
        by: ['status'],
        where: { organizationId: membership.organization.id },
        _count: { id: true },
      }),

      // Task statistics for the user and overall
      db.task.findMany({
        where: {
          project: { organizationId: membership.organization.id },
        },
        select: {
          id: true,
          status: true,
          priority: true,
          dueDate: true,
          assigneeId: true,
          createdAt: true,
        },
      }),

      // Member count
      db.organizationMember.count({
        where: { organizationId: membership.organization.id },
      }),

      // Budget statistics (for financial roles)
      db.projectBudget.aggregate({
        where: {
          project: { organizationId: membership.organization.id },
        },
        _sum: {
          allocatedAmount: true,
          spentAmount: true,
        },
      }),

      // Recent activity - latest projects
      db.project.findMany({
        where: { organizationId: membership.organization.id },
        orderBy: { updatedAt: 'desc' },
        take: 6,
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          updatedAt: true,
          _count: {
            select: {
              tasks: true,
            },
          },
        },
      }),

      // Upcoming deadlines
      db.task.findMany({
        where: {
          project: { organizationId: membership.organization.id },
          dueDate: { gte: new Date() },
          status: { not: 'DONE' },
        },
        orderBy: { dueDate: 'asc' },
        take: 10,
        select: {
          id: true,
          title: true,
          dueDate: true,
          priority: true,
          status: true,
          assigneeId: true,
          project: {
            select: {
              name: true,
            },
          },
        },
      }),
    ])

    // Process project statistics
    const projectMetrics = projectStats.reduce(
      (acc, stat) => ({
        ...acc,
        [stat.status.toLowerCase()]: stat._count.id,
      }),
      { total: 0, active: 0, completed: 0, planning: 0, onHold: 0, cancelled: 0, draft: 0 }
    )
    projectMetrics.total = projectStats.reduce((sum, stat) => sum + stat._count.id, 0)

    // Process task statistics
    const now = new Date()
    const userTasks = taskStats.filter(t => t.assigneeId === session.user.id)
    const overdueTasks = taskStats.filter(t => 
      t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE'
    )
    const userOverdueTasks = userTasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE'
    )

    const taskMetrics = {
      total: taskStats.length,
      completed: taskStats.filter(t => t.status === 'DONE').length,
      inProgress: taskStats.filter(t => t.status === 'IN_PROGRESS').length,
      overdue: overdueTasks.length,
      userTotal: userTasks.length,
      userCompleted: userTasks.filter(t => t.status === 'DONE').length,
      userOverdue: userOverdueTasks.length,
      userInProgress: userTasks.filter(t => t.status === 'IN_PROGRESS').length,
    }

    // Process budget statistics
    const budgetMetrics = {
      totalAllocated: Number(budgetStats._sum.allocatedAmount || 0),
      totalSpent: Number(budgetStats._sum.spentAmount || 0),
      utilizationRate: budgetStats._sum.allocatedAmount 
        ? Number(budgetStats._sum.spentAmount || 0) / Number(budgetStats._sum.allocatedAmount) * 100
        : 0,
    }

    // Process upcoming deadlines with time calculations
    const processedDeadlines = upcomingDeadlines.map(task => ({
      ...task,
      daysUntilDue: Math.ceil((new Date(task.dueDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      isUserTask: task.assigneeId === session.user.id,
    }))

    const dashboardData = {
      organization: membership.organization,
      userRole: membership.role,
      metrics: {
        projects: projectMetrics,
        tasks: taskMetrics,
        budget: budgetMetrics,
        members: memberCount,
      },
      recentActivity,
      upcomingDeadlines: processedDeadlines,
      lastUpdated: new Date().toISOString(),
    }

    return NextResponse.json(dashboardData)
    
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}

// Real-time activity endpoint for live updates
export async function POST(
  request: Request,
  { params }: { params: { orgSlug: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, data } = await request.json()

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

    // Handle different activity types
    switch (action) {
      case 'mark_task_complete': {
        const { taskId } = data
        
        // Update task status
        await db.task.update({
          where: { 
            id: taskId,
            project: { organizationId: membership.organizationId },
          },
          data: { 
            status: 'DONE',
            actualHours: data.actualHours || undefined,
          },
        })

        return NextResponse.json({ success: true, message: 'Task marked as complete' })
      }

      case 'quick_add_task': {
        const { title, projectId, priority = 'MEDIUM' } = data
        
        // Create new task
        const task = await db.task.create({
          data: {
            title,
            projectId,
            creatorId: session.user.id,
            assigneeId: session.user.id,
            priority,
            status: 'TODO',
          },
          include: {
            project: {
              select: { name: true },
            },
          },
        })

        return NextResponse.json({ 
          success: true, 
          message: 'Task created successfully',
          task: {
            id: task.id,
            title: task.title,
            projectName: task.project.name,
          },
        })
      }

      case 'log_expense': {
        const { projectId, amount, category, description } = data
        
        // Update project budget spent amount
        await db.projectBudget.upsert({
          where: {
            projectId_category: {
              projectId,
              category: category || 'General',
            },
          },
          create: {
            projectId,
            category: category || 'General',
            allocatedAmount: 0,
            spentAmount: amount,
            metadata: {
              expenses: [{
                description,
                amount,
                reportedBy: session.user.id,
                reportedAt: new Date().toISOString(),
              }],
            },
          },
          update: {
            spentAmount: {
              increment: amount,
            },
            metadata: {
              expenses: {
                push: {
                  description,
                  amount,
                  reportedBy: session.user.id,
                  reportedAt: new Date().toISOString(),
                },
              },
            },
          },
        })

        return NextResponse.json({ 
          success: true, 
          message: 'Expense logged successfully',
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
    
  } catch (error) {
    console.error('Dashboard action error:', error)
    return NextResponse.json(
      { error: 'Failed to process action' },
      { status: 500 }
    )
  }
}
