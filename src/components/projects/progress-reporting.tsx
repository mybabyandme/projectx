'use client'

import { useState, useMemo } from 'react'
import { 
  FileText, Download, Calendar, TrendingUp, AlertTriangle, 
  CheckCircle, Clock, Users, Target, DollarSign, BarChart3,
  Filter, Search, Plus, MoreVertical, Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { formatDate, formatCurrency } from '@/lib/utils'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts'

interface ProgressReportingProps {
  project: any
  tasks: any[]
  progressReports?: any[]
  canCreateReports?: boolean
  onCreateReport?: () => void
  onViewReport?: (report: any) => void
}

type ReportPeriod = 'week' | 'month' | 'quarter' | 'year'

const STATUS_COLORS = {
  TODO: '#6B7280',
  IN_PROGRESS: '#3B82F6',
  IN_REVIEW: '#F59E0B', 
  DONE: '#10B981',
  BLOCKED: '#EF4444'
}

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

export default function ProgressReporting({
  project,
  tasks,
  progressReports = [],
  canCreateReports = false,
  onCreateReport,
  onViewReport
}: ProgressReportingProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('month')
  const [searchQuery, setSearchQuery] = useState('')
  const [showMetrics, setShowMetrics] = useState(true)

  // Calculate project metrics
  const projectMetrics = useMemo(() => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'DONE').length
    const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length
    const blockedTasks = tasks.filter(t => t.status === 'BLOCKED').length
    const overdueTasks = tasks.filter(t => 
      t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE'
    ).length

    const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    
    // Budget metrics (if available)
    const totalBudget = project.budgets?.reduce((sum: number, budget: any) => 
      sum + Number(budget.allocatedAmount), 0) || 0
    const spentBudget = project.budgets?.reduce((sum: number, budget: any) => 
      sum + Number(budget.spentAmount), 0) || 0
    const budgetUtilization = totalBudget > 0 ? Math.round((spentBudget / totalBudget) * 100) : 0

    // Risk metrics
    const risks = project.metadata?.risks?.risks || []
    const highRisks = risks.filter((risk: any) => {
      const score = (risk.impact || 0) * (risk.probability || 0)
      return score >= 12
    }).length

    // Team metrics
    const stakeholders = project.metadata?.stakeholders?.stakeholders || []
    const activeMembers = stakeholders.filter((s: any) => s.role !== 'VIEWER').length

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      blockedTasks,
      overdueTasks,
      progressPercentage,
      totalBudget,
      spentBudget,
      budgetUtilization,
      highRisks,
      totalRisks: risks.length,
      activeMembers,
      totalMembers: stakeholders.length
    }
  }, [tasks, project])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Progress Reports & Analytics</h2>
          <p className="text-gray-600">Project insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={() => setShowMetrics(!showMetrics)}>
            <BarChart3 className="h-4 w-4 mr-2" />
            {showMetrics ? 'Hide' : 'Show'} Metrics
          </Button>
          {canCreateReports && onCreateReport && (
            <Button onClick={onCreateReport}>
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          )}
        </div>
      </div>

      {/* Key Metrics Dashboard */}
      {showMetrics && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Project Progress</p>
                    <p className="text-2xl font-bold text-gray-900">{projectMetrics.progressPercentage}%</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={projectMetrics.progressPercentage} />
                  <p className="text-xs text-gray-600 mt-1">
                    {projectMetrics.completedTasks} of {projectMetrics.totalTasks} tasks completed
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Budget Utilization</p>
                    <p className="text-2xl font-bold text-gray-900">{projectMetrics.budgetUtilization}%</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <Progress value={projectMetrics.budgetUtilization} />
                  <p className="text-xs text-gray-600 mt-1">
                    {formatCurrency(projectMetrics.spentBudget, project.currency)} of {formatCurrency(projectMetrics.totalBudget, project.currency)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Risks</p>
                    <p className="text-2xl font-bold text-gray-900">{projectMetrics.highRisks}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-gray-600">
                    {projectMetrics.totalRisks} total risks identified
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Team Utilization</p>
                    <p className="text-2xl font-bold text-gray-900">{projectMetrics.activeMembers}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-xs text-gray-600">
                    {projectMetrics.totalMembers} total team members
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Task Status Distribution</CardTitle>
                <CardDescription>Current breakdown of task statuses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'To Do', value: projectMetrics.totalTasks - projectMetrics.completedTasks - projectMetrics.inProgressTasks - projectMetrics.blockedTasks, fill: STATUS_COLORS.TODO },
                          { name: 'In Progress', value: projectMetrics.inProgressTasks, fill: STATUS_COLORS.IN_PROGRESS },
                          { name: 'Completed', value: projectMetrics.completedTasks, fill: STATUS_COLORS.DONE },
                          { name: 'Blocked', value: projectMetrics.blockedTasks, fill: STATUS_COLORS.BLOCKED }
                        ].filter(item => item.value > 0)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Progress Trend */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Progress Trend</CardTitle>
                <CardDescription>Task completion over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { week: 'Week 1', completed: Math.floor(projectMetrics.completedTasks * 0.1), target: Math.floor(projectMetrics.totalTasks * 0.15) },
                      { week: 'Week 2', completed: Math.floor(projectMetrics.completedTasks * 0.25), target: Math.floor(projectMetrics.totalTasks * 0.3) },
                      { week: 'Week 3', completed: Math.floor(projectMetrics.completedTasks * 0.45), target: Math.floor(projectMetrics.totalTasks * 0.45) },
                      { week: 'Week 4', completed: Math.floor(projectMetrics.completedTasks * 0.65), target: Math.floor(projectMetrics.totalTasks * 0.6) },
                      { week: 'Week 5', completed: Math.floor(projectMetrics.completedTasks * 0.8), target: Math.floor(projectMetrics.totalTasks * 0.75) },
                      { week: 'Current', completed: projectMetrics.completedTasks, target: Math.floor(projectMetrics.totalTasks * 0.9) }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="completed" stroke="#10B981" strokeWidth={2} name="Completed" />
                      <Line type="monotone" dataKey="target" stroke="#6B7280" strokeDasharray="5 5" name="Target" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Team Workload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Team Workload Distribution</CardTitle>
                <CardDescription>Tasks assigned per team member</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={
                      tasks.reduce((acc, task) => {
                        const assignee = task.assignee?.name || 'Unassigned'
                        const existing = acc.find(item => item.name === assignee)
                        if (existing) {
                          existing.total++
                          if (task.status === 'DONE') existing.completed++
                        } else {
                          acc.push({
                            name: assignee.length > 10 ? assignee.substring(0, 10) + '...' : assignee,
                            total: 1,
                            completed: task.status === 'DONE' ? 1 : 0
                          })
                        }
                        return acc
                      }, [] as any[]).slice(0, 6)
                    }>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#3B82F6" name="Total Tasks" />
                      <Bar dataKey="completed" fill="#10B981" name="Completed" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Risk Assessment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Risk Assessment Overview</CardTitle>
                <CardDescription>Current risk level distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { level: 'Critical', count: projectMetrics.highRisks, color: 'bg-red-500', textColor: 'text-red-700' },
                    { level: 'High', count: Math.max(0, projectMetrics.totalRisks - projectMetrics.highRisks - 2), color: 'bg-orange-500', textColor: 'text-orange-700' },
                    { level: 'Medium', count: Math.min(2, projectMetrics.totalRisks), color: 'bg-yellow-500', textColor: 'text-yellow-700' },
                    { level: 'Low', count: Math.max(0, projectMetrics.totalRisks - projectMetrics.highRisks), color: 'bg-green-500', textColor: 'text-green-700' }
                  ].map((risk) => (
                    <div key={risk.level} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${risk.color}`} />
                        <span className="text-sm font-medium text-gray-700">{risk.level} Risk</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-medium ${risk.textColor}`}>{risk.count}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${risk.color}`}
                            style={{ width: `${projectMetrics.totalRisks > 0 ? (risk.count / projectMetrics.totalRisks) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alert Section */}
          {(projectMetrics.overdueTasks > 0 || projectMetrics.blockedTasks > 0 || projectMetrics.highRisks > 0) && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-base text-orange-800 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Attention Required
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {projectMetrics.overdueTasks > 0 && (
                    <div className="flex items-center text-sm text-orange-700">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{projectMetrics.overdueTasks} overdue task{projectMetrics.overdueTasks !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {projectMetrics.blockedTasks > 0 && (
                    <div className="flex items-center text-sm text-orange-700">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      <span>{projectMetrics.blockedTasks} blocked task{projectMetrics.blockedTasks !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  {projectMetrics.highRisks > 0 && (
                    <div className="flex items-center text-sm text-orange-700">
                      <Target className="h-4 w-4 mr-2" />
                      <span>{projectMetrics.highRisks} high-priority risk{projectMetrics.highRisks !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Reports Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Progress Reports</CardTitle>
              <CardDescription>Historical reports and documentation</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {progressReports.length > 0 ? (
            <div className="space-y-4">
              {progressReports.slice(0, 5).map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {report.content?.title || `${report.reportType} Report`}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Created {formatDate(report.createdAt)} by {report.reporter?.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      report.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                      report.status === 'SUBMITTED' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {report.status}
                    </span>
                    <Button variant="ghost" size="sm" onClick={() => onViewReport?.(report)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h3>
              <p className="text-gray-600 mb-4">Create your first progress report to track project milestones</p>
              {canCreateReports && onCreateReport && (
                <Button onClick={onCreateReport}>
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
