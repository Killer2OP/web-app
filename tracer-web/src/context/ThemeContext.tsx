'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

/**
 * Theme Context for Traycer
 * 
 * This context manages the application's theme state (light/dark/system)
 * and handles theme persistence and system preference detection.
 * It prevents hydration mismatches by carefully managing client-side rendering.
 */

/**
 * Available theme options
 */
type Theme = 'light' | 'dark' | 'system'

/**
 * Theme context interface
 * 
 * Defines the shape of the theme context value provided to components.
 */
interface ThemeContextType {
  /** Current theme setting (light, dark, or system) */
  theme: Theme
  /** Function to update the theme */
  setTheme: (theme: Theme) => void
  /** Resolved theme (actual light or dark, accounting for system preference) */
  resolvedTheme: 'light' | 'dark'
}

/**
 * Theme context creation
 * 
 * Creates the React context for theme management.
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

/**
 * ThemeProvider component
 * 
 * Provides theme context to all child components and manages:
 * - Theme state persistence in localStorage
 * - System preference detection
 * - Hydration mismatch prevention
 * - DOM class application for styling
 * 
 * @param children - React children components
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  // Theme state management
  const [theme, setTheme] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  /**
   * Initialize theme on component mount
   * 
   * Prevents hydration mismatch by only running client-side code after mount.
   * Loads saved theme preference from localStorage.
   */
  useEffect(() => {
    setMounted(true)
    
    // Get initial theme from localStorage or default to system
    const savedTheme = localStorage.getItem('theme') as Theme
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setTheme(savedTheme)
    }
  }, [])

  /**
   * Handle theme resolution and system preference changes
   * 
   * Updates the resolved theme based on the current theme setting.
   * Listens for system preference changes when theme is set to 'system'.
   */
  useEffect(() => {
    if (!mounted) return

    /**
     * Updates the resolved theme based on current theme setting
     */
    const updateResolvedTheme = () => {
      if (theme === 'system') {
        // Detect system preference using media query
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
        setResolvedTheme(systemTheme)
      } else {
        // Use explicit theme setting
        setResolvedTheme(theme)
      }
    }

    updateResolvedTheme()

    // Listen for system theme changes when using system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        updateResolvedTheme()
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme, mounted])

  /**
   * Apply theme to DOM and persist preference
   * 
   * Updates the document's class list and saves the theme preference
   * to localStorage for persistence across sessions.
   */
  useEffect(() => {
    if (!mounted) return

    // Apply theme to document root element
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)
    
    // Save theme preference to localStorage
    localStorage.setItem('theme', theme)
  }, [theme, resolvedTheme, mounted])

  /**
   * Theme setter function
   * 
   * Updates the theme state and triggers re-resolution.
   * 
   * @param newTheme - The new theme to set
   */
  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
  }

  /**
   * Prevent hydration mismatch by not rendering theme-dependent content until mounted
   * 
   * Returns a default context value during SSR to prevent mismatches.
   */
  if (!mounted) {
    return (
      <ThemeContext.Provider value={{ theme: 'system', setTheme: handleSetTheme, resolvedTheme: 'light' }}>
        {children}
      </ThemeContext.Provider>
    )
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

/**
 * Custom hook to access the theme context
 * 
 * Provides a convenient way to access theme state and controls
 * from any component within the ThemeProvider.
 * 
 * @returns Theme context value
 * @throws Error if used outside of ThemeProvider
 * 
 * @example
 * const { theme, setTheme, resolvedTheme } = useTheme()
 * setTheme('dark')
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
