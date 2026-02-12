import { useState, useEffect } from "react";
import { X, Filter as FilterIcon } from "lucide-react";
import { cn } from "../../utils/cn.js";
import Input from "../ui/Input.jsx";
import Button from "../ui/Button.jsx";
import listingService from "../../services/listingService.js";

/**
 * ListingFilters Component
 * Sidebar/panel for filtering listings
 */
const ListingFilters = ({
  filters,
  onFilterChange,
  onClearFilters,
  className,
}) => {
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  // Condition options
  const conditionOptions = [
    { value: "new", label: "New" },
    { value: "like-new", label: "Like New" },
    { value: "good", label: "Good" },
    { value: "fair", label: "Fair" },
    { value: "poor", label: "Poor" },
  ];

  // Location options (IIT Bhilai hostels)
  const locationOptions = [
    { value: "Hostel A", label: "Hostel A" },
    { value: "Hostel B", label: "Hostel B" },
    { value: "Hostel C", label: "Hostel C" },
    { value: "Campus", label: "Campus" },
  ];

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await listingService.getCategories();
        setCategories(response.data || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    onFilterChange({ category: categoryId });
  };

  // Handle condition change
  const handleConditionChange = (conditionValue) => {
    const currentConditions = filters.condition || [];
    const newConditions = currentConditions.includes(conditionValue)
      ? currentConditions.filter((c) => c !== conditionValue)
      : [...currentConditions, conditionValue];

    onFilterChange({ condition: newConditions });
  };

  // Handle price change
  const handlePriceChange = (field, value) => {
    onFilterChange({ [field]: value });
  };

  // Handle location change
  const handleLocationChange = (location) => {
    onFilterChange({ location });
  };

  // Count active filters
  const activeFiltersCount =
    (filters.category ? 1 : 0) +
    (filters.condition?.length || 0) +
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    (filters.location ? 1 : 0);

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          variant="outline"
          className="w-full"
        >
          <FilterIcon className="h-4 w-4 mr-2" />
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </Button>
      </div>

      {/* Filter Panel */}
      <div className={cn("lg:block", isOpen ? "block" : "hidden", className)}>
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={onClearFilters}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Category
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="category"
                  checked={!filters.category}
                  onChange={() => handleCategoryChange("")}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  All Categories
                </span>
              </label>
              {categories.map((category) => (
                <label key={category._id} className="flex items-center">
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === category._id}
                    onChange={() => handleCategoryChange(category._id)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {category.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Condition Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Condition
            </label>
            <div className="space-y-2">
              {conditionOptions.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(filters.condition || []).includes(option.value)}
                    onChange={() => handleConditionChange(option.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700 capitalize">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Price Range
            </label>
            <div className="space-y-3">
              <Input
                type="number"
                placeholder="Min Price"
                value={filters.minPrice || ""}
                onChange={(e) => handlePriceChange("minPrice", e.target.value)}
                min="0"
              />
              <Input
                type="number"
                placeholder="Max Price"
                value={filters.maxPrice || ""}
                onChange={(e) => handlePriceChange("maxPrice", e.target.value)}
                min="0"
              />
            </div>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Location
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="location"
                  checked={!filters.location}
                  onChange={() => handleLocationChange("")}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  All Locations
                </span>
              </label>
              {locationOptions.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="location"
                    checked={filters.location === option.value}
                    onChange={() => handleLocationChange(option.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Close Button (Mobile) */}
          <div className="lg:hidden pt-4 border-t">
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              className="w-full"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ListingFilters;
