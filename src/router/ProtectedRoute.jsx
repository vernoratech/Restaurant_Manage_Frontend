// src/router/ProtectedRoute.jsx - UPDATED to handle skipped users
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const ProtectedRoute = ({ children, requireSetup }) => {
  const { isAuthenticated, isLoading, user, checkRestaurantSetup } = useAuth()
  const location = useLocation()

  console.log("🛡️ ProtectedRoute: Checking access", { 
    requireSetup, 
    isAuthenticated, 
    user: user?.email,
    path: location.pathname 
  })

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // ✅ NEW: Check for skipped setup status
  const checkSkippedSetup = () => {
    try {
      const skipStatus = localStorage.getItem('restaurantSetupStatus')
      if (skipStatus) {
        const parsed = JSON.parse(skipStatus)
        return parsed.skipped === true
      }
      return false
    } catch (error) {
      console.error('Error parsing skip status:', error)
      return false
    }
  }

  if (requireSetup) {
    console.log("🔍 ProtectedRoute: Setup required, checking status...")
    
    const hasCompletedSetup = checkRestaurantSetup()
    const hasSkippedSetup = checkSkippedSetup()
    
    console.log("📊 Setup Status:", { 
      hasCompletedSetup, 
      hasSkippedSetup, 
      userSetup: user?.isSetup,
      userResId: user?.resId 
    })

    // ✅ Allow access if setup is completed OR skipped
    if (!hasCompletedSetup && !hasSkippedSetup) {
      console.log("❌ ProtectedRoute: Setup required but not completed or skipped")
      return <Navigate to="/restaurant-setup" replace />
    }
    
    console.log("✅ ProtectedRoute: Access granted (setup completed or skipped)")
  }

  // ✅ Prevent access to setup page if user already has completed setup
  if (location.pathname === '/restaurant-setup' && checkRestaurantSetup()) {
    console.log("🔄 ProtectedRoute: User has completed setup, redirecting to dashboard")
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default ProtectedRoute
