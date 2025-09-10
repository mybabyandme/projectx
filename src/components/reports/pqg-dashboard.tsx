'use client'

import { useState } from 'react'
import { 
  Target, BarChart3, TrendingUp, AlertTriangle, 
  CheckCircle, Clock, MapPin, Building, Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

// PQG Priority definitions based on Mozambique government structure
const PQG_PRIORITIES = {
  'I': {
    name: 'DESENVOLVIMENTO DO CAPITAL HUMANO E SOCIAL',
    color: 'blue',
    description: 'Human capital development and social progress'
  },
  'II': {
    name: 'INFRAESTRUTURAS E DESENVOLVIMENTO SUSTENTÁVEL',
    color: 'green', 
    description: 'Infrastructure and sustainable development'
  },
  'III': {
    name: 'DESENVOLVIMENTO ECONÓMICO E COMPETITIVIDADE',
    color: 'purple',
    description: 'Economic development and competitiveness'
  },
  'IV': {
    name: 'BOA GOVERNAÇÃO, SEGURANÇA E ESTADO DE DIREITO',
    color: 'orange',
    description: 'Good governance, security and rule of law'
  }
}

// MBR Evaluation Criteria (based on uploaded files)
const MBR_CRITERIA = [
  { key: 'relevance', name: 'Relevância', description: 'Project relevance to objectives' },
  { key: 'efficiency', name: 'Eficiência', description: 'Resource utilization efficiency' },
  { key: 'effectiveness', name: 'Eficácia', description: 'Achievement of intended results' },
  { key: 'impact', name: 'Impacto', description: 'Long-term development impact' },
  { key: 'sustainability', name: 'Sustentabilidade', description: 'Long-term sustainability' },
  { key: 'coordination', name: 'Coordenação', description: 'Inter-institutional coordination' }
]

interface PQGDashboardProps {
  organizationSlug: string
  governmentProjects: Array<{
    id: string
    name: string
    status: string
    methodology: string
    metrics: {
      totalTasks: number
      completedTasks: number
      taskCompletionRate: number
      totalBudget: number
      spentBudget: number
      budgetUtilization: number
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
  }>
  reportingPeriod: string
  canExport: boolean
}

export default function PQGDashboard({
  organizationSlug,
  governmentProjects,
  reportingPeriod,
  canExport
}: PQGDashboardProps) {
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [selectedQuarter, setSelectedQuarter] = useState<string>('Q4')

  // Process PQG data by priorities
  const pqgAnalysis = Object.keys(PQG_PRIORITIES).reduce((acc, priority) => {
    const priorityProjects = governmentProjects.filter(p => 
      p.pqgData?.priority === priority
    )
    
    const priorityMetrics = priorityProjects.reduce((metrics, project) => ({
      projectCount: metrics.projectCount + 1,
      totalBudget: metrics.totalBudget + project.metrics.totalBudget,
      spentBudget: metrics.spentBudget + project.metrics.spentBudget,
      totalTasks: metrics.totalTasks + project.metrics.totalTasks,
      completedTasks: metrics.completedTasks + project.metrics.completedTasks,
      greenProjects: metrics.greenProjects + (project.metrics.overallHealth === 'GREEN' ? 1 : 0),
      yellowProjects: metrics.yellowProjects + (project.metrics.overallHealth === 'YELLOW' ? 1 : 0),
      redProjects: metrics.redProjects + (project.metrics.overallHealth === 'RED' ? 1 : 0),
    }), {
      projectCount: 0,
      totalBudget: 0,
      spentBudget: 0,
      totalTasks: 0,
      completedTasks: 0,
      greenProjects: 0,
      yellowProjects: 0,
      redProjects: 0,
    })

    return {
      ...acc,
      [priority]: {
        ...PQG_PRIORITIES[priority as keyof typeof PQG_PRIORITIES],
        projects: priorityProjects,
        metrics: priorityMetrics,
        completionRate: priorityMetrics.totalTasks > 0 ? (priorityMetrics.completedTasks / priorityMetrics.totalTasks) * 100 : 0,
        budgetUtilization: priorityMetrics.totalBudget > 0 ? (priorityMetrics.spentBudget / priorityMetrics.totalBudget) * 100 : 0,
      }
    }
  }, {} as any)

  // Calculate overall PQG performance
  const overallPQGMetrics = governmentProjects.reduce((acc, project) => ({
    totalProjects: acc.totalProjects + 1,
    totalBudget: acc.totalBudget + project.metrics.totalBudget,
    spentBudget: acc.spentBudget + project.metrics.spentBudget,
    totalTasks: acc.totalTasks + project.metrics.totalTasks,
    completedTasks: acc.completedTasks + project.metrics.completedTasks,
    greenProjects: acc.greenProjects + (project.metrics.overallHealth === 'GREEN' ? 1 : 0),
    yellowProjects: acc.yellowProjects + (project.metrics.overallHealth === 'YELLOW' ? 1 : 0),
    redProjects: acc.redProjects + (project.metrics.overallHealth === 'RED' ? 1 : 0),
  }), {
    totalProjects: 0,
    totalBudget: 0,
    spentBudget: 0,
    totalTasks: 0,
    completedTasks: 0,
    greenProjects: 0,
    yellowProjects: 0,
    redProjects: 0,
  })

  // Group projects by UGB (Unidade Gestora Beneficiária)
  const ugbGroups = governmentProjects.reduce((acc, project) => {
    const ugb = project.pqgData?.ugb || 'Não Especificado'
    if (!acc[ugb]) {
      acc[ugb] = []
    }
    acc[ugb].push(project)
    return acc
  }, {} as Record<string, typeof governmentProjects>)

  // Group projects by location (Province/District)
  const locationGroups = governmentProjects.reduce((acc, project) => {
    const location = project.pqgData?.location || 'Não Especificado'
    if (!acc[location]) {
      acc[location] = []
    }
    acc[location].push(project)
    return acc
  }, {} as Record<string, typeof governmentProjects>)

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'GREEN': return 'text-green-600 bg-green-100'
      case 'YELLOW': return 'text-yellow-600 bg-yellow-100'
      case 'RED': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      'blue': 'bg-blue-50 border-blue-200 text-blue-800',
      'green': 'bg-green-50 border-green-200 text-green-800',
      'purple': 'bg-purple-50 border-purple-200 text-purple-800',
      'orange': 'bg-orange-50 border-orange-200 text-orange-800',
    }
    return colors[priority as keyof typeof colors] || 'bg-gray-50 border-gray-200 text-gray-800'
  }

  const exportPQGReport = () => {
    // Generate PQG-specific report format
    const reportData = {
      reportTitle: `Relatório PQG - ${reportingPeriod}`,
      organizationSlug,
      generatedAt: new Date().toISOString(),
      quarter: selectedQuarter,
      overallMetrics: overallPQGMetrics,
      priorityAnalysis: pqgAnalysis,
      ugbBreakdown: Object.entries(ugbGroups).map(([ugb, projects]) => ({
        ugb,
        projectCount: projects.length,
        projects: projects.map(p => ({
          name: p.name,
          health: p.metrics.overallHealth,
          completion: p.metrics.taskCompletionRate,
          budget: p.metrics.budgetUtilization,
        }))
      })),
      locationBreakdown: Object.entries(locationGroups),
    }

    // Create CSV content in MBR format
    const csvContent = generateMBRCSV(reportData)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `relatorio-pqg-${organizationSlug}-${selectedQuarter}-${new Date().getFullYear()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const generateMBRCSV = (data: any) => {
    const headers = [
      'UGB',
      'Nome do Projecto',
      'Localização',
      'Prioridade PQG',
      'Programa',
      'Meta Física',
      'Real Alcançado',
      '% Execução',
      'Orçamento Alocado',
      'Orçamento Executado',
      '% Execução Orçamental',
      'Relevância',
      'Eficiência',
      'Eficácia',
      'Impacto',
      'Sustentabilidade',
      'Coordenação',
      'Avaliação Global'
    ]
    
    const rows = governmentProjects.map(project => [
      project.pqgData?.ugb || '',
      project.name,
      project.pqgData?.location || '',
      `Prioridade ${project.pqgData?.priority || ''}`,
      project.pqgData?.program || '',
      project.metrics.totalTasks,
      project.metrics.completedTasks,
      project.metrics.taskCompletionRate.toFixed(1) + '%',
      project.metrics.totalBudget,
      project.metrics.spentBudget,
      project.metrics.budgetUtilization.toFixed(1) + '%',
      // MBR criteria would be stored in project metadata in real implementation
      'Verde', // Placeholder - would come from actual evaluation
      'Verde',
      'Verde', 
      'Verde',
      'Verde',
      'Verde',
      project.metrics.overallHealth === 'GREEN' ? 'Verde' : 
      project.metrics.overallHealth === 'YELLOW' ? 'Amarelo' : 'Vermelho'
    ])
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
  }

  if (governmentProjects.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-12 text-center">
          <Target className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum Projeto Governamental</h3>
          <p className="text-gray-600 mb-4">
            Não há projetos configurados com dados do PQG. Configure projetos governamentais 
            para visualizar o painel de acompanhamento do Plano Quinquenal do Governo.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* PQG Header with Export */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Painel PQG - Plano Quinquenal do Governo</h2>
          <p className="mt-1 text-gray-600">
            Acompanhamento das prioridades e programas governamentais - {selectedQuarter} {new Date().getFullYear()}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <select
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Q1">1º Trimestre</option>
            <option value="Q2">2º Trimestre</option>
            <option value="Q3">3º Trimestre</option>
            <option value="Q4">4º Trimestre</option>
          </select>
          {canExport && (
            <Button onClick={exportPQGReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar MBR
            </Button>
          )}
        </div>
      </div>

      {/* Overall PQG Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Projetos Governamentais</p>
                <p className="text-3xl font-bold text-gray-900">{overallPQGMetrics.totalProjects}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Integrados com PQG
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Execução Física</p>
                <p className="text-3xl font-bold text-gray-900">
                  {overallPQGMetrics.totalTasks > 0 ? 
                    ((overallPQGMetrics.completedTasks / overallPQGMetrics.totalTasks) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {overallPQGMetrics.completedTasks} de {overallPQGMetrics.totalTasks} metas
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Execução Orçamental</p>
                <p className="text-3xl font-bold text-gray-900">
                  {overallPQGMetrics.totalBudget > 0 ? 
                    ((overallPQGMetrics.spentBudget / overallPQGMetrics.totalBudget) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              {formatCurrency(overallPQGMetrics.spentBudget)} executado
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avaliação MBR</p>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span className="text-lg font-bold text-green-600">{overallPQGMetrics.greenProjects}</span>
                  <span className="w-3 h-3 bg-yellow-500 rounded-full ml-2"></span>
                  <span className="text-lg font-bold text-yellow-600">{overallPQGMetrics.yellowProjects}</span>
                  <span className="w-3 h-3 bg-red-500 rounded-full ml-2"></span>
                  <span className="text-lg font-bold text-red-600">{overallPQGMetrics.redProjects}</span>
                </div>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Verde/Amarelo/Vermelho
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PQG Priorities Performance */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Desempenho por Prioridade PQG</CardTitle>
          <CardDescription>
            Análise do progresso por cada prioridade do Plano Quinquenal do Governo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Object.entries(pqgAnalysis).map(([priority, data]) => (
              <div key={priority} className={`p-6 rounded-lg border-2 ${getPriorityColor(data.color)}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">PRIORIDADE {priority}</h3>
                    <p className="text-sm mt-1">{data.name}</p>
                    <p className="text-xs mt-1 opacity-75">{data.description}</p>
                  </div>
                  <div className="flex items-center space-x-4 text-right">
                    <div>
                      <p className="text-2xl font-bold">{data.metrics.projectCount}</p>
                      <p className="text-xs">Projetos</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{data.completionRate.toFixed(1)}%</p>
                      <p className="text-xs">Execução</p>
                    </div>
                  </div>
                </div>

                {data.metrics.projectCount > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Execução Física</h4>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Meta: {data.metrics.totalTasks}</span>
                        <span className="text-sm">Real: {data.metrics.completedTasks}</span>
                      </div>
                      <div className="w-full bg-white rounded-full h-2">
                        <div 
                          className="bg-current h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(data.completionRate, 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="bg-white/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Execução Orçamental</h4>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Alocado: {formatCurrency(data.metrics.totalBudget)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Executado: {formatCurrency(data.metrics.spentBudget)}</span>
                        <span className="font-medium">{data.budgetUtilization.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="bg-white/50 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Avaliação MBR</h4>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>{data.metrics.greenProjects}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <span>{data.metrics.yellowProjects}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <span>{data.metrics.redProjects}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* UGB Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Por Unidade Gestora Beneficiária (UGB)</CardTitle>
            <CardDescription>
              Distribuição de projetos por instituição implementadora
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(ugbGroups).map(([ugb, projects]) => (
                <div key={ugb} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{ugb}</h4>
                    <p className="text-sm text-gray-600">{projects.length} projetos</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {projects.map(project => (
                      <div
                        key={project.id}
                        className={`w-3 h-3 rounded-full ${
                          project.metrics.overallHealth === 'GREEN' ? 'bg-green-500' :
                          project.metrics.overallHealth === 'YELLOW' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        title={project.name}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Por Localização Geográfica</CardTitle>
            <CardDescription>
              Distribuição de projetos por província/distrito
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(locationGroups).map(([location, projects]) => (
                <div key={location} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <div>
                      <h4 className="font-medium text-gray-900">{location}</h4>
                      <p className="text-sm text-gray-600">{projects.length} projetos</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {projects.map(project => (
                      <div
                        key={project.id}
                        className={`w-3 h-3 rounded-full ${
                          project.metrics.overallHealth === 'GREEN' ? 'bg-green-500' :
                          project.metrics.overallHealth === 'YELLOW' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        title={project.name}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MBR Evaluation Matrix */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Matriz de Avaliação MBR</CardTitle>
          <CardDescription>
            Avaliação detalhada dos projetos segundo critérios de Monitorização Baseada em Resultados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Projeto</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Localização</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">UGB</th>
                  {MBR_CRITERIA.map(criteria => (
                    <th key={criteria.key} className="text-center py-3 px-4 font-medium text-gray-900 text-xs">
                      {criteria.name}
                    </th>
                  ))}
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Avaliação Global</th>
                </tr>
              </thead>
              <tbody>
                {governmentProjects.map((project) => (
                  <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{project.name}</div>
                        <div className="text-sm text-gray-500">
                          Prioridade {project.pqgData?.priority || 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center text-sm">
                      {project.pqgData?.location || 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-center text-sm">
                      {project.pqgData?.ugb || 'N/A'}
                    </td>
                    {MBR_CRITERIA.map(criteria => (
                      <td key={criteria.key} className="py-4 px-4 text-center">
                        {/* In real implementation, these would come from actual evaluations */}
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          project.metrics.overallHealth === 'GREEN' ? 'bg-green-100 text-green-800' :
                          project.metrics.overallHealth === 'YELLOW' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {project.metrics.overallHealth === 'GREEN' ? 'Verde' :
                           project.metrics.overallHealth === 'YELLOW' ? 'Amarelo' : 'Vermelho'}
                        </span>
                      </td>
                    ))}
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        getHealthColor(project.metrics.overallHealth)
                      }`}>
                        {project.metrics.overallHealth === 'GREEN' ? 'Verde' :
                         project.metrics.overallHealth === 'YELLOW' ? 'Amarelo' : 'Vermelho'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
