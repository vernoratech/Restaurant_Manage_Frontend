// src/pages/RestaurantSetup/Setup.jsx - Light Mode Only Version
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useToast } from '../../context/ToastContext.jsx'
import { useNavigate } from 'react-router-dom'
import { restaurantService } from '../../services/restaurantService.js'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import TemplateSelector from '../../components/TemplateSelector.jsx'

const RestaurantSetup = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [showSkipModal, setShowSkipModal] = useState(false)
  
  const [formData, setFormData] = useState({
    restaurantName: '',
    contactNumber: '',
    address: '',
    showcaseAddress: '', // For menu display
    minOrderTime: '15',
    maxOrderTime: '40',
    cuisine: '',
    staffCount: '1',
    logoUrl: '',
    restaurantEmail: user?.email || '',
    restaurantGpsAddress: '', // GPS coordinates
    description: '',
    selectedTemplate: null
  })

  // Field mapping for API payload
  const validateStep = (step) => {
    const stepErrors = {}

    if (step === 1) {
      // Basic Information validation
      if (!formData.restaurantName.trim()) {
        stepErrors.restaurantName = 'Restaurant name is required'
      }
      if (!formData.contactNumber.trim()) {
        stepErrors.contactNumber = 'Contact number is required'
      } else if (!/^\d{10}$/.test(formData.contactNumber.replace(/\D/g, ''))) {
        stepErrors.contactNumber = 'Please enter a valid 10-digit phone number'
      }
      if (!formData.address.trim()) {
        stepErrors.address = 'Restaurant address is required'
      }
      if (!formData.cuisine.trim()) {
        stepErrors.cuisine = 'Cuisine type is required'
      }
    }

    if (step === 2) {
      // Operational Details validation
      const minTime = parseInt(formData.minOrderTime)
      const maxTime = parseInt(formData.maxOrderTime)
      
      if (isNaN(minTime) || minTime < 5 || minTime > 120) {
        stepErrors.minOrderTime = 'Minimum order time must be between 5 and 120 minutes'
      }
      if (isNaN(maxTime) || maxTime < 10 || maxTime > 180) {
        stepErrors.maxOrderTime = 'Maximum order time must be between 10 and 180 minutes'
      }
      if (minTime >= maxTime) {
        stepErrors.maxOrderTime = 'Maximum time must be greater than minimum time'
      }
      
      const staffCount = parseInt(formData.staffCount)
      if (isNaN(staffCount) || staffCount < 1 || staffCount > 500) {
        stepErrors.staffCount = 'Staff count must be between 1 and 500'
      }
    }

    if (step === 3) {
      // Template selection validation
      if (!formData.selectedTemplate) {
        stepErrors.selectedTemplate = 'Please select a menu template'
      }
    }

    setErrors(stepErrors)
    return Object.keys(stepErrors).length === 0
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1)
    } else {
      toast.warning('Please fill in all required fields correctly', {
        title: 'Validation Error'
      })
    }
  }

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1)
  }

  // Skip functionality
  const handleSkip = () => {
    setShowSkipModal(true)
  }

  const confirmSkip = () => {
    // Store minimal data to indicate setup was skipped
    const skippedSetupData = {
      restaurantName: 'My Restaurant', // Default name
      setupCompleted: false,
      skipped: true,
      skippedAt: new Date().toISOString(),
      // Store any partial data user entered
      partialData: formData
    }

    localStorage.setItem('restaurantData', JSON.stringify(skippedSetupData))

    toast.info('Setup skipped. You can complete it later from Settings.', {
      title: 'Setup Skipped',
      duration: 5000
    })

    setShowSkipModal(false)
    navigate('/dashboard')
  }

  const cancelSkip = () => {
    setShowSkipModal(false)
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      toast.error('Please complete all required fields', {
        title: 'Validation Error'
      })
      return
    }

    setIsLoading(true)

    try {
      // Prepare data for API
      const restaurantPayload = {
        restaurantName: formData.restaurantName,
        contactNumber: formData.contactNumber,
        address: formData.address,
        showcaseAddress: formData.showcaseAddress || formData.address,
        minOrderTime: formData.minOrderTime,
        maxOrderTime: formData.maxOrderTime,
        cuisine: formData.cuisine,
        staffCount: formData.staffCount,
        logoUrl: formData.logoUrl,
        restaurantEmail: formData.restaurantEmail,
        restaurantGpsAddress: formData.restaurantGpsAddress,
        description: formData.description,
        selectedTemplate: formData.selectedTemplate
      }

      console.log('Submitting restaurant data:', restaurantPayload)

      // Call API
      const response = await restaurantService.registerRestaurant(restaurantPayload)

      console.log('Registration successful:', response)

      // Store restaurant data locally
      const restaurantData = {
        ...response.restaurant,
        selectedTemplate: formData.selectedTemplate,
        completedAt: new Date().toISOString(),
        setupCompleted: true,
        skipped: false
      }

      localStorage.setItem('restaurantData', JSON.stringify(restaurantData))

      // Success toast
      toast.success('Restaurant setup completed successfully!', {
        title: 'Setup Complete',
        duration: 4000
      })

      // Navigate to dashboard
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)

    } catch (error) {
      console.error('Restaurant setup error:', error)
      
      // Error toast
      toast.error(error.message || 'Failed to complete restaurant setup. Please try again.', {
        title: 'Setup Failed',
        duration: 6000
      })
    } finally {
      setIsLoading(false)
    }
  }

  const cuisineOptions = [
    'Indian', 'Chinese', 'Italian', 'Mexican', 'Thai', 'Japanese',
    'Mediterranean', 'American', 'French', 'Korean', 'Vietnamese',
    'Continental', 'Multi-Cuisine', 'Fast Food', 'Other'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Skip Button */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Restaurant Setup</h1>
            <p className="text-gray-600 mt-2">Complete your restaurant profile to get started</p>
          </div>
          
          {/* Skip Button */}
          <Button 
            variant="outline" 
            onClick={handleSkip}
            className="text-gray-600 border-gray-300 hover:bg-gray-50"
            disabled={isLoading}
          >
            ⏭️ Skip for Now
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-300 text-gray-500'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-1 mx-4 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4">
            <p className="text-gray-600 text-center">
              Step {currentStep} of 3: {
                currentStep === 1 ? 'Basic Information' :
                currentStep === 2 ? 'Operational Details' :
                'Template Selection'
              }
            </p>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Restaurant Name *"
                  value={formData.restaurantName}
                  onChange={(e) => handleInputChange('restaurantName', e.target.value)}
                  error={errors.restaurantName}
                  placeholder="Enter restaurant name"
                />
                
                <Input
                  label="Contact Number *"
                  value={formData.contactNumber}
                  onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                  error={errors.contactNumber}
                  placeholder="Enter phone number"
                />
                
                <div className="md:col-span-2">
                  <Input
                    label="Restaurant Address *"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    error={errors.address}
                    placeholder="Enter full restaurant address"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <Input
                    label="Showcase Address (Optional)"
                    value={formData.showcaseAddress}
                    onChange={(e) => handleInputChange('showcaseAddress', e.target.value)}
                    placeholder="Address to show customers (if different)"
                    helperText="This address will be displayed on your menu. Leave blank to use restaurant address."
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cuisine Type *
                  </label>
                  <select
                    value={formData.cuisine}
                    onChange={(e) => handleInputChange('cuisine', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.cuisine ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select cuisine type</option>
                    {cuisineOptions.map((cuisine) => (
                      <option key={cuisine} value={cuisine}>{cuisine}</option>
                    ))}
                  </select>
                  {errors.cuisine && (
                    <p className="mt-1 text-sm text-red-600">{errors.cuisine}</p>
                  )}
                </div>
                
                <Input
                  label="Restaurant Email"
                  type="email"
                  value={formData.restaurantEmail}
                  onChange={(e) => handleInputChange('restaurantEmail', e.target.value)}
                  placeholder="restaurant@example.com"
                />
                
                <Input
                  label="Logo URL (Optional)"
                  value={formData.logoUrl}
                  onChange={(e) => handleInputChange('logoUrl', e.target.value)}
                  placeholder="https://example.com/logo.jpg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Tell customers about your restaurant..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                />
              </div>
            </div>
          )}

          {/* Step 2: Operational Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Operational Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Minimum Order Time (minutes) *"
                  type="number"
                  value={formData.minOrderTime}
                  onChange={(e) => handleInputChange('minOrderTime', e.target.value)}
                  error={errors.minOrderTime}
                  placeholder="15"
                  min="5"
                  max="120"
                />
                
                <Input
                  label="Maximum Order Time (minutes) *"
                  type="number"
                  value={formData.maxOrderTime}
                  onChange={(e) => handleInputChange('maxOrderTime', e.target.value)}
                  error={errors.maxOrderTime}
                  placeholder="40"
                  min="10"
                  max="180"
                />
                
                <Input
                  label="Staff Count *"
                  type="number"
                  value={formData.staffCount}
                  onChange={(e) => handleInputChange('staffCount', e.target.value)}
                  error={errors.staffCount}
                  placeholder="5"
                  min="1"
                  max="500"
                />
                
                <Input
                  label="GPS Address (Optional)"
                  value={formData.restaurantGpsAddress}
                  onChange={(e) => handleInputChange('restaurantGpsAddress', e.target.value)}
                  placeholder="18.5204,73.8567"
                  helperText="Latitude,Longitude format"
                />
              </div>
            </div>
          )}

          {/* Step 3: Template Selection */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Menu Template</h2>
              
              <TemplateSelector
                selectedTemplate={formData.selectedTemplate}
                onTemplateSelect={(template) => handleInputChange('selectedTemplate', template)}
              />
              
              {errors.selectedTemplate && (
                <p className="text-red-600 text-center">{errors.selectedTemplate}</p>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-8">
            <div className="flex items-center space-x-4">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handlePrevious} disabled={isLoading}>
                  Previous
                </Button>
              )}
              
              {/* Skip button in navigation area */}
              <Button 
                variant="ghost" 
                onClick={handleSkip}
                className="text-gray-500 hover:text-gray-700"
                disabled={isLoading}
              >
                Skip Setup
              </Button>
            </div>
            
            <div>
              {currentStep < 3 ? (
                <Button onClick={handleNext} disabled={isLoading}>
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  loading={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Complete Setup
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Skip Confirmation Modal */}
      {showSkipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <span className="text-yellow-600 text-xl">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Skip Restaurant Setup?</h3>
              </div>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-4">
                You can skip the setup now and complete it later, but you'll have limited functionality until your restaurant is fully configured.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-blue-900 mb-2">What you can do:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Access dashboard with basic features</li>
                  <li>• Complete setup later from Settings</li>
                  <li>• Explore the platform interface</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2">What you'll miss:</h4>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>• Menu creation and management</li>
                  <li>• Order processing features</li>
                  <li>• Customer-facing menu display</li>
                </ul>
              </div>
            </div>
            
            <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <Button 
                variant="outline" 
                onClick={cancelSkip}
                className="flex-1"
              >
                Continue Setup
              </Button>
              <Button 
                onClick={confirmSkip}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700"
              >
                Skip for Now
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RestaurantSetup
