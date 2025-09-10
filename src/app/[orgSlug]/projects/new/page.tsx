import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import ProjectWizardView from '@/components/projects/wizard/project-wizard-view'

export default async function NewProjectPage({
  params,
}: {
  params: { orgSlug: string }
}) {
  const session = await auth()
  
  if (!session?.user?.id) {
    notFound()
  }

  // Get organization and user membership with enhanced data
  const membership = await db.organizationMember.findFirst({
    where: {
      userId: session.user.id,
      organization: {
        slug: params.orgSlug,
      },
    },
    include: {
      organization: {
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          projects: {
            select: {
              id: true,
              name: true,
              methodology: true,
              status: true,
              budgets: {
                select: {
                  category: true,
                  allocatedAmount: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 10, // Recent projects for reference
          },
        },
      },
    },
  })

  if (!membership) {
    notFound()
  }

  // Check if user has permission to create projects
  const canCreateProjects = ['ORG_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER'].includes(membership.role)

  if (!canCreateProjects) {
    notFound()
  }

  // Prepare organization data for the wizard
  const organizationData = {
    id: membership.organization.id,
    name: membership.organization.name,
    slug: membership.organization.slug,
    settings: membership.organization.settings,
    
    // Team members for assignment and collaboration
    members: membership.organization.members.map(member => ({
      id: member.userId,
      name: member.user.name,
      email: member.user.email,
      role: member.role,
      image: member.user.image,
    })),
    
    // Recent projects for templates and reference
    recentProjects: membership.organization.projects.map(project => ({
      id: project.id,
      name: project.name,
      methodology: project.methodology,
      status: project.status,
      budgetCategories: project.budgets.map(b => b.category),
      totalBudget: project.budgets.reduce((sum, b) => sum + Number(b.allocatedAmount), 0),
    })),
    
    // Organization statistics for context
    stats: {
      totalProjects: membership.organization.projects.length,
      methodologyDistribution: membership.organization.projects.reduce((acc, p) => {
        acc[p.methodology] = (acc[p.methodology] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      totalBudget: membership.organization.projects.reduce((sum, p) => 
        sum + p.budgets.reduce((budgetSum, b) => budgetSum + Number(b.allocatedAmount), 0), 0
      ),
    },
  }

  // User capabilities and preferences
  const userCapabilities = {
    role: membership.role,
    canCreateBudgets: ['ORG_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER'].includes(membership.role),
    canSetupTeams: ['ORG_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER'].includes(membership.role),
    canConfigurePQG: ['ORG_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER'].includes(membership.role),
    preferredMethodologies: getPreferredMethodologies(membership.role),
    suggestedTemplates: getSuggestedTemplates(membership.role, organizationData.stats),
  }

  return (
    <ProjectWizardView 
      organizationSlug={params.orgSlug}
      organizationData={organizationData}
      userCapabilities={userCapabilities}
      userId={session.user.id}
    />
  )
}

// Helper function to get preferred methodologies based on user role
function getPreferredMethodologies(role: string): string[] {
  switch (role) {
    case 'ORG_ADMIN':
    case 'SUPER_ADMIN':
      return ['HYBRID', 'WATERFALL', 'AGILE', 'KANBAN'] // All methodologies
    case 'PROJECT_MANAGER':
      return ['HYBRID', 'AGILE', 'WATERFALL', 'KANBAN']
    case 'TEAM_MEMBER':
      return ['AGILE', 'KANBAN', 'HYBRID']
    case 'MONITOR':
      return ['WATERFALL', 'HYBRID'] // More structured approaches
    case 'DONOR_SPONSOR':
      return ['WATERFALL', 'HYBRID'] // Prefer predictable methodologies
    default:
      return ['AGILE', 'KANBAN']
  }
}

// Helper function to suggest project templates based on role and organization stats
function getSuggestedTemplates(role: string, stats: any): Array<{
  name: string
  methodology: string
  description: string
  features: string[]
}> {
  const templates = []

  // Government/NGO template
  if (['ORG_ADMIN', 'PROJECT_MANAGER', 'MONITOR'].includes(role)) {
    templates.push({
      name: 'Government Project (PQG)',
      methodology: 'WATERFALL',
      description: 'Structured project aligned with Mozambique PQG priorities',
      features: ['PQG Priority Alignment', 'MBR Evaluation', 'Geographic Tracking', 'Compliance Reporting']
    })
  }

  // Development project template
  templates.push({
    name: 'Development Project',
    methodology: 'HYBRID',
    description: 'Balanced approach for development initiatives',
    features: ['Phase-based Planning', 'Iterative Delivery', 'Stakeholder Engagement', 'Impact Measurement']
  })

  // Agile software template
  if (['PROJECT_MANAGER', 'TEAM_MEMBER'].includes(role)) {
    templates.push({
      name: 'Software Development',
      methodology: 'AGILE',
      description: 'Agile approach for software and digital projects',
      features: ['Sprint Planning', 'User Stories', 'Continuous Delivery', 'Team Collaboration']
    })
  }

  // Infrastructure template
  if (['ORG_ADMIN', 'PROJECT_MANAGER'].includes(role)) {
    templates.push({
      name: 'Infrastructure Project',
      methodology: 'WATERFALL',
      description: 'Traditional approach for construction and infrastructure',
      features: ['Detailed Planning', 'Sequential Phases', 'Resource Management', 'Quality Control']
    })
  }

  // Quick start template
  templates.push({
    name: 'Quick Start',
    methodology: 'KANBAN',
    description: 'Simple task-based project for immediate start',
    features: ['Task Boards', 'Simple Workflow', 'Team Collaboration', 'Progress Tracking']
  })

  return templates
}
