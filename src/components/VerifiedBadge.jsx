// src/components/VerifiedBadge.jsx
import React from 'react'

const VerifiedBadge = ({ isVerified, size = 'sm' }) => {
  if (!isVerified) return null

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  }

  return (
    <span className={`inline-flex items-center rounded-full bg-green-100 text-green-800 font-medium ${sizeClasses[size]}`}>
      <span className="mr-1">✅</span>
      Verified Email
    </span>
  )
}

export default VerifiedBadge
