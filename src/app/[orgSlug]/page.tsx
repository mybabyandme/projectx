import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'

export default async function OrganizationDashboard({
  params,
}: {
  params: { orgSlug: string }
}) {
  const session = await auth()
  
  if (!session?.user?.id) {
    notFound()
  }

  // Get organization and user membership
  const membership = await db.organizationMember.findFirst({
    where: {
      userId: session.user.id,
      organization: {
        slug: params.orgSlug,
      },
    },
    include: {
      organization: {
        include: {
          projects: {
            take: 5,
            orderBy: {
              updatedAt: 'desc',
            },
          },
        },
      },
    },
  })

  if (!membership) {
    notFound()
  }

  const { organization } = membership

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome to {organization.name}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Your role: {membership.role.replace('_', ' ').toLowerCase()}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Projects Overview */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Recent Projects
          </h2>
          {organization.projects.length > 0 ? (
            <div className="space-y-3">
              {organization.projects.map((project) => (
                <div key={project.id} className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {project.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Status: {project.status}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No projects yet. Create your first project to get started.
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Quick Actions
          </h2>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
              Create New Project
            </button>
            <button className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
              Invite Team Members
            </button>
            <button className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded">
              View Reports
            </button>
          </div>
        </div>

        {/* Organization Stats */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Organization Stats
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Projects:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {organization.projects.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Your Role:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {membership.role.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}