// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import apiClient from '../services/apiClient'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken')
        
        if (token) {
          // For now, just assume token is valid
          // Later you can add API call to verify token
          setIsAuthenticated(true)
          setUser({ token }) // Minimal user object
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        localStorage.removeItem('authToken')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials) => {
    try {
      setIsLoading(true)
      console.log('🔐 Starting login process...')

      const response = await apiClient.login(credentials)
      
      // Store token
      const token = response.token || response.accessToken
      localStorage.setItem('authToken', token)
      
      // Update state
      setUser(response.user || { email: credentials.email })
      setIsAuthenticated(true)
      
      console.log('✅ Login successful!')
      
      // Navigate to restaurant setup
      setTimeout(() => {
        navigate('/restaurant-setup', { replace: true })
      }, 100)

      return { success: true, user: response.user }
      
    } catch (error) {
      console.error('❌ Login failed:', error)
      return { 
        success: false, 
        error: error.message || 'Login failed. Please try again.' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setIsLoading(true)
      console.log('📝 Starting registration process...')

      const response = await apiClient.register(userData)
      
      // Store token
      const token = response.token || response.accessToken
      localStorage.setItem('authToken', token)
      
      // Update state
      setUser(response.user || { email: userData.email })
      setIsAuthenticated(true)
      
      console.log('✅ Registration successful!')
      
      // Navigate to restaurant setup
      setTimeout(() => {
        navigate('/restaurant-setup', { replace: true })
      }, 100)

      return { success: true, user: response.user }
      
    } catch (error) {
      console.error('❌ Registration failed:', error)
      return { 
        success: false, 
        error: error.message || 'Registration failed. Please try again.' 
      }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear local state
      localStorage.removeItem('authToken')
      setUser(null)
      setIsAuthenticated(false)
      navigate('/login', { replace: true })
    }
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
