import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Heart, 
  Share2, 
  Flag, 
  MessageCircle, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  DollarSign,
  Star,
  Phone,
  Mail,
  AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

import listingService from "../../services/listingService.js";
import { useAuth } from "../../hooks/useAuth.js";
import orderService from "../../services/orderService.js";
import RequestModal from "./RequestItem.jsx";
import Breadcrumb from "../../components/ui/Breadcrumb.jsx";

const mockProducts = {
  "1": {
    _id: "1",
    title: "Scientific Calculator TI-84",
    description: "Perfect scientific calculator for engineering courses. Lightly used, excellent battery life, all buttons working perfectly.",
    basePrice: 850,
    originalPrice: 1200,
    condition: "good",
    status: "active",
    category: { name: "Study Essentials" },
    createdAt: "2026-07-20T10:00:00Z",
    images: [{ url: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600" }],
    location: { hostel: "Hostel 3", roomNumber: "204", landmark: "Near TV Room" },
    seller: {
      first_name: "John",
      last_name: "Doe",
      email: "john.doe@iitbhilai.ac.in",
      phone: "+91 9876543210",
      rating: 4.5,
      total_listings: 4,
      joined_date: "2024-08-15"
    }
  },
  "2": {
    _id: "2",
    title: "Campus Hoodie Navy Blue",
    description: "Official campus hoodie in navy blue. Extremely comfortable, fits medium to large, no stains or tears.",
    basePrice: 1200,
    originalPrice: 1800,
    condition: "like-new",
    status: "active",
    category: { name: "Fashion" },
    createdAt: "2026-07-21T10:00:00Z",
    images: [{ url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600" }],
    location: { hostel: "Hostel 1", roomNumber: "102", landmark: "Ground floor" },
    seller: {
      first_name: "Campus",
      last_name: "Store",
      email: "store@iitbhilai.ac.in",
      phone: "+91 9999999999",
      rating: 4.2,
      total_listings: 15,
      joined_date: "2023-01-10"
    }
  },
  "3": {
    _id: "3",
    title: "Mountain Bike 2023",
    description: "Sturdy mountain bike ideal for campus commutes. 21-speed gears, front suspension, dual disc brakes. Works flawlessly.",
    basePrice: 5500,
    originalPrice: 7500,
    condition: "good",
    status: "active",
    category: { name: "Travel" },
    createdAt: "2026-07-22T10:00:00Z",
    images: [{ url: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=600" }],
    location: { hostel: "Hostel 2", roomNumber: "Bicycle Stand", landmark: "Near Mess entry" },
    seller: {
      first_name: "Mike",
      last_name: "Ross",
      email: "mike.ross@iitbhilai.ac.in",
      phone: "+91 8888888888",
      rating: 4.8,
      total_listings: 2,
      joined_date: "2025-01-05"
    }
  },
  "4": {
    _id: "4",
    title: "Engineering Physics Textbook",
    description: "Essential textbook for first-year engineering physics course. Includes all chapters, no missing pages, contains some helpful pencil annotations.",
    basePrice: 240,
    originalPrice: 800,
    condition: "fair",
    status: "active",
    category: { name: "Books" },
    createdAt: "2026-07-23T10:00:00Z",
    images: [{ url: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600" }],
    location: { hostel: "Hostel 3", roomNumber: "305", landmark: "Third floor wing A" },
    seller: {
      first_name: "Alex",
      last_name: "P.",
      email: "alex.p@iitbhilai.ac.in",
      phone: "+91 7777777777",
      rating: 4.7,
      total_listings: 8,
      joined_date: "2024-07-22"
    }
  },
  "5": {
    _id: "5",
    title: "Desk Lamp with Wireless Charger",
    description: "Multifunctional desk lamp with 3 color temperatures, dimming options, and a built-in fast wireless charging pad at the base.",
    basePrice: 250,
    originalPrice: 400,
    condition: "like-new",
    status: "active",
    category: { name: "Electronics" },
    createdAt: "2026-07-24T10:00:00Z",
    images: [{ url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600" }],
    location: { hostel: "Hostel 1", roomNumber: "411", landmark: "Near water cooler" },
    seller: {
      first_name: "Dorm",
      last_name: "Life",
      email: "dorm.life@iitbhilai.ac.in",
      phone: "+91 6666666666",
      rating: 4.6,
      total_listings: 12,
      joined_date: "2024-03-12"
    }
  },
  "6": {
    _id: "6",
    title: "Noise Cancelling Headphones (Used)",
    description: "Active noise cancelling headphones. Great sound quality, comfortable over-ear design, battery lasts up to 20 hours on a single charge.",
    basePrice: 1200,
    originalPrice: 1800,
    condition: "good",
    status: "active",
    category: { name: "Electronics" },
    createdAt: "2026-07-25T10:00:00Z",
    images: [{ url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600" }],
    location: { hostel: "Hostel 2", roomNumber: "112", landmark: "Ground floor" },
    seller: {
      first_name: "Sarah",
      last_name: "Connor",
      email: "sarah.connor@iitbhilai.ac.in",
      phone: "+91 5555555555",
      rating: 4.9,
      total_listings: 3,
      joined_date: "2025-02-14"
    }
  },
  "7": {
    _id: "7",
    title: "Mini Fridge for Dorm",
    description: "Compact mini fridge, perfect for keeping drinks and snacks cold in your dorm room. Quiet operation, low energy consumption.",
    basePrice: 900,
    originalPrice: 1300,
    condition: "good",
    status: "active",
    category: { name: "Furniture" },
    createdAt: "2026-07-26T10:00:00Z",
    images: [{ url: "https://images.unsplash.com/photo-1581594549595-35f6edc7b762?w=600" }],
    location: { hostel: "Hostel 3", roomNumber: "109", landmark: "Near main entrance" },
    seller: {
      first_name: "Kevin",
      last_name: "Mitnick",
      email: "kevin.m@iitbhilai.ac.in",
      phone: "+91 4444444444",
      rating: 4.4,
      total_listings: 1,
      joined_date: "2026-01-01"
    }
  },
  "8": {
    _id: "8",
    title: "Skateboard (Well Used)",
    description: "Standard skateboard, shows significant cosmetic wear but rolls perfectly. Wheels and bearings have been recently serviced.",
    basePrice: 400,
    originalPrice: 750,
    condition: "poor",
    status: "active",
    category: { name: "Travel" },
    createdAt: "2026-07-27T10:00:00Z",
    images: [{ url: "https://images.unsplash.com/photo-1564982752979-3f7bc974d29a?w=600" }],
    location: { hostel: "Hostel 1", roomNumber: "208", landmark: "Near common room" },
    seller: {
      first_name: "Tony",
      last_name: "Hawk",
      email: "tony.hawk@iitbhilai.ac.in",
      phone: "+91 3333333333",
      rating: 4.3,
      total_listings: 6,
      joined_date: "2024-09-10"
    }
  }
};

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [userRequest, setUserRequest] = useState(null); // New state

  useEffect(() => {
    fetchListingDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchListingDetails = async () => {
    try {
      setLoading(true);
      if (mockProducts[id]) {
        setListing(mockProducts[id]);
        const localRequest = localStorage.getItem(`mock_request_${id}`);
        setUserRequest(localRequest ? JSON.parse(localRequest) : null);
        return;
      }
      const response = await listingService.getListingById(id);
      setListing(response.data);
      // Capture user's pending request if present
      if (response.data.userRequest) {
        setUserRequest(response.data.userRequest);
      } else {
        setUserRequest(null);
      }
    } catch (error) {
      console.error("Error fetching listing:", error);
      toast.error("Failed to load listing details");
      navigate("/listings");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestItem = async (requestData) => {
    try {
      setSubmittingRequest(true);
      if (mockProducts[id]) {
        const mockRequest = {
          _id: `mock_request_${id}`,
          listingId: id,
          buyerId: currentUserId || 'mock_buyer',
          offeredPrice: requestData.offeredPrice,
          message: requestData.message || "Request for this item",
          status: 'pending'
        };
        localStorage.setItem(`mock_request_${id}`, JSON.stringify(mockRequest));
        setUserRequest(mockRequest);
        toast.success('Request submitted successfully!');
        setShowRequestModal(false);
        return;
      }
      const response = await orderService.requestItem(requestData);
      toast.success('Request submitted successfully!');
      setShowRequestModal(false);
      fetchListingDetails(); // refresh to show pending request
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to request item');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleWithdraw = async (requestId) => {
    if (!window.confirm('Are you sure you want to withdraw your request?')) return;
    try {
      if (mockProducts[id]) {
        localStorage.removeItem(`mock_request_${id}`);
        setUserRequest(null);
        toast.success('Request withdrawn');
        return;
      }
      await orderService.withdrawRequest(requestId);
      toast.success('Request withdrawn');
      fetchListingDetails(); // refresh
    } catch (error) {
      toast.error(error.message || 'Failed to withdraw request');
    }
  };

  const handleContactSeller = () => {
    if (!isAuthenticated) {
      toast.error("Please login to contact seller");
      navigate("/login", { state: { from: `/listings/${id}` } });
      return;
    }
    setShowContact(true);
  };

  const handleAddToWishlist = () => {
    if (!isAuthenticated) {
      toast.error("Please login to add to wishlist");
      navigate("/login", { state: { from: `/listings/${id}` } });
      return;
    }
    setIsInWishlist(!isInWishlist);
    toast.success(isInWishlist ? "Removed from wishlist" : "Added to wishlist");
    // TODO: Implement actual wishlist API call
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: listing.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleReport = () => {
    if (!isAuthenticated) {
      toast.error("Please login to report");
      navigate("/login", { state: { from: `/listings/${id}` } });
      return;
    }
    toast.success("Report submitted. We'll review it shortly.");
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === listing.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? listing.images.length - 1 : prev - 1
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  };

  const getConditionColor = (condition) => {
    const colors = {
      'new': 'bg-green-100 text-green-800',
      'like_new': 'bg-emerald-100 text-emerald-800',
      'good': 'bg-blue-100 text-blue-800',
      'fair': 'bg-yellow-100 text-yellow-800',
    };
    return colors[condition] || 'bg-gray-100 text-gray-800';
  };

  const getConditionLabel = (condition) => {
    const labels = {
      'new': 'New',
      'like_new': 'Like New',
      'good': 'Good',
      'fair': 'Fair',
    };
    return labels[condition] || condition;
  };

  const getStatusBadge = () => {
    switch (listing.status) {
      case 'active':
        return { text: 'Available', color: 'bg-green-100 text-green-800' };
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading listing details...</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing Not Found</h2>
          <p className="text-gray-600 mb-6">The listing you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate("/listings")}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
          >
            Browse Listings
          </button>
        </div>
      </div>
    );
  }
  const currentUserId = user?._id || user?.user_id || user?.id;
  const isOwner = currentUserId && (
    (listing.seller && currentUserId === listing.seller.user_id) || 
    currentUserId === listing.sellerId
  );
  const statusBadge = getStatusBadge();
  const isAvailable = listing.status === 'active'; 

  const breadcrumbItems = [
    { label: "Listings", link: "/listings" },
    { label: listing.title }
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 min-h-screen py-8 transition-colors">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-black/20 overflow-hidden border border-gray-200/50 dark:border-gray-800">
              {/* Main Image */}
              <div className="relative h-96 bg-gray-100 dark:bg-gray-800">
                <img
                  src={listing.images?.[currentImageIndex]?.url || '/placeholder-image.jpg'}
                  alt={listing.title}
                  className="w-full h-full object-contain"
                />
                
                {/* Sold Overlay */}
                {listing.status === 'sold' && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="bg-red-600 text-white text-4xl font-bold px-8 py-4 transform rotate-[-15deg] shadow-xl">
                      SOLD
                    </span>
                  </div>
                )}

                {/* Navigation Arrows */}
                {listing.images?.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-2 rounded-full shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {listing.images?.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {listing.images.length}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {listing.images?.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {listing.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        currentImageIndex === index ? 'border-emerald-600' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description Section */}
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-black/20 p-6 mt-6 border border-gray-200/50 dark:border-gray-800">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Description</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {listing.description}
              </p>

              {/* Additional Details */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Calendar className="h-5 w-5 mr-2 text-emerald-650 dark:text-emerald-500" />
                  <span>Listed on {formatDate(listing.createdAt)}</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Eye className="h-5 w-5 mr-2 text-emerald-650 dark:text-emerald-500" />
                  <span>{listing.views || 0} views</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details & Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-black/20 p-6 sticky top-4 border border-gray-200/50 dark:border-gray-800">
              {/* Title */}
              <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-2">
                {listing.title}
              </h1>

              {/* Price */}
              <div className="flex items-baseline mb-4">
                <span className="text-3xl font-bold text-emerald-600">
                  ₹{listing.basePrice || listing.price || 0}
                </span>
                {listing.isNegotiable && (
                  <span className="ml-2 text-sm text-gray-500">(Negotiable)</span>
                )}
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}>
                  {statusBadge.text}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(listing.condition)}`}>
                  {getConditionLabel(listing.condition)}
                </span>
              </div>

              {/* Location */}
              {(listing.hostel || listing.roomNumber || listing.additionalNotes || listing.location) && (
                <div className="flex items-start mb-6 p-3 bg-gray-50 dark:bg-gray-800/40 border border-gray-200/50 dark:border-gray-800 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-700 dark:text-gray-300">
                      {[listing.hostel, listing.roomNumber ? `Room ${listing.roomNumber}` : null].filter(Boolean).join(', ')
                        || (typeof listing.location === 'string' ? listing.location : null)}
                    </p>
                    {listing.additionalNotes && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{listing.additionalNotes}</p>
                    )}
                  </div>
                </div>
              )}

              {!isOwner ? (
                <div className="space-y-3">
                  {/* Pending Request Card */}
                  {userRequest && userRequest.status === 'pending' && (
                    <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/35 rounded-lg p-4 mb-3 animate-[fadeIn_0.2s_ease]">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-orange-900 dark:text-orange-400 flex items-center gap-1.5 mb-1">
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                            Your Request (Pending)
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">Offer: <strong className="text-orange-950 dark:text-orange-205 font-bold">₹{userRequest.offeredPrice}</strong></p>
                          {userRequest.message && (
                            <p className="text-xs text-gray-650 dark:text-gray-400 mt-1.5 italic">"{userRequest.message}"</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleWithdraw(userRequest._id)}
                          className="text-xs bg-white dark:bg-gray-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 font-semibold transition"
                        >
                          Withdraw
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Accepted Request Card */}
                  {userRequest && userRequest.status === 'accepted' && (
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/35 rounded-xl p-4 mb-3 animate-[fadeIn_0.2s_ease]">
                      <div className="flex flex-col gap-2">
                        <p className="font-bold text-emerald-900 dark:text-emerald-450 flex items-center gap-1.5">
                          <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                          Offer Accepted!
                        </p>
                        <p className="text-sm text-emerald-800 dark:text-emerald-300">
                          Your offer of <strong className="text-emerald-950 dark:text-emerald-200">₹{userRequest.offeredPrice}</strong> has been accepted by the seller.
                        </p>
                        {userRequest.sellerMessage && (
                          <div className="mt-2 p-3 bg-emerald-100/50 dark:bg-emerald-900/30 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                            <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold mb-1">Message from Seller:</p>
                            <p className="text-sm text-emerald-900 dark:text-emerald-200">{userRequest.sellerMessage}</p>
                          </div>
                        )}
                        <Link
                          to="/dashboard/my-requests"
                          className="mt-1 w-full py-2.5 px-4 bg-emerald-650 hover:bg-emerald-700 text-white text-center text-sm font-semibold rounded-lg shadow-sm transition block"
                        >
                          Manage Meetup Details
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* Request Item Button (only if no pending/accepted request) */}
                  {!userRequest && isAvailable ? (
                    <>
                      {!isAuthenticated ? (
                        <button
                          onClick={() => navigate("/login", { state: { from: `/listings/${id}` } })}
                          className="w-full py-3 px-4 bg-emerald-600 dark:bg-[#10b981] text-white dark:text-[#04140e] font-semibold rounded-xl hover:bg-emerald-700 dark:hover:bg-[#20dba0] transition-all shadow-[0_4px_14px_-4px_rgba(16,185,129,0.45)] flex items-center justify-center"
                        >
                          Login to Request Item
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowRequestModal(true)}
                          className="w-full py-3 px-4 bg-emerald-600 dark:bg-[#10b981] text-white dark:text-[#04140e] font-semibold rounded-xl hover:bg-emerald-700 dark:hover:bg-[#20dba0] transition-all shadow-[0_4px_14px_-4px_rgba(16,185,129,0.45)] flex items-center justify-center"
                        >
                          <Heart className="h-5 w-5 mr-2" />
                          Request Item
                        </button>
                      )}
                    </>
                  ) : !userRequest && !isAvailable && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-3 text-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                        {listing.status === 'sold' ? 'Sold: This item is no longer available.' : 'Reserved: Pending meetup completion.'}
                      </p>
                    </div>
                  )}

                  {/* Contact Seller */}
                  {!showContact ? (
                    <button
                      onClick={handleContactSeller}
                      className="w-full py-3 px-4 border-2 border-emerald-600 dark:border-[#10b981] text-emerald-600 dark:text-[#10b981] font-semibold rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all flex items-center justify-center"
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Contact Seller
                    </button>
                  ) : (
                    <div className="p-4 bg-gray-50/50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3 animate-[fadeIn_0.2s_ease]">
                      <h3 className="font-semibold text-gray-950 dark:text-gray-200 text-sm">Contact Information</h3>
                      <div className="flex items-center text-gray-700 dark:text-gray-300 text-sm">
                        <Phone className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-500" />
                        <a href={`tel:${listing.seller?.phone_number || listing.seller?.phone}`} className="hover:text-emerald-650 dark:hover:text-emerald-400 transition font-medium">
                          {listing.seller?.phone_number || listing.seller?.phone || 'Phone not available'}
                        </a>
                      </div>
                      <div className="flex items-center text-gray-700 dark:text-gray-300 text-sm">
                        <Mail className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-500" />
                        <a href={`mailto:${listing.seller?.email}`} className="hover:text-emerald-655 dark:hover:text-emerald-400 transition font-medium">
                          {listing.seller?.email || 'Email not available'}
                        </a>
                      </div>
                      <button
                        onClick={() => setShowContact(false)}
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 underline"
                      >
                        Hide contact
                      </button>
                    </div>
                  )}

                  {/* Secondary Actions */}
                  <div className="flex gap-2 pt-3">
                    <button
                      onClick={handleAddToWishlist}
                      className={`flex-1 py-2 px-3 border rounded-lg transition flex items-center justify-center ${
                        isInWishlist
                          ? 'border-red-500 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20'
                          : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isInWishlist ? 'fill-current' : ''}`} />
                      {isInWishlist ? 'Saved' : 'Save'}
                    </button>
                    
                    <button
                      onClick={handleShare}
                      className="flex-1 py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition flex items-center justify-center"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </button>
                    
                    <button
                      onClick={handleReport}
                      className="flex-1 py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition flex items-center justify-center"
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      Report
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {listing.status === 'pending_completion' && (
                    <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-250 dark:border-amber-900/35 rounded-xl p-4 mb-3 animate-[fadeIn_0.2s_ease]">
                      <p className="font-bold text-amber-900 dark:text-amber-400 flex items-center gap-1.5 mb-1.5">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                        Meetup Pending
                      </p>
                      <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed mb-3">
                        You have accepted an offer. Complete the meetup details to finalize the transaction.
                      </p>
                      <Link
                        to="/dashboard/incoming-requests"
                        className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white text-center text-xs font-semibold rounded-lg block transition"
                      >
                        Manage Meetup / View Offer
                      </Link>
                    </div>
                  )}

                  {listing.status === 'sold' && (
                    <div className="bg-gray-55 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-3 text-center">
                      <p className="font-semibold text-gray-700 dark:text-gray-300 flex items-center justify-center gap-1.5">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        Item Marked as Sold
                      </p>
                    </div>
                  )}

                  {listing.status === 'active' && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/35 rounded-lg p-4 mb-3">
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-400 mb-1.5">
                        This is your listing
                      </p>
                      <Link
                        to="/dashboard/incoming-requests"
                        className="text-xs text-blue-700 dark:text-blue-400 hover:underline font-bold flex items-center justify-between"
                      >
                        <span>Manage incoming requests ({listing.requestCount || 0})</span>
                        <span>→</span>
                      </Link>
                    </div>
                  )}

                  <Link
                    to={`/dashboard/listings/edit/${id}`}
                    className="w-full py-3 px-4 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition flex items-center justify-center"
                  >
                    Edit Listing
                  </Link>
                  
                  <Link
                    to="/dashboard/my-listings"
                    className="w-full py-3 px-4 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center justify-center"
                  >
                    View All My Listings
                  </Link>
                </div>
              )}
            </div>

            {/* Seller Info Card */}
            {listing.seller && (
              <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg dark:shadow-black/20 p-6 mt-6 border border-gray-200/50 dark:border-gray-800">
                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-gray-100">Seller Information</h3>
                
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center overflow-hidden">
                    {listing.seller.avatar ? (
                      <img
                        src={listing.seller.avatar}
                        alt={listing.seller.first_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">
                        {listing.seller.first_name?.[0]}{listing.seller.last_name?.[0]}
                      </span>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {listing.seller.first_name} {listing.seller.last_name}
                    </p>
                    <div className="flex items-center text-sm text-gray-650 dark:text-gray-400">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span>{listing.seller.rating || 'New'} • </span>
                      <span className="ml-1">{listing.seller.total_listings || 0} listings</span>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <p>Member since {formatDate(listing.seller.joined_date)}</p>
                  {listing.seller.verified && (
                    <p className="flex items-center mt-2 text-green-600 dark:text-green-400">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Verified Seller
                    </p>
                  )}
                </div>

                <Link
                  to={`/listings?sellerId=${listing.seller.user_id}`}
                  className="mt-4 text-sm text-emerald-600 hover:text-emerald-700 font-medium inline-block"
                >
                  View all listings by this seller →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Similar Listings */}
        {listing.similarListings?.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-6">Similar Items</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {listing.similarListings.map((item) => (
                <Link
                  key={item._id}
                  to={`/listings/${item._id}`}
                  className="bg-white dark:bg-gray-900 rounded-lg shadow hover:shadow-lg dark:shadow-black/20 border border-gray-200/50 dark:border-gray-800 transition overflow-hidden"
                >
                  <div className="h-40 overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={item.images?.[0]?.url || '/placeholder.jpg'}
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{item.title}</h3>
                    <p className="text-emerald-650 dark:text-emerald-450 font-bold mt-1">
                      ₹{item.basePrice || item.price || 0}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {item.condition?.replace('_', ' ') || 'Unknown'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Request Modal */}
      <RequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        listing={listing}
        onSubmit={handleRequestItem}
        isSubmitting={submittingRequest}
      />
    </div>
  );
};

export default ListingDetails;