'use client'

import { useState } from 'react'
import { 
  BarChart3, DollarSign, TrendingUp, Target, PieChart,
  Download, Calendar, Filter, FileText, AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'

interface FinancialReportsProps {
  organizationSlug: string
  userRole: string
  userId: string
  organizationData: {
    id: string
    name: string
    projects: Array<{
      id: string
      name: string
      status: string
      budgets: Array<{
        id: string
        category: string
        allocatedAmount: number
        spentAmount: number
        approvedAmount: number
        metadata: any
      }>
      tasks: Array<{
        id: string
        status: string
        actualHours: number | null
        estimatedHours: number | null
      }>
      _count: { tasks: number; phases: number }
    }>
    financialSummary: {
      totalAllocated: number
      totalSpent: number
      totalApproved: number
      totalExpenses: number
      pendingExpenses: number
      projectCount: number
      activeProjectCount: number
    }
  }
  canExport: boolean
}

export default function FinancialReports({
  organizationSlug,
  userRole,
  userId,
  organizationData,
  canExport
}: FinancialReportsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('all')
  const [selectedProject, setSelectedProject] = useState('all')

  const { financialSummary } = organizationData
  
  // Calculate additional metrics
  const utilizationRate = financialSummary.totalAllocated > 0 
    ? (financialSummary.totalSpent / financialSummary.totalAllocated) * 100 
    : 0

  const approvalRate = financialSummary.totalExpenses > 0 
    ? ((financialSummary.totalExpenses - financialSummary.pendingExpenses) / financialSummary.totalExpenses) * 100 
    : 0

  const averageBudgetPerProject = financialSummary.projectCount > 0 
    ? financialSummary.totalAllocated / financialSummary.projectCount 
    : 0

  // Process project-wise financial data
  const projectReports = organizationData.projects.map(project => {
    const projectAllocated = project.budgets.reduce((sum, b) => sum + Number(b.allocatedAmount), 0)
    const projectSpent = project.budgets.reduce((sum, b) => sum + Number(b.spentAmount), 0)
    const projectUtilization = projectAllocated > 0 ? (projectSpent / projectAllocated) * 100 : 0
    
    const completedTasks = project.tasks.filter(t => t.status === 'DONE').length
    const taskProgress = project.tasks.length > 0 ? (completedTasks / project.tasks.length) * 100 : 0
    
    const totalEstimatedHours = project.tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0)
    const totalActualHours = project.tasks.reduce((sum, t) => sum + (t.actualHours || 0), 0)
    const hourEfficiency = totalEstimatedHours > 0 ? (totalEstimatedHours / totalActualHours) * 100 : 0
    
    return {
      id: project.id,
      name: project.name,
      status: project.status,
      allocated: projectAllocated,
      spent: projectSpent,
      remaining: projectAllocated - projectSpent,
      utilization: projectUtilization,
      taskProgress,
      budgetCategories: project.budgets.length,
      hourEfficiency: isFinite(hourEfficiency) ? hourEfficiency : 0,
    }
  }).filter(project => 
    selectedProject === 'all' || project.id === selectedProject
  )

  const handleExportReport = async () => {
    // This would generate and download a financial report
    try {
      const reportData = {
        organization: organizationData.name,
        reportDate: new Date().toISOString(),
        timeframe: selectedTimeframe,
        summary: financialSummary,
        projects: projectReports,
      }
      
      // Create CSV content
      const csvContent = generateCSVReport(reportData)
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `financial-report-${organizationData.name}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting report:', error)
    }
  }

  const generateCSVReport = (data: any) => {
    const headers = [
      'Project Name',
      'Status',
      'Allocated Budget',
      'Spent Amount',
      'Remaining Budget',
      'Utilization %',
      'Task Progress %',
      'Budget Categories',
      'Hour Efficiency %'
    ]
    
    const rows = data.projects.map((project: any) => [
      project.name,
      project.status,
      project.allocated,
      project.spent,
      project.remaining,
      project.utilization.toFixed(2),
      project.taskProgress.toFixed(2),
      project.budgetCategories,
      project.hourEfficiency.toFixed(2)
    ])
    
    return [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
  }

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 75) return 'text-orange-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Financial Reports</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive financial analysis and performance metrics
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          {canExport && (
            <Button 
              onClick={handleExportReport}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
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
                Timeframe
              </label>
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time</option>
                <option value="ytd">Year to Date</option>
                <option value="last-quarter">Last Quarter</option>
                <option value="last-month">Last Month</option>
              </select>
            </div>

            <div className="sm:w-48">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project
              </label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Projects</option>
                {organizationData.projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(financialSummary.totalAllocated)}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Across {financialSummary.projectCount} projects
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(financialSummary.totalSpent)}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {utilizationRate.toFixed(1)}% of total budget
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Budget Utilization</p>
                <p className={`text-3xl font-bold ${getUtilizationColor(utilizationRate)}`}>
                  {utilizationRate.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Efficiency metric
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approval Rate</p>
                <p className="text-3xl font-bold text-green-600">
                  {approvalRate.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <PieChart className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {financialSummary.pendingExpenses} pending approvals
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Utilization Alert */}
      {utilizationRate >= 80 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-3" />
              <div>
                <h3 className="font-medium text-orange-900">High Budget Utilization</h3>
                <p className="text-sm text-orange-800 mt-1">
                  Organization budget utilization is at {utilizationRate.toFixed(1)}%. 
                  Consider reviewing spending patterns and budget allocations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Financial Performance */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Project Financial Performance</CardTitle>
          <CardDescription>
            Budget utilization and financial metrics by project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Project</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Allocated</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Spent</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900">Remaining</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Utilization</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Progress</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {projectReports.map((project) => (
                  <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{project.name}</div>
                        <div className="text-sm text-gray-500">{project.budgetCategories} categories</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right font-medium">
                      {formatCurrency(project.allocated)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {formatCurrency(project.spent)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {formatCurrency(project.remaining)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`font-medium ${getUtilizationColor(project.utilization)}`}>
                        {project.utilization.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(project.taskProgress, 100)}%` }}
                          />
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          {project.taskProgress.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        project.status === 'PLANNING' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {projectReports.length === 0 && (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600">No projects match your current filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Insights */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Financial Insights</CardTitle>
          <CardDescription>
            Key takeaways and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Budget Efficiency</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Average budget per project: {formatCurrency(averageBudgetPerProject)}</li>
                <li>• {financialSummary.activeProjectCount} of {financialSummary.projectCount} projects are active</li>
                <li>• {financialSummary.pendingExpenses} expenses awaiting approval</li>
                <li>• Overall utilization rate: {utilizationRate.toFixed(1)}%</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                {utilizationRate > 85 && (
                  <li>• Consider increasing budget allocations for high-performing projects</li>
                )}
                {financialSummary.pendingExpenses > 5 && (
                  <li>• Review and process pending expense approvals</li>
                )}
                {financialSummary.activeProjectCount < financialSummary.projectCount * 0.6 && (
                  <li>• Consider reactivating stalled projects or reallocating resources</li>
                )}
                <li>• Regular budget reviews recommended for optimal resource allocation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
