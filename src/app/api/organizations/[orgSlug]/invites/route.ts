import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['ORG_ADMIN', 'PROJECT_MANAGER', 'MONITOR', 'DONOR_SPONSOR', 'TEAM_MEMBER', 'VIEWER']),
  message: z.string().optional()
})

// Send invitation
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

    // Verify user has admin access to this organization
    const adminMembership = await db.organizationMember.findFirst({
      where: {
        userId: session.user.id,
        organization: { slug: params.orgSlug },
        role: { in: ['ORG_ADMIN', 'SUPER_ADMIN'] }
      },
      include: { organization: true }
    })

    if (!adminMembership) {
      return NextResponse.json(
        { message: 'Access denied' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { email, role, message } = inviteSchema.parse(body)

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      // Check if they're already a member of this organization
      const existingMembership = await db.organizationMember.findFirst({
        where: {
          userId: existingUser.id,
          organizationId: adminMembership.organizationId
        }
      })

      if (existingMembership) {
        return NextResponse.json(
          { message: 'User is already a member of this organization' },
          { status: 400 }
        )
      }

      // Add existing user to organization
      const newMembership = await db.organizationMember.create({
        data: {
          organizationId: adminMembership.organizationId,
          userId: existingUser.id,
          role
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          }
        }
      })

      // TODO: Send email notification to existing user
      console.log(`Added existing user ${email} to organization ${params.orgSlug} as ${role}`)

      return NextResponse.json({
        message: 'User added to organization successfully',
        member: newMembership
      })
    }

    // For new users, we'll create a temporary invitation token
    // In a real application, you would:
    // 1. Create an invitation record with a unique token
    // 2. Send an email with a link to accept the invitation
    // 3. When they click the link, create their account and add them to the org

    // For now, we'll simulate this by creating the user directly
    // This is a simplified implementation
    const tempPassword = nanoid(12) // Generate temporary password
    const hashedPassword = await bcrypt.hash(tempPassword, 12)

    const newUser = await db.user.create({
      data: {
        email,
        name: email.split('@')[0], // Use email prefix as temporary name
        password: hashedPassword
      }
    })

    // Add new user to organization
    const newMembership = await db.organizationMember.create({
      data: {
        organizationId: adminMembership.organizationId,
        userId: newUser.id,
        role
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    })

    // TODO: Send invitation email with login instructions
    console.log(`Created new user ${email} and added to organization ${params.orgSlug} as ${role}`)
    console.log(`Temporary password: ${tempPassword}`) // In production, this would be sent via email

    return NextResponse.json({
      message: 'Invitation sent successfully',
      member: newMembership,
      // Remove this in production - passwords should never be returned
      tempPassword: process.env.NODE_ENV === 'development' ? tempPassword : undefined
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Invite member error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}