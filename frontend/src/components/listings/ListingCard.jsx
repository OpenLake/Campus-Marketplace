import { Link } from "react-router-dom";
import { MapPin, Calendar } from "lucide-react";

/**
 * ListingCard Component
 * Display listing in grid/list view
 */
const ListingCard = ({ listing }) => {
  // Defensive destructuring with defaults
  const {
    _id = "",
    title = "Untitled Listing",
    price = 0,
    images = [],
    condition = "good",
    location = "Location not specified",
    category = "other",
    createdAt = new Date().toISOString(),
    status = "active",
  } = listing || {};

  const conditionColors = {
    "brand-new": "bg-green-100 text-green-800",
    "like-new": "bg-blue-100 text-blue-800",
    good: "bg-yellow-100 text-yellow-800",
    fair: "bg-orange-100 text-orange-800",
    poor: "bg-red-100 text-red-800",
  };

  // Extract image URL safely
  const getImageUrl = () => {
    if (!images || images.length === 0) return "/placeholder-image.jpg";

    const firstImage = images[0];

    // If image is a string, return it
    if (typeof firstImage === "string") return firstImage;

    // If image is an object with url property
    if (firstImage && typeof firstImage === "object" && firstImage.url) {
      return firstImage.url;
    }

    // Fallback
    return "/placeholder-image.jpg";
  };

  // Extract location string safely
  const getLocationString = () => {
    if (!location) return "Location not specified";

    // If location is a string, return it
    if (typeof location === "string") return location;

    // If location is an object
    if (typeof location === "object") {
      const parts = [];
      if (location.hostel) parts.push(location.hostel);
      if (location.pickupPoint) parts.push(location.pickupPoint);
      return parts.length > 0 ? parts.join(", ") : "Location not specified";
    }

    return "Location not specified";
  };

  return (
    <Link to={`/listings/${_id}`} className="block">
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group h-full">
        {/* Image */}
        <div className="relative aspect-4/3 overflow-hidden bg-gray-100">
          <img
            src={getImageUrl()}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.src = "/placeholder-image.jpg";
            }}
          />
          {status === "sold" && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">SOLD</span>
            </div>
          )}
          {status === "reserved" && (
            <div className="absolute inset-0 bg-yellow-500/60 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">RESERVED</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors flex-1">
              {title}
            </h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 ${
                conditionColors[condition] || conditionColors["good"]
              }`}
            >
              {condition
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="line-clamp-1">{getLocationString()}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-blue-600">
              ₹{(price || 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              <span>
                {createdAt ? new Date(createdAt).toLocaleDateString() : "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
