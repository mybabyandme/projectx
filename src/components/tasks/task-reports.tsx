 'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts'
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Users,
  FolderKanban,
  Calendar,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskReportsProps {
  organizationSlug: string
  projects?: Array<{ id: string; name: string }>
  assignees?: Array<{ id: string; name: string; email: string }>
}

const STATUS_COLORS = {
  completed: '#22c55e',
  inProgress: '#3b82f6',
  blocked: '#ef4444',
  todo: '#6b7280',
}

const PRIORITY_COLORS = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
}

export default function TaskReports({
  organizationSlug,
  projects = [],
  assignees = []
}: TaskReportsProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [reports, setReports] = useState<any>(null)
  const [filters, setFilters] = useState({
    projectId: 'all',
    assigneeId: 'all',
    startDate: '',
    endDate: '',
  })

  const loadReports = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.projectId && filters.projectId !== 'all') params.append('projectId', filters.projectId)
      if (filters.assigneeId && filters.assigneeId !== 'all') params.append('assigneeId', filters.assigneeId)
      if (filters.startDate) params.append('startDate', filters.startDate)
      if (filters.endDate) params.append('endDate', filters.endDate)

      const response = await fetch(`/api/organizations/${organizationSlug}/tasks/reports?${params}`)
      if (response.ok) {
        const data = await response.json()
        setReports(data)
      }
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [organizationSlug])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    loadReports()
  }

  const clearFilters = () => {
    setFilters({
      projectId: 'all',
      assigneeId: 'all',
      startDate: '',
      endDate: '',
    })
    setTimeout(() => {
      loadReports()
    }, 100)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Task Reports</h1>
            <p className="text-gray-600">Analytics and insights for your tasks</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!reports) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to load reports</h3>
        <p className="text-gray-600 mb-4">There was an issue loading the task analytics.</p>
        <Button onClick={loadReports}>Try Again</Button>
      </div>
    )
  }

  const { summary, priorities, projects: projectStats, assignees: assigneeStats, trends } = reports

  // Prepare chart data
  const statusData = [
    { name: 'Completed', value: summary.completedTasks, color: STATUS_COLORS.completed },
    { name: 'In Progress', value: summary.inProgressTasks, color: STATUS_COLORS.inProgress },
    { name: 'To Do', value: summary.todoTasks, color: STATUS_COLORS.todo },
    { name: 'Blocked', value: summary.blockedTasks, color: STATUS_COLORS.blocked },
  ].filter(item => item.value > 0)

  const priorityData = [
    { name: 'Critical', value: priorities.critical, color: PRIORITY_COLORS.critical },
    { name: 'High', value: priorities.high, color: PRIORITY_COLORS.high },
    { name: 'Medium', value: priorities.medium, color: PRIORITY_COLORS.medium },
    { name: 'Low', value: priorities.low, color: PRIORITY_COLORS.low },
  ].filter(item => item.value > 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Reports</h1>
          <p className="text-gray-600">Analytics and insights for your tasks</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
          <CardDescription>Customize your report view</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project">Project</Label>
              <Select
                value={filters.projectId}
                onValueChange={(value) => handleFilterChange('projectId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Select
                value={filters.assigneeId}
                onValueChange={(value) => handleFilterChange('assigneeId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Assignees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assignees</SelectItem>
                  {assignees.map((assignee) => (
                    <SelectItem key={assignee.id} value={assignee.id}>
                      {assignee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>

            <div className="flex items-end space-x-2">
              <Button onClick={applyFilters} size="sm">
                Apply Filters
              </Button>
              <Button onClick={clearFilters} variant="outline" size="sm">
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{summary.totalTasks}</p>
              </div>
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">{summary.completedTasks}</p>
                <p className="text-xs text-gray-500">{summary.completionRate}% completion rate</p>
              </div>
              <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl sm:text-3xl font-bold text-blue-600">{summary.inProgressTasks}</p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-600">{summary.overdueTasks}</p>
              </div>
              <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Task Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Priority Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill={(entry) => entry.color} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Performance */}
      {projectStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center">
              <FolderKanban className="h-5 w-5 mr-2" />
              Project Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Project</th>
                    <th className="text-center py-2">Total</th>
                    <th className="text-center py-2">Completed</th>
                    <th className="text-center py-2">In Progress</th>
                    <th className="text-center py-2">Blocked</th>
                    <th className="text-center py-2">Completion %</th>
                  </tr>
                </thead>
                <tbody>
                  {projectStats.map((project: any) => {
                    const completionRate = project.total > 0 ? Math.round((project.completed / project.total) * 100) : 0
                    return (
                      <tr key={project.id} className="border-b">
                        <td className="py-3 font-medium">{project.name}</td>
                        <td className="text-center py-3">{project.total}</td>
                        <td className="text-center py-3 text-green-600">{project.completed}</td>
                        <td className="text-center py-3 text-blue-600">{project.inProgress}</td>
                        <td className="text-center py-3 text-red-600">{project.blocked}</td>
                        <td className="text-center py-3">
                          <span className={cn(
                            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                            completionRate >= 80 ? "bg-green-100 text-green-800" :
                            completionRate >= 60 ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          )}>
                            {completionRate}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Performance */}
      {assigneeStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Team Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Assignee</th>
                    <th className="text-center py-2">Total</th>
                    <th className="text-center py-2">Completed</th>
                    <th className="text-center py-2">Completion %</th>
                    <th className="text-center py-2">Est. Hours</th>
                    <th className="text-center py-2">Actual Hours</th>
                    <th className="text-center py-2">Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  {assigneeStats.map((assignee: any) => {
                    const completionRate = assignee.total > 0 ? Math.round((assignee.completed / assignee.total) * 100) : 0
                    const efficiency = assignee.estimatedHours > 0 ? Math.round((assignee.estimatedHours / assignee.actualHours) * 100) : 100
                    return (
                      <tr key={assignee.id} className="border-b">
                        <td className="py-3 font-medium">{assignee.name}</td>
                        <td className="text-center py-3">{assignee.total}</td>
                        <td className="text-center py-3 text-green-600">{assignee.completed}</td>
                        <td className="text-center py-3">
                          <span className={cn(
                            "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                            completionRate >= 80 ? "bg-green-100 text-green-800" :
                            completionRate >= 60 ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          )}>
                            {completionRate}%
                          </span>
                        </td>
                        <td className="text-center py-3">{assignee.estimatedHours}h</td>
                        <td className="text-center py-3">{assignee.actualHours}h</td>
                        <td className="text-center py-3">
                          {assignee.actualHours > 0 ? (
                            <span className={cn(
                              "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
                              efficiency >= 90 ? "bg-green-100 text-green-800" :
                              efficiency >= 70 ? "bg-yellow-100 text-yellow-800" :
                              "bg-red-100 text-red-800"
                            )}>
                              {efficiency}%
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Trends */}
      {trends.weeklyStats && trends.weeklyStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Weekly Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trends.weeklyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="created" 
                    stroke="#3b82f6" 
                    name="Tasks Created"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#22c55e" 
                    name="Tasks Completed"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recent Tasks Created</p>
                <p className="text-xl font-semibold">{trends.recentTasksCreated}</p>
                <p className="text-xs text-gray-500">Last 30 days</p>
              </div>
              <Calendar className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recent Completions</p>
                <p className="text-xl font-semibold text-green-600">{trends.recentTasksCompleted}</p>
                <p className="text-xs text-gray-500">Last 30 days</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Completion</p>
                <p className="text-xl font-semibold">
                  {trends.weeklyStats && trends.weeklyStats.length > 0 
                    ? Math.round(trends.weeklyStats.reduce((sum: number, week: any) => sum + week.completionRate, 0) / trends.weeklyStats.length)
                    : 0}%
                </p>
                <p className="text-xs text-gray-500">Weekly average</p>
              </div>
              <BarChart3 className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
