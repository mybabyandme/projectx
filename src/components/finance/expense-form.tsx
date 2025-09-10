'use client'

import { useState } from 'react'
import { X, Upload, DollarSign, Calendar, FileText, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'

interface ExpenseFormProps {
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
      spentAmount: number
    }>
  }>
  userId: string
}

export default function ExpenseForm({
  isOpen,
  onClose,
  onSubmitted,
  organizationSlug,
  projects,
  userId
}: ExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    projectId: '',
    category: '',
    amount: '',
    description: '',
    expenseDate: new Date().toISOString().split('T')[0],
    receipt: null as File | null,
  })

  const selectedProject = projects.find(p => p.id === formData.projectId)
  const availableCategories = selectedProject?.budgets || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.projectId || !formData.amount || !formData.description) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await fetch(`/api/organizations/${organizationSlug}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: formData.projectId,
          category: formData.category || 'General',
          amount: parseFloat(formData.amount),
          description: formData.description,
          expenseDate: formData.expenseDate,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit expense')
      }

      const result = await response.json()
      
      toast({
        title: "Success",
        description: "Expense submitted successfully and is pending approval",
      })
      
      onSubmitted()
    } catch (error) {
      console.error('Error submitting expense:', error)
      toast({
        title: "Error",
        description: "Failed to submit expense. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 5MB",
          variant: "destructive",
        })
        return
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Error",
          description: "Only JPEG, PNG, GIF, and PDF files are allowed",
          variant: "destructive",
        })
        return
      }
      
      setFormData({ ...formData, receipt: file })
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
              <DollarSign className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Record Expense</h2>
              <p className="text-sm text-gray-600">Submit a new expense for approval</p>
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
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value, category: '' })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a project...</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Category
            </label>
            {availableCategories.length > 0 ? (
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a category (optional)</option>
                {availableCategories.map((budget) => (
                  <option key={budget.id} value={budget.category}>
                    {budget.category} (${budget.allocatedAmount - budget.spentAmount} remaining)
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">
                  {formData.projectId ? 'No budget categories set up for this project' : 'Select a project first'}
                </span>
              </div>
            )}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (USD) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                required
                className="pl-10"
              />
            </div>
          </div>

          {/* Expense Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Expense Date *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="date"
                value={formData.expenseDate}
                onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                required
                className="pl-10"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the expense (e.g., office supplies, travel costs, equipment purchase...)"
              rows={3}
              required
              className="w-full"
            />
          </div>

          {/* Receipt Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Receipt (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                type="file"
                id="receipt"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <label 
                htmlFor="receipt" 
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {formData.receipt 
                    ? `Selected: ${formData.receipt.name}`
                    : 'Click to upload receipt (JPEG, PNG, GIF, PDF - Max 5MB)'
                  }
                </span>
              </label>
            </div>
          </div>

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
                  Submitting...
                </>
              ) : (
                <>
                  <DollarSign className="h-4 w-4 mr-2" />
                  Submit Expense
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
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start">
              <FileText className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Expense Review Process</p>
                <p className="mt-1">
                  Your expense will be reviewed by project managers or donors/sponsors. 
                  You'll receive notifications about the approval status.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
