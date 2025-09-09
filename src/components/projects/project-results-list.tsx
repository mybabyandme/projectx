'use client'

import { useState } from 'react'
import { Grid3X3, List, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ProjectCard from './project-card'

interface ProjectResultsListProps {
  projects: any[]
  viewMode: 'list' | 'card'
  onViewModeChange: (mode: 'list' | 'card') => void
  onProjectClick: (project: any) => void
  canViewFinancials: boolean
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: {
    label: string
    onClick: () => void
  }
}

export default function ProjectResultsList({
  projects,
  viewMode,
  onViewModeChange,
  onProjectClick,
  canViewFinancials,
  emptyTitle = "No projects found",
  emptyDescription = "Try adjusting your search or filters",
  emptyAction
}: ProjectResultsListProps) {
  const [hoveredProject, setHoveredProject] = useState<string | null>(null)

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Grid3X3 className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyTitle}</h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">{emptyDescription}</p>
        {emptyAction && (
          <Button onClick={emptyAction.onClick}>
            {emptyAction.label}
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <p className="text-sm text-gray-600">
            Showing {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('card')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'card'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => onProjectClick(project)}
              canViewFinancials={canViewFinancials}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Methodology
                  </th>
                  {canViewFinancials && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Budget
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {projects.map((project) => {
                  const completedTasks = project.tasks.filter((t: any) => t.status === 'DONE').length
                  const totalTasks = project.tasks.length
                  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
                  
                  const projectSpent = project.budgets.reduce((sum: number, b: any) => sum + b.spentAmount, 0)
                  const projectBudget = project.budget || 0
                  const budgetUtilization = projectBudget > 0 ? Math.round((projectSpent / projectBudget) * 100) : 0

                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case 'ACTIVE': return 'bg-green-100 text-green-800'
                      case 'PLANNING': return 'bg-blue-100 text-blue-800'
                      case 'ON_HOLD': return 'bg-yellow-100 text-yellow-800'
                      case 'COMPLETED': return 'bg-purple-100 text-purple-800'
                      case 'CANCELLED': return 'bg-red-100 text-red-800'
                      default: return 'bg-gray-100 text-gray-800'
                    }
                  }

                  const getPriorityColor = (priority: string) => {
                    switch (priority) {
                      case 'CRITICAL': return 'bg-red-100 text-red-800'
                      case 'HIGH': return 'bg-orange-100 text-orange-800'
                      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
                      case 'LOW': return 'bg-green-100 text-green-800'
                      default: return 'bg-gray-100 text-gray-800'
                    }
                  }

                  return (
                    <tr
                      key={project.id}
                      onClick={() => onProjectClick(project)}
                      onMouseEnter={() => setHoveredProject(project.id)}
                      onMouseLeave={() => setHoveredProject(null)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
                              {project.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{project.name}</div>
                            {project.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {project.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700">{progressPercentage}%</span>
                            <span className="text-xs text-gray-500">{completedTasks}/{totalTasks}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                progressPercentage >= 80 ? 'bg-green-500' :
                                progressPercentage >= 60 ? 'bg-blue-500' :
                                progressPercentage >= 40 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(project.priority)}`}>
                          {project.priority}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {project.methodology}
                        </span>
                      </td>
                      
                      {canViewFinancials && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">
                              {projectBudget > 0 ? `${project.currency || 'USD'} ${projectBudget.toLocaleString()}` : 'Not set'}
                            </div>
                            {projectBudget > 0 && (
                              <div className={`text-xs ${
                                budgetUtilization > 90 ? 'text-red-600' :
                                budgetUtilization > 75 ? 'text-orange-600' :
                                'text-gray-500'
                              }`}>
                                {budgetUtilization}% used
                              </div>
                            )}
                          </div>
                        </td>
                      )}
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            // Handle actions menu
                          }}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
