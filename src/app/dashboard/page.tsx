import { getCurrentUserWithMemberships } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await getCurrentUserWithMemberships()
  
  if (!user) {
    redirect('/auth/signin')
  }

  // For now, redirect to the first organization the user belongs to
  if (user.memberships.length > 0) {
    const firstOrg = user.memberships[0].organization
    redirect(`/${firstOrg.slug}`)
  }

  // If no organizations, redirect to setup
  redirect('/onboarding/organization')
}