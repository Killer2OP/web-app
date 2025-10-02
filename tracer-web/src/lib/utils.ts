import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility functions for the Traycer application
 * 
 * This file contains helper functions used throughout the application
 * for common operations like styling, date formatting, and ID generation.
 */

/**
 * Combines class names using clsx and tailwind-merge
 * 
 * This function merges Tailwind CSS classes intelligently, resolving conflicts
 * and ensuring proper class precedence. It's essential for conditional styling
 * and dynamic class composition in React components.
 * 
 * @param inputs - Class values to merge (strings, objects, arrays, etc.)
 * @returns Merged class string
 * 
 * @example
 * cn('px-4 py-2', 'bg-blue-500', { 'text-white': isActive })
 * // Returns: "px-4 py-2 bg-blue-500 text-white" (if isActive is true)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a Date object into a human-readable string
 * 
 * Uses the Intl.DateTimeFormat API to format dates consistently
 * across different locales and timezones.
 * 
 * @param date - The date to format
 * @returns Formatted date string (e.g., "Jan 15, 02:30 PM")
 * 
 * @example
 * formatDate(new Date('2024-01-15T14:30:00Z'))
 * // Returns: "Jan 15, 02:30 PM"
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

// Counter for generating consistent IDs during SSR
let idCounter = 0

/**
 * Generates a unique ID for components and data
 * 
 * Uses a counter-based approach instead of Math.random() to ensure
 * consistent IDs during server-side rendering. This prevents hydration
 * mismatches that can occur when client and server generate different IDs.
 * 
 * @returns Unique ID string (e.g., "id_1", "id_2", etc.)
 * 
 * @example
 * generateId() // Returns: "id_1"
 * generateId() // Returns: "id_2"
 */
export function generateId(): string {
  // Use a counter-based approach to ensure consistent IDs during SSR
  // This prevents hydration mismatches caused by Math.random()
  idCounter += 1
  return `id_${idCounter}`
}

