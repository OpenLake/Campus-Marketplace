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
          className="w-full border-2 border-black rounded-full"
        >
          <FilterIcon className="h-4 w-4 mr-2" />
          Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </Button>
      </div>

      {/* Filter Panel */}
      <div className={cn("lg:block", isOpen ? "block" : "hidden", className)}>
        {/* brutalist sidebar style */}
        <div className="w-[260px] flex-shrink-0 border-[1.5px] border-gray-100 rounded-lg p-6 bg-white">
          
          {/* Header */}
          <div className="text-[20px] font-extrabold mb-5 flex justify-between items-center">
            Filters
            {activeFiltersCount > 0 ? (
              <button
                onClick={onClearFilters}
                className="text-xs text-gray-500 hover:text-black uppercase tracking-wider font-bold"
              >
                Clear
              </button>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="10" y1="18" x2="14" y2="18"/>
              </svg>
            )}
          </div>

          {/* Category Filter */}
          <div className="border-t border-gray-100 py-5">
            <h4 className="font-bold text-[15px] mb-3.5 flex justify-between">Category <span>^</span></h4>
            <ul className="list-none space-y-2">
              <li 
                className={cn("flex justify-between items-center py-1 text-[14px] cursor-pointer transition-colors", !filters.category ? "text-black font-bold" : "text-gray-600 hover:text-black")}
                onClick={() => handleCategoryChange("")}
              >
                All Categories <span className="text-[12px]">›</span>
              </li>
              {categories.map((category) => (
                <li 
                  key={category._id} 
                  className={cn("flex justify-between items-center py-1 text-[14px] cursor-pointer transition-colors", filters.category === category._id ? "text-black font-bold" : "text-gray-600 hover:text-black")}
                  onClick={() => handleCategoryChange(category._id)}
                >
                  {category.name} <span className="text-[12px]">›</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Range Filter */}
          <div className="border-t border-gray-100 py-5">
            <h4 className="font-bold text-[15px] mb-3.5 flex justify-between">Price <span>^</span></h4>
            <div className="my-4">
              <input 
                type="range" 
                min="0" 
                max="50000" 
                value={filters.maxPrice || 50000}
                onChange={(e) => handlePriceChange("maxPrice", e.target.value)}
                className="w-full accent-black" 
              />
            </div>
            <div className="flex justify-between text-[13px] color-gray-600 mt-1.5 font-medium">
              <span>₹0</span>
              <span>₹{filters.maxPrice || 50000}</span>
            </div>
          </div>

          {/* Condition Filter */}
          <div className="border-t border-gray-100 py-5">
            <h4 className="font-bold text-[15px] mb-3.5 flex justify-between">Condition <span>^</span></h4>
            <div className="flex flex-wrap gap-2 mt-1">
              {conditionOptions.map((option) => {
                const isActive = (filters.condition || []).includes(option.value);
                return (
                  <div 
                    key={option.value}
                    onClick={() => handleConditionChange(option.value)}
                    className={cn(
                      "px-4 py-2 rounded-full border-[1.5px] text-[13px] cursor-pointer transition-colors duration-150 font-medium capitalize",
                      isActive 
                        ? "bg-black text-white border-black" 
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-black hover:text-white hover:border-black"
                    )}
                  >
                    {option.label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Location Filter */}
          <div className="border-t border-gray-100 py-5">
            <h4 className="font-bold text-[15px] mb-3.5 flex justify-between">Location <span>^</span></h4>
            <ul className="list-none space-y-2">
              <li 
                className={cn("flex justify-between items-center py-1 text-[14px] cursor-pointer transition-colors", !filters.location ? "text-black font-bold" : "text-gray-600 hover:text-black")}
                onClick={() => handleLocationChange("")}
              >
                All Locations <span className="text-[12px]">›</span>
              </li>
              {locationOptions.map((option) => (
                <li 
                  key={option.value} 
                  className={cn("flex justify-between items-center py-1 text-[14px] cursor-pointer transition-colors", filters.location === option.value ? "text-black font-bold" : "text-gray-600 hover:text-black")}
                  onClick={() => handleLocationChange(option.value)}
                >
                  {option.label} <span className="text-[12px]">›</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Close Button (Mobile) */}
          <div className="lg:hidden pt-4 border-t border-gray-100">
            <Button
              onClick={() => setIsOpen(false)}
              className="w-full bg-black text-white rounded-full font-bold"
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
