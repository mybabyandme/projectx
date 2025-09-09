'use client'

import { useState, useMemo } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus, Filter, Users, Clock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import KanbanColumn from './kanban-column'
import TaskCard from './task-card'
import TaskModal from '../modals/task-modal'
import { useToast } from '@/components/ui/use-toast'

interface KanbanBoardProps {
  project: any
  organizationSlug: string
  canEdit?: boolean
  userId: string
  onTaskUpdate?: (taskId: string, updates: any) => Promise<void>
}

const COLUMN_CONFIG = [
  {
    id: 'TODO',
    title: 'To Do',
    color: 'bg-gray-100 border-gray-300',
    headerColor: 'bg-gray-50 text-gray-700',
    description: 'Tasks ready to start'
  },
  {
    id: 'IN_PROGRESS',
    title: 'In Progress',
    color: 'bg-blue-100 border-blue-300',
    headerColor: 'bg-blue-50 text-blue-700',
    description: 'Active tasks being worked on'
  },
  {
    id: 'IN_REVIEW',
    title: 'In Review',
    color: 'bg-yellow-100 border-yellow-300',
    headerColor: 'bg-yellow-50 text-yellow-700',
    description: 'Tasks awaiting review'
  },
  {
    id: 'DONE',
    title: 'Done',
    color: 'bg-green-100 border-green-300',
    headerColor: 'bg-green-50 text-green-700',
    description: 'Completed tasks'
  },
  {
    id: 'BLOCKED',
    title: 'Blocked',
    color: 'bg-red-100 border-red-300',
    headerColor: 'bg-red-50 text-red-700',
    description: 'Tasks with blockers'
  },
]

export default function KanbanBoard({
  project,
  organizationSlug,
  canEdit = false,
  userId,
  onTaskUpdate
}: KanbanBoardProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [assigneeFilter, setAssigneeFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [newTaskStatus, setNewTaskStatus] = useState('')
  const [activeTask, setActiveTask] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const { toast } = useToast()
  const tasks = project.tasks || []

  // Configure drag sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum distance to start drag
      },
    })
  )

  // Filter tasks based on search and filters
  const filteredTasks = useMemo(() => {
    return tasks.filter((task: any) => {
      const matchesSearch = !searchQuery || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesAssignee = assigneeFilter === 'all' || 
        (assigneeFilter === 'unassigned' && !task.assigneeId) ||
        task.assigneeId === assigneeFilter
      
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
      
      return matchesSearch && matchesAssignee && matchesPriority
    })
  }, [tasks, searchQuery, assigneeFilter, priorityFilter])

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped = COLUMN_CONFIG.reduce((acc, column) => {
      acc[column.id] = filteredTasks.filter((task: any) => task.status === column.id)
      return acc
    }, {} as Record<string, any[]>)
    
    return grouped
  }, [filteredTasks])

  // Get unique assignees for filter
  const assignees = useMemo(() => {
    const uniqueAssignees = new Map()
    tasks.forEach((task: any) => {
      if (task.assignee) {
        uniqueAssignees.set(task.assignee.id, task.assignee)
      }
    })
    return Array.from(uniqueAssignees.values())
  }, [tasks])

  // API Functions
  const handleTaskStatusUpdate = async (taskId: string, newStatus: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/organizations/${organizationSlug}/projects/${project.id}/tasks/${taskId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        }
      )
      
      if (!response.ok) throw new Error('Failed to update task')
      
      // Optimistic update or refresh
      if (onTaskUpdate) {
        await onTaskUpdate(taskId, { status: newStatus })
      } else {
        window.location.reload()
      }
      
      toast({
        title: 'Task Updated',
        description: 'Task status has been updated successfully.',
      })
    } catch (error) {
      console.error('Error updating task:', error)
      toast({
        title: 'Error',
        description: 'Failed to update task status. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTask = async (taskData: any) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/organizations/${organizationSlug}/projects/${project.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskData,
          status: newTaskStatus || 'TODO'
        }),
      })
      
      if (!response.ok) throw new Error('Failed to create task')
      
      window.location.reload()
      toast({
        title: 'Task Created',
        description: `"${taskData.title}" has been created successfully.`,
      })
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
      const response = await fetch(
        `/api/organizations/${organizationSlug}/projects/${project.id}/tasks/${editingTask.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        }
      )
      
      if (!response.ok) throw new Error('Failed to update task')
      
      window.location.reload()
      toast({
        title: 'Task Updated',
        description: `"${taskData.title}" has been updated successfully.`,
      })
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Modal handlers
  const handleTaskModalSave = async (taskData: any) => {
    if (editingTask) {
      await handleUpdateTask(taskData)
    } else {
      await handleCreateTask(taskData)
    }
  }

  const openCreateModal = (status = 'TODO') => {
    setEditingTask(null)
    setNewTaskStatus(status)
    setIsTaskModalOpen(true)
  }

  const openEditModal = (task: any) => {
    setEditingTask(task)
    setIsTaskModalOpen(true)
  }

  const closeModal = () => {
    setIsTaskModalOpen(false)
    setEditingTask(null)
    setNewTaskStatus('')
  }

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find((t: any) => t.id === active.id)
    setActiveTask(task)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    if (!over || !canEdit) return

    const taskId = active.id as string
    const newStatus = over.id as string
    const task = tasks.find((t: any) => t.id === taskId)

    // Only update if status actually changed
    if (task && task.status !== newStatus) {
      await handleTaskStatusUpdate(taskId, newStatus)
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    // Handle any drag over logic if needed
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
        defaultStatus={newTaskStatus}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Task Board</h2>
          <p className="text-gray-600">Drag and drop tasks to update their status</p>
        </div>
        {canEdit && (
          <Button onClick={() => openCreateModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Assignees</option>
                <option value="unassigned">Unassigned</option>
                {assignees.map((assignee: any) => (
                  <option key={assignee.id} value={assignee.id}>
                    {assignee.name}
                  </option>
                ))}
              </select>
              
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {COLUMN_CONFIG.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={tasksByStatus[column.id] || []}
              canEdit={canEdit}
              isLoading={isLoading}
              onAddTask={() => openCreateModal(column.id)}
              onEditTask={openEditModal}
            />
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              canEdit={canEdit}
              isDragging={true}
              onEdit={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Board Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {COLUMN_CONFIG.map((column) => {
              const count = tasksByStatus[column.id]?.length || 0
              const percentage = tasks.length > 0 ? Math.round((count / tasks.length) * 100) : 0
              
              return (
                <div key={column.id} className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-sm text-gray-600">{column.title}</div>
                  <div className="text-xs text-gray-500">{percentage}%</div>
                </div>
              )
            })}
          </div>
          
          <div className="mt-4 flex items-center justify-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{assignees.length} assignees</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{tasks.filter((t: any) => t.estimatedHours).reduce((sum: number, t: any) => sum + (t.estimatedHours || 0), 0)}h estimated</span>
            </div>
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              <span>{tasks.filter((t: any) => t.priority === 'HIGH' || t.priority === 'CRITICAL').length} high priority</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
