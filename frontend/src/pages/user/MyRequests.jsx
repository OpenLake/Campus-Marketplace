// src/pages/user/MyRequests.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import orderService from '../../services/orderService';
import { MessageCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import RequestCard from '../../components/listings/RequestCard';

const MyRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await orderService.getMyRequests(1, filter);
      setRequests(response.data.requests || []);
    } catch (error) {
      toast.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (requestId) => {
    if (!window.confirm('Are you sure you want to withdraw your request?')) return;
    
    try {
      await orderService.withdrawRequest(requestId);
      toast.success('Request withdrawn');
      fetchRequests();
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

      {requests.length === 0 ? (
        <div className="panel text-center py-16 flex flex-col items-center justify-center">
          <MessageCircle className="h-12 w-12 text-[#5d6b7d] mb-4" />
          <h3 className="text-lg font-semibold text-gray-200 mb-1">No requests found</h3>
          <p className="text-sm text-gray-505">
            {filter === 'pending' 
              ? "You haven't requested any items yet."
              : `No ${filter} requests found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(request => (
            <RequestCard 
              key={request._id}
              request={request}
              isSeller={false}
              onWithdraw={handleWithdraw}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRequests;