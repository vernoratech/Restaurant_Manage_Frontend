// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/apiClient";
import { useToast } from "./ToastContext";
import { restaurantService } from "../services/restaurantService";

const AuthContext = createContext();

export const AuthProvider = ({ children , navigate }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // const navigate = useNavigate();
  const { toast } = useToast();

  // Check authentication status on app load
  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem("authToken");
      if (token && token !== "undefined") {
        try {
          const response = await apiClient.verifyToken();

          if (!response.success) {
            toast.error("Please login again!", {
              title: "Please login again.",
              duration: 4000,
            });
          }

          if (response.success && response.data.user) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            // Handle cases where token is invalid but API returns success:false
            throw new Error(response.message || "Invalid session");
          }
        } catch (error) {
          console.error("Session validation failed:", error.message);
          localStorage.removeItem("authToken");
          localStorage.removeItem("restaurantData");
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    validateSession();
  }, [toast]);

  const login = async (credentials) => {
    try {
      setIsLoading(true);

      const response = await apiClient.login(credentials);

      // ✅ FIX: Access the token and user from the nested 'data' object.
      if (
        response.success &&
        response.data &&
        response.data.token &&
        response.data.user
      ) {
        const { token, user } = response.data;

        localStorage.setItem("authToken", token);

        setUser(user);
        setIsAuthenticated(true);

        if (user.isSetup === 1 && user.resId) {

          // Fetch restaurant data in background
          try {
            await fetchAndStoreRestaurantData(user.resId);
            navigate("/dashboard", { replace: true });
          } catch (error) {
            console.error(
              "Error fetching restaurant data, but proceeding to dashboard"
            );
            navigate("/dashboard", { replace: true });
          }
        } else if (user.isSetup === 1 && !user.resId) {
          // User marked as setup but no restaurant ID
          console.warn("⚠️ User marked as setup but no restaurant ID found");
          toast.warning(
            "Restaurant setup incomplete. Please complete your setup.",
            {
              title: "Setup Required",
              duration: 5000,
            }
          );
          navigate("/restaurant-setup", { replace: true });
        } else {
          // User not setup yet;
          navigate("/restaurant-setup", { replace: true });
        }

        return { success: true, user };
      } else {
        // If the structure is wrong or success is false
        throw new Error(
          response.message || "Invalid login response from server."
        );
      }
    } catch (error) {
      console.error("❌ Login failed:", error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("authToken");
      return {
        success: false,
        error: error.message || "Login failed. Please try again.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAndStoreRestaurantData = async (resId) => {
    try {

      const restaurantResponse = await restaurantService.getRestaurantById(
        resId
      );

      if (restaurantResponse.success && restaurantResponse.data) {
        const restaurantData = {
          ...restaurantResponse.data,
          // ✅ Map API response correctly
          selectedTemplate: restaurantResponse.data.selectedTempId, // Template is in selectedTempId
          completedAt: new Date().toISOString(),
          setupCompleted: true,
          skipped: false,
        };

        // ✅ Store in localStorage for offline access
        localStorage.setItem("restaurantData", JSON.stringify(restaurantData));
        return restaurantData;
      } else {
        throw new Error("Invalid restaurant data received from API");
      }
    } catch (error) {
      console.error("❌ Failed to fetch restaurant data:", error);
      toast.error("Failed to load restaurant information", {
        title: "Loading Error",
        duration: 4000,
      });
      return null;
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);

      const response = await apiClient.register(userData);

      // ✅ FIX: Assume the register response has the same structure.
      if (
        response.success &&
        response.data &&
        response.data.token &&
        response.data.user
      ) {
        const { token, user } = response.data;

        localStorage.setItem("authToken", token);

        setUser(user);
        setIsAuthenticated(true);

        navigate("/restaurant-setup", { replace: true });

        return { success: true, user };
      } else {
        throw new Error(
          response.message || "Invalid registration response from server."
        );
      }
    } catch (error) {
      console.error("❌ Registration failed:", error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("authToken");
      return {
        success: false,
        error: error.message || "Registration failed. Please try again.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await apiClient.logout();
    } catch (error) {
      console.error(
        "Server logout failed, proceeding with client-side cleanup:",
        error
      );
    } finally {
      localStorage.removeItem("authToken");
      localStorage.removeItem("restaurantData"); // Also clear restaurant data
      sessionStorage.removeItem("revenueAccess");
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      navigate("/login", { replace: true });
    }
  };

  // const checkRestaurantSetup = () => {
  //   if (user) {
  //     return user.isSetup === 1 || user.isSetup === true;
  //   }
  //   const restaurantData = localStorage.getItem("restaurantData");
  //   if (restaurantData) {
  //     const parsed = JSON.parse(restaurantData);
  //     return parsed.setupCompleted === true;
  //   }
  //   return false;
  // };

  const checkRestaurantSetup = () => {
    if (user) {
      // Check if user has setup flag AND restaurant I
      
      return (user.isSetup === 1 || user.isSetup === true) && user.resId;
    }

    // Fallback to localStorage check
    const restaurantData = localStorage.getItem("restaurantData");
    if (restaurantData) {
      try {
        const parsed = JSON.parse(restaurantData);
        return (
          parsed.setupCompleted === true &&
          (parsed._id || parsed.restaurantName)
        );
      } catch (error) {
        console.error("Error parsing restaurant data:", error);
        return false;
      }
    }
    return false;
  };

  const updateUserVerification = (verifiedData) => {
    const updatedUser = {
      ...user,
      isVerified: true,
      verifiedAt: verifiedData.verifiedAt,
    };
    setUser(updatedUser);
    localStorage.setItem("userData", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    checkRestaurantSetup,
    updateUserVerification,
    fetchAndStoreRestaurantData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
