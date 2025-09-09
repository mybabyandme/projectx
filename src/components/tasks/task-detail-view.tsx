
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Edit, MoreVertical, Calendar, Clock, User, AlertTriangle,
  CheckCircle, Flag, FolderKanban, MessageSquare, Paperclip, 
  Play, Pause, RotateCcw, Check, X, Plus, Trash2, Save, 
  Users, FileText, Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDate, cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

interface TaskDetailViewProps {
  task: any
  organizationSlug: string
  userRole: string
  canEdit: boolean
  userId: string
}

const TASK_STATUS_CONFIG = {
  TODO: { color: 'bg-gray-100 text-gray-800', label: 'To Do', icon: Clock },
  IN_PROGRESS: { color: 'bg-blue-100 text-blue-800', label: 'In Progress', icon: Play },
  IN_REVIEW: { color: 'bg-yellow-100 text-yellow-800', label: 'In Review', icon: AlertTriangle },
  DONE: { color: 'bg-green-100 text-green-800', label: 'Done', icon: CheckCircle },
  BLOCKED: { color: 'bg-red-100 text-red-800', label: 'Blocked', icon: X }
}

const PRIORITY_CONFIG = {
  CRITICAL: { color: 'text-red-600', label: 'Critical', bgColor: 'bg-red-50' },
  HIGH: { color: 'text-orange-600', label: 'High', bgColor: 'bg-orange-50' },
  MEDIUM: { color: 'text-yellow-600', label: 'Medium', bgColor: 'bg-yellow-50' },
  LOW: { color: 'text-green-600', label: 'Low', bgColor: 'bg-green-50' }
}

export default function TaskDetailView({
  task: initialTask,
  organizationSlug,
  userRole,
  canEdit,
  userId
}: TaskDetailViewProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  // Early safety check
  if (!initialTask) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Task not found</h2>
          <p className="text-gray-600 mb-4">The task you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => router.push(`/${organizationSlug}/tasks`)}>
            Back to Tasks
          </Button>
        </div>
      </div>
    )
  }
  
  const [task, setTask] = useState(initialTask)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [newComment, setNewComment] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'TODO',
    priority: task?.priority || 'MEDIUM',
    dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    estimatedHours: task?.estimatedHours || 0,
    actualHours: task?.actualHours || 0,
  })

  const statusConfig = TASK_STATUS_CONFIG[task?.status as keyof typeof TASK_STATUS_CONFIG] || TASK_STATUS_CONFIG.TODO
  const priorityConfig = PRIORITY_CONFIG[task?.priority as keyof typeof PRIORITY_CONFIG] || PRIORITY_CONFIG.MEDIUM
  const StatusIcon = statusConfig?.icon || Clock
  
  // Calculate progress based on subtasks
  const subtaskProgress = task?.subtasks?.length > 0 
    ? Math.round((task.subtasks.filter((st: any) => st?.status === 'DONE').length / task.subtasks.length) * 100)
    : (task?.status === 'DONE' ? 100 : task?.status === 'IN_PROGRESS' ? 50 : 0)

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      if (!task?.id) return
      
      try {
        const response = await fetch(`/api/organizations/${organizationSlug}/tasks/${task.id}/comments`)
        if (response.ok) {
          const data = await response.json()
          setComments(data.comments || [])
        }
      } catch (error) {
        console.error('Error loading comments:', error)
      }
    }
    loadComments()
  }, [task?.id, organizationSlug])

  const handleBack = () => {
    router.push(`/${organizationSlug}/tasks`)
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!task?.id) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/organizations/${organizationSlug}/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        const updatedTask = await response.json()
        setTask(updatedTask)
        toast({
          title: 'Success',
          description: 'Task status updated successfully',
        })
      } else {
        throw new Error('Failed to update status')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    setEditForm({
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'TODO',
      priority: task?.priority || 'MEDIUM',
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      estimatedHours: task?.estimatedHours || 0,
      actualHours: task?.actualHours || 0,
    })
    setIsEditing(true)
  }

  const handleSaveEdit = async () => {
    if (!task?.id) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/organizations/${organizationSlug}/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        const updatedTask = await response.json()
        setTask({ ...task, ...updatedTask })
        setIsEditing(false)
        toast({
          title: 'Success',
          description: 'Task updated successfully',
        })
      } else {
        throw new Error('Failed to update task')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update task',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    setEditForm({
      title: task?.title || '',
      description: task?.description || '',
      status: task?.status || 'TODO',
      priority: task?.priority || 'MEDIUM',
      dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
      estimatedHours: task?.estimatedHours || 0,
      actualHours: task?.actualHours || 0,
    })
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !task?.id) return

    setIsSubmittingComment(true)
    try {
      const response = await fetch(`/api/organizations/${organizationSlug}/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments(prev => [...prev, data.comment])
        setNewComment('')
        toast({
          title: 'Success',
          description: 'Comment added successfully',
        })
      } else {
        throw new Error('Failed to add comment')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add comment',
        variant: 'destructive',
      })
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const isOverdue = task?.dueDate && new Date(task.dueDate) < new Date() && task?.status !== 'DONE'
  const isAssignedToMe = task?.assigneeId === userId

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-optimized Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="py-2 sm:py-3">
            <button
              onClick={handleBack}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Back to Tasks</span>
              <span className="sm:hidden">Back</span>
            </button>
          </div>

          {/* Task Header - Mobile Optimized */}
          <div className="py-3 sm:py-6">
            <div className="space-y-4">
              {/* Title and Status Row */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <StatusIcon className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <Input
                        value={editForm.title}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        className="text-lg sm:text-2xl font-bold border-0 p-0 focus:ring-0 bg-transparent"
                        placeholder="Task title"
                      />
                    ) : (
                      <h1 className="text-lg sm:text-2xl font-bold text-gray-900 break-words">
                        {task?.title || 'Untitled Task'}
                      </h1>
                    )}
                    
                    {/* Mobile: Status and Priority badges */}
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig?.color}`}>
                        {statusConfig?.label}
                      </span>
                      {isOverdue && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Overdue
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityConfig?.color} ${priorityConfig?.bgColor}`}>
                        <Flag className="h-3 w-3 mr-1" />
                        {priorityConfig?.label}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions - Mobile Optimized */}
                <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0">
                  {isEditing ? (
                    <>
                      <Button size="sm" onClick={handleSaveEdit} disabled={isLoading}>
                        <Save className="h-4 w-4" />
                        <span className="hidden sm:inline ml-2">Save</span>
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                        <X className="h-4 w-4" />
                        <span className="hidden sm:inline ml-2">Cancel</span>
                      </Button>
                    </>
                  ) : (
                    <>
                      {isAssignedToMe && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline" disabled={isLoading}>
                              <StatusIcon className="h-4 w-4" />
                              <span className="hidden sm:inline ml-2">Status</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {Object.entries(TASK_STATUS_CONFIG).map(([status, config]) => (
                              <DropdownMenuItem
                                key={status}
                                onClick={() => handleStatusChange(status)}
                                disabled={task.status === status}
                              >
                                <config.icon className="h-4 w-4 mr-2" />
                                {config.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}

                      {canEdit && (
                        <Button size="sm" onClick={handleEdit} variant="outline">
                          <Edit className="h-4 w-4" />
                          <span className="hidden sm:inline ml-2">Edit</span>
                        </Button>
                      )}
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Paperclip className="h-4 w-4 mr-2" />
                            Attach File
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {canEdit && (
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Task
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              {(task?.description || isEditing) && (
                <div className="space-y-2">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                      <Textarea
                        id="description"
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Task description"
                        rows={3}
                      />
                    </div>
                  ) : task?.description && (
                    <p className="text-gray-600 text-sm sm:text-base">{task.description}</p>
                  )}
                </div>
              )}

              {/* Meta Information - Mobile Optimized */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
                {task.project?.id && (
                  <button
                    onClick={() => router.push(`/${organizationSlug}/projects/${task.project.id}`)}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    <FolderKanban className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="truncate max-w-[120px] sm:max-w-none">{task.project?.name || 'Unknown Project'}</span>
                  </button>
                )}
                
                {task.phase?.name && (
                  <span className="flex items-center">
                    <span className="hidden sm:inline">Phase:</span>
                    <span className="truncate max-w-[100px] sm:max-w-none">{task.phase.name}</span>
                  </span>
                )}

                {task.wbsCode && (
                  <span className="hidden sm:flex items-center">
                    WBS: {task.wbsCode}
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-medium text-gray-900">{subtaskProgress}%</span>
                </div>
                <Progress value={subtaskProgress} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile Optimized */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Edit Form - Only show in edit mode */}
            {isEditing && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base sm:text-lg">Edit Task Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={editForm.status}
                        onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(TASK_STATUS_CONFIG).map(([status, config]) => (
                            <SelectItem key={status} value={status}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={editForm.priority}
                        onValueChange={(value) => setEditForm(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(PRIORITY_CONFIG).map(([priority, config]) => (
                            <SelectItem key={priority} value={priority}>
                              {config.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={editForm.dueDate}
                        onChange={(e) => setEditForm(prev => ({ ...prev, dueDate: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="estimatedHours">Estimated Hours</Label>
                      <Input
                        id="estimatedHours"
                        type="number"
                        min="0"
                        value={editForm.estimatedHours}
                        onChange={(e) => setEditForm(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 0 }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Subtasks */}
            {task?.subtasks && task.subtasks.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base sm:text-lg">Subtasks</CardTitle>
                      <CardDescription className="text-sm">
                        {task.subtasks.filter((st: any) => st?.status === 'DONE').length} of {task.subtasks.length} completed
                      </CardDescription>
                    </div>
                    {canEdit && (
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Add Subtask</span>
                        <span className="sm:hidden">Add</span>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {task.subtasks.map((subtask: any) => {
                      if (!subtask) return null
                      const isCompleted = subtask.status === 'DONE'
                      return (
                        <div key={subtask.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <button
                            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                              isCompleted 
                                ? 'bg-green-500 border-green-500' 
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                            onClick={() => console.log('Toggle subtask:', subtask.id)}
                          >
                            {isCompleted && <Check className="h-3 w-3 text-white" />}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium break-words",
                              isCompleted ? "line-through text-gray-500" : "text-gray-900"
                            )}>
                              {subtask.title || 'Untitled Subtask'}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                              {subtask.assignee && (
                                <div className="flex items-center space-x-1">
                                  <Avatar className="h-4 w-4">
                                    <AvatarImage src={subtask.assignee.image} />
                                    <AvatarFallback className="text-xs">
                                      {subtask.assignee.name?.charAt(0) || '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs text-gray-500 truncate max-w-[100px] sm:max-w-none">
                                    {subtask.assignee.name || 'Unknown'}
                                  </span>
                                </div>
                              )}
                              {subtask.dueDate && (
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                  <Calendar className="h-3 w-3 flex-shrink-0" />
                                  <span>{formatDate(subtask.dueDate)}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments Section - Mobile Optimized */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg flex items-center">
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Comments ({comments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Comment */}
                <div className="space-y-3">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  <div className="flex justify-end">
                    <Button 
                      size="sm" 
                      onClick={handleAddComment} 
                      disabled={!newComment.trim() || isSubmittingComment}
                    >
                      {isSubmittingComment ? (
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      <span className="hidden sm:inline">Add Comment</span>
                      <span className="sm:hidden">Send</span>
                    </Button>
                  </div>
                </div>

                {/* Comments List */}
                {comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={comment.author?.image} />
                          <AvatarFallback className="text-xs">
                            {comment.author?.name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {comment.author?.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 break-words">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <MessageSquare className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">No comments yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Mobile Optimized */}
          <div className="space-y-4 sm:space-y-6">
            {/* Task Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Task Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Status</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig?.color}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusConfig?.label}
                    </span>
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Priority</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityConfig?.color} ${priorityConfig?.bgColor}`}>
                      <Flag className="h-3 w-3 mr-1" />
                      {priorityConfig?.label}
                    </span>
                  </div>
                </div>

                {/* Assignee */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Assignee</label>
                  <div className="mt-1">
                    {task.assignee ? (
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={task.assignee.image} />
                          <AvatarFallback className="text-xs">
                            {task.assignee.name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-900 truncate">{task.assignee.name}</span>
                        {isAssignedToMe && (
                          <span className="text-xs text-blue-600">(You)</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Unassigned</span>
                    )}
                  </div>
                </div>

                {/* Due Date */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Due Date</label>
                  <div className="mt-1">
                    {task.dueDate ? (
                      <div className={cn(
                        "flex items-center space-x-1",
                        isOverdue ? "text-red-600" : "text-gray-600"
                      )}>
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{formatDate(task.dueDate)}</span>
                        {isOverdue && <AlertTriangle className="h-4 w-4" />}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No due date</span>
                    )}
                  </div>
                </div>

                {/* Time Tracking */}
                {(task.estimatedHours || task.actualHours) && (
                  <>
                    {task.estimatedHours && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Estimated Hours</label>
                        <div className="mt-1">
                          <div className="flex items-center space-x-1 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">{task.estimatedHours}h</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {task.actualHours && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Actual Hours</label>
                        <div className="mt-1">
                          <div className="flex items-center space-x-1 text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">{task.actualHours}h</span>
                            {task.estimatedHours && (
                              <span className={`text-xs ${
                                task.actualHours > task.estimatedHours ? 'text-red-600' : 'text-green-600'
                              }`}>
                                ({task.actualHours > task.estimatedHours ? '+' : ''}{task.actualHours - task.estimatedHours}h)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Created By */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Created By</label>
                  <div className="mt-1">
                    {task?.creator ? (
                      <div className="flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={task.creator.image} />
                          <AvatarFallback className="text-xs">
                            {task.creator.name?.charAt(0) || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-900 truncate">{task.creator.name || task.creator.email || 'Unknown'}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Unknown</span>
                    )}
                  </div>
                </div>

                {/* Created Date */}
                <div>
                  <label className="text-sm font-medium text-gray-700">Created</label>
                  <div className="mt-1">
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">{formatDate(task?.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parent Task */}
            {task?.parent && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Parent Task</CardTitle>
                </CardHeader>
                <CardContent>
                  <button
                    onClick={() => router.push(`/${organizationSlug}/tasks/${task.parent.id}`)}
                    className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                      task.parent.status === 'DONE' ? 'bg-green-500' :
                      task.parent.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                      task.parent.status === 'BLOCKED' ? 'bg-red-500' :
                      'bg-gray-300'
                    }`} />
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {task.parent.title || 'Untitled Parent Task'}
                      </p>
                    </div>
                    <ArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
                  </button>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions - Mobile */}
            <Card className="sm:hidden">
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => router.push(`/${organizationSlug}/projects/${task?.project?.id}`)}
                    className="flex items-center justify-center"
                    disabled={!task?.project?.id}
                  >
                    <FolderKanban className="h-4 w-4 mr-1" />
                    Project
                  </Button>
                  {canEdit && (
                    <Button size="sm" variant="outline" onClick={handleEdit}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Task Stats - Desktop */}
            <Card className="hidden sm:block">
              <CardHeader>
                <CardTitle className="text-base">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completion</span>
                  <span className="text-sm font-medium">{subtaskProgress}%</span>
                </div>
                
                {task?.subtasks && task.subtasks.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Subtasks</span>
                    <span className="text-sm font-medium">
                      {task.subtasks.filter((st: any) => st?.status === 'DONE').length}/{task.subtasks.length}
                    </span>
                  </div>
                )}
                
                {comments.length > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Comments</span>
                    <span className="text-sm font-medium">{comments.length}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm font-medium">{formatDate(task?.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
