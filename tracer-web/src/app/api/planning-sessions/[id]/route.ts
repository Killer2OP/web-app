/**
 * Individual Planning Session API Routes
 * 
 * Handles operations for a specific planning session:
 * - GET /api/planning-sessions/[id] - Get planning session by ID
 * - PUT /api/planning-sessions/[id] - Update planning session
 * - DELETE /api/planning-sessions/[id] - Delete planning session
 */

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import PlanningSession from '@/models/PlanningSession'

/**
 * GET /api/planning-sessions/[id]
 * Retrieves a specific planning session with all related data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const sessionId = params.id
    
    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(sessionId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid planning session ID format' },
        { status: 400 }
      )
    }
    
    // Find planning session with populated data
    const planningSession = await PlanningSession.findById(sessionId)
      .populate('projectId', 'name description')
      .populate('tasks', 'title status priority description estimatedHours actualHours')
      .populate('agents', 'name type status capabilities efficiency')
      .lean()
    
    if (!planningSession) {
      return NextResponse.json(
        { success: false, error: 'Planning session not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: planningSession
    })
  } catch (error) {
    console.error('Error fetching planning session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch planning session' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/planning-sessions/[id]
 * Updates a specific planning session
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const sessionId = params.id
    const body = await request.json()
    const {
      name,
      description,
      status,
      tasks,
      agents
    } = body
    
    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(sessionId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid planning session ID format' },
        { status: 400 }
      )
    }
    
    // Find and update planning session
    const planningSession = await PlanningSession.findByIdAndUpdate(
      sessionId,
      {
        ...(name && { name: name.trim() }),
        ...(description && { description: description.trim() }),
        ...(status && { status }),
        ...(tasks && { tasks }),
        ...(agents && { agents })
      },
      { new: true, runValidators: true }
    )
      .populate('projectId', 'name description')
      .populate('tasks', 'title status priority')
      .populate('agents', 'name type status')
    
    if (!planningSession) {
      return NextResponse.json(
        { success: false, error: 'Planning session not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: planningSession
    })
  } catch (error) {
    console.error('Error updating planning session:', error)
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to update planning session' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/planning-sessions/[id]
 * Deletes a specific planning session
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()
    
    const sessionId = params.id
    
    // Validate ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(sessionId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid planning session ID format' },
        { status: 400 }
      )
    }
    
    // Check if planning session exists
    const planningSession = await PlanningSession.findById(sessionId)
    if (!planningSession) {
      return NextResponse.json(
        { success: false, error: 'Planning session not found' },
        { status: 404 }
      )
    }
    
    // Delete the planning session
    await PlanningSession.findByIdAndDelete(sessionId)
    
    return NextResponse.json({
      success: true,
      message: 'Planning session deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting planning session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete planning session' },
      { status: 500 }
    )
  }
}
