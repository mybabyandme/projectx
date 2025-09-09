'use client'

import { 
  Users, Mail, Phone, Building2, Crown, Shield, 
  Eye, AlertCircle, UserCheck, ExternalLink, MoreVertical 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface StakeholderListProps {
  project: any
  canEdit?: boolean
  onAddStakeholder?: () => void
  onEditStakeholder?: (stakeholder: any) => void
}

const ROLE_CONFIG = {
  SPONSOR: { 
    color: 'bg-purple-100 text-purple-800 border-purple-200', 
    icon: Crown,
    label: 'Sponsor'
  },
  PROJECT_MANAGER: { 
    color: 'bg-blue-100 text-blue-800 border-blue-200', 
    icon: Shield,
    label: 'Project Manager'
  },
  MONITOR: { 
    color: 'bg-green-100 text-green-800 border-green-200', 
    icon: Eye,
    label: 'Monitor'
  },
  TEAM_MEMBER: { 
    color: 'bg-gray-100 text-gray-800 border-gray-200', 
    icon: UserCheck,
    label: 'Team Member'
  },
  STAKEHOLDER: { 
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
    icon: Users,
    label: 'Stakeholder'
  },
  DONOR: { 
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200', 
    icon: Building2,
    label: 'Donor'
  },
  BENEFICIARY: { 
    color: 'bg-pink-100 text-pink-800 border-pink-200', 
    icon: Users,
    label: 'Beneficiary'
  },
  VENDOR: { 
    color: 'bg-orange-100 text-orange-800 border-orange-200', 
    icon: Building2,
    label: 'Vendor'
  },
  ADVISOR: { 
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200', 
    icon: UserCheck,
    label: 'Advisor'
  }
}

const getInfluenceColor = (influence: string) => {
  switch (influence?.toLowerCase()) {
    case 'high': return 'bg-red-100 text-red-800'
    case 'medium': return 'bg-yellow-100 text-yellow-800'
    case 'low': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getInterestColor = (interest: string) => {
  switch (interest?.toLowerCase()) {
    case 'high': return 'bg-blue-100 text-blue-800'
    case 'medium': return 'bg-cyan-100 text-cyan-800'
    case 'low': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default function StakeholderList({
  project,
  canEdit = false,
  onAddStakeholder,
  onEditStakeholder
}: StakeholderListProps) {
  // Extract stakeholders from project metadata (from wizard)
  const stakeholders = project.metadata?.stakeholders?.stakeholders || []
  
  if (stakeholders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Project Stakeholders
          </CardTitle>
          <CardDescription>
            No stakeholders have been defined for this project yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {canEdit && onAddStakeholder && (
            <Button onClick={onAddStakeholder} variant="outline" className="w-full">
              <Users className="h-4 w-4 mr-2" />
              Add Stakeholders
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Project Stakeholders</h3>
          <p className="text-sm text-gray-600">
            {stakeholders.length} stakeholder{stakeholders.length !== 1 ? 's' : ''} involved in this project
          </p>
        </div>
        {canEdit && onAddStakeholder && (
          <Button onClick={onAddStakeholder} size="sm">
            <Users className="h-4 w-4 mr-2" />
            Add Stakeholder
          </Button>
        )}
      </div>

      {/* Stakeholder Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stakeholders.map((stakeholder: any) => {
          const roleConfig = ROLE_CONFIG[stakeholder.role as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.STAKEHOLDER
          const RoleIcon = roleConfig.icon

          return (
            <Card key={stakeholder.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={stakeholder.avatar} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {stakeholder.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'ST'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-gray-900">{stakeholder.name}</h4>
                      <p className="text-sm text-gray-600">{stakeholder.organization}</p>
                    </div>
                  </div>
                  {canEdit && onEditStakeholder && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEditStakeholder(stakeholder)}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Role Badge */}
                <div className="mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${roleConfig.color}`}>
                    <RoleIcon className="h-3 w-3 mr-1" />
                    {roleConfig.label}
                  </span>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mb-3">
                  {stakeholder.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <a 
                        href={`mailto:${stakeholder.email}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {stakeholder.email}
                      </a>
                    </div>
                  )}
                  {stakeholder.contactInfo?.phone && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 text-gray-400" />
                      <a 
                        href={`tel:${stakeholder.contactInfo.phone}`}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {stakeholder.contactInfo.phone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Influence & Interest Matrix */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Influence</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getInfluenceColor(stakeholder.influence)}`}>
                      {stakeholder.influence || 'Not Set'}
                    </span>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-1">Interest</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getInterestColor(stakeholder.interest)}`}>
                      {stakeholder.interest || 'Not Set'}
                    </span>
                  </div>
                </div>

                {/* Responsibilities */}
                {stakeholder.responsibilities && stakeholder.responsibilities.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Key Responsibilities</p>
                    <div className="flex flex-wrap gap-1">
                      {stakeholder.responsibilities.slice(0, 2).map((resp: string, index: number) => (
                        <span 
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700"
                        >
                          {resp}
                        </span>
                      ))}
                      {stakeholder.responsibilities.length > 2 && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-500">
                          +{stakeholder.responsibilities.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Summary Stats */}
      <div className="border-t pt-6">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Stakeholder Analysis</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {stakeholders.filter((s: any) => s.influence === 'high').length}
            </div>
            <div className="text-xs text-gray-500">High Influence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stakeholders.filter((s: any) => s.interest === 'high').length}
            </div>
            <div className="text-xs text-gray-500">High Interest</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stakeholders.filter((s: any) => s.role === 'SPONSOR').length}
            </div>
            <div className="text-xs text-gray-500">Sponsors</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stakeholders.filter((s: any) => s.role === 'TEAM_MEMBER').length}
            </div>
            <div className="text-xs text-gray-500">Team Members</div>
          </div>
        </div>
      </div>
    </div>
  )
}
