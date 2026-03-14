import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./context/AuthContext.jsx";
import AppLayout from "./components/layout/AppLayout.jsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";

// Auth Pages
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/RegistrationDetails.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import VerifyEmail from "./pages/auth/VerifyEmail.jsx";
import RegisterDetails from "./pages/auth/RegistrationDetails.jsx";

// Root Pages
import Home from "./pages/root/Home.jsx";
import Listings from "./pages/root/Listings.jsx";

// User Pages
import Cart from "./pages/user/Cart.jsx";
import Checkout from "./pages/user/Checkout.jsx";
import AddProduct from "./pages/user/AddProduct.jsx";
import TransactionHistory from "./pages/user/TransactionHistory.jsx";
import Profile from "./pages/user/Profile.jsx";
import Dashboard from "./pages/user/Dashboard.jsx";
import EditListing from "./pages/user/EditListing.jsx";
import ListingDetails from "./pages/user/ListingDetails.jsx";
import MyListings from "./pages/user/Mylistings.jsx";
import DashboardRoutes from "./pages/user/Dashboardroutes.jsx";
import MyInterests from "./pages/user/MyInterests.jsx";
import IncomingInterests from "./pages/user/IncomingInterests.jsx";

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
              <Route path="/listings" element={<Listings />} />
              <Route path="/listings/:id" element={<ListingDetails />} />
              {/* Protected Routes - Require Authentication */}
              <Route element={<ProtectedRoute />}>
                <Route path="/my-listings" element={<MyListings />} />
                <Route path="/listings/edit/:id" element={<EditListing />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/products/add" element={<AddProduct />} />
                <Route path="/dashboard/*" element={<DashboardRoutes />} />
                <Route path="/transactions" element={<TransactionHistory />} />
                <Route path="/profile" element={<Profile />} />
                <Route
                  path="/settings"
                  element={<Navigate to="/profile" replace />}
                />
                <Route path="/my-interests" element={<MyInterests />} />
                <Route
                  path="/incoming-interests"
                  element={<IncomingInterests />}
                />
              </Route>

              {/* Admin Routes - Require Admin/Moderator Role */}
              <Route
                element={
                  <ProtectedRoute requiredRoles={["admin", "moderator"]} />
                }
              >
                <Route
                  path="/admin/*"
                  element={
                    <div className="container py-8">
                      <h1 className="text-3xl font-bold">Admin Panel</h1>
                    </div>
                  }
                />
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
              </Route>
            </Route>

            {/* Unauthorized Route */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
