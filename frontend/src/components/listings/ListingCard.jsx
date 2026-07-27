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
    basePrice = 0,
    images = [],
    condition = "good",
    location = "",
    hostel = "",
    roomNumber = "",
    additionalNotes = "",
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

  // Extract location string from top-level fields (hostel, roomNumber)
  const getLocationString = () => {
    const parts = [];
    if (hostel) parts.push(hostel);
    if (roomNumber) parts.push(`Room ${roomNumber}`);
    if (parts.length > 0) return parts.join(", ");
    // Fallback: if legacy location string field has a value
    if (location && typeof location === "string" && location.trim()) return location.trim();
    return null;
  };

  return (
    <Link to={`/listings/${_id}`} className="block h-full">
      <div className="rounded-md overflow-hidden cursor-pointer transition-transform duration-200 hover:-translate-y-1 group h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50 flex items-center justify-center rounded-md">
          <img
            src={getImageUrl()}
            alt={title}
            className="w-4/5 h-4/5 object-contain group-hover:scale-105 transition-transform duration-300"
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
        <div className="py-4 px-0 flex flex-col flex-grow">
          <div className="flex items-start justify-between mb-1.5">
            <h3 className="text-[16px] font-bold text-gray-900 line-clamp-1 group-hover:text-black transition-colors flex-1">
              {title}
            </h3>
          </div>

          {getLocationString() && (
            <div className="flex items-center gap-2 text-[13px] text-gray-500 mb-2 mt-auto">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">{getLocationString()}</span>
            </div>
          )}

          <div className="flex items-center gap-2.5 mt-1">
            <div className="text-[20px] font-extrabold text-black">
              ₹{(price || 0).toLocaleString()}
            </div>
            {condition && condition !== "good" && (
              <span className="bg-[#FFDEDE] text-[#FF4136] text-[11px] font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap">
                {condition.replace('-', ' ').toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListingCard;
