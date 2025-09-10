// src/services/apiClient.js
const BASE_URL = 'https://web-production-c660.up.railway.app/vernora-api/api'

class ApiClient {
  constructor() {
    this.baseURL = BASE_URL
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`

    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      mode: 'cors',
      ...options,
    }

    // ✅ Only add auth token for authenticated endpoints
    const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/auth/register')
    const token = localStorage.getItem('authToken')

    if (token && !isAuthEndpoint) {
      config.headers.Authorization = `Bearer ${token}`
    }

    try {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`)
      console.log('📤 Request config:', config)

      const response = await fetch(url, config)

      console.log(`📊 Response Status: ${response.status}`)

      // Check if response has content
      const contentType = response.headers.get('content-type')
      let data

      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        const text = await response.text()
        console.log('📄 Response text:', text)

        try {
          data = text ? JSON.parse(text) : {}
        } catch {
          data = { message: text || `HTTP ${response.status}` }
        }
      }

      console.log(`📊 Parsed Response:`, data)

      if (!response.ok) {
        let errorMessage = data.message || data.error

        switch (response.status) {
          case 409:
            errorMessage = 'Email address already registered. Please use a different email or sign in.'
            break
          case 403:
            errorMessage = 'Access forbidden. Please check your credentials or contact support.'
            break
          case 404:
            errorMessage = 'API endpoint not found.'
            break
          case 500:
            errorMessage = 'Server error. Please try again later.'
            break
          default:
            errorMessage = errorMessage || `HTTP ${response.status}: ${response.statusText}`
        }

        throw new Error(errorMessage)
      }

      return data
    } catch (error) {
      console.error(`🚨 API Error:`, error)

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection.')
      }

      throw error
    }
  }

  // Authentication endpoints (no auth headers)
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async logout() {
    const response = await this.request('/auth/logout', {
      method: 'POST',
    })
    localStorage.removeItem('authToken')
    return response
  }

  // Authenticated endpoints (will include auth headers)
  async getProfile() {
    return this.request('/user/profile')
  }
}

const apiClient = new ApiClient()
export default apiClient
