// src/pages/Settings/Settings.jsx - Main Settings Page
import React, { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { useNavigationWarning } from '../../hooks/useNavigationWarning.js'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import NavigationWarningModal from '../../components/NavigationWarningModal.jsx'
import { useNavigate } from 'react-router-dom'

const Settings = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('account')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const navigate = useNavigate()

  // Load initial data
  const [accountData, setAccountData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [restaurantData, setRestaurantData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    showcaseAddress: '',
    description: '',
    logoUrl: '',
    website: '',
    openingHours: {
      monday: { open: '09:00', close: '22:00', closed: false },
      tuesday: { open: '09:00', close: '22:00', closed: false },
      wednesday: { open: '09:00', close: '22:00', closed: false },
      thursday: { open: '09:00', close: '22:00', closed: false },
      friday: { open: '09:00', close: '22:00', closed: false },
      saturday: { open: '10:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '21:00', closed: false }
    }
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailOrders: true,
    emailMarketing: false,
    smsOrders: true,
    smsMarketing: false,
    pushNotifications: true,
    weeklyReports: true
  })

  const [displaySettings, setDisplaySettings] = useState({
    theme: 'light',
    language: 'en',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  })

  // Navigation warning
  const {
    showModal: showNavWarning,
    handleConfirm: confirmNavigation,
    handleCancel: cancelNavigation,
  } = useNavigationWarning(
    hasUnsavedChanges,
    "Leave Settings?",
    "Changes you made may not be saved."
  )

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = () => {
    // Load from localStorage
    const savedRestaurantData = JSON.parse(localStorage.getItem('restaurantData') || '{}')
    const savedUserData = JSON.parse(localStorage.getItem('userData') || '{}')
    const savedNotifications = JSON.parse(localStorage.getItem('notificationSettings') || '{}')
    const savedDisplay = JSON.parse(localStorage.getItem('displaySettings') || '{}')

    setRestaurantData(prev => ({ ...prev, ...savedRestaurantData }))
    setAccountData(prev => ({ ...prev, ...savedUserData }))
    setNotificationSettings(prev => ({ ...prev, ...savedNotifications }))
    setDisplaySettings(prev => ({ ...prev, ...savedDisplay }))
  }

  const handleInputChange = (section, field, value) => {
    setHasUnsavedChanges(true)
    
    if (section === 'account') {
      setAccountData(prev => ({ ...prev, [field]: value }))
    } else if (section === 'restaurant') {
      setRestaurantData(prev => ({ ...prev, [field]: value }))
    } else if (section === 'notifications') {
      setNotificationSettings(prev => ({ ...prev, [field]: value }))
    } else if (section === 'display') {
      setDisplaySettings(prev => ({ ...prev, [field]: value }))
    }
    
    // Clear success message when editing
    if (successMessage) {
      setSuccessMessage('')
    }
  }

  const handleOperatingHoursChange = (day, field, value) => {
    setHasUnsavedChanges(true)
    setRestaurantData(prev => ({
      ...prev,
      openingHours: {
        ...prev.openingHours,
        [day]: {
          ...prev.openingHours[day],
          [field]: value
        }
      }
    }))
  }

  const saveSettings = async (section) => {
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Save to localStorage
      if (section === 'account' || section === 'all') {
        localStorage.setItem('userData', JSON.stringify(accountData))
      }
      if (section === 'restaurant' || section === 'all') {
        localStorage.setItem('restaurantData', JSON.stringify(restaurantData))
      }
      if (section === 'notifications' || section === 'all') {
        localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings))
      }
      if (section === 'display' || section === 'all') {
        localStorage.setItem('displaySettings', JSON.stringify(displaySettings))
      }
      
      setHasUnsavedChanges(false)
      setSuccessMessage('Settings saved successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
      
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const tabs = [
    { id: 'account', label: 'Account', icon: '👤' },
    { id: 'restaurant', label: 'Restaurant', icon: '🏪' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'display', label: 'Display', icon: '🎨' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-gray-600">Manage your account and restaurant preferences</p>
            </div>
            
            <div className="flex items-center space-x-3">
              {hasUnsavedChanges && (
                <div className="flex items-center text-orange-600 text-sm">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse"></span>
                  Unsaved changes
                </div>
              )}
              
              {successMessage && (
                <div className="flex items-center text-green-600 text-sm">
                  <span className="mr-2">✅</span>
                  {successMessage}
                </div>
              )}
              
              <Button 
                onClick={() => saveSettings('all')} 
                loading={isLoading}
                disabled={!hasUnsavedChanges}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save All Changes
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                // onClick={() =>navigate("/dashboard")}

              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl mr-3">{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow">
              {/* Account Settings */}
              {activeTab === 'account' && (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Account Settings</h2>
                    <p className="text-gray-600">Manage your personal account information</p>
                  </div>

                  <div className="space-y-6">
                    {/* Profile Information */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Full Name"
                          value={accountData.name}
                          onChange={(e) => handleInputChange('account', 'name', e.target.value)}
                          placeholder="Your full name"
                        />
                        <Input
                          label="Email Address"
                          type="email"
                          value={accountData.email}
                          onChange={(e) => handleInputChange('account', 'email', e.target.value)}
                          placeholder="your@email.com"
                        />
                        <Input
                          label="Phone Number"
                          value={accountData.phone}
                          onChange={(e) => handleInputChange('account', 'phone', e.target.value)}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    {/* Password Change */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Current Password"
                          type="password"
                          value={accountData.currentPassword}
                          onChange={(e) => handleInputChange('account', 'currentPassword', e.target.value)}
                          placeholder="Enter current password"
                        />
                        <div></div>
                        <Input
                          label="New Password"
                          type="password"
                          value={accountData.newPassword}
                          onChange={(e) => handleInputChange('account', 'newPassword', e.target.value)}
                          placeholder="Enter new password"
                        />
                        <Input
                          label="Confirm New Password"
                          type="password"
                          value={accountData.confirmPassword}
                          onChange={(e) => handleInputChange('account', 'confirmPassword', e.target.value)}
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button onClick={() => saveSettings('account')} loading={isLoading}>
                        Save Account Settings
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Restaurant Settings */}
              {activeTab === 'restaurant' && (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Restaurant Settings</h2>
                    <p className="text-gray-600">Configure your restaurant information and operating hours</p>
                  </div>

                  <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Restaurant Name"
                          value={restaurantData.name}
                          onChange={(e) => handleInputChange('restaurant', 'name', e.target.value)}
                          placeholder="Restaurant name"
                        />
                        <Input
                          label="Restaurant Email"
                          type="email"
                          value={restaurantData.email}
                          onChange={(e) => handleInputChange('restaurant', 'email', e.target.value)}
                          placeholder="restaurant@email.com"
                        />
                        <Input
                          label="Phone Number"
                          value={restaurantData.phone}
                          onChange={(e) => handleInputChange('restaurant', 'phone', e.target.value)}
                          placeholder="Restaurant phone"
                        />
                        <Input
                          label="Website URL"
                          value={restaurantData.website}
                          onChange={(e) => handleInputChange('restaurant', 'website', e.target.value)}
                          placeholder="https://yourrestaurant.com"
                        />
                      </div>
                      
                      <div className="mt-4">
                        <Input
                          label="Address"
                          value={restaurantData.address}
                          onChange={(e) => handleInputChange('restaurant', 'address', e.target.value)}
                          placeholder="Full restaurant address"
                        />
                      </div>
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <textarea
                          value={restaurantData.description}
                          onChange={(e) => handleInputChange('restaurant', 'description', e.target.value)}
                          placeholder="Tell customers about your restaurant..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows="4"
                        />
                      </div>
                    </div>

                    {/* Operating Hours */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Operating Hours</h3>
                      <div className="space-y-3">
                        {Object.entries(restaurantData.openingHours).map(([day, hours]) => (
                          <div key={day} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-24">
                                <span className="font-medium capitalize">{day}</span>
                              </div>
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={!hours.closed}
                                  onChange={(e) => handleOperatingHoursChange(day, 'closed', !e.target.checked)}
                                  className="mr-2"
                                />
                                <span className="text-sm">Open</span>
                              </label>
                            </div>
                            
                            {!hours.closed && (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="time"
                                  value={hours.open}
                                  onChange={(e) => handleOperatingHoursChange(day, 'open', e.target.value)}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                                <span className="text-gray-500">to</span>
                                <input
                                  type="time"
                                  value={hours.close}
                                  onChange={(e) => handleOperatingHoursChange(day, 'close', e.target.value)}
                                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                                />
                              </div>
                            )}
                            
                            {hours.closed && (
                              <span className="text-red-600 text-sm font-medium">Closed</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button onClick={() => saveSettings('restaurant')} loading={isLoading}>
                        Save Restaurant Settings
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notification Settings */}
              {activeTab === 'notifications' && (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Notification Settings</h2>
                    <p className="text-gray-600">Choose how you want to receive notifications</p>
                  </div>

                  <div className="space-y-6">
                    {/* Email Notifications */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
                      <div className="space-y-3">
                        {[
                          { key: 'emailOrders', label: 'New Orders', description: 'Get notified when you receive new orders' },
                          { key: 'emailMarketing', label: 'Marketing Updates', description: 'Receive updates about new features and promotions' },
                          { key: 'weeklyReports', label: 'Weekly Reports', description: 'Get weekly analytics and performance reports' }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{item.label}</p>
                              <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={notificationSettings[item.key]}
                                onChange={(e) => handleInputChange('notifications', item.key, e.target.checked)}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SMS Notifications */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">SMS Notifications</h3>
                      <div className="space-y-3">
                        {[
                          { key: 'smsOrders', label: 'New Orders', description: 'SMS alerts for new orders (additional charges may apply)' },
                          { key: 'smsMarketing', label: 'Marketing Messages', description: 'Promotional SMS messages' }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{item.label}</p>
                              <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={notificationSettings[item.key]}
                                onChange={(e) => handleInputChange('notifications', item.key, e.target.checked)}
                              />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button onClick={() => saveSettings('notifications')} loading={isLoading}>
                        Save Notification Settings
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Display Settings */}
              {activeTab === 'display' && (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Display Settings</h2>
                    <p className="text-gray-600">Customize how your interface looks and behaves</p>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Theme Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                        <div className="space-y-2">
                          {[
                            { value: 'light', label: 'Light Theme', icon: '☀️' },
                            { value: 'dark', label: 'Dark Theme', icon: '🌙' },
                            { value: 'auto', label: 'Auto (System)', icon: '⚙️' }
                          ].map((theme) => (
                            <label key={theme.value} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                              <input
                                type="radio"
                                name="theme"
                                value={theme.value}
                                checked={displaySettings.theme === theme.value}
                                onChange={(e) => handleInputChange('display', 'theme', e.target.value)}
                                className="mr-3"
                              />
                              <span className="text-lg mr-2">{theme.icon}</span>
                              <span>{theme.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Language Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Language</label>
                        <select
                          value={displaySettings.language}
                          onChange={(e) => handleInputChange('display', 'language', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="en">English</option>
                          <option value="hi">Hindi</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                        </select>
                      </div>

                      {/* Currency Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Currency</label>
                        <select
                          value={displaySettings.currency}
                          onChange={(e) => handleInputChange('display', 'currency', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="INR">Indian Rupee (₹)</option>
                          <option value="USD">US Dollar ($)</option>
                          <option value="EUR">Euro (€)</option>
                          <option value="GBP">British Pound (£)</option>
                        </select>
                      </div>

                      {/* Date Format */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Date Format</label>
                        <select
                          value={displaySettings.dateFormat}
                          onChange={(e) => handleInputChange('display', 'dateFormat', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button onClick={() => saveSettings('display')} loading={isLoading}>
                        Save Display Settings
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Security Settings</h2>
                    <p className="text-gray-600">Manage your account security and privacy</p>
                  </div>

                  <div className="space-y-6">
                    {/* Two-Factor Authentication */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
                          <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                        </div>
                        <Button variant="outline">Enable 2FA</Button>
                      </div>
                    </div>

                    {/* Active Sessions */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Active Sessions</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">Current Session</p>
                            <p className="text-sm text-gray-600">Chrome on Windows • India</p>
                          </div>
                          <span className="text-green-600 text-sm font-medium">Active</span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                          End All Other Sessions
                        </Button>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <h3 className="text-lg font-medium text-red-900 mb-4">Danger Zone</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-red-900">Delete Account</p>
                            <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                          </div>
                          <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-100">
                            Delete Account
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Integrations */}
              {activeTab === 'integrations' && (
                <div className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Integrations</h2>
                    <p className="text-gray-600">Connect with third-party services and platforms</p>
                  </div>

                  <div className="space-y-6">
                    {/* Social Media Links */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Social Media</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Facebook Page"
                          placeholder="https://facebook.com/yourrestaurant"
                        />
                        <Input
                          label="Instagram"
                          placeholder="https://instagram.com/yourrestaurant"
                        />
                        <Input
                          label="Twitter"
                          placeholder="https://twitter.com/yourrestaurant"
                        />
                        <Input
                          label="YouTube"
                          placeholder="https://youtube.com/yourrestaurant"
                        />
                      </div>
                    </div>

                    {/* Payment Integrations */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h3>
                      <div className="space-y-3">
                        {[
                          { name: 'Stripe', status: 'connected', icon: '💳' },
                          { name: 'PayPal', status: 'not_connected', icon: '💰' },
                          { name: 'Razorpay', status: 'not_connected', icon: '💸' }
                        ].map((payment) => (
                          <div key={payment.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">{payment.icon}</span>
                              <div>
                                <p className="font-medium">{payment.name}</p>
                                <p className={`text-sm ${payment.status === 'connected' ? 'text-green-600' : 'text-gray-600'}`}>
                                  {payment.status === 'connected' ? 'Connected' : 'Not connected'}
                                </p>
                              </div>
                            </div>
                            <Button variant="outline">
                              {payment.status === 'connected' ? 'Configure' : 'Connect'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* API Keys */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">API Keys</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">API Key</span>
                          <Button variant="outline" size="sm">Regenerate</Button>
                        </div>
                        <code className="text-sm text-gray-600 block bg-white p-2 rounded">
                          vt_sk_test_1234567890abcdef...
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Warning Modal */}
      <NavigationWarningModal
        isOpen={showNavWarning}
        onConfirm={confirmNavigation}
        onCancel={cancelNavigation}
        title="Leave Settings?"
        message="Changes you made may not be saved."
      />
    </div>
  )
}

export default Settings
