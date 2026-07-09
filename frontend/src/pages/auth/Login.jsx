import React, { useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import GoogleButton from './GoogleButton';
import Alert from '../../components/ui/Alert';

const Login = () => {
  const navigate = useNavigate();
  const { handleGoogleSignIn } = useContext(AuthContext);
  const [error, setError] = useState('');

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

        {/* Login Card */}
        <div className="bg-[#121922] border border-[#232c38] rounded-2xl p-8 md:p-9 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] animate-[fadeIn_0.2s_ease] text-center">
          <h1 className="text-2xl font-bold text-white mb-2 font-grotesk">Welcome back</h1>
          <p className="text-sm text-[#93a2b3] mb-8">Sign in to buy, sell &amp; trade within your campus community.</p>

          {error && <Alert type="error" message={error} className="mb-6 text-left" />}

          <div className="w-full flex justify-center py-4">
            <GoogleButton
              onSuccess={handleGoogleSuccess}
              onFailure={handleGoogleFailure}
            />
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#232c38]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 bg-[#121922] text-[#5d6b7d] font-medium">Secure IIT Bhilai Authentication</span>
            </div>
          </div>

          <p className="text-xs text-[#5d6b7d] leading-relaxed">
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-[#10b981] hover:underline font-semibold">Terms</a> and{' '}
            <a href="/privacy" className="text-[#10b981] hover:underline font-semibold">Privacy Policy</a>
          </p>
        </div>

        {/* Secure badge */}
        <div className="text-center mt-6 text-xs text-[#5d6b7d] tracking-wide">
          🔒 Powered by Google Sign-In • 100% secure
        </div>
      </div>
    </div>
  );
};

export default Login;