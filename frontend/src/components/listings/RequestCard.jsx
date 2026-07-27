// src/components/listings/RequestCard.jsx
import React from 'react';
import { MessageCircle, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
// import { formatDistanceToNow } from 'date-fns';

const RequestCard = ({ request, onAccept, onReject, isSeller, onWithdraw, isAccepting = false }) => {
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
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">{request.listingId?.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-450 mt-1">
            {isSeller ? `Buyer ID: ${request.buyerId}` : `Seller ID: ${request.sellerId}`}
          </p>
        </div>
        <span className={`px-2.5 py-0.5 rounded-none text-xs font-semibold ${statusColors[request.status]}`}>
          {request.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-700 dark:text-gray-300">
          <DollarSign className="h-4 w-4 mr-2 text-emerald-600 dark:text-emerald-500" />
          <span className="font-semibold text-gray-900 dark:text-gray-100">Offered: ₹{request.offeredPrice}</span>
        </div>
        
        {request.message && (
          <div className="flex items-start text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950 p-2 border border-gray-100 dark:border-gray-900">
            <MessageCircle className="h-4 w-4 mr-2 mt-1 text-emerald-600 dark:text-emerald-500 shrink-0" />
            <p className="text-sm">{request.message}</p>
          </div>
        )}

        <div className="flex items-center text-gray-500 dark:text-gray-450 text-sm">
          <Clock className="h-4 w-4 mr-2" />
          <span>{new Date(request.createdAt).toLocaleDateString()}</span>
        </div>

        {request.status === 'accepted' && request.sellerMessage && (
          <div className="mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30">
            <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-400 mb-1">
              {isSeller ? 'Your message to the buyer:' : 'Message from Seller:'}
            </p>
            <p className="text-sm text-emerald-900 dark:text-emerald-300">{request.sellerMessage}</p>
          </div>
        )}
      </div>

      {isSeller && request.status === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={() => onAccept(request._id)}
            disabled={isAccepting}
            className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-none hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-semibold text-sm"
          >
            {isAccepting ? (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            {isAccepting ? 'Accepting...' : 'Accept'}
          </button>
          <button
            onClick={() => onReject(request._id)}
            className="flex-1 bg-red-650 text-white px-4 py-2 rounded-none hover:bg-red-700 transition-colors flex items-center justify-center gap-2 font-semibold text-sm"
          >
            <XCircle className="h-4 w-4" />
            Reject
          </button>
        </div>
      )}

      {!isSeller && request.status === 'pending' && onWithdraw && (
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
          <button
            onClick={() => onWithdraw(request._id)}
            className="text-sm text-red-650 dark:text-red-405 font-medium hover:underline transition-colors"
          >
            Withdraw Request
          </button>
        </div>
      )}
    </div>
  );
};

export default RequestCard;