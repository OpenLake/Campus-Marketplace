// src/components/listings/RequestModal.jsx
import React, { useState } from 'react';
import { X, IndianRupee, MessageCircle } from 'lucide-react';

const RequestModal = ({ isOpen, onClose, listing, onSubmit }) => {
  const [offeredPrice, setOfferedPrice] = useState(listing?.basePrice || 0);
  const [message, setMessage] = useState('');
  const [images, setImages] = useState([]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      listingId: listing._id,
      offeredPrice,
      message,
      buyerImages: images
    });
  };

  return (
    /* Backdrop */
    <div className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Modal card */}
      <div className="bg-white dark:bg-[#121922] border border-gray-200 dark:border-[#232c38] rounded-2xl max-w-md w-full shadow-2xl dark:shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] animate-[fadeIn_0.15s_ease]">
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b border-gray-100 dark:border-[#1e2a36]">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Request Item</h2>
            <p className="text-xs text-gray-400 dark:text-[#5d6b7d] mt-0.5">Submit your offer to the seller</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Listing info pill */}
        <div className="mx-6 mt-4 mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 rounded-xl">
          <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{listing?.title}</p>
          <p className="text-xs text-gray-500 dark:text-[#93a2b3] mt-0.5">Listed at ₹{listing?.basePrice?.toLocaleString()}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {/* Offered Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-[#93a2b3] mb-1.5">
              Your Offer (₹) <span className="text-emerald-600">*</span>
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#5d6b7d]" />
              <input
                type="number"
                value={offeredPrice}
                onChange={(e) => setOfferedPrice(Number(e.target.value))}
                min={1}
                className="pl-9 w-full px-3 py-2.5 bg-white dark:bg-[#0d1218] border border-gray-300 dark:border-[#232c38] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#5d6b7d] focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-sm"
                required
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-[#93a2b3] mb-1.5">
              Message to Seller <span className="text-gray-400 dark:text-[#5d6b7d] font-normal">(optional)</span>
            </label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-[#5d6b7d]" />
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="pl-9 w-full px-3 py-2.5 bg-white dark:bg-[#0d1218] border border-gray-300 dark:border-[#232c38] rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-[#5d6b7d] focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none text-sm"
                placeholder="Tell the seller why you want this item..."
                maxLength={500}
              />
            </div>
            <p className="text-xs text-gray-400 dark:text-[#5d6b7d] mt-1 text-right">{message.length}/500</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-[#232c38] rounded-xl text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-[#10b981] dark:hover:bg-[#20dba0] text-white dark:text-[#04140e] rounded-xl transition-colors text-sm font-bold shadow-[0_4px_12px_-4px_rgba(16,185,129,0.5)]"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestModal;