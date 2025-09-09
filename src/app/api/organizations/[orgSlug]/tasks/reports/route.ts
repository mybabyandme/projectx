import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const assigneeId = searchParams.get('assigneeId')

    // Build where clause
    const whereClause: any = {
      project: {
        organizationId: membership.organizationId,
      },
    }

    if (projectId) {
      whereClause.projectId = projectId
    }

    if (assigneeId) {
      whereClause.assigneeId = assigneeId
    }

    if (startDate || endDate) {
      whereClause.createdAt = {}
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate)
      }
    }

    // Get all tasks for analysis
    const tasks = await db.task.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        assignee: {
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
      },
    })

    // Calculate analytics
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(task => task.status === 'DONE').length
    const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS').length
    const blockedTasks = tasks.filter(task => task.status === 'BLOCKED').length
    const todoTasks = tasks.filter(task => task.status === 'TODO').length

    // Calculate overdue tasks
    const now = new Date()
    const overdueTasks = tasks.filter(task => 
      task.dueDate && 
      new Date(task.dueDate) < now && 
      task.status !== 'DONE'
    ).length

    // Priority breakdown
    const criticalTasks = tasks.filter(task => task.priority === 'CRITICAL').length
    const highTasks = tasks.filter(task => task.priority === 'HIGH').length
    const mediumTasks = tasks.filter(task => task.priority === 'MEDIUM').length
    const lowTasks = tasks.filter(task => task.priority === 'LOW').length

    // Project breakdown
    const projectStats = tasks.reduce((acc: any, task) => {
      const projectId = task.projectId
      const projectName = task.project?.name || 'Unknown Project'
      
      if (!acc[projectId]) {
        acc[projectId] = {
          id: projectId,
          name: projectName,
          total: 0,
          completed: 0,
          inProgress: 0,
          blocked: 0,
          todo: 0,
        }
      }
      
      acc[projectId].total++
      
      switch (task.status) {
        case 'DONE':
          acc[projectId].completed++
          break
        case 'IN_PROGRESS':
          acc[projectId].inProgress++
          break
        case 'BLOCKED':
          acc[projectId].blocked++
          break
        case 'TODO':
          acc[projectId].todo++
          break
      }
      
      return acc
    }, {})

    // Assignee performance
    const assigneeStats = tasks.reduce((acc: any, task) => {
      if (!task.assigneeId || !task.assignee) return acc
      
      const assigneeId = task.assigneeId
      const assigneeName = task.assignee.name || task.assignee.email || 'Unknown'
      
      if (!acc[assigneeId]) {
        acc[assigneeId] = {
          id: assigneeId,
          name: assigneeName,
          email: task.assignee.email,
          total: 0,
          completed: 0,
          inProgress: 0,
          blocked: 0,
          todo: 0,
          estimatedHours: 0,
          actualHours: 0,
        }
      }
      
      acc[assigneeId].total++
      acc[assigneeId].estimatedHours += task.estimatedHours || 0
      acc[assigneeId].actualHours += task.actualHours || 0
      
      switch (task.status) {
        case 'DONE':
          acc[assigneeId].completed++
          break
        case 'IN_PROGRESS':
          acc[assigneeId].inProgress++
          break
        case 'BLOCKED':
          acc[assigneeId].blocked++
          break
        case 'TODO':
          acc[assigneeId].todo++
          break
      }
      
      return acc
    }, {})

    // Time-based analysis (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentTasks = tasks.filter(task => 
      new Date(task.createdAt) >= thirtyDaysAgo
    )

    const completedRecentTasks = tasks.filter(task => 
      task.updatedAt && 
      new Date(task.updatedAt) >= thirtyDaysAgo && 
      task.status === 'DONE'
    )

    // Calculate completion rate trends (by week)
    const weeklyStats = []
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7)
      const weekEnd = new Date()
      weekEnd.setDate(weekEnd.getDate() - i * 7)

      const weekTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt)
        return taskDate >= weekStart && taskDate < weekEnd
      })

      const weekCompleted = tasks.filter(task => {
        const taskDate = task.updatedAt ? new Date(task.updatedAt) : new Date(task.createdAt)
        return taskDate >= weekStart && taskDate < weekEnd && task.status === 'DONE'
      })

      weeklyStats.unshift({
        week: `Week ${4 - i}`,
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        created: weekTasks.length,
        completed: weekCompleted.length,
        completionRate: weekTasks.length > 0 ? Math.round((weekCompleted.length / weekTasks.length) * 100) : 0,
      })
    }

    return NextResponse.json({
      summary: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        blockedTasks,
        todoTasks,
        overdueTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      priorities: {
        critical: criticalTasks,
        high: highTasks,
        medium: mediumTasks,
        low: lowTasks,
      },
      projects: Object.values(projectStats),
      assignees: Object.values(assigneeStats),
      trends: {
        recentTasksCreated: recentTasks.length,
        recentTasksCompleted: completedRecentTasks.length,
        weeklyStats,
      },
      timeframe: {
        startDate: startDate || null,
        endDate: endDate || null,
        projectId: projectId || null,
        assigneeId: assigneeId || null,
      },
    })
  } catch (error) {
    console.error('Error generating task reports:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
