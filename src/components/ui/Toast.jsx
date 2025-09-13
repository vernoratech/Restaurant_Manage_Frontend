// src/components/ui/Toast.jsx
import React, { useEffect, useState } from 'react'

const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    setTimeout(() => setIsVisible(true), 50)
  }, [])

  const handleRemove = () => {
    setIsRemoving(true)
    setTimeout(() => {
      onRemove(toast.id)
    }, 300) // Match animation duration
  }

  const getToastStyles = () => {
    const baseStyles = "flex items-start p-4 mb-3 rounded-lg shadow-lg border-l-4 max-w-md transition-all duration-300 transform"
    
    const typeStyles = {
      success: "bg-white dark:bg-gray-800 border-green-500 text-gray-900 dark:text-white",
      error: "bg-white dark:bg-gray-800 border-red-500 text-gray-900 dark:text-white",
      warning: "bg-white dark:bg-gray-800 border-yellow-500 text-gray-900 dark:text-white",
      info: "bg-white dark:bg-gray-800 border-blue-500 text-gray-900 dark:text-white",
      loading: "bg-white dark:bg-gray-800 border-purple-500 text-gray-900 dark:text-white"
    }

    const animationStyles = isRemoving 
      ? "opacity-0 translate-x-full scale-95" 
      : isVisible 
        ? "opacity-100 translate-x-0 scale-100" 
        : "opacity-0 translate-x-full scale-95"

    return `${baseStyles} ${typeStyles[toast.type]} ${animationStyles}`
  }

  const getIcon = () => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      loading: '⏳'
    }
    return icons[toast.type] || 'ℹ️'
  }

  const getIconColor = () => {
    const colors = {
      success: 'text-green-500',
      error: 'text-red-500',
      warning: 'text-yellow-500',
      info: 'text-blue-500',
      loading: 'text-purple-500'
    }
    return colors[toast.type] || 'text-blue-500'
  }

  return (
    <div className={getToastStyles()}>
      <div className={`flex-shrink-0 text-lg ${getIconColor()}`}>
        {getIcon()}
      </div>
      
      <div className="ml-3 flex-1">
        {toast.title && (
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {toast.title}
          </p>
        )}
        <p className="text-sm text-gray-700 dark:text-gray-300">
          {toast.message}
        </p>
      </div>

      {toast.duration > 0 && (
        <button
          onClick={handleRemove}
          className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <span className="sr-only">Close</span>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  )
}

export default Toast
