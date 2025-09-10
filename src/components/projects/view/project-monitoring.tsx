'use client'

import { useState } from 'react'
import { 
  Activity, BarChart3, TrendingUp, Target, AlertTriangle,
  CheckCircle, Clock, Users, DollarSign, FileText,
  Calendar, Zap, Settings, Plus, Download
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ProjectMonitoringProps {
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
}

// Monitoring criteria based on methodology
const MONITORING_CRITERIA = {
  AGILE: [
    { key: 'sprint_velocity', name: 'Sprint Velocity', weight: 25, icon: Zap },
    { key: 'burndown_trend', name: 'Burndown Trend', weight: 25, icon: TrendingUp },
    { key: 'team_satisfaction', name: 'Team Satisfaction', weight: 20, icon: Users },
    { key: 'stakeholder_feedback', name: 'Stakeholder Feedback', weight: 30, icon: Target }
  ],
  WATERFALL: [
    { key: 'milestone_adherence', name: 'Milestone Adherence', weight: 30, icon: Target },
    { key: 'scope_control', name: 'Scope Control', weight: 25, icon: CheckCircle },
    { key: 'quality_metrics', name: 'Quality Metrics', weight: 25, icon: BarChart3 },
    { key: 'risk_management', name: 'Risk Management', weight: 20, icon: AlertTriangle }
  ],
  HYBRID: [
    { key: 'phase_delivery', name: 'Phase Delivery', weight: 25, icon: Calendar },
    { key: 'iteration_success', name: 'Iteration Success', weight: 25, icon: TrendingUp },
    { key: 'stakeholder_engagement', name: 'Stakeholder Engagement', weight: 25, icon: Users },
    { key: 'adaptive_capacity', name: 'Adaptive Capacity', weight: 25, icon: Settings }
  ],
  KANBAN: [
    { key: 'flow_efficiency', name: 'Flow Efficiency', weight: 30, icon: TrendingUp },
    { key: 'cycle_time', name: 'Cycle Time', weight: 25, icon: Clock },
    { key: 'throughput', name: 'Throughput', weight: 25, icon: BarChart3 },
    { key: 'quality_rate', name: 'Quality Rate', weight: 20, icon: CheckCircle }
  ],
  SCRUM: [
    { key: 'sprint_completion', name: 'Sprint Completion', weight: 30, icon: Target },
    { key: 'velocity_consistency', name: 'Velocity Consistency', weight: 25, icon: TrendingUp },
    { key: 'retrospective_actions', name: 'Retrospective Actions', weight: 20, icon: Settings },
    { key: 'team_collaboration', name: 'Team Collaboration', weight: 25, icon: Users }
  ]
}

export default function ProjectMonitoring({
  project,
  organizationSlug,
  userRole,
  permissions
}: ProjectMonitoringProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('current-month')
  const [monitoringView, setMonitoringView] = useState('performance')

  const metrics = project.metrics || {}
  const methodology = project.methodology || 'HYBRID'
  const criteria = MONITORING_CRITERIA[methodology as keyof typeof MONITORING_CRITERIA] || MONITORING_CRITERIA.HYBRID

  // Calculate performance scores for each criterion
  const calculateCriterionScore = (criterionKey: string) => {
    // In real implementation, these would come from actual evaluations
    // For now, we'll derive them from available metrics
    let score = 0
    
    switch (criterionKey) {
      case 'milestone_adherence':
      case 'phase_delivery':
      case 'sprint_completion':
        score = metrics.taskCompletionRate || 0
        break
      case 'scope_control':
      case 'quality_metrics':
        score = Math.min(metrics.budgetUtilization || 0, 100)
        break
      case 'sprint_velocity':
      case 'burndown_trend':
      case 'flow_efficiency':
        score = metrics.schedulePerformance || 0
        break
      case 'team_satisfaction':
      case 'team_collaboration':
      case 'stakeholder_engagement':
        score = metrics.overallHealth === 'GREEN' ? 85 : 
               metrics.overallHealth === 'YELLOW' ? 65 : 45
        break
      case 'risk_management':
        score = metrics.overdueTasks === 0 ? 90 : 
               metrics.overdueTasks < 5 ? 70 : 40
        break
      default:
        score = metrics.overallHealth === 'GREEN' ? 80 : 
               metrics.overallHealth === 'YELLOW' ? 60 : 40
    }
    
    return Math.min(Math.max(score, 0), 100)
  }

  // Calculate overall performance score
  const calculateOverallScore = () => {
    let totalScore = 0
    let totalWeight = 0
    
    criteria.forEach(criterion => {
      const score = calculateCriterionScore(criterion.key)
      totalScore += score * (criterion.weight / 100)
      totalWeight += criterion.weight
    })
    
    return totalWeight > 0 ? totalScore : 0
  }

  const overallScore = calculateOverallScore()

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'GREEN': return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'YELLOW': return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'RED': return <AlertTriangle className="h-5 w-5 text-red-600" />
      default: return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  // Generate recommendations based on scores
  const generateRecommendations = () => {
    const recommendations = []
    
    criteria.forEach(criterion => {
      const score = calculateCriterionScore(criterion.key)
      if (score < 60) {
        switch (criterion.key) {
          case 'sprint_velocity':
            recommendations.push({
              type: 'warning',
              title: 'Low Sprint Velocity',
              message: 'Consider reviewing sprint planning and removing impediments'
            })
            break
          case 'milestone_adherence':
            recommendations.push({
              type: 'danger',
              title: 'Milestone Delays',
              message: 'Review project timeline and resource allocation'
            })
            break
          case 'team_satisfaction':
            recommendations.push({
              type: 'warning',
              title: 'Team Satisfaction Issues',
              message: 'Conduct team retrospectives and address concerns'
            })
            break
          case 'quality_metrics':
            recommendations.push({
              type: 'danger',
              title: 'Quality Concerns',
              message: 'Implement additional quality assurance measures'
            })
            break
        }
      }
    })

    if (metrics.overdueTasks > 0) {
      recommendations.push({
        type: 'warning',
        title: 'Overdue Tasks',
        message: `${metrics.overdueTasks} tasks are overdue. Review task assignments and priorities.`
      })
    }

    if (permissions.canViewFinancials && metrics.budgetUtilization > 90) {
      recommendations.push({
        type: 'danger',
        title: 'Budget Alert',
        message: 'Budget utilization is above 90%. Monitor spending closely.'
      })
    }

    return recommendations
  }

  const recommendations = generateRecommendations()

  return (
    <div className="p-6 space-y-6">
      {/* Monitoring Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Project Monitoring</h2>
          <p className="mt-1 text-gray-600">
            {methodology} methodology monitoring with performance indicators
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="current-week">Current Week</option>
            <option value="current-month">Current Month</option>
            <option value="current-quarter">Current Quarter</option>
            <option value="last-month">Last Month</option>
          </select>
          {permissions.canCreateReports && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
          )}
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overall Score</p>
                <p className={`text-3xl font-bold ${getScoreColor(overallScore).split(' ')[0]}`}>
                  {overallScore.toFixed(0)}%
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {methodology} Performance Score
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Health Status</p>
                <div className="flex items-center mt-2">
                  {getHealthIcon(metrics.overallHealth)}
                  <span className="ml-2 text-lg font-semibold text-gray-900">
                    {metrics.overallHealth === 'GREEN' ? 'Healthy' :
                     metrics.overallHealth === 'YELLOW' ? 'At Risk' : 'Critical'}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Current project health
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Task Progress</p>
                <p className="text-3xl font-bold text-gray-900">
                  {(metrics.taskCompletionRate || 0).toFixed(0)}%
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {metrics.completedTasks || 0} of {metrics.totalTasks || 0} completed
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Schedule Performance</p>
                <p className="text-3xl font-bold text-gray-900">
                  {(metrics.schedulePerformance || 100).toFixed(0)}%
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Time efficiency metric
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Methodology-Specific Criteria */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{methodology} Monitoring Criteria</CardTitle>
          <CardDescription>
            Performance evaluation based on {methodology.toLowerCase()} methodology best practices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {criteria.map(criterion => {
              const IconComponent = criterion.icon
              const score = calculateCriterionScore(criterion.key)
              const scoreColor = getScoreColor(score)

              return (
                <div key={criterion.key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="p-2 bg-gray-50 rounded-lg mr-3">
                        <IconComponent className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{criterion.name}</h4>
                        <p className="text-sm text-gray-600">Weight: {criterion.weight}%</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${scoreColor}`}>
                      {score.toFixed(0)}%
                    </div>
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
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recommendations</CardTitle>
            <CardDescription>
              Actionable insights based on current performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    rec.type === 'danger' ? 'border-red-500 bg-red-50' :
                    rec.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                    'border-blue-500 bg-blue-50'
                  }`}
                >
                  <h4 className={`font-medium ${
                    rec.type === 'danger' ? 'text-red-900' :
                    rec.type === 'warning' ? 'text-yellow-900' :
                    'text-blue-900'
                  }`}>
                    {rec.title}
                  </h4>
                  <p className={`text-sm mt-1 ${
                    rec.type === 'danger' ? 'text-red-800' :
                    rec.type === 'warning' ? 'text-yellow-800' :
                    'text-blue-800'
                  }`}>
                    {rec.message}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Monitoring Activities */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Recent Monitoring Activities</CardTitle>
              <CardDescription>
                Latest monitoring reports and evaluations
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {project.progressReports && project.progressReports.length > 0 ? (
            <div className="space-y-4">
              {project.progressReports.slice(0, 5).map((report: any) => (
                <div key={report.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="p-2 bg-white rounded-lg mr-3">
                      <FileText className="h-5 w-5 text-gray-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {report.reportType?.replace('_', ' ') || 'Progress Report'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        By {report.reporter?.name} • {formatDate(new Date(report.createdAt))}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      report.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {report.status}
                    </span>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Monitoring Reports</h3>
              <p className="text-gray-600 mb-4">
                No monitoring reports have been submitted for this project yet.
              </p>
              {permissions.canCreateReports && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Report
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
