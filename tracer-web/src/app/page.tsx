'use client'

import { AppProvider } from '@/context/AppContext'
import { Dashboard } from '@/components/Dashboard'

/**
 * Home page component - the main entry point of the Traycer application
 * 
 * This component wraps the Dashboard with the AppProvider context to provide
 * global state management for tasks, agents, and projects throughout the app.
 * 
 * The AppProvider manages:
 * - Project state and current project selection
 * - Task CRUD operations and status updates
 * - Agent management and task assignments
 * - Planning session state
 */
export default function Home() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  )
}