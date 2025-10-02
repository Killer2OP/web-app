'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Task } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { X, Save, Clock, AlertCircle } from 'lucide-react'
import { generateId } from '@/lib/utils'

interface TaskDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (task: Task) => void
  task?: Task
  mode: 'create' | 'edit'
}

export function TaskDialog({ isOpen, onClose, onSave, task, mode }: TaskDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    estimatedHours: '',
  })

  useEffect(() => {
    if (task && mode === 'edit') {
      setFormData({
        title: task.title,
        description: task.description,
        priority: task.priority,
        estimatedHours: task.estimatedHours?.toString() || '',
      })
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        estimatedHours: '',
      })
    }
  }, [task, mode, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newTask: Task = {
      id: task?.id || generateId(),
      title: formData.title,
      description: formData.description,
      status: task?.status || 'pending',
      priority: formData.priority,
      estimatedHours: formData.estimatedHours ? parseInt(formData.estimatedHours) : undefined,
      createdAt: task?.createdAt || new Date(),
      updatedAt: new Date(),
      dependencies: task?.dependencies || [],
      agentId: task?.agentId,
    }

    onSave(newTask)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
      >
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold">
            {mode === 'create' ? 'Create New Task' : 'Edit Task'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter task description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <div className="flex space-x-2">
              {(['low', 'medium', 'high', 'urgent'] as const).map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority })}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    formData.priority === priority
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Hours
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {mode === 'create' ? 'Create Task' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

