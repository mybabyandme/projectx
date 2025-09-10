'use client'

import { useState } from 'react'
import { 
  Building, MapPin, Target, BarChart3, TrendingUp,
  CheckCircle, AlertTriangle, Calendar, Download,
  Flag, Globe, Users, DollarSign
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'

interface ProjectPQGDashboardProps {
  project: any
  organizationSlug: string
  userRole: string
  canEdit: boolean
}

// PQG Priority definitions
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

// MBR Evaluation Criteria
const MBR_CRITERIA = [
  { key: 'relevance', name: 'Relevância', description: 'Project relevance to objectives' },
  { key: 'efficiency', name: 'Eficiência', description: 'Resource utilization efficiency' },
  { key: 'effectiveness', name: 'Eficácia', description: 'Achievement of intended results' },
  { key: 'impact', name: 'Impacto', description: 'Long-term development impact' },
  { key: 'sustainability', name: 'Sustentabilidade', description: 'Long-term sustainability' },
  { key: 'coordination', name: 'Coordenação', description: 'Inter-institutional coordination' }
]

export default function ProjectPQGDashboard({
  project,
  organizationSlug,
  userRole,
  canEdit
}: ProjectPQGDashboardProps) {
  const [selectedQuarter, setSelectedQuarter] = useState('Q4')
  const [mbrView, setMbrView] = useState('overview')

  const pqgData = project.pqgData || {}
  const metrics = project.metrics || {}
  const priority = PQG_PRIORITIES[pqgData.priority as keyof typeof PQG_PRIORITIES]

  // Calculate MBR scores (in real implementation, these would come from evaluations)
  const calculateMBRScore = (criterion: string) => {
    // Derive scores from project metrics
    switch (criterion) {
      case 'relevance':
      case 'impact':
        return metrics.overallHealth === 'GREEN' ? 85 : 
               metrics.overallHealth === 'YELLOW' ? 65 : 45
      case 'efficiency':
        return Math.min(100 - (metrics.budgetUtilization || 0), 100)
      case 'effectiveness':
        return metrics.taskCompletionRate || 0
      case 'sustainability':
        return metrics.overdueTasks === 0 ? 90 : 70
      case 'coordination':
        return project.progressReports?.length > 0 ? 80 : 60
      default:
        return 75
    }
  }

  const getMBRRating = (score: number) => {
    if (score >= 75) return { rating: 'Verde', color: 'text-green-600 bg-green-100' }
    if (score >= 50) return { rating: 'Amarelo', color: 'text-yellow-600 bg-yellow-100' }
    return { rating: 'Vermelho', color: 'text-red-600 bg-red-100' }
  }

  const getOverallMBRRating = () => {
    const scores = MBR_CRITERIA.map(criterion => calculateMBRScore(criterion.key))
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
    return getMBRRating(averageScore)
  }

  const getPriorityColor = (priority: any) => {
    if (!priority) return 'bg-gray-50 border-gray-200 text-gray-800'
    
    const colors = {
      'blue': 'bg-blue-50 border-blue-200 text-blue-800',
      'green': 'bg-green-50 border-green-200 text-green-800',
      'purple': 'bg-purple-50 border-purple-200 text-purple-800',
      'orange': 'bg-orange-50 border-orange-200 text-orange-800',
    }
    return colors[priority.color as keyof typeof colors] || 'bg-gray-50 border-gray-200 text-gray-800'
  }

  const overallMBR = getOverallMBRRating()

  const exportPQGReport = () => {
    // Generate PQG-specific report
    const reportData = {
      projectName: project.name,
      pqgPriority: pqgData.priority,
      ugb: pqgData.ugb,
      location: pqgData.location,
      program: pqgData.program,
      quarter: selectedQuarter,
      year: new Date().getFullYear(),
      physicalExecution: metrics.taskCompletionRate || 0,
      budgetExecution: metrics.budgetUtilization || 0,
      mbrEvaluation: MBR_CRITERIA.map(criterion => ({
        criterion: criterion.name,
        score: calculateMBRScore(criterion.key),
        rating: getMBRRating(calculateMBRScore(criterion.key)).rating
      })),
      overallRating: overallMBR.rating
    }

    // Create CSV content
    const csvContent = generatePQGCSV(reportData)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `relatorio-pqg-${project.name.toLowerCase().replace(/\s+/g, '-')}-${selectedQuarter}-${new Date().getFullYear()}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  const generatePQGCSV = (data: any) => {
    const headers = [
      'Nome do Projecto',
      'Prioridade PQG',
      'UGB',
      'Localização',
      'Programa',
      'Trimestre',
      'Ano',
      'Execução Física (%)',
      'Execução Orçamental (%)',
      'Relevância',
      'Eficiência',
      'Eficácia',
      'Impacto',
      'Sustentabilidade',
      'Coordenação',
      'Avaliação Global MBR'
    ]
    
    const row = [
      data.projectName,
      `Prioridade ${data.pqgPriority}`,
      data.ugb || 'N/A',
      data.location || 'N/A',
      data.program || 'N/A',
      data.quarter,
      data.year,
      data.physicalExecution.toFixed(1),
      data.budgetExecution.toFixed(1),
      ...data.mbrEvaluation.map((evaluation: any) => evaluation.rating),
      data.overallRating
    ]
    
    return [headers.join(','), row.join(',')].join('\n')
  }

  if (!pqgData.priority) {
    return (
      <div className="p-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">PQG Configuration Required</h3>
            <p className="text-gray-600 mb-4">
              This project is not configured for PQG tracking. Configure government project settings 
              to enable PQG monitoring and MBR evaluation.
            </p>
            {canEdit && (
              <Button>
                Configure PQG Settings
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* PQG Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Painel PQG - Plano Quinquenal do Governo</h2>
          <p className="mt-1 text-gray-600">
            Acompanhamento de prioridades governamentais e avaliação MBR
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
          <Button onClick={exportPQGReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar MBR
          </Button>
        </div>
      </div>

      {/* PQG Priority Information */}
      {priority && (
        <Card className={`border-2 ${getPriorityColor(priority)}`}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <Flag className="h-5 w-5 mr-2" />
                  <h3 className="text-lg font-semibold">PRIORIDADE {pqgData.priority}</h3>
                </div>
                <p className="text-sm font-medium mb-1">{priority.name}</p>
                <p className="text-xs opacity-75">{priority.description}</p>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${overallMBR.color}`}>
                  {overallMBR.rating}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Context Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Building className="h-5 w-5 text-blue-600 mr-2" />
              <h4 className="font-medium text-gray-900">Unidade Gestora Beneficiária</h4>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {pqgData.ugb || 'Não especificado'}
            </p>
            <p className="text-sm text-gray-600">Instituição implementadora</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <MapPin className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="font-medium text-gray-900">Localização</h4>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {pqgData.location || 'Não especificado'}
            </p>
            <p className="text-sm text-gray-600">Província/Distrito</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Target className="h-5 w-5 text-purple-600 mr-2" />
              <h4 className="font-medium text-gray-900">Programa</h4>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {pqgData.program || 'Não especificado'}
            </p>
            <p className="text-sm text-gray-600">Código e nome do programa</p>
          </CardContent>
        </Card>
      </div>

      {/* Execution Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Execução Física</CardTitle>
            <CardDescription>
              Progresso na implementação das actividades do projecto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Meta Física</span>
                <span className="text-2xl font-bold text-blue-600">
                  {(metrics.taskCompletionRate || 0).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(metrics.taskCompletionRate || 0, 100)}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Plano:</span>
                  <span className="font-medium ml-1">{metrics.totalTasks || 0} tarefas</span>
                </div>
                <div>
                  <span className="text-gray-600">Real:</span>
                  <span className="font-medium ml-1">{metrics.completedTasks || 0} tarefas</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Execução Orçamental</CardTitle>
            <CardDescription>
              Utilização do orçamento alocado para o projecto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Execução Orçamental</span>
                <span className="text-2xl font-bold text-green-600">
                  {(metrics.budgetUtilization || 0).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(metrics.budgetUtilization || 0, 100)}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Alocado:</span>
                  <span className="font-medium ml-1">{formatCurrency(metrics.totalBudget || 0)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Executado:</span>
                  <span className="font-medium ml-1">{formatCurrency(metrics.spentBudget || 0)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* MBR Evaluation Matrix */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Matriz de Avaliação MBR</CardTitle>
          <CardDescription>
            Monitorização Baseada em Resultados - Avaliação segundo os seis critérios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MBR_CRITERIA.map(criterion => {
              const score = calculateMBRScore(criterion.key)
              const rating = getMBRRating(score)

              return (
                <div key={criterion.key} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{criterion.name}</h4>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${rating.color}`}>
                      {rating.rating}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{criterion.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Pontuação:</span>
                      <span className="font-medium">{score.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          score >= 75 ? 'bg-green-500' :
                          score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(score, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* PQG Indicators */}
      {pqgData.indicators && pqgData.indicators.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Indicadores PQG</CardTitle>
            <CardDescription>
              Indicadores específicos alinhados com as metas do PQG
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pqgData.indicators.map((indicator: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{indicator.name}</h4>
                    <p className="text-sm text-gray-600">{indicator.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {indicator.achieved}/{indicator.target} {indicator.unit}
                    </div>
                    <div className="text-sm text-gray-600">
                      {((indicator.achieved / indicator.target) * 100).toFixed(1)}% alcançado
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary and Observations */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Resumo e Observações</CardTitle>
          <CardDescription>
            Análise geral do desempenho do projecto no contexto PQG
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Pontos Fortes</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                {metrics.taskCompletionRate > 75 && (
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Boa execução física das actividades
                  </li>
                )}
                {metrics.budgetUtilization < 90 && (
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Controlo orçamental adequado
                  </li>
                )}
                {metrics.overdueTasks === 0 && (
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    Cumprimento dos prazos estabelecidos
                  </li>
                )}
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Alinhamento com prioridade {pqgData.priority} do PQG
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Áreas de Melhoria</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                {metrics.taskCompletionRate < 60 && (
                  <li className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                    Acelerar implementação das actividades
                  </li>
                )}
                {metrics.budgetUtilization > 90 && (
                  <li className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                    Monitorar de perto a execução orçamental
                  </li>
                )}
                {metrics.overdueTasks > 0 && (
                  <li className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                    Resolver {metrics.overdueTasks} tarefas em atraso
                  </li>
                )}
                {!project.progressReports || project.progressReports.length === 0 && (
                  <li className="flex items-center">
                    <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                    Melhorar frequência de relatórios de progresso
                  </li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
