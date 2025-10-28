import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { useForm } from "../../hooks/useForm.js";
import { validators } from "../../utils/validation.js";
import authService from "../../services/authService.js";
import Input from "../../components/ui/Input.jsx";
import Button from "../../components/ui/Button.jsx";
import toast from "react-hot-toast";
import { useState } from "react";

const ForgotPassword = () => {
  const [emailSent, setEmailSent] = useState(false);

  /**
   * Validate forgot password form
   */
  const validateForm = (values) => {
    const errors = {};
    const emailError = validators.email(values.email);
    if (emailError) errors.email = emailError;
    return errors;
  };

  /**
   * Handle forgot password submission
   */
  const handleForgotPassword = async (values) => {
    try {
      await authService.forgotPassword(values.email);
      setEmailSent(true);
      toast.success("Password reset link sent to your email!");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to send reset link. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  };

  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm(
    { email: "" },
    handleForgotPassword,
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
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        {!emailSent ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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

            {errors.submit && (
              <div className="rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              isLoading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send reset link"}
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="flex items-center justify-center text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to login
              </Link>
            </div>
          </form>
        ) : (
          <div className="mt-8 text-center space-y-6">
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="shrink-0">
                  <Mail className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Check your email
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>
                      We've sent password reset instructions to{" "}
                      <strong>{values.email}</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                onClick={() => setEmailSent(false)}
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                try again
              </button>
            </p>

            <Link
              to="/login"
              className="flex items-center justify-center text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
