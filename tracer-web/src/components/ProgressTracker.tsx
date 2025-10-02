'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  Clock, 
  Target, 
  CheckCircle, 
  AlertCircle, 
  BarChart3,
  Calendar,
  Users,
  Zap
} from 'lucide-react'
import { Task, Agent } from '@/types'
import { cn } from '@/lib/utils'

interface ProgressTrackerProps {
  tasks: Task[]
  agents: Agent[]
  className?: string
}

interface ProgressMetrics {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  pendingTasks: number
  blockedTasks: number
  completionRate: number
  averageEfficiency: number
  estimatedHours: number
  actualHours: number
  timeVariance: number
  criticalPath: number
  agentUtilization: number
}

export function ProgressTracker({ tasks, agents, className }: ProgressTrackerProps) {
  const [metrics, setMetrics] = useState<ProgressMetrics>({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    blockedTasks: 0,
    completionRate: 0,
    averageEfficiency: 0,
    estimatedHours: 0,
    actualHours: 0,
    timeVariance: 0,
    criticalPath: 0,
    agentUtilization: 0,
  })

  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'all'>('all')

  useEffect(() => {
    calculateMetrics()
  }, [tasks, agents, selectedTimeframe])

  const calculateMetrics = () => {
    const now = new Date()
    const timeframe = selectedTimeframe === 'week' ? 7 : selectedTimeframe === 'month' ? 30 : Infinity
    
    const filteredTasks = tasks.filter(task => {
      const daysSinceCreated = (now.getTime() - new Date(task.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      return daysSinceCreated <= timeframe
    })

    const totalTasks = filteredTasks.length
    const completedTasks = filteredTasks.filter(t => t.status === 'completed').length
    const inProgressTasks = filteredTasks.filter(t => t.status === 'in-progress').length
    const pendingTasks = filteredTasks.filter(t => t.status === 'pending').length
    const blockedTasks = filteredTasks.filter(t => t.status === 'blocked').length

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    const estimatedHours = filteredTasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0)
    const actualHours = filteredTasks.reduce((sum, task) => sum + (task.actualHours || 0), 0)
    const timeVariance = actualHours - estimatedHours

    const averageEfficiency = agents.length > 0 
      ? agents.reduce((sum, agent) => sum + agent.efficiency, 0) / agents.length 
      : 0

    const criticalPath = filteredTasks.filter(task => 
      task.status === 'blocked' || 
      (task.dependencies.length > 0 && !task.dependencies.every(dep => 
        filteredTasks.find(t => t.id === dep)?.status === 'completed'
      ))
    ).length

    const workingAgents = agents.filter(agent => agent.status === 'working').length
    const agentUtilization = agents.length > 0 ? (workingAgents / agents.length) * 100 : 0

    setMetrics({
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      blockedTasks,
      completionRate,
      averageEfficiency,
      estimatedHours,
      actualHours,
      timeVariance,
      criticalPath,
      agentUtilization,
    })
  }

  const getProgressColor = (value: number, max: number = 100) => {
    const percentage = (value / max) * 100
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-yellow-500'
    if (percentage >= 40) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'in-progress': return <TrendingUp className="h-4 w-4 text-blue-600" />
      case 'blocked': return <AlertCircle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const ProgressBar = ({ value, max, label, color }: { value: number; max: number; label: string; color?: string }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}/{max}</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <motion.div
          className={cn("h-2 rounded-full", color || getProgressColor(value, max))}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min((value / max) * 100, 100)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  )

  return (
    <div className={cn("space-y-6", className)}>
      {/* Timeframe Selector */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-foreground">Timeframe:</span>
        <div className="flex space-x-1">
          {(['week', 'month', 'all'] as const).map((timeframe) => (
            <Button
              key={timeframe}
              variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe(timeframe)}
            >
              {timeframe === 'week' ? '7 days' : timeframe === 'month' ? '30 days' : 'All time'}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Progress Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Overall Completion</h3>
              <Badge variant="outline" className="text-lg px-3 py-1">
                {Math.round(metrics.completionRate)}%
              </Badge>
            </div>
            <ProgressBar
              value={metrics.completedTasks}
              max={metrics.totalTasks}
              label="Tasks Completed"
              color="bg-primary"
            />
          </div>

          {/* Task Status Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {getStatusIcon('completed')}
              </div>
              <div className="text-2xl font-bold text-green-600">{metrics.completedTasks}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {getStatusIcon('in-progress')}
              </div>
              <div className="text-2xl font-bold text-blue-600">{metrics.inProgressTasks}</div>
              <div className="text-xs text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {getStatusIcon('pending')}
              </div>
              <div className="text-2xl font-bold text-gray-600">{metrics.pendingTasks}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {getStatusIcon('blocked')}
              </div>
              <div className="text-2xl font-bold text-red-600">{metrics.blockedTasks}</div>
              <div className="text-xs text-muted-foreground">Blocked</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Time Tracking</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{metrics.estimatedHours}h</div>
              <div className="text-xs text-muted-foreground">Estimated</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-foreground">{metrics.actualHours}h</div>
              <div className="text-xs text-muted-foreground">Actual</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className={cn(
                "text-2xl font-bold",
                metrics.timeVariance > 0 ? "text-red-600" : "text-green-600"
              )}>
                {metrics.timeVariance > 0 ? '+' : ''}{metrics.timeVariance}h
              </div>
              <div className="text-xs text-muted-foreground">Variance</div>
            </div>
          </div>

          {metrics.estimatedHours > 0 && (
            <ProgressBar
              value={metrics.actualHours}
              max={metrics.estimatedHours}
              label="Time Progress"
              color={metrics.timeVariance > 0 ? "bg-red-500" : "bg-green-500"}
            />
          )}
        </CardContent>
      </Card>

      {/* Agent Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Agent Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {Math.round(metrics.averageEfficiency * 100)}%
              </div>
              <div className="text-xs text-muted-foreground">Avg Efficiency</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-foreground">
                {Math.round(metrics.agentUtilization)}%
              </div>
              <div className="text-xs text-muted-foreground">Utilization</div>
            </div>
          </div>

          <ProgressBar
            value={metrics.averageEfficiency * 100}
            max={100}
            label="Average Efficiency"
            color="bg-blue-500"
          />

          <ProgressBar
            value={metrics.agentUtilization}
            max={100}
            label="Agent Utilization"
            color="bg-purple-500"
          />
        </CardContent>
      </Card>

      {/* Critical Path Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Critical Path Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-foreground">{metrics.criticalPath}</div>
            <div className="text-xs text-muted-foreground">Blocked Tasks</div>
          </div>

          {metrics.criticalPath > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <p className="text-sm text-yellow-800">
                  {metrics.criticalPath} task{metrics.criticalPath !== 1 ? 's' : ''} {metrics.criticalPath === 1 ? 'is' : 'are'} blocked and may delay project completion.
                </p>
              </div>
            </div>
          )}

          <ProgressBar
            value={metrics.totalTasks - metrics.criticalPath}
            max={metrics.totalTasks}
            label="Unblocked Tasks"
            color="bg-green-500"
          />
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Performance Insights</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.completionRate >= 80 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-800">
                    Excellent progress! You're on track to complete the project successfully.
                  </p>
                </div>
              </div>
            )}

            {metrics.timeVariance > 0 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <p className="text-sm text-orange-800">
                    Tasks are taking {metrics.timeVariance}h longer than estimated. Consider reviewing estimates.
                  </p>
                </div>
              </div>
            )}

            {metrics.agentUtilization < 50 && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-blue-800">
                    Low agent utilization. Consider assigning more tasks or optimizing workload distribution.
                  </p>
                </div>
              </div>
            )}

            {metrics.completionRate < 30 && metrics.totalTasks > 5 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <p className="text-sm text-red-800">
                    Low completion rate. Consider breaking down tasks into smaller, manageable pieces.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
