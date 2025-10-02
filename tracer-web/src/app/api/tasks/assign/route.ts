/**
 * Task Assignment API Route
 * 
 * Handles task assignment operations:
 * - POST /api/tasks/assign - Assign a task to an agent
 * - DELETE /api/tasks/assign - Unassign a task from an agent
 */

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Task from '@/models/Task'
import Agent from '@/models/Agent'

/**
 * POST /api/tasks/assign
 * Assigns a task to an agent
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { taskId, agentId } = body
    
    // Validate required fields
    if (!taskId || !agentId) {
      return NextResponse.json(
        { success: false, error: 'Task ID and Agent ID are required' },
        { status: 400 }
      )
    }
    
    // Validate ObjectId formats
    if (!/^[0-9a-fA-F]{24}$/.test(taskId) || !/^[0-9a-fA-F]{24}$/.test(agentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID format' },
        { status: 400 }
      )
    }
    
    // Check if task exists
    const task = await Task.findById(taskId)
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      )
    }
    
    // Check if agent exists
    const agent = await Agent.findById(agentId)
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      )
    }
    
    // Check if agent is available
    if (agent.status === 'busy' || agent.status === 'suspended') {
      return NextResponse.json(
        { success: false, error: 'Agent is not available for assignment' },
        { status: 400 }
      )
    }
    
    // Check if task is already assigned
    if (task.agentId) {
      return NextResponse.json(
        { success: false, error: 'Task is already assigned to an agent' },
        { status: 400 }
      )
    }
    
    // Update task and agent
    const [updatedTask, updatedAgent] = await Promise.all([
      Task.findByIdAndUpdate(
        taskId,
        { 
          agentId,
          status: 'in-progress'
        },
        { new: true }
      ).populate('agentId', 'name type').populate('projectId', 'name'),
      
      Agent.findByIdAndUpdate(
        agentId,
        { 
          currentTaskId: taskId,
          status: 'working'
        },
        { new: true }
      ).populate('currentTaskId', 'title status')
    ])
    
    return NextResponse.json({
      success: true,
      data: {
        task: updatedTask,
        agent: updatedAgent
      },
      message: 'Task assigned successfully'
    })
  } catch (error) {
    console.error('Error assigning task:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to assign task' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/tasks/assign
 * Unassigns a task from an agent
 */
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('taskId')
    const agentId = searchParams.get('agentId')
    
    // Validate required fields
    if (!taskId || !agentId) {
      return NextResponse.json(
        { success: false, error: 'Task ID and Agent ID are required' },
        { status: 400 }
      )
    }
    
    // Validate ObjectId formats
    if (!/^[0-9a-fA-F]{24}$/.test(taskId) || !/^[0-9a-fA-F]{24}$/.test(agentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID format' },
        { status: 400 }
      )
    }
    
    // Check if task exists and is assigned to the specified agent
    const task = await Task.findById(taskId)
    if (!task) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 }
      )
    }
    
    if (task.agentId?.toString() !== agentId) {
      return NextResponse.json(
        { success: false, error: 'Task is not assigned to the specified agent' },
        { status: 400 }
      )
    }
    
    // Update task and agent
    const [updatedTask, updatedAgent] = await Promise.all([
      Task.findByIdAndUpdate(
        taskId,
        { 
          agentId: null,
          status: 'pending'
        },
        { new: true }
      ).populate('projectId', 'name'),
      
      Agent.findByIdAndUpdate(
        agentId,
        { 
          currentTaskId: null,
          status: 'idle'
        },
        { new: true }
      )
    ])
    
    return NextResponse.json({
      success: true,
      data: {
        task: updatedTask,
        agent: updatedAgent
      },
      message: 'Task unassigned successfully'
    })
  } catch (error) {
    console.error('Error unassigning task:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to unassign task' },
      { status: 500 }
    )
  }
}
