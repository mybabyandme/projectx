'use client'

import { useState } from 'react'
import { 
  Download, FileText, BarChart3, Calendar, Target, Users, DollarSign, 
  Settings, CheckCircle, Clock, Loader2, Plus, Edit, Eye, 
  PieChart, TrendingUp, AlertTriangle, Building
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatCurrency, formatDate } from '@/lib/utils'
import { toast } from '@/components/ui/use-toast'
import ProgressReportModal from '../projects/progress-report-modal'

interface EnhancedReportExporterProps {
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
  userId: string
}

// Enhanced report templates with PDF support
const ENHANCED_REPORT_TEMPLATES = {
  PROGRESS_REPORT: {
    name: 'Progress Report',
    description: 'Create detailed progress reports for stakeholders',
    formats: ['PDF', 'Excel', 'Word'],
    icon: FileText,
    roles: ['PROJECT_MANAGER', 'MONITOR', 'ORG_ADMIN'],
    sections: ['Executive Summary', 'Progress Overview', 'Task Analysis', 'Budget Status', 'Risks & Issues', 'Next Steps'],
    type: 'interactive' // Allows for custom content creation
  },
  EXECUTIVE_DASHBOARD: {
    name: 'Executive Dashboard',
    description: 'High-level overview with charts and KPIs for leadership',
    formats: ['PDF', 'PowerPoint'],
    icon: BarChart3,
    roles: ['ORG_ADMIN', 'DONOR_SPONSOR', 'MONITOR'],
    sections: ['Organization Overview', 'Key Metrics', 'Project Health', 'Financial Summary', 'Recommendations'],
    type: 'automated'
  },
  PROJECT_PERFORMANCE: {
    name: 'Project Performance Analysis',
    description: 'Detailed project-by-project performance metrics',
    formats: ['PDF', 'Excel'],
    icon: TrendingUp,
    roles: ['PROJECT_MANAGER', 'MONITOR', 'ORG_ADMIN'],
    sections: ['Project Details', 'Task Analysis', 'Budget Tracking', 'Timeline Performance', 'Risk Assessment'],
    type: 'automated'
  },
  FINANCIAL_REPORT: {
    name: 'Financial Analysis',
    description: 'Comprehensive financial tracking and budget analysis',
    formats: ['Excel', 'PDF'],
    icon: DollarSign,
    roles: ['DONOR_SPONSOR', 'ORG_ADMIN', 'PROJECT_MANAGER'],
    sections: ['Budget Overview', 'Expense Analysis', 'Utilization Rates', 'Financial Forecasting', 'Approval Status'],
    type: 'automated'
  },
  PQG_MBR_REPORT: {
    name: 'Relatório PQG/MBR',
    description: 'Government compliance reporting for Mozambique standards',
    formats: ['Excel', 'PDF'],
    icon: Building,
    roles: ['PROJECT_MANAGER', 'MONITOR', 'ORG_ADMIN'],
    sections: ['PQG Priorities', 'Program Performance', 'MBR Evaluation', 'Geographic Distribution', 'UGB Analysis'],
    type: 'automated'
  },
  TEAM_PRODUCTIVITY: {
    name: 'Team Productivity Report',
    description: 'Team performance and resource utilization analysis',
    formats: ['PDF', 'Excel'],
    icon: Users,
    roles: ['PROJECT_MANAGER', 'ORG_ADMIN'],
    sections: ['Team Overview', 'Task Distribution', 'Performance Metrics', 'Workload Analysis', 'Recommendations'],
    type: 'automated'
  },
  COMPLIANCE_AUDIT: {
    name: 'Compliance & Audit Report',
    description: 'Detailed compliance tracking for regulatory requirements',
    formats: ['PDF', 'Excel'],
    icon: Target,
    roles: ['ORG_ADMIN', 'MONITOR', 'DONOR_SPONSOR'],
    sections: ['Compliance Status', 'Audit Trail', 'Document Tracking', 'Risk Assessment', 'Corrective Actions'],
    type: 'automated'
  }
}

export default function EnhancedReportExporter({
  organizationSlug,
  organizationData,
  canExport,
  userRole,
  userId
}: EnhancedReportExporterProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('EXECUTIVE_DASHBOARD')
  const [selectedFormat, setSelectedFormat] = useState<string>('PDF')
  const [reportPeriod, setReportPeriod] = useState<string>('current-quarter')
  const [selectedProjects, setSelectedProjects] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [showProgressReportModal, setShowProgressReportModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)

  // Filter templates based on user role
  const availableTemplates = Object.entries(ENHANCED_REPORT_TEMPLATES).filter(([key, template]) =>
    template.roles.includes(userRole)
  )

  const currentTemplate = ENHANCED_REPORT_TEMPLATES[selectedTemplate as keyof typeof ENHANCED_REPORT_TEMPLATES]

  // Generate PDF using HTML and CSS (client-side PDF generation)
  const generatePDF = async (htmlContent: string, filename: string) => {
    try {
      // Using html2pdf library (would need to be installed)
      // For now, we'll create a comprehensive HTML structure and use browser print
      
      const printWindow = window.open('', '_blank')
      if (!printWindow) return

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${filename}</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              line-height: 1.4;
              color: #333;
            }
            .header { 
              border-bottom: 2px solid #3B82F6; 
              padding-bottom: 20px; 
              margin-bottom: 30px;
              text-align: center;
            }
            .header h1 { 
              color: #1F2937; 
              margin: 0 0 10px 0;
              font-size: 24px;
            }
            .header .subtitle { 
              color: #6B7280; 
              font-size: 14px;
            }
            .section { 
              margin-bottom: 30px; 
              break-inside: avoid;
            }
            .section h2 { 
              color: #1F2937; 
              border-bottom: 1px solid #E5E7EB;
              padding-bottom: 10px;
              font-size: 18px;
              margin-bottom: 15px;
            }
            .metrics-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
              gap: 15px; 
              margin: 20px 0;
            }
            .metric-card { 
              border: 1px solid #E5E7EB; 
              padding: 15px; 
              border-radius: 8px;
              background: #F9FAFB;
            }
            .metric-value { 
              font-size: 24px; 
              font-weight: bold; 
              color: #1F2937;
              margin-bottom: 5px;
            }
            .metric-label { 
              font-size: 12px; 
              color: #6B7280;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .project-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0;
              font-size: 12px;
            }
            .project-table th, .project-table td { 
              border: 1px solid #E5E7EB; 
              padding: 8px; 
              text-align: left;
            }
            .project-table th { 
              background: #F3F4F6; 
              font-weight: bold;
            }
            .status-badge { 
              padding: 2px 8px; 
              border-radius: 12px; 
              font-size: 10px; 
              font-weight: bold;
              text-transform: uppercase;
            }
            .status-green { background: #D1FAE5; color: #065F46; }
            .status-yellow { background: #FEF3C7; color: #92400E; }
            .status-red { background: #FEE2E2; color: #991B1B; }
            .footer { 
              margin-top: 40px; 
              padding-top: 20px; 
              border-top: 1px solid #E5E7EB;
              font-size: 12px;
              color: #6B7280;
              text-align: center;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
          <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()} by ${organizationData.organization.name}</p>
            <p>AgileTrack Pro - Enterprise Project Management Platform</p>
          </div>
        </body>
        </html>
      `)

      printWindow.document.close()
      
      // Auto-trigger print dialog
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)

    } catch (error) {
      console.error('Error generating PDF:', error)
      toast({
        title: "PDF Generation Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    }
  }

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

  const generateExecutiveDashboardHTML = (data: any) => {
    const metrics = data.metrics

    return `
      <div class="header">
        <h1>Executive Dashboard</h1>
        <div class="subtitle">
          ${data.organization.name} • ${data.period} • Generated ${new Date().toLocaleDateString()}
        </div>
      </div>

      <div class="section">
        <h2>Key Performance Indicators</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value">${metrics.totalProjects}</div>
            <div class="metric-label">Total Projects</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${metrics.activeProjects}</div>
            <div class="metric-label">Active Projects</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${((metrics.completedTasks / metrics.totalTasks) * 100).toFixed(1)}%</div>
            <div class="metric-label">Task Completion Rate</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${((metrics.spentBudget / metrics.totalBudget) * 100).toFixed(1)}%</div>
            <div class="metric-label">Budget Utilization</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${formatCurrency(metrics.totalBudget)}</div>
            <div class="metric-label">Total Budget</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${metrics.overdueTasks}</div>
            <div class="metric-label">Overdue Tasks</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Project Health Overview</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value" style="color: #10B981;">${metrics.greenProjects}</div>
            <div class="metric-label">Healthy Projects</div>
          </div>
          <div class="metric-card">
            <div class="metric-value" style="color: #F59E0B;">${metrics.yellowProjects}</div>
            <div class="metric-label">Projects Needing Attention</div>
          </div>
          <div class="metric-card">
            <div class="metric-value" style="color: #EF4444;">${metrics.redProjects}</div>
            <div class="metric-label">Critical Projects</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Project Details</h2>
        <table class="project-table">
          <thead>
            <tr>
              <th>Project Name</th>
              <th>Status</th>
              <th>Methodology</th>
              <th>Progress</th>
              <th>Budget Utilization</th>
              <th>Health</th>
            </tr>
          </thead>
          <tbody>
            ${data.projects.map((project: any) => `
              <tr>
                <td>${project.name}</td>
                <td>${project.status}</td>
                <td>${project.methodology}</td>
                <td>${project.metrics.taskCompletionRate.toFixed(1)}%</td>
                <td>${project.metrics.budgetUtilization.toFixed(1)}%</td>
                <td>
                  <span class="status-badge status-${project.metrics.overallHealth.toLowerCase()}">
                    ${project.metrics.overallHealth}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>Financial Summary</h2>
        <p><strong>Total Allocated Budget:</strong> ${formatCurrency(metrics.totalBudget)}</p>
        <p><strong>Total Spent:</strong> ${formatCurrency(metrics.spentBudget)}</p>
        <p><strong>Remaining Budget:</strong> ${formatCurrency(metrics.totalBudget - metrics.spentBudget)}</p>
        <p><strong>Overall Utilization:</strong> ${((metrics.spentBudget / metrics.totalBudget) * 100).toFixed(1)}%</p>
      </div>

      <div class="section">
        <h2>Key Recommendations</h2>
        <ul>
          ${metrics.redProjects > 0 ? `<li><strong>Critical Attention Required:</strong> ${metrics.redProjects} projects are in critical status and need immediate intervention.</li>` : ''}
          ${metrics.overdueTasks > 0 ? `<li><strong>Task Management:</strong> ${metrics.overdueTasks} tasks are overdue. Review project timelines and resource allocation.</li>` : ''}
          ${(metrics.spentBudget / metrics.totalBudget) > 0.9 ? `<li><strong>Budget Monitoring:</strong> Budget utilization is at ${((metrics.spentBudget / metrics.totalBudget) * 100).toFixed(1)}%. Monitor spending closely.</li>` : ''}
          <li><strong>Performance:</strong> Overall task completion rate is ${((metrics.completedTasks / metrics.totalTasks) * 100).toFixed(1)}%. ${((metrics.completedTasks / metrics.totalTasks) * 100) >= 75 ? 'Performance is good.' : 'Consider reviewing project execution strategies.'}</li>
        </ul>
      </div>
    `
  }

  const generateProjectPerformanceHTML = (data: any) => {
    return `
      <div class="header">
        <h1>Project Performance Analysis</h1>
        <div class="subtitle">
          ${data.organization.name} • ${data.period} • Generated ${new Date().toLocaleDateString()}
        </div>
      </div>

      <div class="section">
        <h2>Performance Summary</h2>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value">${data.projects.length}</div>
            <div class="metric-label">Projects Analyzed</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${data.projects.filter((p: any) => p.metrics.overallHealth === 'GREEN').length}</div>
            <div class="metric-label">High Performing</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">${data.projects.filter((p: any) => p.metrics.overdueTasks > 0).length}</div>
            <div class="metric-label">Projects with Delays</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Detailed Project Analysis</h2>
        <table class="project-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Methodology</th>
              <th>Total Tasks</th>
              <th>Completed</th>
              <th>Overdue</th>
              <th>Progress %</th>
              <th>Budget Used %</th>
              <th>Schedule Performance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.projects.map((project: any) => `
              <tr>
                <td><strong>${project.name}</strong></td>
                <td>${project.methodology}</td>
                <td>${project.metrics.totalTasks}</td>
                <td>${project.metrics.completedTasks}</td>
                <td>${project.metrics.overdueTasks}</td>
                <td>${project.metrics.taskCompletionRate.toFixed(1)}%</td>
                <td>${project.metrics.budgetUtilization.toFixed(1)}%</td>
                <td>${project.metrics.schedulePerformance.toFixed(1)}%</td>
                <td>
                  <span class="status-badge status-${project.metrics.overallHealth.toLowerCase()}">
                    ${project.metrics.overallHealth}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>Performance Insights</h2>
        ${data.projects.map((project: any) => {
          const insights = []
          if (project.metrics.taskCompletionRate >= 80) insights.push('Strong task completion rate')
          if (project.metrics.overdueTasks > 0) insights.push(`${project.metrics.overdueTasks} overdue tasks need attention`)
          if (project.metrics.budgetUtilization > 90) insights.push('High budget utilization - monitor spending')
          if (project.metrics.schedulePerformance < 80) insights.push('Schedule performance below target')
          
          return `
            <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #E5E7EB; border-radius: 8px;">
              <h3 style="margin: 0 0 10px 0; color: #1F2937;">${project.name}</h3>
              <ul style="margin: 0; padding-left: 20px;">
                ${insights.map(insight => `<li>${insight}</li>`).join('')}
              </ul>
            </div>
          `
        }).join('')}
      </div>
    `
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
        sections: currentTemplate.sections
      }

      if (selectedFormat === 'PDF') {
        let htmlContent = ''
        
        switch (selectedTemplate) {
          case 'EXECUTIVE_DASHBOARD':
            htmlContent = generateExecutiveDashboardHTML(reportData)
            break
          case 'PROJECT_PERFORMANCE':
            htmlContent = generateProjectPerformanceHTML(reportData)
            break
          default:
            htmlContent = generateExecutiveDashboardHTML(reportData)
        }

        await generatePDF(htmlContent, `${selectedTemplate.toLowerCase()}-${organizationSlug}`)
        
      } else {
        // Generate CSV/Excel for other formats
        let csvContent = generateCSVContent(reportData)
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = window.URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `${selectedTemplate.toLowerCase()}-${organizationSlug}-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }

      toast({
        title: "Report Generated Successfully",
        description: `${currentTemplate.name} has been generated and downloaded.`,
      })

    } catch (error) {
      console.error('Error generating report:', error)
      toast({
        title: "Report Generation Failed",
        description: "Please try again or contact support.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateCSVContent = (data: any) => {
    // Implementation for CSV generation based on template
    const headers = ['Project Name', 'Status', 'Methodology', 'Progress %', 'Budget Utilization %', 'Health']
    const rows = data.projects.map((project: any) => [
      project.name,
      project.status,
      project.methodology,
      project.metrics.taskCompletionRate.toFixed(1),
      project.metrics.budgetUtilization.toFixed(1),
      project.metrics.overallHealth
    ])
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('')
  }

  const handleCreateProgressReport = (project: any) => {
    setSelectedProject(project)
    setShowProgressReportModal(true)
  }

  const handleProgressReportSubmitted = () => {
    setShowProgressReportModal(false)
    setSelectedProject(null)
    toast({
      title: "Progress Report Created",
      description: "Progress report has been submitted successfully.",
    })
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
      {/* Enhanced Export Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Advanced Reporting & Export</h2>
          <p className="mt-1 text-gray-600">
            Generate comprehensive reports, create progress updates, and export data for stakeholders
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <Button
            onClick={() => setShowProgressReportModal(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Progress Report
          </Button>
        </div>
      </div>

      {/* Report Templates - Enhanced Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Report Templates</CardTitle>
              <CardDescription>
                Choose from advanced report templates with PDF generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableTemplates.map(([key, template]) => {
                  const IconComponent = template.icon
                  return (
                    <div
                      key={key}
                      onClick={() => {
                        setSelectedTemplate(key)
                        if (template.formats.includes('PDF')) {
                          setSelectedFormat('PDF')
                        } else {
                          setSelectedFormat(template.formats[0])
                        }
                      }}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedTemplate === key
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <IconComponent className={`h-5 w-5 ${
                            selectedTemplate === key ? 'text-blue-600' : 'text-gray-500'
                          }`} />
                          <h3 className={`font-semibold ${
                            selectedTemplate === key ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {template.name}
                          </h3>
                        </div>
                        {selectedTemplate === key && (
                          <CheckCircle className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <p className={`text-sm mb-3 ${
                        selectedTemplate === key ? 'text-blue-700' : 'text-gray-600'
                      }`}>
                        {template.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {template.formats.map(format => (
                          <Badge
                            key={format}
                            variant={selectedTemplate === key ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {format}
                          </Badge>
                        ))}
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          template.type === 'interactive' ? 'border-green-300 text-green-700' : 'border-blue-300 text-blue-700'
                        }`}
                      >
                        {template.type === 'interactive' ? 'Interactive' : 'Automated'}
                      </Badge>
                    </div>
                  )
                })}
              </div>
              </CardContent>
          </Card>
        </div>

        {/* Enhanced Report Options */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Export Configuration</CardTitle>
            <CardDescription>
              Configure your report parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Format Selection with PDF Support */}
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
                  <option key={format} value={format}>
                    {format} {format === 'PDF' ? '(Recommended)' : ''}
                  </option>
                ))}
              </select>
              {selectedFormat === 'PDF' && (
                <p className="text-xs text-blue-600 mt-1">
                  PDF format includes charts, formatted tables, and professional layout
                </p>
              )}
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
                <option value="current-week">Current Week</option>
                <option value="current-month">Current Month</option>
                <option value="current-quarter">Current Quarter</option>
                <option value="last-quarter">Last Quarter</option>
                <option value="current-year">Current Year</option>
                <option value="last-year">Last Year</option>
                <option value="ytd">Year to Date</option>
                <option value="all">All Time</option>
              </select>
            </div>

            {/* Template Info */}
            {currentTemplate && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Report Sections</h4>
                <div className="space-y-1">
                  {currentTemplate.sections.slice(0, 3).map((section, index) => (
                    <div key={section} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                      {section}
                    </div>
                  ))}
                  {currentTemplate.sections.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{currentTemplate.sections.length - 3} more sections
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGenerateReport}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating {selectedFormat}...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Generate {selectedFormat} Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Progress Reports Section */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Progress Reports Management</CardTitle>
              <CardDescription>
                Create, manage, and track progress reports for your projects
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowProgressReportModal(true)}
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizationData.projects.map(project => {
              const recentReports = project.progressReports || []
              const lastReport = recentReports[0]
              
              return (
                <div
                  key={project.id}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 line-clamp-1">
                        {project.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {project.methodology} • {project.status}
                      </p>
                    </div>
                    <Badge className={`ml-2 ${
                      project.metrics.overallHealth === 'GREEN' ? 'bg-green-100 text-green-800' :
                      project.metrics.overallHealth === 'YELLOW' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {project.metrics.overallHealth}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress:</span>
                      <span className="font-medium">{project.metrics.taskCompletionRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={project.metrics.taskCompletionRate} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>{recentReports.length} reports</span>
                    {lastReport && (
                      <span>Last: {formatDate(new Date(lastReport.createdAt))}</span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleCreateProgressReport(project)}
                      className="flex-1"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Create Report
                    </Button>
                    {recentReports.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {/* Navigate to project reports */}}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Project Selection for Reports */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">Project Filter</CardTitle>
              <CardDescription>
                Select specific projects to include in reports (optional)
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (selectedProjects.length === organizationData.projects.length) {
                  setSelectedProjects([])
                } else {
                  setSelectedProjects(organizationData.projects.map(p => p.id))
                }
              }}
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
                onClick={() => {
                  setSelectedProjects(prev => 
                    prev.includes(project.id)
                      ? prev.filter(id => id !== project.id)
                      : [...prev, project.id]
                  )
                }}
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
                    <div className="flex items-center mt-1 space-x-2">
                      <span className={`text-xs ${
                        selectedProjects.includes(project.id) ? 'text-blue-600' : 'text-gray-500'
                      }`}>
                        {project.metrics.taskCompletionRate.toFixed(1)}% complete
                      </span>
                      <Badge className={`text-xs ${
                        project.metrics.overallHealth === 'GREEN' ? 'bg-green-100 text-green-700' :
                        project.metrics.overallHealth === 'YELLOW' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {project.metrics.overallHealth}
                      </Badge>
                    </div>
                  </div>
                  {selectedProjects.includes(project.id) && (
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {selectedProjects.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>{selectedProjects.length}</strong> project{selectedProjects.length !== 1 ? 's' : ''} selected for reporting
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export History & Management */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Exports</CardTitle>
          <CardDescription>
            View and manage your recent report exports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Mock recent exports - replace with actual data */}
            {[
              {
                name: 'Executive Dashboard',
                format: 'PDF',
                date: new Date().toISOString(),
                size: '2.4 MB',
                projects: 5
              },
              {
                name: 'Project Performance Analysis',
                format: 'Excel',
                date: new Date(Date.now() - 86400000).toISOString(),
                size: '1.8 MB',
                projects: 3
              },
              {
                name: 'Financial Report',
                format: 'PDF',
                date: new Date(Date.now() - 172800000).toISOString(),
                size: '3.1 MB',
                projects: 8
              }
            ].map((export_, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded border">
                    {export_.format === 'PDF' ? (
                      <FileText className="h-4 w-4 text-red-600" />
                    ) : (
                      <BarChart3 className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{export_.name}</h4>
                    <p className="text-sm text-gray-500">
                      {export_.format} • {export_.size} • {export_.projects} projects • {formatDate(new Date(export_.date))}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="ghost">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progress Report Modal */}
      {showProgressReportModal && (
        <ProgressReportModal
          isOpen={showProgressReportModal}
          onClose={() => {
            setShowProgressReportModal(false)
            setSelectedProject(null)
          }}
          onSubmitted={handleProgressReportSubmitted}
          project={selectedProject || organizationData.projects[0]}
          organizationSlug={organizationSlug}
          userRole={userRole}
        />
      )}
    </div>
  )
}