'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Task } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Clock, 
  User, 
  AlertCircle, 
  CheckCircle, 
  PlayCircle, 
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onAssign: (taskId: string) => void
  agentName?: string
}

const statusConfig = {
  pending: { 
    icon: Clock, 
    color: 'text-pending', 
    badge: 'bg-pending/10 text-pending border-pending/20' 
  },
  'in-progress': { 
    icon: PlayCircle, 
    color: 'text-in-progress', 
    badge: 'bg-in-progress/10 text-in-progress border-in-progress/20' 
  },
  completed: { 
    icon: CheckCircle, 
    color: 'text-completed', 
    badge: 'bg-completed/10 text-completed border-completed/20' 
  },
  blocked: { 
    icon: AlertCircle, 
    color: 'text-blocked', 
    badge: 'bg-blocked/10 text-blocked border-blocked/20' 
  },
}

const priorityConfig = {
  low: 'bg-low/10 text-low border-low/20',
  medium: 'bg-medium/10 text-medium border-medium/20',
  high: 'bg-high/10 text-high border-high/20',
  urgent: 'bg-urgent/10 text-urgent border-urgent/20',
}

export function TaskCard({ task, onEdit, onDelete, onAssign, agentName }: TaskCardProps) {
  const [showActions, setShowActions] = useState(false)
  const StatusIcon = statusConfig[task.status].icon

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
            <CardTitle className="text-sm font-medium line-clamp-2">
              {task.title}
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
                    onClick={() => onEdit(task)}
                    className="w-full justify-start"
                  >
                    <Edit className="h-3 w-3 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(task.id)}
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
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {task.description}
          </p>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <StatusIcon className={cn("h-4 w-4", statusConfig[task.status].color)} />
              <Badge variant="outline" className={cn("text-xs border", statusConfig[task.status].badge)}>
                {task.status.replace('-', ' ')}
              </Badge>
            </div>
            
            <Badge variant="outline" className={cn("text-xs border", priorityConfig[task.priority])}>
              {task.priority}
            </Badge>
          </div>

          {agentName && (
            <div className="flex items-center space-x-2 mb-3">
              <User className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{agentName}</span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>
                {task.estimatedHours ? `${task.estimatedHours}h` : 'No estimate'}
              </span>
            </div>
            
            {task.status === 'pending' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAssign(task.id)}
                className="text-xs h-6 px-2"
              >
                Assign
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

