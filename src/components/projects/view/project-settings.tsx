'use client'

import { useState } from 'react'
import { Settings, Save, Archive, Trash2, AlertTriangle, Eye, Download, Calendar, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { formatDate } from '@/lib/utils'

interface ProjectSettingsProps {
  project: any
  organizationSlug: string
}

export default function ProjectSettings({ 
  project, 
  organizationSlug 
}: ProjectSettingsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [projectData, setProjectData] = useState({
    name: project.name || '',
    description: project.description || '',
    methodology: project.methodology || 'AGILE',
    priority: project.priority || 'MEDIUM',
    budget: project.budget || 0,
    currency: project.currency || 'USD',
    startDate: project.startDate ? project.startDate : '',
    endDate: project.endDate ? project.endDate : '',
  })

  const [dangerZoneVisible, setDangerZoneVisible] = useState(false)

  const handleSave = () => {
    // TODO: Implement save functionality
    setIsEditing(false)
  }

  const handleCancel = () => {
    setProjectData({
      name: project.name || '',
      description: project.description || '',
      methodology: project.methodology || 'AGILE',
      priority: project.priority || 'MEDIUM',
      budget: project.budget || 0,
      currency: project.currency || 'USD',
      startDate: project.startDate ? project.startDate.split('T')[0] : '',
      endDate: project.endDate ? project.endDate.split('T')[0] : '',
    })
    setIsEditing(false)
  }

  return (
    <div className="p-6 space-y-8">
      {/* Project Information */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Project Information</h3>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Project Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={projectData.name}
                  onChange={(e) => setProjectData({ ...projectData, name: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-gray-900">{project.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="methodology">Methodology</Label>
              {isEditing ? (
                <select
                  id="methodology"
                  value={projectData.methodology}
                  onChange={(e) => setProjectData({ ...projectData, methodology: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="AGILE">Agile</option>
                  <option value="WATERFALL">Waterfall</option>
                  <option value="HYBRID">Hybrid</option>
                  <option value="KANBAN">Kanban</option>
                  <option value="SCRUM">Scrum</option>
                </select>
              ) : (
                <p className="mt-1 text-gray-900">{project.methodology}</p>
              )}
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              {isEditing ? (
                <select
                  id="priority"
                  value={projectData.priority}
                  onChange={(e) => setProjectData({ ...projectData, priority: e.target.value })}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              ) : (
                <p className="mt-1 text-gray-900">{project.priority}</p>
              )}
            </div>

            <div>
              <Label htmlFor="template">Template</Label>
              <p className="mt-1 text-gray-900">{project.template || 'Custom'}</p>
              <p className="text-xs text-gray-500 mt-1">Template cannot be changed after creation</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              {isEditing ? (
                <Input
                  id="startDate"
                  type="date"
                  value={projectData.startDate}
                  onChange={(e) => setProjectData({ ...projectData, startDate: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-gray-900">
                  {project.startDate ? formatDate(project.startDate) : 'Not set'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              {isEditing ? (
                <Input
                  id="endDate"
                  type="date"
                  value={projectData.endDate}
                  onChange={(e) => setProjectData({ ...projectData, endDate: e.target.value })}
                  className="mt-1"
                />
              ) : (
                <p className="mt-1 text-gray-900">
                  {project.endDate ? formatDate(project.endDate) : 'Not set'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="budget">Budget</Label>
              {isEditing ? (
                <div className="flex space-x-2 mt-1">
                  <Input
                    id="budget"
                    type="number"
                    value={projectData.budget}
                    onChange={(e) => setProjectData({ ...projectData, budget: parseFloat(e.target.value) || 0 })}
                    className="flex-1"
                  />
                  <select
                    value={projectData.currency}
                    onChange={(e) => setProjectData({ ...projectData, currency: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CAD">CAD</option>
                    <option value="AUD">AUD</option>
                  </select>
                </div>
              ) : (
                <p className="mt-1 text-gray-900">
                  {project.budget ? `${project.currency} ${Number(project.budget).toLocaleString()}` : 'Not set'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <p className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  project.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                  project.status === 'PLANNING' ? 'bg-blue-100 text-blue-800' :
                  project.status === 'ON_HOLD' ? 'bg-yellow-100 text-yellow-800' :
                  project.status === 'COMPLETED' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status.replace('_', ' ')}
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1">Status is automatically managed based on project progress</p>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <Label htmlFor="description">Description</Label>
          {isEditing ? (
            <Textarea
              id="description"
              value={projectData.description}
              onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
              rows={4}
              className="mt-1"
              placeholder="Enter project description..."
            />
          ) : (
            <p className="mt-1 text-gray-900">
              {project.description || 'No description provided'}
            </p>
          )}
        </div>
      </div>

      {/* Project Statistics */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Created</p>
                <p className="text-lg font-semibold text-gray-900">{formatDate(project.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Last Updated</p>
                <p className="text-lg font-semibold text-gray-900">{formatDate(project.updatedAt)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <Settings className="h-5 w-5 text-purple-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Tasks</p>
                <p className="text-lg font-semibold text-gray-900">{project.tasks?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-orange-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Budget Categories</p>
                <p className="text-lg font-semibold text-gray-900">{project.budgets?.length || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Settings</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Project Visibility</h4>
              <p className="text-sm text-gray-500">Control who can view this project</p>
            </div>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Manage Access
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Notifications</h4>
              <p className="text-sm text-gray-500">Configure project notifications and alerts</p>
            </div>
            <Button variant="outline" size="sm">
              Configure
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Data Export</h4>
              <p className="text-sm text-gray-500">Export project data and reports</p>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Project Archive</h4>
              <p className="text-sm text-gray-500">Archive this project to reduce clutter</p>
            </div>
            <Button variant="outline" size="sm">
              <Archive className="h-4 w-4 mr-2" />
              Archive Project
            </Button>
          </div>
        </div>
      </div>

      {/* Wizard Data Preview */}
      {project.metadata && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Charter Data</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Charter Information */}
            {project.metadata.charter && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Vision</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {project.metadata.charter.vision || 'No vision defined'}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Objectives</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    {project.metadata.charter.objectives?.length > 0 ? (
                      <ul className="text-sm text-gray-600 space-y-1">
                        {project.metadata.charter.objectives.slice(0, 3).map((obj: string, index: number) => (
                          <li key={index}>• {obj}</li>
                        ))}
                        {project.metadata.charter.objectives.length > 3 && (
                          <li className="text-gray-400">...and {project.metadata.charter.objectives.length - 3} more</li>
                        )}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-400">No objectives defined</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Stakeholder Summary */}
            {project.metadata.stakeholders && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Stakeholders</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600 mb-2">
                      {project.metadata.stakeholders.stakeholders?.length || 0} stakeholders defined
                    </p>
                    {project.metadata.stakeholders.stakeholders?.length > 0 && (
                      <div className="space-y-1">
                        {project.metadata.stakeholders.stakeholders.slice(0, 3).map((stakeholder: any, index: number) => (
                          <div key={index} className="text-xs text-gray-500">
                            {stakeholder.name || 'TBA'} - {stakeholder.role.replace('_', ' ')}
                          </div>
                        ))}
                        {project.metadata.stakeholders.stakeholders.length > 3 && (
                          <div className="text-xs text-gray-400">
                            ...and {project.metadata.stakeholders.stakeholders.length - 3} more
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Risks</h4>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">
                      {project.metadata.risks?.risks?.length || 0} risks identified
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Danger Zone */}
      <div className="bg-white border border-red-200 rounded-lg">
        <div className="p-6">
          <button
            onClick={() => setDangerZoneVisible(!dangerZoneVisible)}
            className="flex items-center w-full text-left"
          >
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-red-900">Danger Zone</h3>
          </button>
          
          {dangerZoneVisible && (
            <div className="mt-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-900 mb-2">Delete Project</h4>
                <p className="text-sm text-red-700 mb-4">
                  Once you delete a project, there is no going back. This action cannot be undone.
                  All tasks, reports, and associated data will be permanently deleted.
                </p>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Project
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
