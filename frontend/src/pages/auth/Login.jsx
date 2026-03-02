import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import { useForm } from "../../hooks/useForm.js";
import { validators } from "../../utils/validation.js";
import toast from "react-hot-toast";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleGoogleLogin = async (credentialResponse) => {
    try {
      await axios.post(
        "http://localhost:3000/api/auth/google",
        { credential: credentialResponse.credential },
        { withCredentials: true },
      );

      toast.success("Google login successful!");
      navigate(from, { replace: true });
    } catch (error) {
      toast.error("Google login failed");
    }
  };

  // Get the page user was trying to access
  const from = location.state?.from?.pathname || location.state?.from || "/";
  /**
   * Validate login form
   */
  const validateForm = (values) => {
    const errors = {};

    const emailError = validators.email(values.email);
    if (emailError) errors.email = emailError;

    if (!values.password) {
      errors.password = "Password is required";
    }

    return errors;
  };

  /**
   * Handle login submission
   */

  const handleLogin = async (values) => {
    try {
      await login(values);
      toast.success("Login successful!");
      navigate(from, { replace: true });
    } catch (error) {
      // Get the specific message from the backend error response
      const errorMessage =
        error.response?.data?.message || "Invalid email or password.";
      toast.error(errorMessage);

      // We throw the error so that useForm sets it in the 'errors' state
      throw error;
    }
  };

  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm(
    { email: "", password: "" },
    handleLogin,
    validateForm,
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-2xl">CM</span>
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign up
              </Link>
            </p>
          </div>

          {/* Login Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-colors"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={values.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-11 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Remember me
                </label>
              </div>

              <Link
                to="/forgot-password"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm text-red-800 font-medium">
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>

            {/* Divider */}
            <div className="flex items-center my-4">
              <div className="grow border-t border-gray-200"></div>
              <span className="mx-4 text-gray-400 text-sm">OR</span>
              <div className="grow border-t border-gray-200"></div>
            </div>

            {/* Google Login */}
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => toast.error("Google Login Failed")}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
