'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TaskGrid } from '@/components/TaskGrid'
import { AgentGrid } from '@/components/AgentGrid'
import { PlanningBoard } from '@/components/PlanningBoard'
import { TaskDialog } from '@/components/TaskDialog'
import { AgentDialog } from '@/components/AgentDialog'
import { AssignTaskDialog } from '@/components/AssignTaskDialog'
import { ProgressTracker } from '@/components/ProgressTracker'
import { ActivityLog } from '@/components/ActivityLog'
import { ProjectManager } from '@/components/ProjectManager'
import { SearchAndFilter } from '@/components/SearchAndFilter'
import { useApp } from '@/context/AppContext'
import { useKeyboardShortcuts, KeyboardShortcutsHelp } from '@/hooks/useKeyboardShortcuts'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Task, Agent } from '@/types'
import { 
  Plus, 
  Users, 
  CheckSquare, 
  Activity,
  TrendingUp,
  Zap
} from 'lucide-react'
import { generateId } from '@/lib/utils'

/**
 * Dashboard component - Main application interface
 * 
 * This is the primary component that orchestrates the entire Traycer application.
 * It provides:
 * - Tabbed interface for different views (Overview, Tasks, Agents, Planning)
 * - Statistics and metrics display
 * - Task and agent management
 * - Keyboard shortcuts integration
 * - Sample data initialization
 * 
 * The dashboard manages multiple dialog states and coordinates between
 * different child components for a cohesive user experience.
 */
export function Dashboard() {
  // Access global application state and dispatch function
  const { state, dispatch } = useApp()
  
  // Local state for UI management
  const [activeTab, setActiveTab] = useState('projects')
  
  // Dialog state management
  const [taskDialog, setTaskDialog] = useState<{ isOpen: boolean; task?: Task; mode: 'create' | 'edit' }>({
    isOpen: false,
    mode: 'create'
  })
  const [agentDialog, setAgentDialog] = useState<{ isOpen: boolean; agent?: Agent; mode: 'create' | 'edit' }>({
    isOpen: false,
    mode: 'create'
  })
  const [assignDialog, setAssignDialog] = useState<{ isOpen: boolean; taskId: string; taskTitle?: string }>({
    isOpen: false,
    taskId: ''
  })

  // Get current project data
  const currentProject = state.currentProject
  const tasks = currentProject?.tasks || []
  const agents = currentProject?.agents || []
  const projects = state.projects

  // Filtered data state
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(tasks)
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>(agents)

  /**
   * Calculate application statistics
   * 
   * Computes various metrics from the current project's tasks and agents
   * for display in the overview tab.
   */
  const stats = {
    totalTasks: filteredTasks.length,
    completedTasks: filteredTasks.filter(t => t.status === 'completed').length,
    inProgressTasks: filteredTasks.filter(t => t.status === 'in-progress').length,
    pendingTasks: filteredTasks.filter(t => t.status === 'pending').length,
    totalAgents: filteredAgents.length,
    idleAgents: filteredAgents.filter(a => a.status === 'idle').length,
    workingAgents: filteredAgents.filter(a => a.status === 'working').length,
  }

  // Task management handlers
  const handleCreateTask = () => {
    setTaskDialog({ isOpen: true, mode: 'create' })
  }

  const handleEditTask = (task: Task) => {
    setTaskDialog({ isOpen: true, task, mode: 'edit' })
  }

  const handleDeleteTask = (taskId: string) => {
    if (currentProject) {
      dispatch({ type: 'DELETE_TASK', payload: { projectId: currentProject.id, taskId } })
    }
  }

  const handleSaveTask = (task: Task) => {
    if (currentProject) {
      if (taskDialog.mode === 'create') {
        dispatch({ type: 'CREATE_TASK', payload: { projectId: currentProject.id, task } })
      } else {
        dispatch({ type: 'UPDATE_TASK', payload: { projectId: currentProject.id, taskId: task.id, updates: task } })
      }
    }
  }

  // Agent management handlers
  const handleCreateAgent = () => {
    setAgentDialog({ isOpen: true, mode: 'create' })
  }

  const handleEditAgent = (agent: Agent) => {
    setAgentDialog({ isOpen: true, agent, mode: 'edit' })
  }

  const handleDeleteAgent = (agentId: string) => {
    if (currentProject) {
      dispatch({ type: 'DELETE_AGENT', payload: { projectId: currentProject.id, agentId } })
    }
  }

  const handleSuspendAgent = (agentId: string) => {
    if (currentProject) {
      dispatch({ type: 'SUSPEND_AGENT', payload: { projectId: currentProject.id, agentId } })
    }
  }

  const handleSaveAgent = (agent: Agent) => {
    if (currentProject) {
      if (agentDialog.mode === 'create') {
        dispatch({ type: 'CREATE_AGENT', payload: { projectId: currentProject.id, agent } })
      } else {
        dispatch({ type: 'UPDATE_AGENT', payload: { projectId: currentProject.id, agentId: agent.id, updates: agent } })
      }
    }
  }

  // Task assignment handlers
  const handleAssignTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    setAssignDialog({ isOpen: true, taskId, taskTitle: task?.title })
  }

  const handleAssignTaskToAgent = (taskId: string, agentId: string) => {
    if (currentProject) {
      dispatch({ type: 'ASSIGN_TASK', payload: { projectId: currentProject.id, taskId, agentId } })
    }
  }

  const handleAssignTaskFromAgent = (agentId: string) => {
    // Find a pending task to assign
    const pendingTask = tasks.find(t => t.status === 'pending')
    if (pendingTask) {
      handleAssignTaskToAgent(pendingTask.id, agentId)
    }
  }


  // Project management handlers
  const handleProjectCreate = (project: Project) => {
    dispatch({ type: 'CREATE_PROJECT', payload: project })
  }

  const handleProjectSelect = (project: Project) => {
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: project })
    setActiveTab('overview')
  }

  const handleProjectUpdate = (projectId: string, updates: Partial<Project>) => {
    dispatch({ type: 'UPDATE_PROJECT', payload: { projectId, updates } })
  }

  const handleProjectDelete = (projectId: string) => {
    dispatch({ type: 'DELETE_PROJECT', payload: { projectId } })
  }

  // Search and filter handlers
  const handleFilteredTasks = (tasks: Task[]) => {
    setFilteredTasks(tasks)
  }

  const handleFilteredAgents = (agents: Agent[]) => {
    setFilteredAgents(agents)
  }

  /**
   * Initialize sample data if no project exists
   * 
   * Creates a sample project with tasks and agents to demonstrate
   * the application's functionality. Uses static dates to prevent
   * hydration mismatches.
   */
  useEffect(() => {
    if (!currentProject) {
      // Generate IDs for sample data
      const task1Id = generateId()
      const task2Id = generateId()
      const task3Id = generateId()
      const task4Id = generateId()
      const task5Id = generateId()
      
      // Use static dates to prevent hydration mismatch
      const staticDate = new Date('2024-01-01T00:00:00Z')
      
      // Create sample project with realistic data
      const sampleProject = {
        id: generateId(),
        name: 'Sample Project',
        description: 'A sample project to demonstrate Traycer functionality',
        tasks: [
          {
            id: task1Id,
            title: 'Setup project structure',
            description: 'Initialize the project with proper folder structure and dependencies',
            status: 'completed' as const,
            priority: 'high' as const,
            estimatedHours: 2,
            createdAt: staticDate,
            updatedAt: staticDate,
            dependencies: [],
          },
          {
            id: task2Id,
            title: 'Implement user authentication',
            description: 'Add login and registration functionality with JWT tokens',
            status: 'in-progress' as const,
            priority: 'high' as const,
            estimatedHours: 4,
            createdAt: staticDate,
            updatedAt: staticDate,
            dependencies: [],
          },
          {
            id: task3Id,
            title: 'Create dashboard UI',
            description: 'Build the main dashboard with task and agent management',
            status: 'pending' as const,
            priority: 'medium' as const,
            estimatedHours: 3,
            createdAt: staticDate,
            updatedAt: staticDate,
            dependencies: [task2Id],
          },
          {
            id: task4Id,
            title: 'Add user profile management',
            description: 'Implement user profile editing and settings',
            status: 'pending' as const,
            priority: 'low' as const,
            estimatedHours: 2,
            createdAt: staticDate,
            updatedAt: staticDate,
            dependencies: [task2Id],
          },
          {
            id: task5Id,
            title: 'Implement real-time notifications',
            description: 'Add WebSocket support for real-time updates',
            status: 'pending' as const,
            priority: 'high' as const,
            estimatedHours: 4,
            createdAt: staticDate,
            updatedAt: staticDate,
            dependencies: [task3Id],
          },
        ],
        agents: [
          {
            id: generateId(),
            name: 'Frontend Agent',
            type: 'frontend' as const,
            status: 'working' as const,
            capabilities: ['React', 'TypeScript', 'Tailwind CSS'],
            efficiency: 0.9,
            currentTaskId: task2Id,
          },
          {
            id: generateId(),
            name: 'Backend Agent',
            type: 'backend' as const,
            status: 'idle' as const,
            capabilities: ['Node.js', 'Express', 'PostgreSQL'],
            efficiency: 0.85,
          },
          {
            id: generateId(),
            name: 'Full Stack Agent',
            type: 'fullstack' as const,
            status: 'idle' as const,
            capabilities: ['React', 'Node.js', 'MongoDB', 'Docker'],
            efficiency: 0.8,
          },
        ],
        createdAt: staticDate,
        updatedAt: staticDate,
      }
      
      // Create the sample project
      dispatch({ type: 'CREATE_PROJECT', payload: sampleProject })
    }
  }, [currentProject, dispatch])

  /**
   * Set up keyboard shortcuts for common actions
   * 
   * Integrates global keyboard shortcuts for improved user experience.
   * Shortcuts include task creation, agent creation, search, and dialog closing.
   */
  useKeyboardShortcuts({
    onCreateTask: handleCreateTask,
    onCreateAgent: handleCreateAgent,
    onSearch: () => {
      // Focus search input - would need to implement search focus
      console.log('Search shortcut triggered')
    },
    onEscape: () => {
      // Close any open dialogs
      setTaskDialog({ isOpen: false, mode: 'create' })
      setAgentDialog({ isOpen: false, mode: 'create' })
      setAssignDialog({ isOpen: false, taskId: '' })
    },
    onCreateProject: () => {
      // This would trigger project creation - for now just log
      console.log('Create project shortcut triggered')
    },
    onGoToProjects: () => setActiveTab('projects'),
    onGoToOverview: () => setActiveTab('overview'),
    onGoToTasks: () => setActiveTab('tasks'),
    onGoToAgents: () => setActiveTab('agents'),
    onGoToPlanning: () => setActiveTab('planning'),
    onGoToProgress: () => setActiveTab('progress'),
    onGoToActivity: () => setActiveTab('activity'),
    onToggleTheme: () => {
      // This would toggle theme - for now just log
      console.log('Toggle theme shortcut triggered')
    },
    onOpenAI: () => {
      // This would open AI assistant - for now just log
      console.log('Open AI assistant shortcut triggered')
    },
    onSave: () => {
      // This would save current state - for now just log
      console.log('Save shortcut triggered')
    },
    onUndo: () => {
      // This would undo last action - for now just log
      console.log('Undo shortcut triggered')
    },
    onRedo: () => {
      // This would redo last action - for now just log
      console.log('Redo shortcut triggered')
    },
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Application Header */}
      <div className="bg-card border-b border-border">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Traycer</h1>
              <p className="text-sm text-muted-foreground">AI-Powered Development Planning</p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="outline" className="text-xs">
                <Zap className="h-3 w-3 mr-1" />
                Planning Layer
              </Badge>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Main Application Content */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="planning">Planning</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Projects Tab - Project Management */}
          <TabsContent value="projects">
            <ProjectManager
              projects={projects}
              currentProject={currentProject}
              onProjectCreate={handleProjectCreate}
              onProjectSelect={handleProjectSelect}
              onProjectUpdate={handleProjectUpdate}
              onProjectDelete={handleProjectDelete}
            />
          </TabsContent>

          {/* Overview Tab - Statistics and Quick Actions */}
          <TabsContent value="overview" className="space-y-6">
            {/* Search and Filter */}
            <SearchAndFilter
              tasks={tasks}
              agents={agents}
              onFilteredTasks={handleFilteredTasks}
              onFilteredAgents={handleFilteredAgents}
            />
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                  <CheckSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTasks}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.completedTasks} completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.inProgressTasks}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.pendingTasks} pending
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.workingAgents}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.idleAgents} idle
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {Math.round((stats.completedTasks / Math.max(stats.totalTasks, 1)) * 100)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Completion rate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions Section */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Button onClick={handleCreateTask}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Task
                  </Button>
                  <Button variant="outline" onClick={handleCreateAgent}>
                    <Users className="h-4 w-4 mr-2" />
                    Add Agent
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity Feed */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredTasks.slice(0, 3).map((task) => (
                    <div key={task.id} className="flex items-center space-x-3">
                      <div className={`h-2 w-2 rounded-full ${
                        task.status === 'completed' ? 'bg-success' :
                        task.status === 'in-progress' ? 'bg-info' :
                        'bg-muted-foreground'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {task.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {task.status.replace('-', ' ')} • {task.priority} priority
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Keyboard Shortcuts Help */}
            <Card>
              <CardHeader>
                <CardTitle>Keyboard Shortcuts</CardTitle>
              </CardHeader>
              <CardContent>
                <KeyboardShortcutsHelp />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab - Task Management Grid */}
          <TabsContent value="tasks">
            <SearchAndFilter
              tasks={tasks}
              agents={agents}
              onFilteredTasks={handleFilteredTasks}
              onFilteredAgents={handleFilteredAgents}
            />
            <TaskGrid
              tasks={filteredTasks}
              agents={filteredAgents}
              onCreateTask={handleCreateTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onAssignTask={handleAssignTask}
            />
          </TabsContent>

          {/* Agents Tab - Agent Management Grid */}
          <TabsContent value="agents">
            <SearchAndFilter
              tasks={tasks}
              agents={agents}
              onFilteredTasks={handleFilteredTasks}
              onFilteredAgents={handleFilteredAgents}
            />
            <AgentGrid
              agents={filteredAgents}
              onCreateAgent={handleCreateAgent}
              onEditAgent={handleEditAgent}
              onDeleteAgent={handleDeleteAgent}
              onSuspendAgent={handleSuspendAgent}
              onAssignTask={handleAssignTaskFromAgent}
            />
          </TabsContent>

          {/* Planning Tab - Visual Planning Board */}
          <TabsContent value="planning">
            <SearchAndFilter
              tasks={tasks}
              agents={agents}
              onFilteredTasks={handleFilteredTasks}
              onFilteredAgents={handleFilteredAgents}
            />
            <PlanningBoard
              tasks={filteredTasks}
              agents={filteredAgents}
              onTaskUpdate={(taskId, updates) => {
                if (currentProject) {
                  dispatch({ type: 'UPDATE_TASK', payload: { projectId: currentProject.id, taskId, updates } })
                }
              }}
              onAgentUpdate={(agentId, updates) => {
                if (currentProject) {
                  dispatch({ type: 'UPDATE_AGENT', payload: { projectId: currentProject.id, agentId, updates } })
                }
              }}
            />
          </TabsContent>

          {/* Progress Tab - Progress Tracking and Analytics */}
          <TabsContent value="progress">
            <ProgressTracker
              tasks={filteredTasks}
              agents={filteredAgents}
            />
          </TabsContent>

          {/* Activity Tab - Activity Log and History */}
          <TabsContent value="activity">
            <ActivityLog
              tasks={filteredTasks}
              agents={filteredAgents}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal Dialogs */}
      <TaskDialog
        isOpen={taskDialog.isOpen}
        onClose={() => setTaskDialog({ isOpen: false, mode: 'create' })}
        onSave={handleSaveTask}
        task={taskDialog.task}
        mode={taskDialog.mode}
        availableTasks={filteredTasks}
        availableAgents={filteredAgents.map(agent => ({ id: agent.id, name: agent.name, type: agent.type }))}
      />

      <AgentDialog
        isOpen={agentDialog.isOpen}
        onClose={() => setAgentDialog({ isOpen: false, mode: 'create' })}
        onSave={handleSaveAgent}
        agent={agentDialog.agent}
        mode={agentDialog.mode}
      />

      <AssignTaskDialog
        isOpen={assignDialog.isOpen}
        onClose={() => setAssignDialog({ isOpen: false, taskId: '' })}
        onAssign={handleAssignTaskToAgent}
        taskId={assignDialog.taskId}
        agents={filteredAgents}
        taskTitle={assignDialog.taskTitle}
      />

    </div>
  )
}
