import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import AppLayout from './components/layout/AppLayout';

// Temporary placeholder pages (will be replaced in next phases)
const HomePage = () => (
  <div className="container py-8">
    <h1 className="text-3xl font-bold text-gray-900">Home Page</h1>
    <p className="mt-4 text-gray-600">Welcome to Campus Marketplace!</p>
  </div>
);

const BrowseListings = () => (
  <div className="container py-8">
    <h1 className="text-3xl font-bold text-gray-900">Browse Listings</h1>
    <p className="mt-4 text-gray-600">Listings will appear here.</p>
  </div>
);

const Dashboard = () => (
  <div className="container py-8">
    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
    <p className="mt-4 text-gray-600">Your dashboard statistics.</p>
  </div>
);

const MyListings = () => (
  <div className="container py-8">
    <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
    <p className="mt-4 text-gray-600">Your listings will appear here.</p>
  </div>
);

const Login = () => (
  <div className="container py-8">
    <h1 className="text-3xl font-bold text-gray-900">Login</h1>
    <p className="mt-4 text-gray-600">Login form will be here.</p>
  </div>
);

const Register = () => (
  <div className="container py-8">
    <h1 className="text-3xl font-bold text-gray-900">Register</h1>
    <p className="mt-4 text-gray-600">Registration form will be here.</p>
  </div>
);

function App() {
  // Temporary mock user for testing (will be replaced with AuthContext in Phase 1.3)
  const mockUser = {
    _id: '1',
    name: 'Rahul Raj',
    email: 'rahul@example.com',
    username: 'rahulraj',
    roles: ['superadmin', 'admin', 'moderator'],
    profileImage: null,
  };

  // Mock logout handler
  const handleLogout = () => {
    console.log('Logout clicked');
    alert('Logout functionality will be implemented with AuthContext');
  };

  return (
    <Router>
      <Routes>
        <Route element={<AppLayout user={mockUser} onLogout={handleLogout} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/listings" element={<BrowseListings />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App
