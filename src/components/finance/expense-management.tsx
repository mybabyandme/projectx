'use client'

import { useState } from 'react'
import { 
  Plus, Search, Filter, DollarSign, Calendar, User, 
  FileText, CheckCircle, XCircle, Clock, Download,
  AlertCircle, TrendingUp, CreditCard, Receipt
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ExpenseForm from './expense-form'
import ExpenseList from './expense-list'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ExpenseManagementProps {
  organizationSlug: string
  userRole: string
  userId: string
  projects: Array<{
    id: string
    name: string
    status: string
    budgets: Array<{
      id: string
      category: string
      allocatedAmount: number
      spentAmount: number
    }>
  }>
  expenses: Array<{
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
  }>
  canApprove: boolean
}

export default function ExpenseManagement({
  organizationSlug,
  userRole,
  userId,
  projects,
  expenses,
  canApprove
}: ExpenseManagementProps) {
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')

  // Calculate summary statistics
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const pendingExpenses = expenses.filter(e => e.status === 'PENDING')
  const approvedExpenses = expenses.filter(e => e.status === 'APPROVED')
  const rejectedExpenses = expenses.filter(e => e.status === 'REJECTED')
  
  const totalPending = pendingExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const totalApproved = approvedExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expense.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || expense.status.toLowerCase() === statusFilter
    const matchesProject = projectFilter === 'all' || expense.projectId === projectFilter
    
    return matchesSearch && matchesStatus && matchesProject
  })

  const handleExpenseSubmitted = () => {
    setShowExpenseForm(false)
    // Refresh the page to show new expense
    window.location.reload()
  }

  return (
    <div className="p-6 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Expense Management</h1>
          <p className="mt-2 text-gray-600">
            Track and manage project expenses and budget utilization
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button 
            onClick={() => setShowExpenseForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Record Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(totalExpenses)}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {expenses.length} total transactions
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-3xl font-bold text-orange-600">
                  {formatCurrency(totalPending)}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {pendingExpenses.length} pending requests
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(totalApproved)}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {approvedExpenses.length} approved expenses
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejection Rate</p>
                <p className="text-3xl font-bold text-red-600">
                  {expenses.length > 0 ? Math.round((rejectedExpenses.length / expenses.length) * 100) : 0}%
                </p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {rejectedExpenses.length} rejected expenses
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search expenses by description, project, or category..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Project Filter */}
            <div className="sm:w-48">
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Export Button */}
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Expense List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Expense Transactions</CardTitle>
          <CardDescription>
            {filteredExpenses.length} of {expenses.length} expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseList
            expenses={filteredExpenses}
            canApprove={canApprove}
            organizationSlug={organizationSlug}
            currentUserId={userId}
          />
        </CardContent>
      </Card>

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <ExpenseForm
          isOpen={showExpenseForm}
          onClose={() => setShowExpenseForm(false)}
          onSubmitted={handleExpenseSubmitted}
          organizationSlug={organizationSlug}
          projects={projects}
          userId={userId}
        />
      )}
    </div>
  )
}
