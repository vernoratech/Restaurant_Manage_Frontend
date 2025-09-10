// src/components/NavigationWarningModal.jsx
import React from 'react'
import Button from './ui/Button.jsx'

const NavigationWarningModal = ({ isOpen, onConfirm, onCancel, title, message }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-xl">⚠️</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {title || "Leave Dashboard?"}
              </h3>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 leading-relaxed">
            {message || "Changes you made may not be saved."}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="flex-1"
          >
            Stay on Page
          </Button>
          <Button 
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            Leave Anyway
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NavigationWarningModal
