// src/pages/RestaurantSetup/Setup.jsx - With template selection
import React, { useState } from 'react'
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
    cuisine: '',
    address: '',
    phone: '',
    description: ''
  })
  const [errors, setErrors] = useState({})
  const { user } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
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
      selectedTemplate: selectedTemplate,
      completedAt: new Date().toISOString()
    }
    
    // Save setup data
    localStorage.setItem('restaurantData', JSON.stringify(setupData))
    localStorage.setItem('restaurantSetupCompleted', 'true')
    
    console.log('✅ Restaurant setup completed with template:', setupData)
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
                  Let's set up your restaurant profile to get started
                </p>
              </div>

              <form className="space-y-6">
                <Input
                  label="Restaurant Name *"
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleChange}
                  error={errors.restaurantName}
                  placeholder="e.g., Mario's Pizza Palace"
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Cuisine Type"
                    name="cuisine"
                    value={formData.cuisine}
                    onChange={handleChange}
                    placeholder="e.g., Italian, Indian, American"
                  />

                  <Input
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g., +1 (555) 123-4567"
                  />
                </div>

                <Input
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Restaurant address"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Brief description of your restaurant..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
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
