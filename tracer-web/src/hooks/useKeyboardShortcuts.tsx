'use client'

import React, { useEffect, useCallback } from 'react'

/**
 * Keyboard shortcuts hook and component for the Traycer application
 * 
 * This module provides global keyboard shortcuts for common actions
 * and a component for displaying shortcut hints to users.
 */

/**
 * Props interface for the useKeyboardShortcuts hook
 */
interface KeyboardShortcutsProps {
  /** Callback for creating a new task (Ctrl+T) */
  onCreateTask: () => void
  /** Callback for creating a new agent (Ctrl+A) */
  onCreateAgent: () => void
  /** Callback for opening search (Ctrl+K) */
  onSearch: () => void
  /** Callback for closing dialogs (Escape) */
  onEscape: () => void
  /** Callback for creating a new project (Ctrl+P) */
  onCreateProject?: () => void
  /** Callback for switching to projects tab (Ctrl+1) */
  onGoToProjects?: () => void
  /** Callback for switching to overview tab (Ctrl+2) */
  onGoToOverview?: () => void
  /** Callback for switching to tasks tab (Ctrl+3) */
  onGoToTasks?: () => void
  /** Callback for switching to agents tab (Ctrl+4) */
  onGoToAgents?: () => void
  /** Callback for switching to planning tab (Ctrl+5) */
  onGoToPlanning?: () => void
  /** Callback for switching to progress tab (Ctrl+6) */
  onGoToProgress?: () => void
  /** Callback for switching to activity tab (Ctrl+7) */
  onGoToActivity?: () => void
  /** Callback for toggling theme (Ctrl+D) */
  onToggleTheme?: () => void
  /** Callback for opening AI assistant (Ctrl+I) */
  onOpenAI?: () => void
  /** Callback for saving (Ctrl+S) */
  onSave?: () => void
  /** Callback for undo (Ctrl+Z) */
  onUndo?: () => void
  /** Callback for redo (Ctrl+Y) */
  onRedo?: () => void
}

/**
 * Custom hook for managing global keyboard shortcuts
 * 
 * Sets up event listeners for common keyboard shortcuts used throughout
 * the application. Automatically handles modifier keys and prevents
 * conflicts with form inputs.
 * 
 * @param props - Object containing callback functions for each shortcut
 * 
 * @example
 * useKeyboardShortcuts({
 *   onCreateTask: () => setTaskDialogOpen(true),
 *   onCreateAgent: () => setAgentDialogOpen(true),
 *   onSearch: () => focusSearchInput(),
 *   onEscape: () => closeAllDialogs()
 * })
 */
export function useKeyboardShortcuts({
  onCreateTask,
  onCreateAgent,
  onSearch,
  onEscape,
  onCreateProject,
  onGoToProjects,
  onGoToOverview,
  onGoToTasks,
  onGoToAgents,
  onGoToPlanning,
  onGoToProgress,
  onGoToActivity,
  onToggleTheme,
  onOpenAI,
  onSave,
  onUndo,
  onRedo,
}: KeyboardShortcutsProps) {
  /**
   * Handles keyboard events and triggers appropriate callbacks
   * 
   * Checks for modifier keys (Ctrl/Cmd) and prevents shortcuts
   * from firing when user is typing in form inputs.
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Check if user is typing in an input field
    // If so, don't trigger shortcuts to avoid conflicts
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement
    ) {
      return
    }

    // Check for modifier keys (Ctrl on Windows/Linux, Cmd on Mac)
    const isCtrlOrCmd = event.ctrlKey || event.metaKey

    if (isCtrlOrCmd) {
      switch (event.key.toLowerCase()) {
        case 't':
          event.preventDefault()
          onCreateTask()
          break
        case 'a':
          event.preventDefault()
          onCreateAgent()
          break
        case 'k':
          event.preventDefault()
          onSearch()
          break
        case 'p':
          event.preventDefault()
          onCreateProject?.()
          break
        case 'd':
          event.preventDefault()
          onToggleTheme?.()
          break
        case 'i':
          event.preventDefault()
          onOpenAI?.()
          break
        case 's':
          event.preventDefault()
          onSave?.()
          break
        case 'z':
          event.preventDefault()
          onUndo?.()
          break
        case 'y':
          event.preventDefault()
          onRedo?.()
          break
        case '1':
          event.preventDefault()
          onGoToProjects?.()
          break
        case '2':
          event.preventDefault()
          onGoToOverview?.()
          break
        case '3':
          event.preventDefault()
          onGoToTasks?.()
          break
        case '4':
          event.preventDefault()
          onGoToAgents?.()
          break
        case '5':
          event.preventDefault()
          onGoToPlanning?.()
          break
        case '6':
          event.preventDefault()
          onGoToProgress?.()
          break
        case '7':
          event.preventDefault()
          onGoToActivity?.()
          break
      }
    }

    // Escape key - closes dialogs and modals
    if (event.key === 'Escape') {
      onEscape()
    }
  }, [
    onCreateTask, 
    onCreateAgent, 
    onSearch, 
    onEscape, 
    onCreateProject, 
    onGoToProjects, 
    onGoToOverview, 
    onGoToTasks, 
    onGoToAgents, 
    onGoToPlanning, 
    onGoToProgress, 
    onGoToActivity, 
    onToggleTheme, 
    onOpenAI, 
    onSave, 
    onUndo, 
    onRedo
  ])

  // Set up global keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}

/**
 * Props interface for the KeyboardShortcutHint component
 */
interface KeyboardShortcutHintProps {
  /** The keyboard shortcut to display (e.g., "Ctrl+T") */
  shortcut: string
  /** Description of what the shortcut does */
  description: string
}

/**
 * Component for displaying keyboard shortcut hints
 * 
 * Renders a styled hint showing a keyboard shortcut and its description.
 * Used in help sections and tooltips to educate users about available shortcuts.
 * 
 * @param props - Object containing shortcut and description
 * 
 * @example
 * <KeyboardShortcutHint shortcut="Ctrl+T" description="Create new task" />
 */
export function KeyboardShortcutHint({ shortcut, description }: KeyboardShortcutHintProps) {
  return (
    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
      {/* Styled keyboard shortcut display */}
      <kbd className="px-1.5 py-0.5 text-xs font-semibold text-foreground bg-muted border border-border rounded">
        {shortcut}
      </kbd>
      {/* Description text */}
      <span>{description}</span>
    </div>
  )
}

/**
 * Component for displaying a comprehensive keyboard shortcuts help panel
 */
export function KeyboardShortcutsHelp() {
  const shortcuts = [
    { shortcut: 'Ctrl+T', description: 'Create new task' },
    { shortcut: 'Ctrl+A', description: 'Create new agent' },
    { shortcut: 'Ctrl+P', description: 'Create new project' },
    { shortcut: 'Ctrl+K', description: 'Open search' },
    { shortcut: 'Ctrl+I', description: 'Open AI assistant' },
    { shortcut: 'Ctrl+D', description: 'Toggle theme' },
    { shortcut: 'Ctrl+S', description: 'Save changes' },
    { shortcut: 'Ctrl+Z', description: 'Undo' },
    { shortcut: 'Ctrl+Y', description: 'Redo' },
    { shortcut: 'Ctrl+1', description: 'Go to Projects' },
    { shortcut: 'Ctrl+2', description: 'Go to Overview' },
    { shortcut: 'Ctrl+3', description: 'Go to Tasks' },
    { shortcut: 'Ctrl+4', description: 'Go to Agents' },
    { shortcut: 'Ctrl+5', description: 'Go to Planning' },
    { shortcut: 'Ctrl+6', description: 'Go to Progress' },
    { shortcut: 'Ctrl+7', description: 'Go to Activity' },
    { shortcut: 'Esc', description: 'Close dialogs' },
  ]

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Keyboard Shortcuts</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {shortcuts.map(({ shortcut, description }) => (
          <KeyboardShortcutHint
            key={shortcut}
            shortcut={shortcut}
            description={description}
          />
        ))}
      </div>
    </div>
  )
}
