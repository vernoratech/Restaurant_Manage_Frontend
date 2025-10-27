// src/pages/Dashboard/Dashboard.jsx - COMPLETE INTEGRATED VERSION
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import { useNavigationWarning } from "../../hooks/useNavigationWarning.js";
import { useNavigate, Link } from "react-router-dom";
import Button from "../../components/ui/Button.jsx";
import { FiPlus, FiList, FiShoppingBag, FiBarChart2, FiSettings, FiEdit3 } from "react-icons/fi";
import EditRestaurantModal from "../../components/EditRestaurantModal.jsx";
import NavigationWarningModal from "../../components/NavigationWarningModal.jsx";
import RevenueSecurityModal from "../../components/RevenueSecurityModal.jsx";
import EmailVerificationAlert from "../../components/EmailVerificationAlert.jsx";
import VerifiedBadge from "../../components/VerifiedBadge.jsx";
import { AiOutlineNotification } from "react-icons/ai";
import { IoMdNotificationsOutline } from "react-icons/io";
import { SlRefresh } from "react-icons/sl";
import { BiFoodMenu } from "react-icons/bi";

const Dashboard = () => {
  // --> STEP 1: ALL HOOKS AT THE TOP (NEVER MOVE THESE!)
  const navigate = useNavigate();
  const { user, logout, checkRestaurantSetup, fetchAndStoreRestaurantData } =
    useAuth();

  // --> ALL useState HOOKS
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
  const [isSkippedUser, setIsSkippedUser] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // --> CUSTOM HOOKS
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

  // --> ALL useEffect HOOKS (COMBINED INTO ONE)
  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts

    const loadRestaurantData = async () => {
      if (!isMounted) return;

      try {
        setIsLoading(true);
        setApiError(null);

        // --> Check skip status first
        const checkSkipStatus = () => {
          try {
            const skipStatus = localStorage.getItem('restaurantSetupStatus');
            if (skipStatus) {
              const parsed = JSON.parse(skipStatus);
              if (parsed.skipped === true && parsed.userId === user?.id) {
                setIsSkippedUser(true);
                return true;
              }
            }
            return false;
          } catch (error) {
            console.error('Error checking skip status:', error);
            return false;
          }
        };

        const isSkipped = checkSkipStatus();

        // --> If user skipped setup, show limited dashboard
        if (isSkipped) {
          console.log("👤 User skipped setup, showing limited dashboard");
          setIsLoading(false);
          return;
        }

        // --> Try to load restaurant data from localStorage first
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

        // --> If no saved data and user has resId, fetch from API
        if (user?.resId && fetchAndStoreRestaurantData) {
          console.log("📡 Fetching restaurant data from API for:", user.resId);
          const freshData = await fetchAndStoreRestaurantData(user.resId);

          if (isMounted) {
            if (freshData) {
              setRestaurantData(freshData);
            } else {
              throw new Error("Failed to fetch restaurant data");
            }
          }
        }
        // --> If no data and user should be setup, redirect
        else if (!checkRestaurantSetup()) {
          console.log("🏗️ No restaurant setup found, redirecting to setup");
          navigate("/restaurant-setup", { replace: true });
          return;
        }

        // --> Check revenue access
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

    // --> Only run if we have user data or it's null (initial state)
    if (user !== undefined) {
      loadRestaurantData();
    }

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [user, navigate, checkRestaurantSetup, fetchAndStoreRestaurantData]);

  // --> STEP 2: ALL CALLBACK FUNCTIONS (MEMOIZED FOR PERFORMANCE)
  const refreshRestaurantData = useCallback(async () => {
    if (!user?.resId || !fetchAndStoreRestaurantData) return;

    setIsLoading(true);
    setApiError(null);

    try {
      const freshData = await fetchAndStoreRestaurantData(user.resId);
      if (freshData) {
        setRestaurantData(freshData);
        console.log("--> Restaurant data refreshed successfully");
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

    // --> Reload data from localStorage or refresh from API if available
    try {
      const savedData = localStorage.getItem("restaurantData");
      if (savedData) {
        setRestaurantData(JSON.parse(savedData));
      } else if (user?.resId && fetchAndStoreRestaurantData) {
        // Refresh from API if no local data
        refreshRestaurantData();
      }
    } catch (error) {
      console.error("Error reloading restaurant data:", error);
    }
  }, [refreshRestaurantData, user?.resId, fetchAndStoreRestaurantData]);

  const handleEditOpen = useCallback(() => {
    // --> If skipped user, redirect to setup instead of edit modal
    if (isSkippedUser) {
      navigate('/restaurant-setup');
      return;
    }
    setIsEditModalOpen(true);
    setHasUnsavedChanges(true);
  }, [isSkippedUser, navigate]);

  const handleSettingsClick = useCallback(() => {
    const savedPin = localStorage.getItem("revenuePIN");
    if (!savedPin) {
      setRevenueSecurityModal({ isOpen: true, mode: "setup", data: restaurantData });
    } else {
      navigate("/settings", { state: { restaurant: restaurantData } });

    }
  }, [navigate, restaurantData]);

  // --> NEW: Handle completing setup from dashboard
  const handleCompleteSetup = useCallback(() => {
    // Clear skip status and redirect to setup
    localStorage.removeItem('restaurantSetupStatus');
    navigate('/restaurant-setup');
  }, [navigate]);

  // --> NEW: Handle dismissing skip reminder
  const handleDismissSkipReminder = useCallback(() => {
    setIsSkippedUser(false);
  }, []);

  // --> STEP 3: CONSTANTS AND DATA
  const defaultLogo =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0w8rgpM6Xfx-DljjN2FkZPei5sthUsLH6Pg&s";

  const revenueData = {
    today: 2850,
    thisWeek: 18500,
    thisMonth: 75200,
    currency: "₹",
  };
  const fallbackNotifications = [
    {
      id: "demo-1",
      title: "New order received",
      message: "Table 4 just placed an order for 3 items.",
      time: "2 mins ago",
    },
    {
      id: "demo-2",
      title: "Inventory reminder",
      message: "You are running low on fresh ingredients for today's menu.",
      time: "1 hour ago",
    },
  ];

  const notifications =
    restaurantData?.notifications && restaurantData.notifications.length > 0
      ? restaurantData.notifications
      : fallbackNotifications;

  const notificationCount = notifications.length;

  const notificationRef = useRef(null);

  useEffect(() => {
    if (!showNotifications) return;

    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  // --> STEP 4: EARLY RETURNS (AFTER ALL HOOKS!)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Dashboard...</p>
          {user?.resId && !isSkippedUser && (
            <p className="mt-2 text-sm text-gray-500">
              Fetching restaurant data...
            </p>
          )}
          {isSkippedUser && (
            <p className="mt-2 text-sm text-gray-500">
              Setting up limited dashboard...
            </p>
          )}
        </div>
      </div>
    );
  }

  if (apiError && !isSkippedUser) {
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
              Complete Setup
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --> STEP 5: MAIN JSX RENDER
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            {/* Restaurant Logo */}
            <div className="flex-shrink-0">
              <img
                src={
                  isSkippedUser
                    ? defaultLogo
                    : (restaurantData?.logoUrl || defaultLogo)
                }
                alt="Restaurant Logo"
                className="h-12 w-12 object-contain rounded-lg border border-gray-200"
                onError={(e) => {
                  e.target.src = defaultLogo;
                }}
              />
            </div>

            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 via-indigo-500 to-green-500 text-transparent bg-clip-text">
                {isSkippedUser
                  ? "My Restaurant Dashboard"
                  : (restaurantData?.restaurantName || "Restaurant") + " Dashboard"
                }
              </h1>
              <div className="flex items-center space-x-2">
                <p className="text-gray-600">Welcome back!</p>
                {user?.isVerified && (
                  <VerifiedBadge isVerified={user.isVerified} size="sm" />
                )}
                {isSkippedUser && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    ⚠️ Limited Mode
                  </span>
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
            {!isSkippedUser && (
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
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Button
              onClick={handleEditOpen}
              variant="outline"
              size="sm"
            >
              <FiEdit3 className="text-md mr-2" /> {isSkippedUser ? 'Complete Setup' : 'Edit Restaurant'}
            </Button>
            {!isSkippedUser && (
              <Button onClick={refreshRestaurantData} variant="outline" size="sm">
                <SlRefresh className="text-md mr-1"/><p>Refresh</p>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              disabled={isSkippedUser}
              title={isSkippedUser ? "Complete setup to unlock this feature" : ""}
              onClick={handleSettingsClick}
            >
              <FiSettings className="text-xl"/>
            </Button>

            <div ref={notificationRef} className="relative">
              <Button
                variant="outline"
                size="sm"
                className="relative flex items-center"
                onClick={() => setShowNotifications((prev) => !prev)}
              >
                <IoMdNotificationsOutline className="text-xl"/>
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-xs font-semibold flex items-center justify-center">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </Button>
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900">Notifications</p>
                    <p className="text-xs text-gray-500">Recent updates for your restaurant</p>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-gray-500">
                        You're all caught up!
                      </div>
                    ) : (
                      notifications.map((notification, index) => (
                        <div key={notification.id || index} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title || 'Notification'}
                          </p>
                          {notification.message && (
                            <p className="mt-1 text-sm text-gray-600">
                              {notification.message}
                            </p>
                          )}
                          {(notification.time || notification.createdAt) && (
                            <p className="mt-1 text-xs text-gray-400">
                              {notification.time || notification.createdAt}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-2 text-center border-t border-gray-100">
                    <button
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                      onClick={() => setShowNotifications(false)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <EmailVerificationAlert user={user} />

        {/* --> Setup completion prompt for skipped users */}
        {isSkippedUser && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
            <div className="flex items-center">
              <div className="text-yellow-600 text-2xl mr-4">⚠️</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">
                  Complete Your Restaurant Setup
                </h3>
                <p className="text-yellow-800 mb-4">
                  You're currently using a limited dashboard. Complete your restaurant setup to unlock all features including menu management, order processing, and analytics.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={handleCompleteSetup}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    Complete Setup Now
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDismissSkipReminder}
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                  >
                    Remind Me Later
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Restaurant Information Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Restaurant Information
            </h2>
            <Button
              onClick={handleEditOpen}
              size="sm"
              variant="outline"
            >
              {isSkippedUser ? 'Complete Setup' : 'Edit'}
            </Button>
          </div>

          {isSkippedUser ? (
            // --> Placeholder content for skipped users
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🏗️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Restaurant Setup Pending
              </h3>
              <p className="text-gray-600 mb-6">
                Complete your restaurant setup to see your information here and unlock all features.
              </p>
              <Button
                onClick={handleCompleteSetup}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Complete Setup Now
              </Button>
            </div>
          ) : (
            // --> Normal restaurant information display
            <>
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
            </>
          )}
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
                <h3 className="text-sm font-medium text-blue-600">
                  Orders Today
                </h3>
                <p className="text-2xl font-bold text-blue-600">
                  {isSkippedUser ? "N/A" : "0"}
                </p>
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
                  <h3 className="text-sm font-medium text-green-600">Revenue</h3>
                  {!isSkippedUser && (
                    <button
                      onClick={handleRevenueToggle}
                      className={`p-1 rounded-full transition-colors ${isRevenueVisible
                        ? "text-green-600 hover:bg-green-100"
                        : "text-gray-400 hover:bg-gray-100"
                        }`}
                      title={isRevenueVisible ? "Hide Revenue" : "Show Revenue"}
                    >
                      {isRevenueVisible ? "👁️" : "🙈"}
                    </button>
                  )}
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {isSkippedUser
                    ? "N/A"
                    : isRevenueVisible
                      ? `${revenueData.currency}${revenueData.today.toLocaleString()}`
                      : "••••"
                  }
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
                <h3 className="text-sm font-medium text-purple-600">
                  Total Menu Items
                </h3>
                <p className="text-2xl font-bold text-purple-600">
                  {isSkippedUser ? "N/A" : "0"}
                </p>
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
                <h3 className="text-sm font-medium text-orange-600">
                  Staff Members
                </h3>
                <p className="text-2xl font-bold text-orange-600">
                  {isSkippedUser ? "N/A" : (restaurantData?.staffCount || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Extended Revenue Details (when visible) */}
        {isRevenueVisible && !isSkippedUser && (
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
            <Link
              to="/menu/items"
              className={`w-full ${isSkippedUser ? 'pointer-events-none' : ''}`}
              title={isSkippedUser ? "Complete setup to unlock this feature" : ""}
            >
              <Button
                variant="outline"
                className="w-full h-full flex items-center justify-center"
                disabled={isSkippedUser}
              >
                <BiFoodMenu className="mr-2" />
                Manage Menu
              </Button>
            </Link>

            <Link
              to={`/tables`}
              state={{ restaurantData: restaurantData }}
              className={`w-full ${isSkippedUser ? 'pointer-events-none' : ''}`}
              title={isSkippedUser ? "Complete setup to unlock this feature" : ""}
            >
              <Button
                variant="outline"
                className="w-full h-full flex items-center justify-center"
                disabled={isSkippedUser}
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                Manage Tables
              </Button>
            </Link>

            <Button
              variant="outline"
              className="w-full flex items-center justify-center"
              disabled={isSkippedUser}
              title={isSkippedUser ? "Complete setup to unlock this feature" : ""}
              onClick={() => navigate('/orders')}
            >
              <FiShoppingBag className="mr-2" />
              View Orders
            </Button>

            <Button
              variant="outline"
              className="w-full flex items-center justify-center"
              disabled={isSkippedUser}
              title={isSkippedUser ? "Complete setup to unlock this feature" : ""}
            >
              <FiBarChart2 className="mr-2" />
              Analytics
            </Button>

            <Button
              variant="outline"
              className="w-full flex items-center justify-center"
              disabled={isSkippedUser}
              title={isSkippedUser ? "Complete setup to unlock this feature" : ""}
              onClick={handleSettingsClick}
            >
              <FiSettings className="mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Template Preview */}
        {isSkippedUser ? (
          // --> Setup prompt for skipped users
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🎨</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Choose Your Menu Template
              </h3>
              <p className="text-gray-600 mb-6">
                Complete your restaurant setup to select a beautiful template for your menu.
              </p>
              <Button
                onClick={handleCompleteSetup}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Choose Template
              </Button>
            </div>
          </div>
        ) : (
          // --> Normal template preview for setup users
          restaurantData?.selectedTempId && (
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
                      className={`px-2 py-1 rounded-full text-xs ${restaurantData.selectedTempId.isFree
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
          )
        )}
      </div>

      {/* Modals */}
      {!isSkippedUser && (
        <EditRestaurantModal
          isOpen={isEditModalOpen}
          onClose={handleEditClose}
          currentData={restaurantData}
        />
      )}

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
