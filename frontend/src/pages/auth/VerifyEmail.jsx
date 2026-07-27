import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import authService from "../../services/authService.js";
import siteLogo from "../../assets/site_logo.png";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState("");

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing verification token");
      return;
    }

    verifyEmail();
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await authService.verifyEmail(token);
      setStatus("success");
      setMessage(response.message || "Email verified successfully!");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      setStatus("error");
      setMessage(
        error.response?.data?.message ||
          "Email verification failed. The link may be invalid or expired."
      );
    }
  };

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

        {/* Card */}
        <div className="bg-[#121922] border border-[#232c38] rounded-2xl p-8 md:p-9 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] animate-[fadeIn_0.2s_ease]">
          <h1 className="text-2xl font-bold text-white mb-6 font-grotesk text-center">Email Verification</h1>

          <div className="space-y-6">
            {status === "verifying" && (
              <div className="text-center space-y-4 py-4">
                <Loader2 className="mx-auto h-12 w-12 text-[#10b981] animate-spin" />
                <p className="text-sm text-[#93a2b3]">Verifying your email address...</p>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-6">
                <div className="rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 p-5 text-center">
                  <CheckCircle className="h-10 w-10 text-[#10b981] mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-white mb-1">
                    Email verified successfully!
                  </h3>
                  <p className="text-xs text-[#93a2b3] mb-3">{message}</p>
                  <p className="text-[11px] text-[#5d6b7d]">
                    Redirecting you to the login page...
                  </p>
                </div>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="inline-flex w-full items-center justify-center bg-[#10b981] hover:bg-[#20dba0] text-[#04140e] font-bold py-3.5 px-4 rounded-xl transition duration-200 transform hover:-translate-y-0.5 shadow-[0_8px_24px_-8px_rgba(16,185,129,0.5)]"
                  >
                    Go to Login
                  </Link>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="space-y-6">
                <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-5 text-center">
                  <XCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                  <h3 className="text-sm font-semibold text-white mb-1">
                    Verification failed
                  </h3>
                  <p className="text-xs text-[#93a2b3]">{message}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Link to="/register" className="flex-1">
                      <button className="w-full bg-transparent hover:bg-[#232c38] text-white border border-[#232c38] font-bold py-3.5 px-4 rounded-xl transition duration-200 text-sm">
                        Register Again
                      </button>
                    </Link>
                    <Link to="/login" className="flex-1">
                      <button className="w-full bg-[#10b981] hover:bg-[#20dba0] text-[#04140e] font-bold py-3.5 px-4 rounded-xl transition duration-200 text-sm shadow-[0_8px_24px_-8px_rgba(16,185,129,0.5)]">
                        Go to Login
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
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

export default VerifyEmail;
