'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar, Clock, AlertTriangle, CheckCircle, Target, 
  FolderKanban, Filter, Search, ArrowRight, MoreVertical,
  User, Flag, Briefcase, Plus, BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { formatDate } from '@/lib/utils'
import StatsHeader from '@/components/layout/stats-header'
import SearchFilters from '@/components/layout/search-filters'
import ResultsList from '@/components/layout/results-list'

interface MyTasksViewProps {
  tasks: any[]
  taskStats: any[]
  organizationSlug: string
  userId: string
  userRole: string
}

const TASK_STATUS_CONFIG = {
  TODO: { color: 'bg-gray-100 text-gray-800', label: 'To Do', priority: 1 },
  IN_PROGRESS: { color: 'bg-blue-100 text-blue-800', label: 'In Progress', priority: 2 },
  IN_REVIEW: { color: 'bg-yellow-100 text-yellow-800', label: 'In Review', priority: 3 },
  DONE: { color: 'bg-green-100 text-green-800', label: 'Done', priority: 4 },
  BLOCKED: { color: 'bg-red-100 text-red-800', label: 'Blocked', priority: 0 }
}

const PRIORITY_CONFIG = {
  CRITICAL: { color: 'text-red-600', label: 'Critical', icon: AlertTriangle },
  HIGH: { color: 'text-orange-600', label: 'High', icon: AlertTriangle },
  MEDIUM: { color: 'text-yellow-600', label: 'Medium', icon: Flag },
  LOW: { color: 'text-green-600', label: 'Low', icon: Flag }
}

export default function MyTasksView({
  tasks = [],
  taskStats = [],
  organizationSlug,
  userId,
  userRole
}: MyTasksViewProps) {
  const router = useRouter()
  
  // Early safety checks
  if (!organizationSlug) {
    return <div className="p-6 text-center text-red-600">Error: Organization not found</div>
  }

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [dueDateFilter, setDueDateFilter] = useState('')

  // Calculate statistics
  const stats = useMemo(() => {
    // Ensure tasks is an array and taskStats is valid
    const safeTasks = Array.isArray(tasks) ? tasks : []
    const safeTaskStats = Array.isArray(taskStats) ? taskStats : []
    
    const statusCounts = safeTaskStats.reduce((acc, stat) => {
      if (stat && stat.status && stat._count && typeof stat._count.status === 'number') {
        acc[stat.status] = stat._count.status
      }
      return acc
    }, {} as Record<string, number>)

    const total = safeTasks.length
    const completed = statusCounts.DONE || 0
    const inProgress = statusCounts.IN_PROGRESS || 0
    const blocked = statusCounts.BLOCKED || 0
    const overdue = safeTasks.filter(task => 
      task && task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
    ).length

    return { total, completed, inProgress, blocked, overdue }
  }, [tasks, taskStats])

  // Get unique projects for filter
  const projects = useMemo(() => {
    const safeTasks = Array.isArray(tasks) ? tasks : []
    const uniqueProjects = new Map()
    safeTasks.forEach(task => {
      if (task && task.project && task.project.id) {
        uniqueProjects.set(task.project.id, task.project)
      }
    })
    return Array.from(uniqueProjects.values())
  }, [tasks])

  // Filter tasks
  const filteredTasks = useMemo(() => {
    const safeTasks = Array.isArray(tasks) ? tasks : []
    return safeTasks.filter(task => {
      if (!task) return false
      
      const matchesSearch = !searchQuery || 
        (task.title && task.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.project?.name && task.project.name.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesStatus = !statusFilter || task.status === statusFilter
      const matchesPriority = !priorityFilter || task.priority === priorityFilter
      const matchesProject = !projectFilter || task.project?.id === projectFilter
      
      let matchesDueDate = true
      if (dueDateFilter === 'overdue') {
        matchesDueDate = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
      } else if (dueDateFilter === 'today') {
        const today = new Date().toDateString()
        matchesDueDate = task.dueDate && new Date(task.dueDate).toDateString() === today
      } else if (dueDateFilter === 'week') {
        const weekFromNow = new Date()
        weekFromNow.setDate(weekFromNow.getDate() + 7)
        matchesDueDate = task.dueDate && new Date(task.dueDate) <= weekFromNow
      }
      
      return matchesSearch && matchesStatus && matchesPriority && matchesProject && matchesDueDate
    })
  }, [tasks, searchQuery, statusFilter, priorityFilter, projectFilter, dueDateFilter])

  // Prepare stats data
  const statsData = [
    {
      title: 'Total Tasks',
      value: stats.total,
      change: '+0',
      trend: 'neutral' as const,
      icon: <Target className="h-5 w-5" />
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      change: '+0',
      trend: 'up' as const,
      icon: <Clock className="h-5 w-5" />
    },
    {
      title: 'Completed',
      value: stats.completed,
      change: '+0',
      trend: 'up' as const,
      icon: <CheckCircle className="h-5 w-5" />
    },
    {
      title: 'Overdue',
      value: stats.overdue,
      change: '+0',
      trend: stats.overdue > 0 ? 'down' as const : 'neutral' as const,
      icon: <AlertTriangle className="h-5 w-5" />
    }
  ]

  // Filter options
  const filterOptions = [
    {
      key: 'status',
      label: 'Status',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: '', label: 'All Status' },
        ...Object.entries(TASK_STATUS_CONFIG).map(([key, config]) => ({
          value: key,
          label: config.label
        }))
      ]
    },
    {
      key: 'priority',
      label: 'Priority',
      value: priorityFilter,
      onChange: setPriorityFilter,
      options: [
        { value: '', label: 'All Priorities' },
        ...Object.entries(PRIORITY_CONFIG).map(([key, config]) => ({
          value: key,
          label: config.label
        }))
      ]
    },
    {
      key: 'project',
      label: 'Project',
      value: projectFilter,
      onChange: setProjectFilter,
      options: [
        { value: '', label: 'All Projects' },
        ...projects.map(project => ({
          value: project.id,
          label: project.name
        }))
      ]
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      value: dueDateFilter,
      onChange: setDueDateFilter,
      options: [
        { value: '', label: 'All Dates' },
        { value: 'overdue', label: 'Overdue' },
        { value: 'today', label: 'Due Today' },
        { value: 'week', label: 'Due This Week' }
      ]
    }
  ]

  // Task fields for ResultsList - optimized for mobile
  const taskFields = [
    {
      key: 'title',
      label: 'Task',
      primary: true, // Mark as primary field
      render: (value: any, task: any) => {
        if (!task) return null
        const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
        const isToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString()
        
        return (
          <div className="flex items-start space-x-3 min-w-0 flex-1">
            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
              task.status === 'DONE' ? 'bg-green-500' :
              task.status === 'IN_PROGRESS' ? 'bg-blue-500' :
              task.status === 'BLOCKED' ? 'bg-red-500' :
              'bg-gray-300'
            }`} />
            <div className="min-w-0 flex-1">
              <div className={`font-medium text-sm leading-tight ${
                isOverdue ? 'text-red-700' : 'text-gray-900'
              }`}>
                {task.title || 'Untitled Task'}
              </div>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <span className="truncate">{task.project?.name || 'No Project'}</span>
                {task.phase && (
                  <>
                    <span>•</span>
                    <span className="truncate">{task.phase.name}</span>
                  </>
                )}
              </div>
              {/* Mobile-specific quick info */}
              <div className="flex items-center gap-3 mt-2 sm:hidden">
                {/* Status */}
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${
                  TASK_STATUS_CONFIG[task.status as keyof typeof TASK_STATUS_CONFIG]?.color || 'bg-gray-100 text-gray-800'
                }`}>
                  {TASK_STATUS_CONFIG[task.status as keyof typeof TASK_STATUS_CONFIG]?.label || task.status}
                </span>
                
                {/* Due date */}
                {task.dueDate && (
                  <div className={`flex items-center space-x-1 ${
                    isOverdue ? 'text-red-600' : isToday ? 'text-orange-600' : 'text-gray-500'
                  }`}>
                    <Calendar className="h-3 w-3" />
                    <span className="text-xs">{formatDate(task.dueDate)}</span>
                    {isOverdue && <AlertTriangle className="h-3 w-3" />}
                  </div>
                )}
                
                {/* Priority */}
                {task.priority && task.priority !== 'MEDIUM' && (
                  <div className={`flex items-center space-x-1 ${
                    PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG]?.color || 'text-gray-600'
                  }`}>
                    <Flag className="h-3 w-3" />
                    <span className="text-xs">{PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG]?.label}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }
    },
    {
      key: 'status',
      label: 'Status',
      type: 'badge' as const,
      hideOnMobile: true, // Hide on mobile since it's shown in primary field
      render: (task: any) => {
        if (!task || !task.status) return null
        const config = TASK_STATUS_CONFIG[task.status as keyof typeof TASK_STATUS_CONFIG]
        return config ? { text: config.label, color: config.color } : null
      }
    },
    {
      key: 'priority',
      label: 'Priority',
      hideOnMobile: true, // Hide on mobile since it's shown in primary field when relevant
      render: (task: any) => {
        if (!task || !task.priority) return null
        const config = PRIORITY_CONFIG[task.priority as keyof typeof PRIORITY_CONFIG]
        if (!config) return null
        const Icon = config.icon
        return (
          <div className={`flex items-center space-x-1 ${config.color}`}>
            <Icon className="h-3 w-3" />
            <span className="text-sm">{config.label}</span>
          </div>
        )
      }
    },
    {
      key: 'dueDate', 
      label: 'Due Date',
      type: 'date' as const,
      hideOnMobile: true, // Hide on mobile since it's shown in primary field
      render: (task: any) => {
        if (!task || !task.dueDate) return null
        const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'DONE'
        const isToday = new Date(task.dueDate).toDateString() === new Date().toDateString()
        
        return (
          <div className={`flex items-center space-x-1 ${
            isOverdue ? 'text-red-600' : isToday ? 'text-orange-600' : 'text-gray-600'
          }`}>
            <Calendar className="h-3 w-3" />
            <span className="text-sm">{formatDate(task.dueDate)}</span>
            {isOverdue && <AlertTriangle className="h-3 w-3" />}
          </div>
        )
      }
    }
  ]

  // Task actions
  const taskActions = [
    {
      key: 'view-task',
      label: 'View Task',
      icon: <Target className="h-4 w-4" />,
      onClick: (task: any) => {
        if (task?.id) {
          window.location.href = `/${organizationSlug}/tasks/${task.id}`
        }
      },
      variant: 'default' as const
    },
    {
      key: 'view-project',
      label: 'View Project',
      icon: <FolderKanban className="h-4 w-4" />,
      onClick: (task: any) => {
        if (task?.project?.id) {
          window.location.href = `/${organizationSlug}/projects/${task.project.id}`
        }
      },
      variant: 'default' as const
    },
    {
      key: 'edit-task',
      label: 'Edit Task',
      icon: <MoreVertical className="h-4 w-4" />,
      onClick: (task: any) => {
        if (task?.id) {
          console.log('Edit task:', task.id)
        }
      },
      variant: 'default' as const
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <StatsHeader
        title="My Tasks"
        subtitle="Tasks assigned to you across all projects"
        stats={statsData.map(stat => ({
          icon: stat.icon,
          value: stat.value,
          label: stat.title
        }))}
        actions={[
          {
            label: 'View Reports',
            onClick: () => router.push(`/${organizationSlug}/tasks/reports`),
            variant: 'secondary' as const,
            icon: <BarChart3 className="h-4 w-4" />
          },
          {
            label: 'View All Projects',
            onClick: () => router.push(`/${organizationSlug}/projects`),
            variant: 'secondary' as const,
            icon: <Plus className="h-4 w-4" />
          }
        ]}
      />

      {/* Filters */}
      <SearchFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search tasks..."
        filters={filterOptions}
        sortOptions={[
          { value: 'dueDate', label: 'Due Date' },
          { value: 'priority', label: 'Priority' },
          { value: 'status', label: 'Status' },
          { value: 'project', label: 'Project' }
        ]}
        resultsCount={filteredTasks.length}
        totalCount={tasks.length}
        onRefresh={() => window.location.reload()}
        actions={[
          {
            label: 'Calendar View',
            onClick: () => console.log('Calendar view'),
            variant: 'secondary' as const
          }
        ]}
      />

      {/* Quick Stats */}
      {stats.overdue > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <h3 className="font-medium text-orange-900">
                  You have {stats.overdue} overdue task{stats.overdue !== 1 ? 's' : ''}
                </h3>
                <p className="text-sm text-orange-700">
                  Review and update these tasks to keep projects on track.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDueDateFilter('overdue')}
                className="border-orange-300 text-orange-700 hover:bg-orange-100"
              >
                View Overdue
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Overview */}
      {stats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Progress Overview</CardTitle>
            <CardDescription>Your task completion across all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm font-medium text-gray-900">
                  {Math.round((stats.completed / stats.total) * 100)}%
                </span>
              </div>
              <Progress value={(stats.completed / stats.total) * 100} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-600">{stats.completed}</div>
                  <div className="text-xs text-gray-500">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">{stats.inProgress}</div>
                  <div className="text-xs text-gray-500">In Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-gray-600">
                    {(stats.total - stats.completed - stats.inProgress - stats.blocked)}
                  </div>
                  <div className="text-xs text-gray-500">To Do</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-red-600">{stats.blocked}</div>
                  <div className="text-xs text-gray-500">Blocked</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tasks List */}
      <ResultsList
        items={filteredTasks}
        fields={taskFields}
        actions={taskActions}
        viewMode="compact"
        emptyTitle={tasks.length === 0 ? 'No tasks assigned' : 'No matching tasks'}
        emptyDescription={tasks.length === 0 
          ? 'You dont have any tasks assigned yet. Check back later or contact your project manager.'
          : 'Try adjusting your search criteria or filters.'}
        emptyAction={tasks.length === 0 ? {
          label: 'View Projects',
          onClick: () => window.location.href = `/${organizationSlug}/projects`
        } : undefined}
        onItemClick={(task) => {
          if (task?.id) {
            window.location.href = `/${organizationSlug}/tasks/${task.id}`
          }
        }}
        itemClassName={(task) => {
          if (!task) return ''
          const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
          const isBlocked = task.status === 'BLOCKED'
          return `${isOverdue ? 'ring-1 ring-red-200' : ''} ${isBlocked ? 'bg-red-50' : ''}`
        }}
        compact={true}
        clickable={true}
      />

      {/* Quick Actions for Filtered Tasks */}
      {filteredTasks.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {filteredTasks.length} of {stats.total} tasks
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Mark All as Read
                </Button>
                <Button variant="outline" size="sm">
                  Export List
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
