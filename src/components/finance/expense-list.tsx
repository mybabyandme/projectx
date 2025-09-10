'use client'

import { useState } from 'react'
import { 
  Check, X, Clock, User, Calendar, DollarSign, 
  ChevronDown, FileText, AlertCircle, CheckCircle, XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'

interface Expense {
  id: string
  budgetId: string
  projectId: string
  projectName: string
  category: string
  amount: number
  description: string
  reportedBy: string
  reportedAt: Date
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  approvedBy?: string
  approvedAt?: Date
}

interface ExpenseListProps {
  expenses: Expense[]
  canApprove: boolean
  organizationSlug: string
  currentUserId: string
}

export default function ExpenseList({ 
  expenses, 
  canApprove, 
  organizationSlug,
  currentUserId 
}: ExpenseListProps) {
  const [expandedExpense, setExpandedExpense] = useState<string | null>(null)
  const [processingExpense, setProcessingExpense] = useState<string | null>(null)

  const handleApproveExpense = async (expense: Expense) => {
    setProcessingExpense(expense.id)
    
    try {
      const response = await fetch(`/api/organizations/${organizationSlug}/expenses/${expense.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to approve expense')
      }

      toast({
        title: "Success",
        description: "Expense approved successfully",
      })
      
      // Refresh the page to show updated status
      window.location.reload()
    } catch (error) {
      console.error('Error approving expense:', error)
      toast({
        title: "Error",
        description: "Failed to approve expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingExpense(null)
    }
  }

  const handleRejectExpense = async (expense: Expense) => {
    setProcessingExpense(expense.id)
    
    try {
      const response = await fetch(`/api/organizations/${organizationSlug}/expenses/${expense.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to reject expense')
      }

      toast({
        title: "Success",
        description: "Expense rejected",
      })
      
      // Refresh the page to show updated status
      window.location.reload()
    } catch (error) {
      console.error('Error rejecting expense:', error)
      toast({
        title: "Error",
        description: "Failed to reject expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setProcessingExpense(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'PENDING':
      default:
        return <Clock className="h-4 w-4 text-orange-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'PENDING':
      default:
        return 'bg-orange-100 text-orange-800 border-orange-200'
    }
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12">
        <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
        <p className="text-gray-600">No expenses match your current filters</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {expenses.map((expense) => (
        <div
          key={expense.id}
          className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
        >
          {/* Main expense row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              {/* Status icon */}
              <div className="flex-shrink-0">
                {getStatusIcon(expense.status)}
              </div>

              {/* Expense details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <h4 className="font-medium text-gray-900 truncate">
                    {expense.description}
                  </h4>
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(expense.status)}`}>
                    {expense.status}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                  <span className="flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {formatCurrency(expense.amount)}
                  </span>
                  <span className="flex items-center">
                    <FileText className="h-3 w-3 mr-1" />
                    {expense.projectName}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(expense.reportedAt)}
                  </span>
                  {expense.category && (
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {expense.category}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              {/* Approval buttons for pending expenses */}
              {canApprove && expense.status === 'PENDING' && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApproveExpense(expense)}
                    disabled={processingExpense === expense.id}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRejectExpense(expense)}
                    disabled={processingExpense === expense.id}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </>
              )}

              {/* Expand/collapse button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedExpense(
                  expandedExpense === expense.id ? null : expense.id
                )}
                className="p-1"
              >
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${
                    expandedExpense === expense.id ? 'rotate-180' : ''
                  }`} 
                />
              </Button>
            </div>
          </div>

          {/* Expanded details */}
          {expandedExpense === expense.id && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left column */}
                <div className="space-y-3">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Description</h5>
                    <p className="text-sm text-gray-900 mt-1">{expense.description}</p>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Project & Category</h5>
                    <p className="text-sm text-gray-900 mt-1">
                      {expense.projectName}
                      {expense.category && (
                        <span className="text-gray-500"> • {expense.category}</span>
                      )}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Amount</h5>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {formatCurrency(expense.amount)}
                    </p>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-3">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Submitted By</h5>
                    <div className="flex items-center mt-1">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2">
                        {expense.reportedBy.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm text-gray-900">User #{expense.reportedBy.slice(-8)}</span>
                    </div>
                  </div>

                  <div>
                    <h5 className="text-sm font-medium text-gray-700">Submitted Date</h5>
                    <p className="text-sm text-gray-900 mt-1">
                      {formatDate(expense.reportedAt)}
                    </p>
                  </div>

                  {expense.status !== 'PENDING' && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-700">
                        {expense.status === 'APPROVED' ? 'Approved' : 'Rejected'} By
                      </h5>
                      <div className="flex items-center mt-1">
                        {expense.approvedBy && (
                          <>
                            <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-medium mr-2">
                              {expense.approvedBy.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm text-gray-900">User #{expense.approvedBy.slice(-8)}</span>
                          </>
                        )}
                      </div>
                      {expense.approvedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          on {formatDate(expense.approvedAt)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Processing indicator */}
              {processingExpense === expense.id && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-sm text-blue-800">Processing request...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
