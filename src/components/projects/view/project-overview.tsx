'use client'

import { 
  Calendar, DollarSign, Users, Target, AlertTriangle, 
  TrendingUp, Clock, CheckCircle, Package, Eye, FileText 
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ProjectOverviewProps {
  project: any
  progressPercentage: number
  totalTasks: number
  completedTasks: number
  totalBudget: number
  spentBudget: number
  canViewFinancials: boolean
}

export default function ProjectOverview({
  project,
  progressPercentage,
  totalTasks,
  completedTasks,
  totalBudget,
  spentBudget,
  canViewFinancials
}: ProjectOverviewProps) {
  const charter = project.metadata?.charter
  const stakeholders = project.metadata?.stakeholders?.stakeholders || []
  const risks = project.metadata?.risks?.risks || []
  
  const highRisks = risks.filter((risk: any) => {
    const impactScore = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'VERY_HIGH': 4 }[risk.impact] || 2
    const probScore = { 'VERY_LOW': 1, 'LOW': 2, 'MEDIUM': 3, 'HIGH': 4, 'VERY_HIGH': 5 }[risk.probability] || 2
    return (impactScore * probScore) >= 8
  })

  const keyStakeholders = stakeholders.filter((s: any) => s.influence === 'HIGH' || s.interest === 'HIGH')

  return (
    <div className="p-6 space-y-8">
      {/* Project Charter Summary */}
      {charter && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <Eye className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-blue-900">Project Vision</h3>
          </div>
          <p className="text-blue-800 mb-4">{charter.vision}</p>
          
          {charter.objectives && charter.objectives.length > 0 && (
            <div>
              <h4 className="font-medium text-blue-900 mb-2">Key Objectives</h4>
              <ul className="space-y-1">
                {charter.objectives.slice(0, 3).map((objective: string, index: number) => (
                  <li key={index} className="flex items-start text-sm text-blue-700">
                    <Target className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    {objective}
                  </li>
                ))}
                {charter.objectives.length > 3 && (
                  <li className="text-sm text-blue-600 ml-6">
                    +{charter.objectives.length - 3} more objectives
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Progress Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Progress</p>
              <p className="text-2xl font-bold text-gray-900">{progressPercentage}%</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {completedTasks} of {totalTasks} tasks completed
            </p>
          </div>
        </div>

        {/* Budget Card */}
        {canViewFinancials && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Budget</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalBudget, project.currency)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${totalBudget > 0 ? (spentBudget / totalBudget) * 100 : 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {formatCurrency(spentBudget, project.currency)} spent
              </p>
            </div>
          </div>
        )}

        {/* Team Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Team</p>
              <p className="text-2xl font-bold text-gray-900">{stakeholders.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">
              {keyStakeholders.length} key stakeholders
            </p>
          </div>
        </div>

        {/* Risks Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Risks</p>
              <p className="text-2xl font-bold text-gray-900">{risks.length}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-xs text-gray-500">
              {highRisks.length} high priority risks
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tasks */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Tasks</h3>
            <CheckCircle className="h-5 w-5 text-gray-400" />
          </div>
          
          {project.tasks && project.tasks.length > 0 ? (
            <div className="space-y-3">
              {project.tasks.slice(0, 5).map((task: any) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">{task.title}</h4>
                    <p className="text-sm text-gray-500">{formatDate(task.createdAt)}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    task.status === 'DONE' ? 'bg-green-100 text-green-800' :
                    task.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    task.status === 'IN_REVIEW' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No tasks created yet</p>
            </div>
          )}
        </div>

        {/* Project Phases */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Project Phases</h3>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          
          {project.phases && project.phases.length > 0 ? (
            <div className="space-y-3">
              {project.phases.map((phase: any, index: number) => (
                <div key={phase.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 mr-3">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900">{phase.name}</h4>
                    <p className="text-sm text-gray-500">
                      {phase.tasks?.length || 0} tasks
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    phase.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    phase.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {phase.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No phases defined</p>
            </div>
          )}
        </div>
      </div>

      {/* High Priority Risks */}
      {highRisks.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
            <h3 className="text-lg font-semibold text-orange-900">High Priority Risks</h3>
          </div>
          
          <div className="space-y-3">
            {highRisks.slice(0, 3).map((risk: any, index: number) => (
              <div key={index} className="bg-white border border-orange-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{risk.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{risk.description}</p>
                    <div className="flex items-center mt-2 space-x-2">
                      <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                        {risk.category}
                      </span>
                      <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                        {risk.impact} Impact
                      </span>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                        {risk.probability} Probability
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-orange-100">
                  <h5 className="text-sm font-medium text-gray-700">Mitigation:</h5>
                  <p className="text-sm text-gray-600">{risk.mitigation}</p>
                </div>
              </div>
            ))}
            
            {highRisks.length > 3 && (
              <p className="text-sm text-orange-700 text-center">
                +{highRisks.length - 3} more high priority risks
              </p>
            )}
          </div>
        </div>
      )}

      {/* Key Deliverables */}
      {charter?.deliverables && charter.deliverables.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Key Deliverables</h3>
            <Package className="h-5 w-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {charter.deliverables.map((deliverable: any, index: number) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">{deliverable.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{deliverable.description}</p>
                {deliverable.dueDate && (
                  <p className="text-xs text-gray-500 mt-2">
                    Due: {formatDate(deliverable.dueDate)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
