'use client'

import TaskList from '@/components/projects/task-list'

interface ProjectTasksProps {
  project: any
  organizationSlug: string
  canEdit: boolean
  userId: string
}

export default function ProjectTasks({ 
  project, 
  organizationSlug, 
  canEdit, 
  userId 
}: ProjectTasksProps) {
  // No need for placeholder functions anymore - TaskList handles everything
  return (
    <TaskList
      project={project}
      organizationSlug={organizationSlug}
      canEdit={canEdit}
      userId={userId}
      // TaskList now handles these internally
      onAddTask={() => {}} 
      onEditTask={() => {}}
    />
  )
}
