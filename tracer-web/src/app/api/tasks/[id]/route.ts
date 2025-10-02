/**
 * Individual Task API Routes
 * 
 * Handles operations for a specific task:
 * - GET /api/tasks/[id] - Get task by ID
 * - PUT /api/tasks/[id] - Update task
 * - DELETE /api/tasks/[id] - Delete task
 */

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Task from '@/models/Task'
import Agent from '@/models/Agent'

/**
 * GET /api/tasks/[id]
 * Retrieves a specific task with all related data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const taskId = params.id
    
    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(taskId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid task ID format' },
        { status: 400 }
      )
    }
    
    // Find task with populated data
    const task = await Task.findById(taskId)
      .populate('projectId', 'name description')
      .populate('agentId', 'name type status capabilities')
      .populate('dependencies', 'title status priority')
      .lean()
    
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: task
    })
  } catch (error) {
    console.error('Error fetching task:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch task' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/tasks/[id]
 * Updates a specific task
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const taskId = params.id
    const body = await request.json()
    const {
      title,
      description,
      status,
      priority,
      agentId,
      dependencies,
      estimatedHours,
      actualHours
    } = body
    
    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(taskId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid task ID format' },
        { status: 400 }
      )
    }
    
    // Find and update task
    const task = await Task.findByIdAndUpdate(
      taskId,
      {
        ...(title && { title: title.trim() }),
        ...(description && { description: description.trim() }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(agentId !== undefined && { agentId }),
        ...(dependencies && { dependencies }),
        ...(estimatedHours !== undefined && { estimatedHours }),
        ...(actualHours !== undefined && { actualHours })
      },
      { new: true, runValidators: true }
    )
      .populate('projectId', 'name')
      .populate('agentId', 'name type')
      .populate('dependencies', 'title status')
    
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      )
    }
    
    // If task is assigned to an agent, update agent's current task
    if (task.agentId && task.status === 'in-progress') {
      await Agent.findByIdAndUpdate(task.agentId, {
        currentTaskId: taskId,
        status: 'working'
      })
    }
    
    return NextResponse.json({
      success: true,
      data: task
    })
  } catch (error) {
    console.error('Error updating task:', error)
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update task' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/tasks/[id]
 * Deletes a specific task
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const taskId = params.id
    
    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(taskId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid task ID format' },
        { status: 400 }
      )
    }
    
    // Find task to get agent info
    const task = await Task.findById(taskId)
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      )
    }
    
    // If task is assigned to an agent, update agent status
    if (task.agentId) {
      await Agent.findByIdAndUpdate(task.agentId, {
        currentTaskId: null,
        status: 'idle'
      })
    }
    
    // Remove this task from other tasks' dependencies
    await Task.updateMany(
      { dependencies: taskId },
      { $pull: { dependencies: taskId } }
    )
    
    // Delete the task
    await Task.findByIdAndDelete(taskId)
    
    return NextResponse.json({
      success: true,
      message: 'Task deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete task' },
      { status: 500 }
    )
  }
}
