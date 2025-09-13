// src/services/templatesService.js
import apiClient from './apiClient.js'

export const templatesService = {
  // Get all templates
  getTemplates: async (params = {}) => {
    try {
      const response = await apiClient.getTemplates(params)
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.message || 'Failed to fetch templates')
      }
    } catch (error) {
      console.error('Templates service error:', error)
      throw error
    }
  },

  // Get popular templates
  getPopularTemplates: async () => {
    try {
      const response = await apiClient.getTemplates({ popular: true })
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.message || 'Failed to fetch popular templates')
      }
    } catch (error) {
      console.error('Popular templates service error:', error)
      throw error
    }
  },

  // Get free templates
  getFreeTemplates: async () => {
    try {
      const response = await apiClient.getTemplates({ free: true })
      
      if (response.success) {
        return response.data
      } else {
        throw new Error(response.message || 'Failed to fetch free templates')
      }
    } catch (error) {
      console.error('Free templates service error:', error)
      throw error
    }
  },
}

export default templatesService
