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
import siteLogo from '../../assets/site_logo.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 font-sans border-t border-gray-100 dark:border-gray-800 pt-3 transition-colors">
      <div className="container mx-auto px-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-3">

          {/* Column 1: Brand & Contact */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <img src={siteLogo} alt="Campus Marketplace Logo" className="w-10 h-10 object-contain" />
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
                Campus Marketplace
              </span>
            </div>
            <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">
              A student-to-student peer marketplace for buying and selling campus essentials at IIT Bhilai.
            </p>
            <ul className="space-y-3 text-[14px]">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Address: IIT Bhilai,Durg</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-500 shrink-0" />
                <span>Email: marketplace@iitbhilai.ac.in</span>
              </li>
            </ul>
          </div>

          {/* Column 2: Platform */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-gray-800 dark:text-gray-200">Platform</h4>
            <ul className="space-y-3 text-[15px]">
              <li><Link to="/" className="hover:text-emerald-500 transition-all hover:translate-x-1 inline-block">Home</Link></li>
              <li><Link to="/listings" className="hover:text-emerald-500 transition-all hover:translate-x-1 inline-block">Browse Listings</Link></li>
              <li><Link to="/listings" className="hover:text-emerald-500 transition-all hover:translate-x-1 inline-block">Safety & Trust Guidelines</Link></li>
            </ul>
          </div>

          {/* Column 3: Student Portal */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-gray-800 dark:text-gray-200">Student Portal</h4>
            <ul className="space-y-3 text-[15px]">
              <li><Link to="/dashboard" className="hover:text-emerald-500 transition-all hover:translate-x-1 inline-block">My Dashboard</Link></li>
              <li><Link to="/dashboard/my-listings" className="hover:text-emerald-500 transition-all hover:translate-x-1 inline-block">My Listings</Link></li>
              <li><Link to="/dashboard/my-requests" className="hover:text-emerald-500 transition-all hover:translate-x-1 inline-block">My Requests</Link></li>
              <li><Link to="/dashboard/products/add" className="hover:text-emerald-500 transition-all hover:translate-x-1 inline-block">List an Item</Link></li>
            </ul>
          </div>


        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-100 dark:border-gray-800 py-2">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
            <div className="text-sm text-gray-400 dark:text-gray-500">
              © {currentYear}, <span className="text-emerald-600 dark:text-emerald-500 font-semibold">Campus Marketplace</span> - IIT Bhilai
              <br />All rights reserved
            </div>

            <div className="hidden xl:flex items-center gap-8">

            </div>


          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;