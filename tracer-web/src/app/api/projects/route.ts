/**
 * Projects API Routes
 * 
 * Handles CRUD operations for projects including:
 * - GET /api/projects - Get all projects
 * - POST /api/projects - Create a new project
 */

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'

/**
 * GET /api/projects
 * Retrieves all projects with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    
    // Build query
    const query: any = {}
    if (status) {
      query.status = status
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit
    
    // Execute query with population
    const projects = await Project.find(query)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
    
    // Get total count for pagination
    const total = await Project.countDocuments(query)
    
    return NextResponse.json({
      success: true,
      data: projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/projects
 * Creates a new project
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { name, description, status, ownerId } = body
    
    // Validate required fields
    if (!name || !description) {
      return NextResponse.json(
        { success: false, error: 'Name and description are required' },
        { status: 400 }
      )
    }
    
    // Create new project
    const project = new Project({
      name: name.trim(),
      description: description.trim(),
      status: status || 'active',
      ownerId: ownerId || null
    })
    
    const savedProject = await project.save()
    
    return NextResponse.json({
      success: true,
      data: savedProject
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    )
  }
}
