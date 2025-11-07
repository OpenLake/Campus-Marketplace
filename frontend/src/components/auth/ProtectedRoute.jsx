import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";

/**
 * ProtectedRoute Component
 * Wraps routes that require authentication
 * Optionally checks for specific roles
 */
const ProtectedRoute = ({
  children,
  requiredRoles = [],
  requireAuth = true,
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Check if authentication is required
  if (requireAuth && !isAuthenticated) {
    // Redirect to login, save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if specific roles are required
  if (requiredRoles.length > 0 && isAuthenticated) {
    const hasRequiredRole = requiredRoles.some((role) =>
      user?.roles?.includes(role)
    );

    if (!hasRequiredRole) {
      // User doesn't have required role, redirect to unauthorized page
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // User is authenticated and has required roles (if any)
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
