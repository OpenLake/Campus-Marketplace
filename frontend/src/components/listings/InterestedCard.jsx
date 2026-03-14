// src/components/listings/InterestCard.jsx
import React from 'react';
import { MessageCircle, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
// import { formatDistanceToNow } from 'date-fns';

const InterestCard = ({ interest, onAccept, onReject, isSeller }) => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    withdrawn: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg">{interest.listingId?.title}</h3>
          <p className="text-sm text-gray-600">
            {isSeller ? `Buyer: ${interest.buyerId}` : `Seller: ${interest.sellerId}`}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[interest.status]}`}>
          {interest.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-700">
          <DollarSign className="h-4 w-4 mr-2 text-emerald-600" />
          <span className="font-medium">Offered: ₹{interest.offeredPrice}</span>
        </div>
        
        {interest.message && (
          <div className="flex items-start text-gray-600">
            <MessageCircle className="h-4 w-4 mr-2 mt-1 text-blue-600" />
            <p className="text-sm">{interest.message}</p>
          </div>
        )}

        <div className="flex items-center text-gray-500 text-sm">
          <Clock className="h-4 w-4 mr-2" />
          {/* {formatDistanceToNow(new Date(interest.createdAt), { addSuffix: true })} */}
        </div>
      </div>

      {isSeller && interest.status === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={() => onAccept(interest._id)}
            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Accept
          </button>
          <button
            onClick={() => onReject(interest._id)}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            Reject
          </button>
        </div>
      )}
    </div>
  );
};

export default InterestCard;