'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FolderPlus, 
  Folder, 
  Settings, 
  Trash2, 
  Edit, 
  Plus,
  Calendar,
  Users,
  CheckSquare,
  Activity,
  MoreVertical,
  Copy,
  Download,
  Upload
} from 'lucide-react'
import { Project, Task, Agent } from '@/types'
import { generateId } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface ProjectManagerProps {
  projects: Project[]
  currentProject: Project | null
  onProjectCreate: (project: Project) => void
  onProjectSelect: (project: Project) => void
  onProjectUpdate: (projectId: string, updates: Partial<Project>) => void
  onProjectDelete: (projectId: string) => void
  className?: string
}

export function ProjectManager({
  projects,
  currentProject,
  onProjectCreate,
  onProjectSelect,
  onProjectUpdate,
  onProjectDelete,
  className
}: ProjectManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [newProjectData, setNewProjectData] = useState({
    name: '',
    description: ''
  })

  const handleCreateProject = () => {
    if (!newProjectData.name.trim()) return

    const newProject: Project = {
      id: generateId(),
      name: newProjectData.name.trim(),
      description: newProjectData.description.trim(),
      tasks: [],
      agents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    onProjectCreate(newProject)
    setNewProjectData({ name: '', description: '' })
    setIsCreateDialogOpen(false)
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setNewProjectData({
      name: project.name,
      description: project.description
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateProject = () => {
    if (!editingProject || !newProjectData.name.trim()) return

    onProjectUpdate(editingProject.id, {
      name: newProjectData.name.trim(),
      description: newProjectData.description.trim(),
      updatedAt: new Date(),
    })

    setEditingProject(null)
    setNewProjectData({ name: '', description: '' })
    setIsEditDialogOpen(false)
  }

  const handleDeleteProject = (projectId: string) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      onProjectDelete(projectId)
    }
  }

  const getProjectStats = (project: Project) => {
    const totalTasks = project.tasks.length
    const completedTasks = project.tasks.filter(t => t.status === 'completed').length
    const inProgressTasks = project.tasks.filter(t => t.status === 'in-progress').length
    const totalAgents = project.agents.length
    const activeAgents = project.agents.filter(a => a.status === 'working').length

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      totalAgents,
      activeAgents,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Projects</h2>
          <p className="text-muted-foreground">Manage your development projects</p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Current Project Info */}
      {currentProject && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Folder className="h-6 w-6 text-primary" />
                <div>
                  <CardTitle className="text-foreground">{currentProject.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{currentProject.description}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-primary border-primary">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(() => {
                const stats = getProjectStats(currentProject)
                return (
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">{stats.totalTasks}</div>
                      <div className="text-xs text-muted-foreground">Total Tasks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.completedTasks}</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.activeAgents}</div>
                      <div className="text-xs text-muted-foreground">Active Agents</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats.completionRate}%</div>
                      <div className="text-xs text-muted-foreground">Progress</div>
                    </div>
                  </>
                )
              })()}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {projects.map((project, index) => {
            const stats = getProjectStats(project)
            const isCurrentProject = currentProject?.id === project.id

            return (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                  "card-hover",
                  isCurrentProject && "ring-2 ring-primary"
                )}
              >
                <Card className={cn(
                  "h-full cursor-pointer transition-all",
                  isCurrentProject && "bg-primary/5 border-primary/20"
                )}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <Folder className={cn(
                          "h-5 w-5 flex-shrink-0",
                          isCurrentProject ? "text-primary" : "text-muted-foreground"
                        )} />
                        <div className="min-w-0 flex-1">
                          <CardTitle className="text-lg truncate">{project.name}</CardTitle>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {project.description || 'No description'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        {isCurrentProject && (
                          <Badge variant="outline" className="text-xs text-primary border-primary">
                            Active
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditProject(project)
                          }}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Project Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-2 bg-muted/50 rounded-lg">
                          <div className="text-lg font-bold text-foreground">{stats.totalTasks}</div>
                          <div className="text-xs text-muted-foreground">Tasks</div>
                        </div>
                        <div className="text-center p-2 bg-muted/50 rounded-lg">
                          <div className="text-lg font-bold text-foreground">{stats.totalAgents}</div>
                          <div className="text-xs text-muted-foreground">Agents</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{stats.completionRate}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <motion.div
                            className="h-2 rounded-full bg-primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.completionRate}%` }}
                            transition={{ duration: 0.8, delay: index * 0.1 }}
                          />
                        </div>
                      </div>

                      {/* Project Meta */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>Created {formatDate(project.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Activity className="h-3 w-3" />
                          <span>Updated {formatDate(project.updatedAt)}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2 pt-2">
                        <Button
                          variant={isCurrentProject ? "default" : "outline"}
                          size="sm"
                          className="flex-1"
                          onClick={() => onProjectSelect(project)}
                        >
                          {isCurrentProject ? 'Current' : 'Select'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditProject(project)
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteProject(project.id)
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {projects.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FolderPlus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Create your first project to start organizing your development tasks and agents.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Project Dialog */}
      <AnimatePresence>
        {isCreateDialogOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-lg shadow-xl w-full max-w-md"
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <FolderPlus className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Create New Project</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Project Name *
                    </label>
                    <Input
                      value={newProjectData.name}
                      onChange={(e) => setNewProjectData({ ...newProjectData, name: e.target.value })}
                      placeholder="Enter project name..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Description
                    </label>
                    <textarea
                      value={newProjectData.description}
                      onChange={(e) => setNewProjectData({ ...newProjectData, description: e.target.value })}
                      placeholder="Enter project description..."
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateDialogOpen(false)
                      setNewProjectData({ name: '', description: '' })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateProject}
                    disabled={!newProjectData.name.trim()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Create Project
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Project Dialog */}
      <AnimatePresence>
        {isEditDialogOpen && editingProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card rounded-lg shadow-xl w-full max-w-md"
            >
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Settings className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-semibold text-foreground">Edit Project</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Project Name *
                    </label>
                    <Input
                      value={newProjectData.name}
                      onChange={(e) => setNewProjectData({ ...newProjectData, name: e.target.value })}
                      placeholder="Enter project name..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Description
                    </label>
                    <textarea
                      value={newProjectData.description}
                      onChange={(e) => setNewProjectData({ ...newProjectData, description: e.target.value })}
                      placeholder="Enter project description..."
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false)
                      setEditingProject(null)
                      setNewProjectData({ name: '', description: '' })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdateProject}
                    disabled={!newProjectData.name.trim()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
