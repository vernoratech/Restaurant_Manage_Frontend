// src/router/PublicRoute.jsx - Redirect authenticated users away from auth pages
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

  // Show loading while checking authentication
  if (isLoading) {
    return <Loading overlay text="Checking authentication..." />
  }

  // If user is authenticated, redirect away from public pages (login/register)
  // if (isAuthenticated && user) {

  //   // Check if setup is completed to decide where to redirect

  //   // const setupCompleted = localStorage.getItem('restaurantData') === 'true'
  //   const setupCompleted = checkRestaurantSetup()


  //   console.log("setupCompleted>",setupCompleted);
  //   console.log("user>",user);

  //   if (!setupCompleted) {
  //     return <Navigate to="/restaurant-setup" replace />
  //   }

  //   return <Navigate to={redirectTo} replace />
  // }

  if (isAuthenticated && user) {
    console.log("✅ PublicRoute: User is authenticated, checking setup status...")
    console.log("👤 User setup details:", {
      isSetup: user.isSetup,
      resId: user.resId,
      setupComplete: checkRestaurantSetup()
    })

    // ✅ STEP 3: Use checkRestaurantSetup() instead of localStorage
    const setupCompleted = checkRestaurantSetup()

    if (!setupCompleted) {
      console.log("🏗️ PublicRoute: Setup not complete, redirecting to restaurant setup")
      return <Navigate to="/restaurant-setup" replace />
    } else {
      console.log("🎉 PublicRoute: Setup complete, redirecting to dashboard")
      return <Navigate to={redirectTo} replace />
    }
  }

  // User is not authenticated, allow access to public pages
  return children
}

export default PublicRoute
