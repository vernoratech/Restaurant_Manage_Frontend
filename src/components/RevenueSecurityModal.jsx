// src/components/RevenueSecurityModal.jsx
import React, { useState, useEffect } from 'react'
import Button from './ui/Button.jsx'
import Input from './ui/Input.jsx'

const RevenueSecurityModal = ({ isOpen, onClose, mode = 'verify', onSuccess }) => {
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [currentPin, setCurrentPin] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const maxAttempts = 3

  useEffect(() => {
    if (isOpen) {
      setPin('')
      setConfirmPin('')
      setCurrentPin('')
      setError('')
      setAttempts(0)
    }
  }, [isOpen, mode])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      if (mode === 'setup') {
        // Setting up new PIN
        if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
          setError('PIN must be exactly 4 digits')
          setIsLoading(false)
          return
        }

        if (pin !== confirmPin) {
          setError('PINs do not match')
          setIsLoading(false)
          return
        }

        // Save PIN to localStorage (in production, use encrypted storage)
        localStorage.setItem('revenuePIN', pin)
        onSuccess?.()
        onClose()
        
      } else if (mode === 'change') {
        // Changing existing PIN
        const savedPin = localStorage.getItem('revenuePIN')
        
        if (!savedPin) {
          setError('No PIN is currently set')
          setIsLoading(false)
          return
        }

        if (currentPin !== savedPin) {
          setError('Current PIN is incorrect')
          setIsLoading(false)
          return
        }

        if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
          setError('New PIN must be exactly 4 digits')
          setIsLoading(false)
          return
        }

        if (pin !== confirmPin) {
          setError('New PINs do not match')
          setIsLoading(false)
          return
        }

        localStorage.setItem('revenuePIN', pin)
        onSuccess?.()
        onClose()
        
      } else {
        // Verifying PIN to view revenue
        const savedPin = localStorage.getItem('revenuePIN')
        
        if (!savedPin) {
          // No PIN set, redirect to setup
          setError('Please set up a PIN first')
          setIsLoading(false)
          return
        }

        if (pin !== savedPin) {
          const newAttempts = attempts + 1
          setAttempts(newAttempts)
          
          if (newAttempts >= maxAttempts) {
            setError('Too many failed attempts. Please try again later.')
            setTimeout(() => {
              onClose()
            }, 2000)
          } else {
            setError(`Incorrect PIN. ${maxAttempts - newAttempts} attempts remaining.`)
          }
          setPin('')
          setIsLoading(false)
          return
        }

        // PIN verified successfully
        onSuccess?.()
        onClose()
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePinChange = (value) => {
    // Only allow digits and limit to 4 characters
    const digits = value.replace(/\D/g, '').slice(0, 4)
    setPin(digits)
  }

  const handleConfirmPinChange = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    setConfirmPin(digits)
  }

  const handleCurrentPinChange = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    setCurrentPin(digits)
  }

  if (!isOpen) return null

  const titles = {
    setup: 'Set Revenue PIN',
    change: 'Change Revenue PIN',
    verify: 'Enter Revenue PIN'
  }

  const descriptions = {
    setup: 'Create a 4-digit PIN to protect your revenue information',
    change: 'Change your existing revenue protection PIN',
    verify: 'Enter your 4-digit PIN to view revenue details'
  }

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9999] p-4 flex items-center justify-center">
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md border border-white/30">
        {/* Header */}
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-2xl">🔒</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {titles[mode]}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {descriptions[mode]}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {mode === 'change' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current PIN
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={currentPin}
                  onChange={(e) => handleCurrentPinChange(e.target.value)}
                  placeholder="••••"
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm"
                  maxLength="4"
                  required
                />
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {mode === 'change' ? 'New PIN' : mode === 'setup' ? 'Create PIN' : 'Enter PIN'}
            </label>
            <div className="relative">
              <input
                type="password"
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                placeholder="••••"
                className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm"
                maxLength="4"
                required
                autoFocus
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">
              4-digit PIN (numbers only)
            </p>
          </div>

          {(mode === 'setup' || mode === 'change') && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm PIN
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => handleConfirmPinChange(e.target.value)}
                  placeholder="••••"
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80 backdrop-blur-sm"
                  maxLength="4"
                  required
                />
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {mode === 'verify' && attempts > 0 && attempts < maxAttempts && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-600 text-sm text-center">
                {maxAttempts - attempts} attempts remaining
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-white/80 backdrop-blur-sm"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600/90 hover:bg-blue-700/90 backdrop-blur-sm"
              loading={isLoading}
              disabled={isLoading || attempts >= maxAttempts}
            >
              {mode === 'verify' ? 'Unlock' : 'Save PIN'}
            </Button>
          </div>
        </form>

        {/* Help Text */}
        <div className="px-6 pb-6">
          <div className="bg-gray-50/80 backdrop-blur-sm rounded-lg p-3">
            <p className="text-xs text-gray-600 text-center">
              💡 Your PIN protects sensitive revenue information. Keep it secure and don't share it with others.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RevenueSecurityModal
