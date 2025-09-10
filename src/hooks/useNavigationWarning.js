// src/hooks/useNavigationWarning.js - Enhanced with custom modal
import { useEffect, useRef, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'

export const useNavigationWarning = (
  shouldWarn = true, 
  title = "Leave Dashboard?",
  message = "Changes you made may not be saved."
) => {
  const location = useLocation()
  const [showModal, setShowModal] = useState(false)
  const [pendingNavigation, setPendingNavigation] = useState(null)
  const currentPath = useRef(location.pathname)
  const isNavigating = useRef(false)

  // Handle modal confirmation
  const handleConfirm = useCallback(() => {
    setShowModal(false)
    isNavigating.current = true
    
    if (pendingNavigation) {
      pendingNavigation()
      setPendingNavigation(null)
    }
  }, [pendingNavigation])

  // Handle modal cancellation
  const handleCancel = useCallback(() => {
    setShowModal(false)
    setPendingNavigation(null)
    
    // Restore the current page in history
    if (currentPath.current !== window.location.pathname) {
      window.history.pushState(null, '', currentPath.current)
    }
  }, [])

  useEffect(() => {
    if (!shouldWarn) return

    // Handle browser back/forward/refresh
    const handleBeforeUnload = (e) => {
      if (shouldWarn && !isNavigating.current) {
        e.preventDefault()
        e.returnValue = message
        return message
      }
    }

    // Handle browser back/forward buttons
    const handlePopState = (e) => {
      if (shouldWarn && !isNavigating.current) {
        e.preventDefault()
        
        // Show custom modal instead of browser confirm
        setShowModal(true)
        setPendingNavigation(() => () => {
          window.history.back()
        })
        
        // Prevent the navigation by pushing current state back
        window.history.pushState(null, '', currentPath.current)
      }
    }

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)

    // Push a dummy state to detect back navigation
    window.history.pushState(null, '', currentPath.current)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
    }
  }, [shouldWarn, message])

  // Update current path when location changes
  useEffect(() => {
    currentPath.current = location.pathname
    isNavigating.current = false
  }, [location.pathname])

  return {
    showModal,
    handleConfirm,
    handleCancel,
    title,
    message,
    setNavigationAllowed: (allowed) => {
      isNavigating.current = allowed
    }
  }
}
