/**
 * API Service Utilities
 * 
 * Provides typed API client functions for all backend operations.
 * Includes error handling, request/response typing, and consistent API patterns.
 */

/**
 * API Response wrapper type
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

/**
 * Base API client class with common functionality
 */
class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api'
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`)
      }

      return data
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, params?: Record<string, string | number>): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseUrl}${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }
    
    return this.request<T>(url.pathname + url.search, {
      method: 'GET',
    })
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }
}

// Create singleton instance
const apiClient = new ApiClient()

/**
 * Project API functions
 */
export const projectApi = {
  /**
   * Get all projects
   */
  getAll: (params?: { status?: string; limit?: number; page?: number }) =>
    apiClient.get('/projects', params),

  /**
   * Get project by ID
   */
  getById: (id: string) =>
    apiClient.get(`/projects/${id}`),

  /**
   * Create new project
   */
  create: (data: { name: string; description: string; status?: string; ownerId?: string }) =>
    apiClient.post('/projects', data),

  /**
   * Update project
   */
  update: (id: string, data: { name?: string; description?: string; status?: string }) =>
    apiClient.put(`/projects/${id}`, data),

  /**
   * Delete project
   */
  delete: (id: string) =>
    apiClient.delete(`/projects/${id}`),

  /**
   * Get project statistics
   */
  getStats: (id: string) =>
    apiClient.get(`/projects/${id}/stats`),
}

/**
 * Task API functions
 */
export const taskApi = {
  /**
   * Get all tasks
   */
  getAll: (params?: { 
    projectId?: string; 
    status?: string; 
    priority?: string; 
    agentId?: string; 
    limit?: number; 
    page?: number 
  }) =>
    apiClient.get('/tasks', params),

  /**
   * Get task by ID
   */
  getById: (id: string) =>
    apiClient.get(`/tasks/${id}`),

  /**
   * Create new task
   */
  create: (data: {
    title: string;
    description: string;
    status?: string;
    priority?: string;
    projectId: string;
    agentId?: string;
    dependencies?: string[];
    estimatedHours?: number;
  }) =>
    apiClient.post('/tasks', data),

  /**
   * Update task
   */
  update: (id: string, data: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    agentId?: string;
    dependencies?: string[];
    estimatedHours?: number;
    actualHours?: number;
  }) =>
    apiClient.put(`/tasks/${id}`, data),

  /**
   * Delete task
   */
  delete: (id: string) =>
    apiClient.delete(`/tasks/${id}`),

  /**
   * Assign task to agent
   */
  assign: (taskId: string, agentId: string) =>
    apiClient.post('/tasks/assign', { taskId, agentId }),

  /**
   * Unassign task from agent
   */
  unassign: (taskId: string, agentId: string) =>
    apiClient.delete(`/tasks/assign?taskId=${taskId}&agentId=${agentId}`),
}

/**
 * Agent API functions
 */
export const agentApi = {
  /**
   * Get all agents
   */
  getAll: (params?: { 
    projectId?: string; 
    type?: string; 
    status?: string; 
    limit?: number; 
    page?: number 
  }) =>
    apiClient.get('/agents', params),

  /**
   * Get agent by ID
   */
  getById: (id: string) =>
    apiClient.get(`/agents/${id}`),

  /**
   * Create new agent
   */
  create: (data: {
    name: string;
    type: string;
    status?: string;
    projectId: string;
    capabilities?: string[];
    efficiency?: number;
  }) =>
    apiClient.post('/agents', data),

  /**
   * Update agent
   */
  update: (id: string, data: {
    name?: string;
    type?: string;
    status?: string;
    capabilities?: string[];
    efficiency?: number;
  }) =>
    apiClient.put(`/agents/${id}`, data),

  /**
   * Delete agent
   */
  delete: (id: string) =>
    apiClient.delete(`/agents/${id}`),
}

/**
 * Planning Session API functions
 */
export const planningSessionApi = {
  /**
   * Get all planning sessions
   */
  getAll: (params?: { 
    projectId?: string; 
    status?: string; 
    limit?: number; 
    page?: number 
  }) =>
    apiClient.get('/planning-sessions', params),

  /**
   * Get planning session by ID
   */
  getById: (id: string) =>
    apiClient.get(`/planning-sessions/${id}`),

  /**
   * Create new planning session
   */
  create: (data: {
    name: string;
    description: string;
    projectId: string;
    status?: string;
    tasks?: string[];
    agents?: string[];
  }) =>
    apiClient.post('/planning-sessions', data),

  /**
   * Update planning session
   */
  update: (id: string, data: {
    name?: string;
    description?: string;
    status?: string;
    tasks?: string[];
    agents?: string[];
  }) =>
    apiClient.put(`/planning-sessions/${id}`, data),

  /**
   * Delete planning session
   */
  delete: (id: string) =>
    apiClient.delete(`/planning-sessions/${id}`),
}

export default apiClient
