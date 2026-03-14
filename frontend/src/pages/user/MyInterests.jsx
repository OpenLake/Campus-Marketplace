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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Interests</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {['pending', 'accepted', 'rejected', 'withdrawn', 'all'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 capitalize ${
              filter === status
                ? 'border-b-2 border-emerald-600 text-emerald-600 font-medium'
                : 'text-gray-600'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {interests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No interests found</h3>
          <p className="text-gray-600">
            {filter === 'pending' 
              ? "You haven't expressed interest in any items yet"
              : `No ${filter} interests`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {interests.map(interest => (
            <div key={interest._id} className="bg-white rounded-lg shadow p-4">
              <InterestCard 
                interest={interest}
                isSeller={false}
                onWithdraw={handleWithdraw}
              />
              {interest.status === 'pending' && (
                <button
                  onClick={() => handleWithdraw(interest._id)}
                  className="mt-2 text-sm text-red-600 hover:text-red-700"
                >
                  Withdraw Interest
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyInterests;