'use client'

import { useState, useEffect } from 'react'
import { 
  TrendingUp, Plus, Play, Pause, SkipForward, Calendar,
  Target, Users, BarChart3, Clock, CheckCircle, AlertTriangle,
  FileText, Filter, ChevronDown, Edit, Trash2,
  MoreVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'

interface SprintManagementProps {
  project: any
  organizationSlug: string
  userRole: string
  canEdit: boolean
  userId: string
}

interface Sprint {
  id: string
  name: string
  goal: string
  status: 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  startDate: string
  endDate: string
  capacity: number
  velocity?: number
  tasks: any[]
  retrospective?: {
    whatWentWell: string[]
    whatCouldImprove: string[]
    actionItems: string[]
  }
}

export default function SprintManagement({
  project,
  organizationSlug,
  userRole,
  canEdit,
  userId
}: SprintManagementProps) {
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateSprint, setShowCreateSprint] = useState(false)
  const [selectedView, setSelectedView] = useState<'board' | 'timeline' | 'velocity'>('board')

  // Mock data for demonstration - replace with actual API calls
  useEffect(() => {
    const mockSprints: Sprint[] = [
      {
        id: '1',
        name: 'Sprint 1 - Foundation',
        goal: 'Establish project foundation and core architecture',
        status: 'COMPLETED',
        startDate: '2024-01-01',
        endDate: '2024-01-14',
        capacity: 80,
        velocity: 23,
        tasks: project.tasks?.slice(0, 8) || [],
        retrospective: {
          whatWentWell: ['Good team collaboration', 'Clear requirements', 'Efficient daily standups'],
          whatCouldImprove: ['Better estimation', 'More testing time', 'Documentation'],
          actionItems: ['Implement story point poker', 'Add automated testing', 'Create documentation templates']
        }
      },
      {
        id: '2', 
        name: 'Sprint 2 - Core Features',
        goal: 'Implement core user-facing features',
        status: 'ACTIVE',
        startDate: '2024-01-15',
        endDate: '2024-01-28',
        capacity: 85,
        tasks: project.tasks?.slice(8, 16) || []
      },
      {
        id: '3',
        name: 'Sprint 3 - Integration',
        goal: 'Integrate systems and prepare for testing',
        status: 'PLANNING',
        startDate: '2024-01-29',
        endDate: '2024-02-11',
        capacity: 90,
        tasks: []
      }
    ]

    setSprints(mockSprints)
    setActiveSprint(mockSprints.find(s => s.status === 'ACTIVE') || null)
    setIsLoading(false)
  }, [project.tasks])

  const calculateSprintMetrics = (sprint: Sprint) => {
    const totalTasks = sprint.tasks.length
    const completedTasks = sprint.tasks.filter(t => t.status === 'DONE').length
    const inProgressTasks = sprint.tasks.filter(t => t.status === 'IN_PROGRESS').length
    const todoTasks = sprint.tasks.filter(t => t.status === 'TODO').length
    
    const totalStoryPoints = sprint.tasks.reduce((sum, task) => {
      // Assuming story points are stored in metadata
      return sum + (task.metadata?.storyPoints || 1)
    }, 0)
    
    const completedStoryPoints = sprint.tasks
      .filter(t => t.status === 'DONE')
      .reduce((sum, task) => sum + (task.metadata?.storyPoints || 1), 0)

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    const velocityRate = totalStoryPoints > 0 ? (completedStoryPoints / totalStoryPoints) * 100 : 0

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      totalStoryPoints,
      completedStoryPoints,
      completionRate,
      velocityRate
    }
  }

  const getSprintHealthColor = (sprint: Sprint) => {
    const metrics = calculateSprintMetrics(sprint)
    const daysRemaining = sprint.endDate ? Math.ceil((new Date(sprint.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0
    
    if (sprint.status === 'COMPLETED') return 'text-green-600 bg-green-100'
    if (sprint.status === 'PLANNING') return 'text-blue-600 bg-blue-100'
    
    // For active sprints, determine health based on progress vs time remaining
    const timeProgress = sprint.startDate && sprint.endDate ? 
      ((new Date().getTime() - new Date(sprint.startDate).getTime()) / 
       (new Date(sprint.endDate).getTime() - new Date(sprint.startDate).getTime())) * 100 : 0
    
    if (metrics.completionRate < timeProgress - 20) return 'text-red-600 bg-red-100'
    if (metrics.completionRate < timeProgress - 10) return 'text-yellow-600 bg-yellow-100'
    return 'text-green-600 bg-green-100'
  }

  const startSprint = async (sprintId: string) => {
    try {
      // API call to start sprint
      toast({
        title: "Sprint Started",
        description: "Sprint has been activated successfully",
      })
      
      setSprints(prev => prev.map(s => 
        s.id === sprintId ? { ...s, status: 'ACTIVE' as const } : s
      ))
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start sprint",
        variant: "destructive",
      })
    }
  }

  const completeSprint = async (sprintId: string) => {
    try {
      // API call to complete sprint
      toast({
        title: "Sprint Completed",
        description: "Sprint has been marked as completed",
      })
      
      setSprints(prev => prev.map(s => 
        s.id === sprintId ? { ...s, status: 'COMPLETED' as const } : s
      ))
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to complete sprint",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Sprint Management</h2>
          <p className="mt-1 text-gray-600">
            Plan, track, and optimize your agile sprints for {project.name}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            {(['board', 'timeline', 'velocity'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setSelectedView(view)}
                className={`px-3 py-2 text-sm font-medium capitalize ${
                  selectedView === view
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {view}
              </button>
            ))}
          </div>
          {canEdit && (
            <Button onClick={() => setShowCreateSprint(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Sprint
            </Button>
          )}
        </div>
      </div>

      {/* Active Sprint Banner */}
      {activeSprint && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-blue-900">{activeSprint.name}</h3>
                  <Badge className="bg-blue-100 text-blue-800">ACTIVE</Badge>
                </div>
                <p className="text-blue-800 mb-3">{activeSprint.goal}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {(() => {
                    const metrics = calculateSprintMetrics(activeSprint)
                    return (
                      <>
                        <div>
                          <p className="text-sm text-blue-700">Progress</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={metrics.completionRate} className="flex-1" />
                            <span className="text-sm font-medium text-blue-900">
                              {metrics.completionRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700">Tasks</p>
                          <p className="text-lg font-semibold text-blue-900">
                            {metrics.completedTasks}/{metrics.totalTasks}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700">Story Points</p>
                          <p className="text-lg font-semibold text-blue-900">
                            {metrics.completedStoryPoints}/{metrics.totalStoryPoints}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-blue-700">Days Remaining</p>
                          <p className="text-lg font-semibold text-blue-900">
                            {activeSprint.endDate ? 
                              Math.max(0, Math.ceil((new Date(activeSprint.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0
                            }
                          </p>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>
              {canEdit && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => completeSprint(activeSprint.id)}
                  >
                    <SkipForward className="h-4 w-4 mr-1" />
                    Complete Sprint
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sprint Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {sprints.map((sprint) => {
          const metrics = calculateSprintMetrics(sprint)
          const healthColor = getSprintHealthColor(sprint)
          
          return (
            <Card key={sprint.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base font-semibold">{sprint.name}</CardTitle>
                    <CardDescription className="mt-1">{sprint.goal}</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={healthColor}>
                      {sprint.status}
                    </Badge>
                    {canEdit && (
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Sprint Dates */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">
                      {formatDate(new Date(sprint.startDate))} - {formatDate(new Date(sprint.endDate))}
                    </span>
                  </div>

                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Task Progress:</span>
                      <span className="font-medium">{metrics.completedTasks}/{metrics.totalTasks}</span>
                    </div>
                    <Progress value={metrics.completionRate} />
                  </div>

                  {/* Story Points */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Story Points:</span>
                    <span className="font-medium">{metrics.completedStoryPoints}/{metrics.totalStoryPoints}</span>
                  </div>

                  {/* Velocity (for completed sprints) */}
                  {sprint.velocity && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Velocity:</span>
                      <span className="font-medium text-green-600">{sprint.velocity} pts</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    {sprint.status === 'PLANNING' && canEdit && (
                      <Button
                        size="sm"
                        onClick={() => startSprint(sprint.id)}
                        className="flex-1"
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Start Sprint
                      </Button>
                    )}
                    {sprint.status === 'ACTIVE' && (
                      <Button variant="outline" size="sm" className="flex-1">
                        <Target className="h-4 w-4 mr-1" />
                        View Board
                      </Button>
                    )}
                    {sprint.status === 'COMPLETED' && (
                      <Button variant="outline" size="sm" className="flex-1">
                        <FileText className="h-4 w-4 mr-1" />
                        Retrospective
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Sprint Details Based on Selected View */}
      {selectedView === 'velocity' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sprint Velocity Chart</CardTitle>
            <CardDescription>
              Track team velocity and capacity over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Velocity Chart Placeholder */}
              <div className="h-64 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Velocity chart visualization</p>
                  <p className="text-sm text-gray-400">Coming soon with charting library integration</p>
                </div>
              </div>

              {/* Velocity Metrics Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2">Sprint</th>
                      <th className="text-center py-2">Planned</th>
                      <th className="text-center py-2">Completed</th>
                      <th className="text-center py-2">Velocity</th>
                      <th className="text-center py-2">Capacity</th>
                      <th className="text-center py-2">Efficiency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sprints.filter(s => s.status === 'COMPLETED').map((sprint) => {
                      const metrics = calculateSprintMetrics(sprint)
                      const efficiency = sprint.capacity > 0 ? (metrics.completedStoryPoints / sprint.capacity) * 100 : 0
                      
                      return (
                        <tr key={sprint.id} className="border-b border-gray-100">
                          <td className="py-3 font-medium">{sprint.name}</td>
                          <td className="py-3 text-center">{metrics.totalStoryPoints}</td>
                          <td className="py-3 text-center">{metrics.completedStoryPoints}</td>
                          <td className="py-3 text-center font-medium text-green-600">
                            {sprint.velocity || metrics.completedStoryPoints}
                          </td>
                          <td className="py-3 text-center">{sprint.capacity}</td>
                          <td className="py-3 text-center">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              efficiency >= 90 ? 'bg-green-100 text-green-800' :
                              efficiency >= 70 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {efficiency.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Burndown Chart for Active Sprint */}
      {selectedView === 'timeline' && activeSprint && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sprint Burndown Chart</CardTitle>
            <CardDescription>
              Track remaining work throughout the sprint
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">Burndown chart visualization</p>
                <p className="text-sm text-gray-400">Shows ideal vs actual progress over sprint duration</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sprint Board View */}
      {selectedView === 'board' && activeSprint && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sprint Board</CardTitle>
            <CardDescription>
              Kanban-style view of current sprint tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as const).map((status) => {
                const tasksInStatus = activeSprint.tasks.filter(task => task.status === status)
                
                return (
                  <div key={status} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        {status.replace('_', ' ')}
                      </h4>
                      <Badge variant="secondary">
                        {tasksInStatus.length}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {tasksInStatus.map((task) => (
                        <div
                          key={task.id}
                          className="p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow cursor-pointer"
                        >
                          <h5 className="font-medium text-sm text-gray-900 mb-1">
                            {task.title}
                          </h5>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>#{task.id.slice(-8)}</span>
                            {task.metadata?.storyPoints && (
                              <Badge variant="outline" className="text-xs">
                                {task.metadata.storyPoints} pts
                              </Badge>
                            )}
                          </div>
                          {task.assignee && (
                            <div className="flex items-center mt-2 text-xs text-gray-600">
                              <User className="h-3 w-3 mr-1" />
                              {task.assignee.name}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Sprint Modal would go here */}
      {showCreateSprint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New Sprint</h3>
            <p className="text-gray-600 mb-4">Sprint creation form coming soon...</p>
            <div className="flex gap-2">
              <Button onClick={() => setShowCreateSprint(false)} variant="outline">
                Cancel
              </Button>
              <Button onClick={() => setShowCreateSprint(false)}>
                Create Sprint
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}