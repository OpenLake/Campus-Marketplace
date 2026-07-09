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
      setCategories(response.data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const fetchListing = async () => {
    try {
      setLoading(true);
      
      const response = await listingService.getListingById(id);
      
      const listing = response.data;
      
      // Check if user is the seller
      const currentUserId = user?._id || user?.user_id || user?.id;
      
      const sellerId = listing.sellerId || listing.seller?.user_id;
      
      if (sellerId !== currentUserId) {
        console.error("❌ Permission denied - User is not the seller");
        toast.error("You don't have permission to edit this listing");
        navigate("/my-listings");
        return;
      }
      
      // Map the listing data to form fields
      
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
      
      
      const response = await listingService.updateListing(id, updateData);
      
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981] mx-auto mb-4"></div>
          <p className="text-gray-400">Loading listing details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page animate-[fadeIn_0.2s_ease]">
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-400 hover:text-[#10b981] transition-colors text-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5" />
          Back to Listings
        </button>
      </div>

      <div className="panel max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Mathematics Textbook"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe your item in detail..."
              required
            />
          </div>

          {/* Price and Category Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="basePrice"
                value={formData.basePrice}
                onChange={handleChange}
                min="0"
                step="1"
                placeholder="500"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
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
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Condition <span className="text-red-500">*</span>
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
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
          <div className="pt-4 border-t border-[#232c38]">
            <h3 className="text-md font-semibold text-gray-200 mb-3">Location Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hostel */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Hostel
                </label>
                <select
                  name="location.hostel"
                  value={formData.location.hostel}
                  onChange={handleChange}
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
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Room Number
                </label>
                <input
                  type="text"
                  name="location.roomNumber"
                  value={formData.location.roomNumber}
                  onChange={handleChange}
                  placeholder="e.g., A-201"
                />
              </div>

              {/* Landmark */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  name="location.landmark"
                  value={formData.location.landmark}
                  onChange={handleChange}
                  placeholder="e.g., Near Mess, Ground Floor"
                />
              </div>
            </div>
          </div>

          {/* Negotiable Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isNegotiable"
              name="isNegotiable"
              checked={formData.isNegotiable}
              onChange={handleChange}
              className="h-4 w-4 text-[#10b981] border-[#232c38] bg-[#0d1218] rounded focus:ring-0"
              style={{ width: 'auto', background: 'transparent' }}
            />
            <label htmlFor="isNegotiable" className="ml-2 block text-sm text-gray-300 font-medium">
              Price is negotiable
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t border-[#232c38]">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-surface flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-brand flex-1 flex items-center justify-center gap-2"
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