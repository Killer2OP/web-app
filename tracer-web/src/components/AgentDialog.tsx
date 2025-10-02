'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Agent } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Save, User } from 'lucide-react'
import { generateId } from '@/lib/utils'

interface AgentDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (agent: Agent) => void
  agent?: Agent
  mode: 'create' | 'edit'
}

export function AgentDialog({ isOpen, onClose, onSave, agent, mode }: AgentDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'fullstack' as Agent['type'],
    capabilities: [] as string[],
    efficiency: 0.8,
  })
  const [newCapability, setNewCapability] = useState('')

  useEffect(() => {
    if (agent && mode === 'edit') {
      setFormData({
        name: agent.name,
        type: agent.type,
        capabilities: agent.capabilities,
        efficiency: agent.efficiency,
      })
    } else {
      setFormData({
        name: '',
        type: 'fullstack',
        capabilities: [],
        efficiency: 0.8,
      })
    }
  }, [agent, mode, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newAgent: Agent = {
      id: agent?.id || generateId(),
      name: formData.name,
      type: formData.type,
      status: agent?.status || 'idle',
      capabilities: formData.capabilities,
      efficiency: formData.efficiency,
      currentTaskId: agent?.currentTaskId,
    }

    onSave(newAgent)
    onClose()
  }

  const addCapability = () => {
    if (newCapability.trim() && !formData.capabilities.includes(newCapability.trim())) {
      setFormData({
        ...formData,
        capabilities: [...formData.capabilities, newCapability.trim()],
      })
      setNewCapability('')
    }
  }

  const removeCapability = (capability: string) => {
    setFormData({
      ...formData,
      capabilities: formData.capabilities.filter(cap => cap !== capability),
    })
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
            {mode === 'create' ? 'Create New Agent' : 'Edit Agent'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter agent name..."
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Agent['type'] })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="fullstack">Full Stack</option>
              <option value="devops">DevOps</option>
              <option value="ai">AI/ML</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capabilities
            </label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  value={newCapability}
                  onChange={(e) => setNewCapability(e.target.value)}
                  placeholder="Add capability..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCapability())}
                />
                <Button type="button" onClick={addCapability} size="sm">
                  Add
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.capabilities.map((capability, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                  >
                    {capability}
                    <button
                      type="button"
                      onClick={() => removeCapability(capability)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Efficiency: {Math.round(formData.efficiency * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={formData.efficiency}
              onChange={(e) => setFormData({ ...formData, efficiency: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {mode === 'create' ? 'Create Agent' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

