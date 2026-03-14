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
      
      console.log("Fetching with filters:", filters);
      
      const response = await listingService.getAllListings(filters);
      console.log("API Response:", response);
      
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
      console.log("Categories API Response:", response);
      
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
      
      console.log("Formatted categories:", formattedCategories);
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
    <div className="bg-[#f8f9fa] min-h-screen font-sans pb-20">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-6 text-sm flex items-center gap-2">
        <span className="text-emerald-500 font-semibold cursor-pointer hover:underline">Home</span> 
        <ChevronRight size={14} className="text-gray-300" /> 
        <span className="text-gray-500">Campus Marketplace</span>
      </div>

      <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-10">
        
        {/* SIDEBAR FILTERS */}
        <aside className="w-full lg:w-1/4 space-y-8">
          
          <div className="bg-white rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
            <h3 className="text-xl font-bold mb-6 relative">
              Category
              <span className="absolute bottom-[-6px] left-0 w-10 h-1 bg-emerald-100 rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li 
                  key={cat.name} 
                  onClick={() => handleCategoryClick(cat.name)}
                  className={`flex items-center justify-between group cursor-pointer p-2.5 rounded-xl transition-all duration-300 ${
                    selectedCategory === cat.name.toLowerCase() 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'hover:bg-emerald-50'
                  }`}
                >
                  <div className="flex items-center gap-3 text-gray-800 font-medium">
                    <span className={`group-hover:scale-110 transition-transform ${
                      selectedCategory === cat.name.toLowerCase() ? 'text-emerald-600' : 'text-emerald-500'
                    }`}>{cat.icon}</span>
                    <span className={`text-[14px] font-semibold ${
                      selectedCategory === cat.name.toLowerCase() ? 'text-emerald-700' : 'group-hover:text-emerald-600'
                    }`}>{cat.name}</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full">
                    {cat.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
            <h3 className="text-xl font-bold mb-6 relative">
              Filter by Price
              <span className="absolute bottom-[-6px] left-0 w-10 h-1 bg-emerald-100 rounded-full"></span>
            </h3>
            
            <DoubleSlider
              min={0}
              max={10000}
              step={100}
              value={priceRange}
              onChange={setPriceRange}
            />
            
            <div className="flex justify-between items-center mb-6 bg-emerald-50 rounded-xl p-4 mt-6">
              <div className="text-center">
                <label className="block text-xs font-bold text-gray-500 mb-1">Min</label>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold text-gray-800">₹</span>
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setPriceRange([val, priceRange[1]]);
                    }}
                    className="w-20 bg-transparent border-none text-lg font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1"
                    min={0}
                    max={priceRange[1] - 1}
                  />
                </div>
              </div>
              <div className="w-5 h-0.5 bg-gray-300"></div>
              <div className="text-center">
                <label className="block text-xs font-bold text-gray-500 mb-1">Max</label>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold text-gray-800">₹</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setPriceRange([priceRange[0], val]);
                    }}
                    className="w-20 bg-transparent border-none text-lg font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1"
                    min={priceRange[0] + 1}
                    max={10000}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-bold uppercase text-gray-400 tracking-widest">Item Condition</p>
              {['New', 'Like New', 'Good', 'Fair', 'Poor'].map((cond) => (
                <label key={cond} className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-emerald-50">
                  <input 
                    type="checkbox" 
                    checked={selectedConditions.includes(cond.toLowerCase())}
                    onChange={() => handleConditionChange(cond.toLowerCase())}
                    className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500" 
                  />
                  <span className="text-[14px] text-gray-700 font-medium group-hover:text-emerald-600 transition-colors">{cond}</span>
                </label>
              ))}
            </div>
            
            <button 
              onClick={handleApplyFilters}
              className="w-full mt-6 bg-emerald-500 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all"
            >
              <Filter size={18} /> Apply Filters
            </button>
          </div>
        </aside>

        {/* MAIN LISTING CONTENT */}
        <main className="flex-1">
          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm mb-8">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search for books, cycles, electronics, clothing..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-700 font-medium"
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
              <p className="text-gray-500 text-[15px]">
                Showing <span className="text-emerald-600 font-bold">{listings.length}</span> of{" "}
                <span className="text-emerald-600 font-bold">{totalListings}</span> products
              </p>
            </div>
            <div className="flex gap-4">
              <select 
                onChange={(e) => handleSortChange(e.target.value)}
                className="bg-white px-5 py-3 rounded-2xl shadow-sm text-sm font-medium text-gray-600 border-0 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
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
                    className="bg-white rounded-[30px] p-6 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 group relative flex flex-col border border-transparent hover:border-emerald-100 cursor-pointer"
                  >
                    
                    {/* Image Area */}
                    <div className="relative h-56 bg-[#f2f3f4] rounded-2xl flex items-center justify-center text-7xl mb-6 overflow-hidden">
                      {item.images && item.images.length > 0 ? (
                        <img 
                          src={item.images[0].url} 
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <span className="text-6xl">📦</span>
                      )}
                      
                      {/* Absolute UI overlay */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        <span className={`px-4 py-1.5 text-white text-[10px] font-bold rounded-full ${tag.color}`}>
                          {tag.text}
                        </span>
                        <span className={`px-4 py-1.5 ${getConditionColor(item.condition)} text-[10px] font-bold rounded-full`}>
                          {item.condition}
                        </span>
                      </div>

                      {/* Hover Quick Actions */}
                      <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button className="bg-white p-3 rounded-xl text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-md">
                          <Heart size={18} />
                        </button>
                        <button className="bg-white p-3 rounded-xl text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all shadow-md">
                          <Eye size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col">
                      <span className="text-[12px] text-gray-400 font-bold uppercase tracking-widest mb-2">
                        {item.category?.name || item.category || 'Uncategorized'}
                      </span>
                      <h4 className="text-[17px] font-extrabold text-[#253D4E] mb-3 group-hover:text-emerald-500 transition-colors line-clamp-2">
                        {item.title}
                      </h4>
                      
                      <p className="text-sm text-gray-400 mb-6 line-clamp-2">
                        {item.description?.substring(0, 60)}...
                      </p>

                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                        <div>
                          <span className="text-2xl font-black text-emerald-500">
                            ₹{item.basePrice || item.price || 0}
                          </span>
                          {item.isNegotiable && (
                            <span className="text-xs text-gray-400 block">Negotiable</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <Eye size={16} />
                          <span>{item.views || 0}</span>
                        </div>
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
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white text-gray-600 font-medium hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
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
                            ? 'bg-emerald-500 text-white shadow-md' 
                            : 'bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
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
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white text-gray-600 font-medium hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
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