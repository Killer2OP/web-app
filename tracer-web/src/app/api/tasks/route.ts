/**
 * Tasks API Routes
 * 
 * Handles CRUD operations for tasks including:
 * - GET /api/tasks - Get all tasks (with filtering)
 * - POST /api/tasks - Create a new task
 */

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Task from '@/models/Task'

/**
 * GET /api/tasks
 * Retrieves all tasks with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const agentId = searchParams.get('agentId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    
    // Build query
    const query: any = {}
    if (projectId) query.projectId = projectId
    if (status) query.status = status
    if (priority) query.priority = priority
    if (agentId) query.agentId = agentId
    
    // Calculate pagination
    const skip = (page - 1) * limit
    
    // Execute query with population
    const tasks = await Task.find(query)
      .populate('projectId', 'name')
      .populate('agentId', 'name type')
      .populate('dependencies', 'title status')
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
    
    // Get total count for pagination
    const total = await Task.countDocuments(query)
    
    return NextResponse.json({
      success: true,
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/tasks
 * Creates a new task
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const {
      title,
      description,
      status,
      priority,
      projectId,
      agentId,
      dependencies,
      estimatedHours
    } = body
    
    // Validate required fields
    if (!title || !description || !projectId) {
      return NextResponse.json(
        { success: false, error: 'Title, description, and projectId are required' },
        { status: 400 }
      )
    }
    
    // Create new task
    const task = new Task({
      title: title.trim(),
      description: description.trim(),
      status: status || 'pending',
      priority: priority || 'medium',
      projectId,
      agentId: agentId || null,
      dependencies: dependencies || [],
      estimatedHours: estimatedHours || null
    })
    
    const savedTask = await task.save()
    
    // Populate the saved task for response
    const populatedTask = await Task.findById(savedTask._id)
      .populate('projectId', 'name')
      .populate('agentId', 'name type')
      .populate('dependencies', 'title status')
      .lean()
    
    return NextResponse.json({
      success: true,
      data: populatedTask
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create task' },
      { status: 500 }
    )
  }
}
