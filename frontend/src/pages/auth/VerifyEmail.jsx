import { useEffect, useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import authService from "../../services/authService.js";
import Button from "../../components/ui/Button.jsx";

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-2xl">CM</span>
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Email Verification
          </h2>
        </div>

        {/* Status Display */}
        <div className="mt-8">
          {status === "verifying" && (
            <div className="text-center space-y-4">
              <Loader2 className="mx-auto h-12 w-12 text-primary-600 animate-spin" />
              <p className="text-sm text-gray-600">Verifying your email...</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6">
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="shrink-0">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Email verified successfully!
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>{message}</p>
                      <p className="mt-2">
                        You can now log in to your account. Redirecting to
                        login...
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <Link to="/login">
                  <Button>Go to Login</Button>
                </Link>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6">
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="shrink-0">
                    <XCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Verification failed
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{message}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600">
                  Need a new verification link?
                </p>
                <div className="flex justify-center space-x-4">
                  <Link to="/register">
                    <Button variant="outline">Register Again</Button>
                  </Link>
                  <Link to="/login">
                    <Button>Go to Login</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
