// src/pages/Auth/Register.jsx - Updated with new fields
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import Loading from "../../components/ui/Loading.jsx";
import { useToast } from "../../context/ToastContext.jsx";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    restaurantName: "",
    password: "",
    confirmPassword: "",
  });
  const [hasAcceptedPolicies, setHasAcceptedPolicies] = useState(false);
  const [errors, setErrors] = useState({});
  const { toast } = useToast();

  const { register, isLoading } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Full name validation
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[\+]?[0-9\s\-\(\)]{7,15}$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Restaurant name is optional, no validation needed

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else {
      const password = formData.password;
      const passwordErrors = [];

      if (password.length < 8) {
        passwordErrors.push("at least 8 characters");
      }

      if (!/[A-Za-z]/.test(password)) {
        passwordErrors.push("at least one letter");
      }

      if (!/[0-9]/.test(password)) {
        passwordErrors.push("at least one number");
      }

      const commonPasswords = [
        "123456",
        "123456789",
        "password",
        "qwerty",
        "111111",
      ];
      if (
        commonPasswords.some((common) =>
          password.toLowerCase().includes(common.toLowerCase())
        )
      ) {
        passwordErrors.push("cannot contain common passwords");
      }

      if (passwordErrors.length > 0) {
        newErrors.password = `Password must have ${passwordErrors.join(", ")}`;
      }
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Send all fields to registration (adapt to your API requirements)
    const registrationData = {
      email: formData.email,
      password: formData.password,
      name: formData.name,
      contactNumber: formData.phone,
      ...(formData.restaurantName && {
        restaurantName: formData.restaurantName,
      }),
    };

    console.log("🔄 Submitting registration form...");
    const result = await register(registrationData);

    if (!result.success) {
      if (
        result.error.includes("conflict") ||
        result.error.includes("exists") ||
        result.error.includes("registered")
      ) {
        setErrors({
          email:
            "This email is already registered. Please use a different email or try logging in.",
        });
      } else if (result.error.toLowerCase().includes("email")) {
        setErrors({ email: result.error });
      } else if (result.error.toLowerCase().includes("password")) {
        setErrors({ password: result.error });
      } else if (result.error.toLowerCase().includes("phone")) {
        setErrors({ phone: result.error });
      } else {
        setErrors({ general: result.error });
      }
    }

    toast.success("Registration successfully!", {
      title: "Registration successfully",
      duration: 4000,
    });
  };

  if (isLoading) {
    return <Loading overlay text="Creating account..." />;
  }

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: "", color: "" };

    let score = 0;
    const checks = {
      length: password.length >= 8,
      hasLetter: /[A-Za-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password),
      notCommon: !["123456", "123456789", "password", "qwerty"].some((common) =>
        password.toLowerCase().includes(common.toLowerCase())
      ),
    };

    score = Object.values(checks).filter(Boolean).length;

    if (score < 2)
      return { strength: score, text: "Weak", color: "text-red-600" };
    if (score < 4)
      return { strength: score, text: "Fair", color: "text-yellow-600" };
    if (score < 5)
      return { strength: score, text: "Good", color: "text-blue-600" };
    return { strength: score, text: "Strong", color: "text-green-600" };
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">VernoraTech</h1>
          <h2 className="text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-gray-600">
            Or{" "}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to existing account
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {errors.general}
            </div>
          )}

          {/* 1. Full Name */}
          <Input
            label="Full Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Enter your full name"
            required
          />

          {/* 2. Email */}
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="Enter your email address"
            required
          />

          {/* 3. Phone Number */}
          <Input
            label="Phone Number"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="Enter your phone number"
            required
          />

          {/* 4. Restaurant Name (Optional) */}
          <Input
            label="Restaurant Name (Optional)"
            type="text"
            name="restaurantName"
            value={formData.restaurantName}
            onChange={handleChange}
            placeholder="Enter your restaurant name (can be added later)"
          />

          {/* Password with Strength Indicator */}
          <div className="space-y-2">
            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Create a strong password"
              required
            />

            {/* Password strength indicator */}
            {formData.password && (
              <div className="text-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span>Password strength:</span>
                  <span
                    className={`font-medium ${
                      getPasswordStrength(formData.password).color
                    }`}
                  >
                    {getPasswordStrength(formData.password).text}
                  </span>
                </div>

                {/* Password requirements checklist */}
                <div className="bg-gray-50 p-3 rounded-lg space-y-1">
                  <p className="font-medium text-gray-700 mb-2">
                    Requirements:
                  </p>
                  <div className="space-y-1 text-xs">
                    <div
                      className={`flex items-center gap-2 ${
                        formData.password.length >= 8
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      <span>{formData.password.length >= 8 ? "✅" : "⭕"}</span>
                      <span>At least 8 characters</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 ${
                        /[A-Za-z]/.test(formData.password)
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      <span>
                        {/[A-Za-z]/.test(formData.password) ? "✅" : "⭕"}
                      </span>
                      <span>At least one letter</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 ${
                        /[0-9]/.test(formData.password)
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      <span>
                        {/[0-9]/.test(formData.password) ? "✅" : "⭕"}
                      </span>
                      <span>At least one number</span>
                    </div>
                    <div
                      className={`flex items-center gap-2 ${
                        !/123456|password|qwerty/i.test(formData.password)
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      <span>
                        {!/123456|password|qwerty/i.test(formData.password)
                          ? "✅"
                          : "⭕"}
                      </span>
                      <span>No common passwords</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Confirm your password"
            required
          />

          <div className="flex items-start space-x-2">
            <input
              id="accept-policies"
              type="checkbox"
              className="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              checked={hasAcceptedPolicies}
              onChange={(e) => setHasAcceptedPolicies(e.target.checked)}
            />
            <label htmlFor="accept-policies" className="text-sm text-gray-600">
              I agree to the
              {" "}
              <Link to="/privacy-policy" className="text-blue-600 hover:text-blue-500">
                Privacy Policy
              </Link>
              {" "}and{" "}
              <Link to="/terms" className="text-blue-600 hover:text-blue-500">
                Terms & Conditions
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full"
            loading={isLoading}
            disabled={isLoading || !hasAcceptedPolicies}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>

          <div className="relative">
            <span className="block w-full h-px bg-gray-300"></span>
            <p className="inline-block w-fit text-sm bg-gray-50 px-2 absolute -top-2 inset-x-0 mx-auto">
              Or continue with
            </p>
          </div>

          <div>
            <button
              disabled={!hasAcceptedPolicies || isLoading}
              className="w-full flex items-center justify-center gap-x-3 py-2.5 border rounded-lg cursor-pointer hover:bg-gray-200 duration-150 active:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <svg
                className="w-5 h-5"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_17_40)">
                  <path
                    d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z"
                    fill="#34A853"
                  />
                  <path
                    d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z"
                    fill="#FBBC04"
                  />
                  <path
                    d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z"
                    fill="#EA4335"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_17_40">
                    <rect width="48" height="48" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              Continue with Google
            </button>
          </div>

          <div className="text-center">
            <Link to="/" className="text-sm text-blue-600 hover:text-blue-500">
              ← Back to Home
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
