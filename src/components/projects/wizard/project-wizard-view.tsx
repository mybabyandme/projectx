'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Save, CheckCircle, Circle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { ProjectWizardData, projectWizardSchema } from '@/lib/project-wizard-schemas'
import ProjectBasicsForm from './project-basics-form'
import ProjectCharterForm from './project-charter-form'
import StakeholderMatrix from './stakeholder-matrix'
import RiskAssessment from './risk-assessment'
import ProjectSummary from './project-summary'

interface ProjectWizardViewProps {
  organizationSlug: string
}

const WIZARD_STEPS = [
  {
    id: 'basics',
    title: 'Project Basics',
    description: 'Define project fundamentals and select template',
    icon: Circle,
  },
  {
    id: 'charter',
    title: 'Project Charter',
    description: 'Create vision, objectives, and deliverables',
    icon: Circle,
  },
  {
    id: 'stakeholders',
    title: 'Stakeholders',
    description: 'Identify key stakeholders and responsibilities',
    icon: Circle,
  },
  {
    id: 'risks',
    title: 'Risk Assessment',
    description: 'Identify and plan risk mitigation',
    icon: Circle,
  },
  {
    id: 'summary',
    title: 'Review & Create',
    description: 'Review and finalize project creation',
    icon: Circle,
  },
]

export default function ProjectWizardView({ organizationSlug }: ProjectWizardViewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null)

  // Wizard data state
  const [wizardData, setWizardData] = useState<Partial<ProjectWizardData>>({
    basics: undefined,
    charter: undefined,
    stakeholders: undefined,
    risks: undefined,
  })

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (Object.keys(wizardData).some(key => wizardData[key as keyof ProjectWizardData])) {
        saveToLocalStorage()
        setLastAutoSave(new Date())
      }
    }, 30000) // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval)
  }, [wizardData])

  // Load from localStorage on mount
  useEffect(() => {
    loadFromLocalStorage()
  }, [])

  const saveToLocalStorage = () => {
    try {
      localStorage.setItem(`project-wizard-${organizationSlug}`, JSON.stringify(wizardData))
    } catch (error) {
      console.error('Failed to save wizard data:', error)
    }
  }

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem(`project-wizard-${organizationSlug}`)
      if (saved) {
        const data = JSON.parse(saved)
        setWizardData(data)
        
        // Mark completed steps
        const completed = new Set<number>()
        if (data.basics) completed.add(0)
        if (data.charter) completed.add(1)
        if (data.stakeholders) completed.add(2)
        if (data.risks) completed.add(3)
        setCompletedSteps(completed)
      }
    } catch (error) {
      console.error('Failed to load wizard data:', error)
    }
  }

  const clearLocalStorage = () => {
    try {
      localStorage.removeItem(`project-wizard-${organizationSlug}`)
    } catch (error) {
      console.error('Failed to clear wizard data:', error)
    }
  }

  const updateWizardData = (stepKey: keyof ProjectWizardData, data: any) => {
    setWizardData(prev => ({
      ...prev,
      [stepKey]: data,
    }))
    
    // Mark step as completed
    setCompletedSteps(prev => new Set(prev).add(currentStep))
  }

  const validateCurrentStep = (): boolean => {
    const stepKey = WIZARD_STEPS[currentStep].id as keyof ProjectWizardData
    const stepData = wizardData[stepKey]

    if (!stepData) return false

    try {
      switch (stepKey) {
        case 'basics':
          projectWizardSchema.shape.basics.parse(stepData)
          break
        case 'charter':
          projectWizardSchema.shape.charter.parse(stepData)
          break
        case 'stakeholders':
          projectWizardSchema.shape.stakeholders.parse(stepData)
          break
        case 'risks':
          projectWizardSchema.shape.risks.parse(stepData)
          break
        default:
          return true
      }
      return true
    } catch (error) {
      console.error('Validation error:', error)
      return false
    }
  }

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      if (validateCurrentStep() || currentStep === WIZARD_STEPS.length - 1) {
        setCurrentStep(prev => prev + 1)
        saveToLocalStorage()
      } else {
        toast({
          title: 'Validation Error',
          description: 'Please complete all required fields before proceeding.',
          variant: 'destructive',
        })
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    // Allow navigation to any step, but validate current step first
    if (stepIndex <= currentStep || completedSteps.has(stepIndex - 1)) {
      setCurrentStep(stepIndex)
    }
  }

  const handleSaveAsDraft = async () => {
    setIsLoading(true)
    try {
      // TODO: Save draft to backend
      saveToLocalStorage()
      toast({
        title: 'Draft Saved',
        description: 'Your project draft has been saved successfully.',
      })
    } catch (error) {
      toast({
        title: 'Save Failed',
        description: 'Failed to save draft. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateProject = async () => {
    // Validate all steps
    try {
      const validatedData = projectWizardSchema.parse(wizardData)
      setIsLoading(true)

      // TODO: Submit to backend API
      const response = await fetch(`/api/organizations/${organizationSlug}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      })

      if (response.ok) {
        const project = await response.json()
        clearLocalStorage()
        toast({
          title: 'Project Created',
          description: 'Your project has been created successfully!',
        })
        router.push(`/${organizationSlug}/projects/${project.id}`)
      } else {
        throw new Error('Failed to create project')
      }
    } catch (error) {
      console.error('Create project error:', error)
      toast({
        title: 'Creation Failed',
        description: 'Failed to create project. Please check all fields and try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <ProjectBasicsForm
            data={wizardData.basics}
            onUpdate={(data) => updateWizardData('basics', data)}
          />
        )
      case 1:
        return (
          <ProjectCharterForm
            data={wizardData.charter}
            projectBasics={wizardData.basics}
            onUpdate={(data) => updateWizardData('charter', data)}
          />
        )
      case 2:
        return (
          <StakeholderMatrix
            data={wizardData.stakeholders}
            projectBasics={wizardData.basics}
            onUpdate={(data) => updateWizardData('stakeholders', data)}
          />
        )
      case 3:
        return (
          <RiskAssessment
            data={wizardData.risks}
            projectBasics={wizardData.basics}
            onUpdate={(data) => updateWizardData('risks', data)}
          />
        )
      case 4:
        return (
          <ProjectSummary
            wizardData={wizardData as ProjectWizardData}
            onCreateProject={handleCreateProject}
            isLoading={isLoading}
          />
        )
      default:
        return null
    }
  }

  const getStepIcon = (stepIndex: number) => {
    if (completedSteps.has(stepIndex)) {
      return CheckCircle
    } else if (stepIndex === currentStep) {
      return AlertCircle
    } else {
      return Circle
    }
  }

  const getStepIconColor = (stepIndex: number) => {
    if (completedSteps.has(stepIndex)) {
      return 'text-green-600'
    } else if (stepIndex === currentStep) {
      return 'text-blue-600'
    } else {
      return 'text-gray-400'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back to Projects</span>
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Create New Project</h1>
                <p className="text-sm text-gray-500">
                  Step {currentStep + 1} of {WIZARD_STEPS.length}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {lastAutoSave && (
                <span className="text-xs text-gray-500">
                  Last saved: {lastAutoSave.toLocaleTimeString()}
                </span>
              )}
              <Button
                variant="outline"
                onClick={handleSaveAsDraft}
                disabled={isLoading}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Step Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {WIZARD_STEPS.map((step, index) => {
                const Icon = getStepIcon(index)
                const isActive = index === currentStep
                const isCompleted = completedSteps.has(index)
                const isClickable = index <= currentStep || completedSteps.has(index - 1)

                return (
                  <button
                    key={step.id}
                    onClick={() => isClickable && handleStepClick(index)}
                    disabled={!isClickable}
                    className={`w-full text-left p-4 rounded-lg border transition-colors ${
                      isActive
                        ? 'bg-blue-50 border-blue-200 text-blue-900'
                        : isCompleted
                        ? 'bg-green-50 border-green-200 text-green-900'
                        : isClickable
                        ? 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-5 w-5 ${getStepIconColor(index)}`} />
                      <div className="flex-1">
                        <h3 className="font-medium">{step.title}</h3>
                        <p className="text-sm opacity-75">{step.description}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Step Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {WIZARD_STEPS[currentStep].title}
                </h2>
                <p className="text-gray-600 mt-1">
                  {WIZARD_STEPS[currentStep].description}
                </p>
              </div>

              <div className="p-6">
                {renderCurrentStep()}
              </div>

              {/* Navigation Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center space-x-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>

                {currentStep === WIZARD_STEPS.length - 1 ? (
                  <Button
                    onClick={handleCreateProject}
                    disabled={isLoading}
                    className="flex items-center space-x-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>{isLoading ? 'Creating...' : 'Create Project'}</span>
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="flex items-center space-x-2"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}