// router/dashboardRoutes.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; 
import Dashboard from './Dashboard';
import EditListing from './EditListing';
import Profile from './Profile';
import TransactionHistory from './TransactionHistory';
import AddProduct from './AddProduct';
import MyListings from './Mylistings';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import { MessageCircle } from 'lucide-react';
import MyInterests from './MyInterests';
import IncomingInterests from './IncomingInterests';

const DashboardLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 ml-64 p-8"> {/* Add margin-left to account for fixed sidebar */}
        {children}
      </main>
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