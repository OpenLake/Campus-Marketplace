// pages/Mylistings.jsx (updated)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Eye, Power, Package, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import listingService from "../../services/listingService";
import { useAuth } from "../../hooks/useAuth";

const MyListings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (user?._id) {
      fetchMyListings();
      fetchStats();
    }
  }, [activeTab, currentPage, user]);

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      
      const response = await listingService.getMyListings(currentPage, activeTab);
      
      // Handle different response structures
      if (response.data?.listings) {
        setListings(response.data.listings);
        setTotalPages(response.data.pagination?.pages || 1);
      } else if (response.listings) {
        setListings(response.listings);
        setTotalPages(response.pagination?.pages || 1);
      } else if (Array.isArray(response)) {
        setListings(response);
        setTotalPages(1);
      } else {
        setListings([]);
        setTotalPages(1);
      }
      
    } catch (error) {
      console.error("Error fetching my listings:", error);
      toast.error(error.message || "Failed to fetch listings");
      setListings([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await listingService.getStats();
      
      // Handle different response structures
      if (response.data) {
        setStats(response.data);
      } else if (response.overview) {
        setStats(response);
      } else {
        // Default stats if none available
        setStats({
          overview: {
            totalListings: 0,
            activeListings: 0,
            soldListings: 0,
            totalViews: 0,
            averagePrice: 0,
            totalRevenue: 0
          },
          categoryBreakdown: []
        });
      }
    } catch (error) {
      console.error("Failed to fetch stats", error);
      // Don't show error toast for stats - it's not critical
    }
  };

  const handleToggleActive = async (listingId, currentStatus) => {
    try {
      const response = await listingService.toggleActive(listingId);
      toast.success(`Listing ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchMyListings(); // Refresh the list
      fetchStats(); // Refresh stats
    } catch (error) {
      toast.error(error.message || "Failed to update listing");
    }
  };

  const handleDelete = async (listingId) => {
    if (!window.confirm("Are you sure you want to delete this listing? This action cannot be undone.")) {
      return;
    }

    try {
      await listingService.deleteListing(listingId);
      toast.success("Listing deleted successfully");
      fetchMyListings();
      fetchStats();
    } catch (error) {
      toast.error(error.message || "Failed to delete listing");
    }
  };

  const handleEdit = (listingId) => {
    navigate(`/dashboard/listings/edit/${listingId}`); // Updated path
  };

  const handleView = (listingId) => {
    navigate(`/listings/${listingId}`);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const tabs = [
    { id: 'active', label: 'Active' },
    { id: 'sold', label: 'Sold' },
    { id: 'inactive', label: 'Inactive' }
  ];

const getStatusBadge = (listing) => {
  switch (listing.status) {
    case 'active':
      return { text: 'Active', color: 'bg-green-100 dark:bg-green-950/40 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-850' };
    case 'sold':
      return { text: 'Sold', color: 'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-405 border border-red-200 dark:border-red-850' };
    case 'pending_completion':
      return { text: 'Pending', color: 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-850 dark:text-yellow-405 border border-yellow-200 dark:border-yellow-850' };
    case 'archived':
      return { text: 'Inactive', color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700' };
    default:
      return { text: 'Unknown', color: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700' };
  }
};

  if (loading && listings.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981]"></div>
      </div>
    );
  }

  return (
    <div className="page animate-[fadeIn_0.2s_ease]">
      {/* Page Actions */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => navigate('/dashboard/products/add')}
          className="btn-brand flex items-center gap-2"
        >
          <Plus size={18} />
          Add Product
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="panel flex items-center gap-4">
            <div className="p-3 bg-[#121922] text-[#10b981] rounded-[10px]">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-150">{stats.overview?.totalListings || 0}</div>
              <div className="text-xs text-gray-500 font-medium">Total Listings</div>
            </div>
          </div>
          
          <div className="panel flex items-center gap-4">
            <div className="p-3 bg-[#121922] text-[#3b82f6] rounded-[10px]">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-150">{stats.overview?.totalViews || 0}</div>
              <div className="text-xs text-gray-500 font-medium">Total Views</div>
            </div>
          </div>
          
          <div className="panel flex items-center gap-4">
            <div className="p-3 bg-[#121922] text-[#10b981] rounded-[10px]">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-150">{stats.overview?.activeListings || 0}</div>
              <div className="text-xs text-gray-500 font-medium">Active</div>
            </div>
          </div>
          
          <div className="panel flex items-center gap-4">
            <div className="p-3 bg-[#121922] text-[#a855f7] rounded-[10px]">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-150">{stats.overview?.soldListings || 0}</div>
              <div className="text-xs text-gray-500 font-medium">Sold</div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-[#232c38] mb-6 flex gap-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setCurrentPage(1);
            }}
            className={`pb-3 px-1 font-semibold text-sm transition-colors relative ${
              activeTab === tab.id
                ? 'text-[#10b981] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#10b981]'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      {listings.length === 0 ? (
        <div className="panel text-center py-16 flex flex-col items-center justify-center">
          <Package className="h-12 w-12 text-[#5d6b7d] mb-4" />
          <h3 className="text-lg font-semibold text-gray-200 mb-1">No listings found</h3>
          <p className="text-sm text-gray-500 mb-6">
            {activeTab === 'active' && "You don't have any active listings yet."}
            {activeTab === 'sold' && "You haven't marked any listings as sold yet."}
            {activeTab === 'inactive' && "You don't have any deactivated listings."}
          </p>
          <button
            onClick={() => navigate('/dashboard/products/add')}
            className="btn-brand flex items-center gap-2"
          >
            <Plus size={18} />
            Create Listing
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => {
              const status = getStatusBadge(listing);
              return (
                <div key={listing._id} className="panel p-0 overflow-hidden flex flex-col border border-[#232c38] hover:border-[#10b981]/40 transition-colors">
                  <div className="relative h-44 bg-[#0d1218] overflow-hidden">
                    <img
                      src={listing.images?.[0]?.url || 'https://via.placeholder.com/300x200?text=No+Image'}
                      alt={listing.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className={`absolute top-3 right-3 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${status.color}`}>
                      {status.text}
                    </div>
                  </div>
                  
                  <div className="p-4 flex flex-col flex-1">
                    <h3 className="font-semibold text-base text-gray-200 mb-1 truncate">{listing.title}</h3>
                    <p className="text-[#10b981] font-bold text-lg mb-2">₹{listing.price || listing.basePrice}</p>
                    
                    <div className="flex items-center text-xs text-gray-500 mb-4">
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      <span>{listing.views || 0} views</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <button
                        onClick={() => handleView(listing._id)}
                        className="btn-surface py-2 text-xs"
                      >
                        View
                      </button>
                      
                      <button
                        onClick={() => handleEdit(listing._id)}
                        className="btn-surface py-2 text-xs hover:border-blue-500/40 hover:text-blue-400"
                      >
                        Edit
                      </button>
                      
                      {!listing.isSold && (
                        <button
                          onClick={() => handleToggleActive(listing._id, listing.isActive)}
                          className={`py-2 text-xs font-semibold rounded-[8px] border transition-colors ${
                            listing.isActive
                              ? 'border-amber-500/20 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                              : 'border-emerald-500/20 bg-emerald-500/10 text-[#10b981] hover:bg-emerald-500/20'
                          }`}
                        >
                          {listing.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(listing._id)}
                        className="py-2 text-xs font-semibold rounded-[8px] border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn-surface p-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <span className="text-sm text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn-surface p-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyListings;