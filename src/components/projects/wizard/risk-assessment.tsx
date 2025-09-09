'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, AlertTriangle, Shield, Calendar, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { 
  RiskAssessment as RiskAssessmentType, 
  ProjectBasics,
  riskAssessmentSchema,
  PROJECT_TEMPLATES
} from '@/lib/project-wizard-schemas'

interface RiskAssessmentProps {
  data?: RiskAssessmentType
  projectBasics?: ProjectBasics
  onUpdate: (data: RiskAssessmentType) => void
}

interface Risk {
  id: string
  title: string
  description: string
  category: string
  impact: string
  probability: string
  mitigation: string
  contingency?: string
  owner: string
  dueDate?: string
  status: string
}

const RISK_CATEGORIES = [
  { value: 'TECHNICAL', label: 'Technical', description: 'Technology and implementation risks', color: 'bg-blue-100 text-blue-800' },
  { value: 'FINANCIAL', label: 'Financial', description: 'Budget and funding risks', color: 'bg-green-100 text-green-800' },
  { value: 'OPERATIONAL', label: 'Operational', description: 'Process and resource risks', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'STRATEGIC', label: 'Strategic', description: 'Business and strategic risks', color: 'bg-purple-100 text-purple-800' },
  { value: 'EXTERNAL', label: 'External', description: 'Market and environmental risks', color: 'bg-orange-100 text-orange-800' },
  { value: 'COMPLIANCE', label: 'Compliance', description: 'Regulatory and legal risks', color: 'bg-red-100 text-red-800' },
]

const IMPACT_LEVELS = [
  { value: 'LOW', label: 'Low', description: 'Minor impact on project', color: 'bg-green-100 text-green-800', score: 1 },
  { value: 'MEDIUM', label: 'Medium', description: 'Moderate impact on project', color: 'bg-yellow-100 text-yellow-800', score: 2 },
  { value: 'HIGH', label: 'High', description: 'Significant impact on project', color: 'bg-orange-100 text-orange-800', score: 3 },
  { value: 'VERY_HIGH', label: 'Very High', description: 'Critical impact on project', color: 'bg-red-100 text-red-800', score: 4 },
]

const PROBABILITY_LEVELS = [
  { value: 'VERY_LOW', label: 'Very Low', description: '< 10% chance', color: 'bg-green-100 text-green-800', score: 1 },
  { value: 'LOW', label: 'Low', description: '10-30% chance', color: 'bg-yellow-100 text-yellow-800', score: 2 },
  { value: 'MEDIUM', label: 'Medium', description: '30-50% chance', color: 'bg-orange-100 text-orange-800', score: 3 },
  { value: 'HIGH', label: 'High', description: '50-70% chance', color: 'bg-red-100 text-red-800', score: 4 },
  { value: 'VERY_HIGH', label: 'Very High', description: '> 70% chance', color: 'bg-red-100 text-red-800', score: 5 },
]

const RISK_STATUS = [
  { value: 'IDENTIFIED', label: 'Identified', color: 'bg-gray-100 text-gray-800' },
  { value: 'ASSESSED', label: 'Assessed', color: 'bg-blue-100 text-blue-800' },
  { value: 'MITIGATED', label: 'Mitigated', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'CLOSED', label: 'Closed', color: 'bg-green-100 text-green-800' },
]

export default function RiskAssessment({ 
  data, 
  projectBasics,
  onUpdate 
}: RiskAssessmentProps) {
  const [formData, setFormData] = useState<Partial<RiskAssessmentType>>(data || {
    risks: []
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (data) {
      setFormData(data)
    } else if (projectBasics?.template && projectBasics.template !== 'CUSTOM') {
      // Pre-populate common risks based on template
      const template = PROJECT_TEMPLATES[projectBasics.template]
      const defaultRisks = template.defaultRisks.map((category, index) => ({
        id: `risk-${index}`,
        title: '',
        description: '',
        category,
        impact: 'MEDIUM',
        probability: 'MEDIUM',
        mitigation: '',
        owner: '',
        status: 'IDENTIFIED',
      }))
      setFormData({ risks: defaultRisks })
    }
  }, [data, projectBasics])

  useEffect(() => {
    validateAndUpdate()
  }, [formData])

  const validateAndUpdate = () => {
    try {
      const validated = riskAssessmentSchema.parse(formData)
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

  const addRisk = () => {
    const newRisk: Risk = {
      id: `risk-${Date.now()}`,
      title: '',
      description: '',
      category: 'OPERATIONAL',
      impact: 'MEDIUM',
      probability: 'MEDIUM',
      mitigation: '',
      owner: '',
      status: 'IDENTIFIED',
    }
    
    setFormData(prev => ({
      ...prev,
      risks: [...(prev.risks || []), newRisk]
    }))
  }

  const updateRisk = (index: number, field: keyof Risk, value: any) => {
    const risks = [...(formData.risks || [])]
    risks[index] = { ...risks[index], [field]: value }
    setFormData(prev => ({ ...prev, risks }))
  }

  const removeRisk = (index: number) => {
    const risks = formData.risks?.filter((_, i) => i !== index) || []
    setFormData(prev => ({ ...prev, risks }))
  }

  const calculateRiskScore = (impact: string, probability: string): number => {
    const impactScore = IMPACT_LEVELS.find(i => i.value === impact)?.score || 2
    const probabilityScore = PROBABILITY_LEVELS.find(p => p.value === probability)?.score || 2
    return impactScore * probabilityScore
  }

  const getRiskLevel = (score: number): { label: string; color: string } => {
    if (score >= 12) return { label: 'Critical', color: 'bg-red-100 text-red-800 border-red-300' }
    if (score >= 8) return { label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-300' }
    if (score >= 4) return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' }
    return { label: 'Low', color: 'bg-green-100 text-green-800 border-green-300' }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'TECHNICAL': return '🔧'
      case 'FINANCIAL': return '💰'
      case 'OPERATIONAL': return '⚙️'
      case 'STRATEGIC': return '🎯'
      case 'EXTERNAL': return '🌍'
      case 'COMPLIANCE': return '📋'
      default: return '⚠️'
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
              <p><strong>Common Risk Categories:</strong> {PROJECT_TEMPLATES[projectBasics.template].defaultRisks.join(', ')}</p>
            )}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-orange-600" />
          <div>
            <h3 className="text-base font-medium text-gray-900">Risk Assessment Matrix</h3>
            <p className="text-sm text-gray-500">Identify, assess, and plan mitigation for project risks</p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={addRisk}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Risk
        </Button>
      </div>

      {/* Risk Matrix Overview */}
      {formData.risks && formData.risks.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-4">Risk Overview</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {['Critical', 'High', 'Medium', 'Low'].map(level => {
              const count = formData.risks?.filter(risk => {
                const score = calculateRiskScore(risk.impact, risk.probability)
                return getRiskLevel(score).label === level
              }).length || 0
              
              const levelConfig = {
                'Critical': 'bg-red-100 text-red-800',
                'High': 'bg-orange-100 text-orange-800',
                'Medium': 'bg-yellow-100 text-yellow-800',
                'Low': 'bg-green-100 text-green-800'
              }[level]
              
              return (
                <div key={level} className={`p-4 rounded-lg ${levelConfig}`}>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm font-medium">{level} Risk{count !== 1 ? 's' : ''}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Risk List */}
      <div className="space-y-6">
        {(formData.risks || []).map((risk, index) => {
          const riskScore = calculateRiskScore(risk.impact, risk.probability)
          const riskLevel = getRiskLevel(riskScore)
          const categoryInfo = RISK_CATEGORIES.find(c => c.value === risk.category)
          
          return (
            <div key={risk.id} className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getCategoryIcon(risk.category)}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">Risk {index + 1}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${categoryInfo?.color}`}>
                        {categoryInfo?.label}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded border ${riskLevel.color}`}>
                        {riskLevel.label} Risk (Score: {riskScore})
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeRisk(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Risk Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Risk Title *</Label>
                  <Input
                    placeholder="Brief description of the risk"
                    value={risk.title}
                    onChange={(e) => updateRisk(index, 'title', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Category *</Label>
                  <select
                    value={risk.category}
                    onChange={(e) => updateRisk(index, 'category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-blue-500"
                  >
                    {RISK_CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label} - {category.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Risk Description */}
              <div className="mb-4 space-y-2">
                <Label className="text-sm font-medium text-gray-700">Risk Description *</Label>
                <Textarea
                  rows={3}
                  placeholder="Detailed description of the risk and its potential impact..."
                  value={risk.description}
                  onChange={(e) => updateRisk(index, 'description', e.target.value)}
                />
              </div>

              {/* Impact and Probability */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Impact Level *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {IMPACT_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => updateRisk(index, 'impact', level.value)}
                        className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                          risk.impact === level.value
                            ? `${level.color} border-current`
                            : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                        title={level.description}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Probability *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PROBABILITY_LEVELS.slice(0, 4).map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => updateRisk(index, 'probability', level.value)}
                        className={`p-3 text-sm font-medium rounded-lg border transition-colors ${
                          risk.probability === level.value
                            ? `${level.color} border-current`
                            : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                        title={level.description}
                      >
                        {level.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => updateRisk(index, 'probability', 'VERY_HIGH')}
                      className={`p-3 text-sm font-medium rounded-lg border transition-colors col-span-2 ${
                        risk.probability === 'VERY_HIGH'
                          ? 'bg-red-100 text-red-800 border-current'
                          : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                      }`}
                      title="> 70% chance"
                    >
                      Very High
                    </button>
                  </div>
                </div>
              </div>

              {/* Mitigation Strategy */}
              <div className="mb-4 space-y-2">
                <Label className="text-sm font-medium text-gray-700">Mitigation Strategy *</Label>
                <Textarea
                  rows={3}
                  placeholder="Describe how this risk will be prevented or minimized..."
                  value={risk.mitigation}
                  onChange={(e) => updateRisk(index, 'mitigation', e.target.value)}
                />
              </div>

              {/* Contingency Plan */}
              <div className="mb-4 space-y-2">
                <Label className="text-sm font-medium text-gray-700">Contingency Plan</Label>
                <Textarea
                  rows={2}
                  placeholder="What will be done if this risk occurs..."
                  value={risk.contingency || ''}
                  onChange={(e) => updateRisk(index, 'contingency', e.target.value)}
                />
              </div>

              {/* Owner and Due Date */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Risk Owner *</Label>
                  <Input
                    placeholder="Who is responsible"
                    value={risk.owner}
                    onChange={(e) => updateRisk(index, 'owner', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Due Date</Label>
                  <Input
                    type="date"
                    value={risk.dueDate || ''}
                    onChange={(e) => updateRisk(index, 'dueDate', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Status</Label>
                  <select
                    value={risk.status}
                    onChange={(e) => updateRisk(index, 'status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:border-blue-500 focus:ring-blue-500"
                  >
                    {RISK_STATUS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )
        })}

        {/* Empty State */}
        {(!formData.risks || formData.risks.length === 0) && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No risks identified</h3>
            <p className="text-gray-500 mb-4">Add risks to create a comprehensive risk management plan</p>
            <Button onClick={addRisk}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Risk
            </Button>
          </div>
        )}
      </div>

      {/* Risk Matrix Guide */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-4">Risk Assessment Guide</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Impact Levels</h5>
            <div className="space-y-2">
              {IMPACT_LEVELS.map((level) => (
                <div key={level.value} className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${level.color}`}>
                    {level.label}
                  </span>
                  <span className="text-sm text-gray-600">{level.description}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Probability Levels</h5>
            <div className="space-y-2">
              {PROBABILITY_LEVELS.map((level) => (
                <div key={level.value} className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded ${level.color}`}>
                    {level.label}
                  </span>
                  <span className="text-sm text-gray-600">{level.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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
