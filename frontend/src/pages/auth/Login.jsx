import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import GoogleButton from './GoogleButton';
import Alert from '../../components/ui/Alert'; // adjust path if needed
import { GraduationCap } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { handleGoogleSignIn } = useContext(AuthContext);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (response) => {
  setLoading(true);
  setError('');
  
  const result = await handleGoogleSignIn(response.credential);
  console.log("Result from handleGoogleSignIn:", result); // 👈 Add this log
  
  if (result.error) {
    setError(result.error);
    setLoading(false);
  } else if (result.requiresDetails) {
    // This should trigger navigation to /register/details
    console.log("Redirecting to registration page...");
    navigate('/register/details');
  } else {
    navigate('/dashboard');
  }
};

  const handleGoogleFailure = () => {
    setError('Google Sign-In failed. Please try again.');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl shadow-lg mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Campus Marketplace</h1>
          <p className="text-emerald-600 font-medium">Openlake</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome back</h2>
          <p className="text-gray-500 mb-8">Sign in to continue to your campus marketplace</p>

          {error && <Alert type="error" message={error} className="mb-6" />}

          <GoogleButton
            onSuccess={handleGoogleSuccess}
            onFailure={handleGoogleFailure}
            disabled={loading}
          />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Secure campus authentication</span>
            </div>
          </div>

          <p className="text-xs text-center text-gray-400">
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-emerald-600 hover:underline">Terms</a> and{' '}
            <a href="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</a>
          </p>
        </div>

        {/* Footer note */}
        <p className="text-center mt-8 text-sm text-gray-500">
          Powered by Google Sign-In • 100% secure
        </p>
      </div>
    </div>
  );
};

export default Login;