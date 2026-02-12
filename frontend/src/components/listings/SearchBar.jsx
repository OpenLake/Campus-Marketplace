import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * SearchBar Component
 * Search input with debouncing and clear functionality
 */
const SearchBar = ({
  value,
  onChange,
  placeholder = "Search listings...",
  className,
}) => {
  const [localValue, setLocalValue] = useState(value || "");
  const timeoutRef = useRef(null);

  // Sync with external value
  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  // Debounced search
  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, 300);
  };

  // Clear search
  const handleClear = () => {
    setLocalValue("");
    onChange("");
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={cn("relative", className)}>
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>

      {/* Input */}
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
      />

      {/* Clear Button */}
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Clear search"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
