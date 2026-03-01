import { useAuth } from '../../hooks/useAuth';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import { AlertCircle } from 'lucide-react';

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
        <DashboardSidebar />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Avatar & Basic Info */}
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
                </div>
                <h3 className="font-bold text-lg mt-4 text-gray-900">{`${user.first_name} ${user.last_name}`}</h3>
                <p className="text-sm text-gray-600">
                  {user.role === 'student' ? 'Student' : user.role === 'vendor' ? 'Vendor' : 'User'} • IIT Bhilai
                </p>
                <div className="flex justify-center gap-4 mt-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 cursor-pointer">f</div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-400 cursor-pointer">t</div>
                  <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 cursor-pointer">ig</div>
                </div>
              </div>
            </div>

            {/* Right Column - Profile Details Display */}
            <div className="lg:col-span-2">
              <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
                <h2 className="text-lg font-bold mb-6 text-gray-900">Profile Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">First Name</label>
                      <p className="text-gray-900">{user.first_name || '-'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Last Name</label>
                      <p className="text-gray-900">{user.last_name || '-'}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                    <p className="text-gray-900">{user.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                    <p className="text-gray-900">{user.phone_number || '-'}</p>
                  </div>

                  {user.role === 'student' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Student ID</label>
                        <p className="text-gray-900">{user.student_id || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Hostel Location</label>
                        <p className="text-gray-900">{user.hostel_location || '-'}</p>
                      </div>
                    </>
                  )}

                  {user.role === 'vendor' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Shop Name</label>
                        <p className="text-gray-900">{user.shop_name || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Shop Category</label>
                        <p className="text-gray-900">{user.shop_category || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Campus Location</label>
                        <p className="text-gray-900">{user.campus_location || '-'}</p>
                      </div>
                    </>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Account Created</label>
                    <p className="text-gray-900">{new Date(user.created_at).toLocaleDateString()}</p>
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
