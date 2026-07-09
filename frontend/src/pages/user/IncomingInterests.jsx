// src/pages/user/IncomingInterests.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import orderService from '../../services/orderService';
 import { Package, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import InterestCard from '../../components/listings/InterestedCard';

const IncomingInterests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [meetupModal, setMeetupModal] = useState({ open: false, interestId: null });

  useEffect(() => {
    fetchInterests();
  }, [filter]);

  const fetchInterests = async () => {
    try {
      setLoading(true);
      const response = await orderService.getIncomingInterests(1, filter);
      setInterests(response.data.interests || []);
    } catch (error) {
      toast.error('Failed to fetch interests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (interestId, meetupDetails = {}) => {
    try {
      const response = await orderService.acceptInterest(interestId, meetupDetails);
      toast.success('Interest accepted! Order created.');
      fetchInterests();
      
      // Navigate to the new order
      if (response.data.order) {
        navigate(`/dashboard/sales/${response.data.order._id}`);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to accept interest');
    }
  };

  const handleReject = async (interestId) => {
    if (!window.confirm('Are you sure you want to reject this interest?')) return;
    
    try {
      await orderService.rejectInterest(interestId);
      toast.success('Interest rejected');
      fetchInterests();
    } catch (error) {
      toast.error(error.message || 'Failed to reject');
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
      <div className="border-b border-[#232c38] mb-6 flex gap-4">
        {['pending', 'accepted', 'rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`pb-3 px-1 font-semibold text-sm transition-colors relative capitalize ${
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
          <Package className="h-12 w-12 text-[#5d6b7d] mb-4" />
          <h3 className="text-lg font-semibold text-gray-200 mb-1">No interests found</h3>
          <p className="text-sm text-gray-505">
            {filter === 'pending' 
              ? "No one has expressed interest in your listings yet."
              : `No ${filter} interests found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {interests.map(interest => (
            <InterestCard
              key={interest._id}
              interest={interest}
              isSeller={true}
              onAccept={() => {
                const location = prompt('Enter meetup location:');
                if (location) {
                  handleAccept(interest._id, { location });
                }
              }}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default IncomingInterests;