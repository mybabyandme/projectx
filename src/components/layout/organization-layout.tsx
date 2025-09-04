'use client'

import { ReactNode, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users,
  FolderKanban,
  Settings,
  BarChart3,
  Menu,
  X,
  Home,
  Shield,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Package,
  CreditCard,
  FileText,
  Zap,
  CheckSquare,
  Calendar,
  DollarSign,
  Target,
  Briefcase,
  Clock,
  Building2,
  UserPlus
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

interface OrganizationLayoutProps {
  children: ReactNode
  organizationSlug: string
  userRole?: string
}

interface NavItem {
  name: string
  href?: string
  icon: any
  count?: number
  badge?: string
  children?: Array<{
    name: string
    href: string
    icon: any
    description?: string
  }>
}
export default function OrganizationLayout({ 
  children, 
  organizationSlug, 
  userRole = 'TEAM_MEMBER' 
}: OrganizationLayoutProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  // Navigation items based on user role
  const navigation: NavItem[] = [
    { name: 'Dashboard', href: `/${organizationSlug}`, icon: Home },
    { 
      name: 'Projects', 
      icon: FolderKanban,
      children: [
        { name: 'All Projects', href: `/${organizationSlug}/projects`, icon: FolderKanban, description: 'View and manage all projects' },
        { name: 'My Tasks', href: `/${organizationSlug}/tasks`, icon: CheckSquare, description: 'Tasks assigned to you' },
        { name: 'Calendar', href: `/${organizationSlug}/calendar`, icon: Calendar, description: 'Project timeline and milestones' },
      ]
    },
    { 
      name: 'Team', 
      icon: Users,
      children: [
        { name: 'Team Members', href: `/${organizationSlug}/team`, icon: Users, description: 'Manage team members' },
        { name: 'Roles & Permissions', href: `/${organizationSlug}/team/roles`, icon: Shield, description: 'Configure access levels' },
        { name: 'Invite Members', href: `/${organizationSlug}/team/invite`, icon: UserPlus, description: 'Add new team members' },
      ]
    },    { 
      name: 'Reporting', 
      icon: BarChart3,
      children: [
        { name: 'Progress Reports', href: `/${organizationSlug}/reports`, icon: FileText, description: 'Project progress and updates' },
        { name: 'Analytics', href: `/${organizationSlug}/analytics`, icon: BarChart3, description: 'Performance insights' },
        { name: 'Time Tracking', href: `/${organizationSlug}/time-tracking`, icon: Clock, description: 'Time and effort tracking' },
      ]
    },
  ]

  // Add financial management for certain roles
  if (['ORG_ADMIN', 'DONOR_SPONSOR', 'PROJECT_MANAGER'].includes(userRole)) {
    navigation.push({
      name: 'Finance', 
      icon: DollarSign,
      children: [
        { name: 'Budgets', href: `/${organizationSlug}/finance/budgets`, icon: DollarSign, description: 'Project budget management' },
        { name: 'Expenses', href: `/${organizationSlug}/finance/expenses`, icon: CreditCard, description: 'Track and approve expenses' },
        { name: 'Financial Reports', href: `/${organizationSlug}/finance/reports`, icon: FileText, description: 'Financial summaries' },
      ]
    })
  }

  // Add settings for admin roles
  if (['ORG_ADMIN', 'SUPER_ADMIN'].includes(userRole)) {
    navigation.push({
      name: 'Settings', 
      icon: Settings,
      children: [
        { name: 'Organization', href: `/${organizationSlug}/settings`, icon: Building2, description: 'Organization settings' },
        { name: 'Project Templates', href: `/${organizationSlug}/settings/templates`, icon: Package, description: 'Reusable project templates' },
        { name: 'Integrations', href: `/${organizationSlug}/settings/integrations`, icon: Zap, description: 'Third-party integrations' },
      ]
    })
  }

  const isActive = (href?: string) => {
    if (!href) return false
    if (href === `/${organizationSlug}`) {
      return pathname === `/${organizationSlug}`
    }
    return pathname.startsWith(href)
  }

  const isParentActive = (item: NavItem) => {
    if (item.href && isActive(item.href)) return true
    if (item.children) {
      return item.children.some(child => child.href && isActive(child.href))
    }
    return false
  }

  const handleSignOut = async () => {
    router.push('/api/auth/signout')
  }

  // Close mobile sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-gray-900/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900 text-sm truncate">AgileTrack Pro</span>
              <span className="text-xs text-gray-500 truncate">{organizationSlug}</span>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto scrollbar-thin">
          {navigation.map((item) => (
            <NavItem
              key={item.name}
              item={item}
              isActive={isParentActive(item)}
              pathname={pathname}
            />
          ))}
        </nav>
        {/* User info */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {session?.user?.name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {userRole.replace('_', ' ').toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Breadcrumb */}
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <Link href={`/${organizationSlug}`} className="hover:text-gray-700 font-medium">
                  Dashboard
                </Link>
                {pathname !== `/${organizationSlug}` && (
                  <>
                    <span>/</span>
                    <span className="text-gray-900 font-medium capitalize">
                      {pathname.split('/').slice(-1)[0]?.replace('-', ' ')}
                    </span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Search - Desktop only */}
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search projects, tasks..."
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Notifications */}
              <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-white">
                      {session?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">
                    {session?.user?.name}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{session?.user?.name}</p>
                      <p className="text-xs text-gray-500">{session?.user?.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setProfileOpen(false)}
                    >
                      Switch Organization
                    </Link>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}

// Navigation item component with support for nested items
function NavItem({ 
  item, 
  isActive, 
  pathname 
}: { 
  item: NavItem
  isActive: boolean
  pathname: string
}) {
  const [isExpanded, setIsExpanded] = useState(isActive)
  const hasChildren = item.children && item.children.length > 0

  // For parent items with children, don't use Link - use button instead
  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            isActive
              ? "bg-blue-50 text-blue-700"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
          )}
        >
          <div className="flex items-center space-x-3">
            <item.icon className={cn(
              "h-4 w-4",
              isActive ? "text-blue-700" : "text-gray-400"
            )} />
            <span>{item.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            {item.count && (
              <span className="bg-gray-100 text-gray-600 text-xs rounded-full px-2 py-1">
                {item.count}
              </span>
            )}
            {item.badge && (
              <span className="bg-red-100 text-red-600 text-xs rounded-full px-2 py-1">
                {item.badge}
              </span>
            )}
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform",
              isExpanded ? "rotate-180" : ""
            )} />
          </div>
        </button>

        {/* Nested items */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="ml-6 mt-1 space-y-1">
                {item.children?.map((child) => (
                  <Link
                    key={child.name}
                    href={child.href}
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors group",
                      pathname === child.href
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    )}
                  >
                    <child.icon className="h-4 w-4" />
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{child.name}</span>
                      {child.description && (
                        <p className="text-xs text-gray-500 group-hover:text-gray-600 truncate">
                          {child.description}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // For items without children, use Link
  return (
    <div>
      <Link
        href={item.href!}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-blue-50 text-blue-700"
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        )}
      >
        <div className="flex items-center space-x-3">
          <item.icon className={cn(
            "h-4 w-4",
            isActive ? "text-blue-700" : "text-gray-400"
          )} />
          <span>{item.name}</span>
        </div>
        <div className="flex items-center space-x-2">
          {item.count && (
            <span className="bg-gray-100 text-gray-600 text-xs rounded-full px-2 py-1">
              {item.count}
            </span>
          )}
          {item.badge && (
            <span className="bg-red-100 text-red-600 text-xs rounded-full px-2 py-1">
              {item.badge}
            </span>
          )}
        </div>
      </Link>
    </div>
  )
}