import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /dashboard, /api/projects)
  const { pathname } = request.nextUrl

  // Skip middleware for public routes
  const publicRoutes = ['/auth/signin', '/auth/signup', '/api/auth', '/']
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check authentication
  const session = await auth()
  if (!session?.user) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Handle organization-scoped routes
  if (pathname.startsWith('/api/') || pathname.startsWith('/dashboard/')) {
    const orgSlug = request.nextUrl.searchParams.get('org') || 
                   request.headers.get('x-organization-slug')

    if (orgSlug) {
      // Verify user has access to this organization
      const membership = await db.organizationMember.findFirst({
        where: {
          userId: session.user.id,
          organization: { slug: orgSlug },
        },
        include: { organization: true },
      })

      if (!membership) {
        return new NextResponse('Forbidden', { status: 403 })
      }

      // Add organization info to request headers
      const requestHeaders = new Headers(request.headers)
      requestHeaders.set('x-organization-id', membership.organizationId)
      requestHeaders.set('x-organization-slug', orgSlug)
      requestHeaders.set('x-user-role', membership.role)

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/projects/:path*',
    '/api/tasks/:path*',
    '/api/organizations/:path*',
    '/api/reports/:path*',
  ],
}