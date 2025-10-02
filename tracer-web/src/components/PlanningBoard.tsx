'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Task, Agent } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  GitBranch, 
  Clock, 
  Users, 
  Zap,
  Target,
  TrendingUp,
  Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface PlanningBoardProps {
  tasks: Task[]
  agents: Agent[]
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void
  onAgentUpdate: (agentId: string, updates: Partial<Agent>) => void
}

interface TaskNode {
  id: string
  task: Task
  x: number
  y: number
  dependencies: string[]
  dependents: string[]
}

export function PlanningBoard({ tasks, agents }: PlanningBoardProps) {
  const [taskNodes, setTaskNodes] = useState<TaskNode[]>([])
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'kanban' | 'timeline' | 'dependency'>('kanban')

  useEffect(() => {
    // Create task nodes with positions
    const nodes: TaskNode[] = tasks.map((task, index) => ({
      id: task.id,
      task,
      x: (index % 4) * 200 + 50,
      y: Math.floor(index / 4) * 150 + 50,
      dependencies: task.dependencies || [],
      dependents: tasks.filter(t => t.dependencies?.includes(task.id)).map(t => t.id),
    }))
    setTaskNodes(nodes)
  }, [tasks])

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'blocked': return 'bg-red-100 text-red-800'
    }
  }

  const getAgentEfficiency = (agentId?: string) => {
    if (!agentId) return 0
    const agent = agents.find(a => a.id === agentId)
    return agent?.efficiency || 0
  }

  const calculateProjectProgress = () => {
    const completedTasks = tasks.filter(t => t.status === 'completed').length
    return Math.round((completedTasks / Math.max(tasks.length, 1)) * 100)
  }

  const getCriticalPath = () => {
    // Simple critical path calculation based on dependencies
    const completedTasks = tasks.filter(t => t.status === 'completed').map(t => t.id)
    const blockedTasks = tasks.filter(t => 
      t.status === 'blocked' || 
      (t.dependencies.length > 0 && !t.dependencies.every(dep => completedTasks.includes(dep)))
    )
    return blockedTasks.length
  }

  const renderKanbanView = () => {
    const columns = [
      { id: 'pending', title: 'Pending', tasks: tasks.filter(t => t.status === 'pending') },
      { id: 'in-progress', title: 'In Progress', tasks: tasks.filter(t => t.status === 'in-progress') },
      { id: 'completed', title: 'Completed', tasks: tasks.filter(t => t.status === 'completed') },
      { id: 'blocked', title: 'Blocked', tasks: tasks.filter(t => t.status === 'blocked') },
    ]

    return (
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <div className="bg-white rounded-lg border">
              <div className="p-4 border-b">
                <h3 className="font-medium text-gray-900">{column.title}</h3>
                <Badge variant="secondary" className="mt-1">
                  {column.tasks.length} tasks
                </Badge>
              </div>
              <div className="p-4 space-y-3 min-h-96">
                <AnimatePresence>
                  {column.tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={cn(
                        "p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                        selectedTask === task.id && "ring-2 ring-blue-500"
                      )}
                      onClick={() => setSelectedTask(selectedTask === task.id ? null : task.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {task.title}
                        </h4>
                        <Badge className={cn("text-xs", getStatusColor(task.status))}>
                          {task.priority}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                        {task.description}
                      </p>

                      {task.agentId && (
                        <div className="flex items-center space-x-2 mb-2">
                          <Users className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-600">
                            {agents.find(a => a.id === task.agentId)?.name}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{task.estimatedHours || 0}h</span>
                        </div>
                        {task.agentId && (
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>{Math.round(getAgentEfficiency(task.agentId) * 100)}%</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderTimelineView = () => {
    const sortedTasks = [...tasks].sort((a, b) => 
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )

    return (
      <div className="space-y-4">
        {sortedTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-4 p-4 bg-white border rounded-lg"
          >
            <div className="flex-shrink-0">
              <div className={cn(
                "w-3 h-3 rounded-full",
                task.status === 'completed' ? 'bg-green-500' :
                task.status === 'in-progress' ? 'bg-blue-500' :
                task.status === 'blocked' ? 'bg-red-500' :
                'bg-gray-400'
              )} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900">{task.title}</h4>
              <p className="text-xs text-gray-500">{task.description}</p>
            </div>

            <div className="flex items-center space-x-4">
              <Badge className={cn("text-xs", getStatusColor(task.status))}>
                {task.status.replace('-', ' ')}
              </Badge>
              
              {task.agentId && (
                <div className="flex items-center space-x-1">
                  <Users className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    {agents.find(a => a.id === task.agentId)?.name}
                  </span>
                </div>
              )}

              <div className="text-xs text-gray-500">
                {task.estimatedHours || 0}h
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  const renderDependencyView = () => {
    return (
      <div className="relative">
        <svg className="w-full h-96 border rounded-lg bg-gray-50">
          {taskNodes.map((node) => (
            <g key={node.id}>
              {/* Dependencies */}
              {node.dependencies.map((depId) => {
                const depNode = taskNodes.find(n => n.id === depId)
                if (!depNode) return null
                
                return (
                  <line
                    key={`${depId}-${node.id}`}
                    x1={depNode.x + 75}
                    y1={depNode.y + 25}
                    x2={node.x + 75}
                    y2={node.y + 25}
                    stroke="#e5e7eb"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                )
              })}
              
              {/* Task Node */}
              <rect
                x={node.x}
                y={node.y}
                width="150"
                height="50"
                rx="8"
                fill="white"
                stroke="#e5e7eb"
                strokeWidth="1"
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedTask(selectedTask === node.id ? null : node.id)}
              />
              
              <text
                x={node.x + 75}
                y={node.y + 20}
                textAnchor="middle"
                className="text-xs font-medium fill-gray-900"
              >
                {node.task.title.length > 20 ? node.task.title.substring(0, 20) + '...' : node.task.title}
              </text>
              
              <text
                x={node.x + 75}
                y={node.y + 35}
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {node.task.status}
              </text>
            </g>
          ))}
          
          {/* Arrow marker */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#e5e7eb" />
            </marker>
          </defs>
        </svg>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Planning Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateProjectProgress()}%</div>
            <p className="text-xs text-muted-foreground">
              {tasks.filter(t => t.status === 'completed').length} of {tasks.length} tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agents.filter(a => a.status === 'working').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {agents.filter(a => a.status === 'idle').length} idle
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Tasks</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCriticalPath()}</div>
            <p className="text-xs text-muted-foreground">
              Dependencies
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(agents.reduce((acc, agent) => acc + agent.efficiency, 0) / Math.max(agents.length, 1) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average agent efficiency
            </p>
          </CardContent>
        </Card>
      </div>

      {/* View Controls */}
      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('kanban')}
          >
            Kanban
          </Button>
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('timeline')}
          >
            Timeline
          </Button>
          <Button
            variant={viewMode === 'dependency' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('dependency')}
          >
            Dependencies
          </Button>
        </div>
      </div>

      {/* Planning Views */}
      <div className="min-h-96">
        {viewMode === 'kanban' && renderKanbanView()}
        {viewMode === 'timeline' && renderTimelineView()}
        {viewMode === 'dependency' && renderDependencyView()}
      </div>

      {/* Task Details */}
      {selectedTask && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 right-4 w-80 bg-white border rounded-lg shadow-lg p-4 z-50"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Task Details</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTask(null)}
            >
              ×
            </Button>
          </div>
          
          {(() => {
            const task = tasks.find(t => t.id === selectedTask)
            if (!task) return null
            
            return (
              <div className="space-y-2">
                <h4 className="font-medium">{task.title}</h4>
                <p className="text-sm text-gray-600">{task.description}</p>
                <div className="flex items-center space-x-2">
                  <Badge className={cn("text-xs", getStatusColor(task.status))}>
                    {task.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {task.priority}
                  </Badge>
                </div>
                {task.agentId && (
                  <div className="flex items-center space-x-2">
                    <Users className="h-3 w-3 text-gray-400" />
                    <span className="text-xs text-gray-600">
                      {agents.find(a => a.id === task.agentId)?.name}
                    </span>
                  </div>
                )}
              </div>
            )
          })()}
        </motion.div>
      )}
    </div>
  )
}

