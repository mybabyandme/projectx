'use client'

import { useState } from 'react'
import { 
  TrendingUp, BarChart3, PieChart, Target, 
  Calendar, Users, DollarSign, Clock
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface PerformanceAnalyticsProps {
  organizationSlug: string
  projects: Array<{
    id: string
    name: string
    status: string
    methodology: string
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
  }>
  orgMetrics: {
    totalProjects: number
    activeProjects: number
    totalTasks: number
    completedTasks: number
    overdueTasks: number
    totalBudget: number
    spentBudget: number
    greenProjects: number
    yellowProjects: number
    redProjects: number
  }
  reportingPeriod: string
}

export default function PerformanceAnalytics({
  organizationSlug,
  projects,
  orgMetrics,
  reportingPeriod
}: PerformanceAnalyticsProps) {
  const [analyticsView, setAnalyticsView] = useState<string>('trends')

  // Calculate trend data (simulated for demonstration)
  const monthlyTrends = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(2024, i, 1).toLocaleString('en', { month: 'short' })
    const baseCompletion = 60 + Math.random() * 30
    const baseBudget = 70 + Math.random() * 25
    
    return {
      month,
      taskCompletion: Math.min(baseCompletion + i * 2, 95),
      budgetUtilization: Math.min(baseBudget + i * 1.5, 90),
      projectHealth: Math.max(85 - i * 0.5, 75) + Math.random() * 10
    }
  })

  // Performance by methodology analysis
  const methodologyAnalysis = projects.reduce((acc, project) => {
    const methodology = project.methodology
    if (!acc[methodology]) {
      acc[methodology] = {
        count: 0,
        totalTasks: 0,
        completedTasks: 0,
        totalBudget: 0,
        spentBudget: 0,
        greenProjects: 0,
        yellowProjects: 0,
        redProjects: 0,
        avgPerformance: 0
      }
    }
    
    acc[methodology].count++
    acc[methodology].totalTasks += project.metrics.totalTasks
    acc[methodology].completedTasks += project.metrics.completedTasks
    acc[methodology].totalBudget += project.metrics.totalBudget
    acc[methodology].spentBudget += project.metrics.spentBudget
    
    if (project.metrics.overallHealth === 'GREEN') acc[methodology].greenProjects++
    else if (project.metrics.overallHealth === 'YELLOW') acc[methodology].yellowProjects++
    else acc[methodology].redProjects++
    
    return acc
  }, {} as Record<string, any>)

  // Calculate methodology performance scores
  Object.keys(methodologyAnalysis).forEach(methodology => {
    const data = methodologyAnalysis[methodology]
    const taskCompletion = data.totalTasks > 0 ? (data.completedTasks / data.totalTasks) * 100 : 0
    const budgetEfficiency = data.totalBudget > 0 ? Math.min((data.spentBudget / data.totalBudget) * 100, 100) : 0
    const healthScore = data.count > 0 ? 
      ((data.greenProjects * 100 + data.yellowProjects * 60 + data.redProjects * 20) / data.count) : 0
    
    data.avgPerformance = (taskCompletion * 0.4 + (100 - budgetEfficiency) * 0.3 + healthScore * 0.3)
    data.taskCompletionRate = taskCompletion
    data.budgetUtilization = budgetEfficiency
  })

  // Risk analysis
  const riskProjects = projects.filter(p => 
    p.metrics.overallHealth === 'RED' || 
    p.metrics.overdueTasks > 5 || 
    p.metrics.budgetUtilization > 90
  )

  // Performance benchmarks
  const benchmarks = {
    taskCompletion: {
      excellent: 90,
      good: 75,
      fair: 60,
      poor: 0
    },
    budgetUtilization: {
      excellent: 85,
      good: 75,
      fair: 90,
      poor: 100
    },
    projectHealth: {
      excellent: 90,
      good: 75,
      fair: 60,
      poor: 0
    }
  }

  const getBenchmarkStatus = (value: number, metric: keyof typeof benchmarks) => {
    const benchmark = benchmarks[metric]
    if (metric === 'budgetUtilization') {
      // For budget, lower is better until a point
      if (value <= benchmark.excellent) return { status: 'excellent', color: 'text-green-600' }
      if (value <= benchmark.good) return { status: 'good', color: 'text-blue-600' }
      if (value <= benchmark.fair) return { status: 'fair', color: 'text-yellow-600' }
      return { status: 'poor', color: 'text-red-600' }
    } else {
      // For others, higher is better
      if (value >= benchmark.excellent) return { status: 'excellent', color: 'text-green-600' }
      if (value >= benchmark.good) return { status: 'good', color: 'text-blue-600' }
      if (value >= benchmark.fair) return { status: 'fair', color: 'text-yellow-600' }
      return { status: 'poor', color: 'text-red-600' }
    }
  }

  const overallTaskCompletion = orgMetrics.totalTasks > 0 ? (orgMetrics.completedTasks / orgMetrics.totalTasks) * 100 : 0
  const overallBudgetUtilization = orgMetrics.totalBudget > 0 ? (orgMetrics.spentBudget / orgMetrics.totalBudget) * 100 : 0
  const overallProjectHealth = orgMetrics.totalProjects > 0 ? 
    ((orgMetrics.greenProjects * 100 + orgMetrics.yellowProjects * 60 + orgMetrics.redProjects * 20) / orgMetrics.totalProjects) : 0

  return (
    <div className="space-y-8">
      {/* Analytics View Selector */}
      <div className="flex items-center space-x-4">
        <h2 className="text-xl font-semibold text-gray-900">Performance Analytics</h2>
        <div className="flex space-x-2">
          {[
            { id: 'trends', label: 'Trends' },
            { id: 'methodology', label: 'By Methodology' },
            { id: 'benchmarks', label: 'Benchmarks' },
            { id: 'risks', label: 'Risk Analysis' }
          ].map(view => (
            <button
              key={view.id}
              onClick={() => setAnalyticsView(view.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                analyticsView === view.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {view.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content based on selected view */}
      {analyticsView === 'trends' && (
        <div className="space-y-6">
          {/* Performance Trends */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Performance Trends</CardTitle>
              <CardDescription>
                Monthly performance indicators over the last 12 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Simulated trend chart - in real app would use actual charting library */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Task Completion Trend</h4>
                    <div className="flex items-end space-x-1 h-20">
                      {monthlyTrends.slice(-6).map((data, index) => (
                        <div key={index} className="flex-1 bg-blue-500 rounded-t" 
                             style={{ height: `${data.taskCompletion}%` }}
                             title={`${data.month}: ${data.taskCompletion.toFixed(1)}%`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-blue-700 mt-2">
                      Current: {overallTaskCompletion.toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Budget Utilization</h4>
                    <div className="flex items-end space-x-1 h-20">
                      {monthlyTrends.slice(-6).map((data, index) => (
                        <div key={index} className="flex-1 bg-green-500 rounded-t" 
                             style={{ height: `${data.budgetUtilization}%` }}
                             title={`${data.month}: ${data.budgetUtilization.toFixed(1)}%`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-green-700 mt-2">
                      Current: {overallBudgetUtilization.toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-2">Project Health</h4>
                    <div className="flex items-end space-x-1 h-20">
                      {monthlyTrends.slice(-6).map((data, index) => (
                        <div key={index} className="flex-1 bg-purple-500 rounded-t" 
                             style={{ height: `${data.projectHealth}%` }}
                             title={`${data.month}: ${data.projectHealth.toFixed(1)}%`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-purple-700 mt-2">
                      Current: {overallProjectHealth.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {analyticsView === 'methodology' && (
        <div className="space-y-6">
          {/* Methodology Comparison */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Performance by Methodology</CardTitle>
              <CardDescription>
                Comparative analysis of project methodologies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(methodologyAnalysis).map(([methodology, data]) => (
                  <div key={methodology} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{methodology}</h3>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">{data.count} projects</span>
                        <span className="text-2xl font-bold text-blue-600">
                          {data.avgPerformance.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-1">Task Completion</h4>
                        <p className="text-xl font-bold text-gray-900">
                          {data.taskCompletionRate.toFixed(1)}%
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${Math.min(data.taskCompletionRate, 100)}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-1">Budget Efficiency</h4>
                        <p className="text-xl font-bold text-gray-900">
                          {data.budgetUtilization.toFixed(1)}%
                        </p>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${Math.min(data.budgetUtilization, 100)}%` }}
                          />
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-1">Health Distribution</h4>
                        <div className="flex items-center space-x-2 mt-2">
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-sm">{data.greenProjects}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span className="text-sm">{data.yellowProjects}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-sm">{data.redProjects}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-700 mb-1">Total Budget</h4>
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(data.totalBudget)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(data.spentBudget)} spent
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {analyticsView === 'benchmarks' && (
        <div className="space-y-6">
          {/* Performance Benchmarks */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Performance Benchmarks</CardTitle>
              <CardDescription>
                How your organization compares to industry standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Task Completion Rate</h3>
                    <Target className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        {overallTaskCompletion.toFixed(1)}%
                      </span>
                      <span className={`text-sm font-medium ${getBenchmarkStatus(overallTaskCompletion, 'taskCompletion').color}`}>
                        {getBenchmarkStatus(overallTaskCompletion, 'taskCompletion').status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-600">Excellent (90%+)</span>
                        <span className="text-gray-500">Industry leaders</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600">Good (75-89%)</span>
                        <span className="text-gray-500">Above average</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-600">Fair (60-74%)</span>
                        <span className="text-gray-500">Average</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-600">Poor (&lt;60%)</span>
                        <span className="text-gray-500">Needs improvement</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Budget Utilization</h3>
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        {overallBudgetUtilization.toFixed(1)}%
                      </span>
                      <span className={`text-sm font-medium ${getBenchmarkStatus(overallBudgetUtilization, 'budgetUtilization').color}`}>
                        {getBenchmarkStatus(overallBudgetUtilization, 'budgetUtilization').status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-600">Excellent (≤85%)</span>
                        <span className="text-gray-500">Efficient spending</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600">Good (75-85%)</span>
                        <span className="text-gray-500">Well managed</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-600">Fair (85-90%)</span>
                        <span className="text-gray-500">Monitor closely</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-600">Poor (&gt;90%)</span>
                        <span className="text-gray-500">Over budget risk</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Project Health</h3>
                    <TrendingUp className="h-5 w-5 text-gray-400" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-gray-900">
                        {overallProjectHealth.toFixed(1)}%
                      </span>
                      <span className={`text-sm font-medium ${getBenchmarkStatus(overallProjectHealth, 'projectHealth').color}`}>
                        {getBenchmarkStatus(overallProjectHealth, 'projectHealth').status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-600">Excellent (90%+)</span>
                        <span className="text-gray-500">Optimal performance</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600">Good (75-89%)</span>
                        <span className="text-gray-500">Strong performance</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-yellow-600">Fair (60-74%)</span>
                        <span className="text-gray-500">Some concerns</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-600">Poor (&lt;60%)</span>
                        <span className="text-gray-500">Action required</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {analyticsView === 'risks' && (
        <div className="space-y-6">
          {/* Risk Analysis */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Risk Analysis</CardTitle>
              <CardDescription>
                Projects requiring immediate attention and risk mitigation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {riskProjects.length > 0 ? (
                <div className="space-y-4">
                  {riskProjects.map(project => {
                    const riskFactors = []
                    if (project.metrics.overallHealth === 'RED') riskFactors.push('Critical health status')
                    if (project.metrics.overdueTasks > 5) riskFactors.push(`${project.metrics.overdueTasks} overdue tasks`)
                    if (project.metrics.budgetUtilization > 90) riskFactors.push('Budget overrun risk')
                    if (project.metrics.taskCompletionRate < 30) riskFactors.push('Low completion rate')

                    return (
                      <div key={project.id} className="border-l-4 border-red-500 bg-red-50 p-4 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-red-900">{project.name}</h4>
                            <p className="text-sm text-red-700 mt-1">
                              {project.methodology} • {project.status}
                            </p>
                            <div className="mt-2 space-y-1">
                              {riskFactors.map((factor, index) => (
                                <div key={index} className="flex items-center text-sm text-red-800">
                                  <div className="w-1 h-1 bg-red-600 rounded-full mr-2"></div>
                                  {factor}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-red-900">
                              {project.metrics.taskCompletionRate.toFixed(0)}%
                            </div>
                            <div className="text-sm text-red-700">Completion</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No High-Risk Projects</h3>
                  <p className="text-gray-600">
                    All projects are performing within acceptable parameters. Continue monitoring for early risk detection.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
