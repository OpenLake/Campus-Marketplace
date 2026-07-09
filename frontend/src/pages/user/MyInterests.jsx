// src/pages/user/MyInterests.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import orderService from '../../services/orderService';
 import { MessageCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import InterestCard from '../../components/listings/InterestedCard';

const MyInterests = () => {
  const { user } = useAuth();
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchInterests();
  }, [filter]);

  const fetchInterests = async () => {
    try {
      setLoading(true);
      const response = await orderService.getMyInterests(1, filter);
      setInterests(response.data.interests || []);
    } catch (error) {
      toast.error('Failed to fetch interests');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (interestId) => {
    if (!window.confirm('Are you sure you want to withdraw your interest?')) return;
    
    try {
      await orderService.withdrawInterest(interestId);
      toast.success('Interest withdrawn');
      fetchInterests();
    } catch (error) {
      toast.error(error.message || 'Failed to withdraw');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981]"></div>
      </div>
    );
  }

  return (
    <div className="page animate-[fadeIn_0.2s_ease]">


      {/* Filter Tabs */}
      <div className="border-b border-[#232c38] mb-6 flex gap-4 overflow-x-auto pb-1">
        {['pending', 'accepted', 'rejected', 'withdrawn', 'all'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`pb-3 px-1 font-semibold text-sm transition-colors relative whitespace-nowrap capitalize ${
              filter === status
                ? 'text-[#10b981] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#10b981]'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {interests.length === 0 ? (
        <div className="panel text-center py-16 flex flex-col items-center justify-center">
          <MessageCircle className="h-12 w-12 text-[#5d6b7d] mb-4" />
          <h3 className="text-lg font-semibold text-gray-200 mb-1">No interests found</h3>
          <p className="text-sm text-gray-505">
            {filter === 'pending' 
              ? "You haven't expressed interest in any items yet."
              : `No ${filter} interests found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {interests.map(interest => (
            <InterestCard 
              key={interest._id}
              interest={interest}
              isSeller={false}
              onWithdraw={handleWithdraw}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyInterests;