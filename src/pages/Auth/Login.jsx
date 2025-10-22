// src/pages/Auth/Login.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import Loading from "../../components/ui/Loading.jsx";
import { useToast } from "../../context/ToastContext.jsx";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const { login, isLoading } = useAuth();
  const { toast } = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const result = await login(formData);

    if (!result.success) {
      toast.error(result.error, {
        title: result.error,
        duration: 4000,
      });

      // Handle login errors
      if (result.error.toLowerCase().includes("email")) {
        setErrors({ email: result.error });
      } else if (result.error.toLowerCase().includes("password")) {
        setErrors({ password: result.error });
      } else {
        setErrors({ general: result.error });
      }
    }

    if (result.success) {
      toast.success("Login successful!", {
        title: "Login successful",
        duration: 4000,
      });
    }
  };

  if (isLoading) {
    return <Loading overlay text="Signing in..." />;
  }

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied!", {
        description: text,
        duration: 3000,
      });
    } catch (err) {
      toast.error("Failed to copy", {
        description: err.message,
        duration: 4000,
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">VernoraTech</h1>
          <h2 className="text-3xl font-bold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-gray-600">
            Or{" "}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div className="space-y-4">
          {/* Restaurant Setuped */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Demo Credentials for Restaurant Setuped:</strong>
              <br />
              Email:{" "}
              <span
                className="cursor-pointer underline"
                onClick={() => handleCopy("svish5633@gmail.com")}
              >
                svish5633@gmail.com
              </span>
              <br />
              Password:{" "}
              <span
                className="cursor-pointer underline"
                onClick={() => handleCopy("Brijesh@123")}
              >
                Brijesh@123
              </span>
            </p>
          </div>

          {/* Non Restaurant Setuped */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-500">
              <strong>Demo Credentials for Non Restaurant Setuped:</strong>
              <br />
              Email:{" "}
              <span
                className="cursor-pointer underline"
                onClick={() => handleCopy("Harsuuuuuuuuuu1@gmail.com")}
              >
                Harsuuuuuuuuuu1@gmail.com
              </span>
              <br />
              Password:{" "}
              <span
                className="cursor-pointer underline"
                onClick={() => handleCopy("Harsuuuuuuuuuu1@gmail.com")}
              >
                Harsuuuuuuuuuu1@gmail.com
              </span>
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {errors.general}
            </div>
          )}

          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="Enter your email"
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Enter your password"
            required
          />

          <Button
            type="submit"
            className="w-full"
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="relative">
          <span className="block w-full h-px bg-gray-300"></span>
          <p className="inline-block w-fit text-sm bg-gray-50 px-2 absolute -top-2 inset-x-0 mx-auto">
            Or continue with
          </p>
        </div>

        <div>
          <button className="w-full flex items-center justify-center gap-x-3 py-2.5 border rounded-lg cursor-pointer hover:bg-gray-200 duration-150 active:bg-gray-100">
            <svg
              className="w-5 h-5"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_17_40)">
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
      </div>
    </div>
  );
};

export default Login;
