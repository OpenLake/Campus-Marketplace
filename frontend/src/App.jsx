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

// Auth Pages
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";
import VerifyEmail from "./pages/auth/VerifyEmail.jsx";

// Temporary placeholder pages
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
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#10B981",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: "#EF4444",
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
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Routes */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/listings" element={<BrowseListings />} />

            {/* Authenticated Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-listings"
              element={
                <ProtectedRoute>
                  <MyListings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />

            {/* Admin Only Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute requiredRoles={["admin", "moderator"]}>
                  <div className="container py-8">
                    <h1 className="text-3xl font-bold">Admin Panel</h1>
                  </div>
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
