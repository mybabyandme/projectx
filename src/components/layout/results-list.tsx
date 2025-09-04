'use client'

import { ReactNode, useState } from 'react'
import { 
  MoreVertical, 
  Grid3X3, 
  List, 
  ChevronRight,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatDate } from '@/lib/utils'

export interface ResultAction {
  key: string
  label: string
  icon?: ReactNode
  variant?: 'default' | 'primary' | 'danger' | 'success'
  onClick: (item: any) => void
  isLoading?: boolean
  disabled?: boolean
}

export interface ResultField {
  key: string
  label: string
  type: 'text' | 'number' | 'currency' | 'date' | 'badge' | 'avatar' | 'status' | 'custom'
  render?: (value: any, item: any) => ReactNode
  className?: string
  hideOnMobile?: boolean
  sortable?: boolean
}

export interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
}

export interface ResultsListProps {
  // Data
  items: any[]
  fields: ResultField[]
  
  // View mode
  viewMode?: 'list' | 'card'
  onViewModeChange?: (mode: 'list' | 'card') => void
  
  // Actions
  actions?: ResultAction[]
  primaryAction?: (item: any) => void
  
  // Selection
  selectable?: boolean
  selectedItems?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  getItemId?: (item: any) => string
  
  // Pagination
  pagination?: PaginationInfo
  onPageChange?: (page: number) => void
  onLimitChange?: (limit: number) => void
  
  // Loading states
  isLoading?: boolean
  loadingStates?: Record<string, boolean>
  
  // Empty state
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: {
    label: string
    onClick: () => void
  }
  
  // Styling
  className?: string
  itemClassName?: string
  compact?: boolean
  
  // Click handlers
  onItemClick?: (item: any) => void
  clickable?: boolean
}
export default function ResultsList({
  items,
  fields,
  viewMode = 'card',
  onViewModeChange,
  actions = [],
  primaryAction,
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  getItemId = (item) => item.id,
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
  clickable = false
}: ResultsListProps) {
  const [expandedActions, setExpandedActions] = useState<string | null>(null)

  const formatFieldValue = (field: ResultField, value: any, item: any) => {
    // For custom render functions, let them transform the value first
    let processedValue = value
    if (field.render && field.type !== 'custom') {
      processedValue = field.render(value, item)
    }

    switch (field.type) {
      case 'currency':
        return formatCurrency(processedValue || 0)
      
      case 'number':
        return (processedValue || 0).toLocaleString()
      
      case 'date':
        return processedValue ? formatDate(new Date(processedValue)) : '-'
      
      case 'badge':
        const badgeColor = getBadgeColor(processedValue, field.key)
        return (
          <span className={cn(
            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
            badgeColor
          )}>
            {processedValue}
          </span>
        )
      
      case 'status':
        const statusConfig = getStatusConfig(processedValue)
        return (
          <span className={cn(
            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
            statusConfig.className
          )}>
            <div className={cn('w-2 h-2 rounded-full mr-1.5', statusConfig.dotColor)} />
            {statusConfig.label}
          </span>
        )
      
      case 'avatar':
        return (
          <div className="flex items-center gap-2">
            {processedValue?.image ? (
              <img 
                src={processedValue.image} 
                alt={processedValue.name || ''} 
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-sm font-medium text-white">
                {(processedValue?.name || processedValue || '').charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium">{processedValue?.name || processedValue}</span>
          </div>
        )
      
      case 'custom':
        // For custom type, the render function should handle everything
        return field.render ? field.render(value, item) : processedValue
      
      default:
        return processedValue || '-'
    }
  }

  const getBadgeColor = (value: string, fieldKey: string) => {
    // Project status colors
    if (fieldKey === 'status' || fieldKey === 'projectStatus') {
      switch (value?.toLowerCase()) {
        case 'active': return 'bg-green-100 text-green-800'
        case 'completed': return 'bg-blue-100 text-blue-800'
        case 'on_hold': return 'bg-yellow-100 text-yellow-800'
        case 'cancelled': return 'bg-red-100 text-red-800'
        case 'planning': return 'bg-purple-100 text-purple-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }
    
    // Task priority colors
    if (fieldKey === 'priority') {
      switch (value?.toLowerCase()) {
        case 'critical': return 'bg-red-100 text-red-800'
        case 'high': return 'bg-orange-100 text-orange-800'
        case 'medium': return 'bg-yellow-100 text-yellow-800'
        case 'low': return 'bg-green-100 text-green-800'
        default: return 'bg-gray-100 text-gray-800'
      }
    }

    return 'bg-gray-100 text-gray-800'
  }

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return { 
          label: 'Active', 
          className: 'bg-green-100 text-green-800',
          dotColor: 'bg-green-500'
        }
      case 'completed':
        return { 
          label: 'Completed', 
          className: 'bg-blue-100 text-blue-800',
          dotColor: 'bg-blue-500'
        }
      case 'on_hold':
        return { 
          label: 'On Hold', 
          className: 'bg-yellow-100 text-yellow-800',
          dotColor: 'bg-yellow-500'
        }
      case 'cancelled':
        return { 
          label: 'Cancelled', 
          className: 'bg-red-100 text-red-800',
          dotColor: 'bg-red-500'
        }
      default:
        return { 
          label: status || 'Unknown', 
          className: 'bg-gray-100 text-gray-800',
          dotColor: 'bg-gray-500'
        }
    }
  }

  const handleItemClick = (item: any) => {
    if (clickable && onItemClick) {
      onItemClick(item)
    } else if (primaryAction) {
      primaryAction(item)
    }
  }

  const handleSelectionToggle = (itemId: string, checked: boolean) => {
    if (!onSelectionChange) return
    
    const newSelection = checked
      ? [...selectedItems, itemId]
      : selectedItems.filter(id => id !== itemId)
    
    onSelectionChange(newSelection)
  }

  // Empty state
  if (!isLoading && items.length === 0) {
    return (
      <div className={cn("bg-white rounded-lg border border-gray-200", className)}>
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <List className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{emptyTitle}</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">{emptyDescription}</p>
          {emptyAction && (
            <button
              onClick={emptyAction.onClick}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {emptyAction.label}
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      {/* View Mode Toggle */}
      {onViewModeChange && (
        <div className="flex justify-end">
          <div className="inline-flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => onViewModeChange('list')}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors",
                viewMode === 'list'
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <List className="h-4 w-4" />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => onViewModeChange('card')}
              className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors",
                viewMode === 'card'
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>
        </div>
      )}

      {/* Results Container */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : viewMode === 'list' ? (
          <ListViewContent
            items={items}
            fields={fields}
            actions={actions}
            selectable={selectable}
            selectedItems={selectedItems}
            onSelectionChange={handleSelectionToggle}
            getItemId={getItemId}
            formatFieldValue={formatFieldValue}
            onItemClick={handleItemClick}
            clickable={clickable}
            loadingStates={loadingStates}
            expandedActions={expandedActions}
            setExpandedActions={setExpandedActions}
            compact={compact}
          />
        ) : (
          <CardViewContent
            items={items}
            fields={fields}
            actions={actions}
            selectable={selectable}
            selectedItems={selectedItems}
            onSelectionChange={handleSelectionToggle}
            getItemId={getItemId}
            formatFieldValue={formatFieldValue}
            onItemClick={handleItemClick}
            clickable={clickable}
            loadingStates={loadingStates}
            expandedActions={expandedActions}
            setExpandedActions={setExpandedActions}
            compact={compact}
          />
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <PaginationComponent
          pagination={pagination}
          onPageChange={onPageChange}
          onLimitChange={onLimitChange}
          compact={compact}
        />
      )}
    </div>
  )
}
// List View Component - Ultra Compact
function ListViewContent({
  items,
  fields,
  actions,
  selectable,
  selectedItems,
  onSelectionChange,
  getItemId,
  formatFieldValue,
  onItemClick,
  clickable,
  loadingStates,
  expandedActions,
  setExpandedActions,
  compact
}: any) {
  return (
    <div className="divide-y divide-gray-100">
      {items.map((item: any) => {
        const itemId = getItemId(item)
        const isSelected = selectedItems.includes(itemId)
        const isLoading = loadingStates[itemId]
        const isActionsExpanded = expandedActions === itemId

        return (
          <div
            key={itemId}
            className={cn(
              "relative flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors",
              clickable && "cursor-pointer",
              isSelected && "bg-blue-50",
              isLoading && "opacity-50 pointer-events-none"
            )}
            onClick={() => !selectable && onItemClick && onItemClick(item)}
          >
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              </div>
            )}

            {/* Selection Checkbox */}
            {selectable && (
              <div className="flex-shrink-0">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => onSelectionChange(itemId, e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
            )}

            {/* Content - Single Line on Desktop, Max 2 Lines on Mobile */}
            <div className="flex-1 min-w-0">
              {/* Desktop: Single Line Layout */}
              <div className="hidden sm:flex items-center gap-4">
                {/* Primary Field */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {formatFieldValue(fields[0], item[fields[0]?.key], item)}
                  </div>
                </div>

                {/* Secondary Fields - Compact */}
                {fields.slice(1, 4).map((field) => (
                  !field.hideOnMobile && (
                    <div key={field.key} className="flex-shrink-0 text-right">
                      <div className="text-sm text-gray-700">
                        {formatFieldValue(field, item[field.key], item)}
                      </div>
                    </div>
                  )
                ))}
              </div>

              {/* Mobile: Max 2 Lines Layout */}
              <div className="sm:hidden">
                {/* Line 1: Primary Field */}
                <div className="text-sm font-medium text-gray-900 truncate">
                  {formatFieldValue(fields[0], item[fields[0]?.key], item)}
                </div>
                
                {/* Line 2: Secondary Info */}
                {fields[1] && (
                  <div className="text-xs text-gray-600 truncate mt-0.5">
                    {formatFieldValue(fields[1], item[fields[1].key], item)}
                  </div>
                )}
              </div>
            </div>

            {/* Actions - Compact */}
            {actions.length > 0 && (
              <div className="flex-shrink-0 relative">
                {actions.length === 1 ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      actions[0].onClick(item)
                    }}
                    disabled={(actions[0].disabled ?? false) || isLoading}
                    className={cn(
                      "p-1.5 rounded-md transition-colors",
                      actions[0].variant === 'primary' && "bg-blue-600 text-white hover:bg-blue-700",
                      actions[0].variant === 'danger' && "bg-red-600 text-white hover:bg-red-700",
                      actions[0].variant === 'success' && "bg-green-600 text-white hover:bg-green-700",
                      (!actions[0].variant || actions[0].variant === 'default') && "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                    title={actions[0].label}
                  >
                    {actions[0].isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      actions[0].icon
                    )}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpandedActions(isActionsExpanded ? null : itemId)
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {isActionsExpanded && (
                      <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                        {actions.map((action: any) => (
                          <button
                            key={action.key}
                            onClick={(e) => {
                              e.stopPropagation()
                              action.onClick(item)
                              setExpandedActions(null)
                            }}
                            disabled={(action.disabled ?? false) || isLoading}
                            className={cn(
                              "w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors",
                              action.variant === 'danger' && "text-red-600 hover:bg-red-50",
                              action.variant === 'success' && "text-green-600 hover:bg-green-50",
                              (action.disabled ?? false) && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            {action.isLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              action.icon
                            )}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Clickable Indicator */}
            {clickable && !selectable && (
              <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
            )}
          </div>
        )
      })}
    </div>
  )
}
// Card View Component - Compact
function CardViewContent({
  items,
  fields,
  actions,
  selectable,
  selectedItems,
  onSelectionChange,
  getItemId,
  formatFieldValue,
  onItemClick,
  clickable,
  loadingStates,
  expandedActions,
  setExpandedActions,
  compact
}: any) {
  return (
    <div className={cn(
      "grid gap-3 p-3",
      compact ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
    )}>
      {items.map((item: any) => {
        const itemId = getItemId(item)
        const isSelected = selectedItems.includes(itemId)
        const isLoading = loadingStates[itemId]
        const isActionsExpanded = expandedActions === itemId

        return (
          <div
            key={itemId}
            className={cn(
              "relative bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-200",
              clickable && "cursor-pointer hover:border-gray-300",
              isSelected && "ring-2 ring-blue-500 border-blue-500",
              isLoading && "opacity-50 pointer-events-none"
            )}
            onClick={() => !selectable && onItemClick && onItemClick(item)}
          >
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/70 rounded-lg flex items-center justify-center z-10">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-2 flex-1 min-w-0">
                {/* Selection Checkbox */}
                {selectable && (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelectionChange(itemId, e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                  />
                )}

                {/* Primary Field */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">
                    {fields[0] && formatFieldValue(fields[0], item[fields[0].key], item)}
                  </div>
                  {fields[1] && (
                    <div className="text-xs text-gray-600 mt-1 truncate">
                      {formatFieldValue(fields[1], item[fields[1].key], item)}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {actions.length > 0 && (
                <div className="flex-shrink-0 relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setExpandedActions(isActionsExpanded ? null : itemId)
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  {isActionsExpanded && (
                    <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                      {actions.map((action: any) => (
                        <button
                          key={action.key}
                          onClick={(e) => {
                            e.stopPropagation()
                            action.onClick(item)
                            setExpandedActions(null)
                          }}
                          disabled={(action.disabled ?? false) || isLoading}
                          className={cn(
                            "w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2 transition-colors",
                            action.variant === 'danger' && "text-red-600 hover:bg-red-50",
                            action.variant === 'success' && "text-green-600 hover:bg-green-50",
                            (action.disabled ?? false) && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {action.isLoading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            action.icon
                          )}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Additional Fields - Compact */}
            {fields.length > 2 && (
              <div className="space-y-1">
                {fields.slice(2, 5).map((field) => (
                  <div key={field.key} className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 truncate">{field.label}:</span>
                    <div className="text-xs text-gray-900 truncate max-w-24">
                      {formatFieldValue(field, item[field.key], item)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Clickable Indicator */}
            {clickable && !selectable && (
              <div className="absolute top-3 right-3">
                <ChevronRight className="h-3 w-3 text-gray-300" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Simple Pagination Component
function PaginationComponent({ pagination, onPageChange, onLimitChange, compact }: any) {
  if (!pagination) return null

  const { currentPage, totalPages, totalItems, itemsPerPage } = pagination
  
  const startItem = (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center text-sm text-gray-500">
        <span>Showing {startItem} to {endItem} of {totalItems} results</span>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        <span className="text-sm text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        
        <button
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  )
}        