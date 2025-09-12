// src/pages/Dashboard/Dashboard.jsx - Add revenue security
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNavigationWarning } from '../../hooks/useNavigationWarning.js'
import Button from '../../components/ui/Button.jsx'
import EditRestaurantModal from '../../components/EditRestaurantModal.jsx'
import NavigationWarningModal from '../../components/NavigationWarningModal.jsx'
import RevenueSecurityModal from '../../components/RevenueSecurityModal.jsx'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const [restaurantData, setRestaurantData] = useState({})
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [showWarning, setShowWarning] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isRevenueVisible, setIsRevenueVisible] = useState(false)
  const [revenueSecurityModal, setRevenueSecurityModal] = useState({
    isOpen: false,
    mode: 'verify' // 'verify', 'setup', 'change'
  })

  const navigate = useNavigate()

  // Default logo URL
  const defaultLogo = 'https://www.vhv.rs/dpng/d/312-3126320_transparent-dummy-logo-png-png-download.png'

  // Mock revenue data (in production, fetch from API)
  const revenueData = {
    today: 2850,
    thisWeek: 18500,
    thisMonth: 75200,
    currency: '₹'
  }

  // Custom navigation warning with better UX
  const {
    showModal: showNavWarning,
    handleConfirm: confirmNavigation,
    handleCancel: cancelNavigation,
    setNavigationAllowed
  } = useNavigationWarning(
    showWarning,
    "Leave Dashboard?",
    hasUnsavedChanges
      ? "Changes you made may not be saved."
      : "Are you sure you want to leave the dashboard?"
  )

  useEffect(() => {
    // Load restaurant data
    const savedData = localStorage.getItem('restaurantData')
    if (savedData) {
      setRestaurantData(JSON.parse(savedData))
    }
    
    // Check if user has PIN access (session-based, expires on refresh)
    const hasAccess = sessionStorage.getItem('revenueAccess')
    if (hasAccess === 'granted') {
      setIsRevenueVisible(true)
    }
  }, [])

  const handleRevenueToggle = () => {
    if (isRevenueVisible) {
      // Hide revenue
      setIsRevenueVisible(false)
      sessionStorage.removeItem('revenueAccess')
    } else {
      // Show revenue - need PIN verification
      const savedPin = localStorage.getItem('revenuePIN')
      if (!savedPin) {
        // No PIN set, show setup modal
        setRevenueSecurityModal({ isOpen: true, mode: 'setup' })
      } else {
        // PIN exists, show verification modal
        setRevenueSecurityModal({ isOpen: true, mode: 'verify' })
      }
    }
  }

  const handleRevenueSecuritySuccess = () => {
    setIsRevenueVisible(true)
    sessionStorage.setItem('revenueAccess', 'granted')
    
    // Auto-hide after 30 minutes for security
    setTimeout(() => {
      setIsRevenueVisible(false)
      sessionStorage.removeItem('revenueAccess')
    }, 30 * 60 * 1000) // 30 minutes
  }

  const handleRevenueSecurityClose = () => {
    setRevenueSecurityModal({ isOpen: false, mode: 'verify' })
  }

  const handleEditClose = () => {
    setIsEditModalOpen(false)
    setHasUnsavedChanges(false)

    // Reload data after edit
    const savedData = localStorage.getItem('restaurantData')
    if (savedData) {
      setRestaurantData(JSON.parse(savedData))
    }
  }

  const handleLogout = () => {
    // Custom logout confirmation
    const logoutModal = document.createElement('div')
    logoutModal.innerHTML = `
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4" id="logout-modal">
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-blue-600 text-xl">👋</span>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">Logout Confirmation</h3>
            </div>
          </div>
          <div class="p-6">
            <p class="text-gray-600">Are you sure you want to logout from your dashboard?</p>
          </div>
          <div class="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button id="cancel-logout" class="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
            <button id="confirm-logout" class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              Logout
            </button>
          </div>
        </div>
      </div>
    `

    document.body.appendChild(logoutModal)

    document.getElementById('cancel-logout').onclick = () => {
      document.body.removeChild(logoutModal)
    }

    document.getElementById('confirm-logout').onclick = () => {
      setNavigationAllowed(true)
      setShowWarning(false)
      document.body.removeChild(logoutModal)
      logout()
    }
  }

  // Simulate unsaved changes when editing
  const handleEditOpen = () => {
    setIsEditModalOpen(true)
    setHasUnsavedChanges(true)
  }

  const handleSettingsClick = () => {
    // Check if PIN is set, if not, show setup modal first
    const savedPin = localStorage.getItem('revenuePIN')
    if (!savedPin) {
      setRevenueSecurityModal({ isOpen: true, mode: 'setup' })
    } else {
      navigate('/settings')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 dashboard-scroll">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              {/* Restaurant Logo */}
              <div className="flex-shrink-0">
                <img
                  src={restaurantData.logoUrl || defaultLogo}
                  alt="Restaurant Logo"
                  className="h-12 w-12 object-contain rounded-lg border border-gray-200"
                  onError={(e) => {
                    e.target.src = defaultLogo
                  }}
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {restaurantData.restaurantName || 'Restaurant'} Dashboard
                </h1>
                <p className="text-gray-600">Welcome back!</p>
                {hasUnsavedChanges && (
                  <p className="text-sm text-orange-600 flex items-center">
                    <span className="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse"></span>
                    Unsaved changes
                  </p>
                )}
              </div>

              {/* Restaurant Info Badges */}
              <div className="hidden lg:flex items-center space-x-2">
                {restaurantData.selectedTemplate && (
                  <div className="bg-blue-50 px-3 py-1 rounded-full">
                    <span className="text-sm text-blue-700">Template:</span>
                    <span className="text-sm font-medium text-blue-900 ml-1">
                      {restaurantData.selectedTemplate.name}
                    </span>
                  </div>
                )}
                {restaurantData.cuisine && (
                  <div className="bg-green-50 px-3 py-1 rounded-full">
                    <span className="text-sm text-green-700">Cuisine:</span>
                    <span className="text-sm font-medium text-green-900 ml-1">
                      {restaurantData.cuisine}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button onClick={handleEditOpen} variant="outline" size="sm">
                ✏️ Edit Restaurant
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Restaurant Information Card */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Restaurant Information</h2>
              <Button onClick={handleEditOpen} size="sm" variant="outline">
                Edit
              </Button>
            </div>

            {/* Logo and Basic Info Section */}
            <div className="flex items-start space-x-6 mb-6">
              <div className="flex-shrink-0">
                <img
                  src={restaurantData.logoUrl || defaultLogo}
                  alt="Restaurant Logo"
                  className="h-24 w-24 object-contain rounded-xl border border-gray-200"
                  onError={(e) => {
                    e.target.src = defaultLogo
                  }}
                />
                <p className="text-xs text-gray-500 text-center mt-1">Restaurant Logo</p>
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {restaurantData.restaurantName || 'Restaurant Name Not Set'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Contact Number</p>
                    <p className="font-medium">{restaurantData.contactNumber || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Cuisine Type</p>
                    <p className="font-medium">{restaurantData.cuisine || 'Not set'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Physical Address</p>
                <p className="text-gray-700">{restaurantData.address || 'Not set'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Showcase Address (For Menu)</p>
                <p className="text-gray-700 font-medium">{restaurantData.showcaseAddress || 'Not set'}</p>
              </div>
            </div>

            {/* Description Section */}
            {restaurantData.description && (
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-2">Description</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700">{restaurantData.description}</p>
                </div>
              </div>
            )}

            {/* Operational Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Order Time Range</p>
                <p className="text-lg font-semibold text-blue-900">
                  {restaurantData.minOrderTime || 'N/A'} - {restaurantData.maxOrderTime || 'N/A'} min
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Staff Count</p>
                <p className="text-lg font-semibold text-green-900">
                  {restaurantData.staffCount || 'N/A'} members
                </p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Setup Status</p>
                <p className="text-lg font-semibold text-purple-900">
                  {restaurantData.completedAt ? 'Complete' : 'Incomplete'}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Cards with Revenue Security */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 text-lg">📋</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Orders Today</h3>
                  <p className="text-2xl font-bold text-blue-600">0</p>
                </div>
              </div>
            </div>

            {/* Revenue Card with Security */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-lg">₹</span>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-500">Revenue</h3>
                    <button
                      onClick={handleRevenueToggle}
                      className={`p-1 rounded-full transition-colors ${
                        isRevenueVisible 
                          ? 'text-green-600 hover:bg-green-100' 
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                      title={isRevenueVisible ? 'Hide Revenue' : 'Show Revenue'}
                    >
                      {isRevenueVisible ? '👁️' : '🙈'}
                    </button>
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {isRevenueVisible ? `${revenueData.currency}${revenueData.today.toLocaleString()}` : '••••'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 text-lg">🍽️</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Menu Items</h3>
                  <p className="text-2xl font-bold text-purple-600">0</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 text-lg">👥</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-500">Staff Members</h3>
                  <p className="text-2xl font-bold text-orange-600">
                    {restaurantData.staffCount || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Extended Revenue Details (when visible) */}
          {isRevenueVisible && (
            <div className="bg-white rounded-lg shadow p-6 mb-8 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Revenue Details</h2>
                <div className="flex items-center text-sm text-green-600">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                  Protected View Active
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Today's Revenue</p>
                  <p className="text-2xl font-bold text-green-900">
                    {revenueData.currency}{revenueData.today.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">This Week</p>
                  <p className="text-2xl font-bold text-green-900">
                    {revenueData.currency}{revenueData.thisWeek.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">This Month</p>
                  <p className="text-2xl font-bold text-green-900">
                    {revenueData.currency}{revenueData.thisMonth.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-xs text-gray-500">
                  🔒 This session will automatically expire in 30 minutes for security
                </p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button className="w-full">
                <span className="mr-2">➕</span>
                Add Menu Item
              </Button>
              <Button className="w-full" variant="outline">
                <span className="mr-2">📋</span>
                View Orders
              </Button>
              <Button className="w-full" variant="outline">
                <span className="mr-2">📊</span>
                Analytics
              </Button>
              <Button className="w-full" variant="outline" onClick={handleSettingsClick}>
                <span className="mr-2">⚙️</span>
                Settings
              </Button>
            </div>
          </div>

          {/* Template Preview */}
          {restaurantData.selectedTemplate && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Your Menu Template</h2>
              <div className="flex items-center space-x-4">
                <img
                  src={restaurantData.selectedTemplate.preview_image}
                  alt={restaurantData.selectedTemplate.name}
                  className="w-32 h-20 object-cover rounded-lg shadow-sm"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{restaurantData.selectedTemplate.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{restaurantData.selectedTemplate.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="mr-4">⭐ {restaurantData.selectedTemplate.rating}</span>
                    <span className="mr-4">📥 {restaurantData.selectedTemplate.downloads?.toLocaleString()} downloads</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${restaurantData.selectedTemplate.is_free
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                      }`}>
                      {restaurantData.selectedTemplate.is_free ? 'Free' : 'Premium'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">Preview Menu</Button>
                  <Button size="sm" variant="outline" onClick={handleEditOpen}>
                    Change Template
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        <EditRestaurantModal
          isOpen={isEditModalOpen}
          onClose={handleEditClose}
          currentData={restaurantData}
        />

        {/* Revenue Security Modal */}
        <RevenueSecurityModal
          isOpen={revenueSecurityModal.isOpen}
          mode={revenueSecurityModal.mode}
          onClose={handleRevenueSecurityClose}
          onSuccess={handleRevenueSecuritySuccess}
        />

        {/* Navigation Warning Modal */}
        <NavigationWarningModal
          isOpen={showNavWarning}
          onConfirm={confirmNavigation}
          onCancel={cancelNavigation}
          title="Leave Dashboard?"
          message={hasUnsavedChanges
            ? "Changes you made may not be saved."
            : "Are you sure you want to leave the dashboard?"
          }
        />
      </div>
    </div>
  )
}

export default Dashboard
