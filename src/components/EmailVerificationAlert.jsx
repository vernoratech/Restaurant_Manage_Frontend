// src/components/EmailVerificationAlert.jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from './ui/Button.jsx'

const EmailVerificationAlert = ({ user }) => {
  const navigate = useNavigate()

  if (user?.isVerified) return null

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-yellow-400 text-xl">⚠️</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-800">
              <strong>Email Verification Required</strong>
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              Please verify your email address ({user?.email}) to unlock all features and secure your account.
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={() => navigate('/email-verification')}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            Verify Email
          </Button>
        </div>
      </div>
    </div>
  )
}

export default EmailVerificationAlert
