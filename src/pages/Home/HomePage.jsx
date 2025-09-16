// src/pages/Home/HomePage.jsx - Enhanced auth state handling
import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../../components/ui/Button.jsx'

const HomePage = () => {
  const { isAuthenticated, user, logout, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleAuthAction = (path) => {
    if (isAuthenticated) {
      // If already logged in, go to dashboard instead of auth pages
      const setupCompleted = localStorage.getItem('restaurantSetupCompleted') === 'true'
      if (!setupCompleted) {
        navigate('/restaurant-setup')
      } else {
        navigate('/dashboard')
      }
    } else {
      // If not logged in, go to requested auth page
      navigate(path)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header Navigation */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">VernoraTech</h1>
                <p className="text-xs text-gray-500">Restaurant Management (PROD)</p> 
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#features" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Features
                </a>
                <a href="#pricing" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  Pricing
                </a>
                <a href="#about" className="text-gray-500 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  About
                </a>
              </div>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              {isLoading ? (
                <div className="text-sm text-gray-500">Loading...</div>
              ) : isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">Welcome back, {user?.name || 'User'}!</span>
                  <Button className='cursor-pointer' onClick={() => navigate('/dashboard')} variant="primary" size="sm">
                    Dashboard
                  </Button>
                  <Button className='cursor-pointer' onClick={logout} variant="outline" size="sm">
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Button className='cursor-pointer' onClick={() => handleAuthAction('/login')} variant="outline">
                    Sign In
                  </Button>
                  <Button className='cursor-pointer' onClick={() => handleAuthAction('/register')} variant="primary">
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-32 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Manage Your Restaurant
              <span className="block text-blue-600">Like a Pro</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Streamline operations, boost revenue, and deliver exceptional dining experiences
              with VernoraTech's all-in-one restaurant management platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <div className="space-y-4">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto cursor-pointer"
                    onClick={() => navigate('/dashboard')}
                  >
                    Go to Dashboard
                  </Button>
                  <p className="text-sm text-gray-600">
                    Welcome back! Continue managing your restaurant.
                  </p>
                </div>
              ) : (
                <>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto cursor-pointer"
                    onClick={() => handleAuthAction('/register')}
                  >
                    Start Free Trial
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto cursor-pointer"
                    onClick={() => handleAuthAction('/login')}
                  >
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Run Your Restaurant
            </h2>
            <p className="text-xl text-gray-600">
              Powerful features designed specifically for restaurant owners
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Cards */}
            {[
              {
                icon: "📋",
                title: "Menu Management",
                description: "Easily create, update, and organize your menu items with photos, descriptions, and pricing.",
                bgColor: "bg-blue-100"
              },
              {
                icon: "📊",
                title: "Sales Analytics",
                description: "Track your revenue, popular items, and performance metrics with detailed reports and insights.",
                bgColor: "bg-green-100"
              },
              {
                icon: "🍽️",
                title: "Order Management",
                description: "Streamline your order process from kitchen to customer with real-time tracking and updates.",
                bgColor: "bg-purple-100"
              },
              {
                icon: "👥",
                title: "Staff Management",
                description: "Manage your team, schedules, and roles with easy-to-use staff management tools.",
                bgColor: "bg-orange-100"
              },
              {
                icon: "💰",
                title: "Financial Tracking",
                description: "Monitor expenses, profits, and financial health with comprehensive accounting features.",
                bgColor: "bg-red-100"
              },
              {
                icon: "📱",
                title: "Mobile Ready",
                description: "Access your restaurant data anywhere, anytime with our mobile-responsive platform.",
                bgColor: "bg-teal-100"
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Trusted by Restaurant Owners Worldwide</h2>
            <p className="text-gray-300 text-lg">Join thousands of successful restaurants using VernoraTech</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { value: "5,000+", label: "Restaurants", color: "text-blue-400" },
              { value: "50M+", label: "Orders Processed", color: "text-green-400" },
              { value: "99.9%", label: "Uptime", color: "text-purple-400" },
              { value: "24/7", label: "Support", color: "text-orange-400" }
            ].map((stat, index) => (
              <div key={index}>
                <div className={`text-4xl font-bold ${stat.color} mb-2`}>{stat.value}</div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Restaurant?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of successful restaurant owners who trust VernoraTech
          </p>

          {isAuthenticated ? (
            <Button
              size="lg"
              className=" text-blue-600 border cursor-pointer w-full sm:w-auto"
              onClick={() => navigate('/dashboard')}
            >
              Go to Your Dashboard
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className=" w-full sm:w-auto border cursor-pointer"
                onClick={() => handleAuthAction('/register')}
              >
                Start Your Free Trial
              </Button>
              <Button
                variant="outline"
                size="lg"
                className=" w-full sm:w-auto cursor-pointer"
                onClick={() => handleAuthAction('/login')}
              >
                Sign In
              </Button>



            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">VernoraTech</h3>
              <p className="text-gray-300 text-sm">
                Empowering restaurants with cutting-edge technology to streamline operations and boost growth.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="text-gray-300 hover:text-white">Features</a></li>
                <li><a href="#pricing" className="text-gray-300 hover:text-white">Pricing</a></li>
                <li><a href="#about" className="text-gray-300 hover:text-white">About Us</a></li>
                <li><a href="#contact" className="text-gray-300 hover:text-white">Contact</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#help" className="text-gray-300 hover:text-white">Help Center</a></li>
                <li><a href="#docs" className="text-gray-300 hover:text-white">Documentation</a></li>
                <li><a href="#api" className="text-gray-300 hover:text-white">API Reference</a></li>
                <li><a href="#status" className="text-gray-300 hover:text-white">System Status</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4">Get in Touch</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>📧 support@vernoratech.com</li>
                <li>📱 +1 (555) 123-4567</li>
                <li>🌐 www.vernoratech.com</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 VernoraTech. All rights reserved. | Privacy Policy | Terms of Service
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
