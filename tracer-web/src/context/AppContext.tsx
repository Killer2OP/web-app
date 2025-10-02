'use client'

import { createContext, useContext, useReducer, ReactNode } from 'react'
import { Task, Agent, Project, PlanningSession } from '@/types'

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
}

/**
 * Action types for the application reducer
 * 
 * Defines all possible actions that can be dispatched to update the application state.
 * Each action includes a type and payload for type-safe state updates.
 */
type AppAction =
  | { type: 'CREATE_PROJECT'; payload: Project }
  | { type: 'SET_CURRENT_PROJECT'; payload: Project }
  | { type: 'CREATE_TASK'; payload: { projectId: string; task: Task } }
  | { type: 'UPDATE_TASK'; payload: { projectId: string; taskId: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: { projectId: string; taskId: string } }
  | { type: 'CREATE_AGENT'; payload: { projectId: string; agent: Agent } }
  | { type: 'UPDATE_AGENT'; payload: { projectId: string; agentId: string; updates: Partial<Agent> } }
  | { type: 'ASSIGN_TASK'; payload: { projectId: string; taskId: string; agentId: string } }
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

    case 'CREATE_TASK':
      return {
        ...state,
        // Update projects array with new task
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? { ...project, tasks: [...project.tasks, action.payload.task] }
            : project
        ),
        // Update current project if it matches
        currentProject: state.currentProject?.id === action.payload.projectId
          ? { ...state.currentProject, tasks: [...state.currentProject.tasks, action.payload.task] }
          : state.currentProject,
      }

    case 'UPDATE_TASK':
      return {
        ...state,
        // Update task in projects array
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? {
                ...project,
                tasks: project.tasks.map(task =>
                  task.id === action.payload.taskId
                    ? { ...task, ...action.payload.updates, updatedAt: new Date() }
                    : task
                ),
              }
            : project
        ),
        // Update current project if it matches
        currentProject: state.currentProject?.id === action.payload.projectId
          ? {
              ...state.currentProject,
              tasks: state.currentProject.tasks.map(task =>
                task.id === action.payload.taskId
                  ? { ...task, ...action.payload.updates, updatedAt: new Date() }
                  : task
              ),
            }
          : state.currentProject,
      }

    case 'DELETE_TASK':
      return {
        ...state,
        // Remove task from projects array
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? {
                ...project,
                tasks: project.tasks.filter(task => task.id !== action.payload.taskId),
              }
            : project
        ),
        // Update current project if it matches
        currentProject: state.currentProject?.id === action.payload.projectId
          ? {
              ...state.currentProject,
              tasks: state.currentProject.tasks.filter(task => task.id !== action.payload.taskId),
            }
          : state.currentProject,
      }

    case 'CREATE_AGENT':
      return {
        ...state,
        // Add agent to projects array
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? { ...project, agents: [...project.agents, action.payload.agent] }
            : project
        ),
        // Update current project if it matches
        currentProject: state.currentProject?.id === action.payload.projectId
          ? { ...state.currentProject, agents: [...state.currentProject.agents, action.payload.agent] }
          : state.currentProject,
      }

    case 'UPDATE_AGENT':
      return {
        ...state,
        // Update agent in projects array
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? {
                ...project,
                agents: project.agents.map(agent =>
                  agent.id === action.payload.agentId
                    ? { ...agent, ...action.payload.updates }
                    : agent
                ),
              }
            : project
        ),
        // Update current project if it matches
        currentProject: state.currentProject?.id === action.payload.projectId
          ? {
              ...state.currentProject,
              agents: state.currentProject.agents.map(agent =>
                agent.id === action.payload.agentId
                  ? { ...agent, ...action.payload.updates }
                  : agent
              ),
            }
          : state.currentProject,
      }

    case 'ASSIGN_TASK':
      return {
        ...state,
        // Update both task and agent when assigning
        projects: state.projects.map(project =>
          project.id === action.payload.projectId
            ? {
                ...project,
                // Update task status and assignment
                tasks: project.tasks.map(task =>
                  task.id === action.payload.taskId
                    ? { ...task, agentId: action.payload.agentId, status: 'in-progress' as const }
                    : task
                ),
                // Update agent status and current task
                agents: project.agents.map(agent =>
                  agent.id === action.payload.agentId
                    ? { ...agent, currentTaskId: action.payload.taskId, status: 'working' as const }
                    : agent
                ),
              }
            : project
        ),
        // Update current project if it matches
        currentProject: state.currentProject?.id === action.payload.projectId
          ? {
              ...state.currentProject,
              tasks: state.currentProject.tasks.map(task =>
                task.id === action.payload.taskId
                  ? { ...task, agentId: action.payload.agentId, status: 'in-progress' as const }
                  : task
              ),
              agents: state.currentProject.agents.map(agent =>
                agent.id === action.payload.agentId
                  ? { ...agent, currentTaskId: action.payload.taskId, status: 'working' as const }
                  : agent
              ),
            }
          : state.currentProject,
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
const AppContext = createContext<{
  state: AppState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

/**
 * AppProvider component
 * 
 * Provides the application context to all child components.
 * Uses useReducer to manage complex state updates.
 * 
 * @param children - React children components
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

/**
 * Custom hook to access the application context
 * 
 * Provides a convenient way to access the application state and dispatch
 * function from any component within the AppProvider.
 * 
 * @returns Object containing state and dispatch function
 * @throws Error if used outside of AppProvider
 * 
 * @example
 * const { state, dispatch } = useApp()
 * dispatch({ type: 'CREATE_TASK', payload: { projectId: '123', task: newTask } })
 */
export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}

