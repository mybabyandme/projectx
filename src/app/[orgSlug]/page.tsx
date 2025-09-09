import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { 
  Plus, FolderKanban, Users, TrendingUp, Calendar, 
  Target, AlertTriangle, DollarSign, BarChart3 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

export default async function OrganizationDashboard({
  params,
}: {
  params: { orgSlug: string }
}) {
  const session = await auth()
  
  if (!session?.user?.id) {
    notFound()
  }

  // Get organization and user membership with extended project data
  const membership = await db.organizationMember.findFirst({
    where: {
      userId: session.user.id,
      organization: {
        slug: params.orgSlug,
      },
    },
    include: {
      organization: {
        include: {
          projects: {
            orderBy: {
              updatedAt: 'desc',
            },
            include: {
              tasks: {
                select: {
                  id: true,
                  status: true,
                },
              },
              _count: {
                select: {
                  tasks: true,
                  phases: true,
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
  
  // Calculate organization statistics
  const totalProjects = organization.projects.length
  const activeProjects = organization.projects.filter(p => p.status === 'ACTIVE').length
  const completedProjects = organization.projects.filter(p => p.status === 'COMPLETED').length
  const totalTasks = organization.projects.reduce((sum, project) => sum + project._count.tasks, 0)
  const completedTasks = organization.projects.reduce((sum, project) => 
    sum + project.tasks.filter(task => task.status === 'DONE').length, 0
  )
  const totalMembers = organization.members.length
  
  // Recent projects for display
  const recentProjects = organization.projects.slice(0, 6)
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'PLANNING': return 'bg-blue-100 text-blue-800'
      case 'ON_HOLD': return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED': return 'bg-purple-100 text-purple-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-800'
      case 'ORG_ADMIN': return 'bg-red-100 text-red-800'
      case 'PROJECT_MANAGER': return 'bg-blue-100 text-blue-800'
      case 'MONITOR': return 'bg-green-100 text-green-800'
      case 'DONOR_SPONSOR': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back to {organization.name}
          </h1>
          <p className="mt-2 text-gray-600">
            Your role: <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(membership.role)}`}>
              {membership.role.replace('_', ' ')}
            </span>
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Link href={`/${params.orgSlug}/projects/new`}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </Link>
          <Link href={`/${params.orgSlug}/team`}>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Team
            </Button>
          </Link>
        </div>
      </div>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{totalProjects}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FolderKanban className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {activeProjects} active, {completedProjects} completed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Task Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {completedTasks} of {totalTasks} tasks completed
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Team Members</p>
                <p className="text-2xl font-bold text-gray-900">{totalMembers}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Active members in organization
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0}%
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Project completion rate
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Projects</CardTitle>
              <CardDescription>
                Latest projects in your organization
              </CardDescription>
            </div>
            <Link href={`/${params.orgSlug}/projects`}>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentProjects.length > 0 ? (
            <div className="space-y-4">
              {recentProjects.map((project) => {
                const taskProgress = project._count.tasks > 0 
                  ? Math.round((project.tasks.filter(t => t.status === 'DONE').length / project._count.tasks) * 100)
                  : 0

                return (
                  <Link 
                    key={project.id} 
                    href={`/${params.orgSlug}/projects/${project.id}`}
                    className="block hover:bg-gray-50 p-4 rounded-lg transition-colors border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {project.name}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                            {project.status.replace('_', ' ')}
                          </span>
                        </div>
                        
                        {project.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                            {project.description}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Target className="h-3 w-3 mr-1" />
                            <span>{project._count.tasks} tasks</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>Updated {formatDate(project.updatedAt)}</span>
                          </div>
                          <div className="flex items-center">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            <span>{taskProgress}% complete</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center ml-4">
                        <div className="w-16 h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${taskProgress}%` }}
                          />
                        </div>
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
              <p className="text-gray-600 mb-4">Create your first project to get started with AgileTrack Pro</p>
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
      {/* Quick Actions & Team */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and workflows
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link 
              href={`/${params.orgSlug}/projects/new`}
              className="flex items-center p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5 mr-3" />
              <div>
                <div className="font-medium">Create New Project</div>
                <div className="text-sm text-gray-600">Start a new project with our guided wizard</div>
              </div>
            </Link>
            
            <Link 
              href={`/${params.orgSlug}/team`}
              className="flex items-center p-3 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            >
              <Users className="h-5 w-5 mr-3" />
              <div>
                <div className="font-medium">Invite Team Members</div>
                <div className="text-sm text-gray-600">Add new members to your organization</div>
              </div>
            </Link>
            
            <Link 
              href={`/${params.orgSlug}/projects`}
              className="flex items-center p-3 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <BarChart3 className="h-5 w-5 mr-3" />
              <div>
                <div className="font-medium">View Reports</div>
                <div className="text-sm text-gray-600">Access project analytics and insights</div>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Team Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Team Overview</CardTitle>
            <CardDescription>
              Organization members and their roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {organization.members.slice(0, 6).map((member) => (
                <div key={member.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {member.user.name?.charAt(0).toUpperCase() || member.user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {member.user.name || member.user.email}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {member.user.email}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                    {member.role.replace('_', ' ')}
                  </span>
                </div>
              ))}
              
              {organization.members.length > 6 && (
                <div className="text-center pt-2">
                  <Link href={`/${params.orgSlug}/team`}>
                    <Button variant="outline" size="sm">
                      View All {organization.members.length} Members
                    </Button>
                  </Link>
                </div>
              )}
              
              {organization.members.length === 0 && (
                <div className="text-center py-6">
                  <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">No team members yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
