'use client'

import { useState } from 'react'
import { 
  Download, FileText, BarChart3, Calendar, 
  Target, Users, DollarSign, Settings, 
  CheckCircle, Clock, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ReportExporterProps {
  organizationSlug: string
  organizationData: {
    organization: {
      id: string
      name: string
      members: Array<{ user: { id: string; name: string; email: string } }>
    }
    projects: Array<{
      id: string
      name: string
      status: string
      methodology: string
      description?: string
      createdAt: string
      updatedAt: string
      metrics: {
        totalTasks: number
        completedTasks: number
        overdueTasks: number
        taskCompletionRate: number
        totalBudget: number
        spentBudget: number
        budgetUtilization: number
        totalEstimatedHours: number
        totalActualHours: number
        schedulePerformance: number
        overallHealth: 'GREEN' | 'YELLOW' | 'RED'
      }
      pqgData?: {
        priority: string | null
        program: string | null
        indicators: Array<any>
        ugb: string | null
        interventionArea: string | null
        location: string | null
      } | null
      progressReports: Array<any>
    }>
    userRole: string
    canCreateReports: boolean
    canExport: boolean
  }
  canExport: boolean
  userRole: string
}

// Report templates based on project types and user roles
const REPORT_TEMPLATES = {
  EXECUTIVE_SUMMARY: {
    name: 'Executive Summary',
    description: 'High-level overview for senior management and stakeholders',
    formats: ['PDF', 'Excel', 'PowerPoint'],
    roles: ['ORG_ADMIN', 'PROJECT_MANAGER', 'DONOR_SPONSOR', 'MONITOR'],
    sections: ['Overview', 'Key Metrics', 'Project Health', 'Financial Summary', 'Recommendations']
  },
  PROJECT_PERFORMANCE: {
    name: 'Project Performance Report',
    description: 'Detailed project-by-project performance analysis',
    formats: ['PDF', 'Excel'],
    roles: ['PROJECT_MANAGER', 'MONITOR', 'ORG_ADMIN'],
    sections: ['Project Details', 'Task Analysis', 'Budget Tracking', 'Timeline Performance', 'Risk Assessment']
  },
  FINANCIAL_REPORT: {
    name: 'Financial Report',
    description: 'Comprehensive financial analysis and budget utilization',
    formats: ['Excel', 'PDF'],
    roles: ['DONOR_SPONSOR', 'ORG_ADMIN', 'PROJECT_MANAGER'],
    sections: ['Budget Overview', 'Expense Analysis', 'Utilization Rates', 'Financial Forecasting', 'Approval Status']
  },
  PQG_MBR_REPORT: {
    name: 'Relatório PQG/MBR',
    description: 'Government reporting format for Mozambique PQG compliance',
    formats: ['Excel', 'PDF'],
    roles: ['PROJECT_MANAGER', 'MONITOR', 'ORG_ADMIN'],
    sections: ['PQG Priorities', 'Program Performance', 'MBR Evaluation', 'Geographic Distribution', 'UGB Analysis']
  },
  TEAM_PRODUCTIVITY: {
    name: 'Team Productivity Report',
    description: 'Team performance and resource utilization analysis',
    formats: ['PDF', 'Excel'],
    roles: ['PROJECT_MANAGER', 'ORG_ADMIN'],
    sections: ['Team Overview', 'Task Distribution', 'Performance Metrics', 'Workload Analysis', 'Recommendations']
  },
  COMPLIANCE_REPORT: {
    name: 'Compliance & Audit Report',
    description: 'Detailed compliance tracking for government and donor requirements',
    formats: ['PDF', 'Excel'],
    roles: ['ORG_ADMIN', 'MONITOR', 'DONOR_SPONSOR'],
    sections: ['Compliance Status', 'Audit Trail', 'Document Tracking', 'Risk Assessment', 'Corrective Actions']
  }
}

export default function ReportExporter({
  organizationSlug,
  organizationData,
  canExport,
  userRole
}: ReportExporterProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('EXECUTIVE_SUMMARY')
  const [selectedFormat, setSelectedFormat] = useState<string>('Excel')
  const [reportPeriod, setReportPeriod] = useState<string>('current-quarter')
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [customSections, setCustomSections] = useState<string[]>([])

  // Filter templates based on user role
  const availableTemplates = Object.entries(REPORT_TEMPLATES).filter(([key, template]) =>
    template.roles.includes(userRole)
  )

  const currentTemplate = REPORT_TEMPLATES[selectedTemplate as keyof typeof REPORT_TEMPLATES]

  // Generate organization metrics for reports
  const generateOrgMetrics = () => {
    const projects = organizationData.projects
    return projects.reduce((acc, project) => ({
      totalProjects: acc.totalProjects + 1,
      activeProjects: acc.activeProjects + (project.status === 'ACTIVE' ? 1 : 0),
      totalTasks: acc.totalTasks + project.metrics.totalTasks,
      completedTasks: acc.completedTasks + project.metrics.completedTasks,
      overdueTasks: acc.overdueTasks + project.metrics.overdueTasks,
      totalBudget: acc.totalBudget + project.metrics.totalBudget,
      spentBudget: acc.spentBudget + project.metrics.spentBudget,
      greenProjects: acc.greenProjects + (project.metrics.overallHealth === 'GREEN' ? 1 : 0),
      yellowProjects: acc.yellowProjects + (project.metrics.overallHealth === 'YELLOW' ? 1 : 0),
      redProjects: acc.redProjects + (project.metrics.overallHealth === 'RED' ? 1 : 0),
    }), {
      totalProjects: 0, activeProjects: 0, totalTasks: 0, completedTasks: 0,
      overdueTasks: 0, totalBudget: 0, spentBudget: 0, greenProjects: 0, yellowProjects: 0, redProjects: 0
    })
  }

  const handleGenerateReport = async () => {
    if (!canExport) return

    setIsGenerating(true)
    
    try {
      const orgMetrics = generateOrgMetrics()
      const projectsToInclude = selectedProjects.length > 0 
        ? organizationData.projects.filter(p => selectedProjects.includes(p.id))
        : organizationData.projects

      const reportData = {
        template: selectedTemplate,
        format: selectedFormat,
        period: reportPeriod,
        organization: organizationData.organization,
        projects: projectsToInclude,
        metrics: orgMetrics,
        generatedAt: new Date().toISOString(),
        generatedBy: userRole,
        sections: customSections.length > 0 ? customSections : currentTemplate.sections
      }

      // Generate report based on template type
      let csvContent = ''
      
      switch (selectedTemplate) {
        case 'EXECUTIVE_SUMMARY':
          csvContent = generateExecutiveSummaryCSV(reportData)
          break
        case 'PROJECT_PERFORMANCE':
          csvContent = generateProjectPerformanceCSV(reportData)
          break
        case 'FINANCIAL_REPORT':
          csvContent = generateFinancialReportCSV(reportData)
          break
        case 'PQG_MBR_REPORT':
          csvContent = generatePQGMBRCSV(reportData)
          break
        case 'TEAM_PRODUCTIVITY':
          csvContent = generateTeamProductivityCSV(reportData)
          break
        case 'COMPLIANCE_REPORT':
          csvContent = generateComplianceReportCSV(reportData)
          break
        default:
          csvContent = generateExecutiveSummaryCSV(reportData)
      }

      // Download the report
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `${selectedTemplate.toLowerCase()}-${organizationSlug}-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateExecutiveSummaryCSV = (data: any) => {
    const headers = [
      'Metric', 'Value', 'Description'
    ]
    
    const rows = [
      ['Organization', data.organization.name, 'Organization name'],
      ['Report Period', data.period, 'Reporting period'],
      ['Generated Date', new Date(data.generatedAt).toLocaleDateString(), 'Report generation date'],
      ['Total Projects', data.metrics.totalProjects, 'Total number of projects'],
      ['Active Projects', data.metrics.activeProjects, 'Currently active projects'],
      ['Task Completion Rate', `${((data.metrics.completedTasks / data.metrics.totalTasks) * 100).toFixed(1)}%`, 'Overall task completion percentage'],
      ['Budget Utilization', `${((data.metrics.spentBudget / data.metrics.totalBudget) * 100).toFixed(1)}%`, 'Budget utilization percentage'],
      ['Total Budget', formatCurrency(data.metrics.totalBudget), 'Total allocated budget'],
      ['Spent Budget', formatCurrency(data.metrics.spentBudget), 'Total spent amount'],
      ['Green Projects', data.metrics.greenProjects, 'Projects in good health'],
      ['Yellow Projects', data.metrics.yellowProjects, 'Projects needing attention'],
      ['Red Projects', data.metrics.redProjects, 'Projects in critical status'],
      ['Overdue Tasks', data.metrics.overdueTasks, 'Tasks past due date']
    ]
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  }

  const generateProjectPerformanceCSV = (data: any) => {
    const headers = [
      'Project Name', 'Status', 'Methodology', 'Total Tasks', 'Completed Tasks', 
      'Completion Rate %', 'Overdue Tasks', 'Total Budget', 'Spent Budget', 
      'Budget Utilization %', 'Overall Health', 'Last Updated'
    ]
    
    const rows = data.projects.map((project: any) => [
      project.name,
      project.status,
      project.methodology,
      project.metrics.totalTasks,
      project.metrics.completedTasks,
      project.metrics.taskCompletionRate.toFixed(1),
      project.metrics.overdueTasks,
      project.metrics.totalBudget,
      project.metrics.spentBudget,
      project.metrics.budgetUtilization.toFixed(1),
      project.metrics.overallHealth,
      new Date(project.updatedAt).toLocaleDateString()
    ])
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  }

  const generateFinancialReportCSV = (data: any) => {
    const headers = [
      'Project Name', 'Allocated Budget', 'Spent Amount', 'Remaining Budget', 
      'Utilization %', 'Status', 'Progress Reports', 'Financial Health'
    ]
    
    const rows = data.projects.map((project: any) => {
      const remaining = project.metrics.totalBudget - project.metrics.spentBudget
      const financialHealth = project.metrics.budgetUtilization > 90 ? 'High Risk' :
                             project.metrics.budgetUtilization > 75 ? 'Monitor' : 'Healthy'
      
      return [
        project.name,
        formatCurrency(project.metrics.totalBudget),
        formatCurrency(project.metrics.spentBudget),
        formatCurrency(remaining),
        project.metrics.budgetUtilization.toFixed(1),
        project.status,
        project.progressReports.length,
        financialHealth
      ]
    })
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  }

  const generatePQGMBRCSV = (data: any) => {
    const headers = [
      'Nome do Projecto', 'UGB', 'Localização', 'Prioridade PQG', 'Programa',
      'Meta Física', 'Real Alcançado', '% Execução Física', 
      'Orçamento Alocado', 'Orçamento Executado', '% Execução Orçamental',
      'Relevância', 'Eficiência', 'Eficácia', 'Impacto', 'Sustentabilidade', 'Coordenação',
      'Avaliação Global MBR', 'Observações'
    ]
    
    const rows = data.projects.map((project: any) => {
      const mbrRating = project.metrics.overallHealth === 'GREEN' ? 'Verde' :
                       project.metrics.overallHealth === 'YELLOW' ? 'Amarelo' : 'Vermelho'
      
      return [
        project.name,
        project.pqgData?.ugb || 'N/A',
        project.pqgData?.location || 'N/A',
        project.pqgData?.priority ? `Prioridade ${project.pqgData.priority}` : 'N/A',
        project.pqgData?.program || 'N/A',
        project.metrics.totalTasks,
        project.metrics.completedTasks,
        project.metrics.taskCompletionRate.toFixed(1),
        project.metrics.totalBudget,
        project.metrics.spentBudget,
        project.metrics.budgetUtilization.toFixed(1),
        mbrRating, // Relevância
        mbrRating, // Eficiência
        mbrRating, // Eficácia
        mbrRating, // Impacto
        mbrRating, // Sustentabilidade
        mbrRating, // Coordenação
        mbrRating,
        `Projeto em ${project.status.toLowerCase()}. ${project.metrics.overdueTasks} tarefas em atraso.`
      ]
    })
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  }

  const generateTeamProductivityCSV = (data: any) => {
    const headers = [
      'Project Name', 'Team Size', 'Total Tasks', 'Completed Tasks', 
      'Tasks per Team Member', 'Estimated Hours', 'Actual Hours', 
      'Efficiency %', 'Methodology', 'Status'
    ]
    
    const rows = data.projects.map((project: any) => {
      const teamSize = 5 // Would come from actual team data
      const tasksPerMember = teamSize > 0 ? (project.metrics.totalTasks / teamSize).toFixed(1) : '0'
      const efficiency = project.metrics.totalEstimatedHours > 0 ? 
        ((project.metrics.totalEstimatedHours / project.metrics.totalActualHours) * 100).toFixed(1) : '100'
      
      return [
        project.name,
        teamSize,
        project.metrics.totalTasks,
        project.metrics.completedTasks,
        tasksPerMember,
        project.metrics.totalEstimatedHours,
        project.metrics.totalActualHours,
        efficiency,
        project.methodology,
        project.status
      ]
    })
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  }

  const generateComplianceReportCSV = (data: any) => {
    const headers = [
      'Project Name', 'Compliance Status', 'Progress Reports', 'Last Report Date',
      'Budget Compliance', 'Schedule Compliance', 'Quality Compliance', 
      'Risk Level', 'Corrective Actions Required'
    ]
    
    const rows = data.projects.map((project: any) => {
      const budgetCompliance = project.metrics.budgetUtilization <= 100 ? 'Compliant' : 'Non-Compliant'
      const scheduleCompliance = project.metrics.overdueTasks === 0 ? 'Compliant' : 'Non-Compliant'
      const qualityCompliance = project.metrics.overallHealth === 'GREEN' ? 'Compliant' : 'Needs Review'
      const riskLevel = project.metrics.overallHealth
      const correctiveActions = project.metrics.overallHealth === 'RED' ? 'Yes' : 'No'
      
      return [
        project.name,
        project.metrics.overallHealth === 'GREEN' ? 'Compliant' : 'Non-Compliant',
        project.progressReports.length,
        project.progressReports.length > 0 ? 'Recent' : 'None',
        budgetCompliance,
        scheduleCompliance,
        qualityCompliance,
        riskLevel,
        correctiveActions
      ]
    })
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  }

  const handleProjectSelection = (projectId: string) => {
    setSelectedProjects(prev => 
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    )
  }

  const handleSelectAllProjects = () => {
    if (selectedProjects.length === organizationData.projects.length) {
      setSelectedProjects([])
    } else {
      setSelectedProjects(organizationData.projects.map(p => p.id))
    }
  }

  if (!canExport) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-12 text-center">
          <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Export Not Available</h3>
          <p className="text-gray-600">
            You don't have permission to export reports. Contact your organization administrator.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Export Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Export Reports</h2>
        <p className="mt-1 text-gray-600">
          Generate and download comprehensive reports for stakeholders and compliance
        </p>
      </div>

      {/* Report Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selection */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Report Templates</CardTitle>
            <CardDescription>
              Choose a report template based on your role and requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableTemplates.map(([key, template]) => (
                <div
                  key={key}
                  onClick={() => setSelectedTemplate(key)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedTemplate === key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`font-semibold ${
                      selectedTemplate === key ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {template.name}
                    </h3>
                    {selectedTemplate === key && (
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <p className={`text-sm ${
                    selectedTemplate === key ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {template.description}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {template.formats.map(format => (
                      <span
                        key={format}
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          selectedTemplate === key
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {format}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Report Options */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Report Options</CardTitle>
            <CardDescription>
              Configure report parameters and filters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {currentTemplate?.formats.map(format => (
                  <option key={format} value={format}>{format}</option>
                ))}
              </select>
            </div>

            {/* Period Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Report Period
              </label>
              <select
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="current-quarter">Current Quarter</option>
                <option value="last-quarter">Last Quarter</option>
                <option value="current-year">Current Year</option>
                <option value="last-year">Last Year</option>
                <option value="ytd">Year to Date</option>
                <option value="all">All Time</option>
              </select>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Project Selection */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Project Selection</CardTitle>
              <CardDescription>
                Choose specific projects to include in the report (leave empty for all projects)
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAllProjects}
            >
              {selectedProjects.length === organizationData.projects.length ? 'Deselect All' : 'Select All'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {organizationData.projects.map(project => (
              <div
                key={project.id}
                onClick={() => handleProjectSelection(project.id)}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedProjects.includes(project.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      selectedProjects.includes(project.id) ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {project.name}
                    </h4>
                    <p className={`text-sm ${
                      selectedProjects.includes(project.id) ? 'text-blue-700' : 'text-gray-500'
                    }`}>
                      {project.methodology} • {project.status}
                    </p>
                  </div>
                  {selectedProjects.includes(project.id) && (
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report Sections Preview */}
      {currentTemplate && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Report Sections</CardTitle>
            <CardDescription>
              Preview of sections included in the {currentTemplate.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {currentTemplate.sections.map((section, index) => (
                <div key={section} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{section}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
