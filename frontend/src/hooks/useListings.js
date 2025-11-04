import { useState, useEffect, useCallback } from "react";
import listingService from "../services/lisitingService.js";
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
        sortBy: filters.sortBy,
      };

      // Add filters if they exist
      if (filters.category) params.category = filters.category;
      if (filters.condition.length > 0)
        params.condition = filters.condition.join(",");
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.location) params.location = filters.location;
      if (filters.search) params.search = filters.search;

      const response = await listingService.getAllListings(params);

      setListings(response.data.docs || response.data);
      setPagination({
        currentPage: response.data.page || 1,
        totalPages: response.data.totalPages || 1,
        totalItems: response.data.totalDocs || response.data.length,
        itemsPerPage: response.data.limit || 12,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch listings");
      toast.error("Failed to load listings");
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
