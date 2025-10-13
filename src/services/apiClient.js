// src/services/apiClient.js
// const BASE_URL = "http://localhost:5000/api";
const BASE_URL = "https://restaurantmenu-five.vercel.app/api";

class ApiClient {
  constructor() {
    this.baseURL = BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const config = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      mode: "cors",
      ...options,
    };

    const token = localStorage.getItem("authToken");

    // Add Authorization header if token exists and it's not a public endpoint
    const publicEndpoints = ["/auth/login", "/auth/register"];
    if (token && !publicEndpoints.includes(endpoint)) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          data = { message: text || `HTTP ${response.status}` };
        }
      }

      if (!response.ok) {
        let errorMessage = data.message || data.error;

        switch (response.status) {
          case 401:
            errorMessage =
              "Authentication failed. Please check your credentials.";
            // Optionally, you could trigger a logout here
            // Example: window.dispatchEvent(new Event('auth-error'));
            break;
          case 403:
            errorMessage =
              "Access forbidden. You do not have permission to perform this action.";
            break;
          case 404:
            errorMessage = "The requested resource was not found.";
            break;
          case 409:
            errorMessage =
              "A conflict occurred. This may be due to duplicate data.";
            break;
          case 500:
            errorMessage =
              "An internal server error occurred. Please try again later.";
            break;
          default:
            errorMessage =
              errorMessage ||
              `An unexpected error occurred: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error(`🚨 API Error:`, error);
      if (error.name === "TypeError" && error.message.includes("fetch")) {
        throw new Error(
          "Network error. Please check your internet connection and try again."
        );
      }
      throw error;
    }
  }

  // --- Auth Endpoints ---

  async login(credentials) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    const response = await this.request("/auth/logout", {
      method: "POST",
    });
    localStorage.removeItem("authToken");
    return response;
  }

  // ✅ NEW: verifyToken method
  async verifyToken() {
    // This endpoint specifically needs the Authorization header, which the request method handles.
    return this.request("/auth/verify", {
      method: "GET",
    });
  }

  // Email verification endpoints
  async sendEmailOTP() {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request("/auth/send-email-otp", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }

  async resendEmailOTP() {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request("/auth/resend-email-otp", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }

  async verifyEmailOTP(otp) {
    const token = localStorage.getItem("authToken");
    if (!token) {
      throw new Error("No authentication token found");
    }

    return this.request("/auth/verify-email-otp", {
      method: "POST",
      body: JSON.stringify({ token, otp }),
    });
  }

  async getTemplates(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/templates/all-template${
      queryString ? `?${queryString}` : ""
    }`;

    return this.request(endpoint, {
      method: "GET",
    });
  }

  // --- User/Profile Endpoints ---

  async getProfile() {
    return this.request("/user/profile");
  }

  // You can add other restaurant-related API calls here
  async registerRestaurant(restaurantData) {
    return this.request("/restaurants/register", {
      method: "POST",
      body: JSON.stringify(restaurantData),
    });
  }
}

const apiClient = new ApiClient();
export default apiClient;
