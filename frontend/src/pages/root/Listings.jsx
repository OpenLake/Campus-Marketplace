import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  Filter, 
  Star, 
  Plus, 
  BookOpen, 
  Bike, 
  Cpu, 
  Shirt, 
  Home as HomeIcon,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Search,
  Eye,
  Heart,
  Loader
} from 'lucide-react';
import DoubleSlider from '../../components/ui/DoubleSlider';
import listingService from '../../services/listingService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ListingPage = () => {
  const navigate = useNavigate();
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedConditions, setSelectedConditions] = useState([]);
  const [totalListings, setTotalListings] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const itemsPerPage = 6;

  // Fetch real listings from API
  useEffect(() => {
    fetchListings();
  }, [currentPage, selectedCategory, priceRange, selectedConditions, sortBy, sortOrder]);

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      
      // Build filters
      const filters = {
        page: currentPage,
        limit: itemsPerPage,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
        sortBy,
        sortOrder
      };
      
      if (selectedCategory) {
        filters.category = selectedCategory;
      }
      
      if (searchQuery) {
        filters.search = searchQuery;
      }
      
      if (selectedConditions.length > 0) {
        filters.condition = selectedConditions.join(',');
      }
      
      
      const response = await listingService.getAllListings(filters);
      
      setListings(response.data.listings || []);
      setTotalListings(response.data.pagination?.total || 0);
      
    } catch (error) {
      console.error("Error fetching listings:", error);
      toast.error("Failed to load listings");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await listingService.getCategories();
      
      // Transform API categories to match your UI format
      const categoryIcons = {
        'books': <BookOpen size={18} />,
        'cycles': <Bike size={18} />,
        'electronics': <Cpu size={18} />,
        'clothing': <Shirt size={18} />,
        'furniture': <HomeIcon size={18} />,
        'others': <LayoutGrid size={18} />
      };
      
      // FIX: Handle different category data structures
      let categoryData = [];
      if (Array.isArray(response.data)) {
        categoryData = response.data;
      } else if (response.data?.categories) {
        categoryData = response.data.categories;
      }
      
      const formattedCategories = categoryData.map(cat => ({
        // FIX: Get name properly - could be cat.name or cat._id
        name: cat.name || cat._id,
        // FIX: Get count properly
        count: cat.count || cat.listingCount || 0,
        // FIX: Get icon with fallback
        icon: categoryIcons[cat._id?.toLowerCase()] || <LayoutGrid size={18} />
      }));
      
      setCategories(formattedCategories);
      
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchListings();
  };

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(categoryName.toLowerCase());
    setCurrentPage(1);
  };

  const handleConditionChange = (condition) => {
    setSelectedConditions(prev => {
      if (prev.includes(condition)) {
        return prev.filter(c => c !== condition);
      } else {
        return [...prev, condition];
      }
    });
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchListings();
  };

  const handleSortChange = (value) => {
    const [newSortBy, newSortOrder] = value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };

  const handleViewListing = (listingId) => {
    navigate(`/listings/${listingId}`);
  };

  const getConditionColor = (condition) => {
    const colors = {
      'new': 'bg-green-100 text-green-800',
      'like-new': 'bg-emerald-100 text-emerald-800',
      'good': 'bg-blue-100 text-blue-800',
      'fair': 'bg-yellow-100 text-yellow-800',
      'poor': 'bg-red-100 text-red-800'
    };
    return colors[condition] || 'bg-gray-100 text-gray-800';
  };

  // FIX: Add this missing function
  const getTagFromPrice = (price) => {
    if (price < 500) return { text: 'Budget', color: 'bg-green-500' };
    if (price < 2000) return { text: 'Value', color: 'bg-blue-500' };
    if (price < 5000) return { text: 'Premium', color: 'bg-purple-500' };
    return { text: 'Luxury', color: 'bg-orange-500' };
  };

  const totalPages = Math.ceil(totalListings / itemsPerPage);

  // Loading state
  if (loading && listings.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading amazing deals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f8f9fa] dark:bg-gray-950 min-h-screen font-sans text-gray-900 dark:text-gray-100 pb-20 transition-colors">
      
      {/* HEADER SECTION */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 mb-8 transition-colors">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span className="cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400">Home</span>
            <ChevronRight size={14} />
            <span className="text-gray-900 dark:text-gray-100 font-medium">Listings</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">
            {selectedCategory === 'all' 
              ? 'All Campus Listings' 
              : `${categories.find(c => c.name.toLowerCase() === selectedCategory)?.name || 'Category'} Listings`}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Showing {listings.length} items from your campus community</p>
        </div>
      </div>

      <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-10">
        
        {/* SIDEBAR FILTERS */}
        <aside className="w-full lg:w-[260px] flex-shrink-0 border-[1.5px] border-gray-200 dark:border-gray-800 p-5 bg-white dark:bg-gray-900 h-fit transition-colors rounded-2xl">
          <div className="flex justify-between items-center text-[20px] font-bold pb-5 border-b-[1.5px] border-gray-200 dark:border-gray-800 mb-6 text-gray-900 dark:text-gray-100">
            Filters
            <Filter size={18} className="text-gray-400 dark:text-gray-500" />
          </div>

          <div className="mb-6 pb-6 border-b-[1.5px] border-gray-200 dark:border-gray-800">
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li 
                  key={cat.name} 
                  onClick={() => handleCategoryClick(cat.name)}
                  className={`flex justify-between items-center font-medium cursor-pointer transition-colors ${
                    selectedCategory === cat.name.toLowerCase() ? 'text-emerald-600 dark:text-emerald-500' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <span className="text-[15px]">{cat.name}</span>
                  <span className="text-lg leading-none text-gray-400 dark:text-gray-600">›</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-6 pb-6 border-b-[1.5px] border-gray-200 dark:border-gray-800">
            <h4 className="flex justify-between items-center text-[16px] font-bold mb-4 text-gray-900 dark:text-gray-100">
              Price <span className="text-xs">^</span>
            </h4>
            <DoubleSlider
              min={0}
              max={10000}
              step={100}
              value={priceRange}
              onChange={setPriceRange}
            />
            <div className="flex justify-between text-sm font-bold text-gray-500 dark:text-gray-400 mt-4">
              <span>₹{priceRange[0]}</span>
              <span>₹{priceRange[1]}</span>
            </div>
          </div>

          <div className="mb-6 pb-6 border-b-[1.5px] border-gray-200 dark:border-gray-800">
            <h4 className="flex justify-between items-center text-[16px] font-bold mb-4 text-gray-900 dark:text-gray-100">
              Condition <span className="text-xs">^</span>
            </h4>
            <div className="space-y-3">
              {['New', 'Like New', 'Good', 'Fair', 'Poor'].map((cond) => (
                <label key={cond} className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={selectedConditions.includes(cond.toLowerCase())}
                    onChange={() => handleConditionChange(cond.toLowerCase())}
                    className="w-4 h-4 border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-emerald-500 focus:ring-emerald-500" 
                  />
                  <span className={`text-[15px] font-medium transition-colors ${
                     selectedConditions.includes(cond.toLowerCase()) ? 'text-emerald-600 dark:text-emerald-500' : 'text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'
                  }`}>{cond}</span>
                </label>
              ))}
            </div>
          </div>
          
          <button 
            onClick={handleApplyFilters}
            className="w-full bg-emerald-600 text-white py-[14px] font-bold text-[15px] hover:bg-emerald-700 transition-colors"
          >
            Apply Filter
          </button>
        </aside>

        {/* MAIN LISTING CONTENT */}
        <main className="flex-1">
          {/* Search Bar */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800 mb-8 transition-colors">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search for books, cycles, electronics, clothing..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-0 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-700 dark:text-gray-200 font-medium"
                />
              </div>
              <button 
                onClick={handleSearch}
                className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center gap-2"
              >
                <Search size={18} /> Search
              </button>
            </div>
          </div>

          {/* Results Info */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <p className="text-gray-500 dark:text-gray-400 text-[15px]">
                Showing <span className="text-emerald-600 dark:text-emerald-500 font-bold">{listings.length}</span> of{" "}
                <span className="text-emerald-600 dark:text-emerald-500 font-bold">{totalListings}</span> products
              </p>
            </div>
            <div className="flex gap-4">
              <select 
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-white dark:bg-gray-900 px-5 py-3 rounded-2xl border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-600 dark:text-gray-300 focus:ring-2 focus:ring-emerald-500 cursor-pointer transition-colors"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="views-desc">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {listings.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl">
              <LayoutGrid className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">No listings found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
              {listings.map((item) => {
                const tag = getTagFromPrice(item.basePrice || item.price || 0);
                return (
                  <div 
                    key={item._id} 
                    onClick={() => handleViewListing(item._id)}
                    className="border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900 cursor-pointer group transition-transform duration-200 hover:-translate-y-1"
                  >
                    
                    {/* Image Area */}
                    <div className="bg-gray-50 dark:bg-gray-800 aspect-square flex items-center justify-center overflow-hidden relative border border-gray-200 dark:border-gray-700">
                      {item.images && item.images.length > 0 ? (
                        <img 
                          src={item.images[0].url} 
                          alt={item.title}
                          className="w-[80%] h-[80%] object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <span className="text-6xl">📦</span>
                      )}
                      
                      {item.originalPrice && (
                        <span className="absolute top-3 left-3 bg-red-100 text-red-600 text-[11px] font-bold px-2.5 py-1 border border-red-200">
                          -{Math.round((1 - (item.basePrice || item.price || 0) / item.originalPrice) * 100)}%
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="py-4">
                      <span className="text-[12px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-1 block">
                        {item.category?.name || item.category || 'Uncategorized'}
                      </span>
                      <h4 className="font-bold text-[15px] mb-1 text-gray-900 dark:text-gray-100 line-clamp-1">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-500">₹{item.basePrice || item.price || 0}</span>
                        {item.originalPrice && (
                          <span className="text-gray-400 dark:text-gray-500 line-through text-sm font-medium">₹{item.originalPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-12">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 font-medium hover:bg-emerald-50 dark:hover:bg-gray-800 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-gray-200 dark:border-gray-800"
              >
                <ChevronLeft size={18} /> Previous
              </button>
              
              <div className="flex gap-2 mx-4">
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  const isCurrent = pageNum === currentPage;
                  const isNear = Math.abs(pageNum - currentPage) <= 2;
                  
                  if (isNear || pageNum === 1 || pageNum === totalPages) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-xl font-bold transition-all ${
                          isCurrent 
                            ? 'bg-emerald-500 text-white border border-emerald-500' 
                            : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-gray-800 hover:text-emerald-600 border border-gray-200 dark:border-gray-800'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  
                  if ((pageNum === 2 && currentPage > 3) || (pageNum === totalPages - 1 && currentPage < totalPages - 2)) {
                    return <span key={pageNum} className="text-gray-400 px-2">...</span>;
                  }
                  
                  return null;
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 font-medium hover:bg-emerald-50 dark:hover:bg-gray-800 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-gray-200 dark:border-gray-800"
              >
                Next <ChevronRight size={18} />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ListingPage;