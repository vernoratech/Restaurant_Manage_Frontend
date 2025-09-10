// src/App.jsx - With PublicRoute protection for auth pages
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './router/ProtectedRoute.jsx'
import PublicRoute from './router/PublicRoute.jsx'
import HomePage from './pages/Home/HomePage.jsx'
import Login from './pages/Auth/Login.jsx'
import Register from './pages/Auth/Register.jsx'
import RestaurantSetup from './pages/RestaurantSetup/Setup.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Home Page - accessible to all */}
            <Route path="/" element={<HomePage />} />
            
            {/* Public Auth Routes - only for non-authenticated users */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } 
            />
            
            {/* Protected Routes - only for authenticated users */}
            <Route 
              path="/restaurant-setup" 
              element={
                <ProtectedRoute requireSetup={false}>
                  <RestaurantSetup />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requireSetup={true}>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />

            {/* 404 Route */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-8">Page not found</p>
                  <a href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
                    Go Home
                  </a>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
