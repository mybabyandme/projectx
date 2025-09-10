'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Plus, Clock, DollarSign, FileText, CheckCircle2, 
  AlertCircle, X, Loader2 
} from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface QuickActionsProps {
  orgSlug: string
  userRole: string
  projects: Array<{
    id: string
    name: string
  }>
}

interface QuickActionModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

const QuickActionModal = ({ isOpen, onClose, title, children }: QuickActionModalProps) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function QuickActions({ orgSlug, userRole, projects }: QuickActionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState<'task' | 'expense' | 'progress' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Quick Add Task State
  const [taskData, setTaskData] = useState({
    title: '',
    projectId: '',
    priority: 'MEDIUM',
  })

  // Log Expense State
  const [expenseData, setExpenseData] = useState({
    projectId: '',
    amount: '',
    category: '',
    description: '',
  })

  // Progress Report State
  const [progressData, setProgressData] = useState({
    projectId: '',
    content: '',
    reportType: 'WEEKLY',
  })

  const openModal = (type: 'task' | 'expense' | 'progress') => {
    setModalType(type)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setModalType(null)
    // Reset forms
    setTaskData({ title: '', projectId: '', priority: 'MEDIUM' })
    setExpenseData({ projectId: '', amount: '', category: '', description: '' })
    setProgressData({ projectId: '', content: '', reportType: 'WEEKLY' })
  }

  const handleQuickAddTask = async () => {
    if (!taskData.title.trim() || !taskData.projectId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/organizations/${orgSlug}/dashboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'quick_add_task',
          data: taskData,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Success",
          description: result.message,
        })
        closeModal()
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        throw new Error('Failed to create task')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLogExpense = async () => {
    if (!expenseData.projectId || !expenseData.amount || !expenseData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/organizations/${orgSlug}/dashboard`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'log_expense',
          data: {
            ...expenseData,
            amount: parseFloat(expenseData.amount),
          },
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Success",
          description: result.message,
        })
        closeModal()
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        throw new Error('Failed to log expense')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitProgress = () => {
    // For now, redirect to the progress reports page
    window.location.href = `/${orgSlug}/reports/new?projectId=${progressData.projectId}&type=${progressData.reportType}`
  }

  const modalContent = () => {
    switch (modalType) {
      case 'task':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Title *
              </label>
              <Input
                value={taskData.title}
                onChange={(e) => setTaskData({ ...taskData, title: e.target.value })}
                placeholder="Enter task title..."
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project *
              </label>
              <select
                value={taskData.projectId}
                onChange={(e) => setTaskData({ ...taskData, projectId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a project...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={taskData.priority}
                onChange={(e) => setTaskData({ ...taskData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleQuickAddTask}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
            </div>
          </div>
        )

      case 'expense':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project *
              </label>
              <select
                value={expenseData.projectId}
                onChange={(e) => setExpenseData({ ...expenseData, projectId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a project...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (USD) *
              </label>
              <Input
                type="number"
                step="0.01"
                value={expenseData.amount}
                onChange={(e) => setExpenseData({ ...expenseData, amount: e.target.value })}
                placeholder="0.00"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <Input
                value={expenseData.category}
                onChange={(e) => setExpenseData({ ...expenseData, category: e.target.value })}
                placeholder="e.g., Materials, Travel, Equipment..."
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <Textarea
                value={expenseData.description}
                onChange={(e) => setExpenseData({ ...expenseData, description: e.target.value })}
                placeholder="Describe the expense..."
                rows={3}
                className="w-full"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleLogExpense}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Logging...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Log Expense
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
            </div>
          </div>
        )

      case 'progress':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project *
              </label>
              <select
                value={progressData.projectId}
                onChange={(e) => setProgressData({ ...progressData, projectId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a project...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                value={progressData.reportType}
                onChange={(e) => setProgressData({ ...progressData, reportType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="DAILY">Daily Update</option>
                <option value="WEEKLY">Weekly Report</option>
                <option value="MONTHLY">Monthly Summary</option>
                <option value="MILESTONE">Milestone Report</option>
              </select>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                You'll be redirected to the full progress report form where you can add detailed information.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSubmitProgress}
                disabled={!progressData.projectId}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                Create Report
              </Button>
              <Button variant="outline" onClick={closeModal}>
                Cancel
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const modalTitles = {
    task: 'Quick Add Task',
    expense: 'Log Expense',
    progress: 'Progress Report',
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Add Task - Available to all roles */}
        <button
          onClick={() => openModal('task')}
          className="flex items-start p-4 rounded-lg transition-colors border-2 border-transparent hover:border-blue-200 text-blue-600 bg-blue-50 hover:bg-blue-100"
        >
          <div className="p-2 rounded-lg bg-white shadow-sm mr-4">
            <Plus className="h-5 w-5" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-gray-900">Add Task</h3>
            <p className="text-sm text-gray-600 mt-1">Quickly create a new task</p>
          </div>
        </button>

        {/* Report Expense - For PM, Team Member, Monitor roles */}
        {['PROJECT_MANAGER', 'TEAM_MEMBER', 'MONITOR', 'ORG_ADMIN'].includes(userRole) && (
          <button
            onClick={() => openModal('expense')}
            className="flex items-start p-4 rounded-lg transition-colors border-2 border-transparent hover:border-green-200 text-green-600 bg-green-50 hover:bg-green-100"
          >
            <div className="p-2 rounded-lg bg-white shadow-sm mr-4">
              <DollarSign className="h-5 w-5" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Report Expense</h3>
              <p className="text-sm text-gray-600 mt-1">Log project expense</p>
            </div>
          </button>
        )}

        {/* Progress Report - For PM, Monitor roles */}
        {['PROJECT_MANAGER', 'MONITOR', 'ORG_ADMIN'].includes(userRole) && (
          <button
            onClick={() => openModal('progress')}
            className="flex items-start p-4 rounded-lg transition-colors border-2 border-transparent hover:border-purple-200 text-purple-600 bg-purple-50 hover:bg-purple-100"
          >
            <div className="p-2 rounded-lg bg-white shadow-sm mr-4">
              <FileText className="h-5 w-5" />
            </div>
            <div className="text-left">
              <h3 className="font-medium text-gray-900">Progress Report</h3>
              <p className="text-sm text-gray-600 mt-1">Submit project update</p>
            </div>
          </button>
        )}
      </div>

      {/* Modal */}
      <QuickActionModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalType ? modalTitles[modalType] : ''}
      >
        {modalContent()}
      </QuickActionModal>
    </>
  )
}
