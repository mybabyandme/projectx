'use client'

import { useState } from 'react'
import { 
  ArrowLeft, Edit, MoreVertical, Calendar, DollarSign, Users, 
  Target, AlertTriangle, TrendingUp, Clock, CheckCircle, 
  BarChart3, FileText, Settings, BarChart2, Activity, 
  Globe, MapPin, Building
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import ProjectHeader from './project-header'
import ProjectNavigation from './project-navigation'
import ProjectOverview from './project-overview'
import ProjectTasks from './project-tasks'
import ProjectTeam from './project-team'
import ProjectFinancials from './project-financials'
import ProjectReports from './project-reports'
import ProjectSettings from './project-settings'
import ProjectMonitoring from './project-monitoring'
import ProjectPQGDashboard from './project-pqg-dashboard'
import RiskDashboard from '../risk-dashboard'
import GanttView from '../gantt-view'
import ProgressReporting from '../progress-reporting'
import SprintManagement from '../sprint-management'
import TimelineView from '../timeline-view'

interface ProjectViewProps {
  project: any
  organizationSlug: string
  userRole: string
  userId: string
  permissions: {
    canEdit: boolean
    canViewFinancials: boolean
    canCreateReports: boolean
    canApproveReports: boolean
    canManageTasks: boolean
  }
}

export default function ProjectView({
  project,
  organizationSlug,
  userRole,
  userId,
  permissions
}: ProjectViewProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Determine if this is a government project
  const isGovernmentProject = project.pqgData && 
    (project.methodology === 'WATERFALL' || project.pqgData.priority)

  // Build dynamic tabs based on project type and permissions
  const getProjectTabs = () => {
    const baseTabs = [
      {
        id: 'overview',
        label: 'Overview',
        icon: BarChart3,
        description: 'Project summary and key metrics'
      },
      {
        id: 'tasks',
        label: 'Tasks',
        icon: CheckCircle,
        description: 'Task management and progress'
      },
      {
        id: 'timeline',
        label: 'Timeline',
        icon: Calendar,
        description: 'Project timeline and milestones'
      },
      {
        id: 'team',
        label: 'Team',
        icon: Users,
        description: 'Team members and assignments'
      },
    ]

    // Add methodology-specific tabs
    if (project.methodology === 'AGILE' || project.methodology === 'SCRUM') {
      baseTabs.push({
        id: 'sprints',
        label: 'Sprints',
        icon: TrendingUp,
        description: 'Sprint planning and velocity'
      })
    }

    if (project.methodology === 'WATERFALL' || project.methodology === 'HYBRID') {
      baseTabs.push({
        id: 'gantt',
        label: 'Gantt Chart',
        icon: BarChart2,
        description: 'Project schedule and dependencies'
      })
    }

    // Add government-specific tab
    if (isGovernmentProject) {
      baseTabs.push({
        id: 'pqg',
        label: 'PQG Dashboard',
        icon: Building,
        description: 'Government priorities and compliance'
      })
    }

    // Add monitoring tab for all projects
    baseTabs.push({
      id: 'monitoring',
      label: 'Monitoring',
      icon: Activity,
      description: 'Performance monitoring and evaluation'
    })

    // Add risk management
    baseTabs.push({
      id: 'risks',
      label: 'Risks',
      icon: AlertTriangle,
      description: 'Risk assessment and mitigation'
    })

    // Add financial tab if user has permissions
    if (permissions.canViewFinancials) {
      baseTabs.push({
        id: 'financials',
        label: 'Financials',
        icon: DollarSign,
        description: 'Budget and expense tracking'
      })
    }

    // Add reports tab
    baseTabs.push({
      id: 'reports',
      label: 'Reports',
      icon: FileText,
      description: 'Progress reports and analytics'
    })

    // Add settings tab if user can edit
    if (permissions.canEdit) {
      baseTabs.push({
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        description: 'Project configuration'
      })
    }

    return baseTabs
  }

  const availableTabs = getProjectTabs()

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setIsMobileMenuOpen(false)
  }

  const handleBack = () => {
    router.push(`/${organizationSlug}/projects`)
  }

  const handleEdit = () => {
    router.push(`/${organizationSlug}/projects/${project.id}/edit`)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <ProjectOverview
            project={project}
            organizationSlug={organizationSlug}
            userRole={userRole}
            permissions={permissions}
          />
        )

      case 'tasks':
        return (
          <ProjectTasks
            project={project}
            organizationSlug={organizationSlug}
            userRole={userRole}
            canEdit={permissions.canManageTasks}
            userId={userId}
          />
        )

      case 'timeline':
        return (
          <TimelineView
            project={project}
            organizationSlug={organizationSlug}
            userRole={userRole}
            permissions={permissions}
          />
        )

      case 'gantt':
        return (
          <div className="p-6">
            <GanttView
              project={project}
              tasks={project.tasks || []}
              onTaskClick={(task) => console.log('Task clicked:', task)}
              onTaskUpdate={(taskId, updates) => console.log('Task update:', taskId, updates)}
            />
          </div>
        )

      case 'sprints':
        return (
          <SprintManagement
            project={project}
            organizationSlug={organizationSlug}
            userRole={userRole}
            canEdit={permissions.canEdit}
            userId={userId}
          />
        )

      case 'team':
        return (
          <ProjectTeam
            project={project}
            organizationSlug={organizationSlug}
            userRole={userRole}
            canEdit={permissions.canEdit}
            userId={userId}
          />
        )

      case 'pqg':
        return isGovernmentProject ? (
          <ProjectPQGDashboard
            project={project}
            organizationSlug={organizationSlug}
            userRole={userRole}
            canEdit={permissions.canEdit}
          />
        ) : null

      case 'monitoring':
        return (
          <ProjectMonitoring
            project={project}
            organizationSlug={organizationSlug}
            userRole={userRole}
            permissions={permissions}
          />
        )

      case 'risks':
        return (
          <div className="p-6">
            <RiskDashboard
              project={project}
              canEdit={permissions.canEdit}
            />
          </div>
        )

      case 'financials':
        return permissions.canViewFinancials ? (
          <ProjectFinancials
            project={project}
            organizationSlug={organizationSlug}
            userRole={userRole}
            canEdit={permissions.canEdit}
            userId={userId}
          />
        ) : null

      case 'reports':
        return (
          <ProjectReports
            project={project}
            organizationSlug={organizationSlug}
            userRole={userRole}
            permissions={permissions}
            userId={userId}
          />
        )

      case 'settings':
        return permissions.canEdit ? (
          <ProjectSettings
            project={project}
            organizationSlug={organizationSlug}
            userRole={userRole}
            userId={userId}
          />
        ) : null

      default:
        return (
          <div className="p-6">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Content Not Available</h3>
              <p className="text-gray-600">
                The requested content is not available or you don't have permission to view it.
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Project Header */}
      <ProjectHeader
        project={project}
        organizationSlug={organizationSlug}
        userRole={userRole}
        permissions={permissions}
        onBack={handleBack}
        onEdit={permissions.canEdit ? handleEdit : undefined}
        isGovernmentProject={isGovernmentProject}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Side Navigation - Desktop */}
          <div className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="sticky top-6">
              <ProjectNavigation
                tabs={availableTabs}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                isMobile={false}
                project={project}
                userRole={userRole}
              />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden">
            <ProjectNavigation
              tabs={availableTabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              isMobile={true}
              isOpen={isMobileMenuOpen}
              onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              project={project}
              userRole={userRole}
            />
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[600px]">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
