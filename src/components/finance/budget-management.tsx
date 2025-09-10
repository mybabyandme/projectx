'use client'

import { useState } from 'react'
import { 
  Plus, DollarSign, TrendingUp, Target, AlertTriangle,
  PieChart, BarChart3, Edit, Trash2, Settings
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import BudgetForm from './budget-form'

interface Project {
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
  tasks: Array<{ id: string; status: string }>
  _count: { tasks: number; phases: number }
}

interface BudgetManagementProps {
  organizationSlug: string
  userRole: string
  userId: string
  projects: Project[]
  organizationStats: {
    totalAllocated: number
    totalSpent: number
    totalApproved: number
    activeProjects: number
  }
  canEdit: boolean
  canApprove: boolean
}

export default function BudgetManagement({
  organizationSlug,
  userRole,
  userId,
  projects,
  organizationStats,
  canEdit,
  canApprove
}: BudgetManagementProps) {
  const [showBudgetForm, setShowBudgetForm] = useState(false)
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [editingBudget, setEditingBudget] = useState<any>(null)

  // Calculate utilization rates
  const orgUtilization = organizationStats.totalAllocated > 0 
    ? (organizationStats.totalSpent / organizationStats.totalAllocated) * 100 
    : 0

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 75) return 'text-orange-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getUtilizationBg = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-50 border-red-200'
    if (percentage >= 75) return 'bg-orange-50 border-orange-200'
    if (percentage >= 50) return 'bg-yellow-50 border-yellow-200'
    return 'bg-green-50 border-green-200'
  }

  const handleCreateBudget = (projectId: string) => {
    setSelectedProject(projectId)
    setEditingBudget(null)
    setShowBudgetForm(true)
  }

  const handleEditBudget = (budget: any, projectId: string) => {
    setSelectedProject(projectId)
    setEditingBudget(budget)
    setShowBudgetForm(true)
  }

  const handleBudgetSubmitted = () => {
    setShowBudgetForm(false)
    setSelectedProject('')
    setEditingBudget(null)
    // Refresh the page to show updates
    window.location.reload()
  }

  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Budget Management</h1>
          <p className="mt-2 text-gray-600">
            Manage project budgets and track financial performance
          </p>
        </div>
        {canEdit && (
          <div className="mt-4 sm:mt-0">
            <Button 
              onClick={() => setShowBudgetForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Budget
            </Button>
          </div>
        )}
      </div>

      {/* Organization Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(organizationStats.totalAllocated)}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Across {organizationStats.activeProjects} active projects
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(organizationStats.totalSpent)}
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {orgUtilization.toFixed(1)}% of total budget
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Remaining</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(organizationStats.totalAllocated - organizationStats.totalSpent)}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Available for allocation
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Utilization</p>
                <p className={`text-3xl font-bold ${getUtilizationColor(orgUtilization)}`}>
                  {orgUtilization.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <PieChart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Budget efficiency
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organization Budget Health */}
      {orgUtilization >= 75 && (
        <div className={`rounded-lg border p-4 ${getUtilizationBg(orgUtilization)}`}>
          <div className="flex items-center">
            <AlertTriangle className={`h-5 w-5 mr-3 ${getUtilizationColor(orgUtilization)}`} />
            <div>
              <h3 className={`font-medium ${getUtilizationColor(orgUtilization)}`}>
                Organization Budget Alert
              </h3>
              <p className={`text-sm mt-1 ${getUtilizationColor(orgUtilization)}`}>
                {orgUtilization >= 90 
                  ? 'Critical: Organization budget utilization is very high across projects.'
                  : 'Warning: High budget utilization detected across multiple projects.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Project Budgets */}
      <div className="space-y-6">
        {projects.map((project) => {
          const projectAllocated = project.budgets.reduce((sum, b) => sum + Number(b.allocatedAmount), 0)
          const projectSpent = project.budgets.reduce((sum, b) => sum + Number(b.spentAmount), 0)
          const projectUtilization = projectAllocated > 0 ? (projectSpent / projectAllocated) * 100 : 0
          const completedTasks = project.tasks.filter(t => t.status === 'DONE').length
          const taskProgress = project.tasks.length > 0 ? (completedTasks / project.tasks.length) * 100 : 0

          return (
            <Card key={project.id} className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold">{project.name}</CardTitle>
                    <CardDescription>
                      {project.budgets.length} budget categories • {project.tasks.length} tasks • {taskProgress.toFixed(0)}% complete
                    </CardDescription>
                  </div>
                  {canEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreateBudget(project.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Budget Category
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {/* Project Budget Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Allocated</span>
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {formatCurrency(projectAllocated)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Spent</span>
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xl font-bold text-gray-900 mt-1">
                      {formatCurrency(projectSpent)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Utilization</span>
                      <BarChart3 className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className={`text-xl font-bold mt-1 ${getUtilizationColor(projectUtilization)}`}>
                      {projectUtilization.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Budget Categories */}
                {project.budgets.length > 0 ? (
                  <div className="space-y-3">
                    {project.budgets.map((budget) => {
                      const categoryUtilization = Number(budget.allocatedAmount) > 0 
                        ? (Number(budget.spentAmount) / Number(budget.allocatedAmount)) * 100 
                        : 0

                      return (
                        <div key={budget.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-medium text-gray-900">{budget.category}</h5>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">
                                {formatCurrency(budget.spentAmount)} / {formatCurrency(budget.allocatedAmount)}
                              </span>
                              {canEdit && (
                                <div className="flex space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditBudget(budget, project.id)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                categoryUtilization >= 90 ? 'bg-red-500' :
                                categoryUtilization >= 75 ? 'bg-orange-500' :
                                categoryUtilization >= 50 ? 'bg-yellow-500' :
                                'bg-green-500'
                              }`}
                              style={{ width: `${Math.min(categoryUtilization, 100)}%` }}
                            />
                          </div>
                          
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Remaining: {formatCurrency(Number(budget.allocatedAmount) - Number(budget.spentAmount))}</span>
                            <span className={getUtilizationColor(categoryUtilization)}>
                              {categoryUtilization.toFixed(1)}% utilized
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No budget categories</h4>
                    <p className="text-gray-500 mb-4">Set up budget categories to track project expenses</p>
                    {canEdit && (
                      <Button onClick={() => handleCreateBudget(project.id)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Budget Category
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Budget Form Modal */}
      {showBudgetForm && (
        <BudgetForm
          isOpen={showBudgetForm}
          onClose={() => {
            setShowBudgetForm(false)
            setSelectedProject('')
            setEditingBudget(null)
          }}
          onSubmitted={handleBudgetSubmitted}
          organizationSlug={organizationSlug}
          projects={projects}
          selectedProjectId={selectedProject}
          editingBudget={editingBudget}
        />
      )}
    </div>
  )
}
