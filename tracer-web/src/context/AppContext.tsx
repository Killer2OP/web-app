'use client'

import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react'
import { Task, Agent, Project, PlanningSession } from '@/types'
import { projectApi, taskApi, agentApi, planningSessionApi } from '@/lib/api'

/**
 * Application Context for Traycer
 * 
 * This context provides global state management for the entire application,
 * including projects, tasks, agents, and planning sessions. It uses React's
 * useReducer pattern for predictable state updates.
 */

/**
 * Application state interface
 * 
 * Contains all the global state needed for the application including
 * projects, current selections, and planning sessions.
 */
interface AppState {
  /** Array of all projects in the application */
  projects: Project[]
  /** Currently selected/active project */
  currentProject: Project | null
  /** Array of all planning sessions */
  planningSessions: PlanningSession[]
  /** Currently active planning session */
  currentSession: PlanningSession | null
  /** Loading state for API operations */
  loading: boolean
  /** Error state for API operations */
  error: string | null
}

/**
 * Action types for the application reducer
 * 
 * Defines all possible actions that can be dispatched to update the application state.
 * Each action includes a type and payload for type-safe state updates.
 */
type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'LOAD_PROJECTS'; payload: Project[] }
  | { type: 'CREATE_PROJECT'; payload: Project }
  | { type: 'SET_CURRENT_PROJECT'; payload: Project }
  | { type: 'UPDATE_PROJECT'; payload: { projectId: string; updates: Partial<Project> } }
  | { type: 'DELETE_PROJECT'; payload: { projectId: string } }
  | { type: 'LOAD_PLANNING_SESSIONS'; payload: PlanningSession[] }
  | { type: 'CREATE_PLANNING_SESSION'; payload: PlanningSession }
  | { type: 'SET_CURRENT_SESSION'; payload: PlanningSession }

/**
 * Initial state for the application
 * 
 * Sets up empty arrays and null values for all state properties.
 */
const initialState: AppState = {
  projects: [],
  currentProject: null,
  planningSessions: [],
  currentSession: null,
  loading: false,
  error: null,
}

/**
 * Application reducer function
 * 
 * Handles all state updates for the application using a reducer pattern.
 * This ensures predictable state changes and makes debugging easier.
 * 
 * @param state - Current application state
 * @param action - Action to perform on the state
 * @returns Updated application state
 */
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      }

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      }

    case 'LOAD_PROJECTS':
      return {
        ...state,
        projects: action.payload,
      }

    case 'CREATE_PROJECT':
      return {
        ...state,
        projects: [...state.projects, action.payload],
        currentProject: action.payload, // Set as current project
      }

    case 'SET_CURRENT_PROJECT':
      return {
        ...state,
        currentProject: action.payload,
      }

    case 'UPDATE_PROJECT':
      return {
        ...state,
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? { ...project, ...action.payload.updates }
            : project
        ),
        currentProject: state.currentProject?.id === action.payload.projectId
          ? { ...state.currentProject, ...action.payload.updates }
          : state.currentProject,
      }

    case 'DELETE_PROJECT':
      return {
        ...state,
        projects: state.projects.filter(project => project.id !== action.payload.projectId),
        currentProject: state.currentProject?.id === action.payload.projectId
          ? state.projects.find(p => p.id !== action.payload.projectId) || null
          : state.currentProject,
      }

    case 'LOAD_PLANNING_SESSIONS':
      return {
        ...state,
        planningSessions: action.payload,
      }

    case 'CREATE_PLANNING_SESSION':
      return {
        ...state,
        planningSessions: [...state.planningSessions, action.payload],
        currentSession: action.payload, // Set as current session
      }

    case 'SET_CURRENT_SESSION':
      return {
        ...state,
        currentSession: action.payload,
      }

    default:
      return state
  }
}

/**
 * Application context type definition
 * 
 * Defines the shape of the context value that will be provided to components.
 */
interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  // API functions
  loadProjects: () => Promise<void>
  createProject: (data: { name: string; description: string; status?: string }) => Promise<Project | null>
  updateProject: (id: string, data: { name?: string; description?: string; status?: string }) => Promise<Project | null>
  deleteProject: (id: string) => Promise<boolean>
  setCurrentProject: (project: Project) => void
  loadPlanningSessions: (projectId?: string) => Promise<void>
  createPlanningSession: (data: { name: string; description: string; projectId: string; status?: string; tasks?: string[]; agents?: string[] }) => Promise<PlanningSession | null>
  setCurrentSession: (session: PlanningSession) => void
}

const AppContext = createContext<AppContextType | null>(null)

/**
 * AppProvider component
 * 
 * Provides the application context to all child components.
 * Uses useReducer to manage complex state updates and integrates with API calls.
 * 
 * @param children - React children components
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // API functions
  const loadProjects = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      
      const response = await projectApi.getAll()
      if (response.success && response.data) {
        dispatch({ type: 'LOAD_PROJECTS', payload: response.data as Project[] })
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to load projects' })
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load projects' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const createProject = async (data: { name: string; description: string; status?: string }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      
      const response = await projectApi.create(data)
      if (response.success && response.data) {
        dispatch({ type: 'CREATE_PROJECT', payload: response.data as Project })
        return response.data as Project
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to create project' })
        return null
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create project' })
      return null
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const updateProject = async (id: string, data: { name?: string; description?: string; status?: string }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      
      const response = await projectApi.update(id, data)
      if (response.success && response.data) {
        dispatch({ type: 'UPDATE_PROJECT', payload: { projectId: id, updates: response.data as Partial<Project> } })
        return response.data as Project
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to update project' })
        return null
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update project' })
      return null
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const deleteProject = async (id: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      
      const response = await projectApi.delete(id)
      if (response.success) {
        dispatch({ type: 'DELETE_PROJECT', payload: { projectId: id } })
        return true
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to delete project' })
        return false
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete project' })
      return false
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const setCurrentProject = (project: Project) => {
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: project })
  }

  const loadPlanningSessions = async (projectId?: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      
      const response = await planningSessionApi.getAll(projectId ? { projectId } : undefined)
      if (response.success && response.data) {
        dispatch({ type: 'LOAD_PLANNING_SESSIONS', payload: response.data as PlanningSession[] })
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to load planning sessions' })
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load planning sessions' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const createPlanningSession = async (data: { name: string; description: string; projectId: string; status?: string; tasks?: string[]; agents?: string[] }) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'SET_ERROR', payload: null })
      
      const response = await planningSessionApi.create(data)
      if (response.success && response.data) {
        dispatch({ type: 'CREATE_PLANNING_SESSION', payload: response.data as PlanningSession })
        return response.data as PlanningSession
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to create planning session' })
        return null
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create planning session' })
      return null
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const setCurrentSession = (session: PlanningSession) => {
    dispatch({ type: 'SET_CURRENT_SESSION', payload: session })
  }

  // Load projects on mount
  useEffect(() => {
    loadProjects()
  }, [])

  const contextValue: AppContextType = {
    state,
    dispatch,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    loadPlanningSessions,
    createPlanningSession,
    setCurrentSession,
  }

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

/**
 * Custom hook to access the application context
 * 
 * Provides a convenient way to access the application state, dispatch
 * function, and API functions from any component within the AppProvider.
 * 
 * @returns Object containing state, dispatch function, and API functions
 * @throws Error if used outside of AppProvider
 * 
 * @example
 * const { state, createProject, loadProjects } = useApp()
 * await createProject({ name: 'New Project', description: 'Project description' })
 */
export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

