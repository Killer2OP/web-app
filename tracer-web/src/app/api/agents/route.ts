/**
 * Agents API Routes
 * 
 * Handles CRUD operations for agents including:
 * - GET /api/agents - Get all agents (with filtering)
 * - POST /api/agents - Create a new agent
 */

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Agent from '@/models/Agent'

/**
 * GET /api/agents
 * Retrieves all agents with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    
    // Build query
    const query: any = {}
    if (projectId) query.projectId = projectId
    if (type) query.type = type
    if (status) query.status = status
    
    // Calculate pagination
    const skip = (page - 1) * limit
    
    // Execute query with population
    const agents = await Agent.find(query)
      .populate('projectId', 'name')
      .populate('currentTaskId', 'title status priority')
      .sort({ type: 1, name: 1 })
      .skip(skip)
      .limit(limit)
      .lean()
    
    // Get total count for pagination
    const total = await Agent.countDocuments(query)
    
    return NextResponse.json({
      success: true,
      data: agents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching agents:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agents' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/agents
 * Creates a new agent
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const {
      name,
      type,
      status,
      projectId,
      capabilities,
      efficiency
    } = body
    
    // Validate required fields
    if (!name || !type || !projectId) {
      return NextResponse.json(
        { success: false, error: 'Name, type, and projectId are required' },
        { status: 400 }
      )
    }
    
    // Create new agent
    const agent = new Agent({
      name: name.trim(),
      type,
      status: status || 'idle',
      projectId,
      capabilities: capabilities || [],
      efficiency: efficiency || 0.8
    })
    
    const savedAgent = await agent.save()
    
    // Populate the saved agent for response
    const populatedAgent = await Agent.findById(savedAgent._id)
      .populate('projectId', 'name')
      .populate('currentTaskId', 'title status')
      .lean()
    
    return NextResponse.json({
      success: true,
      data: populatedAgent
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating agent:', error)
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create agent' },
      { status: 500 }
    )
  }
}
