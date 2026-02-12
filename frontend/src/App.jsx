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
import Register from "./pages/auth/Register.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import VerifyEmail from "./pages/auth/VerifyEmail.jsx";
import ListingPage from "./pages/root/Listings.jsx";
import HomePage from "./pages/root/Home.jsx";

// Temporary placeholder pages
 

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

const Settings = () => (
  <div className="container py-8">
    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
    <p className="mt-4 text-gray-600">Account settings will appear here.</p>
  </div>
);

const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900">403</h1>
      <p className="mt-2 text-gray-600">
        You don't have permission to access this page.
      </p>
    </div>
  </div>
);

function App() {
  return (
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
                primary: "#4ade80",
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
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />

          {/* Protected Routes with Layout */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/listings" element={<ListingPage/>} />

            {/* Protected routes that require authentication */}
            <Route element={<ProtectedRoute />}>
              {/* Add more protected routes here later */}
            </Route>
          </Route>

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </AuthProvider>

      </GoogleOAuthProvider>
    </Router>
  );
}

export default App;
