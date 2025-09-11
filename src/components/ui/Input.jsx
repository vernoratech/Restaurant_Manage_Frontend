// src/components/ui/Input.jsx - Enhanced with glass effect support
import React from 'react'

const Input = ({ 
  label, 
  error, 
  className = '', 
  glass = false,
  ...props 
}) => {
  const baseClasses = `w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
    glass 
      ? 'bg-white/60 backdrop-blur-sm border-white/30' 
      : 'bg-white border-gray-300'
  }`

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <input
        className={`${baseClasses} ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export default Input
