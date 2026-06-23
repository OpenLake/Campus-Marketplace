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
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-none h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-transparent text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">My Interests</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-gray-800">
        {['pending', 'accepted', 'rejected', 'withdrawn', 'all'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 capitalize transition ${
              filter === status
                ? 'border-b-2 border-emerald-600 text-emerald-600 dark:text-emerald-500 font-semibold'
                : 'text-gray-500 dark:text-gray-450 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {interests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-none border border-gray-200 dark:border-gray-800">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">No interests found</h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {filter === 'pending' 
              ? "You haven't expressed interest in any items yet"
              : `No ${filter} interests`}
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