// src/router/ProtectedRoute.jsx - Handle skipped setup
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const ProtectedRoute = ({ children, requireSetup = true }) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

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

  if (requireSetup) {
    const restaurantData = localStorage.getItem('restaurantData')
    if (!restaurantData) {
      return <Navigate to="/restaurant-setup" replace />
    }

    const parsed = JSON.parse(restaurantData)
    // Allow access if setup is completed OR skipped
    if (!parsed.setupCompleted && !parsed.skipped) {
      return <Navigate to="/restaurant-setup" replace />
    }
  }

  return children
}

export default ProtectedRoute
