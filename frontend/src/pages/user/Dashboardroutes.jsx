// router/dashboardRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { ChevronRight, Menu, X } from 'lucide-react';
import Dashboard from './Dashboard';
import EditListing from './EditListing';
import Profile from './Profile';
import AddProduct from './AddProduct';
import MyListings from './Mylistings';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import MyRequests from './MyRequests';
import IncomingRequests from './IncomingRequests';
import Breadcrumb from '../../components/ui/Breadcrumb.jsx';
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

  if (pathname.includes('/my-requests')) {
    return {
      title: 'My Requests',
      subtitle: 'Manage and track items you requested',
      currentName: 'My Requests'
    };
  }
  if (pathname.includes('/incoming-requests')) {
    return {
      title: 'Incoming Requests',
      subtitle: 'Manage offers and requests from campus buyers',
      currentName: 'Incoming Requests'
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
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="dashboard-shell pb-20">
      {/* HEADER SECTION */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 mb-8 transition-colors">
        <div className="max-w-[1400px] mx-auto px-4 py-8">
          <Breadcrumb items={[
            { label: "Dashboard", link: "/dashboard" },
            ...(headerInfo.currentName !== 'Overview' ? [{ label: headerInfo.currentName }] : [])
          ]} />
          <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">
            {headerInfo.title}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{headerInfo.subtitle}</p>
        </div>
      </div>

      {/* MAIN LAYOUT - F-SHAPED */}
      <div className="max-w-[1400px] mx-auto px-4 flex flex-col gap-6">
        <div className="relative">
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden fixed bottom-6 right-6 z-50 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* one flex row owns both columns */}
          <div className="flex flex-col lg:flex-row lg:items-start gap-6">
            <div className={`dashboard-sidebar-shell ${sidebarOpen ? 'is-open' : ''}`}>
              <DashboardSidebar onClose={() => setSidebarOpen(false)} />
            </div>

            <div className="flex-1 min-w-0">
              {children}
            </div>
          </div>
        </div>
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
      <Route path="/my-requests" element={
        <DashboardLayout>
          <MyRequests />
        </DashboardLayout>
      } />
      <Route path="/incoming-requests" element={
        <DashboardLayout>
          <IncomingRequests />
        </DashboardLayout>
      } />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default DashboardRoutes;
