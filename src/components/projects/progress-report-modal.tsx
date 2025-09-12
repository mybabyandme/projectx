'use client'

import { useState } from 'react'
import { 
  FileText, Plus, Calendar, TrendingUp, AlertTriangle,
  CheckCircle, Clock, X, Upload, Target, Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/components/ui/use-toast'

interface ProgressReportModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmitted: () => void
  project: any
  organizationSlug: string
  userRole: string
}

const REPORT_TYPES = [
  {
    id: 'WEEKLY',
    name: 'Weekly Progress Report',
    description: 'Weekly update on project progress and activities',
    icon: Calendar,
    template: {
      sections: ['Activities Completed', 'Upcoming Activities', 'Issues & Risks', 'Budget Status']
    }
  },
  {
    id: 'MONTHLY',
    name: 'Monthly Status Report',
    description: 'Comprehensive monthly project status and metrics',
    icon: TrendingUp,
    template: {
      sections: ['Executive Summary', 'Progress Metrics', 'Financial Status', 'Risk Assessment', 'Next Month Plan']
    }
  },
  {
    id: 'MILESTONE',
    name: 'Milestone Report',
    description: 'Report on milestone completion and achievements',
    icon: Target,
    template: {
      sections: ['Milestone Overview', 'Deliverables Completed', 'Quality Metrics', 'Lessons Learned']
    }
  },
  {
    id: 'INCIDENT',
    name: 'Incident Report',
    description: 'Report on project incidents and corrective actions',
    icon: AlertTriangle,
    template: {
      sections: ['Incident Description', 'Impact Analysis', 'Root Cause', 'Corrective Actions', 'Prevention Measures']
    }
  },
  {
    id: 'STAKEHOLDER',
    name: 'Stakeholder Update',
    description: 'Update for stakeholders and sponsors',
    icon: Users,
    template: {
      sections: ['Project Overview', 'Key Achievements', 'Financial Summary', 'Upcoming Milestones', 'Support Needed']
    }
  }
]

export default function ProgressReportModal({
  isOpen,
  onClose,
  onSubmitted,
  project,
  organizationSlug,
  userRole
}: ProgressReportModalProps) {
  const [step, setStep] = useState<'type' | 'content'>('type')
  const [selectedType, setSelectedType] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    progressPercentage: '',
    budgetStatus: '',
    issuesRisks: '',
    nextSteps: '',
    attachments: [] as File[]
  })

  const selectedTemplate = REPORT_TYPES.find(type => type.id === selectedType)

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId)
    const template = REPORT_TYPES.find(t => t.id === typeId)
    if (template) {
      setFormData(prev => ({
        ...prev,
        title: `${template.name} - ${new Date().toLocaleDateString()}`
      }))
    }
    setStep('content')
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }))
  }

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.summary) {
      toast({
        title: "Error",
        description: "Please fill in the required fields",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Create the report content structure
      const reportContent = {
        title: formData.title,
        summary: formData.summary,
        reportType: selectedType,
        progress: {
          percentage: parseFloat(formData.progressPercentage) || 0,
          description: formData.content
        },
        budget: {
          status: formData.budgetStatus,
          notes: 'Budget tracking information'
        },
        issues: formData.issuesRisks,
        nextSteps: formData.nextSteps,
        sections: selectedTemplate?.template.sections || [],
        generatedAt: new Date().toISOString(),
        reporterId: userRole,
      }

      const response = await fetch(`/api/organizations/${organizationSlug}/projects/${project.id}/progress-reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType: selectedType,
          content: reportContent,
          status: 'SUBMITTED'
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create progress report')
      }

      const result = await response.json()
      
      toast({
        title: "Success",
        description: "Progress report created successfully",
      })
      
      onSubmitted()
      onClose()
      
      // Reset form
      setStep('type')
      setSelectedType('')
      setFormData({
        title: '',
        summary: '',
        content: '',
        progressPercentage: '',
        budgetStatus: '',
        issuesRisks: '',
        nextSteps: '',
        attachments: []
      })
      
    } catch (error: any) {
      console.error('Error creating progress report:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create progress report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {step === 'type' ? 'Create Progress Report' : `${selectedTemplate?.name}`}
              </h2>
              <p className="text-sm text-gray-600">
                {step === 'type' 
                  ? 'Choose a report type and create your progress update' 
                  : 'Fill in the report details and submit for review'
                }
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

        {/* Content */}
        <div className="p-6">
          {step === 'type' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-4">Select Report Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {REPORT_TYPES.map((type) => {
                    const IconComponent = type.icon
                    return (
                      <Card 
                        key={type.id}
                        className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200"
                        onClick={() => handleTypeSelect(type.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="p-2 bg-gray-50 rounded-lg">
                              <IconComponent className="h-5 w-5 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{type.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                              <div className="mt-2">
                                <p className="text-xs text-gray-500">Includes:</p>
                                <p className="text-xs text-gray-600">
                                  {type.template.sections.slice(0, 3).join(', ')}
                                  {type.template.sections.length > 3 && '...'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 'content' && selectedTemplate && (
            <div className="space-y-6">
              {/* Back Button */}
              <Button
                variant="outline"
                onClick={() => setStep('type')}
                className="mb-4"
              >
                ← Back to Report Types
              </Button>

              {/* Report Form */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Report Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Report Title *
                        </label>
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter report title..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Executive Summary *
                        </label>
                        <Textarea
                          value={formData.summary}
                          onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                          placeholder="Provide a brief summary of the reporting period..."
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Progress Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Progress Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Progress Percentage
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={formData.progressPercentage}
                            onChange={(e) => setFormData(prev => ({ ...prev, progressPercentage: e.target.value }))}
                            placeholder="0-100"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Budget Status
                          </label>
                          <select
                            value={formData.budgetStatus}
                            onChange={(e) => setFormData(prev => ({ ...prev, budgetStatus: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select status...</option>
                            <option value="ON_TRACK">On Track</option>
                            <option value="UNDER_BUDGET">Under Budget</option>
                            <option value="OVER_BUDGET">Over Budget</option>
                            <option value="NEEDS_REVIEW">Needs Review</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Detailed Progress Description
                        </label>
                        <Textarea
                          value={formData.content}
                          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Describe the work completed, challenges faced, and progress made..."
                          rows={4}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Issues and Next Steps */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Issues & Next Steps</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Issues & Risks
                        </label>
                        <Textarea
                          value={formData.issuesRisks}
                          onChange={(e) => setFormData(prev => ({ ...prev, issuesRisks: e.target.value }))}
                          placeholder="Describe any issues, risks, or blockers encountered..."
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Next Steps
                        </label>
                        <Textarea
                          value={formData.nextSteps}
                          onChange={(e) => setFormData(prev => ({ ...prev, nextSteps: e.target.value }))}
                          placeholder="Outline the planned activities for the next period..."
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Attachments */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Attachments</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <input
                            type="file"
                            id="file-upload"
                            multiple
                            onChange={handleFileUpload}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                          />
                          <label
                            htmlFor="file-upload"
                            className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                          >
                            <div className="text-center">
                              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">Click to upload files</p>
                              <p className="text-xs text-gray-500">PDF, DOC, XLS, Images</p>
                            </div>
                          </label>
                        </div>

                        {formData.attachments.length > 0 && (
                          <div className="space-y-2">
                            {formData.attachments.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span className="text-sm text-gray-700">{file.name}</span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeAttachment(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Template Sections */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Report Sections</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedTemplate.template.sections.map((section, index) => (
                          <div key={index} className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span>{section}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Project Context */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Project Context</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Project:</span>
                          <p className="text-gray-600">{project.name}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Status:</span>
                          <p className="text-gray-600">{project.status}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Methodology:</span>
                          <p className="text-gray-600">{project.methodology}</p>
                        </div>
                        {project.metrics && (
                          <div>
                            <span className="font-medium text-gray-700">Current Progress:</span>
                            <p className="text-gray-600">{project.metrics.taskCompletionRate?.toFixed(1)}%</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Submit Button */}
                  <div className="space-y-3">
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4 mr-2" />
                          Submit Report
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
