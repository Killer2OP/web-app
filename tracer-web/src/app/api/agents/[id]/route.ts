/**
 * Individual Agent API Routes
 * 
 * Handles operations for a specific agent:
 * - GET /api/agents/[id] - Get agent by ID
 * - PUT /api/agents/[id] - Update agent
 * - DELETE /api/agents/[id] - Delete agent
 */

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Agent from '@/models/Agent'
import Task from '@/models/Task'

/**
 * GET /api/agents/[id]
 * Retrieves a specific agent with all related data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const agentId = params.id
    
    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(agentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid agent ID format' },
        { status: 400 }
      )
    }
    
    // Find agent with populated data
    const agent = await Agent.findById(agentId)
      .populate('projectId', 'name description')
      .populate('currentTaskId', 'title status priority description')
      .lean()
    
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      )
    }
    
    // Get agent's task history
    const taskHistory = await Task.find({ agentId })
      .populate('projectId', 'name')
      .sort({ updatedAt: -1 })
      .limit(10)
      .lean()
    
    return NextResponse.json({
      success: true,
      data: {
        ...agent,
        taskHistory
      }
    })
  } catch (error) {
    console.error('Error fetching agent:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agent' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/agents/[id]
 * Updates a specific agent
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const agentId = params.id
    const body = await request.json()
    const {
      name,
      type,
      status,
      capabilities,
      efficiency
    } = body
    
    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(agentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid agent ID format' },
        { status: 400 }
      )
    }
    
    // Find and update agent
    const agent = await Agent.findByIdAndUpdate(
      agentId,
      {
        ...(name && { name: name.trim() }),
        ...(type && { type }),
        ...(status && { status }),
        ...(capabilities && { capabilities }),
        ...(efficiency !== undefined && { efficiency })
      },
      { new: true, runValidators: true }
    )
      .populate('projectId', 'name')
      .populate('currentTaskId', 'title status')
    
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: agent
    })
  } catch (error) {
    console.error('Error updating agent:', error)
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update agent' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/agents/[id]
 * Deletes a specific agent
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const agentId = params.id
    
    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(agentId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid agent ID format' },
        { status: 400 }
      )
    }
    
    // Find agent
    const agent = await Agent.findById(agentId)
    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      )
    }
    
    // Unassign all tasks from this agent
    await Task.updateMany(
      { agentId },
      { 
        agentId: null,
        status: 'pending'
      }
    )
    
    // Delete the agent
    await Agent.findByIdAndDelete(agentId)
    
    return NextResponse.json({
      success: true,
      message: 'Agent deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting agent:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete agent' },
      { status: 500 }
    )
  }
}
