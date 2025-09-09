'use client'

import { useState } from 'react'
import { 
  ArrowLeft, Edit, MoreVertical, Calendar, DollarSign, Users, 
  Target, AlertTriangle, TrendingUp, Clock, CheckCircle, 
  BarChart3, FileText, Settings, Gantt
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
import RiskDashboard from '../risk-dashboard'
import GanttView from '../gantt-view'
import ProgressReporting from '../progress-reporting'

interface ProjectViewProps {
  project: any
  organizationSlug: string
  userRole: string
  canEdit: boolean
  canViewFinancials: boolean
  userId: string
}

const PROJECT_TABS = [
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
    id: 'gantt',
    label: 'Timeline',
    icon: Calendar,
    description: 'Gantt chart and project timeline'
  },
  {
    id: 'team',
    label: 'Team',
    icon: Users,
    description: 'Team members and assignments'
  },
  {
    id: 'risks',
    label: 'Risks',
    icon: AlertTriangle,
    description: 'Risk assessment and mitigation'
  },
  {
    id: 'financials',
    label: 'Financials',
    icon: DollarSign,
    description: 'Budget and expense tracking',
    requiresPermission: true
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: FileText,
    description: 'Progress reports and analytics'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    description: 'Project configuration',
    requiresEdit: true
  },
]

export default function ProjectView({
  project,
  organizationSlug,
  userRole,
  canEdit,
  canViewFinancials,
  userId
}: ProjectViewProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Calculate project metrics
  const totalTasks = project.tasks?.length || 0
  const completedTasks = project.tasks?.filter((task: any) => task.status === 'DONE')?.length || 0
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const totalBudget = project.budgets?.reduce((sum: number, budget: any) => sum + Number(budget.allocatedAmount), 0) || 0
  const spentBudget = project.budgets?.reduce((sum: number, budget: any) => sum + Number(budget.spentAmount), 0) || 0

  // Filter tabs based on permissions
  const availableTabs = PROJECT_TABS.filter(tab => {
    if (tab.requiresPermission && !canViewFinancials) return false
    if (tab.requiresEdit && !canEdit) return false
    return true
  })

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
            progressPercentage={progressPercentage}
            totalTasks={totalTasks}
            completedTasks={completedTasks}
            totalBudget={totalBudget}
            spentBudget={spentBudget}
            canViewFinancials={canViewFinancials}
          />
        )
      case 'tasks':
        return (
          <ProjectTasks
            project={project}
            organizationSlug={organizationSlug}
            canEdit={canEdit}
            userId={userId}
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
      case 'team':
        return (
          <ProjectTeam
            project={project}
            organizationSlug={organizationSlug}
            canEdit={canEdit}
          />
        )
      case 'risks':
        return (
          <div className="p-6">
            <RiskDashboard
              project={project}
              canEdit={canEdit}
            />
          </div>
        )
      case 'financials':
        return canViewFinancials ? (
          <ProjectFinancials
            project={project}
            canEdit={canEdit}
          />
        ) : null
      case 'reports':
        return (
          <div className="p-6">
            <ProgressReporting
              project={project}
              tasks={project.tasks || []}
              progressReports={project.progressReports || []}
              canCreateReports={canEdit}
              onCreateReport={() => console.log('Create report')}
              onViewReport={(report) => console.log('View report:', report)}
            />
          </div>
        )
      case 'settings':
        return canEdit ? (
          <ProjectSettings
            project={project}
            organizationSlug={organizationSlug}
          />
        ) : null
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Project Header */}
      <ProjectHeader
        project={project}
        progressPercentage={progressPercentage}
        onBack={handleBack}
        onEdit={canEdit ? handleEdit : undefined}
        canEdit={canEdit}
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
            />
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
