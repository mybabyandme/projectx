import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const commentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
})

export async function GET(
  request: NextRequest,
  { params }: { params: { orgSlug: string; taskId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify organization membership
    const membership = await db.organizationMember.findFirst({
      where: {
        userId: session.user.id,
        organization: { slug: params.orgSlug },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Verify task exists in organization
    const task = await db.task.findFirst({
      where: {
        id: params.taskId,
        project: { organizationId: membership.organizationId },
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // Get comments - store in task metadata for now
    // In a production app, you might want a separate Comments table
    const comments = task.metadata?.comments || []

    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Error fetching comments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { orgSlug: string; taskId: string } }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content } = commentSchema.parse(body)

    // Verify organization membership
    const membership = await db.organizationMember.findFirst({
      where: {
        userId: session.user.id,
        organization: { slug: params.orgSlug },
      },
    })

    if (!membership) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Get task and user info
    const task = await db.task.findFirst({
      where: {
        id: params.taskId,
        project: { organizationId: membership.organizationId },
      },
    })

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, image: true },
    })

    // Create new comment
    const newComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      author: user,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Get existing comments
    const existingComments = (task.metadata as any)?.comments || []
    const updatedComments = [...existingComments, newComment]

    // Update task with new comment
    await db.task.update({
      where: { id: params.taskId },
      data: {
        metadata: {
          ...(task.metadata as any || {}),
          comments: updatedComments,
        },
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({ comment: newComment })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    
    console.error('Error creating comment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
