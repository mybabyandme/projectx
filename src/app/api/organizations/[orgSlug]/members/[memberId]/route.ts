import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updateMemberSchema = z.object({
  role: z.enum(['ORG_ADMIN', 'PROJECT_MANAGER', 'MONITOR', 'DONOR_SPONSOR', 'TEAM_MEMBER', 'VIEWER'])
})

// Update member role
export async function PATCH(
  request: NextRequest,
  { params }: { params: { orgSlug: string; memberId: string } }
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
    const { role } = updateMemberSchema.parse(body)

    // Find the member to update
    const memberToUpdate = await db.organizationMember.findFirst({
      where: {
        id: params.memberId,
        organizationId: adminMembership.organizationId
      },
      include: { user: true }
    })

    if (!memberToUpdate) {
      return NextResponse.json(
        { message: 'Member not found' },
        { status: 404 }
      )
    }

    // Check if this would remove the last admin
    if (memberToUpdate.role === 'ORG_ADMIN' && role !== 'ORG_ADMIN') {
      const adminCount = await db.organizationMember.count({
        where: {
          organizationId: adminMembership.organizationId,
          role: 'ORG_ADMIN'
        }
      })

      if (adminCount <= 1) {
        return NextResponse.json(
          { message: 'Cannot remove the last administrator' },
          { status: 400 }
        )
      }
    }

    // Update the member's role
    const updatedMember = await db.organizationMember.update({
      where: { id: params.memberId },
      data: { role },
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

    return NextResponse.json({
      message: 'Member role updated successfully',
      member: updatedMember
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid role provided', errors: error.errors },
        { status: 400 }
      )
    }

    console.error('Update member error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Remove member from organization
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orgSlug: string; memberId: string } }
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

    // Find the member to remove
    const memberToRemove = await db.organizationMember.findFirst({
      where: {
        id: params.memberId,
        organizationId: adminMembership.organizationId
      },
      include: { user: true }
    })

    if (!memberToRemove) {
      return NextResponse.json(
        { message: 'Member not found' },
        { status: 404 }
      )
    }

    // Check if this would remove the last admin
    if (memberToRemove.role === 'ORG_ADMIN') {
      const adminCount = await db.organizationMember.count({
        where: {
          organizationId: adminMembership.organizationId,
          role: 'ORG_ADMIN'
        }
      })

      if (adminCount <= 1) {
        return NextResponse.json(
          { message: 'Cannot remove the last administrator' },
          { status: 400 }
        )
      }
    }

    // Remove the member
    await db.organizationMember.delete({
      where: { id: params.memberId }
    })

    return NextResponse.json({
      message: 'Member removed successfully'
    })

  } catch (error) {
    console.error('Remove member error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}