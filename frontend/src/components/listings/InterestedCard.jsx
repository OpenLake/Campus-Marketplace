// src/components/listings/InterestCard.jsx
import React from 'react';
import { MessageCircle, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
// import { formatDistanceToNow } from 'date-fns';

const InterestCard = ({ interest, onAccept, onReject, isSeller, onWithdraw }) => {
  const statusColors = {
    pending: 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-900/40',
    accepted: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40',
    rejected: 'bg-red-100 dark:bg-red-950/40 text-red-800 dark:text-red-400 border border-red-250 dark:border-red-900/40',
    withdrawn: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-305 border border-gray-250 dark:border-gray-700'
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-none border border-gray-200 dark:border-gray-800 p-4 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{interest.listingId?.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-450 mt-1">
            {isSeller ? `Buyer ID: ${interest.buyerId}` : `Seller ID: ${interest.sellerId}`}
          </p>
        </div>
        <span className={`px-2.5 py-0.5 rounded-none text-xs font-semibold ${statusColors[interest.status]}`}>
          {interest.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <DollarSign className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-500" />
          <span className="font-semibold text-gray-900 dark:text-gray-100">Offered: ₹{interest.offeredPrice}</span>
        </div>
        
        {interest.message && (
          <div className="flex items-start text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950 p-2 border border-gray-100 dark:border-gray-900">
            <MessageCircle className="h-4 w-4 mr-2 mt-1 text-emerald-600 dark:text-emerald-500 shrink-0" />
            <p className="text-sm">{interest.message}</p>
          </div>
        )}

        <div className="flex items-center text-gray-500 dark:text-gray-450 text-sm">
          <Clock className="h-4 w-4 mr-2" />
          <span>{new Date(interest.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {isSeller && interest.status === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={() => onAccept(interest._id)}
            className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-none hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 font-semibold text-sm"
          >
            <CheckCircle className="h-4 w-4" />
            Accept
          </button>
          <button
            onClick={() => onReject(interest._id)}
            className="flex-1 bg-red-650 text-white px-4 py-2 rounded-none hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-semibold text-sm"
          >
            <XCircle className="h-4 w-4" />
            Reject
          </button>
        </div>
      )}

      {!isSeller && interest.status === 'pending' && onWithdraw && (
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => onWithdraw(interest._id)}
            className="text-sm text-red-650 dark:text-red-405 font-medium hover:underline transition-colors"
          >
            Withdraw Interest
          </button>
        </div>
      )}
    </div>
  );
};

export default InterestCard;