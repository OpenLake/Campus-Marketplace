import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import RegistrationForm from './RegistrationForm';
import { ArrowLeft } from 'lucide-react';

const RegisterDetails = () => {
  const navigate = useNavigate();
  const { tempToken, completeRegistration } = useContext(AuthContext);
  useEffect(() => {
    if (!tempToken) {
      navigate('/login');
    }
  }, [tempToken, navigate]);

  const handleSubmit = async (formData) => {
    const result = await completeRegistration(formData);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  if (!tempToken) return null; // or loading spinner

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-6 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to login
        </button>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Almost there!</h2>
            <p className="text-gray-600 mt-2">
              Please provide your details to complete registration
            </p>
          </div>

          <RegistrationForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
};

export default RegisterDetails;