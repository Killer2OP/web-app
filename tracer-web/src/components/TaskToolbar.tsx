'use client'

import { Plus, Search, Grid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface TaskToolbarProps {
  onCreateTask: () => void
  onViewChange: (view: 'grid' | 'list') => void
  currentView: 'grid' | 'list'
  searchQuery: string
  onSearchChange: (query: string) => void
  taskCount: number
}

export function TaskToolbar({
  onCreateTask,
  onViewChange,
  currentView,
  searchQuery,
  onSearchChange,
  taskCount,
}: TaskToolbarProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold">Tasks</h2>
        <Badge variant="secondary" className="text-sm">
          {taskCount} tasks
        </Badge>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-64"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewChange(currentView === 'grid' ? 'list' : 'grid')}
        >
          {currentView === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
        </Button>

        <Button onClick={onCreateTask} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>
    </div>
  )
}

