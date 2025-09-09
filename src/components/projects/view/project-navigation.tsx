'use client'

import { useState } from 'react'
import { ChevronDown, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProjectNavigationProps {
  tabs: Array<{
    id: string
    label: string
    icon: any
    description: string
  }>
  activeTab: string
  onTabChange: (tabId: string) => void
  isMobile: boolean
  isOpen?: boolean
  onToggle?: () => void
}

export default function ProjectNavigation({
  tabs,
  activeTab,
  onTabChange,
  isMobile,
  isOpen = false,
  onToggle
}: ProjectNavigationProps) {
  if (isMobile) {
    return (
      <div className="relative">
        {/* Mobile Tab Selector */}
        <Button
          variant="outline"
          onClick={onToggle}
          className="w-full justify-between mb-4"
        >
          <div className="flex items-center">
            {(() => {
              const activeTabData = tabs.find(tab => tab.id === activeTab)
              const Icon = activeTabData?.icon
              return (
                <>
                  {Icon && <Icon className="h-4 w-4 mr-2" />}
                  {activeTabData?.label}
                </>
              )
            })()}
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>

        {/* Mobile Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-lg mb-4">
            <div className="p-2 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = tab.id === activeTab
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                      <div>
                        <div className="font-medium">{tab.label}</div>
                        <div className="text-sm text-gray-500">{tab.description}</div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Desktop Navigation
  return (
    <nav className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Project Navigation</h3>
      <div className="space-y-2">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = tab.id === activeTab
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-50 border border-transparent'
              }`}
            >
              <div className="flex items-start">
                <Icon className={`h-5 w-5 mr-3 mt-0.5 flex-shrink-0 ${
                  isActive ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                    {tab.label}
                  </div>
                  <div className={`text-sm mt-1 ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {tab.description}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
        <div className="space-y-2">
          <Button variant="outline" size="sm" className="w-full justify-start text-sm">
            Add Task
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start text-sm">
            Create Report
          </Button>
          <Button variant="outline" size="sm" className="w-full justify-start text-sm">
            Export Data
          </Button>
        </div>
      </div>
    </nav>
  )
}
