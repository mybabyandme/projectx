'use client'

import { useState } from 'react'
import { 
  FileText, Plus, Calendar, TrendingUp, AlertTriangle,
  CheckCircle, Clock, X, Upload, Target, Users, BarChart3,
  Download, Send, Save, Eye, Edit
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { toast } from '@/components/ui/use-toast'
import { formatDate, formatCurrency } from '@/lib/utils'

interface EnhancedProgressReportModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmitted: () => void
  project: any
  organizationSlug: string
  userRole: string
  userId: string
}

const ENHANCED_REPORT_TYPES = [
  {
    id: 'WEEKLY',
    name: 'Weekly Progress Report',
    description: 'Weekly update on project progress and activities',
    icon: Calendar,
    template: {
      sections: ['Activities Completed', 'Upcoming Activities', 'Issues & Risks', 'Budget Status'],
      frequency: 'Weekly',
      stakeholders: ['Project Team', 'Project Manager']
    }
  },
  {
    id: 'MONTHLY',
    name: 'Monthly Status Report',
    description: 'Comprehensive monthly project status and metrics',
    icon: TrendingUp,
    template: {
      sections: ['Executive Summary', 'Progress Metrics', 'Financial Status', 'Risk Assessment', 'Next Month Plan'],
      frequency: 'Monthly',
      stakeholders: ['Senior Management', 'Sponsors', 'Stakeholders']
    }
  },
  {
    id: 'MILESTONE',
    name: 'Milestone Report',
    description: 'Report on milestone completion and achievements',
    icon: Target,
    template: {
      sections: ['Milestone Overview', 'Deliverables Completed', 'Quality Metrics', 'Lessons Learned'],
      frequency: 'Event-based',
      stakeholders: ['Project Sponsors', 'Steering Committee']
    }
  },
  {
    id: 'STAKEHOLDER',
    name: 'Stakeholder Update',
    description: 'Tailored update for stakeholders and sponsors',
    icon: Users,
    template: {
      sections: ['Project Overview', 'Key Achievements', 'Financial Summary', 'Upcoming Milestones', 'Support Needed'],
      frequency: 'As needed',
      stakeholders: ['External Stakeholders', 'Donors', 'Sponsors']
    }
  },
  {
    id: 'PERFORMANCE',
    name: 'Performance Analysis Report',
    description: 'Detailed performance analysis with metrics and KPIs',
    icon: BarChart3,
    template: {
      sections: ['Performance Metrics', 'Trend Analysis', 'Benchmark Comparison', 'Improvement Recommendations'],
      frequency: 'Quarterly',
      stakeholders: ['Management Team', 'Performance Analysts']
    }
  },
  {
    id: 'INCIDENT',
    name: 'Incident Report',
    description: 'Report on project incidents and corrective actions',
    icon: AlertTriangle,
    template: {
      sections: ['Incident Description', 'Impact Analysis', 'Root Cause', 'Corrective Actions', 'Prevention Measures'],
      frequency: 'As needed',
      stakeholders: ['Project Team', 'Risk Management', 'Quality Assurance']
    }
  }
]

export default function EnhancedProgressReportModal({
  isOpen,
  onClose,
  onSubmitted,
  project,
  organizationSlug,
  userRole,
  userId
}: EnhancedProgressReportModalProps) {
  const [step, setStep] = useState<'type' | 'content' | 'preview'>('type')
  const [selectedType, setSelectedType] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDraft, setIsDraft] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    executiveSummary: '',
    progressDescription: '',
    progressPercentage: '',
    keyAchievements: '',
    challengesIssues: '',
    budgetStatus: '',
    budgetNotes: '',
    riskAssessment: '',
    nextSteps: '',
    recommendations: '',
    supportNeeded: '',
    attachments: [] as File[],
    stakeholderFeedback: '',
    qualityMetrics: '',
    timeline: '',
    resourceUtilization: ''
  })

  const selectedTemplate = ENHANCED_REPORT_TYPES.find(type => type.id === selectedType)

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId)
    const template = ENHANCED_REPORT_TYPES.find(t => t.id === typeId)
    if (template) {
      setFormData(prev => ({
        ...prev,
        title: `${template.name} - ${project.name} - ${new Date().toLocaleDateString()}`
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

  const generateAutoContent = () => {
    const metrics = project.metrics
    const autoContent = {
      progressDescription: `Project ${project.name} is currently ${project.status.toLowerCase()} with ${metrics?.taskCompletionRate?.toFixed(1) || 0}% of tasks completed. `,
      progressPercentage: metrics?.taskCompletionRate?.toString() || '0',
      budgetStatus: metrics?.budgetUtilization > 90 ? 'NEEDS_REVIEW' : 
                   metrics?.budgetUtilization > 75 ? 'ON_TRACK' : 'UNDER_BUDGET',
      budgetNotes: `Budget utilization is at ${metrics?.budgetUtilization?.toFixed(1) || 0}%. Total allocated: ${formatCurrency(metrics?.totalBudget || 0)}, spent: ${formatCurrency(metrics?.spentBudget || 0)}.`,
      riskAssessment: metrics?.overdueTasks > 0 ? 
        `${metrics.overdueTasks} tasks are overdue and require attention. Overall project health: ${metrics.overallHealth}.` :
        `No overdue tasks. Project health is ${metrics?.overallHealth || 'GOOD'}.`
    }

    setFormData(prev => ({
      ...prev,
      ...autoContent
    }))

    toast({
      title: "Auto-content Generated",
      description: "Project metrics have been automatically populated. Review and modify as needed.",
    })
  }

  const handleSubmit = async (asDraft: boolean = false) => {
    if (!formData.title || !formData.summary) {
      toast({
        title: "Error",
        description: "Please fill in the required fields (Title and Summary)",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setIsDraft(asDraft)

    try {
      // Create comprehensive report content
      const reportContent = {
        title: formData.title,
        summary: formData.summary,
        reportType: selectedType,
        template: selectedTemplate?.template,
        
        // Core content sections
        executiveSummary: formData.executiveSummary,
        progress: {
          percentage: parseFloat(formData.progressPercentage) || 0,
          description: formData.progressDescription,
          keyAchievements: formData.keyAchievements,
          timeline: formData.timeline
        },
        
        // Financial information
        budget: {
          status: formData.budgetStatus,
          notes: formData.budgetNotes,
          utilization: project.metrics?.budgetUtilization || 0,
          allocated: project.metrics?.totalBudget || 0,
          spent: project.metrics?.spentBudget || 0
        },
        
        // Risk and issues
        risks: {
          assessment: formData.riskAssessment,
          challengesIssues: formData.challengesIssues,
          mitigation: formData.recommendations
        },
        
        // Forward planning
        nextSteps: formData.nextSteps,
        recommendations: formData.recommendations,
        supportNeeded: formData.supportNeeded,
        
        // Additional metrics
        quality: formData.qualityMetrics,
        resources: formData.resourceUtilization,
        stakeholder: formData.stakeholderFeedback,
        
        // Metadata
        projectMetrics: project.metrics,
        generatedAt: new Date().toISOString(),
        reporterId: userId,
        projectId: project.id,
        organizationSlug: organizationSlug,
        sections: selectedTemplate?.template.sections || [],
        stakeholders: selectedTemplate?.template.stakeholders || []
      }

      const response = await fetch(`/api/organizations/${organizationSlug}/projects/${project.id}/progress-reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportType: selectedType,
          content: reportContent,
          status: asDraft ? 'DRAFT' : 'SUBMITTED',
          isDraft: asDraft
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create progress report')
      }

      const result = await response.json()
      
      toast({
        title: asDraft ? "Draft Saved" : "Report Submitted",
        description: asDraft ? "Progress report saved as draft" : "Progress report submitted successfully",
      })
      
      onSubmitted()
      onClose()
      resetForm()
      
    } catch (error: any) {
      console.error('Error creating progress report:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create progress report. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
      setIsDraft(false)
    }
  }

  const resetForm = () => {
    setStep('type')
    setSelectedType('')
    setFormData({
      title: '', summary: '', executiveSummary: '', progressDescription: '',
      progressPercentage: '', keyAchievements: '', challengesIssues: '',
      budgetStatus: '', budgetNotes: '', riskAssessment: '', nextSteps: '',
      recommendations: '', supportNeeded: '', attachments: [],
      stakeholderFeedback: '', qualityMetrics: '', timeline: '', resourceUtilization: ''
    })
  }

  const goToPreview = () => {
    if (!formData.title || !formData.summary) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least the title and summary before previewing",
        variant: "destructive",
      })
      return
    }
    setStep('preview')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {step === 'type' ? 'Create Progress Report' : 
                 step === 'content' ? `${selectedTemplate?.name}` :
                 'Report Preview'}
              </h2>
              <p className="text-sm text-gray-600">
                {step === 'type' 
                  ? 'Choose report type and customize content for stakeholders' 
                  : step === 'content'
                  ? `Creating ${selectedTemplate?.template.frequency.toLowerCase()} report for ${project.name}`
                  : 'Review your report before submission'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {step === 'content' && (
              <Button
                variant="outline"
                onClick={generateAutoContent}
                className="text-green-600 border-green-200 hover:bg-green-50"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Auto-fill from Metrics
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center space-x-4">
            {['type', 'content', 'preview'].map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === stepName ? 'bg-blue-600 text-white' :
                  ['type', 'content', 'preview'].indexOf(step) > index ? 'bg-green-600 text-white' :
                   'bg-gray-300 text-gray-600'
                }`}>
                  {['type', 'content', 'preview'].indexOf(step) > index ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  step === stepName ? 'text-blue-600' :
                  ['type', 'content', 'preview'].indexOf(step) > index ? 'text-green-600' :
                  'text-gray-500'
                }`}>
                  {stepName.charAt(0).toUpperCase() + stepName.slice(1)}
                </span>
                {index < 2 && <div className="w-8 h-px bg-gray-300 mx-3" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'type' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Report Type</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ENHANCED_REPORT_TYPES.map((type) => {
                    const IconComponent = type.icon
                    return (
                      <Card 
                        key={type.id}
                        className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-blue-200 group"
                        onClick={() => handleTypeSelect(type.id)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start space-x-4">
                            <div className="p-3 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                              <IconComponent className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 mb-2">{type.name}</h4>
                              <p className="text-sm text-gray-600 mb-3">{type.description}</p>
                              
                              <div className="space-y-2">
                                <div className="flex items-center text-xs text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>{type.template.frequency}</span>
                                </div>
                                
                                <div className="flex flex-wrap gap-1">
                                  {type.template.stakeholders.slice(0, 2).map(stakeholder => (
                                    <Badge key={stakeholder} variant="outline" className="text-xs">
                                      {stakeholder}
                                    </Badge>
                                  ))}
                                  {type.template.stakeholders.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{type.template.stakeholders.length - 2} more
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="mt-3">
                                  <p className="text-xs text-gray-500 mb-1">Includes:</p>
                                  <p className="text-xs text-gray-600">
                                    {type.template.sections.slice(0, 3).join(', ')}
                                    {type.template.sections.length > 3 && '...'}
                                  </p>
                                </div>
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

              {/* Enhanced Report Form */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Content - 3 columns */}
                <div className="lg:col-span-3 space-y-6">
                  {/* Basic Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <FileText className="h-5 w-5 mr-2" />
                        Report Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Report Title *
                        </label>
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter descriptive report title..."
                          className="text-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Executive Summary *
                        </label>
                        <Textarea
                          value={formData.summary}
                          onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                          placeholder="Provide a concise summary for executive review..."
                          rows={3}
                        />
                      </div>

                      {selectedType === 'MONTHLY' || selectedType === 'STAKEHOLDER' ? (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Detailed Executive Summary
                          </label>
                          <Textarea
                            value={formData.executiveSummary}
                            onChange={(e) => setFormData(prev => ({ ...prev, executiveSummary: e.target.value }))}
                            placeholder="Expanded executive summary with key decisions and strategic insights..."
                            rows={4}
                          />
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>

                  {/* Progress & Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2" />
                        Progress & Performance
                      </CardTitle>
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
                          {formData.progressPercentage && (
                            <Progress value={parseFloat(formData.progressPercentage)} className="mt-2" />
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Timeline Status
                          </label>
                          <select
                            value={formData.timeline}
                            onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select status...</option>
                            <option value="AHEAD_OF_SCHEDULE">Ahead of Schedule</option>
                            <option value="ON_SCHEDULE">On Schedule</option>
                            <option value="BEHIND_SCHEDULE">Behind Schedule</option>
                            <option value="CRITICAL_DELAY">Critical Delay</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Progress Description
                        </label>
                        <Textarea
                          value={formData.progressDescription}
                          onChange={(e) => setFormData(prev => ({ ...prev, progressDescription: e.target.value }))}
                          placeholder="Describe the work completed, milestones achieved, and current status..."
                          rows={4}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Key Achievements
                        </label>
                        <Textarea
                          value={formData.keyAchievements}
                          onChange={(e) => setFormData(prev => ({ ...prev, keyAchievements: e.target.value }))}
                          placeholder="Highlight major accomplishments, deliverables completed, and successes..."
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Financial Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <DollarSign className="h-5 w-5 mr-2" />
                        Financial Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <option value="UNDER_BUDGET">Under Budget</option>
                            <option value="ON_TRACK">On Track</option>
                            <option value="OVER_BUDGET">Over Budget</option>
                            <option value="NEEDS_REVIEW">Needs Review</option>
                            <option value="CRITICAL">Critical</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Resource Utilization
                          </label>
                          <select
                            value={formData.resourceUtilization}
                            onChange={(e) => setFormData(prev => ({ ...prev, resourceUtilization: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select utilization...</option>
                            <option value="OPTIMAL">Optimal</option>
                            <option value="EFFICIENT">Efficient</option>
                            <option value="ADEQUATE">Adequate</option>
                            <option value="INEFFICIENT">Inefficient</option>
                            <option value="CRITICAL">Critical</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Budget Notes & Analysis
                        </label>
                        <Textarea
                          value={formData.budgetNotes}
                          onChange={(e) => setFormData(prev => ({ ...prev, budgetNotes: e.target.value }))}
                          placeholder="Detailed financial analysis, variance explanations, and budget forecasting..."
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Risks & Issues */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        Risks & Issues
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Current Challenges & Issues
                        </label>
                        <Textarea
                          value={formData.challengesIssues}
                          onChange={(e) => setFormData(prev => ({ ...prev, challengesIssues: e.target.value }))}
                          placeholder="Describe current challenges, blockers, and issues encountered..."
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Risk Assessment
                        </label>
                        <Textarea
                          value={formData.riskAssessment}
                          onChange={(e) => setFormData(prev => ({ ...prev, riskAssessment: e.target.value }))}
                          placeholder="Assessment of project risks, probability, impact, and mitigation strategies..."
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Recommendations & Actions
                        </label>
                        <Textarea
                          value={formData.recommendations}
                          onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
                          placeholder="Recommended actions, decisions needed, and proposed solutions..."
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Forward Planning */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Target className="h-5 w-5 mr-2" />
                        Forward Planning
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Next Steps & Activities
                        </label>
                        <Textarea
                          value={formData.nextSteps}
                          onChange={(e) => setFormData(prev => ({ ...prev, nextSteps: e.target.value }))}
                          placeholder="Planned activities for the next reporting period..."
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Support Needed
                        </label>
                        <Textarea
                          value={formData.supportNeeded}
                          onChange={(e) => setFormData(prev => ({ ...prev, supportNeeded: e.target.value }))}
                          placeholder="Support, resources, or decisions needed from stakeholders..."
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Additional Sections for Specific Report Types */}
                  {(selectedType === 'PERFORMANCE' || selectedType === 'MONTHLY') && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <BarChart3 className="h-5 w-5 mr-2" />
                          Quality & Performance Metrics
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Quality Metrics & KPIs
                          </label>
                          <Textarea
                            value={formData.qualityMetrics}
                            onChange={(e) => setFormData(prev => ({ ...prev, qualityMetrics: e.target.value }))}
                            placeholder="Quality indicators, performance metrics, and KPI analysis..."
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {selectedType === 'STAKEHOLDER' && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Users className="h-5 w-5 mr-2" />
                          Stakeholder Engagement
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stakeholder Feedback & Engagement
                          </label>
                          <Textarea
                            value={formData.stakeholderFeedback}
                            onChange={(e) => setFormData(prev => ({ ...prev, stakeholderFeedback: e.target.value }))}
                            placeholder="Stakeholder feedback, concerns, suggestions, and engagement activities..."
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Attachments */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <Upload className="h-5 w-5 mr-2" />
                        Supporting Documents
                      </CardTitle>
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
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.ppt,.pptx"
                          />
                          <label
                            htmlFor="file-upload"
                            className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                          >
                            <div className="text-center">
                              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600">Click to upload supporting documents</p>
                              <p className="text-xs text-gray-500">PDF, DOC, XLS, Images, PowerPoint</p>
                            </div>
                          </label>
                        </div>

                        {formData.attachments.length > 0 && (
                          <div className="space-y-2">
                            {formData.attachments.map((file, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                                <div className="flex items-center space-x-3">
                                  <FileText className="h-4 w-4 text-gray-500" />
                                  <span className="text-sm text-gray-700">{file.name}</span>
                                  <span className="text-xs text-gray-500">
                                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                  </span>
                                </div>
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

                {/* Sidebar - 1 column */}
                <div className="space-y-6">
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
                          <Badge className="ml-2">{project.status}</Badge>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Methodology:</span>
                          <p className="text-gray-600">{project.methodology}</p>
                        </div>
                        {project.metrics && (
                          <>
                            <div>
                              <span className="font-medium text-gray-700">Current Progress:</span>
                              <p className="text-gray-600">{project.metrics.taskCompletionRate?.toFixed(1)}%</p>
                              <Progress value={project.metrics.taskCompletionRate} className="mt-1" />
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Budget Used:</span>
                              <p className="text-gray-600">{project.metrics.budgetUtilization?.toFixed(1)}%</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Health:</span>
                              <Badge className={`ml-2 ${
                                project.metrics.overallHealth === 'GREEN' ? 'bg-green-100 text-green-800' :
                                project.metrics.overallHealth === 'YELLOW' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {project.metrics.overallHealth}
                              </Badge>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Report Template Info */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Report Template</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Type:</span>
                          <p className="text-gray-600">{selectedTemplate?.name}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Frequency:</span>
                          <p className="text-gray-600">{selectedTemplate?.template.frequency}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Target Audience:</span>
                          <div className="space-y-1 mt-1">
                            {selectedTemplate?.template.stakeholders.map(stakeholder => (
                              <Badge key={stakeholder} variant="outline" className="text-xs mr-1">
                                {stakeholder}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Sections:</span>
                          <div className="space-y-1 mt-1">
                            {selectedTemplate?.template.sections.map((section, index) => (
                              <div key={section} className="flex items-center text-xs">
                                <div className="w-4 h-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                                  {index + 1}
                                </div>
                                <span>{section}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      onClick={goToPreview}
                      className="w-full"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Report
                    </Button>
                    
                    <Button
                      onClick={() => handleSubmit(true)}
                      disabled={isSubmitting}
                      variant="outline"
                      className="w-full"
                    >
                      {isSubmitting && isDraft ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Saving Draft...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save as Draft
                        </>
                      )}
                    </Button>
                    
                    <Button
                      onClick={() => handleSubmit(false)}
                      disabled={isSubmitting}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting && !isDraft ? (
                        <>
                          <Clock className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
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

          {step === 'preview' && (
            <div className="space-y-6">
              {/* Preview Header */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={() => setStep('content')}
                >
                  ← Back to Edit
                </Button>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleSubmit(true)}
                    disabled={isSubmitting}
                    variant="outline"
                  >
                    {isSubmitting && isDraft ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Draft
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting && !isDraft ? (
                      <>
                        <Clock className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit Report
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Preview Content */}
              <Card className="border-2 border-gray-200">
                <CardContent className="p-8">
                  {/* Preview Header */}
                  <div className="text-center border-b border-gray-200 pb-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      {formData.title || 'Progress Report'}
                    </h1>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Project:</strong> {project.name}</p>
                      <p><strong>Report Type:</strong> {selectedTemplate?.name}</p>
                      <p><strong>Generated:</strong> {new Date().toLocaleDateString()}</p>
                      <p><strong>Period:</strong> {selectedTemplate?.template.frequency}</p>
                    </div>
                  </div>

                  {/* Executive Summary */}
                  {formData.summary && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Executive Summary</h2>
                      <p className="text-gray-700 leading-relaxed">{formData.summary}</p>
                    </div>
                  )}

                  {formData.executiveSummary && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Detailed Executive Summary</h2>
                      <p className="text-gray-700 leading-relaxed">{formData.executiveSummary}</p>
                    </div>
                  )}

                  {/* Progress Overview */}
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Progress Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {formData.progressPercentage || project.metrics?.taskCompletionRate?.toFixed(1) || 0}%
                        </div>
                        <div className="text-sm text-blue-800">Progress Complete</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {project.metrics?.completedTasks || 0}
                        </div>
                        <div className="text-sm text-green-800">Tasks Completed</div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {formData.timeline || 'On Schedule'}
                        </div>
                        <div className="text-sm text-purple-800">Timeline Status</div>
                      </div>
                    </div>
                    {formData.progressDescription && (
                      <p className="text-gray-700 leading-relaxed">{formData.progressDescription}</p>
                    )}
                  </div>

                  {/* Key Achievements */}
                  {formData.keyAchievements && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Key Achievements</h2>
                      <p className="text-gray-700 leading-relaxed">{formData.keyAchievements}</p>
                    </div>
                  )}

                  {/* Financial Status */}
                  {(formData.budgetStatus || formData.budgetNotes) && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Financial Status</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="p-4 bg-yellow-50 rounded-lg">
                          <div className="text-lg font-bold text-yellow-600">
                            {formData.budgetStatus?.replace('_', ' ') || 'On Track'}
                          </div>
                          <div className="text-sm text-yellow-800">Budget Status</div>
                        </div>
                        <div className="p-4 bg-indigo-50 rounded-lg">
                          <div className="text-lg font-bold text-indigo-600">
                            {project.metrics?.budgetUtilization?.toFixed(1) || 0}%
                          </div>
                          <div className="text-sm text-indigo-800">Budget Utilized</div>
                        </div>
                      </div>
                      {formData.budgetNotes && (
                        <p className="text-gray-700 leading-relaxed">{formData.budgetNotes}</p>
                      )}
                    </div>
                  )}

                  {/* Risks & Issues */}
                  {(formData.challengesIssues || formData.riskAssessment) && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Risks & Issues</h2>
                      {formData.challengesIssues && (
                        <div className="mb-4">
                          <h3 className="font-medium text-gray-900 mb-2">Current Challenges</h3>
                          <p className="text-gray-700 leading-relaxed">{formData.challengesIssues}</p>
                        </div>
                      )}
                      {formData.riskAssessment && (
                        <div className="mb-4">
                          <h3 className="font-medium text-gray-900 mb-2">Risk Assessment</h3>
                          <p className="text-gray-700 leading-relaxed">{formData.riskAssessment}</p>
                        </div>
                      )}
                      {formData.recommendations && (
                        <div>
                          <h3 className="font-medium text-gray-900 mb-2">Recommendations</h3>
                          <p className="text-gray-700 leading-relaxed">{formData.recommendations}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Next Steps */}
                  {(formData.nextSteps || formData.supportNeeded) && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Forward Planning</h2>
                      {formData.nextSteps && (
                        <div className="mb-4">
                          <h3 className="font-medium text-gray-900 mb-2">Next Steps</h3>
                          <p className="text-gray-700 leading-relaxed">{formData.nextSteps}</p>
                        </div>
                      )}
                      {formData.supportNeeded && (
                        <div>
                          <h3 className="font-medium text-gray-900 mb-2">Support Needed</h3>
                          <p className="text-gray-700 leading-relaxed">{formData.supportNeeded}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Additional Sections */}
                  {formData.qualityMetrics && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Quality & Performance Metrics</h2>
                      <p className="text-gray-700 leading-relaxed">{formData.qualityMetrics}</p>
                    </div>
                  )}

                  {formData.stakeholderFeedback && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Stakeholder Engagement</h2>
                      <p className="text-gray-700 leading-relaxed">{formData.stakeholderFeedback}</p>
                    </div>
                  )}

                  {/* Attachments Summary */}
                  {formData.attachments.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Supporting Documents</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {formData.attachments.map((file, index) => (
                          <div key={index} className="flex items-center p-2 bg-gray-50 rounded">
                            <FileText className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Report Footer */}
                  <div className="border-t border-gray-200 pt-6 mt-8 text-center text-sm text-gray-500">
                    <p><strong>Report prepared by:</strong> {userRole.replace('_', ' ')}</p>
                    <p><strong>Organization:</strong> {organizationSlug}</p>
                    <p><strong>Generated:</strong> {new Date().toLocaleString()}</p>
                    <p><strong>Target Stakeholders:</strong> {selectedTemplate?.template.stakeholders.join(', ')}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}