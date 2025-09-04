import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from './db'
import type { NextAuthConfig } from 'next-auth'

const config = {
  adapter: PrismaAdapter(db),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) {
          return null
        }        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string
        
        // Get user's organization memberships
        const memberships = await db.organizationMember.findMany({
          where: { userId: token.id as string },
          include: { organization: true },
        })
        
        session.user.memberships = memberships
      }
      return session
    },  },
} satisfies NextAuthConfig

export const { handlers, auth, signIn, signOut } = NextAuth(config)

// Session utilities
export async function getCurrentUser() {
  const session = await auth()
  return session?.user
}

export async function getCurrentUserWithMemberships() {
  const session = await auth()
  if (!session?.user?.id) return null

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    include: {
      memberships: {
        include: {
          organization: true,
        },
      },
    },
  })

  return user
}

export async function getUserOrganizationRole(userId: string, organizationId: string) {
  const membership = await db.organizationMember.findFirst({
    where: {
      userId,
      organizationId,
    },
  })

  return membership?.role
}

// Permission helpers
export const ROLE_PERMISSIONS = {
  SUPER_ADMIN: ['*'],
  ORG_ADMIN: ['org:*', 'project:*', 'user:*'],
  PROJECT_MANAGER: ['project:read', 'project:write', 'task:*', 'report:write'],
  MONITOR: ['project:read', 'task:read', 'report:read', 'report:write'],
  DONOR_SPONSOR: ['project:read', 'budget:*', 'report:read'],
  TEAM_MEMBER: ['project:read', 'task:read', 'task:write', 'report:read'],
  VIEWER: ['project:read', 'task:read', 'report:read'],
} as const

export function hasPermission(userRole: string, requiredPermission: string): boolean {
  const permissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS]
  if (!permissions) return false
  
  return permissions.includes('*') || permissions.some(p => 
    p === requiredPermission || 
    (p.endsWith(':*') && requiredPermission.startsWith(p.slice(0, -1)))
  )
}