'use client'

import { 
  CheckCircle, Clock, AlertCircle, User, Calendar, 
  Plus, Filter, Search, MoreVertical, Tag, ArrowRight 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { formatDate } from '@/lib/utils'
import { useState } from 'react'
import TaskModal from './modals/task-modal'
import KanbanBoard from './kanban/kanban-board'

interface TaskListProps {
  project: any
  organizationSlug: string
  canEdit?: boolean
  userId: string
  onAddTask?: () => void
  onEditTask?: (task: any) => void
}

const TASK_STATUS_CONFIG = {
  TODO: { color: 'bg-gray-100 text-gray-800', label: 'To Do', icon: Clock },
  IN_PROGRESS: { color: 'bg-blue-100 text-blue-800', label: 'In Progress', icon: AlertCircle },
  IN_REVIEW: { color: 'bg-yellow-100 text-yellow-800', label: 'In Review', icon: AlertCircle },
  DONE: { color: 'bg-green-100 text-green-800', label: 'Done', icon: CheckCircle },
  BLOCKED: { color: 'bg-red-100 text-red-800', label: 'Blocked', icon: AlertCircle }
}

const TASK_PRIORITY_CONFIG = {
  LOW: { color: 'bg-green-100 text-green-800', label: 'Low' },
  MEDIUM: { color: 'bg-yellow-100 text-yellow-800', label: 'Medium' },
  HIGH: { color: 'bg-orange-100 text-orange-800', label: 'High' },
  CRITICAL: { color: 'bg-red-100 text-red-800', label: 'Critical' }
}

type ViewMode = 'list' | 'kanban'
export default function TaskList({
  project,
  organizationSlug,
  canEdit = false,
  userId,
  onAddTask,
  onEditTask
}: TaskListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [editingTask, setEditingTask] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const tasks = project.tasks || []
  
  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter((task: any) => {
    const matchesSearch = !searchQuery || 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Calculate task statistics
  const taskStats = {
    total: tasks.length,
    todo: tasks.filter((t: any) => t.status === 'TODO').length,
    inProgress: tasks.filter((t: any) => t.status === 'IN_PROGRESS').length,
    done: tasks.filter((t: any) => t.status === 'DONE').length,
    myTasks: tasks.filter((t: any) => t.assigneeId === userId).length
  }

  const progressPercentage = tasks.length > 0 ? Math.round((taskStats.done / tasks.length) * 100) : 0

  // API functions
  const handleCreateTask = async (taskData: any) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/organizations/${organizationSlug}/projects/${project.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      })
      
      if (!response.ok) throw new Error('Failed to create task')
      
      // Refresh the page or update local state
      window.location.reload()
    } catch (error) {
      console.error('Error creating task:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateTask = async (taskData: any) => {
    if (!editingTask) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/organizations/${organizationSlug}/projects/${project.id}/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      })
      
      if (!response.ok) throw new Error('Failed to update task')
      
      // Refresh the page or update local state
      window.location.reload()
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleTaskModalSave = async (taskData: any) => {
    if (editingTask) {
      await handleUpdateTask(taskData)
    } else {
      await handleCreateTask(taskData)
    }
  }

  const openCreateModal = () => {
    setEditingTask(null)
    setIsTaskModalOpen(true)
  }

  const openEditModal = (task: any) => {
    setEditingTask(task)
    setIsTaskModalOpen(true)
  }

  const closeModal = () => {
    setIsTaskModalOpen(false)
    setEditingTask(null)
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Project Tasks
          </CardTitle>          <CardDescription>
            No tasks have been created for this project yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {canEdit && onAddTask && (
            <Button onClick={openCreateModal} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Create First Task
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={closeModal}
        onSave={handleTaskModalSave}
        project={project}
        task={editingTask}
      />
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Project Tasks</h3>
          <p className="text-sm text-gray-600">
            {taskStats.total} total tasks, {taskStats.done} completed ({progressPercentage}%)
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'kanban' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Board
            </button>
          </div>
          
          {canEdit && onAddTask && (
            <Button onClick={openCreateModal} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          )}
        </div>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{taskStats.total}</div>
            <div className="text-sm text-gray-600">Total Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">{taskStats.todo}</div>
            <div className="text-sm text-gray-600">To Do</div>
          </CardContent>
        </Card>        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
            <div className="text-sm text-gray-600">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{taskStats.done}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{taskStats.myTasks}</div>
            <div className="text-sm text-gray-600">My Tasks</div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-medium text-gray-900">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="w-full" />
        </CardContent>
      </Card>

      {/* Search and Filters - Only show in list view */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">{/* Filter dropdowns would go here */}</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content based on view mode */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          project={project}
          organizationSlug={organizationSlug}
          canEdit={canEdit}
          userId={userId}
          onTaskUpdate={async (taskId, updates) => {
            // Handle optimistic updates if needed
            console.log('Task updated:', taskId, updates)
          }}
        />
      ) : (
        <>
          {/* Task List */}
          <div className="space-y-3">
        {filteredTasks.map((task: any) => {
          const statusConfig = TASK_STATUS_CONFIG[task.status as keyof typeof TASK_STATUS_CONFIG] || 
                              TASK_STATUS_CONFIG.TODO
          const priorityConfig = TASK_PRIORITY_CONFIG[task.priority as keyof typeof TASK_PRIORITY_CONFIG] || 
                                TASK_PRIORITY_CONFIG.MEDIUM
          const StatusIcon = statusConfig.icon

          return (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <StatusIcon className="h-4 w-4 text-gray-500" />
                      <h4 className="font-medium text-gray-900 truncate">{task.title}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityConfig.color}`}>
                        {priorityConfig.label}
                      </span>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                    )}

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      {task.assignee && (
                        <div className="flex items-center space-x-1">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={task.assignee.image} />
                            <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                              {task.assignee.name?.split(' ').map((n: string) => n[0]).join('') || 'UN'}
                            </AvatarFallback>
                          </Avatar>
                          <span>{task.assignee.name}</span>
                        </div>
                      )}
                      
                      {task.dueDate && (
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>Due {formatDate(task.dueDate)}</span>
                        </div>
                      )}
                      
                      {task.estimatedHours && (
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{task.estimatedHours}h estimated</span>
                        </div>
                      )}

                      {task.wbsCode && (
                        <div className="flex items-center">
                          <Tag className="h-3 w-3 mr-1" />
                          <span>{task.wbsCode}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {canEdit && onEditTask && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditModal(task)}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredTasks.length === 0 && tasks.length > 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </CardContent>
        </Card>
      )}
        </>
      )}
    </div>
  )
}
