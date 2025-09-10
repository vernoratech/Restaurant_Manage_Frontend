// src/pages/Dashboard/Dashboard.jsx - With custom navigation warning
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNavigationWarning } from '../../hooks/useNavigationWarning.js'
import Button from '../../components/ui/Button.jsx'
import EditRestaurantModal from '../../components/EditRestaurantModal.jsx'
import NavigationWarningModal from '../../components/NavigationWarningModal.jsx'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const [restaurantData, setRestaurantData] = useState({})
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [showWarning, setShowWarning] = useState(true)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

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
  }, [])

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
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
            
            {/* Restaurant Info Badge */}
            {restaurantData.selectedTemplate && (
              <div className="hidden md:flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                <span className="text-sm text-blue-700">Template:</span>
                <span className="text-sm font-medium text-blue-900">
                  {restaurantData.selectedTemplate.name}
                </span>
              </div>
            )}
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
        {/* Restaurant Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Restaurant Information</h2>
            <Button onClick={handleEditOpen} size="sm" variant="outline">
              Edit
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{restaurantData.restaurantName || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Cuisine</p>
              <p className="font-medium">{restaurantData.cuisine || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{restaurantData.phone || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="font-medium">{restaurantData.address || 'Not set'}</p>
            </div>
          </div>
          
          {restaurantData.description && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">Description</p>
              <p className="text-gray-700">{restaurantData.description}</p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Orders Today</h3>
            <p className="text-3xl font-bold text-blue-600">0</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Revenue</h3>
            <p className="text-3xl font-bold text-green-600">₹0</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Menu Items</h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="w-full">Add Menu Item</Button>
            <Button className="w-full" variant="outline">View Orders</Button>
            <Button className="w-full" variant="outline">Analytics</Button>
            <Button className="w-full" variant="outline">Settings</Button>
          </div>
        </div>

        {/* Template Preview */}
        {restaurantData.selectedTemplate && (
          <div className="bg-white rounded-lg shadow p-6 mt-8">
            <h2 className="text-xl font-bold mb-4">Your Menu Template</h2>
            <div className="flex items-center space-x-4">
              <img 
                src={restaurantData.selectedTemplate.preview_image} 
                alt={restaurantData.selectedTemplate.name}
                className="w-24 h-16 object-cover rounded-lg"
              />
              <div>
                <h3 className="font-medium">{restaurantData.selectedTemplate.name}</h3>
                <p className="text-sm text-gray-600">{restaurantData.selectedTemplate.description}</p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline">Preview Menu</Button>
                  <Button size="sm" variant="outline" onClick={handleEditOpen}>
                    Change Template
                  </Button>
                </div>
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
  )
}

export default Dashboard
