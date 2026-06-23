// components/layout/DashboardSidebar.jsx (fixed)
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  PlusCircle,
  List,
  CreditCard,
  User,
  LogOut,
  MessageCircle,
  Package,
} from "lucide-react";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/dashboard/products/add", icon: PlusCircle, label: "Add Product" },
  { path: "/dashboard/my-listings", icon: List, label: "My Products" },
  { path: "/dashboard/transactions", icon: CreditCard, label: "Transactions" },
  { path: "/dashboard/profile", icon: User, label: "Profile" },
  {
    path: "/dashboard/my-interests",
    icon: MessageCircle,
    label: "My Interests",
  },
  {
    path: "/dashboard/incoming-interests",
    icon: Package,
    label: "Incoming Interests",
  },
];

const DashboardSidebar = () => {
  const location = useLocation();

  // Function to check if a path is active (handles nested routes)
  const isPathActive = (itemPath) => {
    if (itemPath === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(itemPath);
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 min-h-screen p-6 hidden lg:block fixed transition-colors">
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Dashboard</h2>
        <p className="text-xs text-gray-400 dark:text-gray-500">Manage your campus store</p>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = isPathActive(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 py-3 pr-4 rounded-none transition-all ${
                isActive
                  ? "border-l-4 border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-bold pl-3"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 border-transparent pl-3"
              }`}
            >
              <Icon size={20} />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-8 w-44">
        <button className="flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-none w-full">
          <LogOut size={20} />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
