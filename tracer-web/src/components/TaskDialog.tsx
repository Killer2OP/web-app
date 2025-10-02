'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Task } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  X, 
  Save, 
  Clock, 
  Users, 
  GitBranch, 
  Target, 
  Calendar,
  FileText,
  Link,
  Plus,
  Trash2,
  AlertCircle
} from 'lucide-react'
import { generateId } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface TaskDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: Task) => void
  task?: Task
  mode: 'create' | 'edit'
  availableTasks?: Task[] // For dependency selection
  availableAgents?: Array<{ id: string; name: string; type: string }> // For agent assignment
}

export function TaskDialog({ isOpen, onClose, onSave, task, mode, availableTasks = [], availableAgents = [] }: TaskDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    estimatedHours: '',
    actualHours: '',
    status: 'pending' as Task['status'],
    agentId: '',
    dependencies: [] as string[],
    notes: '',
  })
  const [activeTab, setActiveTab] = useState('details')

  useEffect(() => {
    if (task && mode === 'edit') {
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        estimatedHours: task.estimatedHours?.toString() || '',
        actualHours: task.actualHours?.toString() || '',
        status: task.status,
        agentId: task.agentId || '',
        dependencies: task.dependencies || [],
        notes: '',
      })
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        estimatedHours: '',
        actualHours: '',
        status: 'pending',
        agentId: '',
        dependencies: [],
        notes: '',
      })
    }
  }, [task, mode, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newTask: Task = {
      id: task?.id || generateId(),
      title: formData.title,
      description: formData.description,
      status: formData.status,
      priority: formData.priority,
      estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : undefined,
      actualHours: formData.actualHours ? parseInt(formData.actualHours) : undefined,
      createdAt: task?.createdAt || new Date(),
      updatedAt: new Date(),
      dependencies: formData.dependencies,
      agentId: formData.agentId || undefined,
    }

    onSave(newTask)
    onClose()
  }

  const handleDependencyToggle = (taskId: string) => {
    setFormData(prev => ({
      ...prev,
      dependencies: prev.dependencies.includes(taskId)
        ? prev.dependencies.filter(id => id !== taskId)
        : [...prev.dependencies, taskId]
    }))
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending': return 'bg-muted text-muted-foreground'
      case 'in-progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'blocked': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-card rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              {mode === 'create' ? 'Create New Task' : 'Edit Task'}
            </h2>
            {task && (
              <p className="text-sm text-muted-foreground mt-1">
                Created {new Date(task.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 mx-6 mt-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
              <TabsTrigger value="assignment">Assignment</TabsTrigger>
              <TabsTrigger value="tracking">Tracking</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Details Tab */}
                <TabsContent value="details" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Title *
                        </label>
                        <Input
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="Enter task title..."
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Description *
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Enter task description..."
                          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
                          rows={4}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Notes
                        </label>
                        <textarea
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="Additional notes..."
                          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
                          rows={3}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Priority
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(['low', 'medium', 'high', 'urgent'] as const).map((priority) => (
                            <button
                              key={priority}
                              type="button"
                              onClick={() => setFormData({ ...formData, priority })}
                              className={cn(
                                "px-3 py-1 text-xs rounded-full border transition-colors",
                                formData.priority === priority
                                  ? getPriorityColor(priority)
                                  : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                              )}
                            >
                              {priority}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Status
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(['pending', 'in-progress', 'completed', 'blocked'] as const).map((status) => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => setFormData({ ...formData, status })}
                              className={cn(
                                "px-3 py-1 text-xs rounded-full border transition-colors",
                                formData.status === status
                                  ? getStatusColor(status)
                                  : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                              )}
                            >
                              {status.replace('-', ' ')}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Estimated Hours
                        </label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <Input
                            type="number"
                            value={formData.estimatedHours}
                            onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
                            placeholder="0"
                            className="pl-10"
                            min="0"
                            step="0.5"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Dependencies Tab */}
                <TabsContent value="dependencies" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <GitBranch className="h-4 w-4" />
                        <span>Task Dependencies</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        Select tasks that must be completed before this task can start.
                      </p>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {availableTasks
                          .filter(t => t.id !== task?.id)
                          .map((availableTask) => (
                            <div
                              key={availableTask.id}
                              className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                              onClick={() => handleDependencyToggle(availableTask.id)}
                            >
                              <input
                                type="checkbox"
                                checked={formData.dependencies.includes(availableTask.id)}
                                onChange={() => handleDependencyToggle(availableTask.id)}
                                className="rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {availableTask.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {availableTask.status} • {availableTask.priority} priority
                                </p>
                              </div>
                              <Badge className={cn("text-xs", getStatusColor(availableTask.status))}>
                                {availableTask.status}
                              </Badge>
                            </div>
                          ))}
                        {availableTasks.filter(t => t.id !== task?.id).length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No other tasks available for dependencies
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Assignment Tab */}
                <TabsContent value="assignment" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>Agent Assignment</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Assign to Agent
                          </label>
                          <select
                            value={formData.agentId}
                            onChange={(e) => setFormData({ ...formData, agentId: e.target.value })}
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
                          >
                            <option value="">No agent assigned</option>
                            {availableAgents.map((agent) => (
                              <option key={agent.id} value={agent.id}>
                                {agent.name} ({agent.type})
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {formData.agentId && (
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              Agent will be notified of this assignment and can start working on the task.
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Tracking Tab */}
                <TabsContent value="tracking" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Target className="h-4 w-4" />
                          <span>Time Tracking</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Actual Hours Spent
                          </label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                              type="number"
                              value={formData.actualHours}
                              onChange={(e) => setFormData({ ...formData, actualHours: e.target.value })}
                              placeholder="0"
                              className="pl-10"
                              min="0"
                              step="0.5"
                            />
                          </div>
                        </div>
                        
                        {formData.estimatedHours && formData.actualHours && (
                          <div className="p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center justify-between text-sm">
                              <span>Estimated:</span>
                              <span>{formData.estimatedHours}h</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Actual:</span>
                              <span>{formData.actualHours}h</span>
                            </div>
                            <div className="flex items-center justify-between text-sm font-medium">
                              <span>Variance:</span>
                              <span className={cn(
                                parseFloat(formData.actualHours) > parseFloat(formData.estimatedHours)
                                  ? "text-red-600"
                                  : "text-green-600"
                              )}>
                                {parseFloat(formData.actualHours) - parseFloat(formData.estimatedHours)}h
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Task Timeline</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {task && (
                          <>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Created:</span>
                              <span>{new Date(task.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Last Updated:</span>
                              <span>{new Date(task.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </>
                        )}
                        
                        <div className="pt-2 border-t">
                          <p className="text-xs text-muted-foreground">
                            Progress will be tracked automatically as the task status changes.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Form Actions */}
                <div className="flex justify-end space-x-2 pt-6 border-t">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    {mode === 'create' ? 'Create Task' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </div>
          </Tabs>
        </div>
      </motion.div>
    </div>
  )
}

