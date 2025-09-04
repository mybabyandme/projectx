import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { getCurrentUserWithMemberships } from '@/lib/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session) {
    redirect('/auth/signin')
  }

  const user = await getCurrentUserWithMemberships()
  
  if (!user) {
    redirect('/auth/signin')
  }

  // If user has no organizations, redirect to organization setup
  if (user.memberships.length === 0) {
    redirect('/onboarding/organization')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  )
}