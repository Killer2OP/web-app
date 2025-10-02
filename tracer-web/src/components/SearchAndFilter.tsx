'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Search, 
  Filter, 
  X, 
  SortAsc, 
  SortDesc,
  Calendar,
  User,
  Tag,
  Clock,
  CheckSquare,
  AlertCircle
} from 'lucide-react'
import { Task, Agent } from '@/types'
import { cn } from '@/lib/utils'

interface SearchAndFilterProps {
  tasks: Task[]
  agents: Agent[]
  onFilteredTasks: (tasks: Task[]) => void
  onFilteredAgents: (agents: Agent[]) => void
  className?: string
}

interface FilterState {
  searchTerm: string
  status: string[]
  priority: string[]
  agentType: string[]
  dateRange: {
    start: string
    end: string
  }
  sortBy: 'title' | 'status' | 'priority' | 'createdAt' | 'updatedAt'
  sortOrder: 'asc' | 'desc'
}

export function SearchAndFilter({ 
  tasks, 
  agents, 
  onFilteredTasks, 
  onFilteredAgents, 
  className 
}: SearchAndFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    status: [],
    priority: [],
    agentType: [],
    dateRange: { start: '', end: '' },
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchLower) ||
        task.description.toLowerCase().includes(searchLower) ||
        task.id.toLowerCase().includes(searchLower)
      )
    }

    // Status filter
    if (filters.status.length > 0) {
      filtered = filtered.filter(task => filters.status.includes(task.status))
    }

    // Priority filter
    if (filters.priority.length > 0) {
      filtered = filtered.filter(task => filters.priority.includes(task.priority))
    }

    // Date range filter
    if (filters.dateRange.start || filters.dateRange.end) {
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.createdAt)
        const startDate = filters.dateRange.start ? new Date(filters.dateRange.start) : null
        const endDate = filters.dateRange.end ? new Date(filters.dateRange.end) : null

        if (startDate && taskDate < startDate) return false
        if (endDate && taskDate > endDate) return false
        return true
      })
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any, bValue: any

      switch (filters.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase()
          bValue = b.title.toLowerCase()
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
          aValue = priorityOrder[a.priority]
          bValue = priorityOrder[b.priority]
          break
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case 'updatedAt':
          aValue = new Date(a.updatedAt).getTime()
          bValue = new Date(b.updatedAt).getTime()
          break
        default:
          return 0
      }

      if (aValue < bValue) return filters.sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return filters.sortOrder === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [tasks, filters])

  // Filter and sort agents
  const filteredAgents = useMemo(() => {
    let filtered = agents

    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(agent =>
        agent.name.toLowerCase().includes(searchLower) ||
        agent.type.toLowerCase().includes(searchLower) ||
        agent.capabilities.some(cap => cap.toLowerCase().includes(searchLower))
      )
    }

    // Agent type filter
    if (filters.agentType.length > 0) {
      filtered = filtered.filter(agent => filters.agentType.includes(agent.type))
    }

    return filtered
  }, [agents, filters])

  // Update parent components
  useMemo(() => {
    onFilteredTasks(filteredTasks)
  }, [filteredTasks, onFilteredTasks])

  useMemo(() => {
    onFilteredAgents(filteredAgents)
  }, [filteredAgents, onFilteredAgents])

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleArrayFilterChange = (key: 'status' | 'priority' | 'agentType', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(item => item !== value)
        : [...prev[key], value]
    }))
  }

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      status: [],
      priority: [],
      agentType: [],
      dateRange: { start: '', end: '' },
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.searchTerm) count++
    if (filters.status.length > 0) count++
    if (filters.priority.length > 0) count++
    if (filters.agentType.length > 0) count++
    if (filters.dateRange.start || filters.dateRange.end) count++
    return count
  }

  const statusOptions = ['pending', 'in-progress', 'completed', 'blocked']
  const priorityOptions = ['low', 'medium', 'high', 'urgent']
  const agentTypeOptions = ['frontend', 'backend', 'fullstack', 'devops', 'ai']

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search tasks and agents..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {getActiveFilterCount() > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs">
              {getActiveFilterCount()}
            </Badge>
          )}
        </Button>
        {getActiveFilterCount() > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Filter className="h-5 w-5" />
                  <span>Filters & Sorting</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {statusOptions.map(status => (
                      <Button
                        key={status}
                        variant={filters.status.includes(status) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleArrayFilterChange('status', status)}
                        className="text-xs"
                      >
                        <CheckSquare className="h-3 w-3 mr-1" />
                        {status.replace('-', ' ')}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Priority
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {priorityOptions.map(priority => (
                      <Button
                        key={priority}
                        variant={filters.priority.includes(priority) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleArrayFilterChange('priority', priority)}
                        className="text-xs"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {priority}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Agent Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Agent Type
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {agentTypeOptions.map(type => (
                      <Button
                        key={type}
                        variant={filters.agentType.includes(type) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleArrayFilterChange('agentType', type)}
                        className="text-xs"
                      >
                        <User className="h-3 w-3 mr-1" />
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">From</label>
                      <Input
                        type="date"
                        value={filters.dateRange.start}
                        onChange={(e) => handleFilterChange('dateRange', { 
                          ...filters.dateRange, 
                          start: e.target.value 
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">To</label>
                      <Input
                        type="date"
                        value={filters.dateRange.end}
                        onChange={(e) => handleFilterChange('dateRange', { 
                          ...filters.dateRange, 
                          end: e.target.value 
                        })}
                      />
                    </div>
                  </div>
                </div>

                {/* Sorting */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Sort By
                  </label>
                  <div className="flex items-center space-x-4">
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
                    >
                      <option value="title">Title</option>
                      <option value="status">Status</option>
                      <option value="priority">Priority</option>
                      <option value="createdAt">Created Date</option>
                      <option value="updatedAt">Updated Date</option>
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFilterChange('sortOrder', 
                        filters.sortOrder === 'asc' ? 'desc' : 'asc'
                      )}
                    >
                      {filters.sortOrder === 'asc' ? (
                        <SortAsc className="h-4 w-4" />
                      ) : (
                        <SortDesc className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center space-x-4">
          <span>{filteredTasks.length} tasks</span>
          <span>{filteredAgents.length} agents</span>
        </div>
        {getActiveFilterCount() > 0 && (
          <div className="flex items-center space-x-2">
            <span>Active filters:</span>
            <div className="flex space-x-1">
              {filters.status.map(status => (
                <Badge key={status} variant="secondary" className="text-xs">
                  {status}
                </Badge>
              ))}
              {filters.priority.map(priority => (
                <Badge key={priority} variant="secondary" className="text-xs">
                  {priority}
                </Badge>
              ))}
              {filters.agentType.map(type => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
