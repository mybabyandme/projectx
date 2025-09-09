'use client'

import { useState } from 'react'
import { FileText, Plus, Download, Calendar, User, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

interface ProjectReportsProps {
  project: any
  organizationSlug: string
  canEdit: boolean
}

const getReportStatusIcon = (status: string) => {
  switch (status) {
    case 'APPROVED': return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'SUBMITTED': return <Clock className="h-4 w-4 text-blue-600" />
    case 'REJECTED': return <AlertCircle className="h-4 w-4 text-red-600" />
    default: return <FileText className="h-4 w-4 text-gray-400" />
  }
}

const getReportStatusColor = (status: string) => {
  switch (status) {
    case 'APPROVED': return 'bg-green-100 text-green-800'
    case 'SUBMITTED': return 'bg-blue-100 text-blue-800'
    case 'REJECTED': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const getReportTypeColor = (type: string) => {
  switch (type) {
    case 'MILESTONE': return 'bg-purple-100 text-purple-800'
    case 'MONTHLY': return 'bg-blue-100 text-blue-800'
    case 'WEEKLY': return 'bg-green-100 text-green-800'
    case 'INCIDENT': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default function ProjectReports({ 
  project, 
  organizationSlug, 
  canEdit 
}: ProjectReportsProps) {
  const [selectedFilter, setSelectedFilter] = useState('all')
  
  const reports = project.progressReports || []
  
  const filteredReports = reports.filter((report: any) => {
    if (selectedFilter === 'all') return true
    return report.status === selectedFilter
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Progress Reports</h2>
          <p className="text-sm text-gray-500 mt-1">
            {filteredReports.length} of {reports.length} reports
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Reports</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          
          {canEdit && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
          )}
        </div>
      </div>

      {/* Report Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-lg font-semibold text-gray-900">{reports.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-lg font-semibold text-gray-900">
                {reports.filter((r: any) => r.status === 'APPROVED').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-lg font-semibold text-gray-900">
                {reports.filter((r: any) => r.status === 'SUBMITTED').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <FileText className="h-5 w-5 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Drafts</p>
              <p className="text-lg font-semibold text-gray-900">
                {reports.filter((r: any) => r.status === 'DRAFT').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      {filteredReports.length > 0 ? (
        <div className="space-y-4">
          {filteredReports.map((report: any) => (
            <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {getReportStatusIcon(report.status)}
                    <h3 className="font-medium text-gray-900">
                      {report.reportType.replace('_', ' ')} Report
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReportTypeColor(report.reportType)}`}>
                      {report.reportType}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReportStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </div>
                  
                  {report.content?.summary && (
                    <p className="text-gray-600 mb-3 line-clamp-2">{report.content.summary}</p>
                  )}
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      <span>{report.reporter?.name || report.reporter?.email}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{formatDate(report.createdAt)}</span>
                    </div>
                    
                    {report.submittedAt && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Submitted {formatDate(report.submittedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  
                  {canEdit && report.status === 'DRAFT' && (
                    <Button size="sm">
                      Edit
                    </Button>
                  )}
                </div>
              </div>

              {/* Report Content Preview */}
              {report.content && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {report.content.progress !== undefined && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Progress</h4>
                        <p className="text-lg font-semibold text-green-600">{report.content.progress}%</p>
                      </div>
                    )}
                    
                    {report.content.tasksCompleted !== undefined && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Tasks Completed</h4>
                        <p className="text-lg font-semibold text-blue-600">{report.content.tasksCompleted}</p>
                      </div>
                    )}
                    
                    {report.content.budgetUtilization !== undefined && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700">Budget Used</h4>
                        <p className="text-lg font-semibold text-orange-600">{report.content.budgetUtilization}%</p>
                      </div>
                    )}
                  </div>

                  {(report.content.achievements || report.content.challenges || report.content.nextSteps) && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      {report.content.achievements && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Key Achievements</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {report.content.achievements.slice(0, 2).map((achievement: string, index: number) => (
                              <li key={index} className="flex items-start">
                                <CheckCircle className="h-3 w-3 text-green-500 mr-2 mt-1 flex-shrink-0" />
                                {achievement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {report.content.challenges && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Challenges</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {report.content.challenges.slice(0, 2).map((challenge: string, index: number) => (
                              <li key={index} className="flex items-start">
                                <AlertCircle className="h-3 w-3 text-orange-500 mr-2 mt-1 flex-shrink-0" />
                                {challenge}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {report.content.nextSteps && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Next Steps</h4>
                          <ul className="text-sm text-gray-600 space-y-1">
                            {report.content.nextSteps.slice(0, 2).map((step: string, index: number) => (
                              <li key={index} className="flex items-start">
                                <Clock className="h-3 w-3 text-blue-500 mr-2 mt-1 flex-shrink-0" />
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {reports.length === 0 ? 'No reports yet' : 'No reports match your filter'}
          </h3>
          <p className="text-gray-500 mb-4">
            {reports.length === 0 
              ? 'Create your first progress report to track project milestones'
              : 'Try adjusting your filter to see more reports'
            }
          </p>
          {canEdit && reports.length === 0 && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create First Report
            </Button>
          )}
        </div>
      )}

      {/* Quick Report Templates */}
      {canEdit && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Report Templates</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left">
              <div className="flex items-center mb-2">
                <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                <span className="font-medium text-gray-900">Weekly Report</span>
              </div>
              <p className="text-sm text-gray-500">Regular weekly progress update</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-left">
              <div className="flex items-center mb-2">
                <CheckCircle className="h-5 w-5 text-purple-600 mr-2" />
                <span className="font-medium text-gray-900">Milestone Report</span>
              </div>
              <p className="text-sm text-gray-500">Key milestone achievement report</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors text-left">
              <div className="flex items-center mb-2">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="font-medium text-gray-900">Incident Report</span>
              </div>
              <p className="text-sm text-gray-500">Issue or risk escalation report</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-left">
              <div className="flex items-center mb-2">
                <FileText className="h-5 w-5 text-green-600 mr-2" />
                <span className="font-medium text-gray-900">Monthly Report</span>
              </div>
              <p className="text-sm text-gray-500">Comprehensive monthly summary</p>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
