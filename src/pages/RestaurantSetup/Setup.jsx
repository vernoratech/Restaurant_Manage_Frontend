// src/pages/RestaurantSetup/Setup.jsx - Updated with enhanced fields
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import Input from '../../components/ui/Input.jsx'
import Button from '../../components/ui/Button.jsx'
import TemplateSelector from '../../components/TemplateSelector.jsx'

const RestaurantSetup = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [formData, setFormData] = useState({
    restaurantName: '',
    logoFile: null,
    logoPreview: '',
    contactNumber: '',
    address: '',
    showcaseAddress: '',
    description: '',
    minOrderTime: '',
    maxOrderTime: '',
    staffCount: '',
    cuisine: ''
  })
  const [errors, setErrors] = useState({})
  const { user } = useAuth()
  const navigate = useNavigate()

  // Load existing data if available (for edit mode)
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem('restaurantData') || '{}')
    if (savedData && Object.keys(savedData).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...savedData,
        logoFile: null, // Don't restore file object
        logoPreview: savedData.logoUrl || ''
      }))
      setSelectedTemplate(savedData.selectedTemplate || null)
    }

    // Pre-fill restaurant name from registration if available
    const registrationData = JSON.parse(localStorage.getItem('registrationData') || '{}')
    if (registrationData.restaurantName && !formData.restaurantName) {
      setFormData(prev => ({
        ...prev,
        restaurantName: registrationData.restaurantName
      }))
    }
  }, [])

  // Handle logo file preview
  useEffect(() => {
    if (formData.logoFile) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoPreview: reader.result }))
      }
      reader.readAsDataURL(formData.logoFile)
    }
  }, [formData.logoFile])

  const handleChange = (e) => {
    const { name, value, files } = e.target
    
    if (name === 'logoFile' && files && files[0]) {
      setFormData(prev => ({ ...prev, logoFile: files[0] }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
    console.log('Selected template:', template)
  }

  const validateStep1 = () => {
    const newErrors = {}
    
    if (!formData.restaurantName.trim()) {
      newErrors.restaurantName = 'Restaurant name is required'
    }
    
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = 'Contact number is required'
    } else if (!/^[\+]?[0-9\s\-\(\)]{7,15}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid contact number'
    }
    
    if (!formData.showcaseAddress.trim()) {
      newErrors.showcaseAddress = 'Showcase address is required'
    }
    
    if (!formData.minOrderTime.trim()) {
      newErrors.minOrderTime = 'Minimum order time is required'
    } else if (parseInt(formData.minOrderTime) < 1) {
      newErrors.minOrderTime = 'Minimum order time must be at least 1 minute'
    }
    
    if (!formData.maxOrderTime.trim()) {
      newErrors.maxOrderTime = 'Maximum order time is required'
    } else if (parseInt(formData.maxOrderTime) <= parseInt(formData.minOrderTime)) {
      newErrors.maxOrderTime = 'Maximum order time must be greater than minimum order time'
    }
    
    if (!formData.staffCount.trim()) {
      newErrors.staffCount = 'Number of staff is required'
    } else if (parseInt(formData.staffCount) < 1) {
      newErrors.staffCount = 'Number of staff must be at least 1'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2)
      }
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const setupData = {
      ...formData,
      logoUrl: formData.logoPreview, // Store the base64 preview as logo URL
      selectedTemplate: selectedTemplate,
      completedAt: new Date().toISOString()
    }
    
    // Save setup data
    localStorage.setItem('restaurantData', JSON.stringify(setupData))
    localStorage.setItem('restaurantSetupCompleted', 'true')
    
    console.log('✅ Restaurant setup completed with enhanced data:', setupData)
    navigate('/dashboard')
  }

  const handleSkip = () => {
    // Mark as completed even if skipped
    localStorage.setItem('restaurantSetupCompleted', 'true')
    navigate('/dashboard')
  }

  const stepTitles = {
    1: 'Restaurant Information',
    2: 'Choose Your Template'
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center space-x-4">
              {[1, 2].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < 2 && (
                    <div className={`w-16 h-1 mx-2 ${
                      currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
          <h1 className="text-center text-2xl font-bold text-gray-900">
            {stepTitles[currentStep]}
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {currentStep === 1 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Welcome to VesnoraTech! 🍽️
                </h2>
                <p className="text-gray-600">
                  Let's set up your restaurant profile with detailed information
                </p>
              </div>

              <form className="space-y-6">
                {/* 1. Restaurant Name */}
                <Input
                  label="Restaurant Name *"
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleChange}
                  error={errors.restaurantName}
                  placeholder="e.g., Mario's Pizza Palace"
                  required
                />

                {/* 2. Restaurant Logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Logo (Optional)
                  </label>
                  <input
                    type="file"
                    name="logoFile"
                    accept="image/*"
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.logoPreview && (
                    <div className="mt-3">
                      <img
                        src={formData.logoPreview}
                        alt="Logo Preview"
                        className="h-20 w-20 object-contain border border-gray-200 rounded-lg"
                      />
                    </div>
                  )}
                </div>

                {/* 3. Contact Number */}
                <Input
                  label="Restaurant Contact Number *"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  error={errors.contactNumber}
                  placeholder="e.g., +1 (555) 123-4567"
                  required
                />

                {/* 4. Address for GPS (Future) */}
                <Input
                  label="Restaurant Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Physical address of your restaurant"
                />

                {/* 5. Showcase Address */}
                <Input
                  label="Address for Users (Showcase on Menu) *"
                  name="showcaseAddress"
                  value={formData.showcaseAddress}
                  onChange={handleChange}
                  error={errors.showcaseAddress}
                  placeholder="Address that customers will see on your menu"
                  required
                />

                {/* 6. Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Description (Try with us feature included)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Tell customers about your restaurant, special features, and what makes you unique..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="4"
                  />
                </div>

                {/* 7. Order Time Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Minimum Order Time (minutes) *"
                    name="minOrderTime"
                    type="number"
                    value={formData.minOrderTime}
                    onChange={handleChange}
                    error={errors.minOrderTime}
                    placeholder="e.g., 20"
                    min="1"
                    required
                  />

                  <Input
                    label="Maximum Order Time (minutes) *"
                    name="maxOrderTime"
                    type="number"
                    value={formData.maxOrderTime}
                    onChange={handleChange}
                    error={errors.maxOrderTime}
                    placeholder="e.g., 45"
                    min="1"
                    required
                  />
                </div>

                {/* 8. Staff Count & Cuisine */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Number of Staff *"
                    name="staffCount"
                    type="number"
                    value={formData.staffCount}
                    onChange={handleChange}
                    error={errors.staffCount}
                    placeholder="e.g., 5"
                    min="1"
                    required
                  />

                  <Input
                    label="Cuisine Type"
                    name="cuisine"
                    value={formData.cuisine}
                    onChange={handleChange}
                    placeholder="e.g., Italian, Indian, Chinese"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="button" onClick={handleNext} className="flex-1">
                    Continue to Template Selection
                  </Button>
                  <Button type="button" variant="outline" onClick={handleSkip}>
                    Skip Setup
                  </Button>
                </div>
              </form>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <TemplateSelector 
                onTemplateSelect={handleTemplateSelect}
                selectedTemplateId={selectedTemplate?.id}
              />

              <div className="flex gap-4 pt-8 border-t">
                <Button type="button" variant="outline" onClick={handleBack}>
                  ← Back
                </Button>
                <Button 
                  type="button" 
                  onClick={handleSubmit} 
                  className="flex-1"
                  disabled={!selectedTemplate}
                >
                  Complete Setup {selectedTemplate && `with ${selectedTemplate.name}`}
                </Button>
                <Button type="button" variant="outline" onClick={handleSkip}>
                  Skip for Now
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RestaurantSetup
