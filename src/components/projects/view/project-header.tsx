'use client'

import { 
  ArrowLeft, Edit, MoreVertical, Calendar, Users, Target, 
  AlertTriangle, DollarSign, TrendingUp, Building, MapPin,
  Activity, CheckCircle, Clock, BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate, formatCurrency } from '@/lib/utils'

interface ProjectHeaderProps {
  project: any
  organizationSlug: string
  userRole: string
  permissions: {
    canEdit: boolean
    canViewFinancials: boolean
    canCreateReports: boolean
    canApproveReports: boolean
    canManageTasks: boolean
  }
  onBack: () => void
  onEdit?: () => void
  isGovernmentProject: boolean
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active': return 'bg-green-100 text-green-800 border-green-200'
    case 'planning': return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'on_hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'completed': return 'bg-purple-100 text-purple-800 border-purple-200'
    case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getHealthColor = (health: string) => {
  switch (health) {
    case 'GREEN': return 'bg-green-100 text-green-800 border-green-200'
    case 'YELLOW': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'RED': return 'bg-red-100 text-red-800 border-red-200'
    default: return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getProgressColor = (percentage: number) => {
  if (percentage >= 80) return 'bg-green-500'
  if (percentage >= 60) return 'bg-blue-500'
  if (percentage >= 40) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getMethodologyIcon = (methodology: string) => {
  switch (methodology) {
    case 'AGILE': return '🔄'
    case 'WATERFALL': return '📋'
    case 'HYBRID': return '🔀'
    case 'KANBAN': return '📊'
    case 'SCRUM': return '🏃'
    default: return '📁'
  }
}

export default function ProjectHeader({
  project,
  organizationSlug,
  userRole,
  permissions,
  onBack,
  onEdit,
  isGovernmentProject
}: ProjectHeaderProps) {
  const metrics = project.metrics || {}
  const pqgData = project.pqgData

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="py-3">
          <button
            onClick={onBack}
            className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Projects
          </button>
        </div>

        {/* Main Header */}
        <div className="py-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Project Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-2xl">{getMethodologyIcon(project.methodology)}</span>
                <h1 className="text-2xl font-bold text-gray-900 truncate">
                  {project.name}
                </h1>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                  {project.status.replace('_', ' ')}
                </span>
                {metrics.overallHealth && (
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getHealthColor(metrics.overallHealth)}`}>
                    {metrics.overallHealth === 'GREEN' ? '✅ Healthy' :
                     metrics.overallHealth === 'YELLOW' ? '⚠️ At Risk' : '🚨 Critical'}
                  </span>
                )}
              </div>
              
              {project.description && (
                <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
              )}

              {/* Project Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    {project.startDate && project.endDate
                      ? `${formatDate(new Date(project.startDate))} - ${formatDate(new Date(project.endDate))}`
                      : 'Dates not set'
                    }
                  </span>
                </div>
                
                <div className="flex items-center">
                  <Target className="h-4 w-4 mr-1" />
                  <span>{project.methodology}</span>
                </div>

                <div className="flex items-center">
                  <Activity className="h-4 w-4 mr-1" />
                  <span>Performance: {(metrics.taskCompletionRate || 0).toFixed(1)}%</span>
                </div>

                {permissions.canViewFinancials && metrics.totalBudget > 0 && (
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    <span>{formatCurrency(metrics.totalBudget)} budget</span>
                  </div>
                )}
              </div>

              {/* Government Project Info */}
              {isGovernmentProject && pqgData && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <Building className="h-4 w-4 text-blue-600 mr-2" />
                    <span className="font-medium text-blue-900">Government Project (PQG)</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    {pqgData.priority && (
                      <div>
                        <span className="text-blue-700 font-medium">Priority:</span>
                        <span className="text-blue-600 ml-1">Prioridade {pqgData.priority}</span>
                      </div>
                    )}
                    {pqgData.location && (
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 text-blue-600 mr-1" />
                        <span className="text-blue-600">{pqgData.location}</span>
                      </div>
                    )}
                    {pqgData.ugb && (
                      <div>
                        <span className="text-blue-700 font-medium">UGB:</span>
                        <span className="text-blue-600 ml-1">{pqgData.ugb}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                  <span className="text-sm font-medium text-gray-900">
                    {(metrics.taskCompletionRate || 0).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(metrics.taskCompletionRate || 0)}`}
                    style={{ width: `${Math.min(metrics.taskCompletionRate || 0, 100)}%` }}
                  />
                </div>
                {metrics.overdueTasks > 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    ⚠️ {metrics.overdueTasks} tasks overdue
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {permissions.canEdit && onEdit && (
                <Button onClick={onEdit} variant="outline" className="flex items-center">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Project
                </Button>
              )}
              
              <div className="relative">
                <Button variant="outline" size="sm">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Enhanced Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Tasks Metric */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-blue-900">Tasks</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {metrics.completedTasks || 0}/{metrics.totalTasks || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Phases Metric */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-900">Phases</p>
                  <p className="text-lg font-semibold text-green-600">
                    {metrics.completedPhases || 0}/{metrics.totalPhases || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Budget Metric */}
            {permissions.canViewFinancials && (
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-900">Budget</p>
                    <p className="text-lg font-semibold text-purple-600">
                      {(metrics.budgetUtilization || 0).toFixed(0)}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule Metric */}
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-orange-900">Schedule</p>
                  <p className="text-lg font-semibold text-orange-600">
                    {(metrics.schedulePerformance || 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Team Metric */}
            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-indigo-900">Team</p>
                  <p className="text-lg font-semibold text-indigo-600">
                    {project.team?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Reports Metric */}
            <div className="bg-teal-50 rounded-lg p-4">
              <div className="flex items-center">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-teal-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-teal-900">Reports</p>
                  <p className="text-lg font-semibold text-teal-600">
                    {metrics.approvedReports || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
