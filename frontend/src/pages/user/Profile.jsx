import { useAuth } from '../../hooks/useAuth';
import { AlertCircle, Store, User, ShoppingBag, Clock, Star } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page animate-[fadeIn_0.2s_ease]">


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Avatar & Basic Info */}
        <div className="space-y-6">
          <div className="panel text-center flex flex-col items-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full border-2 border-[#10b981]/40 p-1 bg-[var(--surface)] overflow-hidden">
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                  alt="avatar" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              {user.role === 'vendor' && (
                <div className="absolute bottom-0 right-0 bg-[#10b981] p-1.5 rounded-full border-2 border-[var(--bg)]">
                  <Store size={14} className="text-[var(--bg)]" />
                </div>
              )}
            </div>
            
            <h3 className="font-bold text-lg text-[var(--text-main)]">{`${user.first_name} ${user.last_name}`}</h3>
            <p className="text-sm text-[#10b981] mt-1 font-medium capitalize">
              {user.role === 'student' ? '🎓 Student' : user.role === 'vendor' ? '🛍️ Vendor' : '👤 User'} • IIT Bhilai
            </p>
            
            {user.role === 'vendor' && user.is_verified && (
              <span className="inline-flex items-center gap-1 mt-3 px-3 py-1 bg-emerald-500/10 text-[#10b981] border border-emerald-500/20 rounded-[8px] text-xs font-semibold">
                <Store size={12} /> Verified Vendor
              </span>
            )}
          </div>

          {/* Role-specific quick stats */}
          {user.role === 'vendor' && (
            <div className="panel">
              <h4 className="font-semibold text-[var(--text-main)] mb-4 flex items-center gap-2">
                <ShoppingBag size={18} className="text-[#10b981]" />
                Vendor Stats
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-faint)]">Total Products</span>
                  <span className="font-bold text-[var(--text-main)]">24</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-faint)]">Active Listings</span>
                  <span className="font-bold text-[var(--text-main)]">18</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-faint)]">Total Orders</span>
                  <span className="font-bold text-[var(--text-main)]">47</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[var(--text-faint)]">Rating</span>
                  <span className="flex items-center gap-1 font-bold text-[var(--text-main)]">
                    <Star size={16} className="fill-amber-400 text-amber-400" />
                    4.8
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Profile Details */}
        <div className="lg:col-span-2">
          <div className="panel">
            <h2 className="text-lg font-bold mb-6 text-[var(--text-main)] flex items-center gap-2 pb-3 border-b border-[var(--border)]">
              {user.role === 'vendor' ? <Store size={20} className="text-[#10b981]" /> : <User size={20} className="text-[#10b981]" />}
              {user.role === 'vendor' ? 'Vendor Information' : 'Profile Information'}
            </h2>
            
            <div className="space-y-6">
              {/* Common fields for all users */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-faint)] uppercase tracking-wider mb-1">First Name</label>
                  <p className="text-[var(--text-main)] font-semibold bg-[var(--input-bg)] px-4 py-2.5 rounded-[8px] border border-[var(--input-border)]">{user.first_name || '-'}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-faint)] uppercase tracking-wider mb-1">Last Name</label>
                  <p className="text-[var(--text-main)] font-semibold bg-[var(--input-bg)] px-4 py-2.5 rounded-[8px] border border-[var(--input-border)]">{user.last_name || '-'}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-faint)] uppercase tracking-wider mb-1">Email Address</label>
                  <p className="text-[var(--text-main)] font-semibold bg-[var(--input-bg)] px-4 py-2.5 rounded-[8px] border border-[var(--input-border)]">{user.email}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-faint)] uppercase tracking-wider mb-1">Phone Number</label>
                  <p className="text-[var(--text-main)] font-semibold bg-[var(--input-bg)] px-4 py-2.5 rounded-[8px] border border-[var(--input-border)]">{user.phone_number || 'Not provided'}</p>
                </div>
              </div>

              {/* Student-specific fields */}
              {user.role === 'student' && (
                <div className="pt-4 border-t border-[var(--border)]">
                <h3 className="font-semibold text-[var(--text-main)] mb-4">Student Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-faint)] uppercase tracking-wider mb-1">Roll Number</label>
                    <p className="text-[var(--text-main)] font-semibold bg-[var(--input-bg)] px-4 py-2.5 rounded-[8px] border border-[var(--input-border)]">{user.roll_number || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-faint)] uppercase tracking-wider mb-1">Program</label>
                    <p className="text-[var(--text-main)] font-semibold bg-[var(--input-bg)] px-4 py-2.5 rounded-[8px] border border-[var(--input-border)]">{user.program || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-faint)] uppercase tracking-wider mb-1">Branch</label>
                    <p className="text-[var(--text-main)] font-semibold bg-[var(--input-bg)] px-4 py-2.5 rounded-[8px] border border-[var(--input-border)]">{user.branch || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-faint)] uppercase tracking-wider mb-1">Batch Year</label>
                    <p className="text-[var(--text-main)] font-semibold bg-[var(--input-bg)] px-4 py-2.5 rounded-[8px] border border-[var(--input-border)]">{user.batch_year || 'Not provided'}</p>
                  </div>
                  </div>
                </div>
              )}

              {/* Vendor-specific fields */}
              {user.role === 'vendor' && (
                <div className="pt-4 border-t border-[#232c38]">
                  <h3 className="font-semibold text-gray-200 mb-4 flex items-center gap-2">
                    <Store size={18} className="text-[#10b981]" />
                    Shop Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Shop Name</label>
                      <p className="text-gray-200 font-semibold bg-[#0d1218] px-4 py-2.5 rounded-[8px] border border-[#232c38]">{user.shop_name || 'Campus Canteen'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Shop Category</label>
                      <p className="text-gray-200 font-semibold bg-[#0d1218] px-4 py-2.5 rounded-[8px] border border-[#232c38]">{user.shop_category || 'Food & Beverages'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Campus Location</label>
                      <p className="text-gray-200 font-semibold bg-[#0d1218] px-4 py-2.5 rounded-[8px] border border-[#232c38]">{user.campus_location || 'Academic Block'}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Operating Hours</label>
                      <p className="text-gray-200 font-semibold bg-[#0d1218] px-4 py-2.5 rounded-[8px] border border-[#232c38] flex items-center gap-1.5">
                        <Clock size={14} className="text-gray-550" />
                        9:00 AM - 8:00 PM
                      </p>
                    </div>
                  </div>

                  {/* Vendor Verification Status */}
                  <div className="border border-emerald-500/20 bg-emerald-500/5 p-4 rounded-[8px] mt-6">
                    <div className="flex items-start gap-3">
                      <div className="bg-emerald-500/10 rounded-full p-2 text-[#10b981]">
                        {user.is_verified ? (
                          <Store size={18} />
                        ) : (
                          <AlertCircle size={18} className="text-amber-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-200">
                          {user.is_verified ? 'Verified Vendor' : 'Verification Pending'}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {user.is_verified 
                            ? 'Your shop is verified and visible to all students.'
                            : 'Complete your shop details to get verified.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Account meta info */}
              <div className="border-t border-[#232c38] pt-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Member Since</label>
                    <p className="text-gray-300 font-semibold">
                      {new Date(user.created_at).toLocaleDateString('en-US', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Last Active</label>
                    <p className="text-gray-300 font-semibold">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Today'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4 border-t border-[#232c38]">
                <button className="btn-brand flex-1 py-2.5">
                  Edit Profile
                </button>
                {user.role === 'vendor' && (
                  <button className="btn-surface flex-1 py-2.5">
                    Manage Shop
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;