import api from "./api";

class ListingService {
  // Get all listings with filters
  async getListings(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value);
        }
      });

      const response = await api.get(`/listings?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching listings:", error);
      throw error;
    }
  }

  // Get single listing by ID
  async getListingById(id) {
    try {
      const response = await api.get(`/listings/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching listing:", error);
      throw error;
    }
  }

  // Get listings by seller
  async getSellerListings(sellerId, page = 1) {
    try {
      const response = await api.get(`/listings/seller/${sellerId}?page=${page}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching seller listings:", error);
      throw error;
    }
  }

  // Get categories with stats
  async getCategories() {
    try {
      const response = await api.get("/listings/categories");
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }
}

export default new ListingService();