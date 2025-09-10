// src/router/ProtectedRoute.jsx - Enhanced with setup completion check
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Loading from '../components/ui/Loading.jsx'

const ProtectedRoute = ({ 
  children, 
  redirectTo = '/login',
  requireSetup = true 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()
  
  if (isLoading) {
    return <Loading overlay text="Checking authentication..." />
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  const setupCompleted = localStorage.getItem('restaurantSetupCompleted') === 'true'

  // ✅ Block access to setup page if already completed (unless coming from edit)
  if (location.pathname === '/restaurant-setup') {
    const isEditMode = new URLSearchParams(location.search).get('edit') === 'true'
    
    if (setupCompleted && !isEditMode) {
      console.log('🚫 Setup already completed, redirecting to dashboard')
      return <Navigate to="/dashboard" replace />
    }
    
    return children
  }

  // Require setup completion for dashboard access
  if (requireSetup && !setupCompleted) {
    console.log('🏗️ Setup required, redirecting to setup')
    return <Navigate to="/restaurant-setup" replace />
  }

  return children
}

export default ProtectedRoute
