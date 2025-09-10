'use client'

import { useState } from 'react'
import { 
  Activity, CheckCircle, AlertTriangle, Clock, 
  TrendingUp, Users, DollarSign, FileText, 
  Plus, Eye, Edit, MessageCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ProjectMonitoringProps {
  organizationSlug: string
  projects: Array<{
    id: string
    name: string
    status: string
    methodology: string
    description?: string
    createdAt: string
    updatedAt: string
    metrics: {
      totalTasks: number
      completedTasks: number
      overdueTasks: number
      taskCompletionRate: number
      totalBudget: number
      spentBudget: number
      budgetUtilization: number
      totalEstimatedHours: number
      totalActualHours: number
      schedulePerformance: number
      overallHealth: 'GREEN' | 'YELLOW' | 'RED'
    }
    pqgData?: {
      priority: string | null
      program: string | null
      indicators: Array<any>
      ugb: string | null
      interventionArea: string | null
      location: string | null
    } | null
    progressReports: Array<any>
  }>
  userRole: string
  canCreateReports: boolean
}

// Monitoring criteria based on best practices and methodology
const MONITORING_CRITERIA = {
  AGILE: [
    { key: 'sprint_velocity', name: 'Sprint Velocity', weight: 25 },
    { key: 'burndown_trend', name: 'Burndown Trend', weight: 25 },
    { key: 'team_satisfaction', name: 'Team Satisfaction', weight: 20 },
    { key: 'stakeholder_feedback', name: 'Stakeholder Feedback', weight: 30 }
  ],
  WATERFALL: [
    { key: 'milestone_adherence', name: 'Milestone Adherence', weight: 30 },
    { key: 'scope_control', name: 'Scope Control', weight: 25 },
    { key: 'quality_metrics', name: 'Quality Metrics', weight: 25 },
    { key: 'risk_management', name: 'Risk Management', weight: 20 }
  ],
  HYBRID: [
    { key: 'phase_delivery', name: 'Phase Delivery', weight: 25 },
    { key: 'iteration_success', name: 'Iteration Success', weight: 25 },
    { key: 'stakeholder_engagement', name: 'Stakeholder Engagement', weight: 25 },
    { key: 'adaptive_capacity', name: 'Adaptive Capacity', weight: 25 }
  ],
  // Government projects use MBR criteria
  GOVERNMENT: [
    { key: 'relevance', name: 'Relevância', weight: 18 },
    { key: 'efficiency', name: 'Eficiência', weight: 18 },
    { key: 'effectiveness', name: 'Eficácia', weight: 18 },
    { key: 'impact', name: 'Impacto', weight: 16 },
    { key: 'sustainability', name: 'Sustentabilidade', weight: 15 },
    { key: 'coordination', name: 'Coordenação', weight: 15 }
  ]
}

export default function ProjectMonitoring({
  organizationSlug,
  projects,
  userRole,
  canCreateReports
}: ProjectMonitoringProps) {
  const [selectedMethodology, setSelectedMethodology] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('health')

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      if (selectedMethodology !== 'all' && project.methodology !== selectedMethodology) return false
      if (selectedStatus !== 'all' && project.status !== selectedStatus) return false
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'health':
          const healthOrder = { 'RED': 0, 'YELLOW': 1, 'GREEN': 2 }
          return healthOrder[a.metrics.overallHealth] - healthOrder[b.metrics.overallHealth]
        case 'completion':
          return b.metrics.taskCompletionRate - a.metrics.taskCompletionRate
        case 'budget':
          return b.metrics.budgetUtilization - a.metrics.budgetUtilization
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'GREEN':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'YELLOW':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'RED':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'GREEN':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'YELLOW':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'RED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getMethodologyIcon = (methodology: string) => {
    switch (methodology) {
      case 'AGILE':
        return '🔄'
      case 'WATERFALL':
        return '📋'
      case 'HYBRID':
        return '🔀'
      case 'KANBAN':
        return '📊'
      case 'SCRUM':
        return '🏃'
      default:
        return '📁'
    }
  }

  const calculatePerformanceScore = (project: any) => {
    const criteria = MONITORING_CRITERIA[project.methodology as keyof typeof MONITORING_CRITERIA] || 
                    MONITORING_CRITERIA.HYBRID

    // In real implementation, these scores would come from actual evaluations
    // For now, we'll derive them from available metrics
    let totalScore = 0
    let totalWeight = 0

    criteria.forEach(criterion => {
      let score = 0
      
      // Map available metrics to monitoring criteria
      switch (criterion.key) {
        case 'milestone_adherence':
        case 'phase_delivery':
        case 'effectiveness':
          score = project.metrics.taskCompletionRate
          break
        case 'scope_control':
        case 'efficiency':
          score = Math.min(project.metrics.budgetUtilization, 100)
          break
        case 'sprint_velocity':
        case 'burndown_trend':
          score = project.metrics.schedulePerformance
          break
        case 'relevance':
        case 'impact':
        case 'sustainability':
          // These would come from qualitative assessments
          score = project.metrics.overallHealth === 'GREEN' ? 85 : 
                 project.metrics.overallHealth === 'YELLOW' ? 65 : 45
          break
        default:
          score = project.metrics.overallHealth === 'GREEN' ? 80 : 
                 project.metrics.overallHealth === 'YELLOW' ? 60 : 40
      }
      
      totalScore += score * (criterion.weight / 100)
      totalWeight += criterion.weight
    })

    return totalWeight > 0 ? totalScore : 0
  }

  const getRecommendations = (project: any) => {
    const recommendations = []
    
    if (project.metrics.overdueTasks > 0) {
      recommendations.push({
        type: 'warning',
        message: `${project.metrics.overdueTasks} tasks overdue - review project timeline`
      })
    }
    
    if (project.metrics.budgetUtilization > 90) {
      recommendations.push({
        type: 'danger',
        message: 'Budget utilization above 90% - monitor expenses closely'
      })
    }
    
    if (project.metrics.taskCompletionRate < 50) {
      recommendations.push({
        type: 'warning',
        message: 'Low task completion rate - consider resource reallocation'
      })
    }
    
    if (project.progressReports.length === 0) {
      recommendations.push({
        type: 'info',
        message: 'No progress reports submitted - encourage regular reporting'
      })
    }

    return recommendations
  }

  return (
    <div className="space-y-8">
      {/* Monitoring Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Project Monitoring & Evaluation</h2>
          <p className="mt-1 text-gray-600">
            Comprehensive project monitoring with methodology-specific criteria
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          {canCreateReports && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Monitoring Report
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Methodology
              </label>
              <select
                value={selectedMethodology}
                onChange={(e) => setSelectedMethodology(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Methodologies</option>
                <option value="AGILE">Agile</option>
                <option value="WATERFALL">Waterfall</option>
                <option value="HYBRID">Hybrid</option>
                <option value="KANBAN">Kanban</option>
                <option value="SCRUM">Scrum</option>
              </select>
            </div>

            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PLANNING">Planning</option>
                <option value="COMPLETED">Completed</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
            </div>

            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="health">Health Status</option>
                <option value="completion">Completion Rate</option>
                <option value="budget">Budget Utilization</option>
                <option value="name">Project Name</option>
                <option value="updated">Last Updated</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Monitoring Cards */}
      <div className="space-y-6">
        {filteredProjects.map((project) => {
          const performanceScore = calculatePerformanceScore(project)
          const recommendations = getRecommendations(project)
          const criteria = MONITORING_CRITERIA[project.methodology as keyof typeof MONITORING_CRITERIA] || 
                          MONITORING_CRITERIA.HYBRID

          return (
            <Card key={project.id} className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getMethodologyIcon(project.methodology)}</span>
                      <div>
                        <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
                        <CardDescription>
                          {project.methodology} • {project.status} • Last updated {formatDate(new Date(project.updatedAt))}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getHealthColor(project.metrics.overallHealth)}`}>
                      {getHealthIcon(project.metrics.overallHealth)}
                      <span className="ml-2">
                        {project.metrics.overallHealth === 'GREEN' ? 'Healthy' :
                         project.metrics.overallHealth === 'YELLOW' ? 'At Risk' : 'Critical'}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{performanceScore.toFixed(0)}%</p>
                      <p className="text-xs text-gray-500">Performance Score</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Task Progress</span>
                      <CheckCircle className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {project.metrics.taskCompletionRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {project.metrics.completedTasks} of {project.metrics.totalTasks}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Budget Usage</span>
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {project.metrics.budgetUtilization.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatCurrency(project.metrics.spentBudget)} spent
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Schedule</span>
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {project.metrics.schedulePerformance.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {project.metrics.overdueTasks} overdue
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Reports</span>
                      <FileText className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {project.progressReports.length}
                    </p>
                    <p className="text-xs text-gray-500">Progress reports</p>
                  </div>
                </div>

                {/* Methodology-Specific Criteria */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">
                    {project.methodology} Monitoring Criteria
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {criteria.map(criterion => {
                      // Calculate criterion score based on available data
                      let score = 0
                      switch (criterion.key) {
                        case 'milestone_adherence':
                        case 'phase_delivery':
                        case 'effectiveness':
                          score = project.metrics.taskCompletionRate
                          break
                        case 'scope_control':
                        case 'efficiency':
                          score = Math.min(project.metrics.budgetUtilization, 100)
                          break
                        default:
                          score = project.metrics.overallHealth === 'GREEN' ? 85 : 
                                 project.metrics.overallHealth === 'YELLOW' ? 65 : 45
                      }

                      const scoreColor = score >= 80 ? 'text-green-600' :
                                       score >= 60 ? 'text-yellow-600' : 'text-red-600'

                      return (
                        <div key={criterion.key} className="bg-white border border-gray-200 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">{criterion.name}</span>
                            <span className={`text-sm font-bold ${scoreColor}`}>
                              {score.toFixed(0)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                score >= 80 ? 'bg-green-500' :
                                score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min(score, 100)}%` }}
                            />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Weight: {criterion.weight}%</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Recommendations */}
                {recommendations.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                    <div className="space-y-2">
                      {recommendations.map((rec, index) => (
                        <div 
                          key={index}
                          className={`p-3 rounded-lg border-l-4 ${
                            rec.type === 'danger' ? 'border-red-500 bg-red-50 text-red-800' :
                            rec.type === 'warning' ? 'border-yellow-500 bg-yellow-50 text-yellow-800' :
                            'border-blue-500 bg-blue-50 text-blue-800'
                          }`}
                        >
                          <p className="text-sm">{rec.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Performance: {performanceScore.toFixed(1)}%</span>
                    <span>•</span>
                    <span>Updated: {formatDate(new Date(project.updatedAt))}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    {canCreateReports && (
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        Add Report
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredProjects.length === 0 && (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Found</h3>
            <p className="text-gray-600">
              No projects match your current filters. Try adjusting the methodology or status filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
