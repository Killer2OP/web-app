/**
 * Planning Sessions API Routes
 * 
 * Handles CRUD operations for planning sessions including:
 * - GET /api/planning-sessions - Get all planning sessions
 * - POST /api/planning-sessions - Create a new planning session
 */

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import PlanningSession from '@/models/PlanningSession'

/**
 * GET /api/planning-sessions
 * Retrieves all planning sessions with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    
    // Build query
    const query: any = {}
    if (projectId) query.projectId = projectId
    if (status) query.status = status
    
    // Calculate pagination
    const skip = (page - 1) * limit
    
    // Execute query with population
    const planningSessions = await PlanningSession.find(query)
      .populate('projectId', 'name description')
      .populate('tasks', 'title status priority')
      .populate('agents', 'name type status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
    
    // Get total count for pagination
    const total = await PlanningSession.countDocuments(query)
    
    return NextResponse.json({
      success: true,
      data: planningSessions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching planning sessions:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch planning sessions' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/planning-sessions
 * Creates a new planning session
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const {
      name,
      description,
      projectId,
      status,
      tasks,
      agents
    } = body
    
    // Validate required fields
    if (!name || !description || !projectId) {
      return NextResponse.json(
        { success: false, error: 'Name, description, and projectId are required' },
        { status: 400 }
      )
    }
    
    // Create new planning session
    const planningSession = new PlanningSession({
      name: name.trim(),
      description: description.trim(),
      projectId,
      status: status || 'draft',
      tasks: tasks || [],
      agents: agents || []
    })
    
    const savedSession = await planningSession.save()
    
    // Populate the saved session for response
    const populatedSession = await PlanningSession.findById(savedSession._id)
      .populate('projectId', 'name description')
      .populate('tasks', 'title status priority')
      .populate('agents', 'name type status')
      .lean()
    
    return NextResponse.json({
      success: true,
      data: populatedSession
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating planning session:', error)
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create planning session' },
      { status: 500 }
    )
  }
}
