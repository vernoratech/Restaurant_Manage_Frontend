// src/router/PublicRoute.jsx - UPDATED to handle skipped users
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Loading from '../components/ui/Loading.jsx'

const PublicRoute = ({
  children,
  redirectTo = '/dashboard'
}) => {
  const { user, isAuthenticated, isLoading, checkRestaurantSetup } = useAuth()
  const location = useLocation()

  console.log("🚪 PublicRoute: Checking access to:", location.pathname)

  // Show loading while checking authentication
  if (isLoading) {
    return <Loading overlay text="Checking authentication..." />
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

  if (isAuthenticated && user) {
    console.log("✅ PublicRoute: User is authenticated, checking setup status...")
    
    const setupCompleted = checkRestaurantSetup()
    const setupSkipped = checkSkippedSetup()
    
    console.log("📊 PublicRoute: Setup Status:", { 
      setupCompleted, 
      setupSkipped,
      userSetup: user.isSetup,
      userResId: user.resId 
    })

    // ✅ If setup is completed OR skipped, redirect to dashboard
    if (setupCompleted || setupSkipped) {
      console.log("🎉 PublicRoute: Setup complete or skipped, redirecting to dashboard")
      return <Navigate to={redirectTo} replace />
    } else {
      console.log("🏗️ PublicRoute: Setup not complete, redirecting to setup")
      return <Navigate to="/restaurant-setup" replace />
    }
  }

  // User is not authenticated, allow access to public pages
  console.log("🔓 PublicRoute: User not authenticated, allowing access to public page")
  return children
}

export default PublicRoute
