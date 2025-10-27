// src/App.jsx - Add ToastProvider
import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
// import { ThemeProvider } from './context/ThemeContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import ToastContainer from './components/ui/ToastContainer.jsx'
import ProtectedRoute from './router/ProtectedRoute.jsx'
import PublicRoute from './router/PublicRoute.jsx'
import HomePage from './pages/Home/HomePage.jsx'
import Login from './pages/Auth/Login.jsx'
import Register from './pages/Auth/Register.jsx'
import PrivacyPolicy from './pages/Legal/PrivacyPolicy.jsx'
import TermsConditions from './pages/Legal/TermsConditions.jsx'
import RestaurantSetup from './pages/RestaurantSetup/Setup.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import Settings from './pages/Settings/Settings.jsx'
import EmailVerification from './pages/EmailVerification/EmailVerification.jsx'
import { AuthWrapper } from './context/AuthWrapper.jsx'
import PageNotFound from './pages/PageNotFound/PageNotFound.jsx'
import MenuItems from './pages/MenuItems/MenuItems.jsx'
import Orders from './pages/Orders/Orders.jsx'
import Tables from './pages/Tables/Tables.jsx'
import Skeleton from './pages/Skeleton/Skeleton.jsx'

function App() {
  return (
    <BrowserRouter>
      {/* <ThemeProvider> */}
      <ToastProvider>
        <AuthWrapper>
          <div className="min-h-screen bg-gray-50 transition-colors duration-300">
            <Routes>
              {/* Public Home Page */}
              <Route path="/" element={<HomePage />} />

              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsConditions />} />

              {/* Public Auth Routes */}
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />

              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/restaurant-setup"
                element={
                  <ProtectedRoute requireSetup={false}>
                    <RestaurantSetup />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requireSetup={true}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/menu/items"
                element={
                  <ProtectedRoute requireSetup={true}>
                    <MenuItems />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/menu/items/new"
                element={
                  <ProtectedRoute requireSetup={true}>
                    <MenuItems isNewItem={true} />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/orders"
                element={
                  <ProtectedRoute requireSetup={true}>
                    <Orders />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/tables"
                element={
                  <ProtectedRoute requireSetup={true}>
                    <Tables />
                  </ProtectedRoute>
                }
              />

              {/* Settings Route */}
              <Route
                path="/settings"
                element={
                  <ProtectedRoute requireSetup={true}>
                    <Settings />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/email-verification"
                element={
                  <ProtectedRoute requireSetup={false}>
                    <EmailVerification />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/skeleton"
                element={
                  <ProtectedRoute requireSetup={false}>
                    <Skeleton />
                  </ProtectedRoute>
                }
              />

              {/* 404 Route */}
              {/* <Route path="*" element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">404</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">Page not found</p>
                    <a
                      href="/"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                    >
                      Go Home
                    </a>
                  </div>
                </div>
              } /> */}

              <Route  path='*' element={<PageNotFound/>}/>
            </Routes>

            {/* Toast Container */}
            <ToastContainer />
          </div>
        </AuthWrapper>
      </ToastProvider>
      {/* </ThemeProvider> */}
    </BrowserRouter>
  )
}

export default App
