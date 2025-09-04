'use client'

import { ReactNode, useState } from 'react'
import { ArrowLeft, RefreshCw, ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StatItem {
  icon: ReactNode
  value: string | number
  label: string
  description?: string
  trend?: {
    value: number
    label: string
    direction: 'up' | 'down' | 'neutral'
  }
}

export interface Action {
  label: string
  onClick: () => void
  variant: 'primary' | 'secondary'
  icon?: ReactNode
  loading?: boolean
}

interface StatsHeaderProps {
  title: string
  subtitle?: string
  stats: StatItem[]
  actions?: ReactNode | Action[]
  onRefresh?: () => void
  loading?: boolean
  showBackButton?: boolean
  onBack?: () => void
  backLabel?: string
  collapsible?: boolean
  defaultCollapsed?: boolean
  className?: string
}
export default function StatsHeader({
  title,
  subtitle,
  stats,
  actions,
  onRefresh,
  loading,
  showBackButton = false,
  onBack,
  backLabel,
  collapsible = true,
  defaultCollapsed = false,
  className
}: StatsHeaderProps) {
  const [isStatsCollapsed, setIsStatsCollapsed] = useState(defaultCollapsed)

  const formatValue = (value: string | number): string => {
    if (typeof value === 'number') {
      return value.toLocaleString()
    }
    return value
  }

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (typeof window !== 'undefined') {
      window.history.back()
    }
  }

  const renderActions = () => {
    if (!actions) return null
    
    // Handle array of Action objects
    if (Array.isArray(actions)) {
      return (
        <div className="flex items-center gap-1.5">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <button
                key={index}
                onClick={action.onClick}
                disabled={action.loading || loading}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-lg transition-colors",
                  action.variant === 'primary'
                    ? 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:opacity-50'
                )}
              >
                {action.loading ? (
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  Icon && <Icon className="h-3.5 w-3.5" />
                )}
                <span className="hidden sm:inline">{action.label}</span>
              </button>
            )
          })}
        </div>
      )
    }
    
    // Handle ReactNode
    return actions
  }

  const getTrendColor = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up': return '↗'
      case 'down': return '↘'
      default: return '→'
    }
  }

  return (
    <div className={cn("bg-white border-b border-gray-200", className)}>
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header Section - Compact */}
        <div className="py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Back Button */}
              {showBackButton && (
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group flex-shrink-0"
                  title={backLabel || 'Back'}
                >
                  <div className="p-1 rounded-md group-hover:bg-gray-100 transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                  </div>
                  <span className="hidden lg:inline text-sm font-medium">
                    {backLabel || 'Back'}
                  </span>
                </button>
              )}
              
              {/* Title and Subtitle */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{title}</h1>
                  
                  {/* Mobile Stats Toggle */}
                  {collapsible && stats.length > 0 && (
                    <button
                      onClick={() => setIsStatsCollapsed(!isStatsCollapsed)}
                      className="sm:hidden p-1 rounded-md hover:bg-gray-100 transition-colors"
                      title={isStatsCollapsed ? 'Show stats' : 'Hide stats'}
                    >
                      {isStatsCollapsed ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                  )}
                </div>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">{subtitle}</p>
                )}
              </div>
            </div>
            
            {/* Actions - Compact */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                  title="Refresh"
                >
                  <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                  <span className="hidden md:inline">Refresh</span>
                </button>
              )}
              {renderActions()}
            </div>
          </div>
        </div>

        {/* Compact Stats Section */}
        {stats.length > 0 && (
          <div className={cn(
            "transition-all duration-200 ease-in-out overflow-hidden",
            "sm:block", // Always show on desktop
            isStatsCollapsed ? "hidden" : "block" // Collapsible on mobile
          )}>
            <div className="pb-3 sm:pb-4">
              {/* Mobile: Horizontal scrollable single row */}
              <div className="sm:hidden">
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  {stats.map((stat, index) => (
                    <div key={index} className="flex-shrink-0 text-center p-2 bg-gray-50 rounded-lg min-w-[80px]">
                      <div className="text-gray-600 mb-1 flex justify-center">
                        {stat.icon}
                      </div>
                      <p className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                        {formatValue(stat.value)}
                      </p>
                      <p className="text-xs text-gray-600 truncate">{stat.label}</p>
                      {stat.trend && (
                        <div className={cn("text-xs mt-1", getTrendColor(stat.trend.direction))}>
                          {getTrendIcon(stat.trend.direction)} {stat.trend.value}%
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop: Responsive grid */}
              <div className="hidden sm:grid gap-3 lg:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-gray-600 mb-2 flex justify-center">
                      {stat.icon}
                    </div>
                    <p className="text-base lg:text-lg font-semibold text-gray-900 mb-1">
                      {formatValue(stat.value)}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">{stat.label}</p>
                    {stat.description && (
                      <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                    )}
                    {stat.trend && (
                      <div className={cn("text-xs mt-2 font-medium", getTrendColor(stat.trend.direction))}>
                        {getTrendIcon(stat.trend.direction)} {stat.trend.value}% {stat.trend.label}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}