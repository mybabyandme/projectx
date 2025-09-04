'use client'

import { useState } from 'react'
import { X, Edit, Save, Loader2, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

interface TeamMember {
  id: string
  role: string
  permissions?: any
  joinedAt: Date
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    createdAt: Date
  }
}

interface EditMemberModalProps {
  isOpen: boolean
  onClose: () => void
  member: TeamMember
  organizationSlug: string
}

export function EditMemberModal({ isOpen, onClose, member, organizationSlug }: EditMemberModalProps) {
  const [selectedRole, setSelectedRole] = useState(member.role)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedRole === member.role) {
      onClose()
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(`/api/organizations/${organizationSlug}/members/${member.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: selectedRole }),
      })

      if (response.ok) {
        toast({
          title: 'Member Updated',
          description: `${member.user.name || member.user.email}'s role has been updated successfully.`,
        })
        onClose()
        // Refresh the page to update the member list
        setTimeout(() => window.location.reload(), 1000)
      } else {
        const data = await response.json()
        toast({
          title: 'Failed to Update Member',
          description: data.message || 'Something went wrong.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const roleOptions = [
    { value: 'TEAM_MEMBER', label: 'Team Member', description: 'Can view and contribute to projects', color: 'bg-gray-100 text-gray-800' },
    { value: 'PROJECT_MANAGER', label: 'Project Manager', description: 'Can create and manage projects', color: 'bg-blue-100 text-blue-800' },
    { value: 'MONITOR', label: 'Monitor', description: 'Can track progress and create reports', color: 'bg-green-100 text-green-800' },
    { value: 'DONOR_SPONSOR', label: 'Donor/Sponsor', description: 'Can oversee budgets and approve funding', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'VIEWER', label: 'Viewer', description: 'Read-only access to projects and reports', color: 'bg-gray-100 text-gray-600' },
    { value: 'ORG_ADMIN', label: 'Administrator', description: 'Full access to organization settings', color: 'bg-red-100 text-red-800' },
  ]

  const currentRole = roleOptions.find(role => role.value === member.role)
  const newRole = roleOptions.find(role => role.value === selectedRole)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Edit className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Member Role</h2>
              <p className="text-sm text-gray-500">Update {member.user.name || member.user.email}'s role</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Member Info */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            {member.user.image ? (
              <img 
                src={member.user.image} 
                alt={member.user.name || 'User'} 
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                {(member.user.name || member.user.email).charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{member.user.name || member.user.email}</h3>
              <p className="text-sm text-gray-500">{member.user.email}</p>
              <div className="mt-1">
                <span className="text-xs text-gray-500">Current Role: </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${currentRole?.color}`}>
                  {currentRole?.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Role Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Select New Role</Label>
            <div className="space-y-2">
              {roleOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedRole === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={selectedRole === option.value}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="mt-0.5 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{option.label}</span>
                      {selectedRole === option.value && selectedRole !== member.role && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                          New Role
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Change Summary */}
          {selectedRole !== member.role && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-blue-800">
                <Shield className="h-4 w-4" />
                <span className="text-sm font-medium">Role Change Summary</span>
              </div>
              <div className="mt-2 text-sm text-blue-700">
                <span className="font-medium">{member.user.name || member.user.email}</span> will be changed from{' '}
                <span className="font-medium">{currentRole?.label}</span> to{' '}
                <span className="font-medium">{newRole?.label}</span>.
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || selectedRole === member.role}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Role
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}