'use client'

import { useState, useMemo, useRef } from 'react'
import { 
  Calendar, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  MoreVertical, User, Clock, AlertTriangle, Target, Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatDate } from '@/lib/utils'
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval } from 'date-fns'

interface GanttViewProps {
  project: any
  tasks: any[]
  onTaskClick?: (task: any) => void
  onTaskUpdate?: (taskId: string, updates: any) => void
}

type ViewMode = 'days' | 'weeks' | 'months'

const TASK_STATUS_COLORS = {
  TODO: '#6B7280',
  IN_PROGRESS: '#3B82F6', 
  IN_REVIEW: '#F59E0B',
  DONE: '#10B981',
  BLOCKED: '#EF4444'
}

const TASK_PRIORITY_COLORS = {
  LOW: '#10B981',
  MEDIUM: '#F59E0B', 
  HIGH: '#F97316',
  CRITICAL: '#EF4444'
}

export default function GanttView({
  project,
  tasks,
  onTaskClick,
  onTaskUpdate
}: GanttViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('weeks')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedTasks, setSelectedTasks] = useState<string[]>([])
  const [showCriticalPath, setShowCriticalPath] = useState(false)
  
  // Calculate date range based on project and tasks
  const dateRange = useMemo(() => {
    const taskDates = tasks
      .filter(task => task.startDate || task.dueDate)
      .flatMap(task => [task.startDate, task.dueDate])
      .filter(Boolean)
      .map(date => new Date(date))
    
    const projectStart = project.startDate ? new Date(project.startDate) : null
    const projectEnd = project.endDate ? new Date(project.endDate) : null
    
    const allDates = [...taskDates]
    if (projectStart) allDates.push(projectStart)
    if (projectEnd) allDates.push(projectEnd)
    
    if (allDates.length === 0) {
      // Default to current month if no dates
      return {
        start: startOfMonth(currentDate),
        end: endOfMonth(addDays(currentDate, 90))
      }
    }
    
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())))
    
    // Add padding
    return {
      start: addDays(minDate, -7),
      end: addDays(maxDate, 14)
    }
  }, [tasks, project, currentDate])

  // Generate time periods based on view mode
  const timePeriods = useMemo(() => {
    const periods = []
    const { start, end } = dateRange
    
    if (viewMode === 'days') {
      const days = eachDayOfInterval({ start, end })
      return days.map(day => ({
        date: day,
        label: format(day, 'dd'),
        fullLabel: format(day, 'MMM dd'),
        isWeekend: day.getDay() === 0 || day.getDay() === 6
      }))
    } else if (viewMode === 'weeks') {
      let current = start
      while (current <= end) {
        periods.push({
          date: current,
          label: format(current, 'MMM dd'),
          fullLabel: format(current, 'MMM dd, yyyy'),
          isWeekend: false
        })
        current = addDays(current, 7)
      }
    } else {
      let current = startOfMonth(start)
      while (current <= end) {
        periods.push({
          date: current,
          label: format(current, 'MMM'),
          fullLabel: format(current, 'MMMM yyyy'),
          isWeekend: false
        })
        current = addDays(current, 30)
      }
    }
    
    return periods
  }, [dateRange, viewMode])

  // Calculate task bar position and width
  const getTaskBarStyle = (task: any) => {
    if (!task.startDate || !task.dueDate) return null
    
    const taskStart = new Date(task.startDate)
    const taskEnd = new Date(task.dueDate)
    const { start, end } = dateRange
    
    const totalDuration = end.getTime() - start.getTime()
    const taskStartOffset = taskStart.getTime() - start.getTime()
    const taskDuration = taskEnd.getTime() - taskStart.getTime()
    
    const leftPercent = Math.max(0, (taskStartOffset / totalDuration) * 100)
    const widthPercent = Math.min(100 - leftPercent, (taskDuration / totalDuration) * 100)
    
    if (widthPercent <= 0) return null
    
    return {
      left: `${leftPercent}%`,
      width: `${widthPercent}%`
    }
  }

  // Get task progress percentage
  const getTaskProgress = (task: any) => {
    if (task.status === 'DONE') return 100
    if (task.status === 'TODO') return 0
    if (task.status === 'IN_PROGRESS') return 50
    if (task.status === 'IN_REVIEW') return 75
    if (task.status === 'BLOCKED') return 25
    return 0
  }

  // Sort tasks by hierarchy (parents first, then children)
  const sortedTasks = useMemo(() => {
    const taskMap = new Map(tasks.map(task => [task.id, task]))
    const rootTasks = tasks.filter(task => !task.parentId)
    const result: any[] = []
    
    const addTaskAndChildren = (task: any, level = 0) => {
      result.push({ ...task, level })
      const children = tasks.filter(t => t.parentId === task.id)
      children.forEach(child => addTaskAndChildren(child, level + 1))
    }
    
    rootTasks.forEach(task => addTaskAndChildren(task))
    return result
  }, [tasks])

  return (
    <div className="space-y-4">
      {/* Gantt Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Project Timeline
              </CardTitle>
              <CardDescription>
                Gantt chart view of project tasks and dependencies
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCriticalPath(!showCriticalPath)}
              >
                <Target className="h-4 w-4 mr-2" />
                Critical Path
              </Button>
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                {(['days', 'weeks', 'months'] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                      viewMode === mode ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Gantt Chart */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Timeline Header */}
              <div className="flex border-b border-gray-200">
                <div className="w-80 p-4 bg-gray-50 border-r border-gray-200">
                  <div className="font-semibold text-gray-900">Task</div>
                </div>
                <div className="flex-1 bg-gray-50">
                  <div className="flex">
                    {timePeriods.map((period, index) => (
                      <div
                        key={index}
                        className={`flex-1 p-2 text-center border-r border-gray-200 text-sm font-medium ${
                          period.isWeekend ? 'bg-gray-100' : ''
                        }`}
                        style={{ minWidth: '80px' }}
                      >
                        {period.label}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Task Rows */}
              <div className="divide-y divide-gray-200">
                {sortedTasks.map((task) => {
                  const barStyle = getTaskBarStyle(task)
                  const progress = getTaskProgress(task)
                  const isSelected = selectedTasks.includes(task.id)
                  
                  return (
                    <div key={task.id} className="flex hover:bg-gray-50">
                      {/* Task Info */}
                      <div className="w-80 p-4 border-r border-gray-200">
                        <div className="flex items-center space-x-2">
                          <div style={{ marginLeft: `${task.level * 16}px` }}>
                            <button
                              onClick={() => onTaskClick?.(task)}
                              className="flex items-center space-x-2 text-left hover:text-blue-600"
                            >
                              <div
                                className="w-3 h-3 rounded"
                                style={{ backgroundColor: TASK_STATUS_COLORS[task.status as keyof typeof TASK_STATUS_COLORS] }}
                              />
                              <span className="font-medium text-sm truncate">
                                {task.title}
                              </span>
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-1 flex items-center space-x-3 text-xs text-gray-500">
                          {task.assignee && (
                            <div className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              <span>{task.assignee.name}</span>
                            </div>
                          )}
                          {task.estimatedHours && (
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>{task.estimatedHours}h</span>
                            </div>
                          )}
                          {task.priority === 'HIGH' || task.priority === 'CRITICAL' && (
                            <div className="flex items-center">
                              <AlertTriangle className="h-3 w-3 mr-1 text-orange-500" />
                              <span>{task.priority}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Timeline */}
                      <div className="flex-1 relative">
                        <div className="h-16 relative border-r border-gray-100">
                          {/* Weekend columns */}
                          {timePeriods.map((period, index) => (
                            <div
                              key={index}
                              className={`absolute top-0 bottom-0 ${
                                period.isWeekend ? 'bg-gray-50' : ''
                              }`}
                              style={{
                                left: `${(index / timePeriods.length) * 100}%`,
                                width: `${100 / timePeriods.length}%`
                              }}
                            />
                          ))}
                          
                          {/* Task Bar */}
                          {barStyle && (
                            <div
                              className="absolute top-1/2 transform -translate-y-1/2 h-6 rounded cursor-pointer group"
                              style={{
                                ...barStyle,
                                backgroundColor: TASK_STATUS_COLORS[task.status as keyof typeof TASK_STATUS_COLORS],
                                opacity: isSelected ? 1 : 0.8
                              }}
                              onClick={() => {
                                if (selectedTasks.includes(task.id)) {
                                  setSelectedTasks(prev => prev.filter(id => id !== task.id))
                                } else {
                                  setSelectedTasks(prev => [...prev, task.id])
                                }
                              }}
                            >
                              {/* Progress Bar */}
                              <div
                                className="h-full bg-white/30 rounded-l"
                                style={{ width: `${progress}%` }}
                              />
                              
                              {/* Task Label */}
                              <div className="absolute inset-0 flex items-center px-2">
                                <span className="text-white text-xs font-medium truncate">
                                  {task.title}
                                </span>
                              </div>
                              
                              {/* Hover tooltip */}
                              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block">
                                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                                  {task.title} - {progress}% complete
                                  <br />
                                  {task.startDate && formatDate(task.startDate)} → {task.dueDate && formatDate(task.dueDate)}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Milestone markers */}
                          {task.status === 'DONE' && barStyle && (
                            <div
                              className="absolute top-1/2 transform -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
                              style={{ left: `calc(${barStyle.left} + ${barStyle.width} - 6px)` }}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gantt Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="text-sm font-medium text-gray-700">Status:</div>
              {Object.entries(TASK_STATUS_COLORS).map(([status, color]) => (
                <div key={status} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-gray-600">
                    {status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <span>Milestone</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-8 h-2 bg-blue-500 rounded relative">
                  <div className="w-3 h-2 bg-white/30 rounded-l" />
                </div>
                <span>Progress</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task Details Panel */}
      {selectedTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Selected Tasks ({selectedTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {selectedTasks.map(taskId => {
                const task = tasks.find(t => t.id === taskId)
                if (!task) return null
                
                return (
                  <div key={taskId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{task.title}</div>
                      <div className="text-sm text-gray-600">
                        {task.startDate && task.dueDate && 
                          `${formatDate(task.startDate)} - ${formatDate(task.dueDate)}`
                        }
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={getTaskProgress(task)} className="w-20" />
                      <span className="text-sm text-gray-600">{getTaskProgress(task)}%</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedTasks(prev => prev.filter(id => id !== taskId))}
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
