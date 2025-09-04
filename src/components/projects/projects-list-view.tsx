'use client'

import { useState } from 'react'
import { FolderKanban, Calendar, DollarSign, Users, CheckSquare, Plus, Edit, Archive, Trash2 } from 'lucide-react'
import StatsHeader from '@/components/layout/stats-header'
import SearchFilters from '@/components/layout/search-filters'
import ResultsList from '@/components/layout/results-list'
import { formatCurrency } from '@/lib/utils'

interface Project {
  id: string
  name: string
  description?: string | null
  status: string
  methodology: string
  budget?: number | null
  startDate?: Date | null
  endDate?: Date | null
  createdAt: Date
  updatedAt: Date
  tasks: Array<{ id: string; status: string }>
  budgets: Array<{ allocatedAmount: number; spentAmount: number }>
}

interface ProjectsListViewProps {
  projects: Project[]
}

export default function ProjectsListView({ projects }: ProjectsListViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('updated_desc')
  const [viewMode, setViewMode] = useState<'list' | 'card'>('card')
  const [statusFilter, setStatusFilter] = useState('')
  const [methodologyFilter, setMethodologyFilter] = useState('')

  // Calculate stats
  const activeProjects = projects.filter(p => p.status === 'ACTIVE').length
  const completedProjects = projects.filter(p => p.status === 'COMPLETED').length
  const totalTasks = projects.reduce((sum, p) => sum + p.tasks.length, 0)
  const completedTasks = projects.reduce((sum, p) => sum + p.tasks.filter(t => t.status === 'DONE').length, 0)
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0)
  const spentBudget = projects.reduce((sum, p) => sum + p.budgets.reduce((bSum, b) => bSum + b.spentAmount, 0), 0)

  // Stats for header
  const stats = [
    {
      icon: <FolderKanban className="h-5 w-5" />,
      value: projects.length,
      label: 'Total Projects',
      trend: { value: 12, label: 'this month', direction: 'up' as const }
    },
    {
      icon: <CheckSquare className="h-5 w-5" />,
      value: activeProjects,
      label: 'Active Projects',
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      value: `${completedTasks}/${totalTasks}`,
      label: 'Tasks Completed',
      trend: { value: 8, label: 'this week', direction: 'up' as const }
    },
    {
      icon: <DollarSign className="h-5 w-5" />,
      value: formatCurrency(totalBudget),
      label: 'Total Budget',
    },
    {
      icon: <DollarSign className="h-5 w-5" />,
      value: formatCurrency(spentBudget),
      label: 'Spent Budget',
      trend: { value: 5, label: 'under budget', direction: 'down' as const }
    },
    {
      icon: <Users className="h-5 w-5" />,
      value: completedProjects,
      label: 'Completed',
    },
  ]

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = !statusFilter || project.status === statusFilter
      const matchesMethodology = !methodologyFilter || project.methodology === methodologyFilter
      return matchesSearch && matchesStatus && matchesMethodology
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name_asc': return a.name.localeCompare(b.name)
        case 'name_desc': return b.name.localeCompare(a.name)
        case 'created_desc': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'updated_desc': return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'budget_desc': return (b.budget || 0) - (a.budget || 0)
        default: return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })

  // Actions
  const actions = [
    {
      label: 'New Project',
      onClick: () => console.log('Create project'),
      variant: 'primary' as const,
      icon: <Plus className="h-4 w-4" />
    }
  ]

  // Filter configuration
  const filters = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'ACTIVE', label: 'Active', count: activeProjects },
        { value: 'COMPLETED', label: 'Completed', count: completedProjects },
        { value: 'ON_HOLD', label: 'On Hold' },
        { value: 'CANCELLED', label: 'Cancelled' },
      ],
      value: statusFilter
    },
    {
      key: 'methodology',
      label: 'Methodology',
      type: 'select' as const,
      options: [
        { value: 'AGILE', label: 'Agile' },
        { value: 'TRADITIONAL', label: 'Traditional' },
        { value: 'HYBRID', label: 'Hybrid' },
      ],
      value: methodologyFilter
    }
  ]

  const sortOptions = [
    { value: 'updated_desc', label: 'Recently Updated' },
    { value: 'created_desc', label: 'Recently Created' },
    { value: 'name_asc', label: 'Name A-Z' },
    { value: 'name_desc', label: 'Name Z-A' },
    { value: 'budget_desc', label: 'Budget High-Low' },
  ]

  // Table fields for ResultsList
  const fields = [
    {
      key: 'name',
      label: 'Project Name',
      type: 'text' as const,
    },
    {
      key: 'status',
      label: 'Status',
      type: 'status' as const,
    },
    {
      key: 'methodology',
      label: 'Methodology',
      type: 'badge' as const,
      hideOnMobile: true,
    },
    {
      key: 'budget',
      label: 'Budget',
      type: 'currency' as const,
      hideOnMobile: true,
    },
    {
      key: 'updatedAt',
      label: 'Last Updated',
      type: 'date' as const,
      hideOnMobile: true,
    }
  ]

  const resultActions = [
    {
      key: 'edit',
      label: 'Edit Project',
      icon: <Edit className="h-4 w-4" />,
      variant: 'default' as const,
      onClick: (project: any) => console.log('Edit project', project.id),
    },
    {
      key: 'archive',
      label: 'Archive Project',
      icon: <Archive className="h-4 w-4" />,
      variant: 'default' as const,
      onClick: (project: any) => console.log('Archive project', project.id),
    },
    {
      key: 'delete',
      label: 'Delete Project',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'danger' as const,
      onClick: (project: any) => console.log('Delete project', project.id),
    },
  ]

  const handleFilterChange = (key: string, value: any) => {
    switch (key) {
      case 'status':
        setStatusFilter(value)
        break
      case 'methodology':
        setMethodologyFilter(value)
        break
    }
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setStatusFilter('')
    setMethodologyFilter('')
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Stats */}
      <StatsHeader
        title="Projects"
        subtitle="Manage and track your organization's projects"
        stats={stats}
        actions={actions}
        onRefresh={() => console.log('Refresh projects')}
      />

      {/* Search and Filters */}
      <SearchFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchPlaceholder="Search projects..."
        filters={filters}
        onFilterChange={handleFilterChange}
        sortOptions={sortOptions}
        sortBy={sortBy}
        setSortBy={setSortBy}
        totalCount={projects.length}
        filteredCount={filteredProjects.length}
        onClearFilters={handleClearFilters}
        primaryAction={{
          label: 'New Project',
          onClick: () => console.log('Create project'),
        }}
      />

      {/* Results List */}
      <ResultsList
        items={filteredProjects}
        fields={fields}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        actions={resultActions}
        onItemClick={(project) => console.log('View project', project.id)}
        clickable
        emptyTitle="No projects found"
        emptyDescription="Get started by creating your first project."
        emptyAction={{
          label: 'Create Project',
          onClick: () => console.log('Create project'),
        }}
      />
    </div>
  )
}      
