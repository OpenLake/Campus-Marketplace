import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { User, Mail, Phone, MapPin, Save, Loader2 } from "lucide-react";
import Input from "../components/ui/Input.jsx"; // Assuming reusable Input exists
import Button from "../components/ui/Button.jsx"; // Assuming reusable Button exists
import toast from "react-hot-toast";
import api from "../services/api.js"; // Axios instance

const Profile = () => {
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        hostel: "",
        room: "",
    });

    // Load user data on mount
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                phone: user.phone || "",
                hostel: user.hostelLocation?.hostel || "",
                room: user.hostelLocation?.room || "",
            });
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                name: formData.name,
                phone: formData.phone,
                hostelLocation: {
                    hostel: formData.hostel,
                    room: formData.room
                }
            };

            const response = await api.put("/users/me", payload);

            // Update local context
            updateUser(response.data.data);

            toast.success("Profile updated successfully!");
            setIsEditing(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="p-8 text-center">Loading profile...</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">My Profile</h1>
                    <p className="text-gray-500 mt-1">Manage your account settings</p>
                </div>
                {!isEditing && (
                    <Button variant="outline" className="glass hover:bg-white/50" onClick={() => setIsEditing(true)}>Edit Profile</Button>
                )}
            </div>

            <div className="glass rounded-2xl shadow-xl overflow-hidden relative">
                {/* Decorative Banner */}
                <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                {/* Profile Content */}
                <div className="px-8 pb-8">
                    {/* Floating Avatar */}
                    <div className="relative -mt-16 mb-6 flex justify-between items-end">
                        <div className="flex items-end gap-6">
                            <div className="h-32 w-32 rounded-full border-4 border-white shadow-lg bg-white flex items-center justify-center text-4xl font-bold text-indigo-600 bg-gradient-to-br from-indigo-50 to-purple-50">
                                {user.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="mb-2">
                                <h2 className="text-2xl font-bold text-gray-900">{user.name || "Student"}</h2>
                                <p className="text-gray-500 font-medium">@{user.username}</p>
                            </div>
                        </div>
                        <div className="mb-2 hidden sm:flex gap-2">
                            <span className="px-3 py-1 rounded-full bg-indigo-100/80 text-indigo-700 text-xs font-bold uppercase tracking-wide backdrop-blur-sm">
                                {user.roles?.[0]}
                            </span>
                            {user.domainVerified && (
                                <span className="px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-700 text-xs font-bold backdrop-blur-sm">
                                    Verified
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Form Fields */}
                    <form onSubmit={handleSubmit} className="space-y-8 mt-8">
                        {/* Section 1: Identity */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <User className="h-5 w-5 text-indigo-500" />
                                Personal Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                                    <div className="flex items-center gap-3 p-3 glass-input rounded-xl text-gray-500 bg-gray-100/50 cursor-not-allowed">
                                        <Mail className="h-4 w-4" />
                                        <span className="font-medium">{user.email}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 pl-1">Email cannot be changed</p>
                                </div>

                                <Input
                                    label="Full Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    placeholder="Your Name"
                                    className="glass-input rounded-xl"
                                    leftIcon={<User className="h-4 w-4" />}
                                />

                                <Input
                                    label="Phone Number"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    placeholder="+91 99999 99999"
                                    className="glass-input rounded-xl"
                                    leftIcon={<Phone className="h-4 w-4" />}
                                />
                            </div>
                        </div>

                        {/* Section 2: Campus */}
                        <div className="pt-4 border-t border-gray-200/50">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-purple-500" />
                                Campus Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Hostel</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MapPin className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <select
                                            name="hostel"
                                            value={formData.hostel}
                                            onChange={handleChange}
                                            disabled={!isEditing}
                                            className="block w-full pl-10 pr-3 py-2.5 glass-input rounded-xl leading-5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm disabled:text-gray-700 disabled:bg-gray-200/50 transition-all duration-200 shadow-sm"
                                        >
                                            <option value="">Select Hostel</option>
                                            <option value="kanhar">Kanhar</option>
                                            <option value="Gopad">Gopad</option>
                                            <option value="Indravati">Indravati</option>
                                            <option value="Shivnath">Shivnath</option>
                                        </select>
                                    </div>
                                </div>

                                <Input
                                    label="Room Number"
                                    name="room"
                                    value={formData.room}
                                    onChange={handleChange}
                                    disabled={!isEditing}
                                    placeholder="e.g. B-101"
                                    className="glass-input rounded-xl"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        {isEditing && (
                            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200/50 animate-in fade-in slide-in-from-bottom-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => {
                                        setIsEditing(false);
                                        // Reset form to user values
                                        setFormData({
                                            name: user.name || "",
                                            phone: user.phone || "",
                                            hostel: user.hostelLocation?.hostel || "",
                                            room: user.hostelLocation?.room || "",
                                        });
                                    }}
                                    disabled={loading}
                                    className="hover:bg-red-50 hover:text-red-600"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" isLoading={loading} disabled={loading} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200 border-0">
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
