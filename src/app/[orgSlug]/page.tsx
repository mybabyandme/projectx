import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  Plus, FolderKanban, Users, TrendingUp, Calendar, 
  Target, AlertTriangle, DollarSign, BarChart3, 
  ClipboardList, FileText, Clock, CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { UserRole } from '@prisma/client'
import QuickActions from '@/components/dashboard/quick-actions'
import RecentActivity from '@/components/dashboard/recent-activity'

interface DashboardProps {
  params: { orgSlug: string }
}

export default async function OrganizationDashboard({ params }: DashboardProps) {
  const session = await auth()
  
  if (!session?.user?.id) {
    notFound()
  }

  // Get comprehensive organization data with real-time metrics
  const membership = await db.organizationMember.findFirst({
    where: {
      userId: session.user.id,
      organization: { slug: params.orgSlug },
    },
    include: {
      organization: {
        include: {
          projects: {
            orderBy: { updatedAt: 'desc' },
            include: {
              tasks: {
                select: {
                  id: true,
                  status: true,
                  priority: true,
                  dueDate: true,
                  assigneeId: true,
                  actualHours: true,
                  estimatedHours: true,
                },
              },
              budgets: {
                select: {
                  allocatedAmount: true,
                  spentAmount: true,
                },
              },
              _count: {
                select: {
                  tasks: true,
                  phases: true,
                  budgets: true,
                },
              },
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
      },
    },
  })

  if (!membership) {
    notFound()
  }

  const { organization } = membership
  const userRole = membership.role
  
  // Calculate comprehensive real-time metrics
  const projectStats = {
    total: organization.projects.length,
    active: organization.projects.filter(p => p.status === 'ACTIVE').length,
    completed: organization.projects.filter(p => p.status === 'COMPLETED').length,
    planning: organization.projects.filter(p => p.status === 'PLANNING').length,
    onHold: organization.projects.filter(p => p.status === 'ON_HOLD').length,
  }

  // Task analytics
  const allTasks = organization.projects.flatMap(p => p.tasks)
  const userTasks = allTasks.filter(t => t.assigneeId === session.user.id)
  const overdueUserTasks = userTasks.filter(t => 
    t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE'
  )
  
  const taskStats = {
    total: allTasks.length,
    completed: allTasks.filter(t => t.status === 'DONE').length,
    inProgress: allTasks.filter(t => t.status === 'IN_PROGRESS').length,
    overdue: allTasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE'
    ).length,
    userTotal: userTasks.length,
    userCompleted: userTasks.filter(t => t.status === 'DONE').length,
    userOverdue: overdueUserTasks.length,
  }

  // Financial metrics (for PM/Donor roles)
  const budgetStats = organization.projects.reduce((acc, project) => {
    const allocated = project.budgets.reduce((sum, b) => sum + Number(b.allocatedAmount), 0)
    const spent = project.budgets.reduce((sum, b) => sum + Number(b.spentAmount), 0)
    return {
      totalAllocated: acc.totalAllocated + allocated,
      totalSpent: acc.totalSpent + spent,
    }
  }, { totalAllocated: 0, totalSpent: 0 })

  // Recent activity data
  const recentProjects = organization.projects.slice(0, 4)
  
  // Get projects for quick actions
  const projectsForQuickActions = organization.projects
    .filter(p => p.status === 'ACTIVE' || p.status === 'PLANNING')
    .map(p => ({ id: p.id, name: p.name }))
    
  const upcomingDeadlines = allTasks
    .filter(t => t.dueDate && t.status !== 'DONE')
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5)

  // Role-based quick actions
  const getQuickActions = (role: UserRole) => {
    const baseActions = [
      {
        title: 'Add Task',
        description: 'Create a new task for any project',
        href: `/${params.orgSlug}/tasks/new`,
        icon: Plus,
        color: 'blue',
      },
    ]

    const roleSpecificActions = {
      [UserRole.PROJECT_MANAGER]: [
        {
          title: 'Create Project',
          description: 'Start a new project with guided setup',
          href: `/${params.orgSlug}/projects/new`,
          icon: FolderKanban,
          color: 'green',
        },
        {
          title: 'Progress Report',
          description: 'Submit project progress update',
          href: `/${params.orgSlug}/reports/new`,
          icon: FileText,
          color: 'purple',
        },
        {
          title: 'Team Overview',
          description: 'Manage team members and roles',
          href: `/${params.orgSlug}/team`,
          icon: Users,
          color: 'orange',
        },
      ],
      [UserRole.DONOR_SPONSOR]: [
        {
          title: 'Financial Reports',
          description: 'Review budget and expenses',
          href: `/${params.orgSlug}/finance/reports`,
          icon: DollarSign,
          color: 'green',
        },
        {
          title: 'Project Analytics',
          description: 'View performance metrics',
          href: `/${params.orgSlug}/analytics`,
          icon: BarChart3,
          color: 'purple',
        },
      ],
      [UserRole.TEAM_MEMBER]: [
        {
          title: 'My Tasks',
          description: 'View and update your assigned tasks',
          href: `/${params.orgSlug}/tasks`,
          icon: ClipboardList,
          color: 'green',
        },
        {
          title: 'Time Tracking',
          description: 'Log hours worked on tasks',
          href: `/${params.orgSlug}/tasks?view=timesheet`,
          icon: Clock,
          color: 'orange',
        },
      ],
      [UserRole.MONITOR]: [
        {
          title: 'Progress Report',
          description: 'Create monitoring report',
          href: `/${params.orgSlug}/reports/new`,
          icon: FileText,
          color: 'purple',
        },
        {
          title: 'Project Analytics',
          description: 'View project performance',
          href: `/${params.orgSlug}/analytics`,
          icon: BarChart3,
          color: 'green',
        },
      ],
      [UserRole.ORG_ADMIN]: [
        {
          title: 'Create Project',
          description: 'Start a new organizational project',
          href: `/${params.orgSlug}/projects/new`,
          icon: FolderKanban,
          color: 'green',
        },
        {
          title: 'Manage Team',
          description: 'Add members and assign roles',
          href: `/${params.orgSlug}/team`,
          icon: Users,
          color: 'purple',
        },
        {
          title: 'Organization Settings',
          description: 'Configure organization preferences',
          href: `/${params.orgSlug}/settings`,
          icon: BarChart3,
          color: 'orange',
        },
      ],
    }

    return [...baseActions, ...(roleSpecificActions[role] || [])]
  }

  const quickActions = getQuickActions(userRole)

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Welcome back to {organization.name}
            </h1>
            <p className="mt-2 text-gray-600">
              Your role: <span className="font-medium text-gray-900">
                {membership.role.replace('_', ' ')}
              </span>
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link href={quickActions[0].href}>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                {quickActions[0].title}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Key Metrics - Role Based */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Always show projects */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Projects</p>
                <p className="text-3xl font-bold text-gray-900">{projectStats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <FolderKanban className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {projectStats.active} active • {projectStats.completed} completed
            </div>
          </CardContent>
        </Card>

        {/* Task metrics - personalized for team members */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {userRole === UserRole.TEAM_MEMBER ? 'My Tasks' : 'All Tasks'}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {userRole === UserRole.TEAM_MEMBER ? taskStats.userTotal : taskStats.total}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {userRole === UserRole.TEAM_MEMBER 
                ? `${taskStats.userCompleted} completed • ${taskStats.userOverdue} overdue`
                : `${taskStats.completed} completed • ${taskStats.overdue} overdue`
              }
            </div>
          </CardContent>
        </Card>

        {/* Team metrics */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Size</p>
                <p className="text-3xl font-bold text-gray-900">{organization.members.length}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Active organization members
            </div>
          </CardContent>
        </Card>

        {/* Financial or Performance metric based on role */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                {[UserRole.DONOR_SPONSOR, UserRole.ORG_ADMIN, UserRole.PROJECT_MANAGER].includes(userRole) ? (
                  <>
                    <p className="text-sm font-medium text-gray-600">Budget Utilization</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {budgetStats.totalAllocated > 0 
                        ? Math.round((budgetStats.totalSpent / budgetStats.totalAllocated) * 100)
                        : 0}%
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {taskStats.total > 0 ? Math.round((taskStats.completed / taskStats.total) * 100) : 0}%
                    </p>
                  </>
                )}
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                {[UserRole.DONOR_SPONSOR, UserRole.ORG_ADMIN, UserRole.PROJECT_MANAGER].includes(userRole) ? (
                  <DollarSign className="h-6 w-6 text-orange-600" />
                ) : (
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                )}
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {[UserRole.DONOR_SPONSOR, UserRole.ORG_ADMIN, UserRole.PROJECT_MANAGER].includes(userRole)
                ? `$${budgetStats.totalSpent.toLocaleString()} of $${budgetStats.totalAllocated.toLocaleString()}`
                : 'Task completion across projects'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions - 2/3 width */}
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
              <CardDescription>
                Common tasks for your role
              </CardDescription>
            </CardHeader>
            <CardContent>
              <QuickActions 
                orgSlug={params.orgSlug} 
                userRole={userRole}
                projects={projectsForQuickActions}
              />
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Deadlines - 1/3 width */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Upcoming Deadlines</CardTitle>
            <CardDescription>
              Tasks requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length > 0 ? (
              <div className="space-y-3">
                {upcomingDeadlines.map((task, index) => {
                  const daysUntilDue = Math.ceil(
                    (new Date(task.dueDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  )
                  const isOverdue = daysUntilDue < 0
                  const isUrgent = daysUntilDue <= 3 && daysUntilDue >= 0
                  
                  return (
                    <div 
                      key={task.id} 
                      className={`p-3 rounded-lg border-l-4 ${
                        isOverdue 
                          ? 'border-red-500 bg-red-50' 
                          : isUrgent 
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-blue-500 bg-blue-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          isOverdue 
                            ? 'bg-red-100 text-red-800'
                            : isUrgent
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isOverdue 
                            ? `${Math.abs(daysUntilDue)} days overdue`
                            : daysUntilDue === 0
                            ? 'Due today'
                            : `${daysUntilDue} days left`
                          }
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mt-2 line-clamp-2">
                        Task #{task.id.slice(-8)}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        Due: {formatDate(new Date(task.dueDate!))}
                      </p>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm text-gray-600">No upcoming deadlines</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Recent Projects</CardTitle>
              <CardDescription>
                Latest project activity in your organization
              </CardDescription>
            </div>
            <Link href={`/${params.orgSlug}/projects`}>
              <Button variant="outline" size="sm">
                View All Projects
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentProjects.map((project) => {
                const taskProgress = project._count.tasks > 0 
                  ? Math.round((project.tasks.filter(t => t.status === 'DONE').length / project._count.tasks) * 100)
                  : 0

                const statusColors = {
                  ACTIVE: 'bg-green-100 text-green-800 border-green-200',
                  PLANNING: 'bg-blue-100 text-blue-800 border-blue-200',
                  ON_HOLD: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                  COMPLETED: 'bg-purple-100 text-purple-800 border-purple-200',
                  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
                  DRAFT: 'bg-gray-100 text-gray-800 border-gray-200',
                }

                return (
                  <Link 
                    key={project.id} 
                    href={`/${params.orgSlug}/projects/${project.id}`}
                    className="block p-4 rounded-lg border-2 border-gray-100 hover:border-gray-200 transition-all hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">
                        {project.name}
                      </h3>
                      <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${
                        statusColors[project.status as keyof typeof statusColors]
                      }`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    {project.description && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {project.description}
                      </p>
                    )}
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{project._count.tasks} tasks</span>
                        <span>{taskProgress}% complete</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${taskProgress}%` }}
                        />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FolderKanban className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-4">Create your first project to get started</p>
              <Link href={`/${params.orgSlug}/projects/new`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Project
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}      