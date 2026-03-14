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
      console.log(`Fetching ${activeTab} listings, page ${currentPage}...`);
      
      const response = await listingService.getMyListings(currentPage, activeTab);
      console.log("My listings response:", response);
      
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
      console.log("Stats response:", response);
      
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
      return { text: 'Active', color: 'bg-green-100 text-green-800' };
    case 'sold':
      return { text: 'Sold', color: 'bg-red-100 text-red-800' };
    case 'pending_completion':
      return { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' };
    case 'archived':
      return { text: 'Inactive', color: 'bg-gray-100 text-gray-800' };
    default:
      return { text: 'Unknown', color: 'bg-gray-100 text-gray-800' };
  }
};

  if (loading && listings.length === 0) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-600 mt-1">Manage your items for sale</p>
        </div>
        <button
          onClick={() => navigate('/dashboard/products/add')} // Updated path
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition flex items-center gap-2 font-medium shadow-lg shadow-emerald-100"
        >
          <Plus size={20} />
          Add New Listing
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-emerald-100 rounded-lg">
                <Package className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Listings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview?.totalListings || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview?.totalViews || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview?.activeListings || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Sold</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview?.soldListings || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1); // Reset to first page when changing tabs
              }}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
                activeTab === tab.id
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Listings Grid */}
      {listings.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings found</h3>
          <p className="text-gray-600 mb-6">
            {activeTab === 'active' && "You haven't created any active listings yet"}
            {activeTab === 'sold' && "No items sold yet"}
            {activeTab === 'inactive' && "No inactive listings"}
          </p>
          <button
            onClick={() => navigate('/dashboard/products/add')} // Updated path
            className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition inline-flex items-center gap-2"
          >
            <Plus size={20} />
            Create Your First Listing
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => {
              const status = getStatusBadge(listing);
              return (
                <div key={listing._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={listing.images?.[0]?.url || 'https://via.placeholder.com/300x200?text=No+Image'}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                      {status.text}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 truncate">{listing.title}</h3>
                    <p className="text-emerald-600 font-bold text-xl mb-2">₹{listing.price}</p>
                    
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <Eye className="h-4 w-4 mr-1" />
                      <span>{listing.views || 0} views</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleView(listing._id)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
                      >
                        View
                      </button>
                      
                      <button
                        onClick={() => handleEdit(listing._id)}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition"
                      >
                        Edit
                      </button>
                      
                      {!listing.isSold && (
                        <button
                          onClick={() => handleToggleActive(listing._id, listing.isActive)}
                          className={`px-3 py-2 rounded-lg text-sm transition ${
                            listing.isActive
                              ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                          }`}
                        >
                          {listing.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(listing._id)}
                        className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition"
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
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              
              <span className="text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MyListings;