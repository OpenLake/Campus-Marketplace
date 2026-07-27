import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Tag,
  Package,
  AlertCircle,
  DollarSign,
  MessageCircle,
  Heart,
  Users
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth.js";
import listingService from "../../services/listingService.js";
import orderService from "../../services/orderService.js";
import ImageGallery from "../../components/listings/ImageGallery.jsx";
import SellerInfoCard from "../../components/listings/SellerInfoCard.jsx";
import RelatedListings from "../../components/listings/RelatedListings.jsx";
import ShareButtons from "../../components/ui/ShareButton.jsx";
import Breadcrumb from "../../components/ui/Breadcrumb.jsx";
import Button from "../../components/ui/Button.jsx";
import RequestModal from "../../components/listings/RequestModal.jsx";
import toast from "react-hot-toast";

/**
 * ListingDetail Page
 * Complete listing details with actions
 */
const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [requestingItem, setRequestingItem] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [userRequest, setUserRequest] = useState(null);

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listingService.getListingById(id);
      setListing(response.data);
      
      // Check if user has pending request
      if (response.data.userRequest) {
        setUserRequest(response.data.userRequest);
      }
    } catch (err) {
      console.error("Error fetching listing:", err);
      setError(err.response?.data?.message || "Failed to load listing");
      toast.error("Failed to load listing");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestItem = async (requestData) => {
    try {
      setRequestingItem(true);
      const response = await orderService.requestItem(requestData);
      toast.success("Item requested successfully!");
      setShowRequestModal(false);
      setUserRequest(response.data);
      fetchListing(); // Refresh to update request count
    } catch (err) {
      console.error("Error requesting item:", err);
      toast.error(err.response?.data?.message || "Failed to request item");
    } finally {
      setRequestingItem(false);
    }
  };

  const handleWithdrawRequest = async () => {
    if (!userRequest) return;
    
    if (!window.confirm("Are you sure you want to withdraw your request?")) {
      return;
    }

    try {
      await orderService.withdrawRequest(userRequest._id);
      toast.success("Request withdrawn");
      setUserRequest(null);
      fetchListing(); // Refresh to update request count
    } catch (err) {
      console.error("Error withdrawing request:", err);
      toast.error(err.response?.data?.message || "Failed to withdraw request");
    }
  };

  const handleContact = () => {
    if (!user) {
      toast.error("Please login to contact seller");
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }

    // Open email client
    const subject = encodeURIComponent(`Request for: ${listing.title}`);
    const body = encodeURIComponent(
      `Hi ${listing.seller?.first_name},\n\nI would like to request your listing "${listing.title}".\n\n` +
      `Base Price: ₹${listing.basePrice}\n` +
      `Condition: ${listing.condition}\n\n` +
      `Please let me know if it's still available.\n\nThanks!`
    );
    window.location.href = `mailto:${listing.seller?.email}?subject=${subject}&body=${body}`;
  };

  const handleEdit = () => {
    navigate(`/listings/edit/${id}`);
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this listing? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      await listingService.deleteListing(id);
      toast.success("Listing deleted successfully");
      navigate("/dashboard/my-listings");
    } catch (err) {
      console.error("Error deleting listing:", err);
      toast.error(err.response?.data?.message || "Failed to delete listing");
    } finally {
      setDeleting(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="aspect-4/3 bg-gray-200 rounded-xl mb-6"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !listing) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Listing Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            {error ||
              "The listing you are looking for does not exist or has been removed."}
          </p>
          <Link to="/listings">
            <Button>Browse Listings</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentUserId = user?._id || user?.user_id || user?.id;
  const isOwner = currentUserId && (
    (listing.seller && currentUserId === listing.seller.user_id) || 
    currentUserId === listing.sellerId
  );

  const breadcrumbItems = [
    { label: "Listings", link: "/listings" },
    { label: listing.category?.name || listing.category, link: `/listings?category=${listing.category?._id || listing.category}` },
    { label: listing.title },
  ];

  const conditionColors = {
    "new": "bg-green-100 text-green-800",
    "like_new": "bg-blue-100 text-blue-800",
    "good": "bg-yellow-100 text-yellow-800",
    "fair": "bg-orange-100 text-orange-800"
  };

  const getConditionLabel = (condition) => {
    const labels = {
      "new": "New",
      "like_new": "Like New",
      "good": "Good",
      "fair": "Fair"
    };
    return labels[condition] || condition;
  };

  const statusColors = {
    "active": "bg-green-100 text-green-800",
    "pending_completion": "bg-yellow-100 text-yellow-800",
    "sold": "bg-gray-100 text-gray-800",
    "archived": "bg-gray-100 text-gray-800"
  };

  const getStatusLabel = (status) => {
    const labels = {
      "active": "Available",
      "pending_completion": "Pending",
      "sold": "Sold",
      "archived": "Archived"
    };
    return labels[status] || status;
  };

  const canRequestItem = 
    listing.status === "active" && 
    !isOwner && 
    !userRequest;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <ImageGallery images={listing.images} title={listing.title} />

            {/* Listing Info Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              {/* Title & Price */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    {listing.title}
                  </h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        statusColors[listing.status]
                      }`}
                    >
                      {getStatusLabel(listing.status)}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        conditionColors[listing.condition]
                      }`}
                    >
                      {getConditionLabel(listing.condition)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    ₹{listing.basePrice?.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Request Stats */}
              {listing.requestCount > 0 && (
                <div className="flex items-center gap-4 bg-orange-50 p-3 rounded-lg mb-4">
                  <Users className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">
                      {listing.requestCount} request{listing.requestCount === 1 ? '' : 's'} received
                    </p>
                    {listing.highestOffer > 0 && (
                      <p className="text-xs text-orange-600">
                        Highest offer: ₹{listing.highestOffer.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Meta Information */}
              <div className="flex flex-wrap gap-6 py-4 border-y border-gray-200 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Tag className="h-5 w-5 text-gray-400" />
                  <span>{listing.category?.name || listing.category}</span>
                </div>
                {listing.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span>{listing.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span>
                    Listed {new Date(listing.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">
                  Description
                </h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {listing.description}
                </p>
              </div>

              {/* Share Buttons */}
              <div className="pt-6 border-t border-gray-200">
                <ShareButtons listing={listing} />
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Seller Info */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Action Buttons */}
              {!isOwner && (
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Request Item?
                  </h3>
                  
                  {!user ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600">
                        Please login to request this item
                      </p>
                      <Button
                        onClick={() => navigate("/login", { state: { from: window.location.pathname } })}
                        className="w-full"
                      >
                        Login to Request Item
                      </Button>
                    </div>
                  ) : userRequest && userRequest.status === 'pending' ? (
                    <div className="space-y-3">
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 animate-[fadeIn_0.2s_ease]">
                        <p className="text-sm text-orange-900 font-semibold mb-1 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
                          Request Pending
                        </p>
                        <p className="text-xs text-gray-700">
                          Offered Price: ₹{userRequest.offeredPrice.toLocaleString()}
                        </p>
                      </div>
                      <Button
                        onClick={handleWithdrawRequest}
                        variant="outline"
                        className="w-full text-red-650 hover:bg-red-50 border-red-200"
                      >
                        Withdraw Request
                      </Button>
                    </div>
                  ) : userRequest && userRequest.status === 'accepted' ? (
                    <div className="space-y-3">
                      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 animate-[fadeIn_0.2s_ease]">
                        <p className="text-sm text-emerald-950 font-bold mb-1 flex items-center gap-1.5">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          Offer Accepted!
                        </p>
                        <p className="text-xs text-emerald-800">
                          The seller accepted your offer of ₹{userRequest.offeredPrice.toLocaleString()}!
                        </p>
                        {userRequest.sellerMessage && (
                          <div className="mt-2 p-3 bg-emerald-100/50 rounded-lg border border-emerald-200">
                            <p className="text-xs text-emerald-700 font-semibold mb-1">Message from Seller:</p>
                            <p className="text-sm text-emerald-900">{userRequest.sellerMessage}</p>
                          </div>
                        )}
                      </div>
                      <Link
                        to="/dashboard/my-requests"
                        className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-center text-sm font-semibold rounded-lg shadow-sm transition block"
                      >
                        Manage Meetup Details
                      </Link>
                    </div>
                  ) : canRequestItem ? (
                    <>
                      <Button
                        onClick={() => setShowRequestModal(true)}
                        className="w-full mb-3"
                      >
                        <Heart className="h-4 w-4 mr-2" />
                        Request Item
                      </Button>
                      <Button
                        onClick={handleContact}
                        variant="outline"
                        className="w-full"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contact Seller
                      </Button>
                    </>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-500 font-medium">
                        {listing.status === 'sold' ? 'Sold: This item is no longer available.' : 'Reserved: Pending meetup completion.'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Seller Info */}
              <SellerInfoCard
                seller={listing.seller}
                onContact={handleContact}
                listingId={listing._id}
              />

              {/* Owner Actions */}
              {isOwner && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Manage Your Listing
                  </h3>
                  
                  {/* Request Summary for Owner */}
                  {listing.requestCount > 0 && (
                    <div className="mb-4 p-3 bg-white rounded-lg">
                      <Link 
                        to="/dashboard/incoming-requests"
                        className="flex items-center justify-between text-sm text-blue-600 hover:text-blue-700"
                      >
                        <span>View {listing.requestCount} incoming request{listing.requestCount === 1 ? '' : 's'}</span>
                        <Users className="h-4 w-4" />
                      </Link>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleEdit}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                    >
                      <Edit className="h-5 w-5" />
                      Edit
                    </button>
                    <Button
                      onClick={handleDelete}
                      disabled={deleting}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-5 w-5" />
                      {deleting ? "Deleting..." : "Delete"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Listings */}
        <RelatedListings
          currentListingId={listing._id}
          category={listing.category?._id || listing.category}
        />
      </div>

      {/* Request Modal */}
      <RequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        listing={listing}
        onSubmit={handleRequestItem}
        isSubmitting={requestingItem}
      />
    </div>
  );
};

export default ListingDetail;