// src/components/TemplateSelector.jsx
import React, { useState, useEffect } from 'react'
import templatesAPI from '../api/templates.js'
import Button from './ui/Button.jsx'
import Loading from './ui/Loading.jsx'

const TemplateSelector = ({ onTemplateSelect, selectedTemplateId }) => {
  const [templates, setTemplates] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setIsLoading(true)
      const response = await templatesAPI.getTemplates()
      setTemplates(response.templates)
    } catch (err) {
      setError('Failed to load templates. Please try again.')
      console.error('Template loading error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredTemplates = templates.filter(template => {
    if (filter === 'free') return template.is_free
    if (filter === 'popular') return template.is_popular
    if (filter === 'premium') return !template.is_free
    return true
  })

  const formatPrice = (price, currency) => {
    if (price === 0) return 'Free'
    return `₹${price.toLocaleString()}`
  }

  const StarRating = ({ rating }) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>)
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>)
    }

    return <div className="flex items-center">{stars}</div>
  }

  if (isLoading) {
    return <Loading text="Loading templates..." />
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadTemplates}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Menu Template</h2>
        <p className="text-gray-600">Select a beautiful template for your restaurant's online menu</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-lg flex space-x-1">
          {[
            { key: 'all', label: 'All Templates' },
            { key: 'popular', label: '🔥 Popular' },
            { key: 'free', label: '✨ Free' },
            { key: 'premium', label: '👑 Premium' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className={`bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer ${
              selectedTemplateId === template.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => onTemplateSelect(template)}
          >
            {/* Template Preview Image */}
            <div className="relative">
              <img
                src={template.preview_image}
                alt={template.name}
                className="w-full h-48 object-cover"
              />
              
              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                {template.is_popular && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    🔥 Popular
                  </span>
                )}
                {template.is_free && (
                  <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                    Free
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="absolute top-3 right-3">
                <span className={`text-sm font-bold px-2 py-1 rounded-full ${
                  template.is_free 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {formatPrice(template.price, template.currency)}
                </span>
              </div>

              {/* Selected Indicator */}
              {selectedTemplateId === template.id && (
                <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                  <div className="bg-blue-500 text-white rounded-full p-2">
                    <span className="text-xl">✓</span>
                  </div>
                </div>
              )}
            </div>

            {/* Template Info */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                <div className="flex items-center gap-1">
                  <StarRating rating={template.rating} />
                  <span className="text-sm text-gray-500 ml-1">{template.rating}</span>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {template.description}
              </p>

              {/* Best For */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-1">BEST FOR:</p>
                <p className="text-sm text-gray-700">{template.best_for}</p>
              </div>

              {/* Features Preview */}
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-2">KEY FEATURES:</p>
                <div className="space-y-1">
                  {template.features.slice(0, 3).map((feature, index) => (
                    <p key={index} className="text-xs text-gray-600">{feature}</p>
                  ))}
                  {template.features.length > 3 && (
                    <p className="text-xs text-blue-600">+{template.features.length - 3} more features</p>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                <span>{template.downloads.toLocaleString()} downloads</span>
                <span className="capitalize">{template.category}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  variant={selectedTemplateId === template.id ? 'primary' : 'outline'}
                  onClick={(e) => {
                    e.stopPropagation()
                    onTemplateSelect(template)
                  }}
                >
                  {selectedTemplateId === template.id ? 'Selected' : 'Select'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    window.open(template.demo_url, '_blank')
                  }}
                >
                  Preview
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No templates found */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No templates found for the selected filter.</p>
          <Button variant="outline" onClick={() => setFilter('all')} className="mt-4">
            Show All Templates
          </Button>
        </div>
      )}
    </div>
  )
}

export default TemplateSelector
