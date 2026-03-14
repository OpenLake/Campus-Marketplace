import { useAuth } from '../../hooks/useAuth';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import { AlertCircle, Store, User, ShoppingBag, Clock, Star } from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex"> 
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Avatar & Basic Info (Same for all users) */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
                <div className="relative inline-block">
                  <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto overflow-hidden">
                    <img 
                      src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} 
                      alt="avatar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {user.role === 'vendor' && (
                    <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1.5">
                      <Store size={14} className="text-white" />
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-lg mt-4 text-gray-900">{`${user.first_name} ${user.last_name}`}</h3>
                <p className="text-sm text-gray-600">
                  {user.role === 'student' ? '🎓 Student' : user.role === 'vendor' ? '🛍️ Vendor' : '👤 User'} • IIT Bhilai
                </p>
                {user.role === 'vendor' && user.is_verified && (
                  <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                    <Store size={12} /> Verified Vendor
                  </span>
                )}
              </div>

              {/* Role-specific quick stats */}
              {user.role === 'vendor' && (
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <ShoppingBag size={18} className="text-emerald-600" />
                    Vendor Stats
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Products</span>
                      <span className="font-semibold">24</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Active Listings</span>
                      <span className="font-semibold">18</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Orders</span>
                      <span className="font-semibold">47</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Rating</span>
                      <span className="flex items-center gap-1">
                        <Star size={16} className="fill-yellow-400 text-yellow-400" />
                        4.5
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Profile Details (Different for each role) */}
            <div className="lg:col-span-2">
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold mb-6 text-gray-900 flex items-center gap-2">
                  {user.role === 'vendor' ? <Store size={20} /> : <User size={20} />}
                  {user.role === 'vendor' ? 'Vendor Information' : 'Profile Information'}
                </h2>
                
                <div className="space-y-4">
                  {/* Common fields for all users */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
                      <p className="text-gray-900 font-medium">{user.first_name || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
                      <p className="text-gray-900 font-medium">{user.last_name || '-'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                    <p className="text-gray-900 font-medium">{user.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                    <p className="text-gray-900 font-medium">{user.phone_number || 'Not provided'}</p>
                  </div>

                  {/* Student-specific fields */}
                  {user.role === 'student' && (
                    <>
                      <div className="border-t border-gray-100 pt-4 mt-4">
                        <h3 className="font-semibold text-gray-900 mb-3">Student Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Student ID</label>
                            <p className="text-gray-900 font-medium">BTH{Math.floor(Math.random() * 10000)}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Program</label>
                            <p className="text-gray-900 font-medium">B.Tech CSE</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Year</label>
                            <p className="text-gray-900 font-medium">3rd Year</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Hostel</label>
                            <p className="text-gray-900 font-medium">Hostel A • Room 101</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Vendor-specific fields */}
                  {user.role === 'vendor' && (
                    <>
                      <div className="border-t border-gray-100 pt-4 mt-4">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Store size={18} className="text-emerald-600" />
                          Shop Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Shop Name</label>
                            <p className="text-gray-900 font-medium">{user.shop_name || 'Campus Canteen'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Shop Category</label>
                            <p className="text-gray-900 font-medium">{user.shop_category || 'Food & Beverages'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Campus Location</label>
                            <p className="text-gray-900 font-medium">{user.campus_location || 'Academic Block'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-500 mb-1">Operating Hours</label>
                            <p className="text-gray-900 font-medium flex items-center gap-1">
                              <Clock size={14} className="text-gray-400" />
                              9:00 AM - 8:00 PM
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Vendor Verification Status */}
                      <div className="bg-emerald-50 p-4 rounded-lg mt-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-emerald-100 rounded-full p-2">
                            {user.is_verified ? (
                              <Store size={18} className="text-emerald-700" />
                            ) : (
                              <AlertCircle size={18} className="text-amber-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {user.is_verified ? 'Verified Vendor' : 'Verification Pending'}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {user.is_verified 
                                ? 'Your shop is verified and visible to all students.'
                                : 'Complete your shop details to get verified.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Account meta info */}
                  <div className="border-t border-gray-100 pt-4 mt-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Member Since</label>
                        <p className="text-gray-900 font-medium">
                          {new Date(user.created_at).toLocaleDateString('en-US', { 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Last Active</label>
                        <p className="text-gray-900 font-medium">
                          {user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Today'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
                      Edit Profile
                    </button>
                    {user.role === 'vendor' && (
                      <button className="px-4 py-2 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition">
                        Manage Shop
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Profile;