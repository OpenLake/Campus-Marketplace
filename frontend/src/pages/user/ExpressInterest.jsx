import React, { useState } from 'react';
import { X, DollarSign, MessageCircle } from 'lucide-react';

const InterestModal = ({ isOpen, onClose, listing, onSubmit, isSubmitting }) => {
  const [offeredPrice, setOfferedPrice] = useState(listing?.basePrice || 0);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      listingId: listing._id,
      offeredPrice,
      message
    });
  };

  return (
    <div className="fixed inset-0 bg-[#000000]/80 flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease]">
      <div className="bg-[#111827] border border-[#1f2937] rounded-[12px] max-w-md w-full p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-gray-200">Express Interest</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#1f2937] text-gray-400 hover:text-gray-200 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-5 p-4 bg-[#030712] border border-[#1f2937]/60 rounded-[8px]">
          <p className="font-semibold text-gray-200 text-sm">{listing?.title}</p>
          <p className="text-xs text-gray-505 mt-1">Base Price: <span className="text-[#10b981] font-semibold">₹{listing?.basePrice}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Your Offer (₹) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={offeredPrice}
                onChange={(e) => setOfferedPrice(Number(e.target.value))}
                min={1}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Message to Seller
            </label>
            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Tell the seller why you're interested..."
                maxLength={500}
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-1 text-right">{message.length}/500 characters</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-surface flex-1 py-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-brand flex-1 py-2"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Interest'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InterestModal;