import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  User, 
  Heart, 
  ShoppingCart, 
  RefreshCw, 
  LayoutGrid, 
  Headphones,
  ChevronDown,
  Flame,
  UserPlus,
  LogIn
} from 'lucide-react';

const Header = ({ user, onLogout }) => {
  const isAuthenticated = !!user;

  return (
    <header className="w-full bg-white font-sans">
      {/* 1. Top Utility Bar */}
      <div className="border-b border-gray-100 py-2 hidden lg:block">
        <div className="container mx-auto px-4 flex justify-between items-center text-[12px] text-gray-500">
          <div className="flex gap-4">
            <Link to="/about" className="hover:text-emerald-500">About Us</Link>
            <span className="text-gray-200">|</span>
            <Link to="/account" className="hover:text-emerald-500">My Account</Link>
            <span className="text-gray-200">|</span>
            <Link to="/track" className="hover:text-emerald-500">Order Tracking</Link>
          </div>
          <div className="text-emerald-500 font-medium">
            100% Secure campus delivery without contacting the seller
          </div>
          <div className="flex gap-4">
            <span>Need help? Call Us: <span className="text-emerald-500 font-bold">+1800900122</span></span>
            <span className="text-gray-200">|</span>
            <div className="flex items-center gap-1 cursor-pointer">English <ChevronDown size={12}/></div>
          </div>
        </div>
      </div>

      {/* 2. Middle Row: Logo, Search, Actions */}
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
             <span className="text-white font-bold text-lg italic">O</span>
          </div>
          <div className="leading-none">
            <span className="text-xl font-bold text-emerald-500 block">Openlake</span>
            <span className="text-[9px] tracking-[0.2em] text-gray-400 uppercase font-bold">Campus Market</span>
          </div>
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl items-center border-2 border-emerald-100 rounded-md px-3 py-1.5 gap-3">
          <input 
            type="text" 
            placeholder="Search for items..." 
            className="w-full outline-none text-sm text-gray-600"
          />
          <button className="bg-emerald-500 text-white px-5 py-1.5 rounded-sm text-sm font-bold hover:bg-emerald-600 transition-colors">
            Search
          </button>
        </div>

        {/* Icons Action Row / Auth Options */}
        <div className="flex items-center gap-6 text-gray-600">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <RefreshCw size={22} className="group-hover:text-emerald-500" />
                  <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
                </div>
                <span className="text-xs hidden xl:block">Compare</span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <Heart size={22} className="group-hover:text-emerald-500" />
                  <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
                </div>
                <span className="text-xs hidden xl:block">Wishlist</span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <ShoppingCart size={22} className="group-hover:text-emerald-500" />
                  <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
                </div>
                <span className="text-xs hidden xl:block">Cart</span>
              </div>
              <div className="flex items-center gap-2 cursor-pointer group" onClick={() => {/* Toggle Profile */}}>
                <User size={22} className="group-hover:text-emerald-500" />
                <span className="text-xs hidden xl:block">Account</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-emerald-500 transition-colors">
                <LogIn size={18} className="text-emerald-500" />
                Log In
              </Link>
              <span className="text-gray-300">|</span>
              <Link to="/register" className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-emerald-500 transition-colors">
                <UserPlus size={18} className="text-emerald-500" />
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom Row: Categories and Nav */}
      <div className="border-y border-gray-100 hidden lg:block">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Category Button - Shorter height */}
            <button className="bg-emerald-500 text-white px-5 py-2.5 flex items-center gap-2 rounded-t-md font-bold text-sm">
              <LayoutGrid size={16} />
              Browse Categories
              <ChevronDown size={14} />
            </button>

            {/* Navigation Links */}
            <nav className="flex items-center gap-6">
              <Link className="flex items-center gap-1 font-bold text-gray-700 hover:text-emerald-500 text-sm">
                <Flame size={16} className="text-emerald-500" /> Hot Deals
              </Link>
              <Link className="font-bold text-gray-700 hover:text-emerald-500 text-sm">Home</Link>
              <Link className="font-bold text-gray-700 hover:text-emerald-500 text-sm">About</Link>
              <Link className="font-bold text-gray-700 hover:text-emerald-500 text-sm">Shop</Link>
              <Link className="font-bold text-gray-700 hover:text-emerald-500 text-sm">Vendors</Link>
            </nav>
          </div>

          {/* Support Phone - More compact */}
          <div className="flex items-center gap-2">
            <Headphones size={24} className="text-gray-700" />
            <div>
              <p className="text-emerald-500 font-bold text-md leading-none">1900-888</p>
              <p className="text-[9px] text-gray-400 font-bold text-right uppercase">Support</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;