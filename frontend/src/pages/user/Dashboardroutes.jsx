// router/dashboardRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom'; 
import { ChevronRight } from 'lucide-react';
import Dashboard from './Dashboard';
import EditListing from './EditListing';
import Profile from './Profile';
import TransactionHistory from './TransactionHistory';
import AddProduct from './AddProduct';
import MyListings from './Mylistings';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import MyInterests from './MyInterests';
import IncomingInterests from './IncomingInterests';
import './Dashboard.css';

const getPageHeaderInfo = (pathname) => {
  if (pathname.includes('/products/add')) {
    return {
      title: 'Add Product',
      subtitle: 'List a new item on the campus marketplace',
      currentName: 'Add Product'
    };
  }
  if (pathname.includes('/listings/edit')) {
    return {
      title: 'Edit Listing',
      subtitle: 'Modify your listing details and preferences',
      currentName: 'Edit Listing'
    };
  }
  if (pathname.includes('/my-listings')) {
    return {
      title: 'My Products',
      subtitle: 'Manage and track your products listed on campus',
      currentName: 'My Products'
    };
  }
  if (pathname.includes('/profile')) {
    return {
      title: 'My Profile',
      subtitle: 'Manage your account information and preferences',
      currentName: 'Profile'
    };
  }
  if (pathname.includes('/transactions')) {
    return {
      title: 'Transaction History',
      subtitle: 'Track your sales, purchases and listings status',
      currentName: 'Transactions'
    };
  }
  if (pathname.includes('/my-interests')) {
    return {
      title: 'My Interests',
      subtitle: 'Manage and track listings you are interested in',
      currentName: 'My Interests'
    };
  }
  if (pathname.includes('/incoming-interests')) {
    return {
      title: 'Incoming Interests',
      subtitle: 'Manage offers and interests from campus buyers',
      currentName: 'Incoming Interests'
    };
  }
  return {
    title: 'Dashboard Overview',
    subtitle: 'Welcome to your campus store dashboard',
    currentName: 'Overview'
  };
};

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const headerInfo = getPageHeaderInfo(location.pathname);

  return (
    <div className="dashboard-shell pb-20">
      {/* HEADER SECTION */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 mb-8 transition-colors">
        <div className="max-w-[1400px] mx-auto px-4 py-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <Link to="/" className="cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400">Home</Link>
            <ChevronRight size={14} className="text-gray-400" />
            <Link to="/dashboard" className="cursor-pointer hover:text-emerald-600 dark:hover:text-emerald-400">Dashboard</Link>
            {headerInfo.currentName !== 'Overview' && (
              <>
                <ChevronRight size={14} className="text-gray-400" />
                <span className="text-gray-900 dark:text-gray-100 font-medium">{headerInfo.currentName}</span>
              </>
            )}
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">
            {headerInfo.title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{headerInfo.subtitle}</p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 flex flex-col lg:flex-row gap-10">
        <DashboardSidebar />
        <main className="main-content flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
};

const DashboardRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      } />
      
      <Route path="/my-listings" element={
        <DashboardLayout>
          <MyListings />
        </DashboardLayout>
      } />
      
      <Route path="/profile" element={
        <DashboardLayout>
          <Profile />
        </DashboardLayout>
      } />
      
      <Route path="/transactions" element={
        <DashboardLayout>
          <TransactionHistory />
        </DashboardLayout>
      } />
      
      <Route path="/products/add" element={
        <DashboardLayout>
          <AddProduct />
        </DashboardLayout>
      } />
      
      <Route path="/listings/edit/:id" element={
        <DashboardLayout>
          <EditListing />
        </DashboardLayout>
      } />
      <Route path="/my-interests" element={
        <DashboardLayout>
          <MyInterests/>
        </DashboardLayout>
      }/> 
      <Route path="/incoming-interests" element={
        <DashboardLayout>
          <IncomingInterests/>
        </DashboardLayout>
      }/> 
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default DashboardRoutes;