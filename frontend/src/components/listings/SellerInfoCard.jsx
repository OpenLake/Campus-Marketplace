import { Mail, Phone, MapPin, Star, User } from "lucide-react";

/**
 * SellerInfoCard Component
 * Displays seller information with contact options
 */
const SellerInfoCard = ({ seller, onContact }) => {
  if (!seller) {
    return null;
  }

  const {
    name,
    email,
    phone,
    hostel,
    avatar,
    rating = 0,
    totalRatings = 0,
  } = seller;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Seller Information
      </h3>

      {/* Seller Avatar & Name */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-linera-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            name?.charAt(0).toUpperCase() || <User className="h-8 w-8" />
          )}
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-bold text-gray-900">{name}</h4>
          {rating > 0 && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{rating.toFixed(1)}</span>
              <span>({totalRatings} reviews)</span>
            </div>
          )}
        </div>
      </div>

      {/* Contact Details */}
      <div className="space-y-3 mb-6">
        {email && (
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <Mail className="h-5 w-5 text-gray-400 shrink-0" />
            <a
              href={`mailto:${email}`}
              className="hover:text-blue-600 transition-colors break-all"
            >
              {email}
            </a>
          </div>
        )}

        {phone && (
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <Phone className="h-5 w-5 text-gray-400 shrink-0" />
            <a
              href={`tel:${phone}`}
              className="hover:text-blue-600 transition-colors"
            >
              {phone}
            </a>
          </div>
        )}

        {hostel && (
          <div className="flex items-center gap-3 text-sm text-gray-700">
            <MapPin className="h-5 w-5 text-gray-400 shrink-0" />
            <span>{hostel}</span>
          </div>
        )}
      </div>

      {/* Contact Button */}
      <button
        onClick={onContact}
        className="w-full py-3 px-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
      >
        Contact Seller
      </button>

      {/* Safety Tips */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-xs text-yellow-800 font-medium mb-2">
          💡 Safety Tips:
        </p>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• Meet in public places on campus</li>
          <li>• Check item before payment</li>
          <li>• Don't share sensitive personal details</li>
        </ul>
      </div>
    </div>
  );
};

export default SellerInfoCard;
