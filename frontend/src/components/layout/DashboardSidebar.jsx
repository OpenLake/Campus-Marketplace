// components/layout/DashboardSidebar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import listingService from "../../services/listingService";
import orderService from "../../services/orderService";

const DashboardSidebar = ({ onClose }) => {
  const location = useLocation();
  const { logout } = useAuth();
  const [counts, setCounts] = useState({
    myProducts: 0,
    myRequests: 0,
    incoming: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [statsRes, myRequestsRes, incomingRes] = await Promise.all([
          listingService.getStats().catch(() => null),
          orderService.getMyRequests(1, 'pending').catch(() => null),
          orderService.getIncomingRequests(1, 'pending').catch(() => null)
        ]);

        setCounts({
          myProducts: statsRes?.overview?.totalListings || 0,
          myRequests: myRequestsRes?.data?.requests?.length || 0,
          incoming: incomingRes?.data?.requests?.length || 0,
        });
      } catch (error) {
        console.error("Error fetching sidebar counts:", error);
      }
    };
    fetchCounts();
  }, [location.pathname]);

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/dashboard/";
    }
    return location.pathname.startsWith(path);
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <aside className="dashboard-sidebar">
      <div className="sidebar-head">
        <div className="t">Dashboard</div>
        <div className="s">Manage your campus store</div>
      </div>

      <nav className="nav-group">
        <Link
          to="/dashboard"
          className={`nav-item ${isActive("/dashboard") && !isActive("/dashboard/products/add") && !isActive("/dashboard/my-listings") && !isActive("/dashboard/profile") && !isActive("/dashboard/my-requests") && !isActive("/dashboard/incoming-requests") ? "active" : ""}`}
          onClick={handleNavClick}
        >
          <svg viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
          </svg>
          Dashboard
        </Link>

        <Link
          to="/dashboard/products/add"
          className={`nav-item ${isActive("/dashboard/products/add") ? "active" : ""}`}
          onClick={handleNavClick}
        >
          <svg viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add Product
        </Link>

        <Link
          to="/dashboard/my-listings"
          className={`nav-item ${isActive("/dashboard/my-listings") ? "active" : ""}`}
          onClick={handleNavClick}
        >
          <svg viewBox="0 0 24 24">
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          My Products {counts.myProducts > 0 && <span className="count">{counts.myProducts}</span>}
        </Link>

        <Link
          to="/dashboard/profile"
          className={`nav-item ${isActive("/dashboard/profile") ? "active" : ""}`}
          onClick={handleNavClick}
        >
          <svg viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Profile
        </Link>

        <div className="nav-label">Engagement</div>

        <Link
          to="/dashboard/my-requests"
          className={`nav-item ${isActive("/dashboard/my-requests") ? "active" : ""}`}
          onClick={handleNavClick}
        >
          <svg viewBox="0 0 24 24">
            <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6z" />
          </svg>
          My Requests {counts.myRequests > 0 && <span className="count">{counts.myRequests}</span>}
        </Link>

        <Link
          to="/dashboard/incoming-requests"
          className={`nav-item ${isActive("/dashboard/incoming-requests") ? "active" : ""}`}
          onClick={handleNavClick}
        >
          <svg viewBox="0 0 24 24">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          Incoming {counts.incoming > 0 && <span className="count">{counts.incoming}</span>}
        </Link>
      </nav>

      <div style={{ marginTop: "auto", padding: "12px", background: "rgba(23,201,143,.06)", borderRadius: "10px", border: "1px solid rgba(23,201,143,.15)" }}>
        <div style={{ fontWeight: 700, fontSize: "12.5px" }}>Become a Vendor</div>
        <div style={{ fontSize: "11px", color: "var(--text-dim)", margin: "4px 0 8px" }}>List in bulk, get a storefront.</div>
        <button style={{ width: "100%", background: "var(--brand)", color: "#04140e", border: "none", padding: "7px", borderRadius: "7px", fontWeight: 700, fontSize: "12px", cursor: "pointer" }}>Apply now</button>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full py-2 px-3 text-gray-500 hover:text-red-400 font-medium text-sm transition-colors cursor-pointer"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default DashboardSidebar;