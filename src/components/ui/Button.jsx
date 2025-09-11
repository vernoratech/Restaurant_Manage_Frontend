// src/components/ui/Button.jsx - Add size variants
import React from 'react'

const Button = ({
  children,
  loading = false,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseClasses = 'rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors inline-flex items-center justify-center cursor-pointer'

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500 bg-white',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${loading ? 'opacity-50 cursor-not-allowed' : ''
    }`

  return (
    <button className={classes} disabled={loading} {...props}>
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  )
}

export default Button
