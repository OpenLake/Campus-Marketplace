import api from "./api.js";

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
   * Get single listing by ID
   * @param {string} id - Listing ID
   * @returns {Promise} Listing details
   */
  getListingById: async (id) => {
    const response = await api.get(`/listings/${id}`);
    return response.data;
  },

  /**
   * Get user's listings
   * @param {string} userId - User ID
   * @param {Object} params - Query parameters
   * @returns {Promise} User's listings
   */
  getUserListings: async (userId, params = {}) => {
    const response = await api.get(`/listings/user/${userId}`, { params });
    return response.data;
  },

  /**
   * Search listings
   * @param {string} query - Search query
   * @param {Object} params - Additional parameters
   * @returns {Promise} Search results
   */
  searchListings: async (query, params = {}) => {
    const response = await api.get("/listings/search", {
      params: { q: query, ...params },
    });
    return response.data;
  },
  /**
   * Upload images
   */
  uploadImage: async (formData) => {
    return api.post("/listings/upload-image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  /**
   * Create new listing
   * @param {Object} listingData - Listing data
   * @returns {Promise} Created listing
   */
  createListing: async (listingData) => {
    const response = await api.post("/listings", listingData);
    return response.data;
  },

  /**
   * Update listing
   * @param {string} id - Listing ID
   * @param {Object} updateData - Update data
   * @returns {Promise} Updated listing
   */
  updateListing: async (id, updateData) => {
    const response = await api.put(`/listings/${id}`, updateData);
    return response.data;
  },

  /**
   * Delete listing
   * @param {string} id - Listing ID
   * @returns {Promise} Deletion confirmation
   */
  deleteListing: async (id) => {
    const response = await api.delete(`/listings/${id}`);
    return response.data;
  },

  /**
   * Get listing categories
   * @returns {Promise} Available categories
   */
  getCategories: async () => {
    const response = await api.get("/listings/categories");
    return response.data;
  },

  /**
   * Mark listing as sold
   * @param {string} id - Listing ID
   * @returns {Promise} Updated listing
   */
  markAsSold: async (id) => {
    const response = await api.put(`/listings/${id}/sold`);
    return response.data;
  },
  /**
   * Get listing by ID for edit
   * @param {string} id - Listing ID
   * @returns {Promise} Listing details
   */
  getListingForEdit: async(id)=>{
    return api.get(`/listings/${id}`);
  },

  /**
   * Delete image from listing
   */
  deleteListingImage: async (listingId, imageUrl) => {
    return api.delete(`/listings/${listingId}/images`, {
      data: { imageUrl },
    });
  },
  /**
   * Get price history for a listing
   */
  getPriceHistory: async (listingId) => {
    return api.get(`/listings/${listingId}/price-history`);
  },

};

export default listingService;
