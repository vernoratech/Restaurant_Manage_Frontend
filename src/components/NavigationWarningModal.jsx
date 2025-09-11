// src/components/NavigationWarningModal.jsx - Enhanced with backdrop blur
import React from 'react'
import Button from './ui/Button.jsx'

const NavigationWarningModal = ({ isOpen, onConfirm, onCancel, title, message }) => {
  if (!isOpen) return null

  return (
    <>
      {/* Enhanced Backdrop with Blur Effect */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-md z-[9999] p-4 flex items-center justify-center">
        {/* Modal Content */}
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md transform transition-all border border-white/30">
          {/* Header */}
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-yellow-100/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-2xl">⚠️</span>
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
          <div className="flex gap-3 p-6 border-t border-gray-200/50 bg-gray-50/80 backdrop-blur-sm rounded-b-2xl">
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="flex-1 bg-white/80 backdrop-blur-sm hover:bg-white/90"
            >
              Stay on Page
            </Button>
            <Button 
              onClick={onConfirm}
              className="flex-1 bg-red-600/90 hover:bg-red-700/90 focus:ring-red-500 backdrop-blur-sm"
            >
              Leave Anyway
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export default NavigationWarningModal
