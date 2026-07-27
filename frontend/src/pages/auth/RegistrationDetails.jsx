import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Alert from '../../components/ui/Alert';
import siteLogo from '../../assets/site_logo.png';

const shopCategories = [
  { value: 'books', label: 'Books' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'food', label: 'Food & Beverages' },
  { value: 'services', label: 'Services' },
  { value: 'other', label: 'Other' },
];

const RegisterDetails = () => {
  const navigate = useNavigate();
  const { tempToken, completeRegistration } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    role: 'student',
    shop_name: '',
    shop_category: 'books',
    campus_location: '',
    opening_time: '',
    closing_time: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!tempToken) {
      navigate('/login');
    }
  }, [tempToken, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!formData.first_name || !formData.last_name || !formData.phone_number) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.phone_number.replace(/\D/g, '').length < 10) {
      setError('Phone number must be at least 10 digits.');
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone_number: formData.phone_number,
        role: formData.role,
      };

      if (formData.role === 'vendor') {
        payload.shop_name = formData.shop_name;
        payload.shop_category = formData.shop_category;
        payload.campus_location = formData.campus_location;
        payload.opening_time = formData.opening_time;
        payload.closing_time = formData.closing_time;
      }

      const result = await completeRegistration(payload);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!tempToken) {
    return null; // or loading state, redirecting
  }

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
      <div className="w-full max-w-[550px] z-10 my-8">
        {/* Brand Header */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <img src={siteLogo} alt="Logo" className="w-11 h-11 object-contain" />
          <div>
            <div className="font-bold text-xl tracking-tight text-white font-grotesk">Campus Marketplace</div>
            <div className="text-[10px] text-[#5d6b7d] tracking-[1.8px] font-semibold -mt-0.5">IIT BHILAI</div>
          </div>
        </div>

        {/* Register Card */}
        <div className="bg-[#121922] border border-[#232c38] rounded-2xl p-8 md:p-9 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] animate-[fadeIn_0.2s_ease]">
          <h1 className="text-2xl font-bold text-white mb-1 font-grotesk">Complete Registration</h1>
          <p className="text-sm text-[#93a2b3] mb-6">We just need a few more details to set up your profile.</p>

          {error && <Alert type="error" message={error} className="mb-5" />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-xs font-semibold text-[#93a2b3] mb-1.5">
                  First Name <span className="text-[#10b981]">*</span>
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  placeholder="John"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full bg-[#0d1218] border border-[#232c38] rounded-xl px-4 py-3 text-white text-sm placeholder-[#5d6b7d] focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="last_name" className="block text-xs font-semibold text-[#93a2b3] mb-1.5">
                  Last Name <span className="text-[#10b981]">*</span>
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full bg-[#0d1218] border border-[#232c38] rounded-xl px-4 py-3 text-white text-sm placeholder-[#5d6b7d] focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone_number" className="block text-xs font-semibold text-[#93a2b3] mb-1.5">
                Phone Number <span className="text-[#10b981]">*</span>
              </label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                placeholder="9876543210"
                value={formData.phone_number}
                onChange={handleChange}
                className="w-full bg-[#0d1218] border border-[#232c38] rounded-xl px-4 py-3 text-white text-sm placeholder-[#5d6b7d] focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-xs font-semibold text-[#93a2b3] mb-1.5">
                Account Type <span className="text-[#10b981]">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-[#0d1218] border border-[#232c38] rounded-xl px-4 py-3 text-white text-sm placeholder-[#5d6b7d] focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 transition-all appearance-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='none' stroke='%2393a2b3' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'></path></svg>")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 16px center',
                  backgroundSize: '16px'
                }}
                required
              >
                <option value="student" className="bg-[#121922]">Student</option>
                <option value="vendor" className="bg-[#121922]">Vendor</option>
              </select>
            </div>

            {formData.role === 'vendor' && (
              <div className="space-y-4 border-t border-[#232c38] pt-4 mt-4 animate-[fadeIn_0.15s_ease]">
                <h3 className="font-semibold text-sm text-white">Vendor Details</h3>
                
                <div>
                  <label htmlFor="shop_name" className="block text-xs font-semibold text-[#93a2b3] mb-1.5">
                    Shop Name <span className="text-[#10b981]">*</span>
                  </label>
                  <input
                    type="text"
                    id="shop_name"
                    name="shop_name"
                    placeholder="e.g., Campus Books"
                    value={formData.shop_name}
                    onChange={handleChange}
                    className="w-full bg-[#0d1218] border border-[#232c38] rounded-xl px-4 py-3 text-white text-sm placeholder-[#5d6b7d] focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="shop_category" className="block text-xs font-semibold text-[#93a2b3] mb-1.5">
                    Shop Category <span className="text-[#10b981]">*</span>
                  </label>
                  <select
                    id="shop_category"
                    name="shop_category"
                    value={formData.shop_category}
                    onChange={handleChange}
                    className="w-full bg-[#0d1218] border border-[#232c38] rounded-xl px-4 py-3 text-white text-sm placeholder-[#5d6b7d] focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 transition-all appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;utf8,<svg fill='none' stroke='%2393a2b3' stroke-width='2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'></path></svg>")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 16px center',
                      backgroundSize: '16px'
                    }}
                    required
                  >
                    {shopCategories.map((cat) => (
                      <option key={cat.value} value={cat.value} className="bg-[#121922]">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="campus_location" className="block text-xs font-semibold text-[#93a2b3] mb-1.5">
                    Campus Location <span className="text-[#10b981]">*</span>
                  </label>
                  <input
                    type="text"
                    id="campus_location"
                    name="campus_location"
                    placeholder="e.g., Hostel Block B"
                    value={formData.campus_location}
                    onChange={handleChange}
                    className="w-full bg-[#0d1218] border border-[#232c38] rounded-xl px-4 py-3 text-white text-sm placeholder-[#5d6b7d] focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="opening_time" className="block text-xs font-semibold text-[#93a2b3] mb-1.5">
                      Opening Time <span className="text-[#10b981]">*</span>
                    </label>
                    <input
                      type="time"
                      id="opening_time"
                      name="opening_time"
                      value={formData.opening_time}
                      onChange={handleChange}
                      className="w-full bg-[#0d1218] border border-[#232c38] rounded-xl px-4 py-3 text-white text-sm placeholder-[#5d6b7d] focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="closing_time" className="block text-xs font-semibold text-[#93a2b3] mb-1.5">
                      Closing Time <span className="text-[#10b981]">*</span>
                    </label>
                    <input
                      type="time"
                      id="closing_time"
                      name="closing_time"
                      value={formData.closing_time}
                      onChange={handleChange}
                      className="w-full bg-[#0d1218] border border-[#232c38] rounded-xl px-4 py-3 text-white text-sm placeholder-[#5d6b7d] focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 transition-all"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#10b981] hover:bg-[#20dba0] disabled:bg-[#10b981]/50 text-[#04140e] font-bold py-3.5 px-4 rounded-xl transition duration-200 transform hover:-translate-y-0.5 disabled:transform-none shadow-[0_8px_24px_-8px_rgba(16,185,129,0.5)] flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-[#04140e] border-t-transparent rounded-full animate-spin"></span>
              ) : (
                'Complete Registration'
              )}
            </button>
          </form>
        </div>

        {/* Secure badge */}
        <div className="text-center mt-6 text-xs text-[#5d6b7d] tracking-wide">
          🔒 Secure · <span className="text-[#10b981] font-semibold">IIT Bhilai</span> campus community
        </div>
      </div>
    </div>
  );
};

export default RegisterDetails;