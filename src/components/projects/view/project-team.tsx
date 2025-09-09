'use client'

import StakeholderList from '@/components/projects/stakeholder-list'

interface ProjectTeamProps {
  project: any
  organizationSlug: string
  canEdit: boolean
}

export default function ProjectTeam({ 
  project, 
  organizationSlug, 
  canEdit 
}: ProjectTeamProps) {
  const handleAddStakeholder = () => {
    // TODO: Implement add stakeholder modal/form
    console.log('Add stakeholder')
  }

  const handleEditStakeholder = (stakeholder: any) => {
    // TODO: Implement edit stakeholder modal/form
    console.log('Edit stakeholder:', stakeholder)
  }

  return (
    <div className="p-6">
      <StakeholderList
        project={project}
        canEdit={canEdit}
        onAddStakeholder={canEdit ? handleAddStakeholder : undefined}
        onEditStakeholder={canEdit ? handleEditStakeholder : undefined}
      />
    </div>
  )
}
