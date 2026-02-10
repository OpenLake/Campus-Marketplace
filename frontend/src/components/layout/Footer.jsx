import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  PhoneCall, 
  Mail, 
  Clock, 
  Facebook, 
  Twitter, 
  Instagram, 
  Github 
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white text-gray-700 font-sans border-t border-gray-100 pt-3">
      <div className="container mx-auto px-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-3">
          
          {/* Column 1: Brand & Contact */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <span className="text-emerald-600 font-bold text-xl">O</span>
              </div>
              <span className="text-2xl font-bold text-emerald-600 tracking-tight">
                Openlake
              </span>
            </div>
            <p className="text-[15px] leading-relaxed text-gray-500">
              The premier campus marketplace for students to buy, sell, and trade safely.
            </p>
            <ul className="space-y-3 text-[14px]">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Address: IIT Bhliai</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Email: support@openlake.com</span>
              </li>
            </ul>
          </div>

          {/* Column 2: Company */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-gray-800">Company</h4>
            <ul className="space-y-3 text-[15px]">
              <li><Link to="/about" className="hover:text-emerald-500 transition-all hover:translate-x-1 inline-block">About Us</Link></li>
              <li><Link to="/listings" className="hover:text-emerald-500 transition-all hover:translate-x-1 inline-block">Browse Listings</Link></li>
              <li><Link to="/privacy" className="hover:text-emerald-500 transition-all hover:translate-x-1 inline-block">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-emerald-500 transition-all hover:translate-x-1 inline-block">Terms & Conditions</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-500 transition-all hover:translate-x-1 inline-block">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 3: Account */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-gray-800">Account</h4>
            <ul className="space-y-3 text-[15px]">
              <li><Link to="/signin" className="hover:text-emerald-500 transition-all hover:translate-x-1 inline-block">Sign In</Link></li>
              <li><Link to="/cart" className="hover:text-emerald-500 transition-all hover:translate-x-1 inline-block">View Cart</Link></li>
              <li><Link to="/wishlist" className="hover:text-emerald-500 transition-all hover:translate-x-1 inline-block">My Wishlist</Link></li>
              <li><Link to="/track" className="hover:text-emerald-500 transition-all hover:translate-x-1 inline-block">Track My Order</Link></li>
              <li><Link to="/compare" className="hover:text-emerald-500 transition-all hover:translate-x-1 inline-block">Compare Products</Link></li>
            </ul>
          </div>

          {/* Column 4: Popular Categories */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-gray-800">Popular</h4>
            <ul className="space-y-3 text-[15px]">
              <li><Link to="/cat/textbooks" className="hover:text-emerald-500 transition-all hover:translate-x-1 inline-block">Textbooks</Link></li>
              <li><Link to="/cat/electronics" className="hover:text-emerald-500 transition-all hover:translate-x-1 inline-block">Electronics</Link></li>
              <li><Link to="/cat/furniture" className="hover:text-emerald-500 transition-all hover:translate-x-1 inline-block">Dorm Furniture</Link></li>
              <li><Link to="/cat/clothing" className="hover:text-emerald-500 transition-all hover:translate-x-1 inline-block">Campus Gear</Link></li>
              <li><Link to="/cat/cycles" className="hover:text-emerald-500 transition-all hover:translate-x-1 inline-block">Bicycles</Link></li>
            </ul>
          </div>
 
           
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 py-2">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="text-sm text-gray-400">
              © {currentYear}, <span className="text-emerald-600 font-semibold">Openlake</span> - Student Marketplace Template
              <br />All rights reserved
            </div>

            <div className="hidden xl:flex items-center gap-8">
             
            </div>

            <div className="flex flex-col items-center lg:items-end gap-2">
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-700">Follow Us</span>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 cursor-pointer transition-colors">
                    <Facebook size={16} />
                  </div>
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 cursor-pointer transition-colors">
                    <Twitter size={16} />
                  </div>
                  <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 cursor-pointer transition-colors">
                    <Instagram size={16} />
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-400">Up to 15% discount on your first trade!</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;