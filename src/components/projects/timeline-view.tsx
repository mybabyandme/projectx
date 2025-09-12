'use client'

import { useState, useMemo } from 'react'
import { 
  Calendar, Filter, Clock, Target, Users, ChevronLeft, ChevronRight,
  Play, Pause, CheckCircle, AlertTriangle, MoreVertical, Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatDate } from '@/lib/utils'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, isBefore, isAfter } from 'date-fns'

interface TimelineViewProps {
  project: any
  organizationSlug: string
  userRole: string
  permissions: any
}

type ViewMode = 'month' | 'quarter' | 'year'

interface TimelineEvent {
  id: string
  title: string
  description?: string
  date: Date
  type: 'milestone' | 'task_due' | 'phase_start' | 'phase_end' | 'sprint' | 'meeting'
  status: 'completed' | 'active' | 'upcoming' | 'overdue'
  project?: string
  assignee?: any
  metadata?: any
}

export default function TimelineView({
  project,
  organizationSlug,
  userRole,
  permissions
}: TimelineViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [selectedEventType, setSelectedEventType] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Generate timeline events from project data
  const timelineEvents = useMemo((): TimelineEvent[] => {
    const events: TimelineEvent[] = []
    const now = new Date()

    // Add task due dates
    if (project.tasks) {
      project.tasks.forEach((task: any) => {
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate)
          const isOverdue = isBefore(dueDate, now) && task.status !== 'DONE'
          
          events.push({
            id: `task-${task.id}`,
            title: task.title,
            description: task.description,
            date: dueDate,
            type: 'task_due',
            status: task.status === 'DONE' ? 'completed' : 
                   isOverdue ? 'overdue' : 
                   task.status === 'IN_PROGRESS' ? 'active' : 'upcoming',
            assignee: task.assignee,
            metadata: { priority: task.priority, taskId: task.id }
          })
        }
      })
    }

    // Add project phases
    if (project.phases) {
      project.phases.forEach((phase: any) => {
        if (phase.startDate) {
          events.push({
            id: `phase-start-${phase.id}`,
            title: `${phase.name} - Start`,
            description: phase.description,
            date: new Date(phase.startDate),
            type: 'phase_start',
            status: phase.status === 'COMPLETED' ? 'completed' : 
                   phase.status === 'IN_PROGRESS' ? 'active' : 'upcoming',
            metadata: { phaseId: phase.id }
          })
        }
        
        if (phase.endDate) {
          events.push({
            id: `phase-end-${phase.id}`,
            title: `${phase.name} - End`,
            description: phase.description,
            date: new Date(phase.endDate),
            type: 'phase_end',
            status: phase.status === 'COMPLETED' ? 'completed' : 
                   phase.status === 'IN_PROGRESS' ? 'active' : 'upcoming',
            metadata: { phaseId: phase.id }
          })
        }
      })
    }

    // Add project milestones (if stored in project metadata)
    if (project.metadata?.milestones) {
      project.metadata.milestones.forEach((milestone: any) => {
        events.push({
          id: `milestone-${milestone.id}`,
          title: milestone.name,
          description: milestone.description,
          date: new Date(milestone.date),
          type: 'milestone',
          status: milestone.completed ? 'completed' : 
                 isBefore(new Date(milestone.date), now) ? 'overdue' : 'upcoming',
          metadata: milestone
        })
      })
    }

    // Add sprint events for Agile projects
    if (project.methodology === 'AGILE' || project.methodology === 'SCRUM') {
      // Mock sprint data - replace with actual sprint data
      const sprintEvents = [
        {
          id: 'sprint-1-start',
          title: 'Sprint 1 - Start',
          date: new Date(project.startDate || Date.now()),
          type: 'sprint' as const,
          status: 'completed' as const
        },
        {
          id: 'sprint-1-end',
          title: 'Sprint 1 - End',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          type: 'sprint' as const,
          status: 'active' as const
        }
      ]
      events.push(...sprintEvents)
    }

    // Sort events by date
    return events.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [project])

  // Filter events based on selected criteria
  const filteredEvents = useMemo(() => {
    let filtered = timelineEvents

    if (selectedEventType !== 'all') {
      filtered = filtered.filter(event => event.type === selectedEventType)
    }

    // Filter by current view period
    const viewStart = startOfMonth(currentDate)
    const viewEnd = endOfMonth(currentDate)
    
    if (viewMode === 'month') {
      filtered = filtered.filter(event => 
        isWithinInterval(event.date, { start: viewStart, end: viewEnd })
      )
    }

    return filtered
  }, [timelineEvents, selectedEventType, currentDate, viewMode])

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'milestone': return Target
      case 'task_due': return CheckCircle
      case 'phase_start': 
      case 'phase_end': return Play
      case 'sprint': return Calendar
      case 'meeting': return Users
      default: return Clock
    }
  }

  const getEventColor = (status: string, type: string) => {
    if (status === 'overdue') return 'bg-red-50 border-red-200 text-red-800'
    if (status === 'completed') return 'bg-green-50 border-green-200 text-green-800'
    if (status === 'active') return 'bg-blue-50 border-blue-200 text-blue-800'
    
    switch (type) {
      case 'milestone': return 'bg-purple-50 border-purple-200 text-purple-800'
      case 'phase_start': 
      case 'phase_end': return 'bg-orange-50 border-orange-200 text-orange-800'
      case 'sprint': return 'bg-blue-50 border-blue-200 text-blue-800'
      default: return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    )
  }

  const eventTypes = [
    { value: 'all', label: 'All Events' },
    { value: 'milestone', label: 'Milestones' },
    { value: 'task_due', label: 'Task Due Dates' },
    { value: 'phase_start', label: 'Phase Starts' },
    { value: 'phase_end', label: 'Phase Ends' },
    ...(project.methodology === 'AGILE' || project.methodology === 'SCRUM' 
      ? [{ value: 'sprint', label: 'Sprints' }] 
      : [])
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Project Timeline</h2>
          <p className="mt-1 text-gray-600">
            View project milestones, deadlines, and key events for {project.name}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as ViewMode)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="month">Month View</option>
            <option value="quarter">Quarter View</option>
            <option value="year">Year View</option>
          </select>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type
                </label>
                <select
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h3 className="text-lg font-medium">
            {format(currentDate, 'MMMM yyyy')}
          </h3>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>{filteredEvents.length} events</span>
          {filteredEvents.filter(e => e.status === 'overdue').length > 0 && (
            <Badge variant="destructive">
              {filteredEvents.filter(e => e.status === 'overdue').length} overdue
            </Badge>
          )}
        </div>
      </div>

      {/* Timeline Content */}
      {filteredEvents.length > 0 ? (
        <div className="space-y-4">
          {/* Calendar Grid for Month View */}
          {viewMode === 'month' && (
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {eachDayOfInterval({
                    start: startOfMonth(currentDate),
                    end: endOfMonth(currentDate)
                  }).map(day => {
                    const dayEvents = filteredEvents.filter(event => 
                      isSameDay(event.date, day)
                    )
                    
                    return (
                      <div
                        key={day.toISOString()}
                        className={`min-h-24 p-2 border border-gray-200 rounded ${
                          isSameDay(day, new Date()) ? 'bg-blue-50' : 'bg-white'
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-900 mb-1">
                          {format(day, 'd')}
                        </div>
                        
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map(event => {
                            const IconComponent = getEventIcon(event.type)
                            return (
                              <div
                                key={event.id}
                                className={`text-xs p-1 rounded border ${getEventColor(event.status, event.type)}`}
                              >
                                <div className="flex items-center space-x-1">
                                  <IconComponent className="h-3 w-3" />
                                  <span className="truncate">{event.title}</span>
                                </div>
                              </div>
                            )
                          })}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* List View for All Modes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline Events</CardTitle>
              <CardDescription>
                Chronological view of project events and milestones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEvents.map((event, index) => {
                  const IconComponent = getEventIcon(event.type)
                  const isLast = index === filteredEvents.length - 1
                  
                  return (
                    <div key={event.id} className="flex items-start space-x-4">
                      {/* Timeline line */}
                      <div className="flex flex-col items-center">
                        <div className={`p-2 rounded-full border-2 ${getEventColor(event.status, event.type)}`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        {!isLast && (
                          <div className="w-px h-12 bg-gray-200 mt-2"></div>
                        )}
                      </div>
                      
                      {/* Event content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium text-gray-900">{event.title}</h4>
                              <Badge className={getEventColor(event.status, event.type)}>
                                {event.type.replace('_', ' ')}
                              </Badge>
                              {event.status === 'overdue' && (
                                <Badge variant="destructive">Overdue</Badge>
                              )}
                            </div>
                            
                            {event.description && (
                              <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                            )}
                            
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(event.date)}</span>
                              </div>
                              
                              {event.assignee && (
                                <div className="flex items-center space-x-1">
                                  <Users className="h-4 w-4" />
                                  <span>{event.assignee.name}</span>
                                </div>
                              )}
                              
                              {event.metadata?.priority && (
                                <Badge variant="outline" className="text-xs">
                                  {event.metadata.priority} priority
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
            <p className="text-gray-600 mb-4">
              No timeline events found for the selected period and filters.
            </p>
            <Button onClick={() => setSelectedEventType('all')}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Project Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project Progress Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Overall Progress</span>
                <span className="text-sm font-medium text-gray-900">
                  {project.metrics?.taskCompletionRate?.toFixed(1) || 0}%
                </span>
              </div>
              <Progress value={project.metrics?.taskCompletionRate || 0} />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Budget Utilization</span>
                <span className="text-sm font-medium text-gray-900">
                  {project.metrics?.budgetUtilization?.toFixed(1) || 0}%
                </span>
              </div>
              <Progress value={project.metrics?.budgetUtilization || 0} />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">Time Progress</span>
                <span className="text-sm font-medium text-gray-900">
                  {project.startDate && project.endDate ? 
                    Math.round(((new Date().getTime() - new Date(project.startDate).getTime()) / 
                               (new Date(project.endDate).getTime() - new Date(project.startDate).getTime())) * 100) : 0}%
                </span>
              </div>
              <Progress 
                value={project.startDate && project.endDate ? 
                  Math.round(((new Date().getTime() - new Date(project.startDate).getTime()) / 
                             (new Date(project.endDate).getTime() - new Date(project.startDate).getTime())) * 100) : 0
                } 
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}