import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create a demo user
  const hashedPassword = await bcrypt.hash('password123', 12)
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@agiletrack.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@agiletrack.com',
      password: hashedPassword,
    },
  })

  console.log('✅ Demo user created:', demoUser.email)

  // Create a demo organization
  const demoOrg = await prisma.organization.upsert({
    where: { slug: 'demo-organization' },
    update: {},
    create: {
      name: 'Demo Organization',
      slug: 'demo-organization',
      settings: {
        theme: 'blue',
        features: ['projects', 'tasks', 'reports'],
      },
    },
  })

  console.log('✅ Demo organization created:', demoOrg.name)
  // Add user to organization as admin
  const membership = await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: demoOrg.id,
        userId: demoUser.id,
      },
    },
    update: {},
    create: {
      organizationId: demoOrg.id,
      userId: demoUser.id,
      role: 'ORG_ADMIN',
      permissions: {
        canManageProjects: true,
        canManageUsers: true,
        canViewReports: true,
      },
    },
  })

  console.log('✅ User added to organization with role:', membership.role)

  // Create a demo project
  const demoProject = await prisma.project.create({
    data: {
      organizationId: demoOrg.id,
      name: 'Sample Project',
      description: 'This is a sample project to demonstrate AgileTrack Pro capabilities.',
      methodology: 'AGILE',
      status: 'ACTIVE',
      budget: 50000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      metadata: {
        priority: 'HIGH',
        tags: ['demo', 'sample'],
      },
      settings: {
        allowPublicView: false,
        emailNotifications: true,
      },
    },
  })

  console.log('✅ Demo project created:', demoProject.name)
  // Create project phases
  const phase1 = await prisma.projectPhase.create({
    data: {
      projectId: demoProject.id,
      name: 'Planning Phase',
      description: 'Initial project planning and requirement gathering.',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      budget: 15000,
      status: 'IN_PROGRESS',
      metadata: {
        deliverables: ['Project Charter', 'Requirements Document'],
      },
    },
  })

  const phase2 = await prisma.projectPhase.create({
    data: {
      projectId: demoProject.id,
      name: 'Development Phase',
      description: 'Core development and implementation work.',
      startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000), // 75 days
      budget: 30000,
      status: 'NOT_STARTED',
      metadata: {
        deliverables: ['MVP', 'Core Features', 'Testing'],
      },
    },
  })

  console.log('✅ Project phases created')

  // Create sample tasks
  const tasks = [
    {
      title: 'Define Project Requirements',
      description: 'Gather and document all project requirements from stakeholders.',
      phaseId: phase1.id,
      status: 'DONE' as const,
      priority: 'HIGH' as const,
      estimatedHours: 16,
      actualHours: 18,
    },
    {
      title: 'Create Project Charter',
      description: 'Draft the official project charter document.',
      phaseId: phase1.id,
      status: 'IN_PROGRESS' as const,
      priority: 'HIGH' as const,
      estimatedHours: 8,
      actualHours: 4,
    },
    {
      title: 'Setup Development Environment',
      description: 'Configure development tools and environments.',
      phaseId: phase2.id,
      status: 'TODO' as const,
      priority: 'MEDIUM' as const,
      estimatedHours: 12,
    },
  ]

  for (const taskData of tasks) {
    await prisma.task.create({
      data: {
        ...taskData,
        projectId: demoProject.id,
        creatorId: demoUser.id,
        assigneeId: demoUser.id,
        wbsCode: `1.${tasks.indexOf(taskData) + 1}`,
        metadata: {
          labels: ['sample'],
          difficulty: 'medium',
        },
      },
    })
  }

  console.log('✅ Sample tasks created')

  // Create project budget
  await prisma.projectBudget.create({
    data: {
      projectId: demoProject.id,
      category: 'Development',
      allocatedAmount: 35000,
      spentAmount: 12000,
      approvedAmount: 35000,
      metadata: {
        description: 'Development team costs',
        currency: 'USD',
      },
    },
  })

  await prisma.projectBudget.create({
    data: {
      projectId: demoProject.id,
      category: 'Infrastructure',
      allocatedAmount: 15000,
      spentAmount: 3000,
      approvedAmount: 15000,
      metadata: {
        description: 'Cloud services and infrastructure',
        currency: 'USD',
      },
    },
  })

  console.log('✅ Project budgets created')

  // Create a sample progress report
  await prisma.progressReport.create({
    data: {
      projectId: demoProject.id,
      reporterId: demoUser.id,
      reportType: 'WEEKLY',
      status: 'APPROVED',
      content: {
        summary: 'Good progress this week on planning activities',
        accomplishments: [
          'Completed stakeholder interviews',
          'Drafted initial requirements document',
          'Set up project workspace',
        ],
        challenges: [
          'Some delays in getting approvals from legal team',
        ],
        nextWeek: [
          'Finalize project charter',
          'Begin development environment setup',
        ],
        metrics: {
          tasksCompleted: 3,
          hoursWorked: 42,
          budgetSpent: 2500,
        },
      },
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      approverId: demoUser.id,
    },
  })

  console.log('✅ Sample progress report created')

  console.log('🎉 Database seeding completed!')
  console.log('')
  console.log('Demo credentials:')
  console.log('Email: demo@agiletrack.com')
  console.log('Password: password123')
  console.log('Organization: demo-organization')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })