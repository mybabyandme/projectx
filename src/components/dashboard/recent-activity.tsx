'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { 
  Activity, CheckCircle2, Plus, Users, FolderKanban, 
  Clock, AlertTriangle, TrendingUp, RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ActivityItem {
  id: string
  type: 'task_completed' | 'task_created' | 'project_updated' | 'member_added' | 'deadline_approaching'
  title: string
  description?: string
  timestamp: string
  user?: {
    name: string
    email: string
  }
  metadata?: {
    projectName?: string
    taskTitle?: string
    priority?: string
  }
}

interface RecentActivityProps {
  orgSlug: string
  initialActivities?: ActivityItem[]
}

export default function RecentActivity({ orgSlug, initialActivities = [] }: RecentActivityProps) {
  const [activities, setActivities] = useState<ActivityItem[]>(initialActivities)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Simulate real-time activity generation (in production, this would come from WebSocket or API polling)
  const generateMockActivity = (): ActivityItem => {
    const types: ActivityItem['type'][] = [
      'task_completed', 'task_created', 'project_updated', 'member_added', 'deadline_approaching'
    ]
    const randomType = types[Math.floor(Math.random() * types.length)]
    
    const mockActivities = {
      task_completed: {
        title: 'Task completed',
        description: 'Finished implementing user authentication',
        metadata: { projectName: 'Platform Development', taskTitle: 'User Auth Implementation' }
      },
      task_created: {
        title: 'New task created',
        description: 'Setup CI/CD pipeline for deployment',
        metadata: { projectName: 'Infrastructure', priority: 'HIGH' }
      },
      project_updated: {
        title: 'Project milestone reached',
        description: 'Phase 1 completed successfully',
        metadata: { projectName: 'Mobile App Development' }
      },
      member_added: {
        title: 'New team member joined',
        description: 'Sarah Johnson joined as Project Manager',
        user: { name: 'Sarah Johnson', email: 'sarah@example.com' }
      },
      deadline_approaching: {
        title: 'Deadline approaching',
        description: 'Database migration due in 2 days',
        metadata: { projectName: 'System Upgrade', priority: 'CRITICAL' }
      }
    }

    return {
      id: `activity_${Date.now()}_${Math.random()}`,
      type: randomType,
      timestamp: new Date().toISOString(),
      user: { name: 'John Doe', email: 'john@example.com' },
      ...mockActivities[randomType]
    }
  }

  const refreshActivities = async () => {
    setIsLoading(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // In production, this would be an actual API call
      const newActivity = generateMockActivity()
      setActivities(prev => [newActivity, ...prev.slice(0, 9)]) // Keep only 10 most recent
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to refresh activities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refreshActivities()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case 'task_created':
        return <Plus className="h-4 w-4 text-blue-600" />
      case 'project_updated':
        return <FolderKanban className="h-4 w-4 text-purple-600" />
      case 'member_added':
        return <Users className="h-4 w-4 text-orange-600" />
      case 'deadline_approaching':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'task_completed':
        return 'border-l-green-500 bg-green-50'
      case 'task_created':
        return 'border-l-blue-500 bg-blue-50'
      case 'project_updated':
        return 'border-l-purple-500 bg-purple-50'
      case 'member_added':
        return 'border-l-orange-500 bg-orange-50'
      case 'deadline_approaching':
        return 'border-l-red-500 bg-red-50'
      default:
        return 'border-l-gray-500 bg-gray-50'
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-800'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800'
      case 'LOW':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <p className="text-sm text-gray-600">
            Last updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshActivities}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div
              key={activity.id}
              className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-sm ${getActivityColor(activity.type)}`}
            >
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-white rounded-full shadow-sm">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">
                      {activity.title}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                    </span>
                  </div>
                  
                  {activity.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {activity.description}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-3 mt-2">
                    {activity.user && (
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                          {activity.user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-600">{activity.user.name}</span>
                      </div>
                    )}
                    
                    {activity.metadata?.projectName && (
                      <span className="text-xs text-gray-500">
                        in {activity.metadata.projectName}
                      </span>
                    )}
                    
                    {activity.metadata?.priority && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(activity.metadata.priority)}`}>
                        {activity.metadata.priority}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Activity className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No recent activity</p>
            <p className="text-xs text-gray-500 mt-1">
              Activity will appear here as your team works on projects
            </p>
          </div>
        )}
      </div>

      {/* Load more button for larger activity lists */}
      {activities.length >= 10 && (
        <div className="text-center pt-4">
          <Button variant="outline" size="sm">
            View All Activity
          </Button>
        </div>
      )}
    </div>
  )
}
