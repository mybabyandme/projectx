'use client'

import { useState, useEffect } from 'react'
import { X, DollarSign, Target, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'

interface BudgetFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmitted: () => void
  organizationSlug: string
  projects: Array<{
    id: string
    name: string
    budgets: Array<{
      id: string
      category: string
      allocatedAmount: number
    }>
  }>
  selectedProjectId?: string
  editingBudget?: any
}

export default function BudgetForm({
  isOpen,
  onClose,
  onSubmitted,
  organizationSlug,
  projects,
  selectedProjectId = '',
  editingBudget = null
}: BudgetFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    projectId: selectedProjectId,
    category: '',
    allocatedAmount: '',
    description: '',
  })

  // Set form data when editing
  useEffect(() => {
    if (editingBudget) {
      setFormData({
        projectId: selectedProjectId,
        category: editingBudget.category,
        allocatedAmount: editingBudget.allocatedAmount.toString(),
        description: editingBudget.metadata?.description || '',
      })
    } else {
      setFormData({
        projectId: selectedProjectId,
        category: '',
        allocatedAmount: '',
        description: '',
      })
    }
  }, [editingBudget, selectedProjectId])

  const selectedProject = projects.find(p => p.id === formData.projectId)
  const existingCategories = selectedProject?.budgets?.map(b => b.category.toLowerCase()) || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.projectId || !formData.category || !formData.allocatedAmount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Check for duplicate category when creating
    if (!editingBudget && existingCategories.includes(formData.category.toLowerCase())) {
      toast({
        title: "Error",
        description: "A budget category with this name already exists for this project",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const url = editingBudget 
        ? `/api/organizations/${organizationSlug}/budgets/${editingBudget.id}`
        : `/api/organizations/${organizationSlug}/budgets`
      
      const method = editingBudget ? 'PATCH' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: formData.projectId,
          category: formData.category,
          allocatedAmount: parseFloat(formData.allocatedAmount),
          description: formData.description,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save budget')
      }

      const result = await response.json()
      
      toast({
        title: "Success",
        description: editingBudget 
          ? "Budget category updated successfully"
          : "Budget category created successfully",
      })
      
      onSubmitted()
    } catch (error: any) {
      console.error('Error saving budget:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to save budget. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {editingBudget ? 'Edit Budget Category' : 'Create Budget Category'}
              </h2>
              <p className="text-sm text-gray-600">
                {editingBudget ? 'Update budget allocation and details' : 'Set up a new budget category for project expenses'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project *
            </label>
            <select
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              required
              disabled={!!selectedProjectId || !!editingBudget}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">Select a project...</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name *
            </label>
            <Input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Materials, Labor, Equipment, Travel..."
              required
              disabled={!!editingBudget}
              className={editingBudget ? 'bg-gray-100' : ''}
            />
            {editingBudget && (
              <p className="text-xs text-gray-500 mt-1">
                Category name cannot be changed after creation
              </p>
            )}
          </div>

          {/* Allocated Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allocated Amount (USD) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.allocatedAmount}
                onChange={(e) => setFormData({ ...formData, allocatedAmount: e.target.value })}
                placeholder="0.00"
                required
                className="pl-10"
              />
            </div>
            {editingBudget && editingBudget.spentAmount > 0 && (
              <p className="text-xs text-yellow-600 mt-1 flex items-center">
                <AlertCircle className="h-3 w-3 mr-1" />
                Current spent amount: ${editingBudget.spentAmount}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this budget category covers..."
              rows={3}
              className="w-full"
            />
          </div>

          {/* Existing Categories Info */}
          {formData.projectId && selectedProject && selectedProject.budgets.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Existing Categories for this Project:</h4>
              <div className="flex flex-wrap gap-2">
                {selectedProject.budgets.map((budget) => (
                  <span 
                    key={budget.id}
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {budget.category} (${budget.allocatedAmount})
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editingBudget ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  {editingBudget ? 'Update Budget' : 'Create Budget'}
                </>
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>

        {/* Footer Note */}
        <div className="px-6 pb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-4 w-4 text-gray-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-gray-700">
                <p className="font-medium">Budget Category Guidelines</p>
                <ul className="mt-1 space-y-1 text-xs">
                  <li>• Budget categories help organize project expenses</li>
                  <li>• Set realistic allocations based on project requirements</li>
                  <li>• Categories cannot be renamed after creation</li>
                  <li>• Allocated amounts can be adjusted as needed</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
