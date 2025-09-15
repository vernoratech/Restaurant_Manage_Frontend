// src/context/ToastContext.jsx
import React, { createContext, useContext, useState } from 'react'

const ToastContext = createContext()

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const addToast = (toast) => {
    const id = Date.now() + Math.random()
    const newToast = {
      id,
      type: 'success', // default
      title: 'Notification',
      message: '',
      duration: 5000, // 5 seconds default
      position: 'top-right', // default position
      ...toast // override defaults with passed values
    }

    setToasts(prev => [...prev, newToast])

    // Auto remove after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }

    return id
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const removeAllToasts = () => {
    setToasts([])
  }

  // Convenience methods
  const toast = {
    success: (message, options = {}) => addToast({ type: 'success', message, ...options }),
    error: (message, options = {}) => addToast({ type: 'error', message, ...options }),
    warning: (message, options = {}) => addToast({ type: 'warning', message, ...options }),
    info: (message, options = {}) => addToast({ type: 'info', message, ...options }),
    loading: (message, options = {}) => addToast({ type: 'loading', message, duration: 0, ...options }),
    custom: (toast) => addToast(toast)
  }

  const value = {
    toasts,
    addToast,
    removeToast,
    removeAllToasts,
    toast
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  )
}
