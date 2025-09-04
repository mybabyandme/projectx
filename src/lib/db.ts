import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-unused-vars
  var cachedPrisma: PrismaClient
}

let prisma: PrismaClient

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient({
      log: ['query'],
    })
  }
  prisma = global.cachedPrisma
}

export const db = prisma

// Organization-scoped query helper
export function createOrgScopedPrisma(organizationId: string) {
  return {
    project: {
      findMany: (args?: any) =>
        db.project.findMany({
          ...args,
          where: {
            organizationId,
            ...args?.where,
          },
        }),
      findUnique: (args: any) =>
        db.project.findFirst({
          ...args,
          where: {
            organizationId,
            ...args.where,
          },
        }),      create: (args: any) =>
        db.project.create({
          ...args,
          data: {
            organizationId,
            ...args.data,
          },
        }),
      update: (args: any) =>
        db.project.updateMany({
          ...args,
          where: {
            organizationId,
            ...args.where,
          },
        }),
      delete: (args: any) =>
        db.project.deleteMany({
          ...args,
          where: {
            organizationId,
            ...args.where,
          },
        }),
    },
    
    task: {
      findMany: (args?: any) =>
        db.task.findMany({
          ...args,
          where: {
            project: { organizationId },
            ...args?.where,
          },
          include: {
            project: true,
            ...args?.include,
          },
        }),      findUnique: (args: any) =>
        db.task.findFirst({
          ...args,
          where: {
            project: { organizationId },
            ...args.where,
          },
          include: {
            project: true,
            ...args?.include,
          },
        }),
      create: (args: any) =>
        db.task.create({
          ...args,
          include: {
            project: true,
            ...args?.include,
          },
        }),
    },
    
    organizationMember: {
      findMany: (args?: any) =>
        db.organizationMember.findMany({
          ...args,
          where: {
            organizationId,
            ...args?.where,
          },
        }),
      findUnique: (args: any) =>
        db.organizationMember.findFirst({
          ...args,
          where: {
            organizationId,
            ...args.where,
          },
        }),
    },
  }
}

// Permission checking utilities
export async function hasPermission(
  userId: string,
  organizationId: string,
  requiredRole: string[]
): Promise<boolean> {
  const membership = await db.organizationMember.findFirst({
    where: {
      userId,
      organizationId,
    },
  })

  if (!membership) return false
  return requiredRole.includes(membership.role)
}