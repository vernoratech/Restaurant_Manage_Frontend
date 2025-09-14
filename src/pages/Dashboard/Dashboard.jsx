// src/pages/Dashboard/Dashboard.jsx - COMPLETE OPTIMIZED FILE
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigationWarning } from "../../hooks/useNavigationWarning.js";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button.jsx";
import EditRestaurantModal from "../../components/EditRestaurantModal.jsx";
import NavigationWarningModal from "../../components/NavigationWarningModal.jsx";
import RevenueSecurityModal from "../../components/RevenueSecurityModal.jsx";
import EmailVerificationAlert from "../../components/EmailVerificationAlert.jsx";
import VerifiedBadge from "../../components/VerifiedBadge.jsx";

const Dashboard = () => {
  // ✅ STEP 1: ALL HOOKS AT THE TOP (NEVER MOVE THESE!)
  const navigate = useNavigate();
  const { user, logout, checkRestaurantSetup, fetchAndStoreRestaurantData } =
    useAuth();

  // ✅ ALL useState HOOKS
  const [restaurantData, setRestaurantData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isRevenueVisible, setIsRevenueVisible] = useState(false);
  const [revenueSecurityModal, setRevenueSecurityModal] = useState({
    isOpen: false,
    mode: "verify",
  });

  // ✅ CUSTOM HOOKS
  const {
    showModal: showNavWarning,
    handleConfirm: confirmNavigation,
    handleCancel: cancelNavigation,
    setNavigationAllowed,
  } = useNavigationWarning(
    showWarning,
    "Leave Dashboard?",
    hasUnsavedChanges
      ? "Changes you made may not be saved."
      : "Are you sure you want to leave the dashboard?"
  );

  // ✅ ALL useEffect HOOKS (COMBINED INTO ONE)
  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts

    const loadRestaurantData = async () => {
      if (!isMounted) return;

      try {
        setIsLoading(true);
        setApiError(null);

        // First try localStorage
        const savedData = localStorage.getItem("restaurantData");
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            if (parsedData._id || parsedData.restaurantName) {
              if (isMounted) {
                setRestaurantData(parsedData);
                // Check revenue access
                const hasRevenueAccess =
                  sessionStorage.getItem("revenueAccess") === "granted";
                setIsRevenueVisible(hasRevenueAccess);
                setIsLoading(false);
                return;
              }
            }
          } catch (parseError) {
            console.error("Error parsing saved restaurant data:", parseError);
          }
        }

        // If no saved data and user has resId, fetch from API
        if (user?.resId && fetchAndStoreRestaurantData) {
          console.log("Fetching fresh restaurant data for ID:", user.resId);
          const freshData = await fetchAndStoreRestaurantData(user.resId);

          if (isMounted) {
            if (freshData) {
              setRestaurantData(freshData);
            } else {
              throw new Error("Failed to fetch restaurant data");
            }
          }
        }
        // If no data and user should be setup, redirect
        else if (!checkRestaurantSetup()) {
          navigate("/restaurant-setup", { replace: true });
          return;
        }

        // Check revenue access
        const hasRevenueAccess =
          sessionStorage.getItem("revenueAccess") === "granted";
        if (isMounted && hasRevenueAccess) {
          setIsRevenueVisible(true);
        }
      } catch (error) {
        console.error("Error loading restaurant data:", error);
        if (isMounted) {
          setApiError(error.message);
          setRestaurantData({}); // Fallback
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Only run if we have user data or it's null (initial state)
    if (user !== undefined) {
      loadRestaurantData();
    }

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [user, navigate, checkRestaurantSetup, fetchAndStoreRestaurantData]);

  // ✅ STEP 2: ALL CALLBACK FUNCTIONS (MEMOIZED FOR PERFORMANCE)
  const refreshRestaurantData = useCallback(async () => {
    if (!user?.resId || !fetchAndStoreRestaurantData) return;

    console.log("user",user);
    

    setIsLoading(true);
    setApiError(null);

    try {
      const freshData = await fetchAndStoreRestaurantData(user.resId._id);
      if (freshData) {
        setRestaurantData(freshData);
      }
    } catch (error) {
      console.error("Failed to refresh restaurant data:", error);
      setApiError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [user?.resId, fetchAndStoreRestaurantData]);

  const handleRevenueToggle = useCallback(() => {
    if (isRevenueVisible) {
      setIsRevenueVisible(false);
      sessionStorage.removeItem("revenueAccess");
    } else {
      const savedPin = localStorage.getItem("revenuePIN");
      setRevenueSecurityModal({
        isOpen: true,
        mode: savedPin ? "verify" : "setup",
      });
    }
  }, [isRevenueVisible]);

  const handleRevenueSecuritySuccess = useCallback(() => {
    setIsRevenueVisible(true);
    sessionStorage.setItem("revenueAccess", "granted");

    // Auto-hide after 30 minutes
    setTimeout(() => {
      setIsRevenueVisible(false);
      sessionStorage.removeItem("revenueAccess");
    }, 30 * 60 * 1000);
  }, []);

  const handleRevenueSecurityClose = useCallback(() => {
    setRevenueSecurityModal({ isOpen: false, mode: "verify" });
  }, []);

  const handleEditClose = useCallback(() => {
    setIsEditModalOpen(false);
    setHasUnsavedChanges(false);

    // Reload data from localStorage
    try {
      const savedData = localStorage.getItem("restaurantData");
      if (savedData) {
        setRestaurantData(JSON.parse(savedData));
      }
    } catch (error) {
      console.error("Error reloading restaurant data:", error);
    }
  }, []);

  const handleEditOpen = useCallback(() => {
    setIsEditModalOpen(true);
    setHasUnsavedChanges(true);
  }, []);

  const handleSettingsClick = useCallback(() => {
    const savedPin = localStorage.getItem("revenuePIN");
    if (!savedPin) {
      setRevenueSecurityModal({ isOpen: true, mode: "setup" });
    } else {
      navigate("/settings");
    }
  }, [navigate]);

  const handleLogout = useCallback(() => {
    // Simple confirmation and logout
    if (window.confirm("Are you sure you want to logout?")) {
      setNavigationAllowed(true);
      setShowWarning(false);
      logout();
    }
  }, [logout, setNavigationAllowed, setShowWarning]);

  // ✅ STEP 3: CONSTANTS AND DATA
  const defaultLogo =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0w8rgpM6Xfx-DljjN2FkZPei5sthUsLH6Pg&s";

  const revenueData = {
    today: 2850,
    thisWeek: 18500,
    thisMonth: 75200,
    currency: "₹",
  };

  // ✅ STEP 4: EARLY RETURNS (AFTER ALL HOOKS!)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Dashboard...</p>
          {user?.resId && (
            <p className="mt-2 text-sm text-gray-500">
              Fetching restaurant data...
            </p>
          )}
        </div>
      </div>
    );
  }

  if (apiError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Loading Error
          </h2>
          <p className="text-gray-600 mb-4">{apiError}</p>
          <div className="space-x-4">
            <Button onClick={refreshRestaurantData} className="bg-blue-600">
              Try Again
            </Button>
            <Button
              onClick={() => navigate("/restaurant-setup")}
              variant="outline"
            >
              Setup Restaurant
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ✅ STEP 5: MAIN JSX RENDER
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* Restaurant Logo */}
            <div className="flex-shrink-0">
              <img
                src={restaurantData?.logoUrl || defaultLogo}
                alt="Restaurant Logo"
                className="h-12 w-12 object-contain rounded-lg border border-gray-200"
                onError={(e) => {
                  e.target.src = defaultLogo;
                }}
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 via-indigo-500 to-green-500 text-transparent bg-clip-text">
                {restaurantData?.restaurantName || "Restaurant"} Dashboard
              </h1>
              <div className="flex items-center space-x-2">
                <p className="text-gray-600">Welcome back!</p>
                {user?.isVerified && (
                  <VerifiedBadge isVerified={user.isVerified} size="sm" />
                )}
              </div>
              {hasUnsavedChanges && (
                <p className="text-sm text-orange-600 flex items-center">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse"></span>
                  Unsaved changes
                </p>
              )}
            </div>

            {/* Restaurant Info Badges */}
            <div className="hidden lg:flex items-center space-x-2">
              {restaurantData?.selectedTempId?.name && (
                <div className="bg-blue-50 px-3 py-1 rounded-full">
                  <span className="text-sm text-blue-700">Template:</span>
                  <span className="text-sm font-medium text-blue-900 ml-1">
                    {restaurantData.selectedTempId.name}
                  </span>
                </div>
              )}
              {restaurantData?.cuisine && (
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
            <Button onClick={refreshRestaurantData} variant="outline" size="sm">
              🔄 Refresh
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <EmailVerificationAlert user={user} />

        {/* Restaurant Information Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Restaurant Information
            </h2>
            <Button onClick={handleEditOpen} size="sm" variant="outline">
              Edit
            </Button>
          </div>

          {/* Logo and Basic Info */}
          <div className="flex items-start space-x-6 mb-6">
            <div className="flex-shrink-0">
              <img
                src={restaurantData?.logoUrl || defaultLogo}
                alt="Restaurant Logo"
                className="h-24 w-24 object-contain rounded-xl border border-gray-200"
                onError={(e) => {
                  e.target.src = defaultLogo;
                }}
              />
              <p className="text-xs text-gray-500 text-center mt-1">Logo</p>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {restaurantData?.restaurantName || "Restaurant Name Not Set"}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Contact Number</p>
                  <p className="font-medium">
                    {restaurantData?.restaurantContactNumber || "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cuisine Type</p>
                  <p className="font-medium">
                    {restaurantData?.cuisine || "Not set"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Physical Address</p>
              <p className="text-gray-700">
                {restaurantData?.restaurantAddress || "Not set"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Showcase Address</p>
              <p className="text-gray-700 font-medium">
                {restaurantData?.showcaseAddress ||
                  restaurantData?.restaurantAddress ||
                  "Not set"}
              </p>
            </div>
          </div>

          {/* Operational Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Order Time</p>
              <p className="text-lg font-semibold text-blue-900">
                {restaurantData?.minOrderTime || "N/A"} -{" "}
                {restaurantData?.maxOrderTime || "N/A"} min
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Staff Count</p>
              <p className="text-lg font-semibold text-green-900">
                {restaurantData?.staffCount || "N/A"} members
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Status</p>
              <p className="text-lg font-semibold text-purple-900">
                {restaurantData?.setupCompleted || user?.isSetup === 1
                  ? "Complete"
                  : "Incomplete"}
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
                <h3 className="text-sm font-medium text-gray-500">
                  Orders Today
                </h3>
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
                        ? "text-green-600 hover:bg-green-100"
                        : "text-gray-400 hover:bg-gray-100"
                    }`}
                    title={isRevenueVisible ? "Hide Revenue" : "Show Revenue"}
                  >
                    {isRevenueVisible ? "👁️" : "🙈"}
                  </button>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {isRevenueVisible
                    ? `${
                        revenueData.currency
                      }${revenueData.today.toLocaleString()}`
                    : "••••"}
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
                <h3 className="text-sm font-medium text-gray-500">
                  Menu Items
                </h3>
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
                <h3 className="text-sm font-medium text-gray-500">
                  Staff Members
                </h3>
                <p className="text-2xl font-bold text-orange-600">
                  {restaurantData?.staffCount || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Extended Revenue Details (when visible) */}
        {isRevenueVisible && (
          <div className="bg-white rounded-lg shadow p-6 mb-8 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Revenue Details
              </h2>
              <div className="flex items-center text-sm text-green-600">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                Protected View Active
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">
                  Today's Revenue
                </p>
                <p className="text-2xl font-bold text-green-900">
                  {revenueData.currency}
                  {revenueData.today.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">This Week</p>
                <p className="text-2xl font-bold text-green-900">
                  {revenueData.currency}
                  {revenueData.thisWeek.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">This Month</p>
                <p className="text-2xl font-bold text-green-900">
                  {revenueData.currency}
                  {revenueData.thisMonth.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                🔒 This session will automatically expire in 30 minutes for
                security
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
            <Button
              className="w-full"
              variant="outline"
              onClick={handleSettingsClick}
            >
              <span className="mr-2">⚙️</span>
              Settings
            </Button>
          </div>
        </div>

        {/* Template Preview */}
        {restaurantData?.selectedTempId && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Your Menu Template</h2>
              <Button
                size="sm"
                variant="outline"
                onClick={refreshRestaurantData}
              >
                🔄 Refresh Data
              </Button>
            </div>

            <div className="flex items-center space-x-4">
              <img
                src={restaurantData.selectedTempId.previewImage}
                alt={restaurantData.selectedTempId.name}
                className="w-32 h-20 object-cover rounded-lg shadow-sm"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/400x300?text=No+Preview";
                }}
              />
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  {restaurantData.selectedTempId.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  {restaurantData.selectedTempId.description}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-4">
                    ⭐ {restaurantData.selectedTempId.rating}
                  </span>
                  <span className="mr-4">
                    📥{" "}
                    {restaurantData.selectedTempId.downloads?.toLocaleString()}{" "}
                    downloads
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      restaurantData.selectedTempId.isFree
                        ? "bg-green-100 text-green-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {restaurantData.selectedTempId.isFree ? "Free" : "Premium"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    window.open(restaurantData.selectedTempId.demoUrl, "_blank")
                  }
                >
                  Preview Menu
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  Change Template
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <EditRestaurantModal
        isOpen={isEditModalOpen}
        onClose={handleEditClose}
        currentData={restaurantData}
      />

      <RevenueSecurityModal
        isOpen={revenueSecurityModal.isOpen}
        mode={revenueSecurityModal.mode}
        onClose={handleRevenueSecurityClose}
        onSuccess={handleRevenueSecuritySuccess}
      />

      <NavigationWarningModal
        isOpen={showNavWarning}
        onConfirm={confirmNavigation}
        onCancel={cancelNavigation}
        title="Leave Dashboard?"
        message={
          hasUnsavedChanges
            ? "Changes you made may not be saved."
            : "Are you sure you want to leave the dashboard?"
        }
      />
    </div>
  );
};

export default Dashboard;
