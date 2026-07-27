import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  User,
  Heart,
  TrendingUp,
  ArrowRight,
  MapPin,
  Clock,
  Star,
  Plus,
  Mail
} from 'lucide-react';
import listingService from '../../services/listingService';
import siteLogo from '../../assets/site_logo.png';

const HomePage = () => {
  const navigate = useNavigate();
  const [recentAddons, setRecentAddons] = useState([]);
  const [loading, setLoading] = useState(true);

  const mockAddons = [
    { id: 1, title: "Scientific Calculator TI-84", price: 850, originalPrice: 1200, rating: 4.5, image: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=400" },
    { id: 2, title: "Campus Hoodie Navy Blue", price: 1200, originalPrice: 1800, rating: 4.2, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400" },
    { id: 3, title: "Mountain Bike 2023", price: 5500, originalPrice: 7500, rating: 4.8, image: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400" },
    { id: 4, title: "Engineering Physics Textbook", price: 240, originalPrice: 800, rating: 4.7, image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400" },
    { id: 5, title: "Desk Lamp with Wireless Charger", price: 250, originalPrice: 400, rating: 4.6, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400" },
    { id: 6, title: "Noise Cancelling Headphones (Used)", price: 1200, originalPrice: 1800, rating: 4.9, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" },
    { id: 7, title: "Mini Fridge for Dorm", price: 900, originalPrice: 1300, rating: 4.4, image: "https://images.unsplash.com/photo-1581594549595-35f6edc7b762?w=400" },
    { id: 8, title: "Skateboard (Well Used)", price: 400, originalPrice: 750, rating: 4.3, image: "https://images.unsplash.com/photo-1564982752979-3f7bc974d29a?w=400" },
  ];

  useEffect(() => {
    const fetchRecentListings = async () => {
      try {
        setLoading(true);
        const response = await listingService.getAllListings({ limit: 8, sortBy: "createdAt", sortOrder: "desc" });
        const listings = response.listings || response.data?.listings || response.data || response;
        if (Array.isArray(listings) && listings.length > 0) {
          setRecentAddons(listings);
        } else {
          setRecentAddons(mockAddons);
        }
      } catch (error) {
        console.error("Failed to fetch recent listings, falling back to mock data", error);
        setRecentAddons(mockAddons);
      } finally {
        setLoading(false);
      }
    };
    fetchRecentListings();
  }, []);

  const handleItemClick = (itemId) => {
    navigate(`/listings/${itemId}`);
  };

  const ProductCard = ({ item }) => (
    <div
      onClick={() => handleItemClick(item.id || item._id)}
      className="border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900 cursor-pointer group transition-transform duration-200 hover:-translate-y-1"
    >
      <div className="bg-gray-100 dark:bg-gray-800 aspect-square flex items-center justify-center overflow-hidden mb-4 relative border border-gray-200 dark:border-gray-700">
        <img
          src={item.image || item.images?.[0]?.url || '/placeholder.jpg'}
          alt={item.title}
          className="w-[85%] h-[85%] object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-300 group-hover:scale-105"
        />
        {item.originalPrice && (
          <span className="absolute top-3 left-3 bg-red-100 text-red-600 text-[11px] font-medium px-2.5 py-1 border border-red-200">
            -{Math.round((1 - (item.price || item.basePrice) / item.originalPrice) * 100)}%
          </span>
        )}
      </div>
      <div>
        <h4 className="font-light text-[15px] mb-1 text-gray-900 dark:text-gray-100 line-clamp-1">{item.title}</h4>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-lg font-light text-emerald-600 dark:text-emerald-500">₹{item.price || item.basePrice}</span>
          {item.originalPrice && (
            <span className="text-gray-400 dark:text-gray-500 line-through text-sm font-light">₹{item.originalPrice}</span>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors" style={{ fontFamily: "'Roboto', sans-serif" }}>

      {/* ===== HERO SECTION ===== */}
      <div className="bg-emerald-50 dark:bg-emerald-950/20 w-full py-16 md:py-24">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-10">

          <div className="flex-1 z-10 max-w-2xl">
            <h1 className="text-5xl md:text-6xl lg:text-[72px] font-light text-[#1F2937] dark:text-gray-100 leading-[1.1] mb-6 tracking-tight">
              Campus Marketplace. <br />
              <span className="text-emerald-600 dark:text-emerald-500 font-light">for IIT Bhilai.</span>
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-lg leading-relaxed font-light">
              Buy and sell college essentials.
            </p>
            <button
              onClick={() => navigate('/listings')}
              className="inline-block bg-emerald-600 text-white px-14 py-4 font-light text-[15px] transition-colors hover:bg-emerald-700"
            >
              Shop Now
            </button>
          </div>

          <div className="flex-1 flex justify-center items-center max-w-[480px] relative">
            <div className="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-950/40 dark:to-emerald-900/10 rounded-full flex items-center justify-center shadow-[0_20px_60px_-15px_rgba(16,185,129,0.2)] border border-emerald-200/50 dark:border-emerald-800/30">
              <img
                src={siteLogo}
                alt="Campus Marketplace"
                className="w-48 h-48 md:w-64 md:h-64 object-contain drop-shadow-[0_8px_20px_rgba(16,185,129,0.2)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ===== RECENT ADDONS SECTION ===== */}
      <section className="py-20 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-light text-gray-900 dark:text-gray-100 mb-4 tracking-tight uppercase">Recent Addons</h2>
              <p className="text-gray-500 dark:text-gray-400 font-light">The latest items listed by your campus peers.</p>
            </div>
            <button
              onClick={() => navigate('/listings')}
              className="font-light text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              Browse All Items &rarr;
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recentAddons.map(item => <ProductCard key={item.id || item._id} item={item} />)}
            </div>
          )}
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <div className="container mx-auto px-4 py-20 border-t border-gray-100 dark:border-gray-800">
        <section className="bg-emerald-600 dark:bg-emerald-800 rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl text-white">
            <h2 className="text-4xl font-light mb-4 uppercase">Never Miss a Deal</h2>
            <p className="text-emerald-50 text-lg font-light">
              Join the student newsletter to get the best deals on textbooks and dorm gear straight to your inbox.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2.5 bg-emerald-700/50 py-4 px-6 focus-within:border-emerald-300 transition-colors">
              <Mail className="text-emerald-200" size={20} />
              <input
                type="email"
                placeholder="Your campus email..."
                className="border-none outline-none text-base w-full bg-transparent text-white placeholder-emerald-200 min-w-[240px]"
              />
            </div>
            <button className="bg-[#111827] text-white py-4 px-8 font-light text-base hover:bg-black transition-colors whitespace-nowrap">
              Subscribe Now
            </button>
          </div>
        </section>
      </div>

    </div>
  );
};

export default HomePage;