'use client'

import { 
  AlertTriangle, TrendingUp, Clock, Shield, User, 
  Calendar, ArrowUp, ArrowDown, Minus, MoreVertical 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatDate } from '@/lib/utils'

interface RiskDashboardProps {
  project: any
  canEdit?: boolean
  onAddRisk?: () => void
  onEditRisk?: (risk: any) => void
}

const RISK_CATEGORIES = {
  TECHNICAL: { color: 'bg-blue-100 text-blue-800', label: 'Technical' },
  FINANCIAL: { color: 'bg-green-100 text-green-800', label: 'Financial' },
  SCHEDULE: { color: 'bg-yellow-100 text-yellow-800', label: 'Schedule' },
  SCOPE: { color: 'bg-purple-100 text-purple-800', label: 'Scope' },
  EXTERNAL: { color: 'bg-red-100 text-red-800', label: 'External' },
  RESOURCE: { color: 'bg-orange-100 text-orange-800', label: 'Resource' }
}

const getRiskLevel = (impact: number, probability: number) => {
  const score = impact * probability
  if (score >= 20) return 'CRITICAL'
  if (score >= 12) return 'HIGH'
  if (score >= 6) return 'MEDIUM'
  return 'LOW'
}
const getRiskLevelColor = (level: string) => {
  switch (level) {
    case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300'
    case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300'
    case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'LOW': return 'bg-green-100 text-green-800 border-green-300'
    default: return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'active': return 'bg-red-100 text-red-800'
    case 'mitigated': return 'bg-green-100 text-green-800'
    case 'accepted': return 'bg-blue-100 text-blue-800'
    case 'transferred': return 'bg-purple-100 text-purple-800'
    case 'closed': return 'bg-gray-100 text-gray-800'
    default: return 'bg-yellow-100 text-yellow-800'
  }
}

export default function RiskDashboard({
  project,
  canEdit = false,
  onAddRisk,
  onEditRisk
}: RiskDashboardProps) {
  // Extract risks from project metadata (from wizard)
  const risks = project.metadata?.risks?.risks || []
  
  if (risks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Risk Assessment
          </CardTitle>          <CardDescription>
            No risks have been identified for this project yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {canEdit && onAddRisk && (
            <Button onClick={onAddRisk} variant="outline" className="w-full">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Add Risk Assessment
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  // Calculate risk statistics
  const riskStats = {
    total: risks.length,
    critical: risks.filter((r: any) => getRiskLevel(r.impact || 0, r.probability || 0) === 'CRITICAL').length,
    high: risks.filter((r: any) => getRiskLevel(r.impact || 0, r.probability || 0) === 'HIGH').length,
    medium: risks.filter((r: any) => getRiskLevel(r.impact || 0, r.probability || 0) === 'MEDIUM').length,
    low: risks.filter((r: any) => getRiskLevel(r.impact || 0, r.probability || 0) === 'LOW').length,
    active: risks.filter((r: any) => r.status !== 'closed' && r.status !== 'mitigated').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Risk Dashboard</h3>
          <p className="text-sm text-gray-600">
            {riskStats.total} risk{riskStats.total !== 1 ? 's' : ''} identified, {riskStats.active} active
          </p>
        </div>
        {canEdit && onAddRisk && (
          <Button onClick={onAddRisk} size="sm">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Add Risk
          </Button>
        )}
      </div>
      {/* Risk Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{riskStats.total}</div>
            <div className="text-sm text-gray-600">Total Risks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{riskStats.critical}</div>
            <div className="text-sm text-gray-600">Critical</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{riskStats.high}</div>
            <div className="text-sm text-gray-600">High</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{riskStats.medium}</div>
            <div className="text-sm text-gray-600">Medium</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{riskStats.low}</div>
            <div className="text-sm text-gray-600">Low</div>
          </CardContent>
        </Card>
      </div>
      {/* Risk Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Risk Matrix</CardTitle>
          <CardDescription>
            Visual representation of impact vs probability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-1 text-xs">
            {/* Header row */}
            <div></div>
            <div className="text-center font-medium p-2">Very Low</div>
            <div className="text-center font-medium p-2">Low</div>
            <div className="text-center font-medium p-2">Medium</div>
            <div className="text-center font-medium p-2">High</div>
            <div className="text-center font-medium p-2">Very High</div>
            
            {/* Matrix rows */}
            {[5, 4, 3, 2, 1].map((impact) => (
              <>
                <div key={`label-${impact}`} className="flex items-center justify-center font-medium p-2">
                  {impact === 5 ? 'Very High' : impact === 4 ? 'High' : impact === 3 ? 'Medium' : impact === 2 ? 'Low' : 'Very Low'}
                </div>
                {[1, 2, 3, 4, 5].map((probability) => {
                  const score = impact * probability
                  const level = getRiskLevel(impact, probability)
                  const cellRisks = risks.filter((r: any) => 
                    Math.round(r.impact || 0) === impact && Math.round(r.probability || 0) === probability
                  )
                  
                  return (
                    <div 
                      key={`${impact}-${probability}`}
                      className={`p-2 rounded text-center font-medium border-2 ${getRiskLevelColor(level)} min-h-[40px] flex items-center justify-center`}
                    >
                      {cellRisks.length > 0 ? cellRisks.length : ''}
                    </div>
                  )
                })}
              </>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Risk List */}
      <div className="space-y-4">
        <h4 className="text-base font-semibold text-gray-900">Risk Details</h4>
        {risks.map((risk: any) => {
          const riskLevel = getRiskLevel(risk.impact || 0, risk.probability || 0)
          const categoryConfig = RISK_CATEGORIES[risk.category as keyof typeof RISK_CATEGORIES] || 
                               { color: 'bg-gray-100 text-gray-800', label: risk.category || 'Other' }

          return (
            <Card key={risk.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h5 className="font-medium text-gray-900">{risk.title}</h5>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRiskLevelColor(riskLevel)}`}>
                        {riskLevel}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryConfig.color}`}>
                        {categoryConfig.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{risk.description}</p>
                  </div>
                  {canEdit && onEditRisk && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEditRisk(risk)}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Impact</p>
                    <div className="flex items-center space-x-2">
                      <Progress value={(risk.impact || 0) * 20} className="flex-1" />
                      <span className="text-sm font-medium">{risk.impact || 0}/5</span>
                    </div>
                  </div>                  <div>
                    <p className="text-xs text-gray-500 mb-1">Probability</p>
                    <div className="flex items-center space-x-2">
                      <Progress value={(risk.probability || 0) * 20} className="flex-1" />
                      <span className="text-sm font-medium">{risk.probability || 0}/5</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Status</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(risk.status)}`}>
                      {risk.status || 'Identified'}
                    </span>
                  </div>
                </div>

                {risk.mitigation && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Mitigation Strategy</p>
                    <p className="text-sm text-gray-700">{risk.mitigation}</p>
                  </div>
                )}

                {risk.contingency && (
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Contingency Plan</p>
                    <p className="text-sm text-gray-700">{risk.contingency}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    {risk.owner && (
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        <span>Owner: {risk.owner}</span>
                      </div>
                    )}
                    {risk.dueDate && (
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Due: {formatDate(risk.dueDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
