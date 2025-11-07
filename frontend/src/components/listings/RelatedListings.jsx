import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import listingService from "../../services/listingService.js";
import ListingCard from "./ListingCard.jsx";

/**
 * RelatedListings Component
 * Shows similar listings based on category
 */
const RelatedListings = ({ currentListingId, category, limit = 4 }) => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedListings = async () => {
      try {
        setLoading(true);
        const response = await listingService.getAllListings({
          category,
          limit: limit + 1, // Fetch one extra to exclude current
          status: "available",
        });

        // Filter out current listing
        const filteredListings = (response.data?.docs || response.data || [])
          .filter((listing) => listing._id !== currentListingId)
          .slice(0, limit);

        setListings(filteredListings);
      } catch (error) {
        console.error("Error fetching related listings:", error);
      } finally {
        setLoading(false);
      }
    };

    if (category && currentListingId) {
      fetchRelatedListings();
    }
  }, [currentListingId, category, limit]);

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Related Listings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-4/3 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (listings.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Related Listings</h2>
        <Link
          to={`/listings?category=${category}`}
          className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
        >
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {listings.map((listing) => (
          <ListingCard key={listing._id} listing={listing} />
        ))}
      </div>
    </div>
  );
};

export default RelatedListings;
