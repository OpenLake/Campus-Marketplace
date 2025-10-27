import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { USER_NAVIGATION, ADMIN_NAVIGATION } from '../../constants/navigation';

const Sidebar = ({ user }) => {
  const location = useLocation();
  
  const isAdmin = user?.roles?.includes('admin');
  const isModerator = user?.roles?.includes('moderator');

  // Combine user and admin navigation based on roles
  const navigation = [
    ...USER_NAVIGATION,
    ...(isAdmin || isModerator ? ADMIN_NAVIGATION : []),
  ];

  return (
    <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-4rem)] sticky top-16">
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;