'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Agent } from '@/types'
import { AgentCard } from '@/components/AgentCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Users, Activity } from 'lucide-react'

interface AgentGridProps {
  agents: Agent[]
  onCreateAgent: () => void
  onEditAgent: (agent: Agent) => void
  onDeleteAgent: (agentId: string) => void
  onSuspendAgent: (agentId: string) => void
  onAssignTask: (agentId: string) => void
}

export function AgentGrid({ 
  agents, 
  onCreateAgent, 
  onEditAgent, 
  onDeleteAgent, 
  onSuspendAgent,
  onAssignTask 
}: AgentGridProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter] = useState<string>('all')

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         agent.capabilities.some(cap => cap.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = typeFilter === 'all' || agent.type === typeFilter
    return matchesSearch && matchesType
  })

  const getCurrentTaskTitle = (agent: Agent) => {
    // This would typically come from the task data
    return agent.currentTaskId ? `Task ${agent.currentTaskId.slice(0, 8)}` : undefined
  }

  const agentStats = {
    total: agents.length,
    idle: agents.filter(a => a.status === 'idle').length,
    working: agents.filter(a => a.status === 'working').length,
    busy: agents.filter(a => a.status === 'busy').length,
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card border-b border-border">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-card-foreground">Agents</h2>
          <Badge variant="secondary" className="text-sm">
            {agentStats.total} agents
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>

          <Button onClick={onCreateAgent} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Agent
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg border border-border">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Users className="h-4 w-4 text-muted-foreground mr-1" />
            <span className="text-sm font-medium text-card-foreground">Total</span>
          </div>
          <div className="text-2xl font-bold text-card-foreground">{agentStats.total}</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <div className="h-2 w-2 bg-success rounded-full mr-1" />
            <span className="text-sm font-medium text-card-foreground">Idle</span>
          </div>
          <div className="text-2xl font-bold text-success">{agentStats.idle}</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Activity className="h-4 w-4 text-info mr-1" />
            <span className="text-sm font-medium text-card-foreground">Working</span>
          </div>
          <div className="text-2xl font-bold text-info">{agentStats.working}</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <div className="h-2 w-2 bg-warning rounded-full mr-1" />
            <span className="text-sm font-medium text-card-foreground">Busy</span>
          </div>
          <div className="text-2xl font-bold text-warning">{agentStats.busy}</div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {filteredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onEdit={onEditAgent}
              onDelete={onDeleteAgent}
              onSuspend={onSuspendAgent}
              onAssignTask={onAssignTask}
              currentTaskTitle={getCurrentTaskTitle(agent)}
            />
          ))}
        </AnimatePresence>
      </div>
      
      {filteredAgents.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="text-muted-foreground mb-4">
            <Users className="mx-auto h-12 w-12" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No agents found</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'Try adjusting your search criteria.' : 'Get started by creating your first agent.'}
          </p>
          {!searchQuery && (
            <Button onClick={onCreateAgent}>
              <Plus className="h-4 w-4 mr-2" />
              Create Agent
            </Button>
          )}
        </motion.div>
      )}
    </div>
  )
}

