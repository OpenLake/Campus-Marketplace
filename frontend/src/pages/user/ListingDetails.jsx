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
  Mail
} from "lucide-react";
import toast from "react-hot-toast";

import listingService from "../../services/listingService.js";
import { useAuth } from "../../hooks/useAuth.js";
import orderService from "../../services/orderService.jsx";
import InterestModal from "./ExpressInterest.jsx";


const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContact, setShowContact] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [submittingInterest, setSubmittingInterest] = useState(false);
  const [userInterest, setUserInterest] = useState(null); // New state

  useEffect(() => {
    fetchListingDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchListingDetails = async () => {
    try {
      setLoading(true);
      const response = await listingService.getListingById(id);
      console.log("Listing details:", response.data);
      setListing(response.data);
      // Capture user's pending interest if present
      if (response.data.userInterest) {
        setUserInterest(response.data.userInterest);
      } else {
        setUserInterest(null);
      }
    } catch (error) {
      console.error("Error fetching listing:", error);
      toast.error("Failed to load listing details");
      navigate("/listings");
    } finally {
      setLoading(false);
    }
  };

  const handleExpressInterest = async (interestData) => {
    try {
      setSubmittingInterest(true);
      const response = await orderService.expressInterest(interestData);
      toast.success('Interest expressed successfully!');
      setShowInterestModal(false);
      fetchListingDetails(); // refresh to show pending interest
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to express interest');
    } finally {
      setSubmittingInterest(false);
    }
  };

  const handleWithdraw = async (interestId) => {
    if (!window.confirm('Are you sure you want to withdraw your interest?')) return;
    try {
      await orderService.withdrawInterest(interestId);
      toast.success('Interest withdrawn');
      fetchListingDetails(); // refresh
    } catch (error) {
      toast.error(error.message || 'Failed to withdraw interest');
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
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
console.log(listing.seller)
const isOwner = user && listing.seller && (user._id === listing.seller.user_id);
  const statusBadge = getStatusBadge();
  const isAvailable = listing.status === 'active'; 
  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex mb-6 text-sm">
          <Link to="/" className="text-gray-500 hover:text-emerald-600">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to="/listings" className="text-gray-500 hover:text-emerald-600">Listings</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900">{listing.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Main Image */}
              <div className="relative h-96 bg-gray-100">
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
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100"
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
            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {listing.description}
              </p>

              {/* Additional Details */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="h-5 w-5 mr-2" />
                  <span>Listed on {formatDate(listing.createdAt)}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Eye className="h-5 w-5 mr-2" />
                  <span>{listing.views || 0} views</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details & Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
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
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  {listing.category?.name || listing.category || 'Uncategorized'}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-start mb-6 p-3 bg-gray-50 rounded-lg">
                <MapPin className="h-5 w-5 text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-gray-700">
                    {listing.location?.hostel || 'Location not specified'}
                    {listing.location?.roomNumber && `, Room ${listing.location.roomNumber}`}
                  </p>
                  {listing.location?.landmark && (
                    <p className="text-sm text-gray-500 mt-1">{listing.location.landmark}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {!isOwner ? (
                <div className="space-y-3">
                  {/* Pending Interest Card */}
                  {userInterest && userInterest.status === 'pending' && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-orange-800">Your Interest (Pending)</p>
                          <p className="text-sm text-gray-700">Offer: ₹{userInterest.offeredPrice}</p>
                          {userInterest.message && (
                            <p className="text-xs text-gray-600 mt-1">"{userInterest.message}"</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleWithdraw(userInterest._id)}
                          className="text-sm bg-white border border-red-300 text-red-600 px-3 py-1 rounded hover:bg-red-50"
                        >
                          Withdraw
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Express Interest Button (only if no pending interest) */}
                  {!userInterest && isAvailable ? (
                    <button
                      onClick={() => setShowInterestModal(true)}
                      className="w-full py-3 px-4 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition flex items-center justify-center"
                    >
                      <Heart className="h-5 w-5 mr-2" />
                      Express Interest
                    </button>
                  ) : !userInterest && !isAvailable && (
                    <button
                      disabled
                      className="w-full py-3 px-4 bg-gray-300 text-gray-600 font-medium rounded-lg cursor-not-allowed"
                    >
                      {listing.status === 'sold' ? 'Sold' : 'Not Available'}
                    </button>
                  )}

                  {/* Contact Seller */}
                  {!showContact ? (
                    <button
                      onClick={handleContactSeller}
                      className="w-full py-3 px-4 border-2 border-emerald-600 text-emerald-600 font-medium rounded-lg hover:bg-emerald-50 transition flex items-center justify-center"
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Contact Seller
                    </button>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <h3 className="font-medium text-gray-900">Contact Information</h3>
                      <div className="flex items-center text-gray-700">
                        <Phone className="h-4 w-4 mr-2 text-emerald-600" />
                        <a href={`tel:${listing.seller?.phone}`} className="hover:text-emerald-600">
                          {listing.seller?.phone || 'Phone not available'}
                        </a>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <Mail className="h-4 w-4 mr-2 text-emerald-600" />
                        <a href={`mailto:${listing.seller?.email}`} className="hover:text-emerald-600">
                          {listing.seller?.email || 'Email not available'}
                        </a>
                      </div>
                      <button
                        onClick={() => setShowContact(false)}
                        className="text-sm text-gray-500 hover:text-gray-700"
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
                          ? 'border-red-500 text-red-500 hover:bg-red-50'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isInWishlist ? 'fill-current' : ''}`} />
                      {isInWishlist ? 'Saved' : 'Save'}
                    </button>
                    
                    <button
                      onClick={handleShare}
                      className="flex-1 py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-center"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </button>
                    
                    <button
                      onClick={handleReport}
                      className="flex-1 py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center justify-center"
                    >
                      <Flag className="h-4 w-4 mr-2" />
                      Report
                    </button>
                  </div>
                </div>
              ) : (
                // Owner View
                <div className="space-y-3">
                  <Link
                    to={`/listings/edit/${id}`}
                    className="w-full py-3 px-4 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition flex items-center justify-center"
                  >
                    Edit Listing
                  </Link>
                  
                  <Link
                    to="/my-listings"
                    className="w-full py-3 px-4 border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition flex items-center justify-center"
                  >
                    View All My Listings
                  </Link>
                </div>
              )}
            </div>

            {/* Seller Info Card */}
            {listing.seller && (
              <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                <h3 className="font-semibold text-lg mb-4">Seller Information</h3>
                
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden">
                    {listing.seller.avatar ? (
                      <img
                        src={listing.seller.avatar}
                        alt={listing.seller.first_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-semibold text-emerald-600">
                        {listing.seller.first_name?.[0]}{listing.seller.last_name?.[0]}
                      </span>
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">
                      {listing.seller.first_name} {listing.seller.last_name}
                    </p>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span>{listing.seller.rating || 'New'} • </span>
                      <span className="ml-1">{listing.seller.total_listings || 0} listings</span>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <p>Member since {formatDate(listing.seller.joined_date)}</p>
                  {listing.seller.verified && (
                    <p className="flex items-center mt-2 text-green-600">
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
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Items</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {listing.similarListings.map((item) => (
                <Link
                  key={item._id}
                  to={`/listings/${item._id}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
                >
                  <div className="h-40 overflow-hidden">
                    <img
                      src={item.images?.[0]?.url || '/placeholder.jpg'}
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                    <p className="text-emerald-600 font-bold mt-1">
                      ₹{item.basePrice || item.price || 0}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {item.condition?.replace('_', ' ') || 'Unknown'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interest Modal */}
      <InterestModal
        isOpen={showInterestModal}
        onClose={() => setShowInterestModal(false)}
        listing={listing}
        onSubmit={handleExpressInterest}
        isSubmitting={submittingInterest}
      />
    </div>
  );
};

export default ListingDetails;