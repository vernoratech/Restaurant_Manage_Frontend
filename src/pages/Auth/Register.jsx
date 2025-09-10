// src/pages/Auth/Register.jsx - Fixed version
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import Loading from '../../components/ui/Loading.jsx'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})

  const { register, isLoading } = useAuth()

  const generateUniqueEmail = () => {
    const timestamp = Date.now()
    const randomNum = Math.floor(Math.random() * 1000)
    return `user${timestamp}${randomNum}@example.com`
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    // ✅ Enhanced password validation
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else {
      const password = formData.password
      const passwordErrors = []

      if (password.length < 8) {
        passwordErrors.push('at least 8 characters')
      }

      if (!/[A-Za-z]/.test(password)) {
        passwordErrors.push('at least one letter')
      }

      if (!/[0-9]/.test(password)) {
        passwordErrors.push('at least one number')
      }

      // Check for common weak passwords
      const commonPasswords = ['123456', '123456789', 'password', 'qwerty', '111111']
      if (commonPasswords.some(common => password.toLowerCase().includes(common.toLowerCase()))) {
        passwordErrors.push('cannot contain common passwords')
      }

      if (passwordErrors.length > 0) {
        newErrors.password = `Password must have ${passwordErrors.join(', ')}`
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // ✅ Send only email and password (like login)
    const registrationData = {
      email: formData.email,
      password: formData.password
      // Note: name is collected for future use but not sent to API yet
    }

    console.log('🔄 Submitting registration form...')
    const result = await register(registrationData)

    if (!result.success) {
      // ✅ Handle 409 conflict error specifically
      if (result.error.includes('conflict') || result.error.includes('exists') || result.error.includes('registered')) {
        setErrors({ email: 'This email is already registered. Please use a different email or try logging in.' })
      } else if (result.error.toLowerCase().includes('email')) {
        setErrors({ email: result.error })
      } else if (result.error.toLowerCase().includes('password')) {
        setErrors({ password: result.error })
      } else {
        setErrors({ general: result.error })
      }
    }
  }

  if (isLoading) {
    return <Loading overlay text="Creating account..." />
  }


  // Add this helper function to Register.jsx

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: '' }

    let score = 0
    const checks = {
      length: password.length >= 8,
      hasLetter: /[A-Za-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password),
      notCommon: !['123456', '123456789', 'password', 'qwerty'].some(common =>
        password.toLowerCase().includes(common.toLowerCase())
      )
    }

    score = Object.values(checks).filter(Boolean).length

    if (score < 2) return { strength: score, text: 'Weak', color: 'text-red-600' }
    if (score < 4) return { strength: score, text: 'Fair', color: 'text-yellow-600' }
    if (score < 5) return { strength: score, text: 'Good', color: 'text-blue-600' }
    return { strength: score, text: 'Strong', color: 'text-green-600' }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">VesnoraTech</h1>
          <h2 className="text-3xl font-bold text-gray-900">Create your account</h2>
          <p className="mt-2 text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              sign in to existing account
            </Link>
          </p>
        </div>

        {/* ✅ Quick test email generator */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800 mb-2">
            <strong>Testing:</strong> Use a unique email to avoid conflicts
          </p>
          <Button
            type="button"
            variant="outline"
            size="small"
            onClick={() => setFormData(prev => ({ ...prev, email: generateUniqueEmail() }))}
            className="text-xs"
          >
            Generate Test Email
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {errors.general}
            </div>
          )}

          <Input
            label="Full Name (for display)"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Enter your full name"
            required
          />

          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="Enter a unique email address"
            required
          />

          <div className="space-y-2">
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Create a strong password"
              required
            />

            {/* Password strength indicator */}
            {formData.password && (
              <div className="text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span>Password strength:</span>
                  <span className={`font-medium ${getPasswordStrength(formData.password).color}`}>
                    {getPasswordStrength(formData.password).text}
                  </span>
                </div>

                {/* Password requirements checklist */}
                <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                  <p className="font-medium text-gray-700 mb-2">Requirements:</p>
                  <div className="space-y-1 text-xs">
                    <div className={`flex items-center gap-2 ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-500'}`}>
                      <span>{formData.password.length >= 8 ? '✅' : '⭕'}</span>
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-2 ${/[A-Za-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                      <span>{/[A-Za-z]/.test(formData.password) ? '✅' : '⭕'}</span>
                      <span>At least one letter</span>
                    </div>
                    <div className={`flex items-center gap-2 ${/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                      <span>{/[0-9]/.test(formData.password) ? '✅' : '⭕'}</span>
                      <span>At least one number</span>
                    </div>
                    <div className={`flex items-center gap-2 ${!/123456|password|qwerty/i.test(formData.password) ? 'text-green-600' : 'text-gray-500'}`}>
                      <span>{!/123456|password|qwerty/i.test(formData.password) ? '✅' : '⭕'}</span>
                      <span>No common passwords</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Confirm your password"
            required
          />

          <Button
            type="submit"
            className="w-full"
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </Button>

          <div className="text-center">
            <Link to="/" className="text-sm text-blue-600 hover:text-blue-500">
              ← Back to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register
