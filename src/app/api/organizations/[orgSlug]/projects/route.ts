import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { projectWizardSchema } from '@/lib/project-wizard-schemas'
import { nanoid } from 'nanoid'

// Create new project
export async function POST(
  request: NextRequest,
  { params }: { params: { orgSlug: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user has permission to create projects
    const membership = await db.organizationMember.findFirst({
      where: {
        userId: session.user.id,
        organization: { slug: params.orgSlug },
        role: { in: ['ORG_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER'] }
      },
      include: { organization: true }
    })

    if (!membership) {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = projectWizardSchema.parse(body)

    // Create project with all wizard data
    const project = await db.project.create({
      data: {
        id: nanoid(),
        organizationId: membership.organizationId,
        name: validatedData.basics.name,
        description: validatedData.basics.description,
        methodology: validatedData.basics.methodology,
        status: 'PLANNING',
        priority: validatedData.basics.priority,
        budget: validatedData.basics.estimatedBudget,
        currency: validatedData.basics.currency,
        startDate: new Date(validatedData.basics.startDate),
        endDate: new Date(validatedData.basics.endDate),
        template: validatedData.basics.template,
        
        // Store additional data as JSON
        metadata: {
          charter: validatedData.charter,
          stakeholders: validatedData.stakeholders,
          risks: validatedData.risks,
          tags: validatedData.basics.tags || [],
          createdBy: session.user.id,
          wizardVersion: '1.0'
        }
      }
    })

    // Create project phases based on template
    const phases = getTemplatePhases(validatedData.basics.template)
    if (phases.length > 0) {
      await db.projectPhase.createMany({
        data: phases.map((phase, index) => ({
          id: nanoid(),
          projectId: project.id,
          name: phase,
          description: `${phase} phase`,
          order: index,
          status: 'PLANNED',
        }))
      })
    }

    // Create tasks for deliverables
    if (validatedData.charter.deliverables.length > 0) {
      await db.task.createMany({
        data: validatedData.charter.deliverables.map((deliverable, index) => ({
          id: nanoid(),
          projectId: project.id,
          creatorId: session.user.id,
          title: deliverable.name,
          description: deliverable.description,
          status: 'TODO',
          priority: 'MEDIUM',
          estimatedHours: 0,
          actualHours: 0,
          dueDate: deliverable.dueDate ? new Date(deliverable.dueDate) : null,
          metadata: {
            isDeliverable: true,
            acceptanceCriteria: deliverable.criteria,
            source: 'wizard'
          }
        }))
      })
    }

    // Create budget entries
    await db.projectBudget.create({
      data: {
        id: nanoid(),
        projectId: project.id,
        category: 'TOTAL',
        allocatedAmount: validatedData.basics.estimatedBudget,
        spentAmount: 0,
        approvedAmount: 0,
      }
    })

    return NextResponse.json({
      message: 'Project created successfully',
      project: {
        id: project.id,
        name: project.name,
        slug: project.id // Using ID as slug for now
      }
    })

  } catch (error) {
    console.error('Create project error:', error)
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { message: 'Invalid project data', errors: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to get template phases
function getTemplatePhases(template: string): string[] {
  const phaseTemplates = {
    GOVERNMENT: ['Planning', 'Requirements', 'Design', 'Implementation', 'Testing', 'Deployment', 'Closure'],
    NGO: ['Planning', 'Community Engagement', 'Implementation', 'Monitoring', 'Evaluation'],
    CORPORATE: ['Discovery', 'Planning', 'Development', 'Testing', 'Release', 'Support'],
    AGILE: ['Sprint 0', 'Sprint Planning', 'Development Sprints', 'Release', 'Retrospective'],
    WATERFALL: ['Requirements', 'Design', 'Implementation', 'Testing', 'Deployment', 'Maintenance'],
    CUSTOM: ['Planning', 'Execution', 'Monitoring', 'Closure'],
  }

  return phaseTemplates[template as keyof typeof phaseTemplates] || phaseTemplates.CUSTOM
}