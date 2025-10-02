'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, 
  Clock, 
  User, 
  Bot, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  GitBranch,
  Search,
  Filter,
  Calendar,
  MessageSquare,
  Code,
  Target
} from 'lucide-react'
import { Task, Agent } from '@/types'
import { cn } from '@/lib/utils'

interface ActivityEntry {
  id: string
  type: 'task-created' | 'task-updated' | 'task-completed' | 'agent-assigned' | 'agent-response' | 'dependency-added' | 'status-changed' | 'time-tracked'
  timestamp: Date
  userId?: string
  agentId?: string
  taskId?: string
  title: string
  description: string
  metadata?: Record<string, any>
  severity: 'info' | 'success' | 'warning' | 'error'
}

interface ActivityLogProps {
  tasks: Task[]
  agents: Agent[]
  className?: string
}

export function ActivityLog({ tasks, agents, className }: ActivityLogProps) {
  const [activities, setActivities] = useState<ActivityEntry[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedTimeframe, setSelectedTimeframe] = useState<'day' | 'week' | 'month' | 'all'>('all')

  // Generate sample activities based on current tasks and agents
  useEffect(() => {
    const generateActivities = (): ActivityEntry[] => {
      const activities: ActivityEntry[] = []
      const now = new Date()

      // Generate activities for each task
      tasks.forEach((task, index) => {
        const createdTime = new Date(task.createdAt)
        const updatedTime = new Date(task.updatedAt)

        // Task created
        activities.push({
          id: `activity-${task.id}-created`,
          type: 'task-created',
          timestamp: createdTime,
          taskId: task.id,
          title: 'Task Created',
          description: `"${task.title}" was created`,
          severity: 'info',
          metadata: { priority: task.priority, estimatedHours: task.estimatedHours }
        })

        // Task updated
        if (updatedTime.getTime() !== createdTime.getTime()) {
          activities.push({
            id: `activity-${task.id}-updated`,
            type: 'task-updated',
            timestamp: updatedTime,
            taskId: task.id,
            title: 'Task Updated',
            description: `"${task.title}" was updated`,
            severity: 'info'
          })
        }

        // Status changes
        if (task.status === 'completed') {
          activities.push({
            id: `activity-${task.id}-completed`,
            type: 'task-completed',
            timestamp: new Date(updatedTime.getTime() - Math.random() * 86400000), // Random time before update
            taskId: task.id,
            title: 'Task Completed',
            description: `"${task.title}" was marked as completed`,
            severity: 'success',
            metadata: { actualHours: task.actualHours }
          })
        }

        // Agent assignments
        if (task.agentId) {
          const agent = agents.find(a => a.id === task.agentId)
          activities.push({
            id: `activity-${task.id}-assigned`,
            type: 'agent-assigned',
            timestamp: new Date(createdTime.getTime() + Math.random() * 86400000),
            taskId: task.id,
            agentId: task.agentId,
            title: 'Agent Assigned',
            description: `"${task.title}" was assigned to ${agent?.name || 'Unknown Agent'}`,
            severity: 'info',
            metadata: { agentName: agent?.name, agentType: agent?.type }
          })
        }

        // Dependencies
        if (task.dependencies && task.dependencies.length > 0) {
          activities.push({
            id: `activity-${task.id}-dependencies`,
            type: 'dependency-added',
            timestamp: new Date(createdTime.getTime() + Math.random() * 86400000),
            taskId: task.id,
            title: 'Dependencies Added',
            description: `"${task.title}" has ${task.dependencies.length} dependency(ies)`,
            severity: 'info',
            metadata: { dependencyCount: task.dependencies.length }
          })
        }

        // Time tracking
        if (task.actualHours && task.actualHours > 0) {
          activities.push({
            id: `activity-${task.id}-time`,
            type: 'time-tracked',
            timestamp: new Date(updatedTime.getTime() - Math.random() * 86400000),
            taskId: task.id,
            title: 'Time Tracked',
            description: `${task.actualHours}h logged for "${task.title}"`,
            severity: 'info',
            metadata: { actualHours: task.actualHours, estimatedHours: task.estimatedHours }
          })
        }
      })

      // Generate agent activities
      agents.forEach((agent, index) => {
        if (agent.status === 'working' && agent.currentTaskId) {
          const task = tasks.find(t => t.id === agent.currentTaskId)
          activities.push({
            id: `activity-${agent.id}-working`,
            type: 'agent-response',
            timestamp: new Date(Date.now() - Math.random() * 86400000),
            agentId: agent.id,
            taskId: agent.currentTaskId,
            title: 'Agent Working',
            description: `${agent.name} is actively working on "${task?.title || 'Unknown Task'}"`,
            severity: 'success',
            metadata: { agentName: agent.name, agentType: agent.type, efficiency: agent.efficiency }
          })
        }
      })

      // Sort by timestamp (newest first)
      return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    }

    const generatedActivities = generateActivities()
    setActivities(generatedActivities)
  }, [tasks, agents])

  // Filter activities based on search and filters
  useEffect(() => {
    let filtered = activities

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(activity => activity.type === selectedType)
    }

    // Filter by timeframe
    if (selectedTimeframe !== 'all') {
      const now = new Date()
      const timeframe = selectedTimeframe === 'day' ? 1 : selectedTimeframe === 'week' ? 7 : 30
      const cutoffDate = new Date(now.getTime() - timeframe * 24 * 60 * 60 * 1000)
      filtered = filtered.filter(activity => activity.timestamp >= cutoffDate)
    }

    setFilteredActivities(filtered)
  }, [activities, searchTerm, selectedType, selectedTimeframe])

  const getActivityIcon = (type: ActivityEntry['type']) => {
    switch (type) {
      case 'task-created': return <Target className="h-4 w-4" />
      case 'task-updated': return <Info className="h-4 w-4" />
      case 'task-completed': return <CheckCircle className="h-4 w-4" />
      case 'agent-assigned': return <User className="h-4 w-4" />
      case 'agent-response': return <Bot className="h-4 w-4" />
      case 'dependency-added': return <GitBranch className="h-4 w-4" />
      case 'status-changed': return <Activity className="h-4 w-4" />
      case 'time-tracked': return <Clock className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: ActivityEntry['severity']) => {
    switch (severity) {
      case 'success': return 'text-success bg-success/10 border-success/20'
      case 'warning': return 'text-warning bg-warning/10 border-warning/20'
      case 'error': return 'text-destructive bg-destructive/10 border-destructive/20'
      default: return 'text-info bg-info/10 border-info/20'
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return timestamp.toLocaleDateString()
  }

  const getTaskTitle = (taskId?: string) => {
    if (!taskId) return 'Unknown Task'
    const task = tasks.find(t => t.id === taskId)
    return task?.title || 'Unknown Task'
  }

  const getAgentName = (agentId?: string) => {
    if (!agentId) return 'Unknown Agent'
    const agent = agents.find(a => a.id === agentId)
    return agent?.name || 'Unknown Agent'
  }

  const activityTypes = [
    { value: 'all', label: 'All Activities' },
    { value: 'task-created', label: 'Task Created' },
    { value: 'task-updated', label: 'Task Updated' },
    { value: 'task-completed', label: 'Task Completed' },
    { value: 'agent-assigned', label: 'Agent Assigned' },
    { value: 'agent-response', label: 'Agent Response' },
    { value: 'dependency-added', label: 'Dependencies' },
    { value: 'time-tracked', label: 'Time Tracked' },
  ]

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Activity Log</h2>
          <p className="text-muted-foreground">Track all project activities and changes</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {filteredActivities.length} activities
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="min-w-48">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
              >
                {activityTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Timeframe Filter */}
            <div className="min-w-32">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value as any)}
                className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
              >
                <option value="all">All time</option>
                <option value="day">Last 24h</option>
                <option value="week">Last 7 days</option>
                <option value="month">Last 30 days</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Activities</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-y-auto">
            <AnimatePresence>
              {filteredActivities.length === 0 ? (
                <div className="p-8 text-center">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No activities found</p>
                </div>
              ) : (
                filteredActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors",
                      getSeverityColor(activity.severity)
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium text-foreground">
                            {activity.title}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(activity.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {activity.description}
                        </p>
                        
                        {/* Metadata */}
                        {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(activity.metadata).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="text-xs">
                                {key}: {String(value)}
                              </Badge>
                            ))}
                          </div>
                        )}

                        {/* Related entities */}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                          {activity.taskId && (
                            <span>Task: {getTaskTitle(activity.taskId)}</span>
                          )}
                          {activity.agentId && (
                            <span>Agent: {getAgentName(activity.agentId)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-info" />
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {activities.filter(a => a.type === 'task-created').length}
                </div>
                <div className="text-xs text-muted-foreground">Tasks Created</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-success" />
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {activities.filter(a => a.type === 'task-completed').length}
                </div>
                <div className="text-xs text-muted-foreground">Tasks Completed</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-primary" />
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {activities.filter(a => a.type === 'agent-assigned').length}
                </div>
                <div className="text-xs text-muted-foreground">Agent Assignments</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-warning" />
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {activities.filter(a => a.type === 'time-tracked').length}
                </div>
                <div className="text-xs text-muted-foreground">Time Entries</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
