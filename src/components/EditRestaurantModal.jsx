// src/components/EditRestaurantModal.jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from './ui/Input.jsx'
import Button from './ui/Button.jsx'
import TemplateSelector from './TemplateSelector.jsx'

const EditRestaurantModal = ({ isOpen, onClose, currentData }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTemplate, setSelectedTemplate] = useState(currentData?.selectedTemplate || null)
  const [formData, setFormData] = useState({
    restaurantName: '',
    cuisine: '',
    address: '',
    phone: '',
    description: '',
    ...currentData
  })
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    if (currentData) {
      setFormData(prev => ({ ...prev, ...currentData }))
      setSelectedTemplate(currentData.selectedTemplate)
    }
  }, [currentData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
  }

  const handleSave = () => {
    const updatedData = {
      ...formData,
      selectedTemplate,
      updatedAt: new Date().toISOString()
    }
    
    localStorage.setItem('restaurantData', JSON.stringify(updatedData))
    console.log('✅ Restaurant data updated:', updatedData)
    onClose()
  }

  const handleAdvancedEdit = () => {
    onClose()
    navigate('/restaurant-setup?edit=true')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Edit Restaurant Information</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Step Navigation */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setCurrentStep(1)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentStep === 1
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Basic Info
              </button>
              <button
                onClick={() => setCurrentStep(2)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentStep === 2
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Template
              </button>
            </div>
          </div>

          {currentStep === 1 && (
            <div className="space-y-4">
              <Input
                label="Restaurant Name"
                name="restaurantName"
                value={formData.restaurantName}
                onChange={handleChange}
                error={errors.restaurantName}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Cuisine Type"
                  name="cuisine"
                  value={formData.cuisine}
                  onChange={handleChange}
                />

                <Input
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <Input
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="max-h-96 overflow-y-auto">
              <TemplateSelector 
                onTemplateSelect={handleTemplateSelect}
                selectedTemplateId={selectedTemplate?.id}
              />
            </div>
          )}
        </div>

        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={handleAdvancedEdit}>
            Advanced Edit
          </Button>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditRestaurantModal
