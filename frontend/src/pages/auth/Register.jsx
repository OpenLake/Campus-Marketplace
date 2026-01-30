import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import { useForm } from "../../hooks/useForm.js";
import { validators } from "../../utils/validation.js";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import toast from "react-hot-toast";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  /**
   * Validate registration form
   */
  const validateForm = (values) => {
    const errors = {};

    const nameError = validators.name(values.name);
    if (nameError) errors.name = nameError;

    const usernameError = validators.username(values.username);
    if (usernameError) errors.username = usernameError;

    const emailError = validators.email(values.email);
    if (emailError) errors.email = emailError;

    const passwordError = validators.password(values.password);
    if (passwordError) errors.password = passwordError;

    const confirmPasswordError = validators.confirmPassword(
      values.password,
      values.confirmPassword
    );
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

    return errors;
  };

  /**
   * Handle registration submission
   */
  const handleRegister = async (values) => {
    console.log("Handle Register Started", values);
    try {
      // Remove confirmPassword before sending to API
      const { confirmPassword, ...userData } = values;
      

      const response = await register(userData);
      

      toast.success(
        "Registration successful! Please check your email to verify your account."
      );
      
      navigate("/login");
    } catch (error) {
      
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  };

  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm(
    {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    handleRegister,
    validateForm
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-2xl">CM</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Registration Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <Input
              label="Full Name"
              name="name"
              type="text"
              value={values.name}
              onChange={handleChange}
              error={errors.name}
              leftIcon={<User className="h-4 w-4" />}
              placeholder="John Doe"
              required
            />

            <Input
              label="Username"
              name="username"
              type="text"
              value={values.username}
              onChange={handleChange}
              error={errors.username}
              leftIcon={<User className="h-4 w-4" />}
              placeholder="johndoe"
              helperText="Letters, numbers, and underscores only"
              required
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              error={errors.email}
              leftIcon={<Mail className="h-4 w-4" />}
              placeholder="you@example.com"
              required
            />

            <Input
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={values.password}
              onChange={handleChange}
              error={errors.password}
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer bg-transparent hover:bg-transparent border-0 p-1 focus:ring-0"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                  )}
                </button>
              }
              placeholder="••••••••"
              helperText="Min. 8 characters with uppercase, lowercase, number, and special character"
              required
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={values.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="cursor-pointer bg-transparent hover:bg-transparent border-0 p-1 focus:ring-0"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                  )}
                </button>
              }
              placeholder="••••••••"
              required
            />
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{errors.submit}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>

          {/* Terms */}
          <p className="text-xs text-center text-gray-600">
            By signing up, you agree to our{" "}
            <Link
              to="/terms"
              className="text-primary-600 hover:text-primary-500"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="text-primary-600 hover:text-primary-500"
            >
              Privacy Policy
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
