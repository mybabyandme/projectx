import { notFound, redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import OrganizationLayout from '@/components/layout/organization-layout'

export default async function OrganizationLayoutWrapper({
  children,
  params,
}: {
  children: React.ReactNode
  params: { orgSlug: string }
}) {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  // Verify organization exists and user has access
  const membership = await db.organizationMember.findFirst({
    where: {
      userId: session.user.id,
      organization: {
        slug: params.orgSlug,
      },
    },
    include: {
      organization: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      },
    },
  })

  if (!membership) {
    notFound()
  }

  return (
    <OrganizationLayout 
      organizationSlug={params.orgSlug}
      userRole={membership.role}
    >
      {children}
    </OrganizationLayout>
  )
}