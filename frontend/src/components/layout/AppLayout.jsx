import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const AppLayout = ({ user, onLogout }) => {
  const location = useLocation();
  
  // Define routes that should show the sidebar
  const sidebarRoutes = [
    '/dashboard',
    '/my-listings',
    '/settings',
    '/profile',
    '/admin'
  ];
  
  const showSidebar = sidebarRoutes.some(route => 
    location.pathname.startsWith(route)
  ) && user;

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} onLogout={onLogout} />
      
      <div className="flex flex-1">
        {showSidebar && <Sidebar user={user} />}
        
        <main className="flex-1 bg-gray-50">
          <Outlet />
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default AppLayout;