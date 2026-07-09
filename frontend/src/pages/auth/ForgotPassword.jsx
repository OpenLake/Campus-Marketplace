import { Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import { useForm } from "../../hooks/useForm.js";
import { validators } from "../../utils/validation.js";
import authService from "../../services/authService.js";
import Alert from "../../components/ui/Alert.jsx";
import toast from "react-hot-toast";
import { useState } from "react";

const ForgotPassword = () => {
  const [emailSent, setEmailSent] = useState(false);

  const validateForm = (values) => {
    const errors = {};
    const emailError = validators.email(values.email);
    if (emailError) errors.email = emailError;
    return errors;
  };

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
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans"
      style={{
        background: `
          radial-gradient(1100px 600px at 85% -10%, rgba(16, 185, 129, 0.08), transparent 60%),
          radial-gradient(900px 500px at -10% 20%, rgba(79, 157, 255, 0.05), transparent 55%),
          #0a0f14
        `
      }}
    >
      <div className="w-full max-w-[420px] z-10">
        {/* Brand Header */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#10b981] to-[#0a8a63] flex items-center justify-center font-bold text-lg text-[#04140e] shadow-[0_6px_20px_-6px_rgba(16,185,129,0.55)]">
            CM
          </div>
          <div>
            <div className="font-bold text-xl tracking-tight text-white font-grotesk">Campus Marketplace</div>
            <div className="text-[10px] text-[#5d6b7d] tracking-[1.8px] font-semibold -mt-0.5">IIT BHILAI</div>
          </div>
        </div>

        {/* Forgot Password Card */}
        <div className="bg-[#121922] border border-[#232c38] rounded-2xl p-8 md:p-9 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] animate-[fadeIn_0.2s_ease]">
          <h1 className="text-2xl font-bold text-white mb-1 font-grotesk">Forgot password?</h1>
          <p className="text-sm text-[#93a2b3] mb-6">
            Enter your email and we'll send you reset instructions.
          </p>

          {errors.submit && <Alert type="error" message={errors.submit} className="mb-5" />}

          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-[#93a2b3] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#5d6b7d]">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="john.doe@iitbhilai.ac.in"
                    value={values.email}
                    onChange={handleChange}
                    className="w-full bg-[#0d1218] border border-[#232c38] rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder-[#5d6b7d] focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#10b981] hover:bg-[#20dba0] disabled:bg-[#10b981]/50 text-[#04140e] font-bold py-3.5 px-4 rounded-xl transition duration-200 transform hover:-translate-y-0.5 disabled:transform-none shadow-[0_8px_24px_-8px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-[#04140e] border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  'Send reset link'
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-6 text-center">
              <div className="rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 p-4 text-[#10b981] text-sm">
                <p className="font-semibold mb-1">Check your email</p>
                <p className="text-[#93a2b3] text-xs">
                  We've sent password reset instructions to <strong>{values.email}</strong>
                </p>
              </div>

              <p className="text-xs text-[#93a2b3]">
                Didn't receive the email? Check your spam folder or{" "}
                <button
                  onClick={() => setEmailSent(false)}
                  className="font-medium text-[#10b981] hover:underline"
                >
                  try again
                </button>
              </p>
            </div>
          )}

          <div className="text-center mt-6">
            <Link
              to="/login"
              className="inline-flex items-center justify-center text-xs font-semibold text-[#10b981] hover:underline gap-1.5"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to login
            </Link>
          </div>
        </div>

        {/* Secure badge */}
        <div className="text-center mt-6 text-xs text-[#5d6b7d] tracking-wide">
          🔒 Secure · <span className="text-[#10b981] font-semibold">IIT Bhilai</span> campus community
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
