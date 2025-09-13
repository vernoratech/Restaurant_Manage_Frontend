// src/services/restaurantService.js
const API_BASE_URL = 'https://restaurantmenu-five.vercel.app/api'

export const restaurantService = {
  // Register restaurant
  async registerRestaurant(restaurantData) {
    const token = localStorage.getItem('authToken')
    
    if (!token) {
      throw new Error('Authentication token is required')
    }

    // Prepare the payload according to your API requirements
    const payload = {
      restaurantName: restaurantData.restaurantName,
      restaurantContactNumber: restaurantData.contactNumber,
      restaurantAddress: restaurantData.address,
      minOrderTime: parseInt(restaurantData.minOrderTime) || 15,
      maxOrderTime: parseInt(restaurantData.maxOrderTime) || 40,
      cuisine: restaurantData.cuisine,
      staffCount: parseInt(restaurantData.staffCount) || 1,
      logoUrl: restaurantData.logoUrl || '',
      restaurantEmail: restaurantData.restaurantEmail || '',
      restaurantGpsAddress: restaurantData.restaurantGpsAddress || '',
      selectedTempId: "1234567890abcdef" // Static for now as requested
    }

    console.log('Restaurant registration payload:', payload)

    try {
      const response = await fetch(`${API_BASE_URL}/restaurants/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || `HTTP Error: ${response.status}`)
      }

      console.log('Restaurant registration response:', data)
      return data

    } catch (error) {
      console.error('Restaurant registration error:', error)
      throw error
    }
  },

  // Get restaurant details (for future use)
  async getRestaurant() {
    const token = localStorage.getItem('authToken')
    
    if (!token) {
      throw new Error('Authentication token is required')
    }

    try {
      const response = await fetch(`${API_BASE_URL}/restaurants/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch restaurant details')
      }

      return data

    } catch (error) {
      console.error('Get restaurant error:', error)
      throw error
    }
  }
}
