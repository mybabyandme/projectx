'use client'

import { useState } from 'react'
import { Users, UserPlus, Shield, Mail, Calendar, Edit, Trash2, Crown, Eye } from 'lucide-react'
import StatsHeader from '@/components/layout/stats-header'
import SearchFilters from '@/components/layout/search-filters'
import ResultsList from '@/components/layout/results-list'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { InviteMemberModal } from './invite-member-modal'
import { EditMemberModal } from './edit-member-modal'
import { formatDate } from '@/lib/utils'

interface TeamMember {
  id: string
  role: string
  permissions?: any
  joinedAt: Date
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    createdAt: Date
  }
}

interface TeamManagementViewProps {
  members: TeamMember[]
  currentUserRole: string
  canManageTeam: boolean
  organizationSlug: string
}

export default function TeamManagementView({ 
  members, 
  currentUserRole, 
  canManageTeam,
  organizationSlug 
}: TeamManagementViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('joined_desc')
  const [viewMode, setViewMode] = useState<'list' | 'card'>('card')
  const [roleFilter, setRoleFilter] = useState('')
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  
  const { toast } = useToast()

  // Calculate stats
  const totalMembers = members.length
  const adminCount = members.filter(m => ['ORG_ADMIN', 'SUPER_ADMIN'].includes(m.role)).length
  const pmCount = members.filter(m => m.role === 'PROJECT_MANAGER').length
  const teamMemberCount = members.filter(m => m.role === 'TEAM_MEMBER').length
  const recentJoins = members.filter(m => {
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return new Date(m.joinedAt) > weekAgo
  }).length

  // Stats for header
  const stats = [
    {
      icon: <Users className="h-5 w-5" />,
      value: totalMembers,
      label: 'Total Members',
      trend: recentJoins > 0 ? { value: recentJoins, label: 'new this week', direction: 'up' as const } : undefined
    },
    {
      icon: <Crown className="h-5 w-5" />,
      value: adminCount,
      label: 'Administrators',
    },
    {
      icon: <Shield className="h-5 w-5" />,
      value: pmCount,
      label: 'Project Managers',
    },
    {
      icon: <Users className="h-5 w-5" />,
      value: teamMemberCount,
      label: 'Team Members',
    },
  ]

  // Filter and sort members
  const filteredMembers = members
    .filter(member => {
      const matchesSearch = member.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           member.user.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = !roleFilter || member.role === roleFilter
      return matchesSearch && matchesRole
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name_asc': return (a.user.name || '').localeCompare(b.user.name || '')
        case 'name_desc': return (b.user.name || '').localeCompare(a.user.name || '')
        case 'email_asc': return a.user.email.localeCompare(b.user.email)
        case 'email_desc': return b.user.email.localeCompare(a.user.email)
        case 'role_asc': return a.role.localeCompare(b.role)
        case 'role_desc': return b.role.localeCompare(a.role)
        case 'joined_desc': return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
        case 'joined_asc': return new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime()
        default: return new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
      }
    })

  // Actions
  const actions = canManageTeam ? [
    {
      label: 'Invite Member',
      onClick: () => setShowInviteModal(true),
      variant: 'primary' as const,
      icon: <UserPlus className="h-4 w-4" />
    }
  ] : []

  // Filter configuration
  const filters = [
    {
      key: 'role',
      label: 'Role',
      type: 'select' as const,
      options: [
        { value: 'ORG_ADMIN', label: 'Admin', count: adminCount },
        { value: 'PROJECT_MANAGER', label: 'Project Manager', count: pmCount },
        { value: 'MONITOR', label: 'Monitor' },
        { value: 'DONOR_SPONSOR', label: 'Donor/Sponsor' },
        { value: 'TEAM_MEMBER', label: 'Team Member', count: teamMemberCount },
        { value: 'VIEWER', label: 'Viewer' },
      ],
      value: roleFilter
    }
  ]

  const sortOptions = [
    { value: 'joined_desc', label: 'Recently Joined' },
    { value: 'joined_asc', label: 'Oldest Members' },
    { value: 'name_asc', label: 'Name A-Z' },
    { value: 'name_desc', label: 'Name Z-A' },
    { value: 'role_asc', label: 'Role A-Z' },
    { value: 'role_desc', label: 'Role Z-A' },
  ]

  // Get role badge color
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-800'
      case 'ORG_ADMIN': return 'bg-red-100 text-red-800'
      case 'PROJECT_MANAGER': return 'bg-blue-100 text-blue-800'
      case 'MONITOR': return 'bg-green-100 text-green-800'
      case 'DONOR_SPONSOR': return 'bg-yellow-100 text-yellow-800'
      case 'TEAM_MEMBER': return 'bg-gray-100 text-gray-800'
      case 'VIEWER': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleDisplayName = (role: string) => {
    return role.replace('_', ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
  }

  // Table fields for ResultsList
  const fields = [
    {
      key: 'user',
      label: 'Member',
      type: 'avatar' as const,
      primary: true, // Mark as primary field
      render: (user: any) => ({
        name: user?.name || user?.email || 'Unknown User',
        image: user?.image,
        email: user?.email
      })
    },
    {
      key: 'role',
      label: 'Role',
      type: 'custom' as const,
      render: (role: string) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(role)}`}>
          {getRoleDisplayName(role)}
        </span>
      )
    },
    {
      key: 'joinedAt',
      label: 'Joined',
      type: 'date' as const,
      hideOnMobile: true,
    },
    {
      key: 'email',
      label: 'Email',
      type: 'custom' as const,
      render: (value: any, item: any) => item?.user?.email || '-',
      hideOnMobile: true,
    }
  ]

  const handleEditMember = async (member: TeamMember) => {
    if (!canManageTeam) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to edit team members.',
        variant: 'destructive',
      })
      return
    }
    setEditingMember(member)
  }

  const handleRemoveMember = async (member: TeamMember) => {
    if (!canManageTeam) {
      toast({
        title: 'Access Denied',
        description: 'You do not have permission to remove team members.',
        variant: 'destructive',
      })
      return
    }

    if (member.role === 'ORG_ADMIN' && adminCount <= 1) {
      toast({
        title: 'Cannot Remove Admin',
        description: 'Organization must have at least one administrator.',
        variant: 'destructive',
      })
      return
    }

    setLoadingStates(prev => ({ ...prev, [member.id]: true }))

    try {
      const response = await fetch(`/api/organizations/${organizationSlug}/members/${member.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast({
          title: 'Member Removed',
          description: `${member.user.name || member.user.email} has been removed from the organization.`,
        })
        // Refresh the page to update the member list
        window.location.reload()
      } else {
        const data = await response.json()
        toast({
          title: 'Failed to Remove Member',
          description: data.message || 'Something went wrong.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      })
    } finally {
      setLoadingStates(prev => ({ ...prev, [member.id]: false }))
    }
  }

  // Universal member actions for ResultsList
  const memberActions = [
    {
      key: 'view',
      label: 'View Profile',
      icon: <Eye className="h-4 w-4" />,
      variant: 'default' as const,
      onClick: (member: any) => console.log('View member', member.id),
    },
    ...(canManageTeam ? [
      {
        key: 'edit',
        label: 'Edit Role',
        icon: <Edit className="h-4 w-4" />,
        variant: 'default' as const,
        onClick: (member: any) => handleEditMember(member),
      },
      {
        key: 'remove',
        label: 'Remove Member',
        icon: <Trash2 className="h-4 w-4" />,
        variant: 'danger' as const,
        onClick: (member: any) => {
          // Check if this action should be disabled
          if (member.role === 'ORG_ADMIN' && adminCount <= 1) {
            toast({
              title: 'Cannot Remove Admin',
              description: 'At least one organization admin is required.',
              variant: 'destructive',
            })
            return
          }
          handleRemoveMember(member)
        },
      }
    ] : [])
  ]

  // Member actions (keeping for backwards compatibility if needed elsewhere)
  const getMemberActions = (member: TeamMember) => {
    const baseActions = [
      {
        key: 'view',
        label: 'View Profile',
        icon: <Eye className="h-4 w-4" />,
        variant: 'default' as const,
        onClick: (item: any) => console.log('View member', item.id),
      }
    ]

    if (canManageTeam) {
      baseActions.push(
        {
          key: 'edit',
          label: 'Edit Role',
          icon: <Edit className="h-4 w-4" />,
          variant: 'default' as const,
          onClick: handleEditMember,
        },
        {
          key: 'remove',
          label: 'Remove Member',
          icon: <Trash2 className="h-4 w-4" />,
          variant: 'danger' as const,
          onClick: handleRemoveMember,
          disabled: member.role === 'ORG_ADMIN' && adminCount <= 1,
        }
      )
    }

    return baseActions
  }

  const handleFilterChange = (key: string, value: any) => {
    if (key === 'role') {
      setRoleFilter(value)
    }
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setRoleFilter('')
  }

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedMembers(selectedIds)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Stats */}
      <StatsHeader
        title="Team Management"
        subtitle="Manage team members, roles, and permissions"
        stats={stats}
        actions={actions}
        onRefresh={() => window.location.reload()}
      />

      {/* Search and Filters */}
      <SearchFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchPlaceholder="Search team members..."
        filters={filters}
        onFilterChange={handleFilterChange}
        sortOptions={sortOptions}
        sortBy={sortBy}
        setSortBy={setSortBy}
        totalCount={members.length}
        filteredCount={filteredMembers.length}
        onClearFilters={handleClearFilters}
        primaryAction={canManageTeam ? {
          label: 'Invite Member',
          onClick: () => setShowInviteModal(true),
        } : undefined}
      />

      {/* Results List */}
      <ResultsList
        items={filteredMembers}
        fields={fields}
        viewMode="compact"
        actions={memberActions}
        selectable={canManageTeam}
        selectedItems={selectedMembers}
        onSelectionChange={handleSelectionChange}
        getItemId={(item) => item.id}
        loadingStates={loadingStates}
        emptyTitle="No team members found"
        emptyDescription="Start building your team by inviting members."
        emptyAction={canManageTeam ? {
          label: 'Invite First Member',
          onClick: () => setShowInviteModal(true),
        } : undefined}
        compact={true}
      />

      {/* Modals */}
      {showInviteModal && (
        <InviteMemberModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          organizationSlug={organizationSlug}
        />
      )}

      {editingMember && (
        <EditMemberModal
          isOpen={!!editingMember}
          onClose={() => setEditingMember(null)}
          member={editingMember}
          organizationSlug={organizationSlug}
        />
      )}
    </div>
  )
}