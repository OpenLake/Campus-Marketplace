import { useListings } from "../../hooks/useListings.js";
import ListingGrid from "./ListingGrid.jsx";
import ListingFilters from "./LisitingFilters.jsx";
import SearchBar from "./SearchBar.jsx";
import SortDropdown from "./SortDropdown.jsx";
import Pagination from "../ui/Pagination.jsx";
import { SlidersHorizontal } from "lucide-react";

/**
 * BrowseListings Page
 * Main page for browsing and filtering listings
 */
const BrowseListings = () => {
  const {
    listings,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    clearFilters,
    changePage,
    changeItemsPerPage,
  } = useListings();

  return (
    <div className="container py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Browse Listings
        </h1>
        <p className="text-gray-600">
          Discover amazing deals from your fellow students
        </p>
      </div>

      {/* Search & Sort Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <SearchBar
            value={filters.search}
            onChange={(value) => updateFilters({ search: value })}
            placeholder="Search listings by title, description..."
          />
        </div>
        <div className="sm:w-64">
          <SortDropdown
            value={filters.sortBy}
            onChange={(value) => updateFilters({ sortBy: value })}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <ListingFilters
            filters={filters}
            onFilterChange={updateFilters}
            onClearFilters={clearFilters}
          />
        </aside>

        {/* Listings Grid */}
        <main className="flex-1">
          {/* Active Filters Summary */}
          {(filters.category ||
            filters.condition?.length > 0 ||
            filters.location ||
            filters.minPrice ||
            filters.maxPrice) && (
            <div className="mb-6 p-4 bg-primary-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-primary-700">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="font-medium">
                  {listings.length}{" "}
                  {listings.length === 1 ? "listing" : "listings"} found
                </span>
              </div>
              <button
                onClick={clearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Listings Grid */}
          <ListingGrid listings={listings} loading={loading} error={error} />

          {/* Pagination */}
          {!loading && !error && listings.length > 0 && (
            <div className="mt-8">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.totalItems}
                itemsPerPage={pagination.itemsPerPage}
                onPageChange={changePage}
                onItemsPerPageChange={changeItemsPerPage}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BrowseListings;
