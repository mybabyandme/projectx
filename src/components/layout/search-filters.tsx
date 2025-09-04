'use client'

import { ReactNode, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  X, 
  ChevronDown, 
  SlidersHorizontal,
  RefreshCw,
  Download,
  Plus,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FilterOption {
  value: string
  label: string
  count?: number
}

export interface FilterConfig {
  key: string
  label: string
  type: 'select' | 'multiselect' | 'date' | 'daterange'
  options?: FilterOption[]
  placeholder?: string
  value?: string | string[] | Date | { start: Date; end: Date }
}

export interface SortOption {
  value: string
  label: string
}

export interface SearchFiltersProps {
  // Search
  searchQuery: string
  setSearchQuery: (query: string) => void
  searchPlaceholder?: string
  
  // Filters
  filters: FilterConfig[]
  onFilterChange: (key: string, value: any) => void
  
  // Sorting
  sortOptions: SortOption[]
  sortBy: string
  setSortBy: (sort: string) => void
  sortOrder?: 'asc' | 'desc'
  setSortOrder?: (order: 'asc' | 'desc') => void
  
  // Results info
  totalCount?: number
  filteredCount?: number
  
  // Actions
  onRefresh?: () => void
  onExport?: () => void
  onClearFilters?: () => void
  primaryAction?: {
    label: string
    icon?: ReactNode
    onClick: () => void
  }
  
  // Loading states
  isLoading?: boolean
  isRefreshing?: boolean
  isExporting?: boolean
  
  // Additional props
  className?: string
  compactMode?: boolean
}
export default function SearchFilters({
  searchQuery,
  setSearchQuery,
  searchPlaceholder = 'Search...',
  filters,
  onFilterChange,
  sortOptions,
  sortBy,
  setSortBy,
  sortOrder = 'desc',
  setSortOrder,
  totalCount,
  filteredCount,
  onRefresh,
  onExport,
  onClearFilters,
  primaryAction,
  isLoading = false,
  isRefreshing = false,
  isExporting = false,
  className,
  compactMode = false
}: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)

  const activeFiltersCount = filters.filter(filter => {
    const value = filter.value
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'string') return value !== ''
    if (value instanceof Date) return true
    if (value && typeof value === 'object' && 'start' in value) return true
    return false
  }).length

  const hasActiveFilters = activeFiltersCount > 0 || searchQuery.length > 0
  const isAnyActionLoading = isRefreshing || isExporting || isLoading

  const renderFilter = (filter: FilterConfig) => {
    switch (filter.type) {
      case 'select':
        return (
          <div key={filter.key}>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {filter.label}
            </label>
            <select
              value={(filter.value as string) || ''}
              onChange={(e) => onFilterChange(filter.key, e.target.value)}
              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{filter.placeholder || `All ${filter.label}`}</option>
              {filter.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                  {option.count !== undefined && ` (${option.count})`}
                </option>
              ))}
            </select>
          </div>
        )
      
      case 'multiselect':
        const selectedValues = (filter.value as string[]) || []
        return (
          <div key={filter.key}>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {filter.label}
            </label>
            <button
              onClick={() => {/* TODO: Implement dropdown */}}
              className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white text-left focus:ring-1 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
            >
              <span className="truncate">
                {selectedValues.length > 0 
                  ? `${selectedValues.length} selected` 
                  : filter.placeholder || filter.label
                }
              </span>
              <ChevronDown className="h-3 w-3 text-gray-400" />
            </button>
          </div>
        )
      
      default:
        return null
    }
  }
  return (
    <div className={cn("bg-white border border-gray-200 rounded-lg", className)}>
      {/* Main Filter Row */}
      <div className="p-3">
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-0.5 rounded-full hover:bg-gray-100"
              >
                <X className="h-3 w-3 text-gray-400" />
              </button>
            )}
          </div>

          {/* Quick Sort - Desktop */}
          <div className="hidden sm:block">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              </button>
            )}

            {onExport && (
              <button
                onClick={onExport}
                disabled={isExporting}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                title="Export"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </button>
            )}

            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors"
              >
                {primaryAction.icon || <Plus className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{primaryAction.label}</span>
              </button>
            )}

            {/* More Filters Button */}
            {filters.length > 0 && (
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors relative",
                  showFilters || activeFiltersCount > 0
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1 min-w-4 h-4 flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        {(totalCount !== undefined || filteredCount !== undefined) && (
          <div className="mt-2 flex items-center justify-between">
            <div className="text-xs text-gray-600">
              {filteredCount !== undefined && totalCount !== undefined ? (
                <>
                  <span className="font-medium">{filteredCount.toLocaleString()}</span>
                  {filteredCount !== totalCount && (
                    <span> of {totalCount.toLocaleString()}</span>
                  )}
                  <span> {filteredCount === 1 ? 'result' : 'results'}</span>
                </>
              ) : totalCount !== undefined ? (
                <>
                  <span className="font-medium">{totalCount.toLocaleString()}</span>
                  <span> {totalCount === 1 ? 'result' : 'results'}</span>
                </>
              ) : null}
            </div>

            {hasActiveFilters && onClearFilters && (
              <button
                onClick={onClearFilters}
                className="text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Expandable Filters */}
      <AnimatePresence>
        {showFilters && filters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-gray-100"
          >
            <div className="p-3 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filters.map(renderFilter)}

                {/* Mobile Sort */}
                <div className="sm:hidden">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && onClearFilters && (
                  <div className="flex items-end">
                    <button
                      onClick={onClearFilters}
                      className="w-full px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <X className="h-3 w-3 inline mr-1" />
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}        