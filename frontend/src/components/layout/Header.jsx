import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  LogIn,
  LogOut,
  LayoutDashboard,
  Package,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsProfileMenuOpen(false);
  };

  // Get first name for welcome message
  const firstName = user?.first_name + ' '+ user?.last_name;

  return (
    <header className="w-full bg-white font-sans sticky top-0 z-50 shadow-sm">
      {/* 1. Top Utility Bar - Simplified */}
      <div className="border-b border-gray-100 py-2 hidden lg:block bg-gray-50">
        <div className="container mx-auto px-4 flex justify-between items-center text-[12px] text-gray-500">
          <div className="flex gap-4">
            <Link to="/about" className="hover:text-emerald-500 transition-colors">About Us</Link>
            <span className="text-gray-200">|</span>
            <Link to="/profile" className="hover:text-emerald-500 transition-colors">My Account</Link>
            <span className="text-gray-200">|</span>
            <Link to="/orders/track" className="hover:text-emerald-500 transition-colors">Order Tracking</Link>
          </div>
          
          {/* Welcome message for authenticated users */}
          {isAuthenticated && (
            <div className="bg-emerald-600 text-white px-4 py-1 rounded-full text-xs font-medium">
              Welcome back, {firstName}!
            </div>
          )}
        </div>
      </div>

      {/* 2. Middle Row: Logo, Search, Actions */}
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4 lg:gap-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center group-hover:bg-emerald-700 transition-colors shadow-md">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          <div className="leading-none">
            <span className="text-xl font-bold text-emerald-600 block">Openlake</span>
            <span className="text-[9px] tracking-[0.2em] text-gray-400 uppercase font-bold">Campus Market</span>
          </div>
        </Link>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl items-center border-2 border-emerald-100 rounded-lg px-3 py-1.5 gap-3 focus-within:border-emerald-400 transition-colors">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search for textbooks, electronics, furniture..." 
            className="w-full outline-none text-sm text-gray-600"
          />
          <button className="bg-emerald-600 text-white px-5 py-1.5 rounded-md text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm">
            Search
          </button>
        </div>

        {/* Icons Action Row / Auth Options */}
        <div className="flex items-center gap-4 lg:gap-6 text-gray-600">
          {isAuthenticated ? (
            <>
              <Link to="/cart" className="flex items-center gap-2 cursor-pointer group">
                <div className="relative">
                  <ShoppingCart size={22} className="group-hover:text-emerald-600 transition-colors" />
                  <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">0</span>
                </div>
                <span className="text-xs hidden xl:block group-hover:text-emerald-600">Cart</span>
              </Link>
              
              {/* Profile Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 cursor-pointer group focus:outline-none"
                >
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="profile" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User size={18} className="text-emerald-600" />
                    )}
                  </div>
                  <span className="text-xs hidden xl:block group-hover:text-emerald-600">
                    {firstName || 'Account'}
                  </span>
                  <ChevronDown size={14} className="group-hover:text-emerald-600 hidden xl:block" />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                    <Link 
                      to="/dashboard" 
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                    <Link 
                      to="/profile" 
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <User size={16} />
                      Profile
                    </Link>
                    <Link 
                      to="/products/add" 
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <Package size={16} />
                      Add Product
                    </Link>
                    <Link 
                      to="/transactions" 
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      <CreditCard size={16} />
                      Transactions
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="flex items-center gap-2 text-sm font-bold text-gray-700 hover:text-emerald-600 transition-colors px-3 py-2 rounded-lg hover:bg-gray-50">
                <LogIn size={18} className="text-emerald-600" />
                Log In
              </Link>
              <Link to="/register" className="flex items-center gap-2 text-sm font-bold bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
                <UserPlus size={18} />
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 3. Bottom Row: Categories and Nav */}
      <div className="border-y border-gray-100 hidden lg:block bg-white">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Category Dropdown */}
            <div className="relative group">
              <button className="bg-emerald-600 text-white px-5 py-2.5 flex items-center gap-2 rounded-t-lg font-bold text-sm hover:bg-emerald-700 transition-colors shadow-sm">
                <LayoutGrid size={16} />
                Browse Categories
                <ChevronDown size={14} />
              </button>
              
              {/* Category Dropdown Menu */}
              <div className="absolute left-0 top-full w-48 bg-white rounded-b-lg shadow-lg border border-gray-100 py-2 hidden group-hover:block z-40">
                <Link to="/listings?category=textbooks" className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600">Textbooks</Link>
                <Link to="/listings?category=electronics" className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600">Electronics</Link>
                <Link to="/listings?category=furniture" className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600">Furniture</Link>
                <Link to="/listings?category=clothing" className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600">Clothing</Link>
                <Link to="/listings?category=bicycles" className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600">Bicycles</Link>
                <Link to="/listings?category=stationery" className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600">Stationery</Link>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center gap-6">
              <Link to="/listings?sort=hot" className="flex items-center gap-1 font-bold text-gray-700 hover:text-emerald-600 text-sm transition-colors">
                <Flame size={16} className="text-orange-500" /> Hot Deals
              </Link>
              <Link to="/" className="font-bold text-gray-700 hover:text-emerald-600 text-sm transition-colors">Home</Link>
              <Link to="/about" className="font-bold text-gray-700 hover:text-emerald-600 text-sm transition-colors">About</Link>
              <Link to="/listings" className="font-bold text-gray-700 hover:text-emerald-600 text-sm transition-colors">Shop</Link>
              <Link to="/vendors" className="font-bold text-gray-700 hover:text-emerald-600 text-sm transition-colors">Vendors</Link>
            </nav>
          </div>

          {/* Support Phone */}
          <Link to="/support" className="flex items-center gap-2 hover:opacity-80 transition-opacity group">
            <div className="bg-emerald-100 p-2 rounded-full group-hover:bg-emerald-200 transition-colors">
              <Headphones size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-emerald-600 font-bold text-md leading-none">1900-888</p>
              <p className="text-[9px] text-gray-400 font-bold text-right uppercase">24/7 Support</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Mobile Search Bar - Visible only on mobile */}
      <div className="md:hidden container mx-auto px-4 pb-3">
        <div className="flex items-center border-2 border-emerald-100 rounded-lg px-3 py-2 gap-2">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search items..." 
            className="w-full outline-none text-sm text-gray-600"
          />
          <button className="bg-emerald-600 text-white px-4 py-1 rounded-md text-sm font-bold">
            Go
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;