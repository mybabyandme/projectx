'use client'

import { useState } from 'react'
import { 
  BarChart3, FileText, Download, Calendar, Filter,
  TrendingUp, Target, AlertTriangle, CheckCircle,
  XCircle, Clock, Users, DollarSign, Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'
import PQGDashboard from './pqg-dashboard'
import ProjectMonitoring from './project-monitoring'
import PerformanceAnalytics from './performance-analytics'
import ReportExporter from './enhanced-report-exporter'

interface AdvancedReportingProps {
  organizationSlug: string
  userId: string
  reportingData: {
    organization: {
      id: string
      name: string
      members: Array<{ user: { id: string; name: string; email: string } }>
    }
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
    canExport: boolean
  }
}

const REPORT_TABS = [
  {
    id: 'overview',
    label: 'Overview',
    icon: BarChart3,
    description: 'Organization performance summary'
  },
  {
    id: 'pqg',
    label: 'PQG Dashboard',
    icon: Target,
    description: 'Government priorities and programs (Mozambique PQG)'
  },
  {
    id: 'monitoring',
    label: 'Project Monitoring',
    icon: Activity,
    description: 'Project-level monitoring and evaluation'
  },
  {
    id: 'analytics',
    label: 'Performance Analytics',
    icon: TrendingUp,
    description: 'Advanced performance metrics and trends'
  },
  {
    id: 'export',
    label: 'Export Reports',
    icon: Download,
    description: 'Generate and download reports'
  },
]

export default function AdvancedReporting({
  organizationSlug,
  userId,
  reportingData
}: AdvancedReportingProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [reportingPeriod, setReportingPeriod] = useState('current-year')
  const [projectFilter, setProjectFilter] = useState('all')

  const { organization, projects, userRole, canCreateReports, canExport } = reportingData

  // Calculate organization-wide metrics
  const orgMetrics = projects.reduce((acc, project) => {
    const metrics = project.metrics
    return {
      totalProjects: acc.totalProjects + 1,
      activeProjects: acc.activeProjects + (project.status === 'ACTIVE' ? 1 : 0),
      totalTasks: acc.totalTasks + metrics.totalTasks,
      completedTasks: acc.completedTasks + metrics.completedTasks,
      overdueTasks: acc.overdueTasks + metrics.overdueTasks,
      totalBudget: acc.totalBudget + metrics.totalBudget,
      spentBudget: acc.spentBudget + metrics.spentBudget,
      greenProjects: acc.greenProjects + (metrics.overallHealth === 'GREEN' ? 1 : 0),
      yellowProjects: acc.yellowProjects + (metrics.overallHealth === 'YELLOW' ? 1 : 0),
      redProjects: acc.redProjects + (metrics.overallHealth === 'RED' ? 1 : 0),
    }
  }, {
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    totalBudget: 0,
    spentBudget: 0,
    greenProjects: 0,
    yellowProjects: 0,
    redProjects: 0,
  })

  // Calculate organization health percentages
  const overallTaskCompletion = orgMetrics.totalTasks > 0 ? (orgMetrics.completedTasks / orgMetrics.totalTasks) * 100 : 0
  const overallBudgetUtilization = orgMetrics.totalBudget > 0 ? (orgMetrics.spentBudget / orgMetrics.totalBudget) * 100 : 0
  const projectHealthDistribution = {
    green: orgMetrics.totalProjects > 0 ? (orgMetrics.greenProjects / orgMetrics.totalProjects) * 100 : 0,
    yellow: orgMetrics.totalProjects > 0 ? (orgMetrics.yellowProjects / orgMetrics.totalProjects) * 100 : 0,
    red: orgMetrics.totalProjects > 0 ? (orgMetrics.redProjects / orgMetrics.totalProjects) * 100 : 0,
  }

  // Filter projects based on criteria
  const filteredProjects = projects.filter(project => {
    if (projectFilter !== 'all' && project.status !== projectFilter) return false
    // Add more filters as needed
    return true
  })

  // Separate government and non-government projects
  const governmentProjects = filteredProjects.filter(p => 
    p.methodology === 'WATERFALL' && p.pqgData // Assuming government projects use waterfall + have PQG data
  )
  const nonGovernmentProjects = filteredProjects.filter(p => !governmentProjects.includes(p))

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Organization Performance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Projects</p>
                      <p className="text-3xl font-bold text-gray-900">{orgMetrics.totalProjects}</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    {orgMetrics.activeProjects} active projects
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Task Completion</p>
                      <p className="text-3xl font-bold text-gray-900">{overallTaskCompletion.toFixed(1)}%</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    {orgMetrics.completedTasks} of {orgMetrics.totalTasks} tasks
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Budget Utilization</p>
                      <p className="text-3xl font-bold text-gray-900">{overallBudgetUtilization.toFixed(1)}%</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <DollarSign className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    {formatCurrency(orgMetrics.spentBudget)} spent
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Project Health</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-lg font-bold text-green-600">{orgMetrics.greenProjects}</span>
                        <span className="text-lg font-bold text-yellow-600">{orgMetrics.yellowProjects}</span>
                        <span className="text-lg font-bold text-red-600">{orgMetrics.redProjects}</span>
                      </div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <Activity className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    Green/Yellow/Red distribution
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Health Distribution Chart */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Project Health Distribution</CardTitle>
                <CardDescription>
                  Traffic light system based on performance indicators
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-green-900">Green (Performing Well)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-green-900 font-semibold">{orgMetrics.greenProjects} projects</span>
                      <span className="text-green-700">({projectHealthDistribution.green.toFixed(1)}%)</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                      <span className="font-medium text-yellow-900">Yellow (Needs Attention)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-yellow-900 font-semibold">{orgMetrics.yellowProjects} projects</span>
                      <span className="text-yellow-700">({projectHealthDistribution.yellow.toFixed(1)}%)</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                      <span className="font-medium text-red-900">Red (Critical Issues)</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-red-900 font-semibold">{orgMetrics.redProjects} projects</span>
                      <span className="text-red-700">({projectHealthDistribution.red.toFixed(1)}%)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overdue Tasks Alert */}
            {orgMetrics.overdueTasks > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-orange-600 mr-3" />
                    <div>
                      <h3 className="font-medium text-orange-900">Attention Required</h3>
                      <p className="text-sm text-orange-800 mt-1">
                        {orgMetrics.overdueTasks} tasks are overdue across {orgMetrics.totalProjects} projects. 
                        Review project timelines and resource allocation.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 'pqg':
        return (
          <PQGDashboard
            organizationSlug={organizationSlug}
            governmentProjects={governmentProjects}
            reportingPeriod={reportingPeriod}
            canExport={canExport}
          />
        )

      case 'monitoring':
        return (
          <ProjectMonitoring
            organizationSlug={organizationSlug}
            projects={filteredProjects}
            userRole={userRole}
            canCreateReports={canCreateReports}
          />
        )

      case 'analytics':
        return (
          <PerformanceAnalytics
            organizationSlug={organizationSlug}
            projects={filteredProjects}
            orgMetrics={orgMetrics}
            reportingPeriod={reportingPeriod}
          />
        )

      case 'export':
        return (
          <ReportExporter
            organizationSlug={organizationSlug}
            organizationData={reportingData}
            canExport={canExport}
            userRole={userRole}
            userId={userId}
          />
        )

      default:
        return null
    }
  }

  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Advanced Reporting</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive project monitoring, PQG tracking, and performance analytics
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <select
            value={reportingPeriod}
            onChange={(e) => setReportingPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="current-year">Current Year</option>
            <option value="last-year">Last Year</option>
            <option value="current-quarter">Current Quarter</option>
            <option value="last-quarter">Last Quarter</option>
            <option value="ytd">Year to Date</option>
          </select>
          
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Projects</option>
            <option value="ACTIVE">Active Projects</option>
            <option value="COMPLETED">Completed Projects</option>
            <option value="PLANNING">Planning Phase</option>
          </select>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {REPORT_TABS.map((tab) => {
            const IconComponent = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {renderTabContent()}
      </div>
    </div>
  )
}
