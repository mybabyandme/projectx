'use client'

import { useState, useEffect } from 'react'
import { Calendar, DollarSign, Tag, FileText, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  ProjectBasics, 
  projectBasicsSchema, 
  PROJECT_TEMPLATES,
  ProjectTemplate as ProjectTemplateType 
} from '@/lib/project-wizard-schemas'

interface ProjectBasicsFormProps {
  data?: ProjectBasics
  onUpdate: (data: ProjectBasics) => void
}

const METHODOLOGIES = [
  { value: 'AGILE', label: 'Agile', description: 'Iterative development with sprints' },
  { value: 'WATERFALL', label: 'Waterfall', description: 'Sequential phases approach' },
  { value: 'HYBRID', label: 'Hybrid', description: 'Combined agile and waterfall' },
  { value: 'KANBAN', label: 'Kanban', description: 'Continuous flow methodology' },
  { value: 'SCRUM', label: 'Scrum', description: 'Framework for agile development' },
] as const

const PRIORITIES = [
  { value: 'LOW', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  { value: 'HIGH', label: 'High', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'CRITICAL', label: 'Critical', color: 'bg-red-100 text-red-800' },
] as const

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
]

export default function ProjectBasicsForm({ data, onUpdate }: ProjectBasicsFormProps) {
  const [formData, setFormData] = useState<Partial<ProjectBasics>>(data || {
    currency: 'USD',
    priority: 'MEDIUM',
    methodology: 'AGILE',
    template: 'CUSTOM',
    tags: [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplateType>('CUSTOM')
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (data) {
      setFormData(data)
      setSelectedTemplate(data.template)
    }
  }, [data])

  useEffect(() => {
    validateAndUpdate()
  }, [formData])

  const validateAndUpdate = () => {
    try {
      const validated = projectBasicsSchema.parse(formData)
      setErrors({})
      onUpdate(validated)
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err: any) => {
          if (err.path) {
            newErrors[err.path[0]] = err.message
          }
        })
        setErrors(newErrors)
      }
    }
  }

  const updateField = (field: keyof ProjectBasics, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleTemplateSelect = (templateKey: ProjectTemplateType) => {
    setSelectedTemplate(templateKey)
    const template = PROJECT_TEMPLATES[templateKey]
    
    setFormData(prev => ({
      ...prev,
      template: templateKey,
      methodology: template.methodology,
    }))
  }

  const handleTagAdd = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      const newTags = [...(formData.tags || []), tagInput.trim()]
      updateField('tags', newTags)
      setTagInput('')
    }
  }

  const handleTagRemove = (tagToRemove: string) => {
    const newTags = formData.tags?.filter(tag => tag !== tagToRemove) || []
    updateField('tags', newTags)
  }

  return (
    <div className="space-y-8">
      {/* Project Template Selection */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium text-gray-900">Project Template</Label>
          <p className="text-sm text-gray-500 mt-1">
            Choose a template to pre-configure your project settings
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(PROJECT_TEMPLATES).map(([key, template]) => {
            const isSelected = selectedTemplate === key
            return (
              <button
                key={key}
                onClick={() => handleTemplateSelect(key as ProjectTemplateType)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${
                    isSelected ? 'bg-blue-500' : 'bg-gray-300'
                  }`} />
                  <h3 className="font-medium text-gray-900">{template.name}</h3>
                </div>
                <p className="text-sm text-gray-600">{template.description}</p>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                    {template.methodology}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            Project Name *
          </Label>
          <Input
            id="name"
            placeholder="Enter project name"
            value={formData.name || ''}
            onChange={(e) => updateField('name', e.target.value)}
            className={errors.name ? 'border-red-300 focus:border-red-500' : ''}
          />
          {errors.name && (
            <p className="text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Priority *</Label>
          <div className="flex space-x-2">
            {PRIORITIES.map((priority) => (
              <button
                key={priority.value}
                onClick={() => updateField('priority', priority.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  formData.priority === priority.value
                    ? priority.color
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {priority.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium text-gray-700">
          Project Description *
        </Label>
        <Textarea
          id="description"
          rows={4}
          placeholder="Describe the project objectives, scope, and expected outcomes..."
          value={formData.description || ''}
          onChange={(e) => updateField('description', e.target.value)}
          className={errors.description ? 'border-red-300 focus:border-red-500' : ''}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      {/* Methodology and Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Methodology */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Methodology *</Label>
          <select
            value={formData.methodology || ''}
            onChange={(e) => updateField('methodology', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-blue-500"
          >
            {METHODOLOGIES.map((method) => (
              <option key={method.value} value={method.value}>
                {method.label} - {method.description}
              </option>
            ))}
          </select>
        </div>

        {/* Budget */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Estimated Budget *</Label>
          <div className="flex space-x-2">
            <select
              value={formData.currency || 'USD'}
              onChange={(e) => updateField('currency', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-blue-500"
            >
              {CURRENCIES.map((currency) => (
                <option key={currency.code} value={currency.code}>
                  {currency.symbol} {currency.code}
                </option>
              ))}
            </select>
            <Input
              type="number"
              placeholder="0.00"
              value={formData.estimatedBudget || ''}
              onChange={(e) => updateField('estimatedBudget', parseFloat(e.target.value) || 0)}
              className={`flex-1 ${errors.estimatedBudget ? 'border-red-300 focus:border-red-500' : ''}`}
            />
          </div>
          {errors.estimatedBudget && (
            <p className="text-sm text-red-600">{errors.estimatedBudget}</p>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
            Start Date *
          </Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate || ''}
            onChange={(e) => updateField('startDate', e.target.value)}
            className={errors.startDate ? 'border-red-300 focus:border-red-500' : ''}
          />
          {errors.startDate && (
            <p className="text-sm text-red-600">{errors.startDate}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">
            End Date *
          </Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate || ''}
            onChange={(e) => updateField('endDate', e.target.value)}
            className={errors.endDate ? 'border-red-300 focus:border-red-500' : ''}
          />
          {errors.endDate && (
            <p className="text-sm text-red-600">{errors.endDate}</p>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">Tags (Optional)</Label>
        <div className="flex space-x-2">
          <Input
            placeholder="Add a tag..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleTagAdd()
              }
            }}
          />
          <Button
            type="button"
            onClick={handleTagAdd}
            variant="outline"
            className="shrink-0"
          >
            <Tag className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
        
        {formData.tags && formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {tag}
                <button
                  onClick={() => handleTagRemove(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Template Info */}
      {selectedTemplate !== 'CUSTOM' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Template Configuration</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>Methodology:</strong> {PROJECT_TEMPLATES[selectedTemplate].methodology}</p>
            <p><strong>Typical Phases:</strong> {PROJECT_TEMPLATES[selectedTemplate].phases.join(', ')}</p>
            <p><strong>Key Stakeholders:</strong> {PROJECT_TEMPLATES[selectedTemplate].requiredStakeholders.join(', ')}</p>
          </div>
        </div>
      )}
    </div>
  )
}