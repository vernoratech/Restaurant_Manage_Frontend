// src/components/ui/ToastContainer.jsx
import React from 'react'
import { useToast } from '../../context/ToastContext.jsx'
import Toast from './Toast.jsx'

const ToastContainer = () => {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  const getPositionStyles = (position) => {
    const positions = {
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4',
      'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
    }
    return positions[position] || positions['top-right']
  }

  // Group toasts by position
  const toastsByPosition = toasts.reduce((acc, toast) => {
    const position = toast.position || 'top-right'
    if (!acc[position]) {
      acc[position] = []
    }
    acc[position].push(toast)
    return acc
  }, {})

  return (
    <>
      {Object.entries(toastsByPosition).map(([position, positionToasts]) => (
        <div
          key={position}
          className={`fixed z-50 pointer-events-none ${getPositionStyles(position)}`}
        >
          <div className="pointer-events-auto">
            {positionToasts.map((toast) => (
              <Toast
                key={toast.id}
                toast={toast}
                onRemove={removeToast}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

export default ToastContainer
