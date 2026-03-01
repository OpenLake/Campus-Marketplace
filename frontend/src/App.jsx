import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

// Auth Pages
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/RegistrationDetails.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import VerifyEmail from "./pages/auth/VerifyEmail.jsx";

// Root Pages
import Home from "./pages/root/Home.jsx";          // Fixed: Home.jsx exists, not HomePage.jsx
import Listings from "./pages/root/Listings.jsx";  // Fixed: Listings.jsx exists

// User Pages
import Cart from "./pages/user/Cart.jsx";                    // Cart.jsx exists
import Checkout from "./pages/user/Checkout.jsx";            // Checkout.jsx exists
import AddProduct from "./pages/user/AddProduct.jsx";        // AddProduct.jsx exists
import TransactionHistory from "./pages/user/TransactionHistory.jsx";  // Exists
import Profile from "./pages/user/Profile.jsx";              // Profile.jsx exists
import Dashboard from "./pages/user/Dashboard.jsx";          // Dashboard.jsx exists
import RegisterDetails from "./pages/auth/RegistrationDetails.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";

// These don't exist in your structure yet - commented out
// import HomePage from "./pages/HomePage.jsx";  // This file doesn't exist
// import ListingPage from "./pages/root/Listings.jsx";  // Duplicate of Listings

// Temporary placeholder pages
const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900">403</h1>
      <p className="mt-2 text-gray-600">
        You don't have permission to access this page.
      </p>
      <button 
        onClick={() => window.history.back()}
        className="mt-4 px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
      >
        Go Back
      </button>
    </div>
  </div>
);

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
    <Router>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <AuthProvider>
                <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />

        <Routes>
          {/* Public Auth Routes - No Layout */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/details" element={<RegisterDetails />} /> 
          
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          
          {/* Routes with AppLayout */}
          <Route element={<AppLayout />}>
            {/* Public Routes - Accessible by everyone */}
            <Route path="/" element={<Home />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/cart" element={<Cart />} />
            
            {/* Protected Routes - Require Authentication */} 
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/products/add" element={<AddProduct />} />
              <Route path="/transactions" element={<TransactionHistory />} />
              <Route path="/profile" element={<Profile />} />
              {/* Cart is already public above - no need to duplicate */}
            </Route>

            {/* Vendor Routes - Require Vendor Role */}
            <Route 
              element={
                <ProtectedRoute 
                  requiredRoles={["vendor_admin", "club_admin", "admin"]}
                />
              }
            >
              {/* Add vendor routes here when ready */}
              {/* <Route path="/vendor/dashboard" element={<VendorDashboard />} /> */}
              {/* <Route path="/vendor/listings" element={<VendorListings />} /> */}
            </Route>

            {/* Admin Routes - Require Admin/Moderator Role */}
            <Route 
              element={
                <ProtectedRoute 
                  requiredRoles={["admin", "moderator"]}
                />
              }
            >
              {/* Add admin routes here when ready */}
              {/* <Route path="/admin/dashboard" element={<AdminDashboard />} /> */}
              {/* <Route path="/admin/users" element={<AdminUsers />} /> */}
            </Route>
          </Route>

          {/* Unauthorized Route */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </AuthProvider>

      </GoogleOAuthProvider>
    </Router>
    </GoogleOAuthProvider>
  );
}

export default App;