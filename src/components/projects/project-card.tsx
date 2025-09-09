'use client'

import { Calendar, Users, Target, AlertTriangle, TrendingUp, DollarSign, BarChart3, Clock } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ProjectCardProps {
  project: any
  onClick: () => void
  canViewFinancials: boolean
}

export default function ProjectCard({ project, onClick, canViewFinancials }: ProjectCardProps) {
  const completedTasks = project.tasks.filter((t: any) => t.status === 'DONE').length
  const totalTasks = project.tasks.length
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  
  const projectSpent = project.budgets.reduce((sum: number, b: any) => sum + b.spentAmount, 0)
  const projectBudget = project.budget || 0
  const budgetUtilization = projectBudget > 0 ? Math.round((projectSpent / projectBudget) * 100) : 0
  
  const overdueTasks = project.tasks.filter((t: any) => 
    t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE'
  ).length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200'
      case 'PLANNING': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'ON_HOLD': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'COMPLETED': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-blue-500'
    if (percentage >= 40) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-lg flex-shrink-0">
            {project.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-sm text-gray-500 line-clamp-2 mt-1">{project.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
            {project.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Priority and Template */}
      <div className="flex items-center space-x-2 mb-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(project.priority)}`}>
          {project.priority}
        </span>
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
          {project.methodology}
        </span>
        {project.template && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
            {project.template.replace('_', ' ')}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-900">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progressPercentage)}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
          <span>{completedTasks} of {totalTasks} tasks</span>
          {overdueTasks > 0 && (
            <span className="text-red-600 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {overdueTasks} overdue
            </span>
          )}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center">
            <BarChart3 className="h-4 w-4 text-blue-600 mr-2" />
            <div>
              <p className="text-xs text-gray-500">Phases</p>
              <p className="text-sm font-semibold text-gray-900">{project.phases.length}</p>
            </div>
          </div>
        </div>

        {canViewFinancials ? (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-green-600 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Budget</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatCurrency(projectBudget, project.currency)}
                </p>
                {projectBudget > 0 && (
                  <p className={`text-xs ${
                    budgetUtilization > 90 ? 'text-red-600' :
                    budgetUtilization > 75 ? 'text-orange-600' :
                    'text-gray-500'
                  }`}>
                    {budgetUtilization}% used
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center">
              <Target className="h-4 w-4 text-purple-600 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Reports</p>
                <p className="text-sm font-semibold text-gray-900">{project.progressReports.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          <span>
            {project.startDate && project.endDate
              ? `${formatDate(project.startDate)} - ${formatDate(project.endDate)}`
              : project.startDate
              ? `Started ${formatDate(project.startDate)}`
              : 'Dates not set'
            }
          </span>
        </div>
        <div>
          Updated {formatDate(project.updatedAt)}
        </div>
      </div>

      {/* Alerts */}
      {(overdueTasks > 0 || project.priority === 'CRITICAL' || budgetUtilization > 90) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span className="text-xs text-orange-700 font-medium">
              {overdueTasks > 0 && `${overdueTasks} overdue tasks • `}
              {project.priority === 'CRITICAL' && 'Critical priority • '}
              {budgetUtilization > 90 && canViewFinancials && 'Budget nearly exhausted'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
