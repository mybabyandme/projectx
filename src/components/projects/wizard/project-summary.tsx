'use client'

import { CheckCircle, AlertCircle, Users, Target, Package, AlertTriangle, FileText, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProjectWizardData } from '@/lib/project-wizard-schemas'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ProjectSummaryProps {
  wizardData: ProjectWizardData
  onCreateProject: () => void
  isLoading: boolean
}

export default function ProjectSummary({ 
  wizardData, 
  onCreateProject, 
  isLoading 
}: ProjectSummaryProps) {
  const { basics, charter, stakeholders, risks } = wizardData

  const calculateRiskScore = (impact: string, probability: string): number => {
    const impactMap = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'VERY_HIGH': 4 }
    const probabilityMap = { 'VERY_LOW': 1, 'LOW': 2, 'MEDIUM': 3, 'HIGH': 4, 'VERY_HIGH': 5 }
    return (impactMap[impact as keyof typeof impactMap] || 2) * (probabilityMap[probability as keyof typeof probabilityMap] || 2)
  }

  const getRiskLevel = (score: number): string => {
    if (score >= 12) return 'Critical'
    if (score >= 8) return 'High'
    if (score >= 4) return 'Medium'
    return 'Low'
  }

  const highRisks = risks.risks.filter(risk => {
    const score = calculateRiskScore(risk.impact, risk.probability)
    return getRiskLevel(score) === 'High' || getRiskLevel(score) === 'Critical'
  })

  const keyStakeholders = stakeholders.stakeholders.filter(stakeholder => 
    stakeholder.influence === 'HIGH' || stakeholder.interest === 'HIGH'
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Project Summary</h3>
        <p className="text-gray-600">Review your project configuration before creation</p>
      </div>

      {/* Project Overview */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <FileText className="h-6 w-6 text-blue-600" />
          <h4 className="text-xl font-semibold text-blue-900">{basics.name}</h4>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Template:</strong> {basics.template.replace('_', ' ')}</p>
            <p><strong>Methodology:</strong> {basics.methodology}</p>
            <p><strong>Priority:</strong> {basics.priority}</p>
          </div>
          <div>
            <p><strong>Budget:</strong> {formatCurrency(basics.estimatedBudget, basics.currency)}</p>
            <p><strong>Duration:</strong> {formatDate(basics.startDate)} - {formatDate(basics.endDate)}</p>
            <p><strong>Tags:</strong> {basics.tags?.join(', ') || 'None'}</p>
          </div>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-blue-800">{basics.description}</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{charter.objectives.length}</div>
          <div className="text-sm text-gray-500">Objectives</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <Package className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{charter.deliverables.length}</div>
          <div className="text-sm text-gray-500">Deliverables</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{stakeholders.stakeholders.length}</div>
          <div className="text-sm text-gray-500">Stakeholders</div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-4 text-center">
          <AlertTriangle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">{risks.risks.length}</div>
          <div className="text-sm text-gray-500">Risks Identified</div>
        </div>
      </div>

      {/* Project Charter Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Target className="h-5 w-5 text-blue-600 mr-2" />
          Project Charter
        </h4>
        
        <div className="space-y-4">
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Vision</h5>
            <p className="text-sm text-gray-600">{charter.vision}</p>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Key Objectives</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              {charter.objectives.slice(0, 3).map((objective, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  {objective}
                </li>
              ))}
              {charter.objectives.length > 3 && (
                <li className="text-gray-400">...and {charter.objectives.length - 3} more</li>
              )}
            </ul>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-700 mb-2">Major Deliverables</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              {charter.deliverables.slice(0, 3).map((deliverable, index) => (
                <li key={index} className="flex items-start">
                  <Package className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">{deliverable.name}</span>
                    {deliverable.dueDate && (
                      <span className="text-gray-400 ml-2">
                        (Due: {formatDate(deliverable.dueDate)})
                      </span>
                    )}
                  </div>
                </li>
              ))}
              {charter.deliverables.length > 3 && (
                <li className="text-gray-400">...and {charter.deliverables.length - 3} more</li>
              )}
            </ul>
          </div>

          <div>
            <h5 className="font-medium text-gray-700 mb-2">Success Criteria</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              {charter.successCriteria.slice(0, 2).map((criteria, index) => (
                <li key={index} className="flex items-start">
                  <Eye className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                  {criteria}
                </li>
              ))}
              {charter.successCriteria.length > 2 && (
                <li className="text-gray-400">...and {charter.successCriteria.length - 2} more</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Key Stakeholders */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Users className="h-5 w-5 text-purple-600 mr-2" />
          Key Stakeholders
        </h4>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {keyStakeholders.slice(0, 4).map((stakeholder, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {stakeholder.name ? stakeholder.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div className="flex-1">
                <h6 className="font-medium text-gray-900">{stakeholder.name || 'To be assigned'}</h6>
                <p className="text-sm text-gray-500">{stakeholder.role.replace('_', ' ')}</p>
                <div className="flex space-x-2 mt-1">
                  <span className={`px-2 py-0.5 text-xs rounded ${
                    stakeholder.influence === 'HIGH' ? 'bg-red-100 text-red-700' : 
                    stakeholder.influence === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {stakeholder.influence} Influence
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded ${
                    stakeholder.interest === 'HIGH' ? 'bg-green-100 text-green-700' : 
                    stakeholder.interest === 'MEDIUM' ? 'bg-blue-100 text-blue-700' : 
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {stakeholder.interest} Interest
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {stakeholders.stakeholders.length > keyStakeholders.length && (
          <p className="text-sm text-gray-500 mt-4">
            And {stakeholders.stakeholders.length - keyStakeholders.length} additional stakeholder{stakeholders.stakeholders.length - keyStakeholders.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* High Priority Risks */}
      {highRisks.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-orange-900 mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
            High Priority Risks
          </h4>
          
          <div className="space-y-3">
            {highRisks.slice(0, 3).map((risk, index) => {
              const score = calculateRiskScore(risk.impact, risk.probability)
              const level = getRiskLevel(score)
              
              return (
                <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-orange-200">
                  <AlertCircle className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                    level === 'Critical' ? 'text-red-600' : 'text-orange-600'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h6 className="font-medium text-gray-900">{risk.title}</h6>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        level === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {level} Risk
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{risk.description}</p>
                    <p className="text-sm text-gray-700">
                      <strong>Mitigation:</strong> {risk.mitigation}
                    </p>
                    {risk.owner && (
                      <p className="text-xs text-gray-500 mt-1">
                        Owner: {risk.owner}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
            
            {highRisks.length > 3 && (
              <p className="text-sm text-orange-700">
                And {highRisks.length - 3} more high priority risk{highRisks.length - 3 !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Project Scope Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Project Scope</h4>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-green-700 mb-2">In Scope</h5>
            <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
              {charter.scope}
            </p>
          </div>
          
          {charter.outOfScope && (
            <div>
              <h5 className="font-medium text-red-700 mb-2">Out of Scope</h5>
              <p className="text-sm text-gray-600 bg-red-50 p-3 rounded-lg">
                {charter.outOfScope}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Readiness Check */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Project Readiness</h4>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-700">Project basics defined</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-700">Charter completed</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-700">{stakeholders.stakeholders.length} stakeholder{stakeholders.stakeholders.length !== 1 ? 's' : ''} identified</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-700">{risks.risks.length} risk{risks.risks.length !== 1 ? 's' : ''} assessed</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-700">{charter.deliverables.length} deliverable{charter.deliverables.length !== 1 ? 's' : ''} planned</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-gray-700">Success criteria established</span>
            </div>
          </div>
        </div>
      </div>

      {/* Create Project Button */}
      <div className="text-center pt-6 border-t border-gray-200">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h4 className="text-lg font-semibold text-blue-900 mb-2">Ready to Create Project?</h4>
          <p className="text-blue-700 mb-4">
            You've successfully configured all aspects of your project. Click below to create your project and start execution.
          </p>
          
          <Button
            onClick={onCreateProject}
            disabled={isLoading}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating Project...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Create Project
              </>
            )}
          </Button>
        </div>
        
        <p className="text-xs text-gray-500">
          After creation, you can modify project settings, add team members, and begin task planning.
        </p>
      </div>
    </div>
  )
}
