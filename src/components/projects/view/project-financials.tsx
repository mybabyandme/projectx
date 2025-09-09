'use client'

import { useState } from 'react'
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, PieChart, BarChart3, Calendar, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ProjectFinancialsProps {
  project: any
  canEdit: boolean
}

export default function ProjectFinancials({ 
  project, 
  canEdit 
}: ProjectFinancialsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  
  const budgets = project.budgets || []
  const totalAllocated = budgets.reduce((sum: number, budget: any) => sum + Number(budget.allocatedAmount), 0)
  const totalSpent = budgets.reduce((sum: number, budget: any) => sum + Number(budget.spentAmount), 0)
  const totalApproved = budgets.reduce((sum: number, budget: any) => sum + Number(budget.approvedAmount), 0)
  const remaining = totalAllocated - totalSpent
  const spentPercentage = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0

  const getBudgetHealthColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 75) return 'text-orange-600'
    if (percentage >= 50) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getBudgetHealthBg = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-50 border-red-200'
    if (percentage >= 75) return 'bg-orange-50 border-orange-200'
    if (percentage >= 50) return 'bg-yellow-50 border-yellow-200'
    return 'bg-green-50 border-green-200'
  }

  return (
    <div className="p-6 space-y-8">
      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalAllocated, project.currency)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalSpent, project.currency)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-2">
            <p className={`text-sm font-medium ${getBudgetHealthColor(spentPercentage)}`}>
              {spentPercentage.toFixed(1)}% of budget
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Remaining</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(remaining, project.currency)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(totalApproved, project.currency)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <PieChart className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Budget Health Alert */}
      {spentPercentage >= 75 && (
        <div className={`rounded-lg border p-4 ${getBudgetHealthBg(spentPercentage)}`}>
          <div className="flex items-center">
            <AlertCircle className={`h-5 w-5 mr-3 ${getBudgetHealthColor(spentPercentage)}`} />
            <div>
              <h3 className={`font-medium ${getBudgetHealthColor(spentPercentage)}`}>
                Budget Alert
              </h3>
              <p className={`text-sm mt-1 ${getBudgetHealthColor(spentPercentage)}`}>
                {spentPercentage >= 90 
                  ? 'Critical: Budget is nearly exhausted. Immediate attention required.'
                  : 'Warning: Budget utilization is high. Monitor spending closely.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Budget Progress Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Budget Utilization</h3>
          <span className={`text-sm font-medium ${getBudgetHealthColor(spentPercentage)}`}>
            {spentPercentage.toFixed(1)}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
          <div
            className={`h-4 rounded-full transition-all duration-300 ${
              spentPercentage >= 90 ? 'bg-red-500' :
              spentPercentage >= 75 ? 'bg-orange-500' :
              spentPercentage >= 50 ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${Math.min(spentPercentage, 100)}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm text-gray-600">
          <span>{formatCurrency(0, project.currency)}</span>
          <span>{formatCurrency(totalAllocated, project.currency)}</span>
        </div>
      </div>

      {/* Budget Breakdown */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Budget Breakdown</h3>
          {canEdit && (
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          )}
        </div>

        {budgets.length > 0 ? (
          <div className="space-y-4">
            {budgets.map((budget: any, index: number) => {
              const categorySpentPercentage = Number(budget.allocatedAmount) > 0 
                ? (Number(budget.spentAmount) / Number(budget.allocatedAmount)) * 100 
                : 0

              return (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{budget.category}</h4>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(budget.spentAmount, project.currency)} / {formatCurrency(budget.allocatedAmount, project.currency)}
                      </p>
                      <p className={`text-xs ${getBudgetHealthColor(categorySpentPercentage)}`}>
                        {categorySpentPercentage.toFixed(1)}% utilized
                      </p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        categorySpentPercentage >= 90 ? 'bg-red-500' :
                        categorySpentPercentage >= 75 ? 'bg-orange-500' :
                        categorySpentPercentage >= 50 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(categorySpentPercentage, 100)}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>Remaining: {formatCurrency(Number(budget.allocatedAmount) - Number(budget.spentAmount), project.currency)}</span>
                    <span>Approved: {formatCurrency(budget.approvedAmount, project.currency)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No budget categories</h4>
            <p className="text-gray-500 mb-4">Set up budget categories to track expenses</p>
            {canEdit && (
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Budget Categories
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Financial Timeline */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Financial Timeline</h3>
        
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-4"></div>
            <div className="flex-1">
              <h4 className="font-medium text-green-900">Project Budget Approved</h4>
              <p className="text-sm text-green-700">
                Initial budget of {formatCurrency(totalAllocated, project.currency)} was approved
              </p>
            </div>
            <div className="text-sm text-green-600">
              {formatDate(project.createdAt)}
            </div>
          </div>

          {totalSpent > 0 && (
            <div className="flex items-center p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-4"></div>
              <div className="flex-1">
                <h4 className="font-medium text-blue-900">Expenses Recorded</h4>
                <p className="text-sm text-blue-700">
                  {formatCurrency(totalSpent, project.currency)} in expenses have been recorded
                </p>
              </div>
              <div className="text-sm text-blue-600">
                Recent
              </div>
            </div>
          )}

          {spentPercentage >= 75 && (
            <div className="flex items-center p-3 bg-orange-50 rounded-lg">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-4"></div>
              <div className="flex-1">
                <h4 className="font-medium text-orange-900">Budget Threshold Reached</h4>
                <p className="text-sm text-orange-700">
                  {spentPercentage.toFixed(1)}% of budget has been utilized
                </p>
              </div>
              <div className="text-sm text-orange-600">
                <AlertCircle className="h-4 w-4" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {canEdit && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="justify-start">
              <Plus className="h-4 w-4 mr-2" />
              Record Expense
            </Button>
            
            <Button variant="outline" className="justify-start">
              <DollarSign className="h-4 w-4 mr-2" />
              Request Funds
            </Button>
            
            <Button variant="outline" className="justify-start">
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
