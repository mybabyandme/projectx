'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Calendar, Clock, User, Target, AlertTriangle, Loader2, X } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

// Task form schema
const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  assigneeId: z.string().optional(),
  parentId: z.string().optional(),
  phaseId: z.string().optional(),
  estimatedHours: z.number().min(0).optional(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  wbsCode: z.string().optional()
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (taskData: TaskFormData) => Promise<void>
  project: any
  task?: any // For editing existing tasks
  defaultStatus?: string
}

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do', color: 'bg-gray-100 text-gray-800' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'IN_REVIEW', label: 'In Review', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'DONE', label: 'Done', color: 'bg-green-100 text-green-800' },
  { value: 'BLOCKED', label: 'Blocked', color: 'bg-red-100 text-red-800' }
]

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low', color: 'bg-green-100 text-green-800' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-800' }
]

export default function TaskModal({
  isOpen,
  onClose,
  onSave,
  project,
  task,
  defaultStatus = 'TODO'
}: TaskModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  // Extract stakeholders for assignment options
  const stakeholders = project.metadata?.stakeholders?.stakeholders || []
  const phases = project.phases || []
  const existingTasks = project.tasks || []
  
  // Form setup
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      status: task?.status || defaultStatus,
      priority: task?.priority || 'MEDIUM',
      title: task?.title || '',
      description: task?.description || '',
      assigneeId: task?.assigneeId || '',
      parentId: task?.parentId || '',
      phaseId: task?.phaseId || '',
      estimatedHours: task?.estimatedHours || undefined,
      startDate: task?.startDate ? formatDate(task.startDate, 'yyyy-MM-dd') : '',
      dueDate: task?.dueDate ? formatDate(task.dueDate, 'yyyy-MM-dd') : '',
      wbsCode: task?.wbsCode || ''
    }
  })

  const [selectedStatus, setSelectedStatus] = useState(task?.status || defaultStatus)
  const [selectedPriority, setSelectedPriority] = useState(task?.priority || 'MEDIUM')
  const [selectedAssignee, setSelectedAssignee] = useState(task?.assigneeId || '')
  const [selectedPhase, setSelectedPhase] = useState(task?.phaseId || '')
  const [selectedParent, setSelectedParent] = useState(task?.parentId || '')

  // Reset form when modal opens/closes or task changes
  useEffect(() => {
    if (isOpen) {
      if (task) {
        // Editing existing task
        setSelectedStatus(task.status)
        setSelectedPriority(task.priority)
        setSelectedAssignee(task.assigneeId || '')
        setSelectedPhase(task.phaseId || '')
        setSelectedParent(task.parentId || '')
        reset({
          title: task.title,
          description: task.description || '',
          status: task.status,
          priority: task.priority,
          assigneeId: task.assigneeId || '',
          parentId: task.parentId || '',
          phaseId: task.phaseId || '',
          estimatedHours: task.estimatedHours || undefined,
          startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
          wbsCode: task.wbsCode || ''
        })
      } else {
        // Creating new task
        setSelectedStatus(defaultStatus)
        setSelectedPriority('MEDIUM')
        setSelectedAssignee('')
        setSelectedPhase('')
        setSelectedParent('')
        reset({
          status: defaultStatus,
          priority: 'MEDIUM',
          title: '',
          description: '',
          assigneeId: '',
          parentId: '',
          phaseId: '',
          estimatedHours: undefined,
          startDate: '',
          dueDate: '',
          wbsCode: ''
        })
      }
    }
  }, [isOpen, task, defaultStatus, reset])

  const onSubmit = async (data: TaskFormData) => {
    setIsLoading(true)
    try {
      // Convert string dates to Date objects if provided
      const processedData = {
        ...data,
        status: selectedStatus,
        priority: selectedPriority,
        assigneeId: selectedAssignee || null,
        parentId: selectedParent || null,
        phaseId: selectedPhase || null,
        estimatedHours: data.estimatedHours || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        wbsCode: data.wbsCode || null
      }
      
      await onSave(processedData)
      toast({
        title: task ? 'Task Updated' : 'Task Created',
        description: `"${data.title}" has been ${task ? 'updated' : 'created'} successfully.`,
      })
      onClose()
    } catch (error) {
      console.error('Error saving task:', error)
      toast({
        title: 'Error',
        description: 'Failed to save task. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Target className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {task ? 'Edit Task' : 'Create New Task'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {task 
                  ? 'Update the task details and assignment information.'
                  : 'Add a new task to your project with detailed information and assignment.'
                }
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                Task Title *
              </Label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Enter task title..."
                className="mt-1"
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Describe the task requirements and acceptance criteria..."
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Status</Label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Priority</Label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {/* Assignment and Organization */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Assigned To</Label>
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Unassigned</option>
                {stakeholders.map((stakeholder) => (
                  <option key={stakeholder.id} value={stakeholder.id}>
                    {stakeholder.name} ({stakeholder.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">Project Phase</Label>
              <select
                value={selectedPhase}
                onChange={(e) => setSelectedPhase(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">No specific phase</option>
                {phases.map((phase) => (
                  <option key={phase.id} value={phase.id}>
                    {phase.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dependencies and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">Parent Task</Label>
              <select
                value={selectedParent}
                onChange={(e) => setSelectedParent(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">No parent task</option>
                {existingTasks
                  .filter(t => t.id !== task?.id) // Don't allow self-reference
                  .map((existingTask) => (
                    <option key={existingTask.id} value={existingTask.id}>
                      {existingTask.title}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <Label htmlFor="estimatedHours" className="text-sm font-medium text-gray-700">
                Estimated Hours
              </Label>
              <div className="relative mt-1">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="estimatedHours"
                  type="number"
                  min="0"
                  step="0.5"
                  {...register('estimatedHours', { valueAsNumber: true })}
                  placeholder="0"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                Start Date
              </Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="dueDate" className="text-sm font-medium text-gray-700">
                Due Date
              </Label>
              <div className="relative mt-1">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="dueDate"
                  type="date"
                  {...register('dueDate')}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* WBS Code */}
          <div>
            <Label htmlFor="wbsCode" className="text-sm font-medium text-gray-700">
              WBS Code (Optional)
            </Label>
            <Input
              id="wbsCode"
              {...register('wbsCode')}
              placeholder="e.g., 1.2.1"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Work Breakdown Structure code for project organization
            </p>
          </div>

          {/* Preview Section */}
          {(selectedStatus || selectedPriority) && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  STATUS_OPTIONS.find(s => s.value === selectedStatus)?.color || 'bg-gray-100 text-gray-800'
                }`}>
                  {STATUS_OPTIONS.find(s => s.value === selectedStatus)?.label}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  PRIORITY_OPTIONS.find(p => p.value === selectedPriority)?.color || 'bg-gray-100 text-gray-800'
                }`}>
                  {PRIORITY_OPTIONS.find(p => p.value === selectedPriority)?.label}
                </span>
                {selectedAssignee && (
                  <span className="text-xs text-gray-600">
                    → {stakeholders.find(s => s.id === selectedAssignee)?.name}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center"
            >
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {task ? 'Update Task' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
