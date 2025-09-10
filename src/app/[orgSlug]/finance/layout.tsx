import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound, redirect } from 'next/navigation'

export default async function FinanceLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { orgSlug: string }
}) {
  const session = await auth()
  
  if (!session?.user?.id) {
    notFound()
  }

  // Get organization membership and verify financial access
  const membership = await db.organizationMember.findFirst({
    where: {
      userId: session.user.id,
      organization: { slug: params.orgSlug },
    },
    include: {
      organization: true,
    },
  })

  if (!membership) {
    notFound()
  }

  // Check if user has financial access
  const hasFinancialAccess = ['ORG_ADMIN', 'SUPER_ADMIN', 'PROJECT_MANAGER', 'DONOR_SPONSOR'].includes(membership.role)
  
  if (!hasFinancialAccess) {
    redirect(`/${params.orgSlug}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
