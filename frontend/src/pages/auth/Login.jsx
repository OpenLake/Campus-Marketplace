import React, { useContext, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import GoogleButton from './GoogleButton';
import Alert from '../../components/ui/Alert';
import siteLogo from '../../assets/site_logo.png';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { handleGoogleSignIn } = useContext(AuthContext);
  const [error, setError] = useState('');
  const { isDarkMode, toggleDarkMode } = useTheme();

  const handleGoogleSuccess = useCallback(async (response) => {
    setError('');
    const result = await handleGoogleSignIn(response.credential);
    if (result.error) {
      setError(result.error);
    } else if (result.requiresDetails) {
      navigate('/register/details');
    } else {
      navigate('/dashboard');
    }
  }, [handleGoogleSignIn, navigate]);

  const handleGoogleFailure = useCallback(() => {
    setError('Google Sign-In failed. Please try again.');
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-sans transition-colors bg-white dark:bg-[#0a0f14]"
      style={isDarkMode ? {
        background: `
          radial-gradient(1100px 600px at 85% -10%, rgba(16, 185, 129, 0.08), transparent 60%),
          radial-gradient(900px 500px at -10% 20%, rgba(79, 157, 255, 0.05), transparent 55%),
          #0a0f14
        `
      } : {
        background: `
          radial-gradient(1100px 600px at 85% -10%, rgba(16, 185, 129, 0.04), transparent 60%),
          radial-gradient(900px 500px at -10% 20%, rgba(16, 185, 129, 0.02), transparent 55%),
          #ffffff
        `
      }}
    >
      <div className="w-full max-w-3xl z-10 relative">
        {/* Theme Toggle Button */}
        <div className="absolute -top-12 right-0">
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-2 cursor-pointer p-2 bg-gray-100 dark:bg-gray-800/60 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors border border-gray-200/50 dark:border-gray-700/50"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-gray-600" />}
          </button>
        </div>

        {/* Login Box */}
        <div className=" overflow-hidden grid grid-cols-1 md:grid-cols-2">

          {/* Left Column: Form content */}
          <div className="p-8 md:p-10 flex flex-col justify-between text-center md:text-left border-b md:border-b-0 md:border-r border-gray-200 dark:border-[#232c38]">
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-1 font-grotesk">Campus Marketplace</h1>
              <p className="text-[10px] text-gray-400 dark:text-[#5d6b7d] tracking-[1.8px] font-bold uppercase mb-8">IIT Bhilai</p>

              <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-1">Welcome back</h2>
              <p className="text-sm text-gray-500 dark:text-[#93a2b3] mb-6">Sign in using your iitbhilai email.</p>

              {error && <Alert type="error" message={error} className="mb-6 text-left w-full" />}

              <div className="w-full flex justify-center md:justify-start py-2">
                <GoogleButton
                  onSuccess={handleGoogleSuccess}
                  onFailure={handleGoogleFailure}
                />
              </div>

              <div className="relative my-6 w-full">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-[#232c38]"></div>
                </div>
                <div className="relative flex justify-center md:justify-start text-xs">
                  <span className="px-4 md:pl-0 md:pr-4 bg-white dark:bg-[#121922] text-gray-450 dark:text-[#5d6b7d] font-medium">Secure IIT Bhilai Authentication</span>
                </div>
              </div>

              <p className="text-xs text-gray-400 dark:text-[#5d6b7d] leading-relaxed">
                By signing in, you agree to our{' '}
                <a href="/terms" className="text-[#10b981] hover:underline font-semibold">Terms</a> and{' '}
                <a href="/privacy" className="text-[#10b981] hover:underline font-semibold">Privacy Policy</a>
              </p>
            </div>

            {/* Back to Dashboard Link at the bottom of the left column */}
            <div className="border-t border-gray-100 dark:border-[#232c38] mt-6 pt-4 text-center md:text-left">
              <Link to="/dashboard" className="text-xs text-emerald-600 dark:text-[#10b981] hover:underline font-semibold inline-flex items-center gap-1">
                Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Right Column: Logo */}
          <div className="bg-gray-50/50 dark:bg-gray-900/30 p-8 md:p-10 flex flex-col items-center justify-center min-h-[300px] md:min-h-full">
            <div className="w-48 h-48 bg-gradient-to-br from-[#10b981]/10 to-emerald-950/15 rounded-full flex items-center justify-center p-6 shadow-lg border border-emerald-500/10">
              <img src={siteLogo} alt="Logo" className="w-36 h-36 object-contain drop-shadow-[0_6px_15px_rgba(16,185,129,0.25)]" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;