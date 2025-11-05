import { Link } from "react-router-dom";
import { MapPin, Calendar, Tag } from "lucide-react";
import { cn } from "../../utils/cn";

/**
 * ListingCard Component
 * Displays individual listing preview in a card format
 */
const ListingCard = ({ listing, className }) => {
  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    });
  };

  // Get condition badge color
  const getConditionColor = (condition) => {
    const colors = {
      new: "bg-green-100 text-green-800",
      "like-new": "bg-blue-100 text-blue-800",
      good: "bg-yellow-100 text-yellow-800",
      fair: "bg-orange-100 text-orange-800",
      poor: "bg-red-100 text-red-800",
    };
    return colors[condition] || "bg-gray-100 text-gray-800";
  };

  return (
    <Link
      to={`/listings/${listing._id}`}
      className={cn(
        "group block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-4/3 overflow-hidden bg-gray-100">
        {listing.images && listing.images.length > 0 ? (
          <img
            src={listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Tag className="h-12 w-12" />
          </div>
        )}

        {/* Condition Badge */}
        <div className="absolute top-2 right-2">
          <span
            className={cn(
              "px-2 py-1 rounded-full text-xs font-medium",
              getConditionColor(listing.condition)
            )}
          >
            {listing.condition}
          </span>
        </div>

        {/* Sold Badge */}
        {listing.status === "sold" && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
              SOLD
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
          {listing.title}
        </h3>

        {/* Price */}
        <p className="text-2xl font-bold text-primary-600 mb-3">
          {formatPrice(listing.price)}
        </p>

        {/* Category */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Tag className="h-4 w-4" />
          <span>{listing.category?.name || "Uncategorized"}</span>
        </div>

        {/* Location & Date */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{listing.location || "Campus"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(listing.createdAt)}</span>
          </div>
        </div>

        {/* Seller Info (optional) */}
        {listing.seller && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-semibold">
                {listing.seller.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-600">
                {listing.seller.name}
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ListingCard;
