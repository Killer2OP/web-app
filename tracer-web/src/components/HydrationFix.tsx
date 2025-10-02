'use client'

import { useEffect } from 'react'

/**
 * HydrationFix component
 * 
 * This component addresses hydration mismatch issues caused by browser extensions
 * and other client-side modifications that can interfere with React's hydration process.
 * 
 * Specifically, it suppresses console warnings related to hydration mismatches
 * that are caused by browser extensions (like cz-shortcut-listen) modifying the DOM
 * before React can properly hydrate the application.
 * 
 * This is a common issue in Next.js applications where browser extensions
 * inject scripts or modify the DOM, causing React to detect differences between
 * server-rendered HTML and client-side DOM.
 */
export function HydrationFix() {
  useEffect(() => {
    // Store the original console.error function
    const originalError = console.error
    
    // Override console.error to filter out specific hydration warnings
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' &&
        args[0].includes('hydration') &&
        args[0].includes('cz-shortcut-listen')
      ) {
        // Suppress hydration warnings caused by browser extensions
        // These warnings are not actionable and can clutter the console
        return
      }
      // Pass through all other errors normally
      originalError.apply(console, args)
    }

    // Cleanup: restore original console.error on unmount
    return () => {
      console.error = originalError
    }
  }, [])

  // This component doesn't render anything visible
  return null
}
