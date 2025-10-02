/**
 * Validation Utilities
 * 
 * Provides validation functions for API requests and form inputs.
 * Includes common validation patterns and error messages.
 */

/**
 * Validation error type
 */
export interface ValidationError {
  field: string
  message: string
}

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

/**
 * Validates a project object
 */
export function validateProject(data: any): ValidationResult {
  const errors: ValidationError[] = []

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Project name is required' })
  } else if (data.name.trim().length > 200) {
    errors.push({ field: 'name', message: 'Project name cannot exceed 200 characters' })
  }

  if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
    errors.push({ field: 'description', message: 'Project description is required' })
  } else if (data.description.trim().length > 1000) {
    errors.push({ field: 'description', message: 'Project description cannot exceed 1000 characters' })
  }

  if (data.status && !['active', 'completed', 'paused', 'archived'].includes(data.status)) {
    errors.push({ field: 'status', message: 'Invalid project status' })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates a task object
 */
export function validateTask(data: any): ValidationResult {
  const errors: ValidationError[] = []

  if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Task title is required' })
  } else if (data.title.trim().length > 200) {
    errors.push({ field: 'title', message: 'Task title cannot exceed 200 characters' })
  }

  if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
    errors.push({ field: 'description', message: 'Task description is required' })
  } else if (data.description.trim().length > 1000) {
    errors.push({ field: 'description', message: 'Task description cannot exceed 1000 characters' })
  }

  if (!data.projectId || typeof data.projectId !== 'string') {
    errors.push({ field: 'projectId', message: 'Project ID is required' })
  } else if (!/^[0-9a-fA-F]{24}$/.test(data.projectId)) {
    errors.push({ field: 'projectId', message: 'Invalid project ID format' })
  }

  if (data.status && !['pending', 'in-progress', 'completed', 'blocked'].includes(data.status)) {
    errors.push({ field: 'status', message: 'Invalid task status' })
  }

  if (data.priority && !['low', 'medium', 'high', 'urgent'].includes(data.priority)) {
    errors.push({ field: 'priority', message: 'Invalid task priority' })
  }

  if (data.estimatedHours !== undefined) {
    if (typeof data.estimatedHours !== 'number' || data.estimatedHours < 0 || data.estimatedHours > 1000) {
      errors.push({ field: 'estimatedHours', message: 'Estimated hours must be between 0 and 1000' })
    }
  }

  if (data.actualHours !== undefined) {
    if (typeof data.actualHours !== 'number' || data.actualHours < 0 || data.actualHours > 1000) {
      errors.push({ field: 'actualHours', message: 'Actual hours must be between 0 and 1000' })
    }
  }

  if (data.agentId && !/^[0-9a-fA-F]{24}$/.test(data.agentId)) {
    errors.push({ field: 'agentId', message: 'Invalid agent ID format' })
  }

  if (data.dependencies && Array.isArray(data.dependencies)) {
    for (let i = 0; i < data.dependencies.length; i++) {
      if (!/^[0-9a-fA-F]{24}$/.test(data.dependencies[i])) {
        errors.push({ field: `dependencies[${i}]`, message: 'Invalid dependency ID format' })
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates an agent object
 */
export function validateAgent(data: any): ValidationResult {
  const errors: ValidationError[] = []

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Agent name is required' })
  } else if (data.name.trim().length > 100) {
    errors.push({ field: 'name', message: 'Agent name cannot exceed 100 characters' })
  }

  if (!data.type || !['frontend', 'backend', 'fullstack', 'devops', 'ai'].includes(data.type)) {
    errors.push({ field: 'type', message: 'Valid agent type is required' })
  }

  if (!data.projectId || typeof data.projectId !== 'string') {
    errors.push({ field: 'projectId', message: 'Project ID is required' })
  } else if (!/^[0-9a-fA-F]{24}$/.test(data.projectId)) {
    errors.push({ field: 'projectId', message: 'Invalid project ID format' })
  }

  if (data.status && !['idle', 'working', 'busy', 'suspended'].includes(data.status)) {
    errors.push({ field: 'status', message: 'Invalid agent status' })
  }

  if (data.efficiency !== undefined) {
    if (typeof data.efficiency !== 'number' || data.efficiency < 0 || data.efficiency > 1) {
      errors.push({ field: 'efficiency', message: 'Efficiency must be between 0 and 1' })
    }
  }

  if (data.capabilities && Array.isArray(data.capabilities)) {
    for (let i = 0; i < data.capabilities.length; i++) {
      if (typeof data.capabilities[i] !== 'string' || data.capabilities[i].trim().length === 0) {
        errors.push({ field: `capabilities[${i}]`, message: 'Capability must be a non-empty string' })
      } else if (data.capabilities[i].trim().length > 50) {
        errors.push({ field: `capabilities[${i}]`, message: 'Capability cannot exceed 50 characters' })
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates a planning session object
 */
export function validatePlanningSession(data: any): ValidationResult {
  const errors: ValidationError[] = []

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Planning session name is required' })
  } else if (data.name.trim().length > 200) {
    errors.push({ field: 'name', message: 'Planning session name cannot exceed 200 characters' })
  }

  if (!data.description || typeof data.description !== 'string' || data.description.trim().length === 0) {
    errors.push({ field: 'description', message: 'Planning session description is required' })
  } else if (data.description.trim().length > 1000) {
    errors.push({ field: 'description', message: 'Planning session description cannot exceed 1000 characters' })
  }

  if (!data.projectId || typeof data.projectId !== 'string') {
    errors.push({ field: 'projectId', message: 'Project ID is required' })
  } else if (!/^[0-9a-fA-F]{24}$/.test(data.projectId)) {
    errors.push({ field: 'projectId', message: 'Invalid project ID format' })
  }

  if (data.status && !['draft', 'active', 'completed'].includes(data.status)) {
    errors.push({ field: 'status', message: 'Invalid planning session status' })
  }

  if (data.tasks && Array.isArray(data.tasks)) {
    for (let i = 0; i < data.tasks.length; i++) {
      if (!/^[0-9a-fA-F]{24}$/.test(data.tasks[i])) {
        errors.push({ field: `tasks[${i}]`, message: 'Invalid task ID format' })
      }
    }
  }

  if (data.agents && Array.isArray(data.agents)) {
    for (let i = 0; i < data.agents.length; i++) {
      if (!/^[0-9a-fA-F]{24}$/.test(data.agents[i])) {
        errors.push({ field: `agents[${i}]`, message: 'Invalid agent ID format' })
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates MongoDB ObjectId format
 */
export function validateObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id)
}

/**
 * Validates pagination parameters
 */
export function validatePagination(params: any): ValidationResult {
  const errors: ValidationError[] = []

  if (params.page !== undefined) {
    const page = parseInt(params.page)
    if (isNaN(page) || page < 1) {
      errors.push({ field: 'page', message: 'Page must be a positive integer' })
    }
  }

  if (params.limit !== undefined) {
    const limit = parseInt(params.limit)
    if (isNaN(limit) || limit < 1 || limit > 100) {
      errors.push({ field: 'limit', message: 'Limit must be between 1 and 100' })
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Sanitizes string input by trimming whitespace
 */
export function sanitizeString(input: any): string {
  if (typeof input !== 'string') {
    return ''
  }
  return input.trim()
}

/**
 * Sanitizes array of strings
 */
export function sanitizeStringArray(input: any): string[] {
  if (!Array.isArray(input)) {
    return []
  }
  return input
    .filter(item => typeof item === 'string')
    .map(item => item.trim())
    .filter(item => item.length > 0)
}
