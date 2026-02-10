import React, { useState } from 'react';
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
  Heart
} from 'lucide-react';
import DoubleSlider from '../../components/ui/DoubleSlider';

const ListingPage = () => {
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const itemsPerPage = 6;

  const categories = [
    { name: 'Books', count: 124, icon: <BookOpen size={18} /> },
    { name: 'Cycles', count: 42, icon: <Bike size={18} /> },
    { name: 'Electronics', count: 89, icon: <Cpu size={18} /> },
    { name: 'Clothing', count: 65, icon: <Shirt size={18} /> },
    { name: 'Dorm Essentials', count: 31, icon: <HomeIcon size={18} /> },
  ];

  const listings = [
    { id: 1, title: "Giant Mountain Bike - 2023 Edition", category: "Cycles", price: 4500, originalPrice: 6000, rating: 4.5, seller: "John Doe", tag: "Hot", img: "🚲", condition: "Used - Good", views: 42 },
    { id: 2, title: "Calculus: Early Transcendentals 9th Ed.", category: "Books", price: 450, originalPrice: 1200, rating: 5.0, seller: "Jane Smith", tag: "New", img: "📚", condition: "Like New", views: 128 },
    { id: 3, title: "TI-84 Plus Graphic Calculator", category: "Electronics", price: 2500, originalPrice: 4500, rating: 4.8, seller: "Mike Ross", tag: "Sale", img: "🔢", condition: "Used", views: 89 },
    { id: 4, title: "Official Campus Hoodie (Navy Blue)", category: "Clothing", price: 599, originalPrice: 899, rating: 4.2, seller: "Openlake Store", tag: "Hot", img: "👕", condition: "New", views: 156 },
    { id: 5, title: "Desk Lamp with Adjustable USB Port", category: "Dorm Essentials", price: 300, originalPrice: 550, rating: 4.0, seller: "Sarah Lee", tag: "New", img: "💡", condition: "Used", views: 67 },
    { id: 6, title: "Engineering Physics Textbook - Semester 1", category: "Books", price: 200, originalPrice: 800, rating: 4.7, seller: "Alex P.", tag: "Best", img: "📖", condition: "Used - Good", views: 231 },
    { id: 7, title: "MacBook Air M1 2020 - 8GB/256GB", category: "Electronics", price: 65000, originalPrice: 85000, rating: 4.9, seller: "Tech Guru", tag: "Hot", img: "💻", condition: "Used - Good", views: 312 },
    { id: 8, title: "Chemistry Lab Coat - Size M", category: "Clothing", price: 350, originalPrice: 600, rating: 4.1, seller: "Science Dept", tag: "Sale", img: "🥼", condition: "Used", views: 45 },
    { id: 9, title: "Portable Study Table", category: "Dorm Essentials", price: 1200, originalPrice: 2000, rating: 4.3, seller: "Furniture Hub", tag: "Best", img: "🪑", condition: "Like New", views: 89 },
  ];

  const filteredListings = listings.filter(item => 
    (item.price >= priceRange[0] && item.price <= priceRange[1]) &&
    (searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.seller.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentListings = filteredListings.slice(startIndex, startIndex + itemsPerPage);

  const handlePriceInputChange = (type, value) => {
    if (type === 'min') {
      const newMin = Math.min(Number(value), priceRange[1] - 1);
      setPriceRange([newMin, priceRange[1]]);
    } else {
      const newMax = Math.max(Number(value), priceRange[0] + 1);
      setPriceRange([priceRange[0], newMax]);
    }
  };

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
                <li key={cat.name} className="flex items-center justify-between group cursor-pointer p-2.5 rounded-xl hover:bg-emerald-50 transition-all duration-300">
                  <div className="flex items-center gap-3 text-gray-800 font-medium">
                    <span className="text-emerald-500 group-hover:scale-110 transition-transform">{cat.icon}</span>
                    <span className="text-[14px] group-hover:text-emerald-600 font-semibold">{cat.name}</span>
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
            
            {/* Imported DoubleSlider component */}
            <DoubleSlider
              min={0}
              max={10000}
              step={100}
              value={priceRange}
              onChange={setPriceRange}
            />
            
            {/* Price Display */}
            <div className="flex justify-between items-center mb-6 bg-emerald-50 rounded-xl p-4 mt-6">
              <div className="text-center">
                <label className="block text-xs font-bold text-gray-500 mb-1">Min</label>
                <div className="flex items-center gap-1">
                  <span className="text-lg font-bold text-gray-800">₹</span>
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => handlePriceInputChange('min', e.target.value)}
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
                    onChange={(e) => handlePriceInputChange('max', e.target.value)}
                    className="w-20 bg-transparent border-none text-lg font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1"
                    min={priceRange[0] + 1}
                    max={10000}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs font-bold uppercase text-gray-400 tracking-widest">Item Condition</p>
              {['Brand New', 'Like New', 'Used'].map((cond) => (
                <label key={cond} className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-emerald-50">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500" />
                  <span className="text-[14px] text-gray-700 font-medium group-hover:text-emerald-600 transition-colors">{cond}</span>
                </label>
              ))}
            </div>
            
            <button className="w-full mt-6 bg-emerald-500 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 shadow-lg shadow-emerald-100 transition-all">
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
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search for books, cycles, electronics, clothing..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-gray-700 font-medium"
                />
              </div>
              <button className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center gap-2">
                <Search size={18} /> Search
              </button>
            </div>
          </div>

          {/* Results Info */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <p className="text-gray-500 text-[15px]">
                Showing <span className="text-emerald-600 font-bold">{filteredListings.length}</span> of{" "}
                <span className="text-emerald-600 font-bold">{listings.length}</span> products
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Price range: ₹{priceRange[0]} - ₹{priceRange[1]}
              </p>
            </div>
            <div className="flex gap-4">
              <div className="bg-white px-5 py-3 rounded-2xl shadow-sm text-sm font-medium text-gray-600 flex items-center gap-2 cursor-pointer">
                Sort by: <span className="text-gray-900 font-bold">Featured</span> <ChevronDown size={14} />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
            {currentListings.map((item) => (
              <div key={item.id} className="bg-white rounded-[30px] p-6 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all duration-500 group relative flex flex-col border border-transparent hover:border-emerald-100">
                
                {/* Image Area */}
                <div className="relative h-56 bg-[#f2f3f4] rounded-2xl flex items-center justify-center text-7xl mb-6 overflow-hidden">
                  <span className="group-hover:scale-125 transition-transform duration-700">{item.img}</span>
                  
                  {/* Absolute UI overlay */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className={`px-4 py-1.5 text-white text-[10px] font-bold rounded-full ${
                      item.tag === 'Hot' ? 'bg-orange-400' : item.tag === 'Sale' ? 'bg-blue-400' : 'bg-emerald-500'
                    }`}>
                      {item.tag}
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
                  <span className="text-[12px] text-gray-400 font-bold uppercase tracking-widest mb-2">{item.category}</span>
                  <h4 className="text-[17px] font-extrabold text-[#253D4E] mb-3 group-hover:text-emerald-500 transition-colors">
                    {item.title}
                  </h4>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={`${i < Math.floor(item.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-gray-400">({item.rating})</span>
                  </div>

                  <p className="text-sm text-gray-400 mb-6">Listed by <span className="text-emerald-500 font-bold">{item.seller}</span></p>

                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-emerald-500 leading-none">₹{item.price}</span>
                      <span className="text-sm text-gray-400 line-through">₹{item.originalPrice}</span>
                    </div>
                    <button className="bg-emerald-50 text-emerald-600 px-6 py-3 rounded-xl flex items-center gap-2 text-[15px] font-bold hover:bg-emerald-500 hover:text-white transition-all">
                      <Plus size={20} /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

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