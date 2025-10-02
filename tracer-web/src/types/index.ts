/**
 * Core type definitions for the Traycer application
 * 
 * This file contains all the TypeScript interfaces and types used throughout
 * the application for type safety and better developer experience.
 */

/**
 * Task interface - represents a work item in the project
 * 
 * Tasks are the fundamental units of work that can be assigned to agents.
 * They track progress, dependencies, and time estimates for project planning.
 */
export interface Task {
  /** Unique identifier for the task */
  id: string
  /** Human-readable title of the task */
  title: string
  /** Detailed description of what needs to be done */
  description: string
  /** Current status of the task in the workflow */
  status: 'pending' | 'in-progress' | 'completed' | 'blocked'
  /** Priority level for task scheduling and resource allocation */
  priority: 'low' | 'medium' | 'high' | 'urgent'
  /** ID of the agent currently assigned to this task (optional) */
  agentId?: string
  /** When the task was created */
  createdAt: Date
  /** When the task was last modified */
  updatedAt: Date
  /** Array of task IDs that must be completed before this task */
  dependencies: string[]
  /** Estimated hours to complete the task */
  estimatedHours?: number
  /** Actual hours spent on the task */
  actualHours?: number
}

/**
 * Agent interface - represents an AI agent or team member
 * 
 * Agents are responsible for executing tasks. They have specific capabilities,
 * efficiency ratings, and current workload status.
 */
export interface Agent {
  /** Unique identifier for the agent */
  id: string
  /** Display name of the agent */
  name: string
  /** Type of agent defining their specialization */
  type: 'frontend' | 'backend' | 'fullstack' | 'devops' | 'ai'
  /** Current availability status */
  status: 'idle' | 'working' | 'busy'
  /** ID of the task currently being worked on (optional) */
  currentTaskId?: string
  /** Array of skills/technologies the agent is proficient in */
  capabilities: string[]
  /** Efficiency rating from 0-1 (1 being most efficient) */
  efficiency: number // 0-1 scale
}

/**
 * Project interface - represents a complete project
 * 
 * Projects contain tasks and agents, forming the main organizational unit
 * for development planning and execution.
 */
export interface Project {
  /** Unique identifier for the project */
  id: string
  /** Project name */
  name: string
  /** Project description and goals */
  description: string
  /** Array of all tasks in the project */
  tasks: Task[]
  /** Array of all agents available for the project */
  agents: Agent[]
  /** When the project was created */
  createdAt: Date
  /** When the project was last modified */
  updatedAt: Date
}

/**
 * PlanningSession interface - represents a planning session
 * 
 * Planning sessions are snapshots of project state at a specific point in time,
 * used for planning, analysis, and historical tracking.
 */
export interface PlanningSession {
  /** Unique identifier for the planning session */
  id: string
  /** ID of the project this session belongs to */
  projectId: string
  /** Name of the planning session */
  name: string
  /** Description of the planning session purpose */
  description: string
  /** Tasks included in this planning session */
  tasks: Task[]
  /** Agents included in this planning session */
  agents: Agent[]
  /** When the planning session was created */
  createdAt: Date
  /** Current status of the planning session */
  status: 'draft' | 'active' | 'completed'
}

