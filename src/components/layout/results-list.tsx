'use client'

import { ReactNode, useState } from 'react'
import { ChevronLeft, ChevronRight, MoreVertical, Grid, List, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn, formatDate } from '@/lib/utils'

export interface ResultField {
  key: string
  label: string
  type?: 'text' | 'badge' | 'date' | 'avatar' | 'custom' | 'number' | 'progress'
  primary?: boolean
  hideOnMobile?: boolean
  render?: (value: any, item: any) => ReactNode
  className?: string
}

export interface ResultAction {
  key: string
  label: string
  icon?: ReactNode
  onClick: (item: any) => void
  variant?: 'default' | 'danger' | 'primary'
  disabled?: boolean | ((item: any) => boolean)
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ResultsListProps {
  items: any[]
  fields: ResultField[]
  viewMode?: 'compact' | 'detailed' | 'grid'
  onViewModeChange?: (mode: 'compact' | 'detailed' | 'grid') => void
  actions?: ResultAction[]
  primaryAction?: ResultAction
  selectable?: boolean
  selectedItems?: string[]
  onSelectionChange?: (selectedItems: string[]) => void
  getItemId?: (item: any) => string
  pagination?: PaginationInfo
  onPageChange?: (page: number) => void
  onLimitChange?: (limit: number) => void
  isLoading?: boolean
  loadingStates?: Record<string, boolean>
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: {
    label: string
    onClick: () => void
  }
  className?: string
  itemClassName?: string | ((item: any) => string)
  compact?: boolean
  onItemClick?: (item: any) => void
  clickable?: boolean
  showViewToggle?: boolean
}

export default function ResultsList({
  items = [],
  fields = [],
  viewMode = 'compact',
  onViewModeChange,
  actions = [],
  primaryAction,
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  getItemId = (item) => item?.id || Math.random().toString(),
  pagination,
  onPageChange,
  onLimitChange,
  isLoading = false,
  loadingStates = {},
  emptyTitle = 'No results found',
  emptyDescription = 'No items match your current criteria.',
  emptyAction,
  className,
  itemClassName,
  compact = false,
  onItemClick,
  clickable = false,
  showViewToggle = false
}: ResultsListProps) {
  
  // Early safety checks
  if (!Array.isArray(items)) {
    console.warn('ResultsList: items prop must be an array')
    return <div className="text-center py-4 text-red-600">Invalid data provided to ResultsList</div>
  }

  if (!Array.isArray(fields) || fields.length === 0) {
    console.warn('ResultsList: fields prop must be a non-empty array')
    return <div className="text-center py-4 text-red-600">No fields configured for ResultsList</div>
  }

  // Get primary field for compact display
  const primaryField = fields.find(f => f && f.primary) || fields[0]
  const secondaryFields = fields.filter(f => f && f !== primaryField && !f.hideOnMobile).slice(0, 2)

  const formatFieldValue = (field: ResultField, value: any, item: any) => {
    // Safety checks
    if (!field) return '-'
    
    // Use custom render function if provided
    if (field.render) {
      try {
        return field.render(value, item)
      } catch (error) {
        console.warn('Error in field render function:', error)
        return '-'
      }
    }

    // Handle different field types
    switch (field.type) {
      case 'date':
        return value ? formatDate(value) : '-'
      
      case 'badge':
        if (typeof value === 'object' && value?.text) {
          return (
            <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', value.color)}>
              {value.text}
            </span>
          )
        }
        return value ? (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {value}
          </span>
        ) : '-'
      
      case 'avatar':
        return (
          <div className="flex items-center gap-2">
            {value?.image ? (
              <img 
                src={value.image} 
                alt={value.name || ''} 
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600">
                {value?.name?.charAt(0) || '?'}
              </div>
            )}
            {value?.name && <span className="text-sm">{value.name}</span>}
          </div>
        )
      
      case 'progress':
        const progressValue = typeof value === 'number' ? value : 0
        return (
          <div className="flex items-center space-x-2">
            <Progress value={progressValue} className="w-16 h-2" />
            <span className="text-xs text-gray-600">{progressValue}%</span>
          </div>
        )
      
      case 'number':
        return typeof value === 'number' ? value.toLocaleString() : value || '-'
      
      default:
        return value || '-'
    }
  }

  const handleSelectAll = () => {
    if (!onSelectionChange) return
    
    const allItemIds = items.filter(Boolean).map(item => getItemId(item))
    const allSelected = allItemIds.every(id => selectedItems.includes(id))
    
    if (allSelected) {
      onSelectionChange([])
    } else {
      onSelectionChange(allItemIds)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className={cn('text-center py-12 bg-white rounded-lg border border-gray-200', className)}>
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <List className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyTitle}</h3>
        <p className="text-gray-600 mb-4 max-w-sm mx-auto">{emptyDescription}</p>
        {emptyAction && (
          <Button onClick={emptyAction.onClick} variant="outline">
            {emptyAction.label}
          </Button>
        )}
      </div>
    )
  }

  const hasActions = Array.isArray(actions) && actions.length > 0 && actions.some(Boolean)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with view toggles and bulk actions */}
      {(showViewToggle || selectable) && (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            {selectable && items.length > 0 && (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={items.filter(Boolean).every(item => selectedItems.includes(getItemId(item)))}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">
                  {selectedItems.length > 0 
                    ? `${selectedItems.length} selected`
                    : 'Select all'
                  }
                </span>
              </div>
            )}
          </div>

          {showViewToggle && onViewModeChange && (
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <Button
                size="sm"
                variant={viewMode === 'compact' ? 'default' : 'ghost'}
                onClick={() => onViewModeChange('compact')}
                className="h-7 px-2"
              >
                <List className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                onClick={() => onViewModeChange('grid')}
                className="h-7 px-2"
              >
                <Grid className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Items List */}
      <div className={cn(
        viewMode === 'grid' 
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-2'
      )}>
        {items.filter(Boolean).map((item, index) => {
          if (!item) return null // Additional safety check
          
          const itemId = getItemId(item)
          const isSelected = selectedItems.includes(itemId)
          const isClickable = clickable || onItemClick
          
          const itemClasses = cn(
            'group bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all duration-200',
            'p-3 sm:p-4',
            isClickable && 'cursor-pointer hover:border-gray-300 hover:shadow-md',
            isSelected && 'ring-2 ring-blue-500 border-blue-300 bg-blue-50',
            typeof itemClassName === 'function' ? itemClassName(item) : itemClassName
          )

          return (
            <div
              key={itemId || index}
              className={itemClasses}
              onClick={isClickable ? () => onItemClick?.(item) : undefined}
            >
              <div className="flex items-start justify-between gap-3">
                {/* Main Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    {/* Selection checkbox */}
                    {selectable && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation()
                          const newSelection = e.target.checked
                            ? [...selectedItems, itemId]
                            : selectedItems.filter(id => id !== itemId)
                          onSelectionChange?.(newSelection)
                        }}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1 flex-shrink-0"
                      />
                    )}
                    
                    {/* Primary field - prominently displayed */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm sm:text-base font-medium text-gray-900 break-words">
                        {primaryField ? formatFieldValue(primaryField, item[primaryField.key], item) : 'No data'}
                      </div>
                      
                      {/* Secondary fields - compact display for desktop */}
                      {secondaryFields.length > 0 && (
                        <div className="hidden sm:flex items-center flex-wrap gap-3 mt-2">
                          {secondaryFields.map((field) => {
                            if (!field || !field.key) return null
                            const value = formatFieldValue(field, item[field.key], item)
                            if (!value || value === '-') return null
                            
                            return (
                              <div key={field.key} className="flex items-center space-x-1 text-xs text-gray-500">
                                <span className="font-medium">{field.label}:</span>
                                <span className="text-gray-700">{value}</span>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Mobile: Show important secondary info */}
                      <div className="sm:hidden mt-2 space-y-1">
                        {secondaryFields.slice(0, 1).map((field) => {
                          if (!field || !field.key) return null
                          const value = formatFieldValue(field, item[field.key], item)
                          if (!value || value === '-') return null
                          
                          return (
                            <div key={field.key} className="text-xs text-gray-600">
                              {value}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                {hasActions && (
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    {/* Primary action button */}
                    {primaryAction && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          primaryAction.onClick(item)
                        }}
                        disabled={
                          (typeof primaryAction.disabled === 'function' 
                            ? primaryAction.disabled(item)
                            : primaryAction.disabled) || 
                          loadingStates[itemId] || 
                          false
                        }
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 sm:w-auto sm:px-3"
                      >
                        {loadingStates[itemId] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            {primaryAction.icon}
                            <span className="hidden sm:inline ml-2">{primaryAction.label}</span>
                          </>
                        )}
                      </Button>
                    )}

                    {/* Single action - Mobile: icon only, Desktop: icon + text */}
                    {!primaryAction && actions.length === 1 && actions[0] && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          actions[0]?.onClick(item)
                        }}
                        disabled={
                          (typeof actions[0]?.disabled === 'function' 
                            ? actions[0].disabled(item)
                            : actions[0]?.disabled) || 
                          loadingStates[itemId] || 
                          false
                        }
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 sm:w-auto sm:px-3"
                      >
                        {loadingStates[itemId] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            {actions[0]?.icon}
                            <span className="hidden sm:inline ml-2">{actions[0]?.label}</span>
                          </>
                        )}
                      </Button>
                    )}

                    {/* Multiple actions dropdown */}
                    {(!primaryAction && actions.length > 1) || (primaryAction && actions.length > 0) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => e.stopPropagation()}
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                          >
                            {loadingStates[itemId] ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MoreVertical className="h-4 w-4" />
                            )}
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          {actions.map((action, actionIndex) => {
                            if (!action) return null
                            const isDisabled = typeof action.disabled === 'function' 
                              ? action.disabled(item)
                              : action.disabled || loadingStates[itemId] || false
                            
                            return (
                              <DropdownMenuItem
                                key={action.key || actionIndex}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (!isDisabled) {
                                    action.onClick(item)
                                  }
                                }}
                                disabled={isDisabled}
                                className={cn(
                                  'flex items-center space-x-2 cursor-pointer',
                                  action.variant === 'danger' && 'text-red-600 focus:text-red-600',
                                  action.variant === 'primary' && 'text-blue-600 focus:text-blue-600',
                                  isDisabled && 'opacity-50 cursor-not-allowed'
                                )}
                              >
                                {action.icon && <span className="w-4 h-4 flex-shrink-0">{action.icon}</span>}
                                <span>{action.label}</span>
                              </DropdownMenuItem>
                            )
                          })}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                )}
              </div>

              {/* Grid view: show additional fields */}
              {viewMode === 'grid' && fields.length > 1 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {fields.slice(1, 5).map((field) => {
                      if (!field || !field.key || field === primaryField) return null
                      const value = formatFieldValue(field, item[field.key], item)
                      if (!value || value === '-') return null
                      
                      return (
                        <div key={field.key} className="space-y-1">
                          <span className="font-medium text-gray-500">{field.label}</span>
                          <div className="text-gray-900">{value}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
              {pagination.totalItems} results
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Items per page selector */}
            {onLimitChange && (
              <select
                value={pagination.itemsPerPage}
                onChange={(e) => onLimitChange(parseInt(e.target.value))}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            )}

            {/* Page navigation */}
            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPageChange?.(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Previous</span>
              </Button>

              <div className="flex items-center space-x-1">
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1
                  } else if (pagination.currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i
                  } else {
                    pageNum = pagination.currentPage - 2 + i
                  }

                  return (
                    <Button
                      key={pageNum}
                      size="sm"
                      variant={pageNum === pagination.currentPage ? 'default' : 'ghost'}
                      onClick={() => onPageChange?.(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => onPageChange?.(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
              >
                <span className="hidden sm:inline mr-1">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
