import api from "./api";
 
/**
 * Listing Service
 * Handles all listing-related API calls
 */
const listingService = {
  /**
   * Get all listings with filters
   * @param {Object} params - Query parameters
   * @returns {Promise} Paginated listings
   */
  getAllListings: async (params = {}) => {
    try {
      const response = await api.get("/listings", { params });
      console.log("API Response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Listing Service Error:", error);
      throw error;
    }
  },

  /**
   * Alias for getAllListings
   */
  getListings: async (params = {}) => {
    return listingService.getAllListings(params);
  },

  /**
   * Get single listing by ID
   * @param {string} id - Listing ID
   * @returns {Promise} Listing details
   */
    getListingById: async (id) => {
    try {
      const response = await api.get(`/listings/${id}`);
      // Transform response if needed
      return response.data;
    } catch (error) {
      console.error("Error fetching listing:", error);
      throw error;
    }
  },

  /**
   * Get user's listings
   * @param {string} userId - User ID
   * @param {Object} params - Query parameters
   * @returns {Promise} User's listings
   */
  getUserListings: async (userId, params = {}) => {
    try {
      const response = await api.get(`/listings/user/${userId}`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching user listings:", error);
      throw error;
    }
  },

  /**
   * Get my listings (for authenticated user)
   * @param {number} page - Page number
   * @param {string} status - Status filter (active/sold/inactive)
   * @returns {Promise} My listings
   */
  getMyListings: async (page = 1, status = 'active') => {
    try {
      
      const response = await api.get(`/listings/my-listings?page=${page}&status=${status}`);
      console.log("My listings response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching my listings:", error);
      throw error;
    }
  },

  /**
   * Search listings
   * @param {string} query - Search query
   * @param {Object} params - Additional parameters
   * @returns {Promise} Search results
   */
  searchListings: async (query, params = {}) => {
    try {
      const response = await api.get("/listings/search", {
        params: { q: query, ...params },
      });
      return response.data;
    } catch (error) {
      console.error("Error searching listings:", error);
      throw error;
    }
  },

  /**
   * Upload images
   * @param {FormData} formData - Form data with images
   * @returns {Promise} Upload response
   */
  uploadImage: async (formData) => {
    try {
      const response = await api.post("/listings/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  },

  /**
   * Create new listing
   * @param {Object} listingData - Listing data
   * @returns {Promise} Created listing
   */
  // In listingService.js
createListing: async (listingData) => {
  try {
    console.log("Original listing data:", listingData);
    
    // Process images to ensure correct format
    let processedImages = [];
    
    if (listingData.images && listingData.images.length > 0) {
      processedImages = listingData.images.map((img, index) => {
        // If it's a File object with blob URL
        if (img instanceof File) {
          return {
            url: URL.createObjectURL(img), // Create blob URL
            publicId: `temp_${Date.now()}_${index}`,
            isCover: index === 0
          };
        }
        // If it already has url property
        else if (img.url) {
          return {
            url: img.url,
            publicId: img.publicId || `temp_${Date.now()}_${index}`,
            isCover: index === 0
          };
        }
        // If it's just a URL string
        else if (typeof img === 'string') {
          return {
            url: img,
            publicId: `temp_${Date.now()}_${index}`,
            isCover: index === 0
          };
        }
        return img;
      });
    }

    // Prepare payload with correct field names
    const payload = {
      title: listingData.title,
      description: listingData.description,
      basePrice: Number(listingData.price || listingData.basePrice),
      condition: listingData.condition,
      category: listingData.category,
      images: processedImages,
      location: listingData.location || {
        hostel: listingData.hostel,
        roomNumber: listingData.roomNumber,
        landmark: listingData.landmark
      }
    };

    console.log("Sending to API:", payload);
    
    const token = localStorage.getItem('accessToken');
    const response = await api.post("/listings", payload, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log("API Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Create listing error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error.response?.data || error;
  }
},

  /**
   * Update listing
   * @param {string} id - Listing ID
   * @param {Object} updateData - Update data
   * @returns {Promise} Updated listing
   */
  updateListing: async (id, updateData) => {
    try {
      const response = await api.put(`/listings/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error("Error updating listing:", error);
      throw error;
    }
  },

  /**
   * Delete listing
   * @param {string} id - Listing ID
   * @returns {Promise} Deletion confirmation
   */
  deleteListing: async (id) => {
    try {
      const response = await api.delete(`/listings/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting listing:", error);
      throw error;
    }
  },

  /**
   * Get listing categories with stats
   * @returns {Promise} Categories with counts
   */
   getCategories: async () => {
    try {
      const response = await api.get("/listings/categories");
      console.log("Categories:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },
 getListingWithInterestStatus: async (id) => {
    try {
      const response = await api.get(`/listings/${id}?includeInterest=true`);
      return response.data;
    } catch (error) {
      console.error("Error fetching listing with interest:", error);
      throw error;
    }
  },
  /**
   * Toggle listing active status
   * @param {string} id - Listing ID
   * @returns {Promise} Updated listing
   */
  toggleActive: async (id) => {
    try {
      const response = await api.patch(`/listings/${id}/toggle-active`);
      console.log("Toggle active response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error toggling listing:", error);
      throw error;
    }
  },

  /**
   * Get listing stats for seller dashboard
   * @returns {Promise} Stats
   */
  getStats: async () => {
    try {
      const response = await api.get("/listings/stats");
      console.log("Stats response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching stats:", error);
      throw error;
    }
  },

  /**
   * Get listing by ID for edit
   * @param {string} id - Listing ID
   * @returns {Promise} Listing details
   */
  getListingForEdit: async (id) => {
    try {
      const response = await api.get(`/listings/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching listing for edit:", error);
      throw error;
    }
  },

  /**
   * Delete image from listing
   * @param {string} listingId - Listing ID
   * @param {string} imageUrl - Image URL to delete
   * @returns {Promise} Deletion response
   */
  deleteListingImage: async (listingId, imageUrl) => {
    try {
      const response = await api.delete(`/listings/${listingId}/images`, {
        data: { imageUrl },
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  },

  /**
   * Get price history for a listing
   * @param {string} listingId - Listing ID
   * @returns {Promise} Price history
   */
  getPriceHistory: async (listingId) => {
    try {
      const response = await api.get(`/listings/${listingId}/price-history`);
      return response.data;
    } catch (error) {
      console.error("Error fetching price history:", error);
      throw error;
    }
  },

  /**
   * Mark listing as sold
   * @param {string} id - Listing ID
   * @returns {Promise} Updated listing
   */
  markAsSold: async (id) => {
    try {
      const response = await api.patch(`/listings/${id}/sold`);
      return response.data;
    } catch (error) {
      console.error("Error marking as sold:", error);
      throw error;
    }
  },
  async expressInterest(data) {
  try {
    const response = await api.post("/orders/st/interest", data);
    return response.data;
  } catch (error) {
    console.error("Error expressing interest:", error);
    throw error.response?.data || error;
  }
}
};

export default listingService;