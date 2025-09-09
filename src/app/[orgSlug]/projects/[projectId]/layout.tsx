import { ReactNode } from 'react'

interface ProjectLayoutProps {
  children: ReactNode
  params: { orgSlug: string; projectId: string }
}

export default function ProjectLayout({
  children,
  params,
}: ProjectLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
