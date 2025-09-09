'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Users, Mail, Building, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  StakeholderData, 
  ProjectBasics,
  stakeholderSchema,
  PROJECT_TEMPLATES
} from '@/lib/project-wizard-schemas'

interface StakeholderMatrixProps {
  data?: StakeholderData
  projectBasics?: ProjectBasics
  onUpdate: (data: StakeholderData) => void
}

interface Stakeholder {
  id: string
  name: string
  email: string
  role: string
  organization?: string
  influence: 'LOW' | 'MEDIUM' | 'HIGH'
  interest: 'LOW' | 'MEDIUM' | 'HIGH'
  responsibilities: string[]
  contactInfo?: {
    phone?: string
    department?: string
  }
}

const STAKEHOLDER_ROLES = [
  { value: 'PROJECT_SPONSOR', label: 'Project Sponsor', description: 'Provides funding and high-level support' },
  { value: 'PROJECT_MANAGER', label: 'Project Manager', description: 'Manages project execution and delivery' },
  { value: 'TECHNICAL_LEAD', label: 'Technical Lead', description: 'Leads technical implementation' },
  { value: 'BUSINESS_ANALYST', label: 'Business Analyst', description: 'Analyzes requirements and processes' },
  { value: 'QUALITY_ASSURANCE', label: 'Quality Assurance', description: 'Ensures quality standards' },
  { value: 'STAKEHOLDER', label: 'Stakeholder', description: 'Has interest in project outcome' },
  { value: 'END_USER', label: 'End User', description: 'Will use the final product' },
  { value: 'VENDOR', label: 'Vendor', description: 'External service provider' },
  { value: 'CONSULTANT', label: 'Consultant', description: 'Provides specialized expertise' },
]

const RACI_OPTIONS = [
  { value: 'RESPONSIBLE', label: 'Responsible', description: 'Does the work', color: 'bg-blue-100 text-blue-800' },
  { value: 'ACCOUNTABLE', label: 'Accountable', description: 'Ensures completion', color: 'bg-green-100 text-green-800' },
  { value: 'CONSULTED', label: 'Consulted', description: 'Provides input', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'INFORMED', label: 'Informed', description: 'Kept updated', color: 'bg-gray-100 text-gray-800' },
]

const INFLUENCE_LEVELS = [
  { value: 'LOW', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'HIGH', label: 'High', color: 'bg-red-100 text-red-800' },
]

const INTEREST_LEVELS = [
  { value: 'LOW', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { value: 'MEDIUM', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  { value: 'HIGH', label: 'High', color: 'bg-green-100 text-green-800' },
]

export default function StakeholderMatrix({ 
  data, 
  projectBasics,
  onUpdate 
}: StakeholderMatrixProps) {
  const [formData, setFormData] = useState<Partial<StakeholderData>>(data || {
    stakeholders: []
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (data) {
      setFormData(data)
    } else if (projectBasics?.template && projectBasics.template !== 'CUSTOM') {
      // Pre-populate required stakeholders based on template
      const template = PROJECT_TEMPLATES[projectBasics.template]
      const defaultStakeholders = template.requiredStakeholders.map((role, index) => ({
        id: `stakeholder-${index}`,
        name: '',
        email: '',
        role,
        influence: 'MEDIUM' as const,
        interest: 'HIGH' as const,
        responsibilities: [],
      }))
      setFormData({ stakeholders: defaultStakeholders })
    }
  }, [data, projectBasics])

  useEffect(() => {
    validateAndUpdate()
  }, [formData])

  const validateAndUpdate = () => {
    try {
      const validated = stakeholderSchema.parse(formData)
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

  const addStakeholder = () => {
    const newStakeholder: Stakeholder = {
      id: `stakeholder-${Date.now()}`,
      name: '',
      email: '',
      role: 'STAKEHOLDER',
      influence: 'MEDIUM',
      interest: 'MEDIUM',
      responsibilities: [],
    }
    
    setFormData(prev => ({
      ...prev,
      stakeholders: [...(prev.stakeholders || []), newStakeholder]
    }))
  }

  const updateStakeholder = (index: number, field: keyof Stakeholder, value: any) => {
    const stakeholders = [...(formData.stakeholders || [])]
    stakeholders[index] = { ...stakeholders[index], [field]: value }
    setFormData(prev => ({ ...prev, stakeholders }))
  }

  const removeStakeholder = (index: number) => {
    const stakeholders = formData.stakeholders?.filter((_, i) => i !== index) || []
    setFormData(prev => ({ ...prev, stakeholders }))
  }

  const toggleResponsibility = (stakeholderIndex: number, responsibility: string) => {
    const stakeholders = [...(formData.stakeholders || [])]
    const stakeholder = stakeholders[stakeholderIndex]
    const responsibilities = stakeholder.responsibilities || []
    
    if (responsibilities.includes(responsibility)) {
      stakeholder.responsibilities = responsibilities.filter(r => r !== responsibility)
    } else {
      stakeholder.responsibilities = [...responsibilities, responsibility]
    }
    
    setFormData(prev => ({ ...prev, stakeholders }))
  }

  const updateContactInfo = (index: number, field: string, value: string) => {
    const stakeholders = [...(formData.stakeholders || [])]
    const contactInfo = stakeholders[index].contactInfo || {}
    stakeholders[index].contactInfo = { ...contactInfo, [field]: value }
    setFormData(prev => ({ ...prev, stakeholders }))
  }

  const getStakeholderPowerInterestQuadrant = (influence: string, interest: string) => {
    if (influence === 'HIGH' && interest === 'HIGH') {
      return { label: 'Manage Closely', color: 'bg-red-100 text-red-800 border-red-200' }
    } else if (influence === 'HIGH' && interest === 'LOW') {
      return { label: 'Keep Satisfied', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
    } else if (influence === 'LOW' && interest === 'HIGH') {
      return { label: 'Keep Informed', color: 'bg-blue-100 text-blue-800 border-blue-200' }
    } else {
      return { label: 'Monitor', color: 'bg-gray-100 text-gray-800 border-gray-200' }
    }
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
            {projectBasics.template !== 'CUSTOM' && (
              <p><strong>Required Roles:</strong> {PROJECT_TEMPLATES[projectBasics.template].requiredStakeholders.join(', ')}</p>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-blue-600" />
          <div>
            <h3 className="text-base font-medium text-gray-900">Stakeholder Matrix</h3>
            <p className="text-sm text-gray-500">Identify key stakeholders and define their roles and responsibilities</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={addStakeholder}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Stakeholder
        </Button>
      </div>

      {/* Stakeholder List */}
      <div className="space-y-6">
        {(formData.stakeholders || []).map((stakeholder, index) => {
          const quadrant = getStakeholderPowerInterestQuadrant(stakeholder.influence, stakeholder.interest)
          
          return (
            <div key={stakeholder.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Stakeholder {index + 1}</span>
                </h4>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded border ${quadrant.color}`}>
                    {quadrant.label}
                  </span>
                  {formData.stakeholders && formData.stakeholders.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeStakeholder(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Basic Information */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Name *</Label>
                  <Input
                    placeholder="Full name"
                    value={stakeholder.name}
                    onChange={(e) => updateStakeholder(index, 'name', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Email *</Label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={stakeholder.email}
                    onChange={(e) => updateStakeholder(index, 'email', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Role *</Label>
                  <select
                    value={stakeholder.role}
                    onChange={(e) => updateStakeholder(index, 'role', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-blue-500"
                  >
                    {STAKEHOLDER_ROLES.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Additional Contact Info */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Organization</Label>
                  <Input
                    placeholder="Company/Department"
                    value={stakeholder.organization || ''}
                    onChange={(e) => updateStakeholder(index, 'organization', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Phone</Label>
                  <Input
                    placeholder="Phone number"
                    value={stakeholder.contactInfo?.phone || ''}
                    onChange={(e) => updateContactInfo(index, 'phone', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Department</Label>
                  <Input
                    placeholder="Department/Team"
                    value={stakeholder.contactInfo?.department || ''}
                    onChange={(e) => updateContactInfo(index, 'department', e.target.value)}
                  />
                </div>
              </div>

              {/* Power/Interest Matrix */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Influence Level *</Label>
                  <div className="flex space-x-2">
                    {INFLUENCE_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => updateStakeholder(index, 'influence', level.value)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          stakeholder.influence === level.value
                            ? level.color
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Interest Level *</Label>
                  <div className="flex space-x-2">
                    {INTEREST_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => updateStakeholder(index, 'interest', level.value)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          stakeholder.interest === level.value
                            ? level.color
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* RACI Responsibilities */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">RACI Responsibilities</Label>
                <p className="text-xs text-gray-500">Select the stakeholder's level of involvement in project activities</p>
                <div className="flex flex-wrap gap-2">
                  {RACI_OPTIONS.map((raci) => {
                    const isSelected = stakeholder.responsibilities?.includes(raci.value)
                    return (
                      <button
                        key={raci.value}
                        type="button"
                        onClick={() => toggleResponsibility(index, raci.value)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                          isSelected
                            ? `${raci.color} border-current`
                            : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                        title={raci.description}
                      >
                        {raci.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}

        {/* Empty State */}
        {(!formData.stakeholders || formData.stakeholders.length === 0) && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stakeholders defined</h3>
            <p className="text-gray-500 mb-4">Add stakeholders to define roles and responsibilities</p>
            <Button onClick={addStakeholder}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Stakeholder
            </Button>
          </div>
        )}
      </div>

      {/* RACI Matrix Legend */}
      {formData.stakeholders && formData.stakeholders.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">RACI Matrix Legend</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {RACI_OPTIONS.map((raci) => (
              <div key={raci.value} className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs font-medium rounded ${raci.color}`}>
                  {raci.label}
                </span>
                <span className="text-sm text-gray-600">{raci.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-900 mb-2">Please fix the following errors:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>• {message}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
