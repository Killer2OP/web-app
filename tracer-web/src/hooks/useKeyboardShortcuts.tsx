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
      }
    }

    // Escape key - closes dialogs and modals
    if (event.key === 'Escape') {
      onEscape()
    }
  }, [onCreateTask, onCreateAgent, onSearch, onEscape])

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
    <div className="flex items-center space-x-2 text-xs text-gray-500">
      {/* Styled keyboard shortcut display */}
      <kbd className="px-1.5 py-0.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded">
        {shortcut}
      </kbd>
      {/* Description text */}
      <span>{description}</span>
    </div>
  )
}
