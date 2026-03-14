import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, DollarSign, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import listingService from "../../services/listingService";

const AddProduct = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    condition: "good",
    location: {
      hostel: "",
      roomNumber: "",
      landmark: ""
    },
    isNegotiable: false,
    images: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);

const [categories, setCategories] = useState([]);

useEffect(() => {
  const fetchCategories = async () => {
    try {
      // Assuming you have a getCategories method in your service
      const response = await listingService.getCategories(); 
      // Map the backend data to your label/value format
      const formatted = response.data.map(cat => ({
        value: cat._id,
        label: cat.name
      }));
      setCategories(formatted);
    } catch (err) {
      toast.error("Failed to load categories");
    }
  };
  fetchCategories();
}, []);

  const conditions = [
    { value: "new", label: "New (Never used)" },
    { value: "like-new", label: "Like New (Used but perfect)" },
    { value: "good", label: "Good (Minor wear)" },
    { value: "fair", label: "Fair (Visible wear)" },
    { value: "poor", label: "Poor (Functional but beat up)" }
  ];

  const hostels = [
    { value: "BH-1", label: "BH-1" },
    { value: "BH-2", label: "BH-2" },
    { value: "BH-3", label: "BH-3" },
    { value: "GH-1", label: "GH-1" },
    { value: "Off-Campus", label: "Off-Campus" },
    { value: "Other", label: "Other" }
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please login to add products");
      navigate("/login", { state: { from: "/products/add" } });
    }
  }, [isAuthenticated, navigate]);

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      imagePreviews.forEach(preview => {
        if (preview.startsWith('blob:')) {
          URL.revokeObjectURL(preview);
        }
      });
    };
  }, [imagePreviews]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested fields (location.hostel, etc.)
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
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    // Validate file types and size
    const validFiles = [];
    const uploadErrors = [];
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        uploadErrors.push(`${file.name} is not an image`);
        continue;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        uploadErrors.push(`${file.name} is too large (max 5MB)`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    if (uploadErrors.length > 0) {
      uploadErrors.forEach(error => toast.error(error));
    }
    
    if (validFiles.length === 0) return;
    
    // Check total images limit
    if (formData.images.length + validFiles.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }
    
    try {
      setUploadProgress(0);
      
      // Process each file
      const newImages = [];
      const newPreviews = [];
      
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        
        // Create object URL for preview
        const previewUrl = URL.createObjectURL(file);
        
        // Store file and preview
        newImages.push({
          file,
          preview: previewUrl,
          url: previewUrl // Temporary URL for display
        });
        
        newPreviews.push(previewUrl);
        
        // Update progress
        setUploadProgress(Math.round(((i + 1) / validFiles.length) * 100));
      }
      
      // Update state with new images
      setImagePreviews(prev => [...prev, ...newPreviews]);
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
      
      setUploadProgress(100);
      setTimeout(() => setUploadProgress(0), 1000);
      
    } catch (error) {
      toast.error("Failed to process images");
      console.error("Upload error:", error);
    }
  };

  const removeImage = (index) => {
    // Revoke object URL to prevent memory leaks
    const imageToRemove = formData.images[index];
    if (imageToRemove?.preview && imageToRemove.preview.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 5) {
      newErrors.title = "Title must be at least 5 characters";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title cannot exceed 100 characters";
    }
    
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 20) {
      newErrors.description = "Description must be at least 20 characters";
    } else if (formData.description.length > 2000) {
      newErrors.description = "Description cannot exceed 2000 characters";
    }
    
    if (!formData.price) {
      newErrors.price = "Price is required";
    } else if (isNaN(formData.price) || Number(formData.price) <= 0) {
      newErrors.price = "Price must be a positive number";
    } else if (Number(formData.price) > 1000000) {
      newErrors.price = "Price cannot exceed ₹10,00,000";
    }
    
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    
    if (!formData.location.hostel) {
      newErrors['location.hostel'] = "Hostel is required";
    }
    
    if (formData.images.length === 0) {
      newErrors.images = "At least one image is required";
    }
    
    return newErrors;
  };

  const prepareImagesForSubmission = () => {
    return formData.images.map((img, index) => {
      // If it's a new file upload
      if (img.file) {
        return {
          // For now, we'll use the preview URL and generate a temp publicId
          // In production, you'd upload to Cloudinary first
          url: img.preview,
          publicId: `temp_${Date.now()}_${index}`,
          isCover: index === 0
        };
      }
      // If it's an existing image with URL (for edit mode)
      else if (img.url) {
        return {
          url: img.url,
          publicId: img.publicId || `existing_${index}`,
          isCover: index === 0
        };
      }
      return img;
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const newErrors = validateForm();
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return;
  }

  try {
    setIsSubmitting(true);
    
    // Ensure we send exactly what the backend 'listingData' object expects
    const listingPayload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      basePrice: Number(formData.price),
      condition: formData.condition,
      category: formData.category, // MUST be a 24-char MongoDB ID
      images: formData.images.map((img, idx) => ({
        url: img.preview, // The backend "Temp Fix" accepts this
        publicId: `temp_${Date.now()}_${idx}`,
        isCover: idx === 0
      })),
      location: {
        hostel: formData.location.hostel,
        roomNumber: formData.location.roomNumber || "",
        landmark: formData.location.landmark || ""
      }
    };

    const result = await listingService.createListing(listingPayload);
    toast.success("Product added successfully!");
    navigate('/my-listings');
  } catch (error) {
    // Log the actual error response from the server
    console.error("Backend Error:", error.response?.data);
    toast.error(error.response?.data?.message || "Failed to add product");
  } finally {
    setIsSubmitting(false);
  }
};

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Add New Product</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
              errors.title ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="e.g., Mathematics Textbook for B.Tech"
            maxLength={100}
          />
          <div className="flex justify-between mt-1">
            {errors.title ? (
              <p className="text-sm text-red-600">{errors.title}</p>
            ) : (
              <p className="text-sm text-gray-500">
                {formData.title.length}/100 characters
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            rows={5}
            value={formData.description}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Describe your product in detail... (minimum 20 characters)"
            maxLength={2000}
          />
          <div className="flex justify-between mt-1">
            {errors.description ? (
              <p className="text-sm text-red-600">{errors.description}</p>
            ) : (
              <p className="text-sm text-gray-500">
                {formData.description.length}/2000 characters
              </p>
            )}
          </div>
        </div>

        {/* Price and Category Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Price */}
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price (₹) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                max="1000000"
                step="1"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.price ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="0"
              />
            </div>
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.category ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>
        </div>

        {/* Condition */}
        <div>
          <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
            Condition *
          </label>
          <select
            id="condition"
            name="condition"
            value={formData.condition}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            {conditions.map((cond) => (
              <option key={cond.value} value={cond.value}>
                {cond.label}
              </option>
            ))}
          </select>
        </div>

        {/* Location Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Location Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="location.hostel" className="block text-sm font-medium text-gray-700 mb-1">
                Hostel *
              </label>
              <select
                id="location.hostel"
                name="location.hostel"
                value={formData.location.hostel}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors['location.hostel'] ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Select hostel</option>
                {hostels.map((hostel) => (
                  <option key={hostel.value} value={hostel.value}>
                    {hostel.label}
                  </option>
                ))}
              </select>
              {errors['location.hostel'] && (
                <p className="mt-1 text-sm text-red-600">{errors['location.hostel']}</p>
              )}
            </div>

            <div>
              <label htmlFor="location.roomNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Room Number
              </label>
              <input
                type="text"
                id="location.roomNumber"
                name="location.roomNumber"
                value={formData.location.roomNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="e.g., A-201"
              />
            </div>
          </div>

          {/* Landmark */}
          <div className="mt-4">
            <label htmlFor="location.landmark" className="block text-sm font-medium text-gray-700 mb-1">
              Landmark (Optional)
            </label>
            <input
              type="text"
              id="location.landmark"
              name="location.landmark"
              value={formData.location.landmark}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g., Near the mess, Ground floor"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="border-t pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Images * ({formData.images.length}/10)
          </label>
          
          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-emerald-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1">Processing: {uploadProgress}%</p>
            </div>
          )}
          
          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 bg-emerald-600 text-white text-xs px-2 py-1 rounded">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upload Button */}
          {formData.images.length < 10 && (
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, JPEG (Max 5MB each)
                  </p>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  multiple
                  onChange={handleImageUpload}
                />
              </label>
            </div>
          )}
          {errors.images && (
            <p className="mt-1 text-sm text-red-600">{errors.images}</p>
          )}
        </div>

        {/* Negotiable Checkbox */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isNegotiable"
            name="isNegotiable"
            checked={formData.isNegotiable}
            onChange={handleChange}
            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
          />
          <label htmlFor="isNegotiable" className="ml-2 block text-sm text-gray-700">
            Price is negotiable
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition ${
            isSubmitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Listing...
            </span>
          ) : (
            "List Product"
          )}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;