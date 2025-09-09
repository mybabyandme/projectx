'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FolderKanban, Calendar, DollarSign, Users, CheckSquare, Plus, 
  Eye, Edit, Archive, Trash2, TrendingUp, AlertTriangle, Clock,
  Target, BarChart3, FileText
} from 'lucide-react'
import StatsHeader from '@/components/layout/stats-header'
import SearchFilters from '@/components/layout/search-filters'
import ProjectResultsList from './project-results-list'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Project {
  id: string
  name: string
  description?: string | null
  status: string
  methodology: string
  priority: string
  budget?: number | null
  currency?: string | null
  startDate?: Date | null
  endDate?: Date | null
  createdAt: Date
  updatedAt: Date
  template?: string | null
  tasks: Array<{ 
    id: string
    status: string
    priority: string
    dueDate?: Date | null
  }>
  budgets: Array<{ 
    allocatedAmount: number
    spentAmount: number
    approvedAmount: number
  }>
  phases: Array<{
    id: string
    name: string
    status: string
  }>
  progressReports: Array<{
    id: string
    status: string
    createdAt: Date
  }>
}

interface ProjectsListViewProps {
  projects: Project[]
  organizationSlug: string
  userRole: string
  canCreateProjects: boolean
  canEditProjects: boolean
  canViewFinancials: boolean
}

export default function ProjectsListView({ 
  projects, 
  organizationSlug,
  userRole,
  canCreateProjects,
  canEditProjects,
  canViewFinancials
}: ProjectsListViewProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('updated_desc')
  const [viewMode, setViewMode] = useState<'list' | 'card'>('card')
  const [statusFilter, setStatusFilter] = useState('')
  const [methodologyFilter, setMethodologyFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  // Enhanced stats calculations
  const activeProjects = projects.filter(p => p.status === 'ACTIVE').length
  const completedProjects = projects.filter(p => p.status === 'COMPLETED').length
  const onHoldProjects = projects.filter(p => p.status === 'ON_HOLD').length
  const planningProjects = projects.filter(p => p.status === 'PLANNING').length
  
  const totalTasks = projects.reduce((sum, p) => sum + p.tasks.length, 0)
  const completedTasks = projects.reduce((sum, p) => sum + p.tasks.filter(t => t.status === 'DONE').length, 0)
  const overdueTasks = projects.reduce((sum, p) => sum + p.tasks.filter(t => 
    t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE'
  ).length, 0)
  
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0)
  const spentBudget = projects.reduce((sum, p) => sum + p.budgets.reduce((bSum, b) => bSum + b.spentAmount, 0), 0)
  const approvedBudget = projects.reduce((sum, p) => sum + p.budgets.reduce((bSum, b) => bSum + b.approvedAmount, 0), 0)
  
  const criticalProjects = projects.filter(p => p.priority === 'CRITICAL').length
  const recentReports = projects.reduce((sum, p) => sum + p.progressReports.length, 0)

  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  const budgetUtilization = totalBudget > 0 ? Math.round((spentBudget / totalBudget) * 100) : 0

  // Enhanced stats for header
  const stats = [
    {
      icon: <FolderKanban className="h-5 w-5" />,
      value: projects.length,
      label: 'Total Projects',
      trend: { value: activeProjects, label: 'active', direction: 'neutral' as const }
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      value: `${progressPercentage}%`,
      label: 'Overall Progress',
      trend: { value: completedTasks, label: `of ${totalTasks} tasks`, direction: 'up' as const }
    },
    {
      icon: <DollarSign className="h-5 w-5" />,
      value: canViewFinancials ? formatCurrency(totalBudget, 'USD') : 'Restricted',
      label: 'Total Budget',
      trend: canViewFinancials ? { 
        value: budgetUtilization, 
        label: '% utilized', 
        direction: budgetUtilization > 80 ? 'down' as const : 'neutral' as const 
      } : undefined
    },
    {
      icon: <AlertTriangle className="h-5 w-5" />,
      value: criticalProjects + overdueTasks,
      label: 'Attention Required',
      trend: { value: criticalProjects, label: 'critical projects', direction: criticalProjects > 0 ? 'down' as const : 'up' as const }
    },
    {
      icon: <Clock className="h-5 w-5" />,
      value: onHoldProjects,
      label: 'On Hold',
    },
    {
      icon: <FileText className="h-5 w-5" />,
      value: recentReports,
      label: 'Recent Reports',
    },
  ]

  // Enhanced filter and sort
  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           project.description?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = !statusFilter || project.status === statusFilter
      const matchesMethodology = !methodologyFilter || project.methodology === methodologyFilter
      const matchesPriority = !priorityFilter || project.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesMethodology && matchesPriority
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name_asc': return a.name.localeCompare(b.name)
        case 'name_desc': return b.name.localeCompare(a.name)
        case 'created_desc': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'updated_desc': return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'budget_desc': return (b.budget || 0) - (a.budget || 0)
        case 'priority_desc': 
          const priorityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 }
          return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
        case 'progress_desc':
          const aProgress = a.tasks.length > 0 ? (a.tasks.filter(t => t.status === 'DONE').length / a.tasks.length) * 100 : 0
          const bProgress = b.tasks.length > 0 ? (b.tasks.filter(t => t.status === 'DONE').length / b.tasks.length) * 100 : 0
          return bProgress - aProgress
        default: return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      }
    })

  // Enhanced actions
  const actions = [
    ...(canCreateProjects ? [{
      label: 'New Project',
      onClick: () => router.push(`/${organizationSlug}/projects/new`),
      variant: 'primary' as const,
      icon: <Plus className="h-4 w-4" />
    }] : [])
  ]

  // Enhanced filters
  const filters = [
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'ACTIVE', label: 'Active', count: activeProjects },
        { value: 'PLANNING', label: 'Planning', count: planningProjects },
        { value: 'ON_HOLD', label: 'On Hold', count: onHoldProjects },
        { value: 'COMPLETED', label: 'Completed', count: completedProjects },
        { value: 'CANCELLED', label: 'Cancelled' },
      ],
      value: statusFilter
    },
    {
      key: 'priority',
      label: 'Priority',
      type: 'select' as const,
      options: [
        { value: 'CRITICAL', label: 'Critical', count: criticalProjects },
        { value: 'HIGH', label: 'High' },
        { value: 'MEDIUM', label: 'Medium' },
        { value: 'LOW', label: 'Low' },
      ],
      value: priorityFilter
    },
    {
      key: 'methodology',
      label: 'Methodology',
      type: 'select' as const,
      options: [
        { value: 'AGILE', label: 'Agile' },
        { value: 'WATERFALL', label: 'Waterfall' },
        { value: 'HYBRID', label: 'Hybrid' },
        { value: 'KANBAN', label: 'Kanban' },
        { value: 'SCRUM', label: 'Scrum' },
      ],
      value: methodologyFilter
    }
  ]

  const sortOptions = [
    { value: 'updated_desc', label: 'Recently Updated' },
    { value: 'created_desc', label: 'Recently Created' },
    { value: 'priority_desc', label: 'Priority High-Low' },
    { value: 'progress_desc', label: 'Progress High-Low' },
    { value: 'name_asc', label: 'Name A-Z' },
    { value: 'name_desc', label: 'Name Z-A' },
    ...(canViewFinancials ? [{ value: 'budget_desc', label: 'Budget High-Low' }] : []),
  ]

  // Enhanced table fields
  const fields = [
    {
      key: 'name',
      label: 'Project Name',
      type: 'text' as const,
      render: (project: Project) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
              {project.name.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 truncate">{project.name}</p>
            {project.description && (
              <p className="text-sm text-gray-500 truncate">{project.description}</p>
            )}
            <div className="flex items-center space-x-2 mt-1">
              {project.template && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                  {project.template.replace('_', ' ')}
                </span>
              )}
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                project.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                project.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                project.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {project.priority}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'progress',
      label: 'Progress',
      type: 'custom' as const,
      render: (project: Project) => {
        const projectProgress = project.tasks.length > 0 
          ? Math.round((project.tasks.filter(t => t.status === 'DONE').length / project.tasks.length) * 100)
          : 0
        const completedTasksCount = project.tasks.filter(t => t.status === 'DONE').length
        
        return (
          <div className="w-full">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">{projectProgress}%</span>
              <span className="text-xs text-gray-500">{completedTasksCount}/{project.tasks.length}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  projectProgress >= 80 ? 'bg-green-500' :
                  projectProgress >= 60 ? 'bg-blue-500' :
                  projectProgress >= 40 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${projectProgress}%` }}
              />
            </div>
          </div>
        )
      },
      hideOnMobile: false,
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
    ...(canViewFinancials ? [{
      key: 'budget',
      label: 'Budget',
      type: 'custom' as const,
      render: (project: Project) => {
        const projectSpent = project.budgets.reduce((sum, b) => sum + b.spentAmount, 0)
        const projectBudget = project.budget || 0
        const utilization = projectBudget > 0 ? Math.round((projectSpent / projectBudget) * 100) : 0
        
        return (
          <div className="text-right">
            <p className="font-medium text-gray-900">
              {formatCurrency(projectBudget, project.currency)}
            </p>
            <p className={`text-xs ${
              utilization > 90 ? 'text-red-600' :
              utilization > 75 ? 'text-orange-600' :
              'text-gray-500'
            }`}>
              {utilization}% used
            </p>
          </div>
        )
      },
      hideOnMobile: true,
    }] : []),
    {
      key: 'phases',
      label: 'Phases',
      type: 'custom' as const,
      render: (project: Project) => (
        <div className="flex items-center space-x-1">
          <BarChart3 className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600">{project.phases.length}</span>
        </div>
      ),
      hideOnMobile: true,
    },
    {
      key: 'updatedAt',
      label: 'Last Updated',
      type: 'date' as const,
      hideOnMobile: true,
    }
  ]

  // Enhanced result actions
  const resultActions = [
    {
      key: 'view',
      label: 'View Project',
      icon: <Eye className="h-4 w-4" />,
      variant: 'default' as const,
      onClick: (project: Project) => router.push(`/${organizationSlug}/projects/${project.id}`),
    },
    ...(canEditProjects ? [{
      key: 'edit',
      label: 'Edit Project',
      icon: <Edit className="h-4 w-4" />,
      variant: 'default' as const,
      onClick: (project: Project) => router.push(`/${organizationSlug}/projects/${project.id}/edit`),
    }] : []),
    ...(userRole === 'ORG_ADMIN' || userRole === 'SUPER_ADMIN' ? [{
      key: 'archive',
      label: 'Archive Project',
      icon: <Archive className="h-4 w-4" />,
      variant: 'default' as const,
      onClick: (project: Project) => {
        // TODO: Implement archive functionality
        console.log('Archive project', project.id)
      },
    }, {
      key: 'delete',
      label: 'Delete Project',
      icon: <Trash2 className="h-4 w-4" />,
      variant: 'danger' as const,
      onClick: (project: Project) => {
        // TODO: Implement delete functionality with confirmation
        console.log('Delete project', project.id)
      },
    }] : []),
  ]

  const handleFilterChange = (key: string, value: any) => {
    switch (key) {
      case 'status':
        setStatusFilter(value)
        break
      case 'methodology':
        setMethodologyFilter(value)
        break
      case 'priority':
        setPriorityFilter(value)
        break
    }
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setStatusFilter('')
    setMethodologyFilter('')
    setPriorityFilter('')
  }

  const handleProjectClick = (project: Project) => {
    router.push(`/${organizationSlug}/projects/${project.id}`)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Enhanced Header with Stats */}
      <StatsHeader
        title="Projects"
        subtitle={`Manage and track your organization's projects • ${projects.length} total`}
        stats={stats}
        actions={actions}
        onRefresh={() => window.location.reload()}
      />

      {/* Enhanced Search and Filters */}
      <SearchFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchPlaceholder="Search projects by name or description..."
        filters={filters}
        onFilterChange={handleFilterChange}
        sortOptions={sortOptions}
        sortBy={sortBy}
        setSortBy={setSortBy}
        totalCount={projects.length}
        filteredCount={filteredProjects.length}
        onClearFilters={handleClearFilters}
        primaryAction={canCreateProjects ? {
          label: 'New Project',
          onClick: () => router.push(`/${organizationSlug}/projects/new`),
        } : undefined}
      />

      {/* Enhanced Results List */}
      <ProjectResultsList
        projects={filteredProjects}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onProjectClick={handleProjectClick}
        canViewFinancials={canViewFinancials}
        emptyTitle="No projects found"
        emptyDescription={
          projects.length === 0 
            ? "Get started by creating your first project to organize and track your work."
            : "Try adjusting your search query or filters to find the projects you're looking for."
        }
        emptyAction={canCreateProjects ? {
          label: 'Create Project',
          onClick: () => router.push(`/${organizationSlug}/projects/new`),
        } : undefined}
      />
    </div>
  )
}
