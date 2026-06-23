import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import Header from "./Header.jsx"; 
import Footer from "./Footer.jsx";

const AppLayout = () => {
  const { user, logout, loading } = useAuth();
  const location = useLocation();



  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} onLogout={logout} />

      <div className="flex flex-1"> 

        <main className="flex-1">
          <Outlet />
        </main>
      </div>

      <div className={location.pathname.startsWith('/dashboard') ? 'lg:ml-64' : ''}>
        <Footer />
      </div>
    </div>
  );
};

export default AppLayout;
