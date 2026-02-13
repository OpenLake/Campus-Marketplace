import React, { useState } from 'react';
import { 
  Search, 
  ShoppingBag, 
  User, 
  Heart, 
  TrendingUp, 
  ArrowRight,
  Zap,
  MapPin,
  Clock,
  Star,
  Plus
} from 'lucide-react';

const HomePage = ({ onNavigateToListings }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const categories = [
    { id: 'books', name: 'Books', count: 124, icon: '📚', color: 'from-blue-400 to-blue-500' },
    { id: 'cycles', name: 'Cycles', count: 42, icon: '🚲', color: 'from-green-400 to-green-500' },
    { id: 'electronics', name: 'Electronics', count: 89, icon: '💻', color: 'from-purple-400 to-purple-500' },
    { id: 'clothing', name: 'Clothing', count: 65, icon: '👕', color: 'from-pink-400 to-pink-500' },
    { id: 'dorm', name: 'Dorm Essentials', count: 31, icon: '💡', color: 'from-amber-400 to-amber-500' },
  ];

  const trendingItems = [
    { id: 1, title: "Scientific Calculator TI-84", price: 850, originalPrice: 1200, rating: 4.5, img: "🔢", tag: "Study Essentials", seller: "John Doe", views: 42 },
    { id: 2, title: "Campus Hoodie Navy Blue", price: 1200, originalPrice: 1800, rating: 4.2, img: "👕", tag: "Fashion", seller: "Openlake Store", views: 156 },
    { id: 3, title: "Mountain Bike 2023", price: 5500, originalPrice: 7500, rating: 4.8, img: "🚲", tag: "Travel", seller: "Mike Ross", views: 89 },
    { id: 4, title: "Engineering Physics Textbook", price: 240, originalPrice: 800, rating: 4.7, img: "📖", tag: "Books", seller: "Alex P.", views: 231 },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigateToListings();
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans text-[#253D4E] pb-20">
      {/* Hero Banner - Compact */}
      <div className="container mx-auto px-4 py-8">
        <div className="relative rounded-[30px] bg-gradient-to-r from-emerald-400 to-emerald-500 overflow-hidden p-8 lg:p-16">
          <div className="z-10 relative max-w-xl">
            <span className="bg-white/90 backdrop-blur-sm text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block">
              Campus Marketplace
            </span>
            <h2 className="text-4xl lg:text-5xl font-black mb-4 leading-tight text-white">
              Smart Deals for <span className="text-emerald-900">Student Life</span>
            </h2>
            <p className="text-emerald-50/90 text-sm mb-8 max-w-md">
              Buy, sell, and trade textbooks, gear, and essentials with fellow students.
            </p>
            
            {/* Search */}
            <form onSubmit={handleSearch} className="bg-white rounded-xl p-1.5 shadow-lg max-w-md">
              <div className="flex items-center gap-2">
                <Search size={20} className="text-gray-400 ml-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search textbooks, cycles, electronics..."
                  className="flex-1 bg-transparent outline-none text-sm font-medium text-gray-800"
                />
                <button 
                  type="submit"
                  onClick={onNavigateToListings}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Background shapes */}
          <div className="absolute right-[-50px] top-[-50px] w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute right-10 bottom-10 text-8xl opacity-20">🚀</div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Browse Categories</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <div 
              key={cat.id}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group border border-gray-100"
              onClick={onNavigateToListings}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform`}>
                {cat.icon}
              </div>
              <h4 className="font-bold text-gray-800 text-sm mb-1">{cat.name}</h4>
              <p className="text-xs text-gray-500">{cat.count} items</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Items */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-500" />
            <h3 className="text-xl font-bold text-gray-800">Trending Near You</h3>
          </div>
          <button 
            onClick={onNavigateToListings}
            className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors text-sm flex items-center gap-1"
          >
            View All <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {trendingItems.map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-gray-100 group cursor-pointer"
              onClick={onNavigateToListings}
            >
              {/* Image */}
              <div className="relative h-40 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center text-5xl mb-4 group-hover:scale-[1.02] transition-transform">
                {item.img}
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 text-xs font-bold bg-emerald-500 text-white rounded">
                    {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
                  </span>
                </div>
              </div>

              {/* Content */}
              <div>
                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider mb-1 block">
                  {item.tag}
                </span>
                <h4 className="font-bold text-gray-800 text-sm mb-2 line-clamp-2">
                  {item.title}
                </h4>
                
                <div className="flex items-center gap-1 mb-3">
                  <Star size={12} className="fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-medium text-gray-700">{item.rating}</span>
                  <span className="text-xs text-gray-400 mx-2">•</span>
                  <span className="text-xs text-gray-500">{item.views} views</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-bold text-gray-900">₹{item.price}</span>
                      <span className="text-sm text-gray-400 line-through">₹{item.originalPrice}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">by {item.seller}</p>
                  </div>
                  <button className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-500 hover:text-white transition-colors">
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats & CTA */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-2xl p-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-2xl font-black mb-3">Ready to find your campus essentials?</h3>
              <p className="text-emerald-50/90 mb-0">
                Join thousands of students saving money on textbooks, gear, and more.
              </p>
            </div>
            <button 
              onClick={onNavigateToListings}
              className="bg-white text-emerald-600 px-8 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-colors shadow-lg whitespace-nowrap"
            >
              Browse All Listings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;