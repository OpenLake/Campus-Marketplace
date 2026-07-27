import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useForm } from "../../hooks/useForm.js";
import { validators } from "../../utils/validation.js";
import authService from "../../services/authService.js";
import Alert from "../../components/ui/Alert.jsx";
import toast from "react-hot-toast";
import siteLogo from "../../assets/site_logo.png";

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const validateForm = (values) => {
    const errors = {};

    const passwordError = validators.password(values.password);
    if (passwordError) errors.password = passwordError;

    const confirmPasswordError = validators.confirmPassword(
      values.password,
      values.confirmPassword
    );
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

    return errors;
  };

  const handleResetPassword = async (values) => {
    if (!token) {
      toast.error("Invalid or missing reset token");
      throw new Error("Missing token");
    }

    try {
      await authService.resetPassword(token, values.password);
      setResetSuccess(true);
      toast.success("Password reset successful!");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to reset password. Please try again.";
      toast.error(errorMessage);
      throw error;
    }
  };

  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm(
    { password: "", confirmPassword: "" },
    handleResetPassword,
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
          <img src={siteLogo} alt="Logo" className="w-11 h-11 object-contain" />
          <div>
            <div className="font-bold text-xl tracking-tight text-white font-grotesk">Campus Marketplace</div>
            <div className="text-[10px] text-[#5d6b7d] tracking-[1.8px] font-semibold -mt-0.5">IIT BHILAI</div>
          </div>
        </div>

        {/* Reset Password Card */}
        <div className="bg-[#121922] border border-[#232c38] rounded-2xl p-8 md:p-9 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] animate-[fadeIn_0.2s_ease]">
          <h1 className="text-2xl font-bold text-white mb-1 font-grotesk">Reset password</h1>
          
          {!token ? (
            <div className="space-y-4 mt-2">
              <Alert type="error" message="Invalid or missing reset token. Please request a new password reset link." />
              <div className="text-center">
                <Link to="/forgot-password" className="text-sm font-semibold text-[#10b981] hover:underline">
                  Request new reset link
                </Link>
              </div>
            </div>
          ) : !resetSuccess ? (
            <>
              <p className="text-sm text-[#93a2b3] mb-6">Enter your new password below.</p>
              
              {errors.submit && <Alert type="error" message={errors.submit} className="mb-5" />}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-xs font-semibold text-[#93a2b3] mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#5d6b7d]">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      placeholder="••••••••"
                      value={values.password}
                      onChange={handleChange}
                      className="w-full bg-[#0d1218] border border-[#232c38] rounded-xl pl-10 pr-10 py-3 text-white text-sm placeholder-[#5d6b7d] focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#5d6b7d] hover:text-[#93a2b3]"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password ? (
                    <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                  ) : (
                    <p className="text-[10px] text-[#5d6b7d] mt-1">Min. 8 characters with upper, lower, number &amp; symbol</p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-xs font-semibold text-[#93a2b3] mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#5d6b7d]">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={values.confirmPassword}
                      onChange={handleChange}
                      className="w-full bg-[#0d1218] border border-[#232c38] rounded-xl pl-10 pr-10 py-3 text-white text-sm placeholder-[#5d6b7d] focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#5d6b7d] hover:text-[#93a2b3]"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
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
                    'Reset password'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="space-y-4 text-center">
              <div className="rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 p-4 text-[#10b981] text-sm font-semibold">
                Password reset successful!
              </div>
              <p className="text-xs text-[#93a2b3]">Redirecting to login page...</p>
              <div className="pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center text-xs font-semibold text-[#10b981] hover:underline gap-1.5"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Go to login now
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Secure badge */}
        <div className="text-center mt-6 text-xs text-[#5d6b7d] tracking-wide">
          🔒 Secure · <span className="text-[#10b981] font-semibold">IIT Bhilai</span> campus community
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
