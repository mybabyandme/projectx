'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  User, Calendar, Clock, AlertTriangle, MoreVertical, 
  Paperclip, MessageSquare, CheckCircle2 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils'

interface TaskCardProps {
  task: any
  canEdit: boolean
  isDragging?: boolean
  onEdit: (task: any) => void
}

const PRIORITY_COLORS = {
  LOW: 'border-l-green-500',
  MEDIUM: 'border-l-yellow-500',
  HIGH: 'border-l-orange-500',
  CRITICAL: 'border-l-red-500'
}

const STATUS_COLORS = {
  TODO: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  IN_REVIEW: 'bg-yellow-100 text-yellow-800',
  DONE: 'bg-green-100 text-green-800',
  BLOCKED: 'bg-red-100 text-red-800'
}

export default function TaskCard({ 
  task, 
  canEdit, 
  isDragging = false, 
  onEdit 
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ 
    id: task.id,
    disabled: !canEdit || isDragging
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE'
  const priorityColor = PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS] || 'border-l-gray-500'

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        border-l-4 ${priorityColor} cursor-pointer hover:shadow-md transition-all duration-200
        ${isSortableDragging || isDragging ? 'opacity-50 rotate-2 shadow-lg' : ''}
        ${isOverdue ? 'ring-1 ring-red-300' : ''}
      `}
    >
      <CardContent className="p-3">
        {/* Task Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-gray-900 line-clamp-2 leading-tight">
              {task.title}
            </h4>
            {task.wbsCode && (
              <span className="text-xs text-gray-500 font-mono">
                {task.wbsCode}
              </span>
            )}
          </div>
          {canEdit && !isDragging && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(task)
              }}
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-gray-100"
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Task Description */}
        {task.description && (
          <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Task Meta */}
        <div className="space-y-2">
          {/* Assignee */}
          {task.assignee && (
            <div className="flex items-center space-x-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={task.assignee.image} />
                <AvatarFallback className="text-xs bg-blue-100 text-blue-600">
                  {task.assignee.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-gray-600 truncate">
                {task.assignee.name}
              </span>
            </div>
          )}

          {/* Due Date */}
          {task.dueDate && (
            <div className={`flex items-center space-x-1 text-xs ${
              isOverdue ? 'text-red-600' : 'text-gray-600'
            }`}>
              <Calendar className="h-3 w-3" />
              <span>{formatDate(task.dueDate)}</span>
              {isOverdue && <AlertTriangle className="h-3 w-3" />}
            </div>
          )}

          {/* Estimated Hours */}
          {task.estimatedHours && (
            <div className="flex items-center space-x-1 text-xs text-gray-600">
              <Clock className="h-3 w-3" />
              <span>{task.estimatedHours}h</span>
            </div>
          )}
        </div>

        {/* Task Footer */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
          {/* Priority Badge */}
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            task.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
            task.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
            task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {task.priority}
          </span>

          {/* Task Stats */}
          <div className="flex items-center space-x-2">
            {/* Subtasks count */}
            {task.subtasks && task.subtasks.length > 0 && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <CheckCircle2 className="h-3 w-3" />
                <span>
                  {task.subtasks.filter((st: any) => st.status === 'DONE').length}/{task.subtasks.length}
                </span>
              </div>
            )}

            {/* Comments count (placeholder for future) */}
            {task.metadata?.commentsCount && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <MessageSquare className="h-3 w-3" />
                <span>{task.metadata.commentsCount}</span>
              </div>
            )}

            {/* Attachments count (placeholder for future) */}
            {task.metadata?.attachmentsCount && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Paperclip className="h-3 w-3" />
                <span>{task.metadata.attachmentsCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Blocked indicator */}
        {task.status === 'BLOCKED' && (
          <div className="mt-2 flex items-center space-x-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
            <AlertTriangle className="h-3 w-3" />
            <span>Blocked</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
