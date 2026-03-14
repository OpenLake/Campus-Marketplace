import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, X, Upload, DollarSign, MapPin } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import listingService from "../../services/listingService";

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    basePrice: "",
    category: "",
    condition: "",
    images: [],
    location: {
      hostel: "",
      roomNumber: "",
      landmark: ""
    },
    isNegotiable: false
  });

  // Fetch categories for dropdown
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch listing data
  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await listingService.getCategories();
      console.log("Categories loaded:", response.data);
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const fetchListing = async () => {
    try {
      setLoading(true);
      console.log("=== EDIT LISTING DEBUG ===");
      console.log("1. Listing ID from URL:", id);
      console.log("2. Current user from auth:", user);
      
      const response = await listingService.getListingById(id);
      console.log("3. Full API Response:", response);
      
      const listing = response.data;
      console.log("4. Listing data:", listing);
      
      // Check if user is the seller
      const currentUserId = user?._id || user?.user_id || user?.id;
      console.log("5. Listing sellerId:", listing.sellerId || listing.seller?.user_id);
      console.log("6. Current user ID:", currentUserId);
      
      const sellerId = listing.sellerId || listing.seller?.user_id;
      
      if (sellerId !== currentUserId) {
        console.error("❌ Permission denied - User is not the seller");
        toast.error("You don't have permission to edit this listing");
        navigate("/my-listings");
        return;
      }
      
      // Map the listing data to form fields
      console.log("7. Mapping listing data to form...");
      
      // Handle category - could be object or string
      let categoryId = listing.category;
      if (listing.category && typeof listing.category === 'object') {
        categoryId = listing.category._id;
      }
      
      setFormData({
        title: listing.title || "",
        description: listing.description || "",
        basePrice: listing.basePrice || listing.price || "",
        category: categoryId || "",
        condition: listing.condition || "",
        images: listing.images || [],
        location: {
          hostel: listing.location?.hostel || "",
          roomNumber: listing.location?.roomNumber || "",
          landmark: listing.location?.landmark || ""
        },
        isNegotiable: listing.isNegotiable || false
      });
      
      console.log("8. Form data set:", formData);
      
    } catch (error) {
      console.error("Error fetching listing:", error);
      toast.error(error.message || "Failed to load listing");
      navigate("/my-listings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.description || !formData.basePrice || !formData.category || !formData.condition) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Prepare data for API
      const updateData = {
        title: formData.title,
        description: formData.description,
        basePrice: Number(formData.basePrice),
        category: formData.category,
        condition: formData.condition,
        location: formData.location,
        isNegotiable: formData.isNegotiable
      };
      
      console.log("Submitting update:", updateData);
      
      const response = await listingService.updateListing(id, updateData);
      console.log("Update response:", response);
      
      toast.success("Listing updated successfully");
      navigate(`/listings/${id}`);
    } catch (error) {
      console.error("Error updating listing:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to update listing");
    } finally {
      setSubmitting(false);
    }
  };

  const conditionOptions = [
    { value: "new", label: "New" },
    { value: "like_new", label: "Like New" },
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" }
  ];

  const hostelOptions = [
    { value: "BH-1", label: "BH-1" },
    { value: "BH-2", label: "BH-2" },
    { value: "BH-3", label: "BH-3" },
    { value: "GH-1", label: "GH-1" },
    { value: "Off-Campus", label: "Off-Campus" },
    { value: "Other", label: "Other" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listing details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-emerald-600 transition"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Listing</h1>
          <div className="w-20"></div> {/* Spacer */}
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          
          {/* Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g., Mathematics Textbook"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Describe your item in detail..."
              required
            />
          </div>

          {/* Price and Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="number"
                  name="basePrice"
                  value={formData.basePrice}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="500"
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Condition */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condition <span className="text-red-500">*</span>
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            >
              <option value="">Select condition</option>
              {conditionOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-emerald-600" />
              Location Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hostel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hostel
                </label>
                <select
                  name="location.hostel"
                  value={formData.location.hostel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="">Select hostel</option>
                  {hostelOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Room Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Number
                </label>
                <input
                  type="text"
                  name="location.roomNumber"
                  value={formData.location.roomNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., A-201"
                />
              </div>

              {/* Landmark */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  name="location.landmark"
                  value={formData.location.landmark}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g., Near Mess, Ground Floor"
                />
              </div>
            </div>
          </div>

          {/* Negotiable Checkbox */}
          <div className="mb-8">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="isNegotiable"
                checked={formData.isNegotiable}
                onChange={handleChange}
                className="h-5 w-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
              />
              <span className="text-gray-700">Price is negotiable</span>
            </label>
          </div>

          {/* Preview Section */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-3">Preview</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Title:</span>
                <p className="font-medium text-gray-900">{formData.title || 'Not set'}</p>
              </div>
              <div>
                <span className="text-gray-500">Price:</span>
                <p className="font-medium text-gray-900">
                  ₹{formData.basePrice || '0'} {formData.isNegotiable && '(Negotiable)'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Condition:</span>
                <p className="font-medium text-gray-900 capitalize">
                  {formData.condition?.replace('_', ' ') || 'Not set'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Location:</span>
                <p className="font-medium text-gray-900">
                  {formData.location.hostel} {formData.location.roomNumber}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <X className="h-5 w-5" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="h-5 w-5" />
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditListing;