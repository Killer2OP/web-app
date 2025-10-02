/**
 * Project Statistics API Route
 * 
 * Handles project statistics and analytics:
 * - GET /api/projects/[id]/stats - Get project statistics
 */

import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import Task from '@/models/Task'
import Agent from '@/models/Agent'
import PlanningSession from '@/models/PlanningSession'

/**
 * GET /api/projects/[id]/stats
 * Retrieves comprehensive statistics for a project
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
    
    // Check if project exists
    const project = await Project.findById(projectId)
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      )
    }
    
    // Get all tasks for the project
    const tasks = await Task.find({ projectId }).lean()
    
    // Get all agents for the project
    const agents = await Agent.find({ projectId }).lean()
    
    // Get all planning sessions for the project
    const planningSessions = await PlanningSession.find({ projectId }).lean()
    
    // Calculate task statistics
    const taskStats = {
      total: tasks.length,
      byStatus: {
        pending: tasks.filter(task => task.status === 'pending').length,
        inProgress: tasks.filter(task => task.status === 'in-progress').length,
        completed: tasks.filter(task => task.status === 'completed').length,
        blocked: tasks.filter(task => task.status === 'blocked').length
      },
      byPriority: {
        low: tasks.filter(task => task.priority === 'low').length,
        medium: tasks.filter(task => task.priority === 'medium').length,
        high: tasks.filter(task => task.priority === 'high').length,
        urgent: tasks.filter(task => task.priority === 'urgent').length
      },
      totalEstimatedHours: tasks.reduce((sum, task) => sum + (task.estimatedHours || 0), 0),
      totalActualHours: tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0),
      completionRate: tasks.length > 0 ? (tasks.filter(task => task.status === 'completed').length / tasks.length) * 100 : 0
    }
    
    // Calculate agent statistics
    const agentStats = {
      total: agents.length,
      byType: {
        frontend: agents.filter(agent => agent.type === 'frontend').length,
        backend: agents.filter(agent => agent.type === 'backend').length,
        fullstack: agents.filter(agent => agent.type === 'fullstack').length,
        devops: agents.filter(agent => agent.type === 'devops').length,
        ai: agents.filter(agent => agent.type === 'ai').length
      },
      byStatus: {
        idle: agents.filter(agent => agent.status === 'idle').length,
        working: agents.filter(agent => agent.status === 'working').length,
        busy: agents.filter(agent => agent.status === 'busy').length,
        suspended: agents.filter(agent => agent.status === 'suspended').length
      },
      averageEfficiency: agents.length > 0 ? agents.reduce((sum, agent) => sum + agent.efficiency, 0) / agents.length : 0,
      utilizationRate: agents.length > 0 ? (agents.filter(agent => agent.status === 'working' || agent.status === 'busy').length / agents.length) * 100 : 0
    }
    
    // Calculate planning session statistics
    const planningStats = {
      total: planningSessions.length,
      byStatus: {
        draft: planningSessions.filter(session => session.status === 'draft').length,
        active: planningSessions.filter(session => session.status === 'active').length,
        completed: planningSessions.filter(session => session.status === 'completed').length
      }
    }
    
    // Calculate project timeline
    const projectTimeline = {
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      duration: Math.floor((new Date().getTime() - project.createdAt.getTime()) / (1000 * 60 * 60 * 24)) // days
    }
    
    // Calculate productivity metrics
    const productivityMetrics = {
      tasksPerDay: projectTimeline.duration > 0 ? taskStats.total / projectTimeline.duration : 0,
      completionVelocity: taskStats.completionRate,
      agentProductivity: agentStats.averageEfficiency * agentStats.utilizationRate / 100
    }
    
    return NextResponse.json({
      success: true,
      data: {
        project: {
          id: project._id,
          name: project.name,
          description: project.description,
          status: project.status
        },
        taskStats,
        agentStats,
        planningStats,
        projectTimeline,
        productivityMetrics
      }
    })
  } catch (error) {
    console.error('Error fetching project statistics:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project statistics' },
      { status: 500 }
    )
  }
}
