'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Agent } from '@/types'
import { Button } from '@/components/ui/button'
import { X, User, CheckCircle } from 'lucide-react'

interface AssignTaskDialogProps {
  isOpen: boolean
  onClose: () => void
  onAssign: (taskId: string, agentId: string) => void
  taskId: string
  agents: Agent[]
  taskTitle?: string
}

export function AssignTaskDialog({ 
  isOpen, 
  onClose, 
  onAssign, 
  taskId, 
  agents, 
  taskTitle 
}: AssignTaskDialogProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('')

  const availableAgents = agents.filter(agent => agent.status === 'idle')

  const handleAssign = () => {
    if (selectedAgentId) {
      onAssign(taskId, selectedAgentId)
      onClose()
      setSelectedAgentId('')
    }
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
          <h2 className="text-lg font-semibold">Assign Task</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {taskTitle && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600 mb-1">Task:</p>
              <p className="font-medium">{taskTitle}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Agent
            </label>
            
            {availableAgents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User className="mx-auto h-8 w-8 mb-2" />
                <p>No available agents</p>
                <p className="text-xs">All agents are currently busy</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableAgents.map((agent) => (
                  <div
                    key={agent.id}
                    className={`p-3 border rounded-md cursor-pointer transition-colors ${
                      selectedAgentId === agent.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedAgentId(agent.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{agent.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{agent.type}</p>
                      </div>
                      
                      {selectedAgentId === agent.id && (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    
                    <div className="mt-2">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Efficiency</span>
                        <span>{Math.round(agent.efficiency * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-blue-500 h-1 rounded-full"
                          style={{ width: `${agent.efficiency * 100}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Capabilities:</p>
                      <div className="flex flex-wrap gap-1">
                        {agent.capabilities.slice(0, 3).map((capability, index) => (
                          <span
                            key={index}
                            className="px-1 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                          >
                            {capability}
                          </span>
                        ))}
                        {agent.capabilities.length > 3 && (
                          <span className="px-1 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                            +{agent.capabilities.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssign}
              disabled={!selectedAgentId || availableAgents.length === 0}
            >
              Assign Task
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

