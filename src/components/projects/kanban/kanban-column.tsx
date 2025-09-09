'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import TaskCard from './task-card'

interface KanbanColumnProps {
  column: {
    id: string
    title: string
    color: string
    headerColor: string
    description: string
  }
  tasks: any[]
  canEdit: boolean
  isLoading: boolean
  onAddTask: () => void
  onEditTask: (task: any) => void
}

export default function KanbanColumn({
  column,
  tasks,
  canEdit,
  isLoading,
  onAddTask,
  onEditTask
}: KanbanColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: column.id,
  })

  const taskIds = tasks.map(task => task.id)

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <Card className={`${column.color} border-2 mb-4`}>
        <CardHeader className={`${column.headerColor} rounded-t-lg p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm">{column.title}</h3>
              <p className="text-xs opacity-75">{column.description}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="bg-white/20 text-xs px-2 py-1 rounded-full font-medium">
                {tasks.length}
              </span>
              {canEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onAddTask}
                  className="h-6 w-6 p-0 hover:bg-white/20"
                  disabled={isLoading}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Drop Zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[400px] p-2 rounded-lg transition-colors ${
          isOver ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : 'bg-gray-50/50'
        }`}
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                canEdit={canEdit}
                onEdit={onEditTask}
              />
            ))}
            
            {tasks.length === 0 && !isOver && (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                  <Plus className="h-6 w-6" />
                </div>
                <p className="text-sm">No tasks</p>
                {canEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onAddTask}
                    className="mt-2 text-xs"
                    disabled={isLoading}
                  >
                    Add first task
                  </Button>
                )}
              </div>
            )}
            
            {isOver && tasks.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-blue-500">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <Plus className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium">Drop task here</p>
              </div>
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  )
}
