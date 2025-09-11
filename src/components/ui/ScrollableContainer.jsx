// src/components/ui/ScrollableContainer.jsx
import React from 'react'

const ScrollableContainer = ({ 
  children, 
  className = '', 
  maxHeight = 'max-h-96',
  scrollType = 'default' // 'default', 'modal', 'template', 'dashboard'
}) => {
  const scrollClasses = {
    default: 'scrollable-container',
    modal: 'modal-content',
    template: 'template-scroll',
    dashboard: 'dashboard-scroll'
  }

  return (
    <div 
      className={`${maxHeight} overflow-y-auto ${scrollClasses[scrollType]} ${className}`}
    >
      {children}
    </div>
  )
}

export default ScrollableContainer
