/**
 * Individual Project API Routes
 * 
 * Handles operations for a specific project:
 * - GET /api/projects/[id] - Get project by ID
 * - PUT /api/projects/[id] - Update project
 * - DELETE /api/projects/[id] - Delete project
 */

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import Task from '@/models/Task'
import Agent from '@/models/Agent'
import PlanningSession from '@/models/PlanningSession'

/**
 * GET /api/projects/[id]
 * Retrieves a specific project with all related data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const projectId = params.id
    
    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(projectId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID format' },
        { status: 400 }
      )
    }
    
    // Find project with populated data
    const project = await Project.findById(projectId)
      .populate('ownerId', 'name email')
      .lean()
    
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }
    
    // Get related tasks and agents
    const [tasks, agents, planningSessions] = await Promise.all([
      Task.find({ projectId }).populate('agentId', 'name type').lean(),
      Agent.find({ projectId }).populate('currentTaskId', 'title status').lean(),
      PlanningSession.find({ projectId }).lean()
    ])
    
    // Calculate project statistics
    const stats = {
      totalTasks: tasks.length,
      completedTasks: tasks.filter(task => task.status === 'completed').length,
      inProgressTasks: tasks.filter(task => task.status === 'in-progress').length,
      blockedTasks: tasks.filter(task => task.status === 'blocked').length,
      totalAgents: agents.length,
      activeAgents: agents.filter(agent => agent.status === 'idle' || agent.status === 'working').length,
      planningSessions: planningSessions.length
    }
    
    return NextResponse.json({
      success: true,
      data: {
        ...project,
        tasks,
        agents,
        planningSessions,
        stats
      }
    })
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/projects/[id]
 * Updates a specific project
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const projectId = params.id
    const body = await request.json()
    const { name, description, status } = body
    
    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(projectId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID format' },
        { status: 400 }
      )
    }
    
    // Find and update project
    const project = await Project.findByIdAndUpdate(
      projectId,
      {
        ...(name && { name: name.trim() }),
        ...(description && { description: description.trim() }),
        ...(status && { status })
      },
      { new: true, runValidators: true }
    )
    
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: project
    })
  } catch (error) {
    console.error('Error updating project:', error)
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/projects/[id]
 * Deletes a specific project and all related data
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const projectId = params.id
    
    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(projectId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid project ID format' },
        { status: 400 }
      )
    }
    
    // Check if project exists
    const project = await Project.findById(projectId)
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }
    
    // Delete all related data
    await Promise.all([
      Task.deleteMany({ projectId }),
      Agent.deleteMany({ projectId }),
      PlanningSession.deleteMany({ projectId })
    ])
    
    // Delete the project
    await Project.findByIdAndDelete(projectId)
    
    return NextResponse.json({
      success: true,
      message: 'Project and all related data deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    )
  }
}
