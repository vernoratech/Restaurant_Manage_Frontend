// src/pages/EmailVerification/EmailVerification.jsx
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useNavigate } from 'react-router-dom'
import apiClient from '../../services/apiClient.js'
import Button from '../../components/ui/Button.jsx'

const EmailVerification = () => {
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  
  const [step, setStep] = useState('initial') // 'initial', 'otp-sent', 'verifying'
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [canResend, setCanResend] = useState(false)
  const [resendTimer, setResendTimer] = useState(60)

  // Redirect if user is already verified
  useEffect(() => {
    if (user?.isVerified) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  // Resend timer
  useEffect(() => {
    if (step === 'otp-sent' && resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (resendTimer === 0) {
      setCanResend(true)
    }
  }, [step, resendTimer])

  const handleSendOTP = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.sendEmailOTP()
      
      if (response.success) {
        setStep('otp-sent')
        setResendTimer(60)
        setCanResend(false)
        toast.success('OTP sent to your email successfully!', {
          title: 'OTP Sent',
          duration: 4000
        })
      } else {
        throw new Error(response.message || 'Failed to send OTP')
      }
    } catch (error) {
      console.error('Send OTP error:', error)
      
      if (error.message.includes('expired') || error.message.includes('login again')) {
        toast.error('Your session has expired. Please login again.', {
          title: 'Session Expired'
        })
        logout()
      } else {
        toast.error(error.message || 'Failed to send OTP. Please try again.', {
          title: 'Error'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setIsLoading(true)
    try {
      const response = await apiClient.resendEmailOTP()
      
      if (response.success) {
        setResendTimer(60)
        setCanResend(false)
        toast.success('OTP resent to your email!', {
          title: 'OTP Resent'
        })
      } else {
        throw new Error(response.message || 'Failed to resend OTP')
      }
    } catch (error) {
      toast.error(error.message || 'Failed to resend OTP', {
        title: 'Error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return // Prevent multiple characters
    
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      if (prevInput) prevInput.focus()
    }
  }

  const handleVerifyOTP = async () => {
    const otpString = otp.join('')
    
    if (otpString.length !== 6) {
      toast.warning('Please enter all 6 digits of the OTP', {
        title: 'Invalid OTP'
      })
      return
    }

    setIsLoading(true)
    setStep('verifying')

    try {
      const response = await apiClient.verifyEmailOTP(otpString)
      
      if (response.success) {
        // Update user context with verified status
        const updatedUser = { ...user, isVerified: true }
        localStorage.setItem('userData', JSON.stringify(updatedUser))
        
        toast.success('Email verified successfully!', {
          title: 'Verification Complete',
          duration: 4000
        })
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard')
        }, 1500)
      } else {
        throw new Error(response.message || 'Invalid OTP')
      }
    } catch (error) {
      console.error('Verify OTP error:', error)
      setStep('otp-sent') // Go back to OTP input
      
      if (error.message.includes('expired') || error.message.includes('login again')) {
        toast.error('Your session has expired. Please login again.', {
          title: 'Session Expired'
        })
        logout()
      } else {
        toast.error(error.message || 'Invalid OTP. Please try again.', {
          title: 'Verification Failed'
        })
        // Clear OTP inputs
        setOtp(['', '', '', '', '', ''])
        document.getElementById('otp-0')?.focus()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-blue-600 text-2xl">📧</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">
            Please verify your email address to continue using all features
          </p>
        </div>

        {/* Email Display */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-500 mb-1">Verification email will be sent to:</p>
          <p className="font-medium text-gray-900">{user?.email}</p>
        </div>

        {/* Initial Step - Send OTP */}
        {step === 'initial' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Click the button below to receive a 6-digit verification code via email
              </p>
            </div>
            
            <Button 
              onClick={handleSendOTP}
              loading={isLoading}
              className="w-full"
              size="lg"
            >
              Send Verification Code
            </Button>
          </div>
        )}

        {/* OTP Sent Step */}
        {step === 'otp-sent' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-gray-600 mb-6">
                Enter the 6-digit code sent to your email
              </p>
            </div>

            {/* OTP Input */}
            <div className="flex justify-center space-x-3 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
              ))}
            </div>

            <Button 
              onClick={handleVerifyOTP}
              loading={isLoading}
              className="w-full"
              size="lg"
            >
              Verify Email
            </Button>

            {/* Resend Section */}
            <div className="text-center">
              {!canResend ? (
                <p className="text-sm text-gray-500">
                  Resend code in {resendTimer} seconds
                </p>
              ) : (
                <button
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-blue-600 text-sm hover:text-blue-700 disabled:opacity-50"
                >
                  Resend verification code
                </button>
              )}
            </div>
          </div>
        )}

        {/* Verifying Step */}
        {step === 'verifying' && (
          <div className="text-center space-y-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600">Verifying your email...</p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Skip for now
            </button>
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmailVerification
