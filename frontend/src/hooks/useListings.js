import { useState, useEffect, useCallback } from "react";
import listingService from "../services/listingService.js";
import toast from "react-hot-toast";

/**
 * Custom hook for managing listings
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} Listings data and methods
 */
export const useListings = (initialFilters = {}) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  });
  const [filters, setFilters] = useState({
    category: "",
    condition: [],
    minPrice: "",
    maxPrice: "",
    location: "",
    sortBy: "newest",
    search: "",
    ...initialFilters,
  });

  /**
   * Fetch listings based on current filters
   */
  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        sort: filters.sortBy,
      };

      // Add filters if they exist
      if (filters.category) params.category = filters.category;
      if (filters.condition.length > 0)
        params.condition = filters.condition.join(",");
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.location) params.location = filters.location;
      if (filters.search) params.search = filters.search;

      console.log("Fetching listings with params:", params);

      const response = await listingService.getAllListings(params);

      console.log("Listings response:", response);

      // Handle different response formats from backend
      let listingsData = [];
      let paginationData = {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 12,
      };

      // Check if response has ApiResponse wrapper
      if (response.success && response.data) {
        // If backend returns mongoose-paginate inside ApiResponse
        if (response.data.docs) {
          listingsData = response.data.docs;
          paginationData = {
            currentPage: response.data.page || 1,
            totalPages: response.data.totalPages || 1,
            totalItems: response.data.totalDocs || 0,
            itemsPerPage: response.data.limit || 12,
          };
        }
        // If backend returns simple array
        else if (Array.isArray(response.data)) {
          listingsData = response.data;
          paginationData.totalItems = response.data.length;
        }
      }
      // Fallback: Backend returns mongoose-paginate format directly (old format)
      else if (response.docs) {
        listingsData = response.docs;
        paginationData = {
          currentPage: response.page || 1,
          totalPages: response.totalPages || 1,
          totalItems: response.totalDocs || 0,
          itemsPerPage: response.limit || 12,
        };
      }

      setListings(listingsData);
      setPagination(paginationData);
    } catch (err) {
      console.error("Error fetching listings:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to fetch listings";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.itemsPerPage]);

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, currentPage: 1 })); // Reset to first page
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters({
      category: "",
      condition: [],
      minPrice: "",
      maxPrice: "",
      location: "",
      sortBy: "newest",
      search: "",
    });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  /**
   * Change page
   */
  const changePage = useCallback((page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /**
   * Change items per page
   */
  const changeItemsPerPage = useCallback((itemsPerPage) => {
    setPagination((prev) => ({
      ...prev,
      itemsPerPage,
      currentPage: 1,
    }));
  }, []);

  // Fetch listings when filters or pagination changes
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return {
    listings,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    clearFilters,
    changePage,
    changeItemsPerPage,
    refetch: fetchListings,
  };
};
