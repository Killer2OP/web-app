'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Agent } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Pause,
  MoreHorizontal,
  Edit,
  Trash2,
  Play
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface AgentCardProps {
  agent: Agent
  onEdit: (agent: Agent) => void
  onDelete: (agentId: string) => void
  onSuspend: (agentId: string) => void
  onAssignTask: (agentId: string) => void
  currentTaskTitle?: string
}

const statusConfig = {
  idle: { 
    icon: CheckCircle, 
    color: 'text-success', 
    badge: 'bg-success/10 text-success border-success/20' 
  },
  working: { 
    icon: Activity, 
    color: 'text-info', 
    badge: 'bg-info/10 text-info border-info/20' 
  },
  busy: { 
    icon: AlertCircle, 
    color: 'text-warning', 
    badge: 'bg-warning/10 text-warning border-warning/20' 
  },
  suspended: { 
    icon: Pause, 
    color: 'text-muted-foreground', 
    badge: 'bg-muted/10 text-muted-foreground border-muted/20' 
  },
}

const typeConfig = {
  frontend: 'bg-info/10 text-info border-info/20',
  backend: 'bg-success/10 text-success border-success/20',
  fullstack: 'bg-primary/10 text-primary border-primary/20',
  devops: 'bg-warning/10 text-warning border-warning/20',
  ai: 'bg-destructive/10 text-destructive border-destructive/20',
}

export function AgentCard({ 
  agent, 
  onEdit, 
  onDelete, 
  onSuspend,
  onAssignTask, 
  currentTaskTitle 
}: AgentCardProps) {
  const [showActions, setShowActions] = useState(false)
  const StatusIcon = statusConfig[agent.status].icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-sm font-medium">
              {agent.name}
            </CardTitle>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setShowActions(!showActions)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-0 top-full mt-1 bg-card border border-border rounded-md shadow-lg p-1 z-10 min-w-[120px]"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(agent)}
                    className="w-full justify-start"
                  >
                    <Edit className="h-3 w-3 mr-2" />
                    Edit
                  </Button>
                  {agent.status === 'working' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSuspend(agent.id)}
                      className="w-full justify-start text-warning hover:text-warning/80"
                    >
                      <Pause className="h-3 w-3 mr-2" />
                      Suspend
                    </Button>
                  )}
                  {agent.status === 'suspended' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(agent)}
                      className="w-full justify-start text-success hover:text-success/80"
                    >
                      <Play className="h-3 w-3 mr-2" />
                      Resume
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(agent.id)}
                    className="w-full justify-start text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <StatusIcon className={cn("h-4 w-4", statusConfig[agent.status].color)} />
              <Badge variant="outline" className={cn("text-xs border", statusConfig[agent.status].badge)}>
                {agent.status}
              </Badge>
            </div>
            
            <Badge variant="outline" className={cn("text-xs border", typeConfig[agent.type])}>
              {agent.type}
            </Badge>
          </div>

          {currentTaskTitle && (
            <div className="mb-3 p-2 bg-muted rounded-md">
              <div className="flex items-center space-x-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Working on:</span>
              </div>
              <p className="text-xs font-medium mt-1 line-clamp-1 text-foreground">
                {currentTaskTitle}
              </p>
            </div>
          )}

          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Efficiency</span>
              <span>{Math.round(agent.efficiency * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${agent.efficiency * 100}%` }}
              />
            </div>
          </div>

          <div className="mb-3">
            <p className="text-xs text-muted-foreground mb-1">Capabilities</p>
            <div className="flex flex-wrap gap-1">
              {agent.capabilities.slice(0, 3).map((capability, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {capability}
                </Badge>
              ))}
              {agent.capabilities.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{agent.capabilities.length - 3}
                </Badge>
              )}
            </div>
          </div>

          {agent.status === 'idle' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAssignTask(agent.id)}
              className="w-full text-xs h-6"
            >
              <Play className="h-3 w-3 mr-1" />
              Assign Task
            </Button>
          )}
          
          {agent.status === 'suspended' && (
            <div className="text-xs text-muted-foreground text-center p-2 bg-muted/50 rounded-md">
              Agent is suspended. Edit to resume.
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

