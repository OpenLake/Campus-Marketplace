import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import Header from "./Header.jsx"; 
import Footer from "./Footer.jsx";

const AppLayout = () => {
  const { user, logout, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  } 

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} onLogout={logout} />

      <div className="flex flex-1"> 

        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default AppLayout;
