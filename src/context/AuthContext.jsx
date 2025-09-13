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
    const validateSession = async () => {
      const token = localStorage.getItem('authToken');
      if (token && token !== 'undefined') {
        try {
          const response = await apiClient.verifyToken();
          if (response.success && response.data.user) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
             // Handle cases where token is invalid but API returns success:false
             throw new Error(response.message || 'Invalid session');
          }
        } catch (error) {
          console.error("Session validation failed:", error.message);
          localStorage.removeItem('authToken');
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    validateSession();
  }, []);

  const login = async (credentials) => {
    try {
      setIsLoading(true)
      console.log('🔐 Starting login process...')

      const response = await apiClient.login(credentials)
      
      // ✅ FIX: Access the token and user from the nested 'data' object.
      if (response.success && response.data && response.data.token && response.data.user) {
        const { token, user } = response.data;

        localStorage.setItem('authToken', token)
        
        setUser(user)
        setIsAuthenticated(true)
        console.log('✅ Login successful!')

        // Navigate based on user's setup status
        if (user.isSetup) {
            navigate('/dashboard', { replace: true });
        } else {
            navigate('/restaurant-setup', { replace: true });
        }

        return { success: true, user };
      } else {
        // If the structure is wrong or success is false
        throw new Error(response.message || 'Invalid login response from server.');
      }

    } catch (error) {
      console.error('❌ Login failed:', error)
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('authToken')
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

      // ✅ FIX: Assume the register response has the same structure.
      if (response.success && response.data && response.data.token && response.data.user) {
        const { token, user } = response.data;

        localStorage.setItem('authToken', token)

        setUser(user)
        setIsAuthenticated(true)
        console.log('✅ Registration successful!')

        navigate('/restaurant-setup', { replace: true });

        return { success: true, user };
      } else {
        throw new Error(response.message || 'Invalid registration response from server.');
      }

    } catch (error) {
      console.error('❌ Registration failed:', error)
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('authToken')
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
      console.error('Server logout failed, proceeding with client-side cleanup:', error)
    } finally {
      localStorage.removeItem('authToken')
      localStorage.removeItem('restaurantData'); // Also clear restaurant data
      setUser(null)
      setIsAuthenticated(false)
      navigate('/login', { replace: true })
    }
  }

  const checkRestaurantSetup = () => {
    if (user) {
      return user.isSetup === 1 || user.isSetup === true;
    }
    const restaurantData = localStorage.getItem('restaurantData');
    if (restaurantData) {
        const parsed = JSON.parse(restaurantData);
        return parsed.setupCompleted === true;
    }
    return false;
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    checkRestaurantSetup
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
