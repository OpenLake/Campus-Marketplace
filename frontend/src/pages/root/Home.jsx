import React, { useState } from 'react';
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

const HomePage = () => {
  const navigate = useNavigate();

  const handleItemClick = (itemId) => {
    navigate(`/listings/${itemId}`);
  };

  const trendingProducts = [
    { id: 1, title: "Scientific Calculator TI-84", price: 850, originalPrice: 1200, rating: 4.5, image: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=400", tag: "Study Essentials", seller: "John Doe", views: 42 },
    { id: 2, title: "Campus Hoodie Navy Blue", price: 1200, originalPrice: 1800, rating: 4.2, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400", tag: "Fashion", seller: "Campus Store", views: 156 },
    { id: 3, title: "Mountain Bike 2023", price: 5500, originalPrice: 7500, rating: 4.8, image: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=400", tag: "Travel", seller: "Mike Ross", views: 89 },
    { id: 4, title: "Engineering Physics Textbook", price: 240, originalPrice: 800, rating: 4.7, image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400", tag: "Books", seller: "Alex P.", views: 231 },
  ];

  const latestListings = [
    { id: 5, title: "Desk Lamp with Wireless Charger", price: 250, originalPrice: 400, rating: 4.6, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400" },
    { id: 6, title: "Noise Cancelling Headphones (Used)", price: 1200, originalPrice: 1800, rating: 4.9, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400" },
    { id: 7, title: "Mini Fridge for Dorm", price: 900, originalPrice: 1300, rating: 4.4, image: "https://images.unsplash.com/photo-1581594549595-35f6edc7b762?w=400" },
    { id: 8, title: "Skateboard (Well Used)", price: 400, originalPrice: 750, rating: 4.3, image: "https://images.unsplash.com/photo-1564982752979-3f7bc974d29a?w=400" },
  ];

  const ProductCard = ({ item }) => (
    <div
      onClick={() => handleItemClick(item.id)}
      className="border border-gray-200 dark:border-gray-800 p-4 bg-white dark:bg-gray-900 cursor-pointer group transition-transform duration-200 hover:-translate-y-1"
    >
      <div className="bg-gray-100 dark:bg-gray-800 aspect-square flex items-center justify-center overflow-hidden mb-4 relative border border-gray-200 dark:border-gray-700">
        <img
          src={item.image}
          alt={item.title}
          className="w-[80%] h-[80%] object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-300 group-hover:scale-105"
        />
        {item.originalPrice && (
          <span className="absolute top-3 left-3 bg-red-100 text-red-600 text-[11px] font-bold px-2.5 py-1 border border-red-200">
            -{Math.round((1 - item.price / item.originalPrice) * 100)}%
          </span>
        )}
      </div>
      <div>
        <h4 className="font-bold text-[15px] mb-1 text-gray-900 dark:text-gray-100 line-clamp-1">{item.title}</h4>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-500">₹{item.price}</span>
          <span className="text-gray-400 dark:text-gray-500 line-through text-sm font-medium">₹{item.originalPrice}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-sans transition-colors">

      {/* ===== HERO SECTION ===== */}
      <div className="container mx-auto px-4 pt-10 pb-20">
        <section className="bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center gap-10 overflow-hidden relative">

          <div className="flex-1 z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full text-emerald-600 dark:text-emerald-400 font-bold text-sm mb-6 border border-emerald-100 dark:border-emerald-800">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Over 500+ Students Active
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-[72px] font-black text-[#1F2937] dark:text-gray-100 leading-[1.1] mb-6 tracking-tight">
              Campus Marketplace. <br />
              <span className="text-emerald-600 dark:text-emerald-500">for IIT Bhilai.</span>
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 max-w-lg leading-relaxed font-medium">
              The smartest way to buy and sell textbooks, electronics, and dorm essentials within your college community.
            </p>
            <button
              onClick={() => navigate('/listings')}
              className="inline-block bg-emerald-600 text-white px-14 py-4 font-bold text-[15px] transition-colors hover:bg-emerald-700"
            >
              Shop Now
            </button>
          </div>

          <div className="flex-1 flex justify-center items-center max-w-[620px] relative mt-10 md:mt-0">
            <img
              src="https://github.com/user-attachments/assets/a3d6b8c0-cba9-406e-be10-f36d9e0f8999"
              alt="Campus Marketplace Preview"
              className="w-full max-h-[500px] object-cover rounded-[100px]"
            />
          </div>
        </section>
      </div>

      {/* ===== TRENDING SECTION ===== */}
      <section className="py-20 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-black text-gray-900 dark:text-gray-100 mb-4 tracking-tight uppercase">Trending Now</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium">The most sought-after items on campus this week.</p>
            </div>
            <button
              onClick={() => navigate('/listings')}
              className="font-bold text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              View All Trending &rarr;
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {trendingProducts.map(item => <ProductCard key={item.id} item={item} />)}
          </div>
        </div>
      </section>

      {/* ===== LATEST LISTINGS ===== */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-black text-gray-900 dark:text-gray-100 mb-4 tracking-tight uppercase">Fresh Finds</h2>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Just listed by your peers. Grab them before they're gone!</p>
            </div>
            <button
              onClick={() => navigate('/listings')}
              className="font-bold text-emerald-600 dark:text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              Browse All Items &rarr;
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {latestListings.map(item => <ProductCard key={item.id} item={item} />)}
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <div className="container mx-auto px-4 py-20 border-t border-gray-100 dark:border-gray-800">
        <section className="bg-emerald-600 dark:bg-emerald-800 rounded-3xl p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-xl text-white">
            <h2 className="text-4xl font-black mb-4 uppercase">Never Miss a Deal</h2>
            <p className="text-emerald-50 text-lg font-medium">
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
            <button className="bg-[#111827] text-white py-4 px-8 font-bold text-base hover:bg-black transition-colors whitespace-nowrap">
              Subscribe Now
            </button>
          </div>
        </section>
      </div>

    </div>
  );
};

export default HomePage;