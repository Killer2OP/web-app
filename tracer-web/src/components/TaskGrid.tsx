'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Task, Agent } from '@/types'
import { TaskCard } from '@/components/TaskCard'
import { TaskToolbar } from '@/components/TaskToolbar'
import { TaskDialog } from '@/components/TaskDialog'
import { AssignTaskDialog } from '@/components/AssignTaskDialog'
import { cn } from '@/lib/utils'

interface TaskGridProps {
  tasks: Task[]
  agents: Agent[]
  onCreateTask: () => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onAssignTask: (taskId: string) => void
}

export function TaskGrid({ 
  tasks, 
  agents, 
  onCreateTask, 
  onEditTask, 
  onDeleteTask, 
  onAssignTask 
}: TaskGridProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getAgentName = (agentId?: string) => {
    if (!agentId) return undefined
    return agents.find(agent => agent.id === agentId)?.name
  }

  if (view === 'list') {
    return (
      <div className="space-y-4">
        <TaskToolbar
          onCreateTask={onCreateTask}
          onViewChange={setView}
          currentView={view}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          taskCount={filteredTasks.length}
        />
        
        <div className="space-y-2">
          <AnimatePresence>
            {filteredTasks.map((task) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center space-x-4 p-4 bg-white border rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {task.title}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {task.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={cn(
                      "px-2 py-1 text-xs rounded-full",
                      task.status === 'pending' && "bg-gray-100 text-gray-800",
                      task.status === 'in-progress' && "bg-blue-100 text-blue-800",
                      task.status === 'completed' && "bg-green-100 text-green-800",
                      task.status === 'blocked' && "bg-red-100 text-red-800"
                    )}>
                      {task.status.replace('-', ' ')}
                    </span>
                    
                    {getAgentName(task.agentId) && (
                      <span className="text-xs text-gray-500">
                        {getAgentName(task.agentId)}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <TaskToolbar
        onCreateTask={onCreateTask}
        onViewChange={setView}
        currentView={view}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        taskCount={filteredTasks.length}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              onAssign={onAssignTask}
              agentName={getAgentName(task.agentId)}
            />
          ))}
        </AnimatePresence>
      </div>
      
      {filteredTasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery ? 'Try adjusting your search criteria.' : 'Get started by creating your first task.'}
          </p>
          {!searchQuery && (
            <button
              onClick={onCreateTask}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Task
            </button>
          )}
        </motion.div>
      )}
    </div>
  )
}

