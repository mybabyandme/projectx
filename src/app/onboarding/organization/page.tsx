import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth, getCurrentUserWithMemberships } from '@/lib/auth'
import { OrganizationSetupForm } from '@/components/onboarding/organization-setup-form'

export const metadata: Metadata = {
  title: 'Setup Organization',
  description: 'Create your organization to get started with AgileTrack Pro',
}

export default async function OrganizationSetupPage() {
  const session = await auth()
  
  if (!session) {
    redirect('/auth/signin')
  }

  const user = await getCurrentUserWithMemberships()
  
  // If user already has organizations, redirect to dashboard
  if (user && user.memberships.length > 0) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Setup your organization
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Create an organization to start managing your projects
          </p>
        </div>
        
        <OrganizationSetupForm />
      </div>
    </div>
  )
}