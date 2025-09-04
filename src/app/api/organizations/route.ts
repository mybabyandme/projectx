import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(
    /^[a-z0-9-]+$/,
    'Slug can only contain lowercase letters, numbers, and hyphens'
  ),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, slug } = createOrganizationSchema.parse(body)

    // Check if slug already exists
    const existingOrg = await db.organization.findUnique({
      where: { slug },
    })

    if (existingOrg) {
      return NextResponse.json(
        { message: 'Organization with this URL already exists' },
        { status: 400 }
      )
    }

    // Create organization and add user as admin
    const organization = await db.organization.create({
      data: {
        name,
        slug,
        members: {
          create: {
            userId: session.user.id,
            role: 'ORG_ADMIN',
          },
        },
      },
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
      },
    })

    return NextResponse.json(
      { 
        message: 'Organization created successfully', 
        organization 
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Organization creation error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}