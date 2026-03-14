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
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-6 hidden lg:block fixed">
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-800">Dashboard</h2>
        <p className="text-xs text-gray-400">Manage your campus store</p>
      </div>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = isPathActive(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-emerald-50 text-emerald-600 font-medium shadow-sm border border-emerald-100"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Icon size={20} />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-8 w-44">
        <button className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl w-full">
          <LogOut size={20} />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
