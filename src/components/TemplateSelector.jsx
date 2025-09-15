// src/components/TemplateSelector.jsx
import React, { useState, useEffect } from 'react'
import { templatesService } from '../services/templatesService.js'
import { useToast } from '../context/ToastContext.jsx'
import Button from './ui/Button.jsx'

const TemplateSelector = ({ selectedTemplate, onTemplateSelect }) => {
  const [templates, setTemplates] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all') // 'all', 'free', 'popular'
  const { toast } = useToast()

  useEffect(() => {
    fetchTemplates()
  }, [filter])

  const fetchTemplates = async () => {
    setIsLoading(true)
    try {
      let response
      
      switch (filter) {
        case 'free':
          response = await templatesService.getFreeTemplates()
          break
        case 'popular':
          response = await templatesService.getPopularTemplates()
          break
        default:
          response = await templatesService.getTemplates()
      }

      setTemplates(response.templates || [])
    } catch (error) {
      console.error('Error fetching templates:', error)
      toast.error('Failed to load templates. Please try again.', {
        title: 'Loading Error'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTemplateSelect = (template) => {
    onTemplateSelect(template)
  }

  const formatPrice = (price, currency) => {
    if (price === 0) return 'Free'
    return `${currency} ${price.toLocaleString()}`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'all' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Templates ({templates.length})
        </button>
        <button
          onClick={() => setFilter('free')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'free' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Free Templates
        </button>
        <button
          onClick={() => setFilter('popular')}
          className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'popular' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Popular
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template._id}
            className={`relative bg-white rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-lg ${
              selectedTemplate?._id === template._id
                ? 'border-blue-500 ring-2 ring-blue-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleTemplateSelect(template)}
          >
            {/* Template Preview */}
            <div className="aspect-video mb-4 rounded-lg overflow-hidden bg-gray-100">
              <img
                src={template.previewImage}
                alt={template.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=No+Preview'
                }}
              />
            </div>

            {/* Template Info */}
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-gray-900 text-lg">{template.name}</h3>
                <div className="flex items-center space-x-1">
                  {template.isPopular && (
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                      🔥 Popular
                    </span>
                  )}
                  {template.isFree && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Free
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm">{template.description}</p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {template.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {template.tags.length > 3 && (
                  <span className="text-gray-400 text-xs">+{template.tags.length - 3} more</span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center text-gray-600">
                    ⭐ {template.rating}
                  </span>
                  <span className="flex items-center text-gray-600">
                    📥 {template.downloads.toLocaleString()}
                  </span>
                </div>
                <div className="font-semibold text-gray-900">
                  {formatPrice(template.price, template.currency)}
                </div>
              </div>

              {/* Features Preview */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Key Features:
                </p>
                <div className="space-y-1">
                  {template.features.slice(0, 3).map((feature, index) => (
                    <p key={index} className="text-xs text-gray-600">{feature}</p>
                  ))}
                  {template.features.length > 3 && (
                    <p className="text-xs text-gray-400">+{template.features.length - 3} more features</p>
                  )}
                </div>
              </div>

              {/* Best For */}
              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Best for:</span> {template.bestFor}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2 pt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(template.demoUrl, '_blank')
                  }}
                >
                  Preview
                </Button>
                <Button
                  size="sm"
                  className={`flex-1 ${
                    selectedTemplate?._id === template._id
                      ? 'bg-green-600 hover:bg-green-700'
                      : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleTemplateSelect(template)
                  }}
                >
                  {selectedTemplate?._id === template._id ? 'Selected' : 'Select'}
                </Button>
              </div>
            </div>

            {/* Selection Indicator */}
            {selectedTemplate?._id === template._id && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {templates.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">
            We couldn't find any templates matching your criteria.
          </p>
          <Button onClick={() => setFilter('all')}>View All Templates</Button>
        </div>
      )}
    </div>
  )
}

export default TemplateSelector
