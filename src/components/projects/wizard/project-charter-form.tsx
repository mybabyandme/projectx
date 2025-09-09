'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Target, Eye, Package, CheckSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  ProjectCharter, 
  ProjectBasics,
  projectCharterSchema 
} from '@/lib/project-wizard-schemas'

interface ProjectCharterFormProps {
  data?: ProjectCharter
  projectBasics?: ProjectBasics
  onUpdate: (data: ProjectCharter) => void
}

interface Deliverable {
  name: string
  description: string
  dueDate?: string
  criteria?: string
}

export default function ProjectCharterForm({ 
  data, 
  projectBasics,
  onUpdate 
}: ProjectCharterFormProps) {
  const [formData, setFormData] = useState<Partial<ProjectCharter>>(data || {
    objectives: [''],
    deliverables: [{ name: '', description: '' }],
    successCriteria: [''],
    assumptions: [],
    constraints: [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (data) {
      setFormData(data)
    }
  }, [data])

  useEffect(() => {
    validateAndUpdate()
  }, [formData])

  const validateAndUpdate = () => {
    try {
      const validated = projectCharterSchema.parse(formData)
      setErrors({})
      onUpdate(validated)
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err: any) => {
          if (err.path) {
            const path = err.path.join('.')
            newErrors[path] = err.message
          }
        })
        setErrors(newErrors)
      }
    }
  }

  const updateField = (field: keyof ProjectCharter, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Array field handlers
  const addArrayItem = (field: 'objectives' | 'assumptions' | 'constraints' | 'successCriteria') => {
    const current = formData[field] as string[] || []
    updateField(field, [...current, ''])
  }

  const updateArrayItem = (
    field: 'objectives' | 'assumptions' | 'constraints' | 'successCriteria',
    index: number,
    value: string
  ) => {
    const current = formData[field] as string[] || []
    const updated = [...current]
    updated[index] = value
    updateField(field, updated)
  }

  const removeArrayItem = (
    field: 'objectives' | 'assumptions' | 'constraints' | 'successCriteria',
    index: number
  ) => {
    const current = formData[field] as string[] || []
    const updated = current.filter((_, i) => i !== index)
    updateField(field, updated)
  }

  // Deliverable handlers
  const addDeliverable = () => {
    const current = formData.deliverables || []
    updateField('deliverables', [...current, { name: '', description: '' }])
  }

  const updateDeliverable = (index: number, field: keyof Deliverable, value: string) => {
    const current = formData.deliverables || []
    const updated = [...current]
    updated[index] = { ...updated[index], [field]: value }
    updateField('deliverables', updated)
  }

  const removeDeliverable = (index: number) => {
    const current = formData.deliverables || []
    const updated = current.filter((_, i) => i !== index)
    updateField('deliverables', updated)
  }

  return (
    <div className="space-y-8">
      {/* Project Context */}
      {projectBasics && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Project Context</h3>
          <div className="text-sm text-blue-800">
            <p><strong>Project:</strong> {projectBasics.name}</p>
            <p><strong>Template:</strong> {projectBasics.template}</p>
            <p><strong>Methodology:</strong> {projectBasics.methodology}</p>
          </div>
        </div>
      )}

      {/* Vision Statement */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Eye className="h-5 w-5 text-blue-600" />
          <Label htmlFor="vision" className="text-base font-medium text-gray-900">
            Vision Statement *
          </Label>
        </div>
        <p className="text-sm text-gray-500">
          Describe the long-term impact and desired future state this project will achieve
        </p>
        <Textarea
          id="vision"
          rows={4}
          placeholder="Our vision is to..."
          value={formData.vision || ''}
          onChange={(e) => updateField('vision', e.target.value)}
          className={errors.vision ? 'border-red-300 focus:border-red-500' : ''}
        />
        {errors.vision && (
          <p className="text-sm text-red-600">{errors.vision}</p>
        )}
      </div>

      {/* Objectives */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <Label className="text-base font-medium text-gray-900">
              Project Objectives *
            </Label>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addArrayItem('objectives')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Objective
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Define specific, measurable goals this project will accomplish
        </p>
        
        <div className="space-y-3">
          {(formData.objectives || ['']).map((objective, index) => (
            <div key={index} className="flex space-x-2">
              <Input
                placeholder={`Objective ${index + 1}`}
                value={objective}
                onChange={(e) => updateArrayItem('objectives', index, e.target.value)}
                className="flex-1"
              />
              {(formData.objectives?.length || 0) > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeArrayItem('objectives', index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        {errors['objectives'] && (
          <p className="text-sm text-red-600">{errors['objectives']}</p>
        )}
      </div>

      {/* Scope Definition */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="scope" className="text-base font-medium text-gray-900">
            Project Scope *
          </Label>
          <p className="text-sm text-gray-500">What is included in this project</p>
          <Textarea
            id="scope"
            rows={6}
            placeholder="This project includes..."
            value={formData.scope || ''}
            onChange={(e) => updateField('scope', e.target.value)}
            className={errors.scope ? 'border-red-300 focus:border-red-500' : ''}
          />
          {errors.scope && (
            <p className="text-sm text-red-600">{errors.scope}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="outOfScope" className="text-base font-medium text-gray-900">
            Out of Scope
          </Label>
          <p className="text-sm text-gray-500">What is explicitly excluded</p>
          <Textarea
            id="outOfScope"
            rows={6}
            placeholder="This project does not include..."
            value={formData.outOfScope || ''}
            onChange={(e) => updateField('outOfScope', e.target.value)}
          />
        </div>
      </div>

      {/* Deliverables */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-600" />
            <Label className="text-base font-medium text-gray-900">
              Key Deliverables *
            </Label>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addDeliverable}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Deliverable
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Define the major outputs and tangible results of this project
        </p>

        <div className="space-y-4">
          {(formData.deliverables || [{ name: '', description: '' }]).map((deliverable, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Deliverable {index + 1}</h4>
                {(formData.deliverables?.length || 0) > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeDeliverable(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Name *</Label>
                  <Input
                    placeholder="Deliverable name"
                    value={deliverable.name}
                    onChange={(e) => updateDeliverable(index, 'name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Due Date</Label>
                  <Input
                    type="date"
                    value={deliverable.dueDate || ''}
                    onChange={(e) => updateDeliverable(index, 'dueDate', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <Label className="text-sm font-medium text-gray-700">Description *</Label>
                <Textarea
                  rows={3}
                  placeholder="Describe this deliverable..."
                  value={deliverable.description}
                  onChange={(e) => updateDeliverable(index, 'description', e.target.value)}
                />
              </div>
              
              <div className="mt-4 space-y-2">
                <Label className="text-sm font-medium text-gray-700">Acceptance Criteria</Label>
                <Textarea
                  rows={2}
                  placeholder="Define what constitutes successful delivery..."
                  value={deliverable.criteria || ''}
                  onChange={(e) => updateDeliverable(index, 'criteria', e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
        {errors['deliverables'] && (
          <p className="text-sm text-red-600">{errors['deliverables']}</p>
        )}
      </div>

      {/* Success Criteria */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            <Label className="text-base font-medium text-gray-900">
              Success Criteria *
            </Label>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addArrayItem('successCriteria')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Criteria
          </Button>
        </div>
        <p className="text-sm text-gray-500">
          Define measurable indicators that determine project success
        </p>
        
        <div className="space-y-3">
          {(formData.successCriteria || ['']).map((criteria, index) => (
            <div key={index} className="flex space-x-2">
              <Input
                placeholder={`Success criteria ${index + 1}`}
                value={criteria}
                onChange={(e) => updateArrayItem('successCriteria', index, e.target.value)}
                className="flex-1"
              />
              {(formData.successCriteria?.length || 0) > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeArrayItem('successCriteria', index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        {errors['successCriteria'] && (
          <p className="text-sm text-red-600">{errors['successCriteria']}</p>
        )}
      </div>

      {/* Assumptions and Constraints */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assumptions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium text-gray-900">
              Assumptions
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem('assumptions')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Factors assumed to be true for project planning
          </p>
          
          <div className="space-y-2">
            {(formData.assumptions || []).map((assumption, index) => (
              <div key={index} className="flex space-x-2">
                <Input
                  placeholder={`Assumption ${index + 1}`}
                  value={assumption}
                  onChange={(e) => updateArrayItem('assumptions', index, e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeArrayItem('assumptions', index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {(formData.assumptions?.length === 0 || !formData.assumptions) && (
              <p className="text-sm text-gray-400 italic">No assumptions defined yet. Click "Add" to start.</p>
            )}
          </div>
        </div>

        {/* Constraints */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium text-gray-900">
              Constraints
            </Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => addArrayItem('constraints')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            Limitations and restrictions that impact the project
          </p>
          
          <div className="space-y-2">
            {(formData.constraints || []).map((constraint, index) => (
              <div key={index} className="flex space-x-2">
                <Input
                  placeholder={`Constraint ${index + 1}`}
                  value={constraint}
                  onChange={(e) => updateArrayItem('constraints', index, e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeArrayItem('constraints', index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {(formData.constraints?.length === 0 || !formData.constraints) && (
              <p className="text-sm text-gray-400 italic">No constraints defined yet. Click "Add" to start.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}