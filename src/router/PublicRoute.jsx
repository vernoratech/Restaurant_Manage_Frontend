// src/router/PublicRoute.jsx - Redirect authenticated users away from auth pages
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Loading from '../components/ui/Loading.jsx'

const PublicRoute = ({ 
  children, 
  redirectTo = '/dashboard' 
}) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()
  
  // Show loading while checking authentication
  if (isLoading) {
    return <Loading overlay text="Checking authentication..." />
  }

  // If user is authenticated, redirect away from public pages (login/register)
  if (isAuthenticated) {
    console.log('✅ User already authenticated, redirecting to dashboard')
    
    // Check if setup is completed to decide where to redirect
    const setupCompleted = localStorage.getItem('restaurantSetupCompleted') === 'true'
    
    if (!setupCompleted) {
      return <Navigate to="/restaurant-setup" replace />
    }
    
    return <Navigate to={redirectTo} replace />
  }

  // User is not authenticated, allow access to public pages
  console.log('🔓 User not authenticated, allowing access to public page')
  return children
}

export default PublicRoute
